import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { Mosque } from '@/mocks/mosques';

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return parseFloat(distance.toFixed(1));
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

// Get current location
export const getCurrentLocation = async (): Promise<Location.LocationObject | null> => {
  try {
    // For web, use a different approach since permissions work differently
    if (Platform.OS === 'web') {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // Convert web position to Expo Location format
            const expoPosition: Location.LocationObject = {
              coords: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                altitude: position.coords.altitude,
                accuracy: position.coords.accuracy,
                altitudeAccuracy: position.coords.altitudeAccuracy,
                heading: position.coords.heading,
                speed: position.coords.speed,
              },
              timestamp: position.timestamp,
            };
            resolve(expoPosition);
          },
          (error) => {
            console.error('Error getting web location:', error);
            reject(error);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      });
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return null;
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
      });
      return location;
    } catch (error) {
      console.error('Error getting location:', error);
      
      // Fallback to last known location if current position fails
      try {
        const lastKnownLocation = await Location.getLastKnownPositionAsync();
        if (lastKnownLocation) {
          console.log('Using last known location as fallback');
          return lastKnownLocation;
        }
      } catch (fallbackError) {
        console.error('Error getting last known location:', fallbackError);
      }
      
      return null;
    }
  } catch (error) {
    console.error('Error in getCurrentLocation:', error);
    return null;
  }
};

// Get mosques within radius
export const getMosquesWithinRadius = (
  mosques: Mosque[],
  userLat: number,
  userLon: number,
  radius: number = 10 // Default 10km radius
): Mosque[] => {
  return mosques
    .map(mosque => {
      const distance = calculateDistance(
        userLat,
        userLon,
        mosque.latitude,
        mosque.longitude
      );
      return { ...mosque, distance };
    })
    .filter(mosque => mosque.distance <= radius)
    .sort((a, b) => (a.distance || 0) - (b.distance || 0));
};

// Get location name from coordinates
export const getLocationName = async (
  latitude: number,
  longitude: number
): Promise<string> => {
  try {
    if (Platform.OS === 'web') {
      // For web, we can try to use the browser's Geocoding API if available
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
        );
        const data = await response.json();
        if (data && data.address) {
          const { city, town, village, county, state, country } = data.address;
          return [city || town || village || county, state, country].filter(Boolean).join(', ');
        }
      } catch (webError) {
        console.error('Web geocoding error:', webError);
      }
      return 'Current Location';
    }
    
    const response = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (response.length > 0) {
      const { city, region, country } = response[0];
      return [city, region, country].filter(Boolean).join(', ');
    }
    
    return 'Current Location';
  } catch (error) {
    console.error('Error getting location name:', error);
    return 'Current Location';
  }
};