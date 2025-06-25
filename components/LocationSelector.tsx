import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, FlatList, Keyboard } from 'react-native';
import { MapPin, ChevronDown, X, Search } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface LocationSelectorProps {
  currentLocation: string;
  onLocationSelect: (location: string) => void;
}

// List of cities with coordinates
const cities = [
  { name: 'Birmingham, Alabama', lat: 33.5207, lon: -86.8025 },
  { name: 'Anchorage, Alaska', lat: 61.2181, lon: -149.9003 },
  { name: 'Phoenix, Arizona', lat: 33.4484, lon: -112.0740 },
  { name: 'Little Rock, Arkansas', lat: 34.7465, lon: -92.2896 },
  { name: 'Los Angeles, California', lat: 34.0522, lon: -118.2437 },
  { name: 'Denver, Colorado', lat: 39.7392, lon: -104.9903 },
  { name: 'Hartford, Connecticut', lat: 41.7658, lon: -72.6734 },
  { name: 'Wilmington, Delaware', lat: 39.7459, lon: -75.5466 },
  { name: 'Miami, Florida', lat: 25.7617, lon: -80.1918 },
  { name: 'Atlanta, Georgia', lat: 33.7490, lon: -84.3880 },
  { name: 'Honolulu, Hawaii', lat: 21.3069, lon: -157.8583 },
  { name: 'Boise, Idaho', lat: 43.6150, lon: -116.2023 },
  { name: 'Chicago, Illinois', lat: 41.8781, lon: -87.6298 },
  { name: 'Indianapolis, Indiana', lat: 39.7684, lon: -86.1581 },
  { name: 'Des Moines, Iowa', lat: 41.5868, lon: -93.6250 },
  { name: 'Wichita, Kansas', lat: 37.6872, lon: -97.3301 },
  { name: 'Louisville, Kentucky', lat: 38.2527, lon: -85.7585 },
  { name: 'New Orleans, Louisiana', lat: 29.9511, lon: -90.0715 },
  { name: 'Portland, Maine', lat: 43.6591, lon: -70.2568 },
  { name: 'Baltimore, Maryland', lat: 39.2904, lon: -76.6122 },
  { name: 'Boston, Massachusetts', lat: 42.3601, lon: -71.0589 },
  { name: 'Detroit, Michigan', lat: 42.3314, lon: -83.0458 },
  { name: 'Minneapolis, Minnesota', lat: 44.9778, lon: -93.2650 },
  { name: 'Jackson, Mississippi', lat: 32.2988, lon: -90.1848 },
  { name: 'St. Louis, Missouri', lat: 38.6270, lon: -90.1994 },
  { name: 'Billings, Montana', lat: 45.7833, lon: -108.5007 },
  { name: 'Omaha, Nebraska', lat: 41.2565, lon: -95.9345 },
  { name: 'Las Vegas, Nevada', lat: 36.1699, lon: -115.1398 },
  { name: 'Manchester, New Hampshire', lat: 42.9956, lon: -71.4548 },
  { name: 'Newark, New Jersey', lat: 40.7357, lon: -74.1724 },
  { name: 'Albuquerque, New Mexico', lat: 35.0844, lon: -106.6504 },
  { name: 'New York City, New York', lat: 40.7128, lon: -74.0060 },
  { name: 'Charlotte, North Carolina', lat: 35.2271, lon: -80.8431 },
  { name: 'Fargo, North Dakota', lat: 46.8772, lon: -96.7898 },
  { name: 'Columbus, Ohio', lat: 39.9612, lon: -82.9988 },
  { name: 'Oklahoma City, Oklahoma', lat: 35.4676, lon: -97.5164 },
  { name: 'Portland, Oregon', lat: 45.5152, lon: -122.6784 },
  { name: 'Philadelphia, Pennsylvania', lat: 39.9526, lon: -75.1652 },
  { name: 'Pittsburgh, Pennsylvania', lat: 40.4387, lon: -75.1652 },
  { name: 'Providence, Rhode Island', lat: 40.440624, lon: -79.9972 },
  { name: 'Columbia, South Carolina', lat: 34.0007, lon: -81.0348 },
  { name: 'Sioux Falls, South Dakota', lat: 43.5446, lon: -96.7311 },
  { name: 'Nashville, Tennessee', lat: 36.1627, lon: -86.7816 },
  { name: 'Houston, Texas', lat: 29.7604, lon: -95.3698 },
  { name: 'Salt Lake City, Utah', lat: 40.7608, lon: -111.8910 },
  { name: 'Burlington, Vermont', lat: 44.4759, lon: -73.2121 },
  { name: 'Richmond, Virginia', lat: 37.5407, lon: -77.4360 },
  { name: 'Seattle, Washington', lat: 47.6062, lon: -122.3321 },
  { name: 'Charleston, West Virginia', lat: 38.3498, lon: -81.6326 },
  { name: 'Milwaukee, Wisconsin', lat: 43.0389, lon: -87.9065 },
  { name: 'Cheyenne, Wyoming', lat: 41.1400, lon: -104.8202 },
  { name: 'London, United Kingdom', lat: 51.5074, lon: -0.1278 },
  { name: 'Paris, France', lat: 48.8566, lon: 2.3522 },
  { name: 'Berlin, Germany', lat: 52.5200, lon: 13.4050 },
  { name: 'Rome, Italy', lat: 41.9028, lon: 12.4964 },
  { name: 'Madrid, Spain', lat: 40.4168, lon: -3.7038 },
  { name: 'Cairo, Egypt', lat: 30.0444, lon: 31.2357 },
  { name: 'Istanbul, Turkey', lat: 41.0082, lon: 28.9784 },
  { name: 'Dubai, United Arab Emirates', lat: 25.2048, lon: 55.2708 },
  { name: 'Riyadh, Saudi Arabia', lat: 24.7136, lon: 46.6753 },
  { name: 'Mecca, Saudi Arabia', lat: 21.4225, lon: 39.8262 },
  { name: 'Medina, Saudi Arabia', lat: 24.5247, lon: 39.5692 },
  { name: 'Kuala Lumpur, Malaysia', lat: 3.1390, lon: 101.6869 },
  { name: 'Jakarta, Indonesia', lat: -6.2088, lon: 106.8456 },
  { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503 },
  { name: 'Beijing, China', lat: 39.9042, lon: 116.4074 },
  { name: 'New Delhi, India', lat: 28.6139, lon: 77.2090 },
  { name: 'Islamabad, Pakistan', lat: 33.6844, lon: 73.0479 },
  { name: 'Karachi, Pakistan', lat: 24.8607, lon: 67.0011 },
  { name: 'Tehran, Iran', lat: 35.6892, lon: 51.3890 },
  { name: 'Baghdad, Iraq', lat: 33.3152, lon: 44.3661 },
  { name: 'Damascus, Syria', lat: 33.5138, lon: 36.2765 },
  { name: 'Amman, Jordan', lat: 31.9539, lon: 35.9106 },
  { name: 'Beirut, Lebanon', lat: 33.8938, lon: 35.5018 },
  { name: 'Jerusalem, Israel', lat: 31.7683, lon: 35.2137 },
  { name: 'Toronto, Canada', lat: 43.6532, lon: -79.3832 },
  { name: 'Montreal, Canada', lat: 45.5017, lon: -73.5673 },
  { name: 'Vancouver, Canada', lat: 49.2827, lon: -123.1207 },
  { name: 'Mexico City, Mexico', lat: 19.4326, lon: -99.1332 },
  { name: 'São Paulo, Brazil', lat: -23.5505, lon: -46.6333 },
  { name: 'Buenos Aires, Argentina', lat: -34.6037, lon: -58.3816 },
  { name: 'Sydney, Australia', lat: -33.8688, lon: 151.2093 },
  { name: 'Melbourne, Australia', lat: -37.8136, lon: 144.9631 },
  { name: 'Auckland, New Zealand', lat: -36.8509, lon: 174.7645 },
  { name: 'Lagos, Nigeria', lat: 6.5244, lon: 3.3792 },
  { name: 'Nairobi, Kenya', lat: -1.2921, lon: 36.8219 },
  { name: 'Cape Town, South Africa', lat: -33.9249, lon: 18.4241 },
  { name: 'Johannesburg, South Africa', lat: -26.2041, lon: 28.0473 },
];

