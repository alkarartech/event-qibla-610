import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Platform, TextInput, RefreshControl } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MapPin, Filter, Calendar, ChevronDown, ChevronRight, X, ArrowDownUp } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { globalStyles } from '@/constants/theme';
import EventCard from '@/components/EventCard';
import SearchBar from '@/components/SearchBar';
import LoadingIndicator from '@/components/LoadingIndicator';
import EmptyState from '@/components/EmptyState';
import LocationSelector from '@/components/LocationSelector';
import useLocation from '@/hooks/useLocation';
import useEvents from '@/hooks/useEvents';
import useThemeStore from '@/hooks/useThemeStore';
import DateTimePicker from '@react-native-community/datetimepicker';

// Time filter options
const timeFilterOptions = [
  { id: 'anytime', label: 'Anytime' },
  { id: 'today', label: 'Today' },
  { id: 'tomorrow', label: 'Tomorrow' },
  { id: 'thisWeek', label: 'This Week' },
  { id: 'thisMonth', label: 'This Month' },
  { id: 'custom', label: 'Custom Date' },
];

// Sort options
const sortOptions = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'distance', label: 'Distance' },
  { id: 'date', label: 'Date' },
];

// Event categories
const eventCategories = [
  { id: 'all', label: 'All Events' },
  { id: 'lecture', label: 'Lectures' },
  { id: 'workshop', label: 'Workshops' },
  { id: 'community', label: 'Community' },
  { id: 'charity', label: 'Charity' },
  { id: 'other', label: 'Other' },
];

// Languages
const languages = ['All', 'English', 'Arabic', 'Urdu', 'Farsi', 'Turkish'];

// Denominations
const denominations = ['All', 'Sunni', 'Shia'];

