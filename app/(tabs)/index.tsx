import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package, TrendingUp, AlertTriangle, DollarSign, LogOut } from 'lucide-react-native';
import { useInventory } from '../../contexts/inventory-context';
import { useAuth } from '../../contexts/auth-context';
import { Redirect } from 'expo-router';
import Card from '../../components/ui/Card';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const cardWidth = isWeb ? (width - 320 - 60) / 2 : (width - 60) / 2; // Account for sidebar on web

export default function DashboardScreen() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const { 
    products, 
    getLowStockProducts, 
    getTotalInventoryValue, 
    getSalesAnalytics,
    isLoading 
  } = useInventory();

  if (authLoading) {
    return null;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading dashboard...</Text>
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
      color: '#2563eb',
      bgColor: '#eff6ff',
    },
    {
      title: 'Low Stock Items',
      value: lowStockProducts.length.toString(),
      icon: AlertTriangle,
      color: '#f59e0b',
      bgColor: '#fffbeb',
    },
    // {
    //   title: 'Inventory Value',
    //   value: `UGX${totalValue.toLocaleString()}`,
    //   icon: DollarSign,
    //   color: '#10b981',
    //   bgColor: '#ecfdf5',
    // },
    {
      title: '30-Day Sales',
      value: salesAnalytics.totalSales.toString(),
      icon: TrendingUp,
      color: '#8b5cf6',
      bgColor: '#f3e8ff',
    },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Welcome back, {user?.name}!</Text>

          {/* Logout button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#2563eb" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} style={[styles.statCard, { width: cardWidth }]}>
                <View style={styles.statHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: stat.bgColor }]}>
                    <Icon size={24} color={stat.color} />
                  </View>
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statTitle}>{stat.title}</Text>
              </Card>
            );
          })}
        </View>

        {lowStockProducts.length > 0 && (
          <Card style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <AlertTriangle size={20} color="#f59e0b" />
              <Text style={styles.alertTitle}>Low Stock Alert</Text>
            </View>
            <Text style={styles.alertDescription}>
              {lowStockProducts.length} product{lowStockProducts.length > 1 ? 's' : ''} running low on stock
            </Text>
            <ScrollView style={styles.lowStockScroll} nestedScrollEnabled>
              {lowStockProducts.map((product) => {
                const isCritical = product.quantity <= product.minQuantity / 2;
                return (
                  <View key={product.id} style={[styles.lowStockItem, isCritical && styles.criticalItem]}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.stockLevel}>
                      {product.quantity} left (min: {product.minQuantity})
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </Card>
        )}

        <Card style={styles.salesCard}>
          <Text style={styles.cardTitle}>Sales Overview (Last 30 Days)</Text>
          <View style={styles.salesStats}>
            <View style={styles.salesStat}>
              <Text style={styles.salesValue}>UGX{salesAnalytics.totalRevenue.toLocaleString()}</Text>
              <Text style={styles.salesLabel}>Total Revenue</Text>
            </View>
            <View style={styles.salesStat}>
              <Text style={styles.salesValue}>{salesAnalytics.totalQuantitySold}</Text>
              <Text style={styles.salesLabel}>Items Sold</Text>
            </View>
            <View style={styles.salesStat}>
              <Text style={styles.salesValue}>UGX{salesAnalytics.averageOrderValue.toFixed(2)}</Text>
              <Text style={styles.salesLabel}>Avg Order Value</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  logoutButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#e0f2fe',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  statCard: {
    marginBottom: 16,
    minHeight: 120,
  },
  statHeader: {
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: '#64748b',
  },
  alertCard: {
    marginHorizontal: 20,
    backgroundColor: '#fffbeb',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginLeft: 8,
  },
  alertDescription: {
    fontSize: 14,
    color: '#92400e',
    marginBottom: 12,
  },
  lowStockScroll: {
    maxHeight: 180,
    marginTop: 8,
    gap: 8,
  },
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
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#92400e',
    flex: 1,
  },
  stockLevel: {
    fontSize: 12,
    color: '#a16207',
  },
  salesCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  salesStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  salesStat: {
    alignItems: 'center',
    flex: 1,
  },
  salesValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  salesLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
});
