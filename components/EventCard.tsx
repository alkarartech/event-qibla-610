import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Clock, MapPin, Heart, Bell, BellOff } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Event } from '@/mocks/events';
import { globalStyles } from '@/constants/theme';
import useEvents from '@/hooks/useEvents';
import useThemeStore from '@/hooks/useThemeStore';

interface EventCardProps {
  event: Event;
  compact?: boolean;
}

export default function EventCard({ event, compact = false }: EventCardProps) {
  const router = useRouter();
  const { isEventSaved, saveEvent, unsaveEvent, hasEventNotifications, scheduleEventNotifications, cancelEventNotifications } = useEvents();
  const { use24HourFormat } = useThemeStore();
  const isSaved = isEventSaved(event.id);
  const hasNotifications = hasEventNotifications(event.id);

  const handlePress = () => {
    router.push(`/event/${event.id}`);
  };

  const handleSaveToggle = (e: any) => {
    e.stopPropagation();
    if (isSaved) {
      unsaveEvent(event.id);
    } else {
      saveEvent(event.id).then(success => {
        if (success && !hasNotifications) {
          // Show notification modal by navigating to event details
          router.push(`/event/${event.id}`);
        }
      });
    }
  };
  
  const handleNotificationToggle = (e: any) => {
    e.stopPropagation();
    if (hasNotifications) {
      cancelEventNotifications(event.id);
    } else {
      scheduleEventNotifications(event.id);
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
        style={[styles.compactCard, globalStyles.shadow]} 
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {event.image && (
          <Image 
            source={{ uri: event.image }} 
            style={styles.compactImage} 
            resizeMode="cover"
          />
        )}
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={2}>{event.title}</Text>
          <View style={styles.compactDetails}>
            <Calendar size={12} color={Colors.textSecondary} />
            <Text style={styles.compactDetailText}>{event.date}</Text>
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
      style={[styles.card, globalStyles.shadow]} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {event.image && (
        <Image 
          source={{ uri: event.image }} 
          style={styles.image} 
          resizeMode="cover"
        />
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{event.title}</Text>
        
        <View style={styles.detailRow}>
          <Calendar size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{event.date}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Clock size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{formatTime(event.time)}{event.endTime && ` - ${formatTime(event.endTime)}`}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <MapPin size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText} numberOfLines={1}>{event.mosque_name}</Text>
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
                {hasNotifications ? (
                  <Bell size={20} color={Colors.primary} fill={Colors.primary} />
                ) : (
                  <BellOff size={20} color={Colors.textSecondary} />
                )}
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleSaveToggle}
            >
              <Heart 
                size={20} 
                color={isSaved ? Colors.error : Colors.textSecondary} 
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
});