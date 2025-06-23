import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MapPin, Sliders } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { globalStyles } from '@/constants/theme';
import MosqueCard from '@/components/MosqueCard';
import SearchBar from '@/components/SearchBar';
import FilterChip from '@/components/FilterChip';
import LoadingIndicator from '@/components/LoadingIndicator';
import EmptyState from '@/components/EmptyState';
import useLocation from '@/hooks/useLocation';
import useMosques from '@/hooks/useMosques';

export default function MosquesScreen() {
  const { location, locationName, loading: locationLoading } = useLocation();
  const { allMosques, nearbyMosques, loading: mosquesLoading } = useMosques(
    location?.coords.latitude,
    location?.coords.longitude,
    10
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMosques, setFilteredMosques] = useState(allMosques);
  const [selectedFilter, setSelectedFilter] = useState('nearby');

  useEffect(() => {
    if (selectedFilter === 'nearby' && nearbyMosques.length > 0) {
      setFilteredMosques(nearbyMosques);
    } else {
      setFilteredMosques(allMosques);
    }
  }, [selectedFilter, nearbyMosques, allMosques]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      if (selectedFilter === 'nearby' && nearbyMosques.length > 0) {
        setFilteredMosques(nearbyMosques);
      } else {
        setFilteredMosques(allMosques);
      }
      return;
    }

    const query = searchQuery.toLowerCase();
    const mosques = selectedFilter === 'nearby' && nearbyMosques.length > 0 
      ? nearbyMosques 
      : allMosques;
    
    const filtered = mosques.filter(mosque => 
      mosque.name.toLowerCase().includes(query) || 
      mosque.address.toLowerCase().includes(query)
    );
    
    setFilteredMosques(filtered);
  }, [searchQuery, selectedFilter, nearbyMosques, allMosques]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  const isLoading = locationLoading || mosquesLoading;

  return (
    <View style={styles.container}>
      {/* Location Header */}
      <View style={styles.locationContainer}>
        <MapPin size={20} color={Colors.primary} />
        <Text style={styles.locationText}>
          {locationLoading ? 'Getting your location...' : locationName}
        </Text>
      </View>

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search mosques by name or address"
        onClear={clearSearch}
      />

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <FilterChip
          label="Nearby"
          selected={selectedFilter === 'nearby'}
          onPress={() => setSelectedFilter('nearby')}
        />
        <FilterChip
          label="All Mosques"
          selected={selectedFilter === 'all'}
          onPress={() => setSelectedFilter('all')}
        />
      </View>

      {isLoading ? (
        <LoadingIndicator message="Finding mosques..." />
      ) : (
        <FlatList
          data={filteredMosques}
          renderItem={({ item }) => <MosqueCard mosque={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              title="No Mosques Found"
              message={
                searchQuery
                  ? "We couldn't find any mosques matching your search."
                  : "We couldn't find any mosques near your current location."
              }
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
});