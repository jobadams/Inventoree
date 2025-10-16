import React, { useState, useContext, createContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Package,
  TrendingUp,
  AlertTriangle,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react-native';
import { useInventory } from '../../contexts/inventory-context';
import { useAuth } from '../../contexts/auth-context';
import { Redirect } from 'expo-router';
import Card from '../../components/ui/Card';

// === Responsive layout setup ===
const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const cardWidth = isWeb ? (width - 320 - 60) / 2 : (width - 60) / 2;

// === Theme Context Setup ===
type Theme = 'light' | 'dark';
const ThemeContext = createContext({
  theme: 'light' as Theme,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const toggleTheme = () =>
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// === Define Color Palettes ===
const themeColors = {
  light: {
    background: '#f8fafc',
    text: '#1e293b',
    subtext: '#64748b',
    primary: '#2563eb',
    accent: '#e0f2fe',
    card: '#ffffff',
    warningBg: '#fffbeb',
    warningText: '#92400e',
  },
  dark: {
    background: '#0f172a',
    text: '#f1f5f9',
    subtext: '#94a3b8',
    primary: '#3b82f6',
    accent: '#1e293b',
    card: '#1e293b',
    warningBg: '#78350f',
    warningText: '#fde68a',
  },
};

export default function DashboardScreen() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const {
    products,
    getLowStockProducts,
    getTotalInventoryValue,
    getSalesAnalytics,
    isLoading,
  } = useInventory();
  const { theme, toggleTheme } = useTheme();
  const colors = themeColors[theme];

  if (authLoading) return null;
  if (!user) return <Redirect href="/(auth)/login" />;

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.subtext }]}>
            Loading dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const lowStockProducts = getLowStockProducts();
  const totalValue = getTotalInventoryValue();
  const salesAnalytics = getSalesAnalytics(30);

  const stats = [
    {
      title: 'Total Products',
      value: products.length.toString(),
      icon: Package,
      color: colors.primary,
      bgColor: colors.accent,
    },
    {
      title: 'Low Stock Items',
      value: lowStockProducts.length.toString(),
      icon: AlertTriangle,
      color: '#f59e0b',
      bgColor: colors.warningBg,
    },
    {
      title: '30-Day Sales',
      value: salesAnalytics.totalSales.toString(),
      icon: TrendingUp,
      color: '#8b5cf6',
      bgColor: theme === 'light' ? '#f3e8ff' : '#4c1d95',
    },
  ];

  const handleLogout = () => logout();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* === Header Section === */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Dashboard</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>
            Welcome back, {user?.name}!
          </Text>

          {/* Logout + Theme Toggle */}
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: colors.accent }]}
              onPress={toggleTheme}
            >
              {theme === 'light' ? (
                <Moon size={20} color={colors.primary} />
              ) : (
                <Sun size={20} color={colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: colors.accent }]}
              onPress={handleLogout}
            >
              <LogOut size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* === Stats Cards === */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                style={[
                  styles.statCard,
                  { width: cardWidth, backgroundColor: colors.card },
                ]}
              >
                <View style={styles.statHeader}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: stat.bgColor },
                    ]}
                  >
                    <Icon size={24} color={stat.color} />
                  </View>
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {stat.value}
                </Text>
                <Text style={[styles.statTitle, { color: colors.subtext }]}>
                  {stat.title}
                </Text>
              </Card>
            );
          })}
        </View>

        {/* === Low Stock Section === */}
        {lowStockProducts.length > 0 && (
          <Card
            style={[
              styles.alertCard,
              { backgroundColor: colors.warningBg, borderLeftColor: '#f59e0b' },
            ]}
          >
            <View style={styles.alertHeader}>
              <AlertTriangle size={20} color="#f59e0b" />
              <Text style={[styles.alertTitle, { color: colors.warningText }]}>
                Low Stock Alert
              </Text>
            </View>
            <Text
              style={[styles.alertDescription, { color: colors.warningText }]}
            >
              {lowStockProducts.length} product
              {lowStockProducts.length > 1 ? 's' : ''} running low on stock
            </Text>
            <ScrollView style={styles.lowStockScroll} nestedScrollEnabled>
              {lowStockProducts.map((product) => {
                const isCritical = product.quantity <= product.minQuantity / 2;
                return (
                  <View
                    key={product.id}
                    style={[
                      styles.lowStockItem,
                      isCritical && styles.criticalItem,
                    ]}
                  >
                    <Text style={[styles.productName, { color: colors.warningText }]}>
                      {product.name}
                    </Text>
                    <Text style={[styles.stockLevel, { color: colors.subtext }]}>
                      {product.quantity} left (min: {product.minQuantity})
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </Card>
        )}

        {/* === Sales Overview === */}
        <Card style={[styles.salesCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Sales Overview (Last 30 Days)
          </Text>
          <View style={styles.salesStats}>
            <View style={styles.salesStat}>
              <Text style={[styles.salesValue, { color: colors.primary }]}>
                UGX{salesAnalytics.totalRevenue.toLocaleString()}
              </Text>
              <Text style={[styles.salesLabel, { color: colors.subtext }]}>
                Total Revenue
              </Text>
            </View>
            <View style={styles.salesStat}>
              <Text style={[styles.salesValue, { color: colors.primary }]}>
                {salesAnalytics.totalQuantitySold}
              </Text>
              <Text style={[styles.salesLabel, { color: colors.subtext }]}>
                Items Sold
              </Text>
            </View>
            <View style={styles.salesStat}>
              <Text style={[styles.salesValue, { color: colors.primary }]}>
                UGX{salesAnalytics.averageOrderValue.toFixed(2)}
              </Text>
              <Text style={[styles.salesLabel, { color: colors.subtext }]}>
                Avg Order Value
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

// === Styles (mostly layout & spacing) ===
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16 },
  scrollView: { flex: 1 },
  header: { padding: 20, paddingBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 16, marginTop: 4 },
  headerButtons: {
    position: 'absolute',
    right: 20,
    top: 20,
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  statCard: { marginBottom: 16, minHeight: 120 },
  statHeader: { marginBottom: 12 },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  statTitle: { fontSize: 14 },
  alertCard: {
    marginHorizontal: 20,
    borderLeftWidth: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  alertHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  alertTitle: { fontSize: 16, fontWeight: '600', marginLeft: 8 },
  alertDescription: { fontSize: 14, marginBottom: 12 },
  lowStockScroll: { maxHeight: 180, marginTop: 8, gap: 8 },
  lowStockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  criticalItem: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  productName: { fontSize: 14, fontWeight: '500', flex: 1 },
  stockLevel: { fontSize: 12 },
  salesCard: { marginHorizontal: 20, marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  salesStats: { flexDirection: 'row', justifyContent: 'space-between' },
  salesStat: { alignItems: 'center', flex: 1 },
  salesValue: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  salesLabel: { fontSize: 12, textAlign: 'center' },
});
