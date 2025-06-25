import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Search, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import useThemeStore from '@/hooks/useThemeStore';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export default function SearchBar({ 
  value, 
  onChangeText, 
  placeholder = 'Search', 
  onClear 
}: SearchBarProps) {
  const { isDarkMode } = useThemeStore();
  
  return (
    <View style={styles.container}>
      <View style={[
        styles.searchContainer,
        isDarkMode && styles.searchContainerDark
      ]}>
        <Search size={20} color={isDarkMode ? Colors.white : Colors.textSecondary} style={styles.icon} />
        <TextInput
          style={[
            styles.input,
            isDarkMode && styles.inputDark
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isDarkMode ? '#AAAAAA' : Colors.textSecondary}
        />
        {value.length > 0 && onClear && (
          <TouchableOpacity onPress={onClear} style={styles.clearButton}>
            <X size={18} color={isDarkMode ? Colors.white : Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchContainerDark: {
    backgroundColor: '#2a2a2a',
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    height: '100%',
  },
  inputDark: {
    color: Colors.white,
  },
  clearButton: {
    padding: 4,
  },
});