import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { getCurrentLocation, getLocationName } from '@/utils/location';

interface LocationState {
  location: Location.LocationObject | null;
  locationName: string;
  loading: boolean;
  error: string | null;
}

export default function useLocation() {
  const [state, setState] = useState<LocationState>({
    location: null,
    locationName: '',
    loading: true,
    error: null,
  });

  const fetchLocation = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const location = await getCurrentLocation();
      
      if (!location) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Unable to get your location',
        }));
        return;
      }
      
      const { latitude, longitude } = location.coords;
      const name = await getLocationName(latitude, longitude);
      
      setState({
        location,
        locationName: name,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Error fetching location',
      }));
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return {
    ...state,
    refreshLocation: fetchLocation,
  };
}