export default function EventsScreen() {
  const params = useLocalSearchParams();
  const { location, locationName, loading: locationLoading } = useLocation();
  const { allEvents, nearbyEvents, savedEvents, loading: eventsLoading, refreshSavedEvents } = useEvents(
    location?.coords?.latitude,
    location?.coords?.longitude,
    10
  );
  const { isDarkMode } = useThemeStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('anytime');
  const [customLocation, setCustomLocation] = useState('');
  const [showTimeFilterModal, setShowTimeFilterModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDate, setCustomDate] = useState(new Date());
  const [sortBy, setSortBy] = useState('relevance');
  const [refreshing, setRefreshing] = useState(false);

  // Filter settings
  const [filterSettings, setFilterSettings] = useState({
    category: 'all',
    saved: false,
    language: 'All',
    denomination: 'All',
    proximity: 10, // in km
  });
  
  // Check if we should show saved events based on URL params
  useEffect(() => {
    if (params.filter === 'saved') {
      setFilterSettings(prev => ({
        ...prev,
        saved: true
      }));
    }
  }, [params.filter]);

  useEffect(() => {
    let events = allEvents;
    
    // Apply saved filter
    if (filterSettings.saved) {
      events = savedEvents;
    } else {
      // Apply category filter
      if (filterSettings.category !== 'all') {
        events = events.filter(event => event.category === filterSettings.category);
      }
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
          case 'custom':
            return eventDate.toDateString() === customDate.toDateString();
          default:
            return true;
        }
      });
    }
    
    // Apply language filter
    if (filterSettings.language !== 'All') {
      // In a real app, events would have a languages property
      // This is a placeholder for when language data is available
      // events = events.filter(event => event.languages?.includes(filterSettings.language));
    }
    
    // Apply denomination filter
    if (filterSettings.denomination !== 'All') {
      // In a real app, events would have a denomination property
      // This is a placeholder for when denomination data is available
      // events = events.filter(event => event.denomination === filterSettings.denomination);
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
    
    // Apply sorting
    if (sortBy === 'distance' && location) {
      events = [...events].sort((a, b) => {
        const distanceA = calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          a.latitude,
          a.longitude
        );
        const distanceB = calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          b.latitude,
          b.longitude
        );
        return distanceA - distanceB;
      });
    } else if (sortBy === 'date') {
      events = [...events].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    }
    
    setFilteredEvents(events);
  }, [
    searchQuery, 
    selectedTimeFilter, 
    customDate, 
    filterSettings, 
    sortBy, 
    allEvents, 
    savedEvents, 
    nearbyEvents, 
    location
  ]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refreshSavedEvents().then(() => {
      setRefreshing(false);
    });
  }, [refreshSavedEvents]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
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
    return distance;
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
  };

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
        if (item.id === 'custom') {
          setShowDatePicker(true);
        } else {
          setShowTimeFilterModal(false);
        }
      }}
    >
      <Text 
        style={[
          styles.timeFilterOptionText,
          isDarkMode && styles.timeFilterOptionTextDark,
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
    if (selectedTimeFilter === 'custom') {
      return `${customDate.toLocaleDateString()}`;
    }
    const option = timeFilterOptions.find(option => option.id === selectedTimeFilter);
    return option ? option.label : 'Anytime';
  };

  const getSelectedSortLabel = () => {
    const option = sortOptions.find(option => option.id === sortBy);
    return option ? option.label : 'Relevance';
  };

  return (
    <View style={[
      styles.container, 
      isDarkMode && styles.containerDark
    ]}>
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
            style={[
              styles.filterButton,
              isDarkMode && styles.filterButtonDark
            ]}
            onPress={() => setShowSortModal(true)}
          >
            <ArrowDownUp size={16} color={isDarkMode ? Colors.white : Colors.text} />
            <Text style={[
              styles.filterButtonText,
              isDarkMode && styles.filterButtonTextDark
            ]}>Sort: {getSelectedSortLabel()}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterButton,
              isDarkMode && styles.filterButtonDark
            ]}
            onPress={() => setShowFilterModal(true)}
          >
            <Filter size={16} color={isDarkMode ? Colors.white : Colors.text} />
            <Text style={[
              styles.filterButtonText,
              isDarkMode && styles.filterButtonTextDark
            ]}>Filter</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterButton,
              isDarkMode && styles.filterButtonDark
            ]}
            onPress={() => setShowTimeFilterModal(true)}
          >
            <Calendar size={16} color={isDarkMode ? Colors.white : Colors.text} />
            <Text style={[
              styles.filterButtonText,
              isDarkMode && styles.filterButtonTextDark
            ]}>{getSelectedTimeFilterLabel()}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <LoadingIndicator message="Finding events..." />
      ) : (
        <FlatList
          data={filteredEvents}
          renderItem={({ item }) => <EventCard event={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={isDarkMode ? Colors.white : Colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="No Events Found"
              message={
                searchQuery
                  ? "We couldn't find any events matching your search."
                  : filterSettings.saved
                  ? "You haven't saved any events yet."
                  : "We couldn't find any events matching your filters."
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
          <View style={[
            styles.modalContent,
            isDarkMode && styles.modalContentDark
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[
                styles.modalTitle,
                isDarkMode && styles.modalTitleDark
              ]}>Select Time</Text>
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

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSortModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            isDarkMode && styles.modalContentDark,
            { height: 250 }
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[
                styles.modalTitle,
                isDarkMode && styles.modalTitleDark
              ]}>Sort By</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Text style={styles.modalCloseButton}>Close</Text>
              </TouchableOpacity>
            </View>
            
            {sortOptions.map((option) => (
              <TouchableOpacity 
                key={option.id}
                style={[
                  styles.timeFilterOption,
                  sortBy === option.id && styles.selectedTimeFilterOption
                ]}
                onPress={() => {
                  setSortBy(option.id);
                  setShowSortModal(false);
                }}
              >
                <Text 
                  style={[
                    styles.timeFilterOptionText,
                    isDarkMode && styles.timeFilterOptionTextDark,
                    sortBy === option.id && styles.selectedTimeFilterOptionText
                  ]}
                >
                  {option.label}
                </Text>
                {sortBy === option.id && (
                  <View style={styles.checkmark} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Filter Modal - Full Screen */}
      <Modal
        visible={showFilterModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={[
          styles.fullScreenModalContainer,
          isDarkMode && styles.fullScreenModalContainerDark
        ]}>
          <View style={styles.modalHeader}>
            <Text style={[
              styles.modalTitle,
              isDarkMode && styles.modalTitleDark
            ]}>Filter Events</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Text style={styles.modalCloseButton}>Close</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={[1]} // Dummy data to render once
            keyExtractor={() => "filters"}
            renderItem={() => (
              <>
                <View style={styles.filterSection}>
                  <Text style={[
                    styles.filterSectionTitle,
                    isDarkMode && styles.filterSectionTitleDark
                  ]}>Event Type</Text>
                  
                  <View style={styles.filterChipsContainer}>
                    {eventCategories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.filterChip,
                          filterSettings.category === category.id && styles.filterChipSelected
                        ]}
                        onPress={() => setFilterSettings(prev => ({
                          ...prev,
                          category: category.id,
                          saved: false // Unselect saved when selecting a category
                        }))}
                      >
                        <Text style={[
                          styles.filterChipText,
                          isDarkMode && styles.filterChipTextDark,
                          filterSettings.category === category.id && styles.filterChipTextSelected
                        ]}>
                          {category.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                <View style={styles.filterSection}>
                  <Text style={[
                    styles.filterSectionTitle,
                    isDarkMode && styles.filterSectionTitleDark
                  ]}>Saved Events</Text>
                  
                  <TouchableOpacity
                    style={[
                      styles.savedFilterButton,
                      filterSettings.saved && styles.savedFilterButtonSelected
                    ]}
                    onPress={() => setFilterSettings(prev => ({
                      ...prev,
                      saved: !prev.saved,
                      category: 'all' // Reset category when toggling saved
                    }))}
                  >
                    <Text style={[
                      styles.savedFilterButtonText,
                      isDarkMode && styles.savedFilterButtonTextDark,
                      filterSettings.saved && styles.savedFilterButtonTextSelected
                    ]}>
                      Show only saved events
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.filterSection}>
                  <Text style={[
                    styles.filterSectionTitle,
                    isDarkMode && styles.filterSectionTitleDark
                  ]}>Language</Text>
                  
                  <View style={styles.filterChipsContainer}>
                    {languages.map((language) => (
                      <TouchableOpacity
                        key={language}
                        style={[
                          styles.filterChip,
                          filterSettings.language === language && styles.filterChipSelected
                        ]}
                        onPress={() => setFilterSettings(prev => ({
                          ...prev,
                          language
                        }))}
                      >
                        <Text style={[
                          styles.filterChipText,
                          isDarkMode && styles.filterChipTextDark,
                          filterSettings.language === language && styles.filterChipTextSelected
                        ]}>
                          {language}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                <View style={styles.filterSection}>
                  <Text style={[
                    styles.filterSectionTitle,
                    isDarkMode && styles.filterSectionTitleDark
                  ]}>Denomination</Text>
                  
                  <View style={styles.filterChipsContainer}>
                    {denominations.map((denomination) => (
                      <TouchableOpacity
                        key={denomination}
                        style={[
                          styles.filterChip,
                          filterSettings.denomination === denomination && styles.filterChipSelected
                        ]}
                        onPress={() => setFilterSettings(prev => ({
                          ...prev,
                          denomination
                        }))}
                      >
                        <Text style={[
                          styles.filterChipText,
                          isDarkMode && styles.filterChipTextDark,
                          filterSettings.denomination === denomination && styles.filterChipTextSelected
                        ]}>
                          {denomination}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                <View style={styles.filterSection}>
                  <Text style={[
                    styles.filterSectionTitle,
                    isDarkMode && styles.filterSectionTitleDark
                  ]}>Proximity (km)</Text>
                  
                  <View style={styles.proximityContainer}>
                    <TextInput
                      style={[
                        styles.proximityInput,
                        isDarkMode && styles.proximityInputDark
                      ]}
                      keyboardType="numeric"
                      value={filterSettings.proximity.toString()}
                      onChangeText={(text) => setFilterSettings(prev => ({
                        ...prev,
                        proximity: parseInt(text) || 10
                      }))}
                    />
                    <Text style={[
                      styles.proximityLabel,
                      isDarkMode && styles.proximityLabelDark
                    ]}>
                      km
                    </Text>
                  </View>
                </View>
              </>
            )}
            ListFooterComponent={
              <View style={styles.filterButtons}>
                <TouchableOpacity 
                  style={styles.resetButton} 
                  onPress={() => setFilterSettings({
                    category: 'all',
                    saved: false,
                    language: 'All',
                    denomination: 'All',
                    proximity: 10
                  })}
                >
                  <Text style={styles.buttonText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.applyButton} 
                  onPress={() => setShowFilterModal(false)}
                >
                  <Text style={styles.buttonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </View>
      </Modal>

      {/* Date Picker for Custom Date */}
      {showDatePicker && (
        <Modal
          transparent={true}
          visible={showDatePicker}
          animationType="fade"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.datePickerModalOverlay}>
            <View style={[
              styles.datePickerContainer,
              isDarkMode && styles.datePickerContainerDark
            ]}>
              <View style={styles.datePickerHeader}>
                <Text style={[
                  styles.datePickerTitle,
                  isDarkMode && styles.datePickerTitleDark
                ]}>
                  Select Date
                </Text>
              </View>
              
              {Platform.OS === 'ios' ? (
                <DateTimePicker
                  value={customDate}
                  mode="date"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      setCustomDate(selectedDate);
                    }
                  }}
                  style={styles.datePicker}
                />
              ) : (
                <DateTimePicker
                  value={customDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setCustomDate(selectedDate);
                    }
                  }}
                />
              )}
              
              {Platform.OS === 'ios' && (
                <View style={styles.datePickerButtons}>
                  <TouchableOpacity
                    style={styles.datePickerCancelButton}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.datePickerButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.datePickerConfirmButton}
                    onPress={() => {
                      setShowDatePicker(false);
                      setShowTimeFilterModal(false);
                    }}
                  >
                    <Text style={styles.datePickerButtonText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  containerDark: {
    backgroundColor: '#121212',
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
    flex: 1,
    gap: 6,
  },
  filterButtonDark: {
    backgroundColor: '#2a2a2a',
  },
  filterButtonText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  filterButtonTextDark: {
    color: Colors.white,
  },
  activeFilterText: {
    color: Colors.primary,
    fontWeight: '600',
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
    height: 400, // Fixed height
  },
  modalContentDark: {
    backgroundColor: '#1e1e1e',
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
  modalTitleDark: {
    color: Colors.white,
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
  timeFilterOptionTextDark: {
    color: Colors.white,
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
  fullScreenModalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  fullScreenModalContainerDark: {
    backgroundColor: '#121212',
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  filterSectionTitleDark: {
    color: Colors.white,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.card,
    marginBottom: 8,
  },
  filterChipSelected: {
    backgroundColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: Colors.text,
  },
  filterChipTextDark: {
    color: Colors.white,
  },
  filterChipTextSelected: {
    color: Colors.white,
  },
  savedFilterButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.card,
    alignItems: 'center',
  },
  savedFilterButtonSelected: {
    backgroundColor: Colors.primary,
  },
  savedFilterButtonText: {
    fontSize: 14,
    color: Colors.text,
  },
  savedFilterButtonTextDark: {
    color: Colors.white,
  },
  savedFilterButtonTextSelected: {
    color: Colors.white,
  },
  proximityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  proximityInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 80,
    fontSize: 16,
    color: Colors.text,
  },
  proximityInputDark: {
    borderColor: '#333333',
    color: Colors.white,
    backgroundColor: '#2a2a2a',
  },
  proximityLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.text,
  },
  proximityLabelDark: {
    color: Colors.white,
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 30,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  applyButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  datePickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    width: '80%',
  },
  datePickerContainerDark: {
    backgroundColor: '#1e1e1e',
  },
  datePickerHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  datePickerTitleDark: {
    color: Colors.white,
  },
  datePicker: {
    width: '100%',
  },
  datePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  datePickerCancelButton: {
    backgroundColor: '#f44336',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  datePickerConfirmButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  datePickerButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
});