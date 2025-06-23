import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';
import { globalStyles } from '@/constants/theme';

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
  const prayers = [
    { name: 'Fajr', time: prayerTimes.fajr },
    { name: 'Dhuhr', time: prayerTimes.dhuhr },
    { name: 'Asr', time: prayerTimes.asr },
    { name: 'Maghrib', time: prayerTimes.maghrib },
    { name: 'Isha', time: prayerTimes.isha },
    { name: 'Jummah', time: prayerTimes.jummah },
  ];

  return (
    <View style={[styles.card, globalStyles.shadow]}>
      <Text style={styles.title}>Prayer Times</Text>
      <View style={styles.timesContainer}>
        {prayers.map((prayer, index) => (
          <View key={index} style={styles.prayerRow}>
            <Text style={styles.prayerName}>{prayer.name}</Text>
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
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
  prayerName: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  prayerTime: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
});