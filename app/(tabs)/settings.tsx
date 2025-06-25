import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Linking, Platform } from 'react-native';
import { ChevronRight, Bell, MapPin, Globe, Moon, Info, Heart, Clock } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { globalStyles } from '@/constants/theme';
import useThemeStore from '@/hooks/useThemeStore';

export default function SettingsScreen() {
  const { isDarkMode, toggleDarkMode, use24HourFormat, toggleTimeFormat } = useThemeStore();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [locationEnabled, setLocationEnabled] = React.useState(true);

  const toggleNotifications = () => setNotificationsEnabled(prev => !prev);
  const toggleLocation = () => setLocationEnabled(prev => !prev);

  const handleAboutPress = () => {
    Linking.openURL('https://kamal-aldeen.com');
  };

  const handleRatePress = () => {
    const url = Platform.OS === 'ios' 
      ? 'https://apps.apple.com/us/app/salah-journal/id6747736982'
      : 'https://play.google.com/store/apps/details?id=com.kamalaldeen.mosquefinder';
    
    Linking.openURL(url);
  };

  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    hasSwitch: boolean = false,
    switchValue?: boolean,
    onToggle?: () => void,
    onPress?: () => void
  ) => (
    <TouchableOpacity 
      style={[
        styles.settingItem, 
        isDarkMode && styles.settingItemDark
      ]} 
      onPress={onPress}
      disabled={hasSwitch}
    >
      <View style={styles.settingIconContainer}>
        {icon}
      </View>
      <Text style={[
        styles.settingTitle,
        isDarkMode && styles.settingTitleDark
      ]}>{title}</Text>
      {hasSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onToggle}
          trackColor={{ false: Colors.border, true: Colors.primaryLight }}
          thumbColor={switchValue ? Colors.primary : '#f4f3f4'}
        />
      ) : (
        <ChevronRight size={20} color={isDarkMode ? Colors.white : Colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[
      styles.container,
      isDarkMode && styles.containerDark
    ]}>
      <View style={styles.section}>
        <Text style={[
          styles.sectionTitle,
          isDarkMode && styles.sectionTitleDark
        ]}>Preferences</Text>
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
          isDarkMode,
          toggleDarkMode
        )}
        {renderSettingItem(
          <Clock size={20} color={Colors.primary} />,
          use24HourFormat ? '24-hour Time Format' : '12-hour Time Format',
          true,
          use24HourFormat,
          toggleTimeFormat
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
        <Text style={[
          styles.sectionTitle,
          isDarkMode && styles.sectionTitleDark
        ]}>About</Text>
        {renderSettingItem(
          <Info size={20} color={Colors.primary} />,
          'About Mosque Finder',
          false,
          undefined,
          undefined,
          handleAboutPress
        )}
        {renderSettingItem(
          <Heart size={20} color={Colors.primary} />,
          'Rate the App',
          false,
          undefined,
          undefined,
          handleRatePress
        )}
      </View>

      <View style={styles.footer}>
        <Text style={[
          styles.version,
          isDarkMode && styles.versionDark
        ]}>Version 1.0.0</Text>
      </View>
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
  sectionTitleDark: {
    color: '#AAAAAA',
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
  settingItemDark: {
    backgroundColor: '#1E1E1E',
    borderBottomColor: '#333333',
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
  settingTitleDark: {
    color: Colors.white,
  },
  footer: {
    alignItems: 'center',
    padding: 24,
  },
  version: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  versionDark: {
    color: '#AAAAAA',
  },
});