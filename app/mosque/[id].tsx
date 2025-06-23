import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MapPin, Phone, Globe, Clock, Calendar, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { globalStyles } from '@/constants/theme';
import PrayerTimesCard from '@/components/PrayerTimesCard';
import EventCard from '@/components/EventCard';
import LoadingIndicator from '@/components/LoadingIndicator';
import EmptyState from '@/components/EmptyState';
import useMosques from '@/hooks/useMosques';
import useEvents from '@/hooks/useEvents';

export default function MosqueDetailScreen() {
  const { id } = useLocalSearchParams();
  const { getMosqueById, loading: mosquesLoading } = useMosques();
  const { getEventsByMosqueId, loading: eventsLoading } = useEvents();

  const mosque = getMosqueById(id as string);
  const mosqueEvents = mosque ? getEventsByMosqueId(mosque.id) : [];

  const isLoading = mosquesLoading || eventsLoading;

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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {mosque.image && (
        <Image 
          source={{ uri: mosque.image }} 
          style={styles.image} 
          resizeMode="cover"
        />
      )}

      <View style={styles.content}>
        <Text style={styles.name}>{mosque.name}</Text>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <MapPin size={20} color={Colors.primary} />
            <Text style={styles.detailText}>{mosque.address}</Text>
          </View>
          
          {mosque.phone && (
            <TouchableOpacity style={styles.detailRow} onPress={handlePhonePress}>
              <Phone size={20} color={Colors.primary} />
              <Text style={[styles.detailText, styles.link]}>{mosque.phone}</Text>
            </TouchableOpacity>
          )}
          
          {mosque.website && (
            <TouchableOpacity style={styles.detailRow} onPress={handleWebsitePress}>
              <Globe size={20} color={Colors.primary} />
              <Text style={[styles.detailText, styles.link]}>{mosque.website}</Text>
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
        </View>

        {mosque.prayer_times && (
          <PrayerTimesCard prayerTimes={mosque.prayer_times} />
        )}

        {mosque.facilities && mosque.facilities.length > 0 && (
          <View style={[styles.facilitiesCard, globalStyles.shadow]}>
            <Text style={styles.cardTitle}>Facilities</Text>
            <View style={styles.facilitiesContainer}>
              {mosque.facilities.map((facility, index) => (
                <View key={index} style={styles.facilityItem}>
                  <Text style={styles.facilityText}>{facility}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {mosqueEvents.length > 0 && (
          <View style={styles.eventsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Events</Text>
            </View>
            
            {mosqueEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
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
  link: {
    color: Colors.primary,
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionButton: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  facilitiesCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
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
  facilityText: {
    fontSize: 14,
    color: Colors.text,
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
});