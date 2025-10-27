import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorValue } from 'react-native/Libraries/StyleSheet/StyleSheet';

export type Theme = 'light' | 'dark';

interface ThemeColors {
  [x: string]: ColorValue;
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
}

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  isLoading: boolean;
  toggleTheme: () => Promise<void>;
  setThemeMode: (newTheme: Theme) => Promise<void>;
}

const lightTheme: ThemeColors = {
  background: '#f8fafc',
  surface: '#ffffff',
  primary: '#4861d1ff',
  secondary: '#7d8796ff',
  text: '#1350c2ff',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  error: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
};

const darkTheme: ThemeColors = {
  background: '#0f172a',
  surface: '#101a2bff',
  primary: '#5772a5ff',
  secondary: '#8091aaff',
  text: '#1f71c2ff',
  textSecondary: '#516b97ff',
  border: '#161b2bff',
  error: '#f87171',
  success: '#34d399',
  warning: '#fbbf24',
};

const STORAGE_KEY = 'inventoree_theme';

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedTheme === 'light' || storedTheme === 'dark') {
        setTheme(storedTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = useCallback(async () => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }, [theme]);

  const setThemeMode = useCallback(async (newTheme: Theme) => {
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }, []);

  const colors = useMemo(() => (theme === 'light' ? lightTheme : darkTheme), [theme]);

  return (
    <ThemeContext.Provider value={{ theme, colors, isLoading, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
