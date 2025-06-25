import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/colors';

interface ThemeState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  use24HourFormat: boolean;
  toggleTimeFormat: () => void;
  language: string;
  setLanguage: (lang: string) => void;
  getColors: () => typeof Colors;
}

const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDarkMode: false,
      use24HourFormat: false,
      language: 'en',
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      toggleTimeFormat: () => set((state) => ({ use24HourFormat: !state.use24HourFormat })),
      setLanguage: (lang) => set({ language: lang }),
      getColors: () => {
        const { isDarkMode } = get();
        if (isDarkMode) {
          return {
            ...Colors,
            primary: Colors.primary,
            primaryLight: '#2C5F2E',
            secondary: Colors.secondary,
            secondaryLight: '#0D3B69',
            background: '#121212',
            card: '#1E1E1E',
            text: '#FFFFFF',
            textSecondary: '#AAAAAA',
            border: '#333333',
          };
        }
        return Colors;
      }
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useThemeStore;