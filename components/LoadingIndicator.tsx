import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import Colors from '@/constants/colors';
import useThemeStore from '@/hooks/useThemeStore';

interface LoadingIndicatorProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingIndicator({ 
  message = 'Loading...', 
  fullScreen = false 
}: LoadingIndicatorProps) {
  const { isDarkMode } = useThemeStore();
  
  if (fullScreen) {
    return (
      <View style={[
        styles.fullScreenContainer,
        isDarkMode && styles.fullScreenContainerDark
      ]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        {message && <Text style={[
          styles.message,
          isDarkMode && styles.messageDark
        ]}>{message}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color={Colors.primary} />
      {message && <Text style={[
        styles.message,
        isDarkMode && styles.messageDark
      ]}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  fullScreenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  fullScreenContainerDark: {
    backgroundColor: '#121212',
  },
  message: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  messageDark: {
    color: '#AAAAAA',
  },
});