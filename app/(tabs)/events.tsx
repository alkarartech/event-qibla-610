import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal } from 'react-native';
import { MapPin, Filter, Calendar, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { globalStyles } from '@/constants/theme';
import EventCard from '@/components/EventCard';
import SearchBar from '@/components/SearchBar';
import FilterChip from '@/components/FilterChip';
import LoadingIndicator from '@/components/LoadingIndicator';
import EmptyState from '@/components/EmptyState';
import LocationSelector from '@/components/LocationSelector';
import useLocation from '@/hooks/useLocation';
import useEvents from '@/hooks/useEvents';

// Time filter options
const timeFilterOptions = [
  { id: 'anytime', label: 'Anytime' },
  { id: 'today', label: 'Today' },
  { id: 'tomorrow', label: 'Tomorrow' },
  { id: 'thisWeek', label: 'This Week' },
  { id: 'thisMonth', label: 'This Month' },
  { id: 'custom', label: 'Custom Date' },
];

export default function EventsScreen() {
  const { location, locationName, loading: locationLoading } = useLocation();
  const { allEvents, nearbyEvents, savedEvents, loading: eventsLoading } = useEvents(
    location?.coords.latitude,
    location?.coords.longitude,
    10
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEvents, setFilteredEvents] = useState(allEvents);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('anytime');
  const [customLocation, setCustomLocation] = useState('');
  const [showTimeFilterModal, setShowTimeFilterModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const categories = ['all', 'lecture', 'workshop', 'community', 'charity', 'other'];

  // Filter settings
  const [filterSettings, setFilterSettings] = useState({
    categories: [] as string[],
    languages: [] as string[],
    sortBy: 'relevance',
  });

  useEffect(() => {
    let events = selectedFilter === 'nearby' ? nearbyEvents : 
                 selectedFilter === 'saved' ? savedEvents : allEvents;
    
    if (selectedFilter !== 'all' && selectedFilter !== 'nearby' && selectedFilter !== 'saved') {
      events = events.filter(event => event.category === selectedFilter);
    }
    
    // Apply time filter
    if (selectedTimeFilter !== 'anytime') {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const thisWeekEnd = new Date(today);
      thisWeekEnd.setDate(today.getDate() + (7 - today.getDay()));
      
      const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      events = events.filter(event => {
        const eventDate = new Date(event.date);
        
        switch (selectedTimeFilter) {
          case 'today':
            return eventDate.toDateString() === today.toDateString();
          case 'tomorrow':
            return eventDate.toDateString() === tomorrow.toDateString();
          case 'thisWeek':
            return eventDate >= today && eventDate <= thisWeekEnd;
          case 'thisMonth':
            return eventDate >= today && eventDate <= thisMonthEnd;
          default:
            return true;
        }
      });
    }
    
    // Apply search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      events = events.filter(event => 
        event.title.toLowerCase().includes(query) || 
        event.description.toLowerCase().includes(query) ||
        event.mosque_name.toLowerCase().includes(query)
      );
    }
    
    setFilteredEvents(events);
  }, [searchQuery, selectedFilter, selectedTimeFilter, nearbyEvents, allEvents, savedEvents]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleLocationSelect = (location: string) => {
    setCustomLocation(location);
    // In a real app, this would trigger a location-based search
  };

  const isLoading = locationLoading || eventsLoading;

  const renderTimeFilterOption = ({ item }: { item: typeof timeFilterOptions[0] }) => (
    <TouchableOpacity 
      style={[
        styles.timeFilterOption,
        selectedTimeFilter === item.id && styles.selectedTimeFilterOption
      ]}
      onPress={() => {
        setSelectedTimeFilter(item.id);
        setShowTimeFilterModal(false);
      }}
    >
      <Text 
        style={[
          styles.timeFilterOptionText,
          selectedTimeFilter === item.id && styles.selectedTimeFilterOptionText
        ]}
      >
        {item.label}
      </Text>
      {selectedTimeFilter === item.id && (
        <View style={styles.checkmark} />
      )}
    </TouchableOpacity>
  );

  const getSelectedTimeFilterLabel = () => {
    const option = timeFilterOptions.find(option => option.id === selectedTimeFilter);
    return option ? option.label : 'Anytime';
  };

  return (
    <View style={styles.container}>
      {/* Location Selector */}
      <View style={styles.locationContainer}>
        <LocationSelector 
          currentLocation={customLocation || locationName || 'Current Location'}
          onLocationSelect={handleLocationSelect}
        />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search events"
          onClear={clearSearch}
        />
        
        <View style={styles.filterButtonsContainer}>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Filter size={18} color={Colors.text} />
            <Text style={styles.filterButtonText}>Filter</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowTimeFilterModal(true)}
          >
            <Calendar size={18} color={Colors.text} />
            <Text style={styles.filterButtonText}>{getSelectedTimeFilterLabel()}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Filters */}
      <FlatList
        data={['nearby', 'saved', ...categories]}
        renderItem={({ item }) => (
          <FilterChip
            label={
              item === 'all' ? 'All Events' : 
              item === 'nearby' ? 'Nearby' : 
              item === 'saved' ? 'Saved' :
              item.charAt(0).toUpperCase() + item.slice(1)
            }
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
                  : selectedFilter === 'saved'
                  ? "You haven't saved any events yet."
                  : "We couldn't find any events in this category."
              }
            />
          }
        />
      )}

      {/* Time Filter Modal */}
      <Modal
        visible={showTimeFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimeFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time</Text>
              <TouchableOpacity onPress={() => setShowTimeFilterModal(false)}>
                <Text style={styles.modalCloseButton}>Close</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={timeFilterOptions}
              renderItem={renderTimeFilterOption}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.timeFilterList}
            />
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.filterModalContainer}>
          <View style={styles.filterModalHeader}>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Text style={styles.filterModalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.filterModalTitle}>Filters</Text>
            <TouchableOpacity onPress={() => {
              // Reset filters
              setFilterSettings({
                categories: [],
                languages: [],
                sortBy: 'relevance',
              });
              setShowFilterModal(false);
            }}>
              <Text style={styles.filterModalReset}>Reset</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Categories</Text>
            <View style={styles.filterChipsContainer}>
              {categories.filter(cat => cat !== 'all').map(category => (
                <FilterChip
                  key={category}
                  label={category.charAt(0).toUpperCase() + category.slice(1)}
                  selected={filterSettings.categories.includes(category)}
                  onPress={() => {
                    setFilterSettings(prev => {
                      const newCategories = prev.categories.includes(category)
                        ? prev.categories.filter(c => c !== category)
                        : [...prev.categories, category];
                      return { ...prev, categories: newCategories };
                    });
                  }}
                />
              ))}
            </View>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Languages</Text>
            <View style={styles.filterChipsContainer}>
              {['English', 'Arabic', 'Urdu', 'French', 'Spanish'].map(language => (
                <FilterChip
                  key={language}
                  label={language}
                  selected={filterSettings.languages.includes(language)}
                  onPress={() => {
                    setFilterSettings(prev => {
                      const newLanguages = prev.languages.includes(language)
                        ? prev.languages.filter(l => l !== language)
                        : [...prev.languages, language];
                      return { ...prev, languages: newLanguages };
                    });
                  }}
                />
              ))}
            </View>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Sort By</Text>
            <TouchableOpacity 
              style={styles.sortOption}
              onPress={() => setFilterSettings(prev => ({ ...prev, sortBy: 'relevance' }))}
            >
              <Text style={styles.sortOptionText}>Relevance</Text>
              <View style={[
                styles.radioButton, 
                filterSettings.sortBy === 'relevance' && styles.radioButtonSelected
              ]}>
                {filterSettings.sortBy === 'relevance' && <View style={styles.radioButtonInner} />}
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.sortOption}
              onPress={() => setFilterSettings(prev => ({ ...prev, sortBy: 'distance' }))}
            >
              <Text style={styles.sortOptionText}>Distance</Text>
              <View style={[
                styles.radioButton, 
                filterSettings.sortBy === 'distance' && styles.radioButtonSelected
              ]}>
                {filterSettings.sortBy === 'distance' && <View style={styles.radioButtonInner} />}
              </View>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.applyButton}
            onPress={() => setShowFilterModal(false)}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  locationContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchContainer: {
    paddingBottom: 8,
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterButtonText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 6,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  modalCloseButton: {
    fontSize: 16,
    color: Colors.primary,
  },
  timeFilterList: {
    paddingHorizontal: 16,
  },
  timeFilterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  selectedTimeFilterOption: {
    backgroundColor: Colors.card,
  },
  timeFilterOptionText: {
    fontSize: 16,
    color: Colors.text,
  },
  selectedTimeFilterOptionText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  checkmark: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  filterModalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  filterModalCancel: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  filterModalReset: {
    fontSize: 16,
    color: Colors.primary,
  },
  filterSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  sortOptionText: {
    fontSize: 16,
    color: Colors.text,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: Colors.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  applyButton: {
    backgroundColor: Colors.primary,
    margin: 16,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});