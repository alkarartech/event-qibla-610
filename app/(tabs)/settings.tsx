import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Linking, Platform, Modal, FlatList } from 'react-native';
import { ChevronRight, Bell, Moon, Info, Heart, Clock, Globe, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { globalStyles } from '@/constants/theme';
import useThemeStore from '@/hooks/useThemeStore';

// Available languages
const languages = [
  { id: 'en', name: 'English' },
  { id: 'ar', name: 'Arabic' },
  { id: 'ur', name: 'Urdu' },
  { id: 'fa', name: 'Farsi' },
  { id: 'tr', name: 'Turkish' }
];

export default function SettingsScreen() {
  const { isDarkMode, toggleDarkMode, use24HourFormat, toggleTimeFormat, language, setLanguage } = useThemeStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const toggleNotifications = () => setNotificationsEnabled(prev => !prev);

  const handleAboutPress = () => {
    Linking.openURL('https://kamal-aldeen.com');
  };

  const handleRatePress = () => {
    const url = Platform.OS === 'ios' 
      ? 'https://apps.apple.com/us/app/salah-journal/id6747736982'
      : 'https://play.google.com/store/apps/details?id=com.kamalaldeen.mosquefinder';
    
    Linking.openURL(url);
  };

  const handleLanguageSelect = (langId: string) => {
    setLanguage(langId);
    setShowLanguageModal(false);
  };

  const getLanguageName = () => {
    const lang = languages.find(l => l.id === language);
    return lang ? lang.name : 'English';
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
          `Language: ${getLanguageName()}`,
          false,
          undefined,
          undefined,
          () => setShowLanguageModal(true)
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

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            isDarkMode && styles.modalContentDark
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[
                styles.modalTitle,
                isDarkMode && styles.modalTitleDark
              ]}>Select Language</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <X size={24} color={isDarkMode ? Colors.white : Colors.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={languages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.languageItem,
                    language === item.id && styles.selectedLanguageItem
                  ]}
                  onPress={() => handleLanguageSelect(item.id)}
                >
                  <Text style={[
                    styles.languageItemText,
                    language === item.id && styles.selectedLanguageItemText,
                    isDarkMode && styles.languageItemTextDark
                  ]}>
                    {item.name}
                  </Text>
                  {language === item.id && (
                    <View style={styles.selectedIndicator} />
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.languageList}
            />
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    width: '80%',
    maxHeight: '70%',
    ...globalStyles.shadow,
  },
  modalContentDark: {
    backgroundColor: '#1E1E1E',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  modalTitleDark: {
    color: Colors.white,
  },
  languageList: {
    paddingBottom: 16,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  selectedLanguageItem: {
    backgroundColor: Colors.primaryLight,
  },
  languageItemText: {
    fontSize: 16,
    color: Colors.text,
  },
  languageItemTextDark: {
    color: Colors.white,
  },
  selectedLanguageItemText: {
    fontWeight: '600',
    color: Colors.primary,
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
});