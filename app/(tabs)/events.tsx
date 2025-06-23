import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { MapPin } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { globalStyles } from '@/constants/theme';
import EventCard from '@/components/EventCard';
import SearchBar from '@/components/SearchBar';
import FilterChip from '@/components/FilterChip';
import LoadingIndicator from '@/components/LoadingIndicator';
import EmptyState from '@/components/EmptyState';
import useLocation from '@/hooks/useLocation';
import useEvents from '@/hooks/useEvents';

export default function EventsScreen() {
  const { location, locationName, loading: locationLoading } = useLocation();
  const { allEvents, nearbyEvents, loading: eventsLoading } = useEvents(
    location?.coords.latitude,
    location?.coords.longitude,
    10
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEvents, setFilteredEvents] = useState(allEvents);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const categories = ['all', 'lecture', 'workshop', 'community', 'charity', 'other'];

  useEffect(() => {
    let events = selectedFilter === 'nearby' ? nearbyEvents : allEvents;
    
    if (selectedFilter !== 'all' && selectedFilter !== 'nearby') {
      events = events.filter(event => event.category === selectedFilter);
    }
    
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      events = events.filter(event => 
        event.title.toLowerCase().includes(query) || 
        event.description.toLowerCase().includes(query) ||
        event.mosque_name.toLowerCase().includes(query)
      );
    }
    
    setFilteredEvents(events);
  }, [searchQuery, selectedFilter, nearbyEvents, allEvents]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  const isLoading = locationLoading || eventsLoading;

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
        placeholder="Search events"
        onClear={clearSearch}
      />

      {/* Filters */}
      <FlatList
        data={['nearby', ...categories]}
        renderItem={({ item }) => (
          <FilterChip
            label={item === 'all' ? 'All Events' : item === 'nearby' ? 'Nearby' : item.charAt(0).toUpperCase() + item.slice(1)}
            selected={selectedFilter === item}
            onPress={() => setSelectedFilter(item)}
          />
        )}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      />

      {isLoading ? (
        <LoadingIndicator message="Finding events..." />
      ) : (
        <FlatList
          data={filteredEvents}
          renderItem={({ item }) => <EventCard event={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              title="No Events Found"
              message={
                searchQuery
                  ? "We couldn't find any events matching your search."
                  : "We couldn't find any events in this category."
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
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
});