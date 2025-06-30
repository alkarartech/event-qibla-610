import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/colors';
import translations from '@/constants/translations';

export type Language = 'en' | 'ar' | 'ur' | 'fa' | 'tr';

interface ThemeState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  use24HourFormat: boolean;
  toggleTimeFormat: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  getColors: () => typeof Colors;
  getText: (key: string) => string;
}

const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDarkMode: false,
      use24HourFormat: false,
      language: 'en',
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      toggleTimeFormat: () => set((state) => ({ use24HourFormat: !state.use24HourFormat })),
      setLanguage: (lang) => set({ language: lang as Language }),
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
      },
      getText: (key) => {
        const { language } = get();
        // Get the translations for the current language
        const langTranslations = translations[language] || translations.en;
        
        // Return the translation or fallback to English or the key itself
        return langTranslations[key] || translations.en[key] || key;
      }
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useThemeStore;