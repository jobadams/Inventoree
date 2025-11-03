import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/auth-context';
import { useRouter, Slot } from 'expo-router';
import Toolbar from '../../components/ui/Toolbar';
import { useTheme } from '../../contexts/theme-context'; // ✅ useTheme instead of ThemeProvider


export default function TabsLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { colors } = useTheme(); // access global theme colors

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/(auth)/login');
    }
  }, [user, isLoading]);

  if (isLoading || !user) return null;

  // 🖥 Web layout with toolbar on side
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.sidebar, { backgroundColor: colors.surface, borderRightColor: colors.border }]}>
          <Toolbar />
        </View>
        <View style={styles.content}>
          <Slot />
        </View>
      </View>
    );
  }

  // 📱 Mobile layout with bottom toolbar
  return (
    <SafeAreaView style={[styles.mobileContainer, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Slot />
      </View>
      <View style={[styles.bottomToolbar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <Toolbar />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Web/Desktop layout
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 280,
    borderRightWidth: 1,
  },
  content: {
    flex: 1,
  },

  // Mobile layout
  mobileContainer: {
    flex: 1,
  },
  bottomToolbar: {
    borderTopWidth: 1,
    paddingVertical: 10,
  },
});
