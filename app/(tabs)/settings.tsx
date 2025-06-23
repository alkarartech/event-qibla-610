import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { ChevronRight, Bell, MapPin, Globe, Moon, Info, Heart } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { globalStyles } from '@/constants/theme';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [locationEnabled, setLocationEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);

  const toggleNotifications = () => setNotificationsEnabled(prev => !prev);
  const toggleLocation = () => setLocationEnabled(prev => !prev);
  const toggleDarkMode = () => setDarkModeEnabled(prev => !prev);

  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    hasSwitch: boolean = false,
    switchValue?: boolean,
    onToggle?: () => void,
    onPress?: () => void
  ) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={hasSwitch}
    >
      <View style={styles.settingIconContainer}>
        {icon}
      </View>
      <Text style={styles.settingTitle}>{title}</Text>
      {hasSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onToggle}
          trackColor={{ false: Colors.border, true: Colors.primaryLight }}
          thumbColor={switchValue ? Colors.primary : '#f4f3f4'}
        />
      ) : (
        <ChevronRight size={20} color={Colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        {renderSettingItem(
          <Bell size={20} color={Colors.primary} />,
          'Notifications',
          true,
          notificationsEnabled,
          toggleNotifications
        )}
        {renderSettingItem(
          <MapPin size={20} color={Colors.primary} />,
          'Location Services',
          true,
          locationEnabled,
          toggleLocation
        )}
        {renderSettingItem(
          <Moon size={20} color={Colors.primary} />,
          'Dark Mode',
          true,
          darkModeEnabled,
          toggleDarkMode
        )}
        {renderSettingItem(
          <Globe size={20} color={Colors.primary} />,
          'Language',
          false,
          undefined,
          undefined,
          () => {}
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        {renderSettingItem(
          <Info size={20} color={Colors.primary} />,
          'About Mosque Finder',
          false,
          undefined,
          undefined,
          () => {}
        )}
        {renderSettingItem(
          <Heart size={20} color={Colors.primary} />,
          'Rate the App',
          false,
          undefined,
          undefined,
          () => {}
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingIconContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  settingTitle: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  footer: {
    alignItems: 'center',
    padding: 24,
  },
  version: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});