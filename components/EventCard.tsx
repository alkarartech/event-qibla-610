import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Clock, MapPin, Heart, Bell, BellOff } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Event } from '@/mocks/events';
import { globalStyles } from '@/constants/theme';
import useEvents from '@/hooks/useEvents';
import useThemeStore from '@/hooks/useThemeStore';

interface EventCardProps {
  event: Event;
  showDistance?: boolean;
  distance?: number;
}

export default function EventCard({ event, showDistance, distance }: EventCardProps) {
  const router = useRouter();
  const { isEventSaved, saveEvent, unsaveEvent, hasEventNotifications, scheduleEventNotifications, cancelEventNotifications } = useEvents();
  const { use24HourFormat, isDarkMode, getText } = useThemeStore();
  const [isSaved, setIsSaved] = useState(false);
  const [hasNotifs, setHasNotifs] = useState(false);

  // Update saved and notification status when they change
  useEffect(() => {
    setIsSaved(isEventSaved(event.id));
    setHasNotifs(hasEventNotifications(event.id));
  }, [event.id, isEventSaved, hasEventNotifications]);

  const handlePress = () => {
    router.push(`/event/${event.id}`);
  };

  const handleSaveToggle = async (e: any) => {
    e.stopPropagation();
    if (isSaved) {
      const success = await unsaveEvent(event.id);
      if (success) {
        setIsSaved(false);
        setHasNotifs(false);
      }
    } else {
      const success = await saveEvent(event.id);
      if (success) {
        setIsSaved(true);
      }
    }
  };
  
  const handleNotificationToggle = async (e: any) => {
    e.stopPropagation();
    
    if (hasNotifs) {
      Alert.alert(
        "Turn Off Notifications",
        "Are you sure you want to turn off notifications for this event?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Turn Off", 
            style: "destructive",
            onPress: async () => {
              const success = await cancelEventNotifications(event.id);
              if (success) {
                setHasNotifs(false);
              }
            }
          }
        ]
      );
    } else {
      Alert.alert(
        "Turn On Notifications",
        "Would you like to receive notifications for this event?\n\nYou'll be notified:\n• One day before the event\n• Two hours before the event starts\n• After the event for feedback",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Turn On", 
            onPress: async () => {
              const success = await scheduleEventNotifications(event.id);
              if (success) {
                setHasNotifs(true);
              }
            }
          }
        ]
      );
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'lecture':
        return '#4CAF50';
      case 'workshop':
        return '#2196F3';
      case 'community':
        return '#FF9800';
      case 'charity':
        return '#E91E63';
      default:
        return '#9C27B0';
    }
  };
  
  // Format time based on user preference
  const formatTime = (timeString: string) => {
    if (use24HourFormat) {
      // Convert to 24-hour format if it's in 12-hour format
      if (timeString.includes('AM') || timeString.includes('PM')) {
        const [timePart, period] = timeString.split(' ');
        const [hours, minutes] = timePart.split(':').map(Number);
        
        let hour24 = hours;
        if (period === 'PM' && hours < 12) hour24 += 12;
        if (period === 'AM' && hours === 12) hour24 = 0;
        
        return `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
      return timeString;
    } else {
      // Convert to 12-hour format if it's in 24-hour format
      if (!timeString.includes('AM') && !timeString.includes('PM')) {
        const [hours, minutes] = timeString.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const hour12 = hours % 12 || 12;
        
        return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
      }
      return timeString;
    }
  };

  if (compact) {
    return (
      <TouchableOpacity 
        style={[
          styles.compactCard, 
          globalStyles.shadow,
          isDarkMode && styles.compactCardDark
        ]} 
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {event.image_url && (
          <Image 
            source={{ uri: event.image_url }} 
            style={styles.compactImage} 
            resizeMode="cover"
          />
        )}
        <View style={styles.compactContent}>
          <Text style={[
            styles.compactTitle,
            isDarkMode && styles.compactTitleDark
          ]} numberOfLines={2}>{event.title}</Text>
          <View style={styles.compactDetails}>
            <Calendar size={12} color={isDarkMode ? Colors.white : Colors.textSecondary} />
            <Text style={[
              styles.compactDetailText,
              isDarkMode && styles.compactDetailTextDark
            ]}>{event.date}</Text>
          </View>
          <View style={[styles.categoryTag, { backgroundColor: getCategoryColor(event.category) }]}>
            <Text style={styles.categoryText}>
              {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={[
        styles.card, 
        globalStyles.shadow,
        isDarkMode && styles.cardDark
      ]} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {event.image_url && (
        <Image 
          source={{ uri: event.image_url }} 
          style={styles.image} 
          resizeMode="cover"
        />
      )}
      <View style={styles.content}>
        <Text style={[
          styles.title,
          isDarkMode && styles.titleDark
        ]}>{event.title}</Text>
        
        <View style={styles.detailRow}>
          <Calendar size={16} color={isDarkMode ? Colors.white : Colors.textSecondary} />
          <Text style={[
            styles.detailText,
            isDarkMode && styles.detailTextDark
          ]}>{event.date}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Clock size={16} color={isDarkMode ? Colors.white : Colors.textSecondary} />
          <Text style={[
            styles.detailText,
            isDarkMode && styles.detailTextDark
          ]}>{formatTime(event.time)}{event.endTime && ` - ${formatTime(event.endTime)}`}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <MapPin size={16} color={isDarkMode ? Colors.white : Colors.textSecondary} />
          <View style={styles.locationContainer}>
            <MapPin size={14} color={Colors.textSecondary} />
            <Text style={[styles.locationText, isDarkMode && styles.locationTextDark]}>
              {event.mosque_name}
            </Text>
            {showDistance && distance !== undefined && (
              <Text style={[styles.distanceText, isDarkMode && styles.distanceTextDark]}>
                • {(distance * 0.621371).toFixed(1)} mi
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.footer}>
          <View style={[styles.categoryTag, { backgroundColor: getCategoryColor(event.category) }]}>
            <Text style={styles.categoryText}>
              {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
            </Text>
          </View>
          
          <View style={styles.actionButtons}>
            {isSaved && (
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={handleNotificationToggle}
              >
                {hasNotifs ? (
                  <Bell size={20} color={Colors.primary} fill={Colors.primary} />
                ) : (
                  <BellOff size={20} color={isDarkMode ? Colors.white : Colors.textSecondary} />
                )}
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleSaveToggle}
            >
              <Heart 
                size={20} 
                color={isSaved ? Colors.error : isDarkMode ? Colors.white : Colors.textSecondary} 
                fill={isSaved ? Colors.error : 'none'} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
  },
  cardDark: {
    backgroundColor: '#1E1E1E',
  },
  image: {
    width: '100%',
    height: 150,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  titleDark: {
    color: Colors.white,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  detailTextDark: {
    color: '#AAAAAA',
  },
  footer: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  categoryText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
  },
  compactCard: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    overflow: 'hidden',
    width: 200,
    marginRight: 12,
  },
  compactCardDark: {
    backgroundColor: '#1E1E1E',
  },
  compactImage: {
    width: '100%',
    height: 100,
  },
  compactContent: {
    padding: 12,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
    height: 40,
  },
  compactTitleDark: {
    color: Colors.white,
  },
  compactDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  compactDetailText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  compactDetailTextDark: {
    color: '#AAAAAA',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  locationText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  locationTextDark: {
    color: '#AAAAAA',
  },
  distanceText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  distanceTextDark: {
    color: '#999999',
  },
});