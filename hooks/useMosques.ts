import { useState, useEffect, useCallback } from 'react';
import { mosques, Mosque } from '@/data/mosques';
import { getMosquesWithinRadius } from '@/utils/location';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MosquesState {
  allMosques: Mosque[];
  nearbyMosques: Mosque[];
  favoriteMosques: Mosque[];
  loading: boolean;
  error: string | null;
}

export default function useMosques(
  latitude?: number,
  longitude?: number,
  radius: number = 10
) {
  const [state, setState] = useState<MosquesState>({
    allMosques: mosques,
    nearbyMosques: [],
    favoriteMosques: [],
    loading: true,
    error: null,
  });

  const updateNearbyMosques = useCallback(() => {
    if (latitude && longitude) {
      try {
        const nearby = getMosquesWithinRadius(mosques, latitude, longitude, radius);
        setState(prev => ({
          ...prev,
          nearbyMosques: nearby,
          loading: false,
          error: null,
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Error finding nearby mosques',
        }));
      }
    } else {
      setState(prev => ({
        ...prev,
        loading: false,
      }));
    }
  }, [latitude, longitude, radius]);

  // Load favorite mosques from AsyncStorage
  const loadFavoriteMosques = useCallback(async () => {
    try {
      const favoriteMosqueIds = await AsyncStorage.getItem('favoriteMosques');
      if (favoriteMosqueIds) {
        const ids = JSON.parse(favoriteMosqueIds) as string[];
        const favorites = mosques.filter(mosque => ids.includes(mosque.id));
        
        setState(prev => ({
          ...prev,
          favoriteMosques: favorites,
        }));
      }
      return true;
    } catch (error) {
      console.error('Error loading favorite mosques:', error);
      return false;
    }
  }, []);

  // Toggle favorite status of a mosque
  const toggleFavoriteMosque = async (mosqueId: string) => {
    try {
      const mosque = mosques.find(m => m.id === mosqueId);
      if (!mosque) return false;

      const favoriteMosqueIds = await AsyncStorage.getItem('favoriteMosques');
      let ids: string[] = favoriteMosqueIds ? JSON.parse(favoriteMosqueIds) : [];
      
      if (ids.includes(mosqueId)) {
        // Remove from favorites
        ids = ids.filter(id => id !== mosqueId);
        await AsyncStorage.setItem('favoriteMosques', JSON.stringify(ids));
        
        setState(prev => ({
          ...prev,
          favoriteMosques: prev.favoriteMosques.filter(m => m.id !== mosqueId),
        }));
      } else {
        // Add to favorites
        ids.push(mosqueId);
        await AsyncStorage.setItem('favoriteMosques', JSON.stringify(ids));
        
        setState(prev => ({
          ...prev,
          favoriteMosques: [...prev.favoriteMosques, mosque],
        }));
      }
      
      return true;
    } catch (error) {
      console.error('Error toggling favorite mosque:', error);
      return false;
    }
  };

  // Check if a mosque is favorited
  const isMosqueFavorite = (mosqueId: string): boolean => {
    return state.favoriteMosques.some(mosque => mosque.id === mosqueId);
  };

  useEffect(() => {
    updateNearbyMosques();
    loadFavoriteMosques();
  }, [updateNearbyMosques, loadFavoriteMosques]);

  const getMosqueById = (id: string): Mosque | undefined => {
    return mosques.find(mosque => mosque.id === id);
  };

  return {
    ...state,
    getMosqueById,
    refreshNearbyMosques: updateNearbyMosques,
    refreshFavoriteMosques: loadFavoriteMosques,
    toggleFavoriteMosque,
    isMosqueFavorite,
  };
}