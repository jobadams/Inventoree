import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/auth-context';
import { useRouter, Slot } from 'expo-router';
import Toolbar from '../../components/ui/Toolbar';

export default function TabsLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/(auth)/login');
    }
  }, [user, isLoading]);

  if (isLoading || !user) return null;

  // 🖥 Web layout with toolbar on side
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.sidebar}>
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
    <SafeAreaView style={styles.mobileContainer}>
      <View style={styles.content}>
        <Slot />
      </View>
      <View style={styles.bottomToolbar}>
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
    backgroundColor: '#f8fafc',
  },
  sidebar: {
    width: 280,
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
  },
  content: {
    flex: 1,
  },

  // Mobile layout
  mobileContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  bottomToolbar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingVertical: 10,
  },
});
