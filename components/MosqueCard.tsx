import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Clock, Star, Heart } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Mosque } from '@/mocks/mosques';
import { globalStyles } from '@/constants/theme';
import useMosques from '@/hooks/useMosques';
import useThemeStore from '@/hooks/useThemeStore';

interface MosqueCardProps {
  mosque: Mosque;
  compact?: boolean;
}

export default function MosqueCard({ mosque, compact = false }: MosqueCardProps) {
  const router = useRouter();
  const { isMosqueFavorite, toggleFavoriteMosque } = useMosques();
  const { isDarkMode } = useThemeStore();
  const isFavorite = isMosqueFavorite(mosque.id);

  const handlePress = () => {
    router.push(`/mosque/${mosque.id}`);
  };

  const handleFavoriteToggle = (e: any) => {
    e.stopPropagation();
    toggleFavoriteMosque(mosque.id);
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
        {mosque.image && (
          <Image 
            source={{ uri: mosque.image }} 
            style={styles.compactImage} 
            resizeMode="cover"
          />
        )}
        <View style={styles.compactContent}>
          <View style={styles.compactHeader}>
            <Text style={[
              styles.compactName,
              isDarkMode && styles.compactNameDark
            ]} numberOfLines={1}>{mosque.name}</Text>
            <TouchableOpacity 
              style={styles.favoriteButton} 
              onPress={handleFavoriteToggle}
            >
              <Heart 
                size={16} 
                color={isFavorite ? Colors.error : isDarkMode ? Colors.white : Colors.textSecondary} 
                fill={isFavorite ? Colors.error : 'none'} 
              />
            </TouchableOpacity>
          </View>
          <View style={styles.compactDetails}>
            <MapPin size={14} color={isDarkMode ? Colors.white : Colors.textSecondary} />
            <Text style={[
              styles.compactDistance,
              isDarkMode && styles.compactDistanceDark
            ]} numberOfLines={1}>
              {mosque.distance ? `${mosque.distance} km` : mosque.address}
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
      {mosque.image && (
        <Image 
          source={{ uri: mosque.image }} 
          style={styles.image} 
          resizeMode="cover"
        />
      )}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[
            styles.name,
            isDarkMode && styles.nameDark
          ]}>{mosque.name}</Text>
          <TouchableOpacity 
            style={styles.favoriteButton} 
            onPress={handleFavoriteToggle}
          >
            <Heart 
              size={20} 
              color={isFavorite ? Colors.error : isDarkMode ? Colors.white : Colors.textSecondary} 
              fill={isFavorite ? Colors.error : 'none'} 
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.detailRow}>
          <MapPin size={16} color={isDarkMode ? Colors.white : Colors.textSecondary} />
          <Text style={[
            styles.address,
            isDarkMode && styles.addressDark
          ]} numberOfLines={2}>
            {mosque.distance ? `${mosque.distance} km • ` : ''}
            {mosque.address}
          </Text>
        </View>
        
        {mosque.prayer_times?.jummah && (
          <View style={styles.detailRow}>
            <Clock size={16} color={isDarkMode ? Colors.white : Colors.textSecondary} />
            <Text style={[
              styles.prayerTime,
              isDarkMode && styles.prayerTimeDark
            ]}>Jummah: {mosque.prayer_times.jummah}</Text>
          </View>
        )}
        
        {mosque.rating && (
          <View style={styles.ratingContainer}>
            <Star size={16} color={Colors.primary} fill={Colors.primary} />
            <Text style={styles.rating}>{mosque.rating}</Text>
          </View>
        )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  nameDark: {
    color: Colors.white,
  },
  favoriteButton: {
    padding: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  address: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  addressDark: {
    color: '#AAAAAA',
  },
  prayerTime: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  prayerTimeDark: {
    color: '#AAAAAA',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 4,
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
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  compactName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  compactNameDark: {
    color: Colors.white,
  },
  compactDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactDistance: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  compactDistanceDark: {
    color: '#AAAAAA',
  },
});