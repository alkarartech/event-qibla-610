import { useState, useEffect, useCallback } from 'react';
import { events, Event } from '@/mocks/events';
import { calculateDistance } from '@/utils/location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

interface EventsState {
  allEvents: Event[];
  nearbyEvents: Event[];
  savedEvents: Event[];
  loading: boolean;
  error: string | null;
}

interface EventRating {
  eventId: string;
  rating: number;
  feedback: string;
  date: string;
}

interface EventNotification {
  eventId: string;
  notificationIds: string[];
}

export default function useEvents(
  latitude?: number,
  longitude?: number,
  radius: number = 10
) {
  const [state, setState] = useState<EventsState>({
    allEvents: events,
    nearbyEvents: [],
    savedEvents: [],
    loading: true,
    error: null,
  });
  
  const [eventRatings, setEventRatings] = useState<EventRating[]>([]);
  const [eventNotifications, setEventNotifications] = useState<EventNotification[]>([]);

  // Load saved events on mount
  useEffect(() => {
    loadSavedEvents();
    loadEventRatings();
    loadEventNotifications();
    
    // Set up notification handler
    if (Platform.OS !== 'web') {
      setupNotifications();
    }
  }, []);
  
  // Setup notifications
  const setupNotifications = async () => {
    // Request permissions
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permissions not granted');
      return;
    }
    
    // Set notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  };

  // Load saved events from AsyncStorage
  const loadSavedEvents = useCallback(async () => {
    try {
      const savedEventIds = await AsyncStorage.getItem('savedEvents');
      if (savedEventIds) {
        const ids = JSON.parse(savedEventIds) as string[];
        const savedEvents = events.filter(event => ids.includes(event.id));
        
        setState(prev => ({
          ...prev,
          savedEvents,
        }));
      }
      return true;
    } catch (error) {
      console.error('Error loading saved events:', error);
      return false;
    }
  }, []);
  
  // Load event ratings from AsyncStorage
  const loadEventRatings = async () => {
    try {
      const ratingsData = await AsyncStorage.getItem('eventRatings');
      if (ratingsData) {
        setEventRatings(JSON.parse(ratingsData));
      }
    } catch (error) {
      console.error('Error loading event ratings:', error);
    }
  };
  
  // Load event notifications from AsyncStorage
  const loadEventNotifications = async () => {
    try {
      const notificationsData = await AsyncStorage.getItem('eventNotifications');
      if (notificationsData) {
        setEventNotifications(JSON.parse(notificationsData));
      }
    } catch (error) {
      console.error('Error loading event notifications:', error);
    }
  };

  // Save an event
  const saveEvent = async (eventId: string) => {
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) return false;

      const savedEventIds = await AsyncStorage.getItem('savedEvents');
      let ids: string[] = savedEventIds ? JSON.parse(savedEventIds) : [];
      
      if (!ids.includes(eventId)) {
        ids.push(eventId);
        await AsyncStorage.setItem('savedEvents', JSON.stringify(ids));
        
        setState(prev => ({
          ...prev,
          savedEvents: [...prev.savedEvents, event],
        }));
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving event:', error);
      return false;
    }
  };

  // Unsave an event
  const unsaveEvent = async (eventId: string) => {
    try {
      const savedEventIds = await AsyncStorage.getItem('savedEvents');
      if (!savedEventIds) return false;
      
      let ids: string[] = JSON.parse(savedEventIds);
      ids = ids.filter(id => id !== eventId);
      
      await AsyncStorage.setItem('savedEvents', JSON.stringify(ids));
      
      setState(prev => ({
        ...prev,
        savedEvents: prev.savedEvents.filter(event => event.id !== eventId),
      }));
      
      // Cancel notifications for this event
      await cancelEventNotifications(eventId);
      
      return true;
    } catch (error) {
      console.error('Error unsaving event:', error);
      return false;
    }
  };

  // Check if an event is saved
  const isEventSaved = (eventId: string): boolean => {
    return state.savedEvents.some(event => event.id === eventId);
  };
  
  // Schedule notifications for an event
  const scheduleEventNotifications = async (eventId: string) => {
    if (Platform.OS === 'web') {
      console.log('Notifications not supported on web');
      return false;
    }
    
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) return false;
      
      const eventDate = new Date(event.date);
      const eventTime = event.time;
      
      // Parse time (assuming format like "7:00 PM" or "19:00")
      let hours = 0;
      let minutes = 0;
      
      if (eventTime.includes(':')) {
        const [hourStr, minuteStr] = eventTime.split(':');
        hours = parseInt(hourStr, 10);
        
        if (minuteStr.includes('PM') || minuteStr.includes('AM')) {
          const [mins, period] = minuteStr.split(' ');
          minutes = parseInt(mins, 10);
          
          if (period === 'PM' && hours < 12) {
            hours += 12;
          } else if (period === 'AM' && hours === 12) {
            hours = 0;
          }
        } else {
          minutes = parseInt(minuteStr, 10);
        }
      }
      
      // Set event time
      eventDate.setHours(hours, minutes, 0);
      
      // Create notification for day before
      const dayBeforeDate = new Date(eventDate);
      dayBeforeDate.setDate(dayBeforeDate.getDate() - 1);
      dayBeforeDate.setHours(12, 0, 0); // Noon the day before
      
      // Create notification for 2 hours before
      const twoHoursBeforeDate = new Date(eventDate);
      twoHoursBeforeDate.setHours(twoHoursBeforeDate.getHours() - 2);
      
      // Only schedule if the dates are in the future
      const now = new Date();
      const notificationIds = [];
      
      if (dayBeforeDate > now) {
        const dayBeforeId = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Event Tomorrow',
            body: `Don't forget: ${event.title} at ${event.mosque_name} tomorrow at ${event.time}`,
            data: { eventId },
          },
          trigger: dayBeforeDate.getTime(), // Use timestamp for Expo SDK 52
        });
        notificationIds.push(dayBeforeId);
      }
      
      if (twoHoursBeforeDate > now) {
        const twoHoursBeforeId = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Event Soon',
            body: `Reminder: ${event.title} at ${event.mosque_name} starts in 2 hours`,
            data: { eventId },
          },
          trigger: twoHoursBeforeDate.getTime(), // Use timestamp for Expo SDK 52
        });
        notificationIds.push(twoHoursBeforeId);
      }
      
      // Save notification IDs
      if (notificationIds.length > 0) {
        const updatedNotifications = [...eventNotifications];
        const existingIndex = updatedNotifications.findIndex(n => n.eventId === eventId);
        
        if (existingIndex >= 0) {
          updatedNotifications[existingIndex].notificationIds = notificationIds;
        } else {
          updatedNotifications.push({ eventId, notificationIds });
        }
        
        setEventNotifications(updatedNotifications);
        await AsyncStorage.setItem('eventNotifications', JSON.stringify(updatedNotifications));
      }
      
      return notificationIds.length > 0;
    } catch (error) {
      console.error('Error scheduling notifications:', error);
      return false;
    }
  };
  
  // Cancel notifications for an event
  const cancelEventNotifications = async (eventId: string) => {
    if (Platform.OS === 'web') return false;
    
    try {
      const eventNotification = eventNotifications.find(n => n.eventId === eventId);
      if (!eventNotification) return false;
      
      // Cancel each notification
      for (const notificationId of eventNotification.notificationIds) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      }
      
      // Update state and storage
      const updatedNotifications = eventNotifications.filter(n => n.eventId !== eventId);
      setEventNotifications(updatedNotifications);
      await AsyncStorage.setItem('eventNotifications', JSON.stringify(updatedNotifications));
      
      return true;
    } catch (error) {
      console.error('Error canceling notifications:', error);
      return false;
    }
  };
  
  // Check if an event has notifications
  const hasEventNotifications = (eventId: string): boolean => {
    return eventNotifications.some(n => n.eventId === eventId);
  };
  
  // Rate an event
  const rateEvent = async (eventId: string, rating: number, feedback: string) => {
    try {
      const newRating: EventRating = {
        eventId,
        rating,
        feedback,
        date: new Date().toISOString(),
      };
      
      // Remove any existing rating for this event
      const updatedRatings = eventRatings.filter(r => r.eventId !== eventId);
      
      // Add the new rating
      const newRatings = [...updatedRatings, newRating];
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('eventRatings', JSON.stringify(newRatings));
      
      // Update state
      setEventRatings(newRatings);
      
      return true;
    } catch (error) {
      console.error('Error rating event:', error);
      return false;
    }
  };
  
  // Get rating for an event
  const getEventRating = (eventId: string): EventRating | undefined => {
    return eventRatings.find(rating => rating.eventId === eventId);
  };

  // Update nearby events when location changes
  useEffect(() => {
    if (latitude && longitude) {
      try {
        const nearby = events.filter(event => {
          const distance = calculateDistance(
            latitude,
            longitude,
            event.latitude,
            event.longitude
          );
          return distance <= radius;
        });
        
        setState(prev => ({
          ...prev,
          nearbyEvents: nearby,
          loading: false,
          error: null,
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Error finding nearby events',
        }));
      }
    } else {
      setState(prev => ({
        ...prev,
        loading: false,
      }));
    }
  }, [latitude, longitude, radius]);

  const getEventById = (id: string): Event | undefined => {
    return events.find(event => event.id === id);
  };

  const getEventsByMosqueId = (mosqueId: string): Event[] => {
    return events.filter(event => event.mosque_id === mosqueId);
  };

  const getEventsByCategory = (category: string): Event[] => {
    return events.filter(event => event.category === category);
  };

  return {
    ...state,
    getEventById,
    getEventsByMosqueId,
    getEventsByCategory,
    saveEvent,
    unsaveEvent,
    isEventSaved,
    refreshSavedEvents: loadSavedEvents,
    rateEvent,
    getEventRating,
    scheduleEventNotifications,
    cancelEventNotifications,
    hasEventNotifications,
  };
}