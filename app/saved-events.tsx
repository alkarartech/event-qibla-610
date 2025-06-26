import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { globalStyles } from '@/constants/theme';
import EventCard from '@/components/EventCard';
import LoadingIndicator from '@/components/LoadingIndicator';
import EmptyState from '@/components/EmptyState';
import useEvents from '@/hooks/useEvents';
import useThemeStore from '@/hooks/useThemeStore';

export default function SavedEventsScreen() {
  const router = useRouter();
  const { savedEvents, loading, refreshSavedEvents } = useEvents();
  const { isDarkMode } = useThemeStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [showPastEvents, setShowPastEvents] = useState(false);
  
  // Split events into upcoming and past
  const today = new Date();
  
  const upcomingEvents = savedEvents
    .filter(event => new Date(event.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const pastEvents = savedEvents
    .filter(event => new Date(event.date) < today)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Most recent first

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refreshSavedEvents().then(() => {
      setRefreshing(false);
    });
  }, [refreshSavedEvents]);

  return (
    <View style={[
      styles.container,
      isDarkMode && styles.containerDark
    ]}>
      <View style={styles.headerContainer}>
        <Text style={[
          styles.headerTitle,
          isDarkMode && styles.headerTitleDark
        ]}>Your Saved Events</Text>
      </View>
      
      {loading ? (
        <LoadingIndicator message="Loading your saved events..." />
      ) : (
        <FlatList
          data={upcomingEvents}
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
          ListHeaderComponent={
            <Text style={[
              styles.sectionTitle,
              isDarkMode && styles.sectionTitleDark
            ]}>
              Upcoming Events ({upcomingEvents.length})
            </Text>
          }
          ListEmptyComponent={
            <EmptyState
              title="No Upcoming Events"
              message="You haven't saved any upcoming events yet."
            />
          }
          ListFooterComponent={
            <>
              {pastEvents.length > 0 && (
                <View style={styles.pastEventsSection}>
                  <TouchableOpacity 
                    style={styles.pastEventsTitleContainer}
                    onPress={() => setShowPastEvents(!showPastEvents)}
                  >
                    <Text style={[
                      styles.sectionTitle,
                      isDarkMode && styles.sectionTitleDark
                    ]}>
                      Past Events ({pastEvents.length})
                    </Text>
                    {showPastEvents ? (
                      <ChevronUp size={20} color={isDarkMode ? Colors.white : Colors.text} />
                    ) : (
                      <ChevronDown size={20} color={isDarkMode ? Colors.white : Colors.text} />
                    )}
                  </TouchableOpacity>
                  
                  {showPastEvents && (
                    pastEvents.map(event => (
                      <EventCard key={event.id} event={event} />
                    ))
                  )}
                </View>
              )}
              <View style={styles.footer} />
            </>
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
  containerDark: {
    backgroundColor: '#121212',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  headerTitleDark: {
    color: Colors.white,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginVertical: 16,
  },
  sectionTitleDark: {
    color: Colors.white,
  },
  pastEventsSection: {
    marginTop: 16,
  },
  pastEventsTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  footer: {
    height: 40,
  },
});