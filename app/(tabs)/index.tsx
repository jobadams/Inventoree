import React from 'react';
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
  DollarSign,
} from 'lucide-react-native';
import { useInventory } from '../../contexts/inventory-context';
import { useAuth } from '../../contexts/auth-context';
import { Redirect } from 'expo-router';
import Card from '../../components/ui/Card';
import { useTheme } from '../../contexts/theme-context';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const cardWidth = isWeb ? (width - 320 - 60) / 2 : (width - 60) / 2;

export default function DashboardScreen() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const {
    products,
    getLowStockProducts,
    getTotalInventoryValue,
    getSalesAnalytics,
    isLoading,
  } = useInventory();

  const { theme, toggleTheme, colors } = useTheme();
  const isDark = theme === 'dark';

  if (authLoading) return null;
  if (!user) return <Redirect href="/(auth)/login" />;

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.subtext }]}>Loading dashboard...</Text>
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
      bgColor: isDark ? '#78350f' : '#fef3c7',
    },
    {
      title: '30-Day Sales',
      value: salesAnalytics.totalSales.toString(),
      icon: TrendingUp,
      color: '#8b5cf6',
      bgColor: isDark ? '#5b21b6' : '#ede9fe',
    },
    {
      title: 'Inventory Value',
      value: `UGX${totalValue.toLocaleString()}`,
      icon: DollarSign,
      color: '#10b981',
      bgColor: isDark ? '#064e3b' : '#d1fae5',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* === Header Section === */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Dashboard</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>
            Welcome back, {user?.name || 'User'}!
          </Text>

          {/* === Top Buttons (Theme + Logout) === */}
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
              onPress={logout}
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
                <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                <Text style={[styles.statTitle, { color: colors.subtext }]}>{stat.title}</Text>
              </Card>
            );
          })}
        </View>

        {/* === Low Stock Section === */}
        {lowStockProducts.length > 0 && (
          <Card
            style={[
              styles.alertCard,
              { backgroundColor: colors.card, borderLeftColor: '#f59e0b' },
            ]}
          >
            <View style={styles.alertHeader}>
              <AlertTriangle size={20} color="#f59e0b" />
              <Text style={[styles.alertTitle, { color: colors.text }]}>Low Stock Alert</Text>
            </View>
            <Text style={[styles.alertDescription, { color: colors.subtext }]}>
              {lowStockProducts.length} product
              {lowStockProducts.length > 1 ? 's' : ''} running low on stock
            </Text>
            {lowStockProducts.slice(0, 5).map((product) => {
              const isCritical = product.quantity <= product.minQuantity / 2;
              return (
                <View
                  key={product.id}
                  style={[
                    styles.lowStockItem,
                    isCritical && styles.criticalItem,
                    { backgroundColor: isCritical ? (isDark ? '#7f1d1d' : '#fef2f2') : 'transparent' },
                  ]}
                >
                  <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>
                  <Text style={[styles.stockLevel, { color: colors.subtext }]}>
                    {product.quantity} left (min: {product.minQuantity})
                  </Text>
                </View>
              );
            })}
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
              <Text style={[styles.salesLabel, { color: colors.subtext }]}>Total Revenue</Text>
            </View>
            <View style={styles.salesStat}>
              <Text style={[styles.salesValue, { color: colors.primary }]}>
                {salesAnalytics.totalQuantitySold}
              </Text>
              <Text style={[styles.salesLabel, { color: colors.subtext }]}>Items Sold</Text>
            </View>
            <View style={styles.salesStat}>
              <Text style={[styles.salesValue, { color: colors.primary }]}>
                UGX{salesAnalytics.averageOrderValue.toFixed(2)}
              </Text>
              <Text style={[styles.salesLabel, { color: colors.subtext }]}>Avg Order Value</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

// === Styles ===
const styles = StyleSheet.create({
  container: { flex: 1 },
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
  headerButton: { padding: 8, borderRadius: 8 },
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
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  alertHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  alertTitle: { fontSize: 16, fontWeight: '600', marginLeft: 8 },
  alertDescription: { fontSize: 14, marginBottom: 12 },
  lowStockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderRadius: 6,
  },
  criticalItem: { paddingHorizontal: 8 },
  productName: { fontSize: 14, fontWeight: '500', flex: 1 },
  stockLevel: { fontSize: 12 },
  salesCard: { marginHorizontal: 20, marginBottom: 20, paddingVertical: 16 },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  salesStats: { flexDirection: 'row', justifyContent: 'space-between' },
  salesStat: { alignItems: 'center', flex: 1 },
  salesValue: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  salesLabel: { fontSize: 12, textAlign: 'center' },
});
