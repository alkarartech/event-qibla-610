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
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({});
    return location;
  } catch (error) {
    console.error('Error getting location:', error);
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