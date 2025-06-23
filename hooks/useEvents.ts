import { useState, useEffect } from 'react';
import { events, Event } from '@/mocks/events';
import { calculateDistance } from '@/utils/location';

interface EventsState {
  allEvents: Event[];
  nearbyEvents: Event[];
  loading: boolean;
  error: string | null;
}

export default function useEvents(
  latitude?: number,
  longitude?: number,
  radius: number = 10
) {
  const [state, setState] = useState<EventsState>({
    allEvents: events,
    nearbyEvents: [],
    loading: true,
    error: null,
  });

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
        
        setState({
          allEvents: events,
          nearbyEvents: nearby,
          loading: false,
          error: null,
        });
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
  };
}