export default function LocationSelector({ currentLocation, onLocationSelect }: LocationSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof cities>([]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults(cities);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = cities.filter(city => 
      city.name.toLowerCase().includes(query)
    );
    
    setSearchResults(results);
  }, [searchQuery]);

  const handleLocationSelect = (location: string) => {
    onLocationSelect(location);
    setModalVisible(false);
    setSearchQuery('');
  };

  const handleCurrentLocationSelect = () => {
    // This would typically use the device's location services
    onLocationSelect('Current Location');
    setModalVisible(false);
    setSearchQuery('');
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.locationSelector} 
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <MapPin size={20} color={Colors.primary} />
        <Text style={styles.locationText}>{currentLocation}</Text>
        <ChevronDown size={16} color={Colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={() => {
              Keyboard.dismiss();
              setModalVisible(false);
            }}
          >
            <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Location</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.searchContainer}>
                <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search city, state, or country"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <X size={18} color={Colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity 
                style={styles.currentLocationButton}
                onPress={handleCurrentLocationSelect}
              >
                <MapPin size={20} color={Colors.primary} />
                <Text style={styles.currentLocationText}>Use current location</Text>
              </TouchableOpacity>

              <Text style={styles.sectionTitle}>
                {searchQuery ? 'Search Results' : 'Popular Cities'}
              </Text>

              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.name}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.locationItem}
                    onPress={() => handleLocationSelect(item.name)}
                  >
                    <MapPin size={18} color={Colors.textSecondary} />
                    <Text style={styles.locationItemText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No locations found</Text>
                }
              />
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  locationText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginHorizontal: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalOverlayTouchable: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 30,
    height: 500, // Fixed height for the modal
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 16,
  },
  currentLocationText: {
    fontSize: 16,
    color: Colors.primary,
    marginLeft: 8,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  locationItemText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 16,
  },
});