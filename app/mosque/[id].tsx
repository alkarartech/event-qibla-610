import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MapPin, Phone, Globe, Clock, Calendar, ChevronRight, DollarSign, Heart } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { globalStyles } from '@/constants/theme';
import PrayerTimesCard from '@/components/PrayerTimesCard';
import EventCard from '@/components/EventCard';
import LoadingIndicator from '@/components/LoadingIndicator';
import EmptyState from '@/components/EmptyState';
import { DonationModal } from '@/components/DonationModal';
import useMosques from '@/hooks/useMosques';
import useEvents from '@/hooks/useEvents';
import { getPrayerTimes } from '@/utils/prayerTimes';
import useThemeStore from '@/hooks/useThemeStore';

export default function MosqueDetailScreen() {
  const { id } = useLocalSearchParams();
  const { getMosqueById, loading: mosquesLoading, isMosqueFavorite, toggleFavoriteMosque } = useMosques();
  const { getEventsByMosqueId, loading: eventsLoading } = useEvents();
  const { isDarkMode, use24HourFormat } = useThemeStore();
  const [showDonationModal, setShowDonationModal] = useState(false);

  const mosque = getMosqueById(id as string);
  const mosqueEvents = mosque ? getEventsByMosqueId(mosque.id) : [];
  const isFavorite = mosque ? isMosqueFavorite(mosque.id) : false;

  const isLoading = mosquesLoading || eventsLoading;

  // Calculate prayer times based on mosque location and denomination
  const calculatedPrayerTimes = mosque ? 
    getPrayerTimes(mosque.latitude, mosque.longitude, mosque.denomination) : null;

  const handlePhonePress = () => {
    if (mosque?.phone) {
      Linking.openURL(`tel:${mosque.phone}`);
    }
  };

  const handleWebsitePress = () => {
    if (mosque?.website) {
      Linking.openURL(`https://${mosque.website}`);
    }
  };

  const handleDirectionsPress = () => {
    if (mosque) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${mosque.latitude},${mosque.longitude}`;
      Linking.openURL(url);
    }
  };

  const handleDonatePress = () => {
    if (mosque?.donationEnabled && mosque?.stripePublishableKey) {
      setShowDonationModal(true);
    } else if (mosque?.website) {
      // Fallback to website donation page
      Linking.openURL(`https://${mosque.website}/donate`);
    } else {
      // Generic donation page
      Linking.openURL('https://kamal-aldeen.com/donate');
    }
  };

  const handleFavoriteToggle = () => {
    if (mosque) {
      toggleFavoriteMosque(mosque.id);
    }
  };

  if (isLoading) {
    return <LoadingIndicator fullScreen message="Loading mosque details..." />;
  }

  if (!mosque) {
    return (
      <EmptyState
        title="Mosque Not Found"
        message="We couldn't find the mosque you're looking for."
      />
    );
  }

  // Format prayer times based on user preference
  const formatPrayerTimes = (prayerTimes: any) => {
    if (!prayerTimes) return prayerTimes;
    
    const formattedTimes = { ...prayerTimes };
    
    if (use24HourFormat) {
      // Convert to 24-hour format
      for (const prayer in formattedTimes) {
        if (prayer === 'jummah') continue; // Skip jummah as it's handled separately
        
        const timeStr = formattedTimes[prayer];
        if (timeStr.includes('AM') || timeStr.includes('PM')) {
          const [timePart, period] = timeStr.split(' ');
          const [hours, minutes] = timePart.split(':').map(Number);
          
          let hour24 = hours;
          if (period === 'PM' && hours < 12) hour24 += 12;
          if (period === 'AM' && hours === 12) hour24 = 0;
          
          formattedTimes[prayer] = `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
      }
    } else {
      // Convert to 12-hour format
      for (const prayer in formattedTimes) {
        if (prayer === 'jummah') continue; // Skip jummah as it's handled separately
        
        const timeStr = formattedTimes[prayer];
        if (!timeStr.includes('AM') && !timeStr.includes('PM')) {
          const [hours, minutes] = timeStr.split(':').map(Number);
          const period = hours >= 12 ? 'PM' : 'AM';
          const hour12 = hours % 12 || 12;
          
          formattedTimes[prayer] = `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
        }
      }
    }
    
    return formattedTimes;
  };

  const formattedCalculatedPrayerTimes = calculatedPrayerTimes ? 
    formatPrayerTimes(calculatedPrayerTimes) : null;

  const formattedStoredPrayerTimes = mosque.prayer_times ? 
    formatPrayerTimes(mosque.prayer_times) : null;

  return (
    <ScrollView 
      style={[
        styles.container,
        isDarkMode && styles.containerDark
      ]} 
      showsVerticalScrollIndicator={false}
    >
      {mosque.image && (
        <Image 
          source={{ uri: mosque.image }} 
          style={styles.image} 
          resizeMode="cover"
        />
      )}

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[
            styles.name,
            isDarkMode && styles.nameDark
          ]}>{mosque.name}</Text>
          
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={handleFavoriteToggle}
          >
            <Heart 
              size={24} 
              color={isFavorite ? Colors.error : isDarkMode ? Colors.white : Colors.textSecondary} 
              fill={isFavorite ? Colors.error : 'none'} 
            />
          </TouchableOpacity>
        </View>
        
        {mosque.denomination && (
          <View style={styles.denominationTag}>
            <Text style={styles.denominationText}>{mosque.denomination}</Text>
          </View>
        )}
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <MapPin size={20} color={Colors.primary} />
            <Text style={[
              styles.detailText,
              isDarkMode && styles.detailTextDark
            ]}>{mosque.address}</Text>
          </View>
          
          {mosque.phone && (
            <TouchableOpacity style={styles.detailRow} onPress={handlePhonePress}>
              <Phone size={20} color={Colors.primary} />
              <Text style={[
                styles.detailText,
                styles.link,
                isDarkMode && styles.linkDark
              ]}>{mosque.phone}</Text>
            </TouchableOpacity>
          )}
          
          {mosque.website && (
            <TouchableOpacity style={styles.detailRow} onPress={handleWebsitePress}>
              <Globe size={20} color={Colors.primary} />
              <Text style={[
                styles.detailText,
                styles.link,
                isDarkMode && styles.linkDark
              ]}>{mosque.website}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, globalStyles.shadow]} 
            onPress={handleDirectionsPress}
          >
            <Text style={styles.actionButtonText}>Get Directions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.donateButton, globalStyles.shadow]} 
            onPress={handleDonatePress}
          >
            <DollarSign size={20} color={Colors.white} style={styles.donateIcon} />
            <Text style={styles.donateButtonText}>Donate</Text>
          </TouchableOpacity>
        </View>

        {/* Display calculated prayer times if available, otherwise use stored ones */}
        {formattedCalculatedPrayerTimes ? (
          <View style={[
            styles.prayerTimesCard, 
            globalStyles.shadow,
            isDarkMode && styles.prayerTimesCardDark
          ]}>
            <Text style={[
              styles.cardTitle,
              isDarkMode && styles.cardTitleDark
            ]}>Prayer Times (Calculated)</Text>
            <Text style={[
              styles.calculationMethod,
              isDarkMode && styles.calculationMethodDark
            ]}>
              Using {mosque.denomination === 'Shia' ? 'Jafari' : 'MWL'} calculation method
            </Text>
            <View style={styles.prayerTimesGrid}>
              <View style={[
                styles.prayerTimeItem,
                isDarkMode && styles.prayerTimeItemDark
              ]}>
                <Text style={[
                  styles.prayerName,
                  isDarkMode && styles.prayerNameDark
                ]}>Fajr</Text>
                <Text style={styles.prayerTime}>{formattedCalculatedPrayerTimes.fajr}</Text>
              </View>
              <View style={[
                styles.prayerTimeItem,
                isDarkMode && styles.prayerTimeItemDark
              ]}>
                <Text style={[
                  styles.prayerName,
                  isDarkMode && styles.prayerNameDark
                ]}>Dhuhr</Text>
                <Text style={styles.prayerTime}>{formattedCalculatedPrayerTimes.dhuhr}</Text>
              </View>
              <View style={[
                styles.prayerTimeItem,
                isDarkMode && styles.prayerTimeItemDark
              ]}>
                <Text style={[
                  styles.prayerName,
                  isDarkMode && styles.prayerNameDark
                ]}>Asr</Text>
                <Text style={styles.prayerTime}>{formattedCalculatedPrayerTimes.asr}</Text>
              </View>
              <View style={[
                styles.prayerTimeItem,
                isDarkMode && styles.prayerTimeItemDark
              ]}>
                <Text style={[
                  styles.prayerName,
                  isDarkMode && styles.prayerNameDark
                ]}>Maghrib</Text>
                <Text style={styles.prayerTime}>{formattedCalculatedPrayerTimes.maghrib}</Text>
              </View>
              <View style={[
                styles.prayerTimeItem,
                isDarkMode && styles.prayerTimeItemDark
              ]}>
                <Text style={[
                  styles.prayerName,
                  isDarkMode && styles.prayerNameDark
                ]}>Isha</Text>
                <Text style={styles.prayerTime}>{formattedCalculatedPrayerTimes.isha}</Text>
              </View>
              {mosque.prayer_times?.jummah && (
                <View style={[
                  styles.prayerTimeItem,
                  isDarkMode && styles.prayerTimeItemDark
                ]}>
                  <Text style={[
                    styles.prayerName,
                    isDarkMode && styles.prayerNameDark
                  ]}>Jummah</Text>
                  <Text style={styles.prayerTime}>{mosque.prayer_times.jummah}</Text>
                </View>
              )}
            </View>
          </View>
        ) : formattedStoredPrayerTimes && (
          <PrayerTimesCard prayerTimes={formattedStoredPrayerTimes} />
        )}

        {mosque.facilities && mosque.facilities.length > 0 && (
          <View style={[
            styles.facilitiesCard, 
            globalStyles.shadow,
            isDarkMode && styles.facilitiesCardDark
          ]}>
            <Text style={[
              styles.cardTitle,
              isDarkMode && styles.cardTitleDark
            ]}>Facilities</Text>
            <View style={styles.facilitiesContainer}>
              {mosque.facilities.map((facility, index) => (
                <View key={index} style={[
                  styles.facilityItem,
                  isDarkMode && styles.facilityItemDark
                ]}>
                  <Text style={[
                    styles.facilityText,
                    isDarkMode && styles.facilityTextDark
                  ]}>{facility}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {mosqueEvents.length > 0 && (
          <View style={styles.eventsSection}>
            <View style={styles.sectionHeader}>
              <Text style={[
                styles.sectionTitle,
                isDarkMode && styles.sectionTitleDark
              ]}>Upcoming Events</Text>
            </View>
            
            {mosqueEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </View>
        )}
      </View>
      
      <DonationModal
        visible={showDonationModal}
        onClose={() => setShowDonationModal(false)}
        mosqueName={mosque.name}
        stripePublishableKey={mosque.stripePublishableKey}
      />
    </ScrollView>
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
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    flex: 1,
  },
  nameDark: {
    color: Colors.white,
  },
  favoriteButton: {
    padding: 8,
  },
  denominationTag: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 16,
  },
  denominationText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  detailsContainer: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
    flex: 1,
  },
  detailTextDark: {
    color: Colors.white,
  },
  link: {
    color: Colors.primary,
  },
  linkDark: {
    color: Colors.primaryLight,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  donateButton: {
    flex: 1,
    backgroundColor: '#F44336',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  donateButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  donateIcon: {
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  cardTitleDark: {
    color: Colors.white,
  },
  calculationMethod: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  calculationMethodDark: {
    color: '#AAAAAA',
  },
  prayerTimesCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  prayerTimesCardDark: {
    backgroundColor: '#1E1E1E',
  },
  prayerTimesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  prayerTimeItem: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  prayerTimeItemDark: {
    backgroundColor: '#2a2a2a',
  },
  prayerName: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  prayerNameDark: {
    color: '#AAAAAA',
  },
  prayerTime: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  facilitiesCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  facilitiesCardDark: {
    backgroundColor: '#1E1E1E',
  },
  facilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  facilityItem: {
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  facilityItemDark: {
    backgroundColor: '#2a2a2a',
  },
  facilityText: {
    fontSize: 14,
    color: Colors.text,
  },
  facilityTextDark: {
    color: Colors.white,
  },
  eventsSection: {
    marginTop: 8,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  sectionTitleDark: {
    color: Colors.white,
  },
});