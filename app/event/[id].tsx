import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useRouter } from 'expo-router';
import { MapPin, Calendar, Clock, User, Phone, Share2, Heart } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { globalStyles } from '@/constants/theme';
import LoadingIndicator from '@/components/LoadingIndicator';
import EmptyState from '@/components/EmptyState';
import useEvents from '@/hooks/useEvents';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getEventById, saveEvent, unsaveEvent, isEventSaved, loading } = useEvents();

  const event = getEventById(id as string);
  const saved = event ? isEventSaved(event.id) : false;

  const handleMosquePress = () => {
    if (event) {
      router.push(`/mosque/${event.mosque_id}`);
    }
  };

  const handleDirectionsPress = () => {
    if (event) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`;
      Linking.openURL(url);
    }
  };

  const handleContactPress = () => {
    if (event?.contact) {
      if (event.contact.includes('@')) {
        Linking.openURL(`mailto:${event.contact}`);
      } else {
        Linking.openURL(`tel:${event.contact}`);
      }
    }
  };

  const handleSharePress = () => {
    if (event) {
      const message = `Check out this event: ${event.title} at ${event.mosque_name} on ${event.date} at ${event.time}`;
      Linking.openURL(`mailto:?subject=${event.title}&body=${message}`);
    }
  };

  const handleSaveToggle = () => {
    if (!event) return;
    
    if (saved) {
      unsaveEvent(event.id);
    } else {
      saveEvent(event.id);
    }
  };

  if (loading) {
    return <LoadingIndicator fullScreen message="Loading event details..." />;
  }

  if (!event) {
    return (
      <EmptyState
        title="Event Not Found"
        message="We couldn't find the event you're looking for."
      />
    );
  }

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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {event.image && (
        <Image 
          source={{ uri: event.image }} 
          style={styles.image} 
          resizeMode="cover"
        />
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{event.title}</Text>
          <View style={[styles.categoryTag, { backgroundColor: getCategoryColor(event.category) }]}>
            <Text style={styles.categoryText}>
              {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
            </Text>
          </View>
        </View>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Calendar size={20} color={Colors.primary} />
            <Text style={styles.detailText}>{event.date}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Clock size={20} color={Colors.primary} />
            <Text style={styles.detailText}>{event.time}</Text>
          </View>
          
          <TouchableOpacity style={styles.detailRow} onPress={handleMosquePress}>
            <MapPin size={20} color={Colors.primary} />
            <Text style={[styles.detailText, styles.link]}>{event.mosque_name}</Text>
          </TouchableOpacity>
          
          {event.organizer && (
            <View style={styles.detailRow}>
              <User size={20} color={Colors.primary} />
              <Text style={styles.detailText}>{event.organizer}</Text>
            </View>
          )}
          
          {event.contact && (
            <TouchableOpacity style={styles.detailRow} onPress={handleContactPress}>
              <Phone size={20} color={Colors.primary} />
              <Text style={[styles.detailText, styles.link]}>{event.contact}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>About this event</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, globalStyles.shadow]} 
            onPress={handleDirectionsPress}
          >
            <Text style={styles.actionButtonText}>Get Directions</Text>
          </TouchableOpacity>
          
          <View style={styles.secondaryActions}>
            <TouchableOpacity 
              style={[styles.actionButtonOutline, globalStyles.shadow]} 
              onPress={handleSaveToggle}
            >
              <Heart 
                size={20} 
                color={saved ? Colors.error : Colors.primary} 
                fill={saved ? Colors.error : 'none'} 
                style={styles.actionButtonIcon} 
              />
              <Text style={styles.actionButtonOutlineText}>
                {saved ? 'Saved' : 'Save'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButtonOutline, globalStyles.shadow]} 
              onPress={handleSharePress}
            >
              <Share2 size={20} color={Colors.primary} style={styles.actionButtonIcon} />
              <Text style={styles.actionButtonOutlineText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  categoryText: {
    color: Colors.white,
    fontSize: 12,
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
  },
  link: {
    color: Colors.primary,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  actionsContainer: {
    gap: 12,
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
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButtonOutline: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonOutlineText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonIcon: {
    marginRight: 8,
  },
});