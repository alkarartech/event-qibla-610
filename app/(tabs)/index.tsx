import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Calendar, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { globalStyles } from '@/constants/theme';
import MosqueCard from '@/components/MosqueCard';
import EventCard from '@/components/EventCard';
import LoadingIndicator from '@/components/LoadingIndicator';
import EmptyState from '@/components/EmptyState';
import useLocation from '@/hooks/useLocation';
import useMosques from '@/hooks/useMosques';
import useEvents from '@/hooks/useEvents';
import { Mosque } from '@/mocks/mosques';
import { Event } from '@/mocks/events';

export default function HomeScreen() {
  const router = useRouter();
  const { location, locationName, loading: locationLoading } = useLocation();
  
  const { nearbyMosques, loading: mosquesLoading } = useMosques(
    location?.coords.latitude,
    location?.coords.longitude,
    10
  );
  
  const { nearbyEvents, loading: eventsLoading } = useEvents(
    location?.coords.latitude,
    location?.coords.longitude,
    10
  );

  const isLoading = locationLoading || mosquesLoading || eventsLoading;

  const renderMosqueItem = ({ item }: { item: Mosque }) => (
    <MosqueCard mosque={item} compact />
  );

  const renderEventItem = ({ item }: { item: Event }) => (
    <EventCard event={item} compact />
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Location Header */}
      <View style={styles.locationContainer}>
        <MapPin size={20} color={Colors.primary} />
        <Text style={styles.locationText}>
          {locationLoading ? 'Getting your location...' : locationName}
        </Text>
      </View>

      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>Assalamu Alaikum</Text>
        <Text style={styles.welcomeSubtitle}>Find mosques and events near you</Text>
      </View>

      {isLoading ? (
        <LoadingIndicator message="Finding mosques and events near you..." />
      ) : (
        <>
          {/* Nearby Mosques Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Nearby Mosques</Text>
              <TouchableOpacity 
                style={styles.seeAllButton}
                onPress={() => router.push('/mosques')}
              >
                <Text style={styles.seeAllText}>See All</Text>
                <ChevronRight size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {nearbyMosques.length > 0 ? (
              <FlatList
                data={nearbyMosques.slice(0, 5)}
                renderItem={renderMosqueItem}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalListContent}
              />
            ) : (
              <EmptyState
                title="No Mosques Found"
                message="We couldn't find any mosques near your current location."
              />
            )}
          </View>

          {/* Upcoming Events Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Events</Text>
              <TouchableOpacity 
                style={styles.seeAllButton}
                onPress={() => router.push('/events')}
              >
                <Text style={styles.seeAllText}>See All</Text>
                <ChevronRight size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {nearbyEvents.length > 0 ? (
              <FlatList
                data={nearbyEvents.slice(0, 5)}
                renderItem={renderEventItem}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalListContent}
              />
            ) : (
              <EmptyState
                title="No Events Found"
                message="We couldn't find any events near your current location."
              />
            )}
          </View>
        </>
      )}

      {/* Prayer Times Reminder */}
      <View style={[styles.prayerTimesCard, globalStyles.shadow]}>
        <Calendar size={24} color={Colors.primary} />
        <View style={styles.prayerTimesContent}>
          <Text style={styles.prayerTimesTitle}>Prayer Times</Text>
          <Text style={styles.prayerTimesSubtitle}>
            Check prayer times at your nearest mosque
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.prayerTimesButton}
          onPress={() => router.push('/mosques')}
        >
          <Text style={styles.prayerTimesButtonText}>View</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer} />
    </ScrollView>
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
  welcomeSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    marginRight: 2,
  },
  horizontalListContent: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  prayerTimesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  prayerTimesContent: {
    flex: 1,
    marginLeft: 12,
  },
  prayerTimesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  prayerTimesSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  prayerTimesButton: {
    backgroundColor: Colors.primaryLight,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  prayerTimesButtonText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  footer: {
    height: 24,
  },
});