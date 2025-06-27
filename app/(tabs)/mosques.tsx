import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal } from 'react-native';
import { MapPin, Sliders, Heart } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { globalStyles } from '@/constants/theme';
import MosqueCard from '@/components/MosqueCard';
import SearchBar from '@/components/SearchBar';
import FilterChip from '@/components/FilterChip';
import LoadingIndicator from '@/components/LoadingIndicator';
import EmptyState from '@/components/EmptyState';
import LocationSelector from '@/components/LocationSelector';
import useLocation from '@/hooks/useLocation';
import useMosques from '@/hooks/useMosques';
import useThemeStore from '@/hooks/useThemeStore';
import { Mosque } from '@/mocks/mosques';

export default function MosquesScreen() {
  const { location, locationName, loading: locationLoading } = useLocation();
  const { 
    allMosques, 
    nearbyMosques, 
    favoriteMosques,
    loading: mosquesLoading 
  } = useMosques(
    location?.coords.latitude,
    location?.coords.longitude,
    10
  );
  const { isDarkMode } = useThemeStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMosques, setFilteredMosques] = useState(allMosques);
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [customLocation, setCustomLocation] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Filter settings
  const [filterSettings, setFilterSettings] = useState({
    denomination: '',
    language: '',
  });

  const denominations = ['All', 'Sunni', 'Shia'];
  const languages = ['All', 'English', 'Arabic', 'Urdu', 'Farsi', 'Turkish'];

  useEffect(() => {
    let mosques = showFavoritesOnly ? favoriteMosques : allMosques;
    
    // Apply denomination filter
    if (filterSettings.denomination && filterSettings.denomination !== 'All') {
      mosques = mosques.filter(mosque => mosque.denomination === filterSettings.denomination);
    }
    
    // Apply language filter (if we had language data in the mosque objects)
    // This is a placeholder for when language data is available
    if (filterSettings.language && filterSettings.language !== 'All') {
      // mosques = mosques.filter(mosque => mosque.languages?.includes(filterSettings.language));
    }
    
    // Apply search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      mosques = mosques.filter(mosque => 
        mosque.name.toLowerCase().includes(query) || 
        mosque.address.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    if (sortBy === 'distance' && location) {
      mosques = [...mosques].sort((a, b) => {
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
    }
    
    setFilteredMosques(mosques);
  }, [searchQuery, allMosques, favoriteMosques, filterSettings, sortBy, location, showFavoritesOnly]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
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

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleLocationSelect = (location) => {
    setCustomLocation(location);
    // In a real app, this would trigger a location-based search
  };

  const toggleFavoritesFilter = () => {
    setShowFavoritesOnly(!showFavoritesOnly);
  };

  const isLoading = locationLoading || mosquesLoading;

  const renderMosqueItem = ({ item }: { item: Mosque }) => (
    <MosqueCard mosque={item} />
  );

  return (
    <View style={[
      styles.container,
      isDarkMode && styles.containerDark
    ]}>
      {/* Location Header */}
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
          placeholder="Search mosques by name or address"
          onClear={clearSearch}
        />
        
        <View style={styles.filterButtonsContainer}>
          <TouchableOpacity 
            style={[
              styles.filterButton,
              isDarkMode && styles.filterButtonDark,
              showFavoritesOnly && styles.activeFilterButton
            ]}
            onPress={toggleFavoritesFilter}
          >
            <Heart 
              size={18} 
              color={showFavoritesOnly ? Colors.error : isDarkMode ? Colors.white : Colors.text} 
              fill={showFavoritesOnly ? Colors.error : 'none'} 
            />
            <Text style={[
              styles.filterButtonText,
              isDarkMode && styles.filterButtonTextDark,
              showFavoritesOnly && styles.activeFilterText
            ]}>Favorites</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterButton,
              isDarkMode && styles.filterButtonDark
            ]}
            onPress={() => setShowSortModal(true)}
          >
            <Text style={[
              styles.filterButtonText,
              isDarkMode && styles.filterButtonTextDark,
              sortBy === 'distance' && styles.activeFilterText
            ]}>Sort: {sortBy === 'distance' ? 'Distance' : 'Relevance'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterButton,
              isDarkMode && styles.filterButtonDark
            ]}
            onPress={() => setShowFilterModal(true)}
          >
            <Sliders size={18} color={isDarkMode ? Colors.white : Colors.text} />
            <Text style={[
              styles.filterButtonText,
              isDarkMode && styles.filterButtonTextDark
            ]}>Filter</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <LoadingIndicator message="Finding mosques..." />
      ) : (
        <FlatList
          data={filteredMosques}
          renderItem={renderMosqueItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              title={showFavoritesOnly ? "No Favorite Mosques" : "No Mosques Found"}
              message={
                showFavoritesOnly
                  ? "You haven't added any mosques to your favorites yet."
                  : searchQuery
                    ? "We couldn't find any mosques matching your search."
                    : "We couldn't find any mosques near your current location."
              }
            />
          }
        />
      )}

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSortModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.sortModalContent,
            isDarkMode && styles.modalContentDark
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[
                styles.modalTitle,
                isDarkMode && styles.modalTitleDark
              ]}>Sort By</Text>
            </View>
            
            <TouchableOpacity
              style={[
                styles.sortOption,
                sortBy === 'relevance' && styles.selectedSortOption
              ]}
              onPress={() => {
                setSortBy('relevance');
                setShowSortModal(false);
              }}
            >
              <Text style={[
                styles.sortOptionText,
                isDarkMode && styles.sortOptionTextDark,
                sortBy === 'relevance' && styles.selectedSortOptionText
              ]}>
                Relevance
              </Text>
              {sortBy === 'relevance' && (
                <View style={styles.selectedIndicator} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.sortOption,
                sortBy === 'distance' && styles.selectedSortOption
              ]}
              onPress={() => {
                setSortBy('distance');
                setShowSortModal(false);
              }}
            >
              <Text style={[
                styles.sortOptionText,
                isDarkMode && styles.sortOptionTextDark,
                sortBy === 'distance' && styles.selectedSortOptionText
              ]}>
                Distance
              </Text>
              {sortBy === 'distance' && (
                <View style={styles.selectedIndicator} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowSortModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
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
              ]}>Filter Mosques</Text>
            </View>
            
            {/* Denomination Filter */}
            <View style={styles.filterSection}>
              <Text style={[
                styles.filterSectionTitle,
                isDarkMode && styles.filterSectionTitleDark
              ]}>Denomination</Text>
              <View style={styles.filterChipsContainer}>
                {denominations.map(denomination => (
                  <FilterChip
                    key={denomination}
                    label={denomination}
                    selected={filterSettings.denomination === denomination}
                    onPress={() => setFilterSettings(prev => ({
                      ...prev,
                      denomination: prev.denomination === denomination ? '' : denomination
                    }))}
                  />
                ))}
              </View>
            </View>
            
            {/* Language Filter */}
            <View style={styles.filterSection}>
              <Text style={[
                styles.filterSectionTitle,
                isDarkMode && styles.filterSectionTitleDark
              ]}>Language</Text>
              <View style={styles.filterChipsContainer}>
                {languages.map(language => (
                  <FilterChip
                    key={language}
                    label={language}
                    selected={filterSettings.language === language}
                    onPress={() => setFilterSettings(prev => ({
                      ...prev,
                      language: prev.language === language ? '' : language
                    }))}
                  />
                ))}
              </View>
            </View>
            
            <View style={styles.filterButtons}>
              <TouchableOpacity 
                style={styles.resetButton} 
                onPress={() => setFilterSettings({ denomination: '', language: '' })}
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
          </View>
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
  containerDark: {
    backgroundColor: '#121212',
  },
  locationContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
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
  },
  filterButtonDark: {
    backgroundColor: '#2a2a2a',
  },
  activeFilterButton: {
    backgroundColor: Colors.primaryLight,
  },
  filterButtonText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 6,
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
    padding: 20,
    height: '80%',
  },
  sortModalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalContentDark: {
    backgroundColor: '#1E1E1E',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  modalTitleDark: {
    color: Colors.white,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
  },
  filterSectionTitleDark: {
    color: Colors.white,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
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
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  selectedSortOption: {
    backgroundColor: Colors.primaryLight,
  },
  sortOptionText: {
    fontSize: 16,
    color: Colors.text,
  },
  sortOptionTextDark: {
    color: Colors.white,
  },
  selectedSortOptionText: {
    fontWeight: '600',
    color: Colors.primary,
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  cancelButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: Colors.card,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 16,
  },
});