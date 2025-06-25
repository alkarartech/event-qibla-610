import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Clock, MapPin, Heart } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Event } from '@/mocks/events';
import { globalStyles } from '@/constants/theme';
import useEvents from '@/hooks/useEvents';

interface EventCardProps {
  event: Event;
  compact?: boolean;
}

export default function EventCard({ event, compact = false }: EventCardProps) {
  const router = useRouter();
  const { isEventSaved, saveEvent, unsaveEvent } = useEvents();
  const isSaved = isEventSaved(event.id);

  const handlePress = () => {
    router.push(`/event/${event.id}`);
  };

  const handleSaveToggle = (e: any) => {
    e.stopPropagation();
    if (isSaved) {
      unsaveEvent(event.id);
    } else {
      saveEvent(event.id);
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
          <Text style={styles.detailText}>{event.time}</Text>
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
          
          <TouchableOpacity 
            style={styles.saveButton} 
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
  saveButton: {
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