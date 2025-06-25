import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';
import { globalStyles } from '@/constants/theme';
import useThemeStore from '@/hooks/useThemeStore';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  const { isDarkMode } = useThemeStore();
  
  return (
    <View style={styles.container}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={[
        styles.title,
        isDarkMode && styles.titleDark
      ]}>{title}</Text>
      <Text style={[
        styles.message,
        isDarkMode && styles.messageDark
      ]}>{message}</Text>
      {action && <View style={styles.actionContainer}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  titleDark: {
    color: Colors.white,
  },
  message: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  messageDark: {
    color: '#AAAAAA',
  },
  actionContainer: {
    marginTop: 8,
  },
});