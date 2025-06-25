import { useState, useEffect, useCallback } from 'react';
import { mosques, Mosque } from '@/mocks/mosques';
import { getMosquesWithinRadius } from '@/utils/location';

interface MosquesState {
  allMosques: Mosque[];
  nearbyMosques: Mosque[];
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
    loading: true,
    error: null,
  });

  const updateNearbyMosques = useCallback(() => {
    if (latitude && longitude) {
      try {
        const nearby = getMosquesWithinRadius(mosques, latitude, longitude, radius);
        setState({
          allMosques: mosques,
          nearbyMosques: nearby,
          loading: false,
          error: null,
        });
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

  useEffect(() => {
    updateNearbyMosques();
  }, [updateNearbyMosques]);

  const getMosqueById = (id: string): Mosque | undefined => {
    return mosques.find(mosque => mosque.id === id);
  };

  return {
    ...state,
    getMosqueById,
    refreshNearbyMosques: updateNearbyMosques,
  };
}