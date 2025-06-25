import { useState, useEffect, useCallback } from 'react';
import { events, Event } from '@/mocks/events';
import { calculateDistance } from '@/utils/location';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  // Load saved events on mount
  useEffect(() => {
    loadSavedEvents();
    loadEventRatings();
  }, []);

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
    } catch (error) {
      console.error('Error loading saved events:', error);
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

  // Save an event
  const saveEvent = async (eventId: string) => {
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) return;

      const savedEventIds = await AsyncStorage.getItem('savedEvents');
      let ids: string[] = savedEventIds ? JSON.parse(savedEventIds) : [];
      
      if (!ids.includes(eventId)) {
        ids.push(eventId);
        await AsyncStorage.setItem('savedEvents', JSON.stringify(ids));
        
        setState(prev => ({
          ...prev,
          savedEvents: [...prev.savedEvents, event],
        }));
      }
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  // Unsave an event
  const unsaveEvent = async (eventId: string) => {
    try {
      const savedEventIds = await AsyncStorage.getItem('savedEvents');
      if (!savedEventIds) return;
      
      let ids: string[] = JSON.parse(savedEventIds);
      ids = ids.filter(id => id !== eventId);
      
      await AsyncStorage.setItem('savedEvents', JSON.stringify(ids));
      
      setState(prev => ({
        ...prev,
        savedEvents: prev.savedEvents.filter(event => event.id !== eventId),
      }));
    } catch (error) {
      console.error('Error unsaving event:', error);
    }
  };

  // Check if an event is saved
  const isEventSaved = (eventId: string): boolean => {
    return state.savedEvents.some(event => event.id === eventId);
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
  };
}