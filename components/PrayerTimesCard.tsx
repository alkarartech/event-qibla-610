import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';
import { globalStyles } from '@/constants/theme';
import useThemeStore from '@/hooks/useThemeStore';

interface PrayerTimesProps {
  prayerTimes: {
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
    jummah: string;
  };
}

export default function PrayerTimesCard({ prayerTimes }: PrayerTimesProps) {
  const { isDarkMode } = useThemeStore();
  
  const prayers = [
    { name: 'Fajr', time: prayerTimes.fajr },
    { name: 'Dhuhr', time: prayerTimes.dhuhr },
    { name: 'Asr', time: prayerTimes.asr },
    { name: 'Maghrib', time: prayerTimes.maghrib },
    { name: 'Isha', time: prayerTimes.isha },
    { name: 'Jummah', time: prayerTimes.jummah },
  ];

  return (
    <View style={[
      styles.card, 
      globalStyles.shadow,
      isDarkMode && styles.cardDark
    ]}>
      <Text style={[
        styles.title,
        isDarkMode && styles.titleDark
      ]}>Prayer Times</Text>
      <View style={styles.timesContainer}>
        {prayers.map((prayer, index) => (
          <View 
            key={index} 
            style={[
              styles.prayerRow,
              isDarkMode && styles.prayerRowDark
            ]}
          >
            <Text style={[
              styles.prayerName,
              isDarkMode && styles.prayerNameDark
            ]}>{prayer.name}</Text>
            <Text style={styles.prayerTime}>{prayer.time}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  cardDark: {
    backgroundColor: '#1E1E1E',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  titleDark: {
    color: Colors.white,
  },
  timesContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  prayerRowDark: {
    borderBottomColor: '#333333',
  },
  prayerName: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  prayerNameDark: {
    color: Colors.white,
  },
  prayerTime: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
});