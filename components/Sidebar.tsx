import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  Tag, 
  BarChart3, 
  Settings,
  LogOut,
  Home,
  MessageSquare,
  UserCog,
  Bell,
  Shield,
} from 'lucide-react-native';
import { useAuth } from '../contexts/auth-context';

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, hasPermission } = useAuth();

  const handleNavigation = (route: string) => {
    router.push(route as any);
    onClose?.();
  };

  const handleLogout = () => {
    logout();
    onClose?.();
  };

  // ✅ Main Sidebar Menu
  const menuItems = [
    { id: 'dashboard', title: 'Dashboard', icon: Home, route: '/' },
    { id: 'inventory', title: 'Inventory', icon: Package, route: '/inventory' },
    { id: 'sales', title: 'Sales', icon: ShoppingCart, route: '/sales' },
    { id: 'suppliers', title: 'Suppliers', icon: Users, route: '/suppliers' },
    { id: 'categories', title: 'Categories', icon: Tag, route: '/categories' },
    { id: 'chats', title: 'Chats', icon: MessageSquare, route: '/chats' },
    { id: 'reports', title: 'Reports', icon: BarChart3, route: '/reports' },
  ];

  // ✅ Settings-related Buttons (to show for everyone, including staff)
  const settingsButtons = [
    { id: 'profile', title: 'Profile Settings', icon: UserCog, route: '/profile' },
    // { id: 'notifications', title: 'Notifications', icon: Bell, route: '/settings/notifications' },
    // { id: 'security', title: 'Security', icon: Shield, route: '/settings/security' },
    // { id: 'system', title: 'System Preferences', icon: Settings, route: '/settings/system' },
  ];

  // ✅ Combine main + settings buttons for staff
  const getFilteredMenuItems = () => {
    let visibleItems = [...menuItems];

    // Show Settings items for admin normally
    if (hasPermission('admin')) {
      visibleItems.push({
        id: 'settings',
        title: 'Settings',
        icon: Settings,
        route: '/profile',
      });
    } else {
      // For staff, show all settings-related buttons on the dashboard
      visibleItems = [...visibleItems, ...settingsButtons];
    }

    return visibleItems;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>Inventoree</Text>
        <Text style={styles.subtitle}>Inventory Management</Text>
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userRole}>{user?.role?.toUpperCase()}</Text>
      </View>

      {/* Menu List */}
      <ScrollView style={styles.menu}>
        {getFilteredMenuItems().map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.route;

          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, isActive && styles.activeMenuItem]}
              onPress={() => handleNavigation(item.route)}
            >
              <Icon 
                size={20} 
                color={isActive ? '#2563eb' : '#64748b'} 
              />
              <Text style={[styles.menuText, isActive && styles.activeMenuText]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 50,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  userInfo: {
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  userRole: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  menu: {
    flex: 1,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 10,
    borderRadius: 8,
  },
  activeMenuItem: {
    backgroundColor: '#e0f2fe',
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  menuText: {
    fontSize: 16,
    color: '#64748b',
    marginLeft: 12,
  },
  activeMenuText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  logoutText: {
    fontSize: 16,
    color: '#ef4444',
    marginLeft: 12,
    fontWeight: '600',
  },
});
