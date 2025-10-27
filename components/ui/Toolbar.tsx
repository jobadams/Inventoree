import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Link, usePathname } from 'expo-router';
import {
  Home, Package, ShoppingCart, Users,
  Tag, MessageSquare, BarChart3, Settings, UserCog
} from 'lucide-react-native';
import { useTheme } from '../../contexts/theme-context';

// 🔹 Simulate permission function — replace this with your actual permission logic
const hasPermission = (role: string) => role === 'admin'; // Example: hardcoded for now

export default function Toolbar() {
  const pathname = usePathname();
  const userRole = 'staff'; // or 'admin' — replace this with your actual user role logic

  // ✅ Use theme context
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // ✅ Base menu items
  const menuItems = [
    { id: 'dashboard', icon: Home, route: '/(tabs)/' },
    { id: 'inventory', icon: Package, route: '/(tabs)/inventory' },
    { id: 'sales', icon: ShoppingCart, route: '/(tabs)/sales' },
    { id: 'suppliers', icon: Users, route: '/(tabs)/suppliers' },
    { id: 'categories', icon: Tag, route: '/(tabs)/categories' },
    { id: 'chats', icon: MessageSquare, route: '/(tabs)/chats' },
    { id: 'reports', icon: BarChart3, route: '/(tabs)/reports' },
  ];

  // ✅ Settings-related buttons
  const settingsButtons = [
    { id: 'profile', icon: UserCog, route: '/(tabs)/profile' },
  ];

  // ✅ Combine based on role
  const getFilteredMenuItems = () => {
    let visibleItems = [...menuItems];

    if (hasPermission(userRole)) {
      visibleItems.push({
        id: 'settings',
        icon: Settings,
        route: '/(tabs)/profile',
      });
    } else {
      visibleItems = [...visibleItems, ...settingsButtons];
    }

    return visibleItems;
  };

  const visibleItems = getFilteredMenuItems();

  // ✅ Dynamic colors based on theme
  const backgroundColor = isDark ? '#0f172a' : '#f8fafc';
  const borderColor = isDark ? '#1e293b' : '#e2e8f0';
  const inactiveColor = isDark ? '#94a3b8' : '#64748b';
  const activeColor = isDark ? '#38bdf8' : '#2563eb';

  return (
    <View style={[styles.toolbar, { backgroundColor, borderTopColor: borderColor }]}>
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname.includes(item.id);
        return (
          <Link key={item.id} href={item.route} asChild>
            <TouchableOpacity style={styles.button}>
              <Icon size={22} color={isActive ? activeColor : inactiveColor} />
            </TouchableOpacity>
          </Link>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
  },
  button: {
    alignItems: 'center',
  },
});
