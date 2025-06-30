import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { Platform, Alert } from 'react-native';
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
          error: 'Unable to get your location. Please check your location permissions.',
        }));
        
        // Show alert to help user understand the issue
        if (Platform.OS !== 'web') {
          Alert.alert(
            "Location Access Required",
            "This app needs access to your location to find nearby mosques and events. Please enable location services in your device settings.",
            [{ text: "OK" }]
          );
        }
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
      console.error('Error in fetchLocation:', error);
      
      // Provide a more helpful error message
      let errorMessage = 'Error fetching location';
      if (error instanceof Error) {
        errorMessage = `Location error: ${error.message}`;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = 'Location services unavailable. Please check your device settings.';
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      
      // Use default coordinates for major cities as fallback
      // This is just for demo purposes - in a real app, you'd want to handle this differently
      const defaultLocation: Location.LocationObject = {
        coords: {
          latitude: 37.7749, // San Francisco
          longitude: -122.4194,
          altitude: null,
          accuracy: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null
        },
        timestamp: Date.now()
      };
      
      setState(prev => ({
        ...prev,
        location: defaultLocation,
        locationName: 'Default Location',
        loading: false,
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