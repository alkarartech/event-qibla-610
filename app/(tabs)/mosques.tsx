import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal } from 'react-native';
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
import useThemeStore from '@/hooks/useThemeStore';

export default function MosquesScreen() {
  const { location, locationName, loading: locationLoading } = useLocation();
  const { allMosques, nearbyMosques, loading: mosquesLoading } = useMosques(
    location?.coords.latitude,
    location?.coords.longitude,
    10
  );
  const { isDarkMode } = useThemeStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMosques, setFilteredMosques] = useState(allMosques);
  const [selectedFilter, setSelectedFilter] = useState('nearby');
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // Filter settings
  const [filterSettings, setFilterSettings] = useState({
    denomination: '',
    language: '',
  });

  const denominations = ['All', 'Sunni', 'Shia'];
  const languages = ['All', 'English', 'Arabic', 'Urdu', 'Farsi', 'Turkish'];

  useEffect(() => {
    if (selectedFilter === 'nearby' && nearbyMosques.length > 0) {
      setFilteredMosques(nearbyMosques);
    } else {
      setFilteredMosques(allMosques);
    }
  }, [selectedFilter, nearbyMosques, allMosques]);

  useEffect(() => {
    let mosques = selectedFilter === 'nearby' && nearbyMosques.length > 0 
      ? nearbyMosques 
      : allMosques;
    
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
    
    setFilteredMosques(mosques);
  }, [searchQuery, selectedFilter, nearbyMosques, allMosques, filterSettings]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  const isLoading = locationLoading || mosquesLoading;

  return (
    <View style={[
      styles.container,
      isDarkMode && styles.containerDark
    ]}>
      {/* Location Header */}
      <View style={styles.locationContainer}>
        <MapPin size={20} color={Colors.primary} />
        <Text style={[
          styles.locationText,
          isDarkMode && styles.locationTextDark
        ]}>
          {locationLoading ? 'Getting your location...' : locationName}
        </Text>
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
              isDarkMode && styles.filterButtonDark
            ]}
            onPress={() => setSelectedFilter('nearby')}
          >
            <MapPin size={18} color={isDarkMode ? Colors.white : Colors.text} />
            <Text style={[
              styles.filterButtonText,
              isDarkMode && styles.filterButtonTextDark,
              selectedFilter === 'nearby' && styles.activeFilterText
            ]}>Nearby</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterButton,
              isDarkMode && styles.filterButtonDark
            ]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={[
              styles.filterButtonText,
              isDarkMode && styles.filterButtonTextDark,
              selectedFilter === 'all' && styles.activeFilterText
            ]}>All Mosques</Text>
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
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Text style={styles.modalCloseButton}>Close</Text>
              </TouchableOpacity>
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
  locationTextDark: {
    color: '#AAAAAA',
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
  filterButtonDark: {
    backgroundColor: '#2a2a2a',
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
  },
  modalContentDark: {
    backgroundColor: '#1E1E1E',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
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
});