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
import useThemeStore from '@/hooks/useThemeStore';
import { formatTime } from '@/utils/dateUtils';

export default function HomeScreen() {
  const router = useRouter();
  const { location, locationName, loading: locationLoading } = useLocation();
  const { isDarkMode, use24HourFormat } = useThemeStore();
  
  const { nearbyMosques, loading: mosquesLoading } = useMosques(
    location?.coords.latitude,
    location?.coords.longitude,
    10
  );
  
  const { nearbyEvents, savedEvents, loading: eventsLoading, refreshSavedEvents } = useEvents(
    location?.coords.latitude,
    location?.coords.longitude,
    10
  );

  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);

  const isLoading = locationLoading || mosquesLoading || eventsLoading;

  // Refresh saved events when component mounts or becomes active
  useEffect(() => {
    refreshSavedEvents();
  }, [refreshSavedEvents]);
  
  // Get upcoming events (sorted by date)
  useEffect(() => {
    const today = new Date();
    const upcoming = [...nearbyEvents, ...savedEvents]
      .filter((event, index, self) => 
        // Remove duplicates
        index === self.findIndex(e => e.id === event.id) &&
        // Only future events
        new Date(event.date) >= today
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 2); // Only show 2 upcoming events
    
    setUpcomingEvents(upcoming);
  }, [nearbyEvents, savedEvents]);

  const renderMosqueItem = ({ item }: { item: Mosque }) => (
    <MosqueCard mosque={item} compact />
  );

  const renderEventItem = ({ item }: { item: Event }) => (
    <EventCard event={item} compact />
  );

  const handleCalendarPress = () => {
    // Navigate to the full calendar screen
    router.push('/calendar');
  };

  return (
    <ScrollView 
      style={[
        styles.container,
        isDarkMode && styles.containerDark
      ]} 
      showsVerticalScrollIndicator={false}
    >
      {/* Header with Calendar Button */}
      <View style={styles.headerContainer}>
        <Text style={[
          styles.welcomeTitle,
          isDarkMode && styles.welcomeTitleDark
        ]}>Assalamu Alaikum</Text>
        
        <TouchableOpacity 
          style={styles.calendarButton}
          onPress={handleCalendarPress}
        >
          <Calendar size={24} color={isDarkMode ? Colors.white : Colors.primary} />
        </TouchableOpacity>
      </View>

      <Text style={[
        styles.welcomeSubtitle,
        isDarkMode && styles.welcomeSubtitleDark
      ]}>Find mosques and events near you</Text>

      {isLoading ? (
        <LoadingIndicator message="Finding mosques and events near you..." />
      ) : (
        <>
          {/* Upcoming Events Section - At the very top */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[
                styles.sectionTitle,
                isDarkMode && styles.sectionTitleDark
              ]}>Upcoming Events</Text>
              <TouchableOpacity 
                style={styles.seeAllButton}
                onPress={() => router.push('/events')}
              >
                <Text style={styles.seeAllText}>See All</Text>
                <ChevronRight size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {upcomingEvents.length > 0 ? (
              <View>
                {upcomingEvents.map(event => (
                  <TouchableOpacity 
                    key={event.id}
                    style={[
                      styles.upcomingEventItem,
                      isDarkMode && styles.upcomingEventItemDark
                    ]}
                    onPress={() => router.push(`/event/${event.id}`)}
                  >
                    <View style={styles.upcomingEventDate}>
                      <Text style={styles.upcomingEventDay}>
                        {new Date(event.date).getDate()}
                      </Text>
                      <Text style={styles.upcomingEventMonth}>
                        {new Date(event.date).toLocaleString('default', { month: 'short' })}
                      </Text>
                    </View>
                    <View style={styles.upcomingEventDetails}>
                      <Text 
                        style={[
                          styles.upcomingEventTitle,
                          isDarkMode && styles.upcomingEventTitleDark
                        ]}
                        numberOfLines={1}
                      >
                        {event.title}
                      </Text>
                      <Text 
                        style={[
                          styles.upcomingEventLocation,
                          isDarkMode && styles.upcomingEventLocationDark
                        ]}
                        numberOfLines={1}
                      >
                        {formatTime(event.time, use24HourFormat)} • {event.mosque_name}
                      </Text>
                    </View>
                    <ChevronRight size={20} color={isDarkMode ? Colors.white : Colors.textSecondary} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <EmptyState
                title="No Events Found"
                message="We couldn't find any upcoming events."
              />
            )}
          </View>

          {/* Saved Events Section */}
          {savedEvents.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[
                  styles.sectionTitle,
                  isDarkMode && styles.sectionTitleDark
                ]}>Your Saved Events</Text>
                <TouchableOpacity 
                  style={styles.seeAllButton}
                  onPress={() => {
                    router.push('/events');
                    // In a real app, we would set the filter to 'saved' on the events screen
                  }}
                >
                  <Text style={styles.seeAllText}>See All</Text>
                  <ChevronRight size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>

              <FlatList
                data={savedEvents.slice(0, 5)}
                renderItem={renderEventItem}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalListContent}
              />
            </View>
          )}

          {/* Nearby Mosques Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[
                styles.sectionTitle,
                isDarkMode && styles.sectionTitleDark
              ]}>Nearby Mosques</Text>
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
        </>
      )}

      {/* Prayer Times Reminder */}
      <View style={[
        styles.prayerTimesCard, 
        globalStyles.shadow,
        isDarkMode && styles.prayerTimesCardDark
      ]}>
        <Calendar size={24} color={Colors.primary} />
        <View style={styles.prayerTimesContent}>
          <Text style={[
            styles.prayerTimesTitle,
            isDarkMode && styles.prayerTimesTitleDark
          ]}>Prayer Times</Text>
          <Text style={[
            styles.prayerTimesSubtitle,
            isDarkMode && styles.prayerTimesSubtitleDark
          ]}>
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
  containerDark: {
    backgroundColor: '#121212',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  calendarButton: {
    padding: 8,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  welcomeTitleDark: {
    color: Colors.white,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  welcomeSubtitleDark: {
    color: '#AAAAAA',
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
  sectionTitleDark: {
    color: Colors.white,
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
  upcomingEventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  upcomingEventItemDark: {
    backgroundColor: '#1E1E1E',
  },
  upcomingEventDate: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  upcomingEventDay: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  upcomingEventMonth: {
    fontSize: 12,
    color: Colors.white,
  },
  upcomingEventDetails: {
    flex: 1,
  },
  upcomingEventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  upcomingEventTitleDark: {
    color: Colors.white,
  },
  upcomingEventLocation: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  upcomingEventLocationDark: {
    color: '#AAAAAA',
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
  prayerTimesCardDark: {
    backgroundColor: '#1E1E1E',
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
  prayerTimesTitleDark: {
    color: Colors.white,
  },
  prayerTimesSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  prayerTimesSubtitleDark: {
    color: '#AAAAAA',
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