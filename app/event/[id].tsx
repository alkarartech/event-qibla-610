import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Image, Share, Platform, Modal, TextInput, Alert, RefreshControl } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useRouter } from 'expo-router';
import { MapPin, Calendar, Clock, User, Phone, Share2, Heart, Star, Mail, Bell, BellOff } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { globalStyles } from '@/constants/theme';
import LoadingIndicator from '@/components/LoadingIndicator';
import EmptyState from '@/components/EmptyState';
import useEvents from '@/hooks/useEvents';
import useThemeStore from '@/hooks/useThemeStore';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { 
    getEventById, 
    saveEvent, 
    unsaveEvent, 
    isEventSaved, 
    loading, 
    rateEvent, 
    getEventRating,
    scheduleEventNotifications,
    cancelEventNotifications,
    hasEventNotifications,
    refreshSavedEvents
  } = useEvents();
  const { isDarkMode, use24HourFormat } = useThemeStore();

  const event = getEventById(id as string);
  const [saved, setSaved] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [hasAttended, setHasAttended] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Check if event is saved and has notifications
  useEffect(() => {
    if (event) {
      const isSaved = isEventSaved(event.id);
      setSaved(isSaved);
      
      const hasNotifs = hasEventNotifications(event.id);
      setHasNotifications(hasNotifs);
      
      // Check if event date has passed to determine if user can rate it
      const eventDate = new Date(event.date);
      const today = new Date();
      
      // If event date has passed, user can rate it
      if (eventDate < today) {
        setHasAttended(true);
      }
    }
  }, [event, isEventSaved, hasEventNotifications]);
  
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refreshSavedEvents().then(() => {
      if (event) {
        setSaved(isEventSaved(event.id));
        setHasNotifications(hasEventNotifications(event.id));
      }
      setRefreshing(false);
    });
  }, [refreshSavedEvents, event]);

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

  const handleSharePress = async () => {
    if (event) {
      try {
        // Check if Web Share API is available (for web)
        if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.share) {
          await navigator.share({
            title: event.title,
            text: `Check out this event: ${event.title} at ${event.mosque_name} on ${event.date} at ${event.time}`,
            url: window.location.href,
          });
          return;
        }
        
        // Native share for mobile platforms
        const appUrl = Platform.OS === 'ios' 
          ? 'https://apps.apple.com/us/app/salah-journal/id6747736982'
          : 'https://play.google.com/store/apps/details?id=com.kamalaldeen.mosquefinder';
        
        const message = `Check out this event: ${event.title} at ${event.mosque_name} on ${event.date} at ${event.time}

Download the Mosque Finder app to see more events: ${appUrl}`;
        
        await Share.share({
          message,
          title: event.title,
        });
      } catch (error) {
        console.error('Error sharing event:', error);
        Alert.alert(
          "Sharing Failed",
          "Unable to share this event. Please try again later.",
          [{ text: "OK" }]
        );
      }
    }
  };

  const handleSaveToggle = async () => {
    if (!event) return;
    
    if (saved) {
      const success = await unsaveEvent(event.id);
      if (success) {
        setSaved(false);
        setHasNotifications(false);
      }
    } else {
      const success = await saveEvent(event.id);
      if (success) {
        setSaved(true);
        setShowNotificationModal(true);
      }
    }
  };
  
  const handleNotificationToggle = async () => {
    if (!event) return;
    
    if (hasNotifications) {
      const success = await cancelEventNotifications(event.id);
      if (success) {
        setHasNotifications(false);
      }
    } else {
      const success = await scheduleEventNotifications(event.id);
      if (success) {
        setHasNotifications(true);
        setShowNotificationModal(false);
      }
    }
  };
  
  const handleRateEvent = () => {
    setShowRatingModal(true);
  };
  
  const submitRating = () => {
    if (!event) return;
    
    rateEvent(event.id, rating, feedback);
    
    // Send email to mosque with feedback
    if (event.contact && event.contact.includes('@')) {
      const subject = `Event Feedback: ${event.title}`;
      const body = `Event: ${event.title}
Date: ${event.date}
Rating: ${rating}/5
Feedback: ${feedback}`;
      
      Linking.openURL(`mailto:${event.contact}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    }
    
    setShowRatingModal(false);
    Alert.alert(
      "Thank You!",
      "Your feedback has been submitted and sent to the mosque.",
      [{ text: "OK" }]
    );
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

  return (
    <ScrollView 
      style={[
        styles.container,
        isDarkMode && styles.containerDark
      ]} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.primary]}
          tintColor={isDarkMode ? Colors.white : Colors.primary}
        />
      }
    >
      {event.image && (
        <Image 
          source={{ uri: event.image }} 
          style={styles.image} 
          resizeMode="cover"
        />
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[
            styles.title,
            isDarkMode && styles.titleDark
          ]}>{event.title}</Text>
          <View style={[styles.categoryTag, { backgroundColor: getCategoryColor(event.category) }]}>
            <Text style={styles.categoryText}>
              {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
            </Text>
          </View>
        </View>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Calendar size={20} color={Colors.primary} />
            <Text style={[
              styles.detailText,
              isDarkMode && styles.detailTextDark
            ]}>{event.date}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Clock size={20} color={Colors.primary} />
            <Text style={[
              styles.detailText,
              isDarkMode && styles.detailTextDark
            ]}>{formatTime(event.time)}{event.endTime && ` - ${formatTime(event.endTime)}`}</Text>
          </View>
          
          <TouchableOpacity style={styles.detailRow} onPress={handleMosquePress}>
            <MapPin size={20} color={Colors.primary} />
            <Text style={[
              styles.detailText,
              styles.link,
              isDarkMode && styles.linkDark
            ]}>{event.mosque_name}</Text>
          </TouchableOpacity>
          
          {event.organizer && (
            <View style={styles.detailRow}>
              <User size={20} color={Colors.primary} />
              <Text style={[
                styles.detailText,
                isDarkMode && styles.detailTextDark
              ]}>{event.organizer}</Text>
            </View>
          )}
          
          {event.contact && (
            <TouchableOpacity style={styles.detailRow} onPress={handleContactPress}>
              <Phone size={20} color={Colors.primary} />
              <Text style={[
                styles.detailText,
                styles.link,
                isDarkMode && styles.linkDark
              ]}>{event.contact}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={[
            styles.descriptionTitle,
            isDarkMode && styles.descriptionTitleDark
          ]}>About this event</Text>
          <Text style={[
            styles.description,
            isDarkMode && styles.descriptionDark
          ]}>{event.description}</Text>
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
          
          {saved && (
            <TouchableOpacity 
              style={[
                styles.notificationButton, 
                hasNotifications ? styles.notificationButtonActive : {},
                globalStyles.shadow
              ]} 
              onPress={handleNotificationToggle}
            >
              {hasNotifications ? (
                <>
                  <Bell size={20} color={Colors.white} style={styles.actionButtonIcon} />
                  <Text style={styles.notificationButtonText}>Notifications On</Text>
                </>
              ) : (
                <>
                  <BellOff size={20} color={Colors.white} style={styles.actionButtonIcon} />
                  <Text style={styles.notificationButtonText}>Notifications Off</Text>
                </>
              )}
            </TouchableOpacity>
          )}
          
          {hasAttended && (
            <TouchableOpacity 
              style={[styles.rateButton, globalStyles.shadow]} 
              onPress={handleRateEvent}
            >
              <Star size={20} color={Colors.white} style={styles.actionButtonIcon} />
              <Text style={styles.rateButtonText}>Rate This Event</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Rating Modal */}
      <Modal
        visible={showRatingModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRatingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.ratingModalContent,
            isDarkMode && styles.ratingModalContentDark
          ]}>
            <Text style={[
              styles.ratingModalTitle,
              isDarkMode && styles.ratingModalTitleDark
            ]}>
              Rate This Event
            </Text>
            
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                >
                  <Star
                    size={36}
                    color={Colors.primary}
                    fill={star <= rating ? Colors.primary : 'none'}
                    style={styles.starIcon}
                  />
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={[
              styles.feedbackLabel,
              isDarkMode && styles.feedbackLabelDark
            ]}>
              Your Feedback
            </Text>
            
            <TextInput
              style={[
                styles.feedbackInput,
                isDarkMode && styles.feedbackInputDark
              ]}
              placeholder="Share your experience..."
              placeholderTextColor={isDarkMode ? '#777' : '#999'}
              value={feedback}
              onChangeText={setFeedback}
              multiline
              numberOfLines={4}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowRatingModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.submitButton}
                onPress={submitRating}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.emailInfoContainer}>
              <Mail size={16} color={isDarkMode ? '#AAA' : '#777'} />
              <Text style={[
                styles.emailInfoText,
                isDarkMode && styles.emailInfoTextDark
              ]}>
                Your feedback will be sent to the mosque
              </Text>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Notification Modal */}
      <Modal
        visible={showNotificationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNotificationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.notificationModalContent,
            isDarkMode && styles.notificationModalContentDark
          ]}>
            <Text style={[
              styles.notificationModalTitle,
              isDarkMode && styles.notificationModalTitleDark
            ]}>
              Event Notifications
            </Text>
            
            <Text style={[
              styles.notificationModalText,
              isDarkMode && styles.notificationModalTextDark
            ]}>
              Would you like to receive notifications for this event?
            </Text>
            
            <Text style={[
              styles.notificationModalSubtext,
              isDarkMode && styles.notificationModalSubtextDark
            ]}>
              You'll be notified:
              {"\n"}• One day before the event
              {"\n"}• Two hours before the event starts
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowNotificationModal(false)}
              >
                <Text style={styles.cancelButtonText}>No Thanks</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleNotificationToggle}
              >
                <Text style={styles.submitButtonText}>Enable</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  titleDark: {
    color: Colors.white,
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
  detailTextDark: {
    color: Colors.white,
  },
  link: {
    color: Colors.primary,
  },
  linkDark: {
    color: Colors.primaryLight,
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
  descriptionTitleDark: {
    color: Colors.white,
  },
  description: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  descriptionDark: {
    color: Colors.white,
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
  notificationButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationButtonActive: {
    backgroundColor: '#4CAF50',
  },
  notificationButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  rateButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  rateButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingModalContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    width: '85%',
    ...globalStyles.shadow,
  },
  ratingModalContentDark: {
    backgroundColor: '#1E1E1E',
  },
  ratingModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  ratingModalTitleDark: {
    color: Colors.white,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  starIcon: {
    marginHorizontal: 6,
  },
  feedbackLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  feedbackLabelDark: {
    color: Colors.white,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    textAlignVertical: 'top',
    minHeight: 100,
    marginBottom: 20,
  },
  feedbackInputDark: {
    borderColor: '#444',
    color: Colors.white,
    backgroundColor: '#2a2a2a',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  emailInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  emailInfoText: {
    fontSize: 12,
    color: '#777',
    marginLeft: 6,
  },
  emailInfoTextDark: {
    color: '#AAA',
  },
  notificationModalContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    width: '85%',
    ...globalStyles.shadow,
  },
  notificationModalContentDark: {
    backgroundColor: '#1E1E1E',
  },
  notificationModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  notificationModalTitleDark: {
    color: Colors.white,
  },
  notificationModalText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  notificationModalTextDark: {
    color: Colors.white,
  },
  notificationModalSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  notificationModalSubtextDark: {
    color: '#AAAAAA',
  },
});