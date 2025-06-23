import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Clock, Star } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Mosque } from '@/mocks/mosques';
import { globalStyles } from '@/constants/theme';

interface MosqueCardProps {
  mosque: Mosque;
  compact?: boolean;
}

export default function MosqueCard({ mosque, compact = false }: MosqueCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/mosque/${mosque.id}`);
  };

  if (compact) {
    return (
      <TouchableOpacity 
        style={[styles.compactCard, globalStyles.shadow]} 
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.compactContent}>
          <Text style={styles.compactName} numberOfLines={1}>{mosque.name}</Text>
          <View style={styles.compactDetails}>
            <MapPin size={14} color={Colors.textSecondary} />
            <Text style={styles.compactDistance} numberOfLines={1}>
              {mosque.distance ? `${mosque.distance} km` : mosque.address}
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
      {mosque.image && (
        <Image 
          source={{ uri: mosque.image }} 
          style={styles.image} 
          resizeMode="cover"
        />
      )}
      <View style={styles.content}>
        <Text style={styles.name}>{mosque.name}</Text>
        
        <View style={styles.detailRow}>
          <MapPin size={16} color={Colors.textSecondary} />
          <Text style={styles.address} numberOfLines={2}>
            {mosque.distance ? `${mosque.distance} km • ` : ''}
            {mosque.address}
          </Text>
        </View>
        
        {mosque.prayer_times?.jummah && (
          <View style={styles.detailRow}>
            <Clock size={16} color={Colors.textSecondary} />
            <Text style={styles.prayerTime}>Jummah: {mosque.prayer_times.jummah}</Text>
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
  image: {
    width: '100%',
    height: 150,
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
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
  prayerTime: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
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
    padding: 12,
    marginRight: 12,
    width: 200,
  },
  compactContent: {
    flex: 1,
  },
  compactName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
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
});