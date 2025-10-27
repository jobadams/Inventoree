import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart3, TrendingUp, Package, DollarSign } from 'lucide-react-native';
import { useInventory } from '../../contexts/inventory-context';
import { useTheme } from '../../contexts/theme-context'; // 🌙 Theme support
import Card from '../../components/ui/Card';

const { width } = Dimensions.get('window');

export default function ReportsScreen() {
  const { products, sales, categories, getTotalInventoryValue, getSalesAnalytics, getLowStockProducts } = useInventory();
  const [selectedPeriod] = useState(30);

  const { theme } = useTheme(); // 🌗 Use theme
  const isDark = theme === 'dark';

  // 🎨 Define color palette
  const colors = {
    background: isDark ? '#0f172a' : '#f8fafc',
    card: isDark ? '#1e293b' : '#ffffff',
    text: isDark ? '#f1f5f9' : '#1e293b',
    secondaryText: isDark ? '#94a3b8' : '#64748b',
    accent: '#2563eb',
    success: '#10b981',
    warning: '#f59e0b',
    border: isDark ? '#334155' : '#e2e8f0',
    chartBar: isDark ? '#3b82f6' : '#2563eb',
    chartMuted: isDark ? '#475569' : '#e2e8f0',
    alertBg: isDark ? '#451a03' : '#fffbeb',
    alertText: isDark ? '#fde68a' : '#92400e',
  };

  const salesAnalytics = getSalesAnalytics(selectedPeriod);
  const totalInventoryValue = getTotalInventoryValue();
  const lowStockProducts = getLowStockProducts();

  // Category distribution
  const categoryStats = categories
    .map(category => {
      const categoryProducts = products.filter(p => p.categoryId === category.id);
      const totalValue = categoryProducts.reduce((sum, p) => sum + p.quantity * p.cost, 0);
      return {
        name: category.name,
        color: category.color || colors.accent,
        productCount: categoryProducts.length,
        percentage: products.length > 0 ? (categoryProducts.length / products.length) * 100 : 0,
      };
    })
    .sort((a, b) => b.totalValue - a.totalValue);

  // Monthly sales trend
  const monthlySales = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const monthSales = sales.filter(sale => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= monthStart && saleDate <= monthEnd;
    });

    const revenue = monthSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    monthlySales.push({
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      revenue,
    });
  }

  const maxRevenue = Math.max(...monthlySales.map(m => m.revenue));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Reports & Analytics</Text>
        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
          Business insights and performance metrics
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Key Metrics */}
        <View style={styles.metricsContainer}>
          <Card style={[styles.metricCard, { backgroundColor: colors.card }]}>
            <View style={styles.metricIcon}>
              <Package size={24} color={colors.accent} />
            </View>
            <Text style={[styles.metricValue, { color: colors.text }]}>{products.length}</Text>
            <Text style={[styles.metricLabel, { color: colors.secondaryText }]}>Total Products</Text>
          </Card>

          <Card style={[styles.metricCard, { backgroundColor: colors.card }]}>
            <View style={styles.metricIcon}>
              <DollarSign size={24} color={colors.success} />
            </View>
            <Text style={[styles.metricValue, { color: colors.text }]}>
              UGX{totalInventoryValue.toLocaleString()}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.secondaryText }]}>Inventory Value</Text>
          </Card>
        </View>

        <View style={styles.metricsContainer}>
          <Card style={[styles.metricCard, { backgroundColor: colors.card }]}>
            <View style={styles.metricIcon}>
              <TrendingUp size={24} color={colors.accent} />
            </View>
            <Text style={[styles.metricValue, { color: colors.text }]}>
              {salesAnalytics.totalSales}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.secondaryText }]}>
              Sales (30 days)
            </Text>
          </Card>

          <Card style={[styles.metricCard, { backgroundColor: colors.card }]}>
            <View style={styles.metricIcon}>
              <BarChart3 size={24} color={colors.warning} />
            </View>
            <Text style={[styles.metricValue, { color: colors.text }]}>
              UGX{salesAnalytics.totalRevenue.toLocaleString()}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.secondaryText }]}>
              Revenue (30 days)
            </Text>
          </Card>
        </View>

        {/* Sales Trend */}
        <Card style={[styles.chartCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>Sales Trend (Last 6 Months)</Text>
          <View style={styles.chart}>
            {monthlySales.map((month, index) => {
              const barHeight = maxRevenue > 0 ? (month.revenue / maxRevenue) * 120 : 0;
              return (
                <View key={index} style={styles.chartBar}>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barHeight || 4,
                          backgroundColor:
                            month.revenue > 0 ? colors.chartBar : colors.chartMuted,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, { color: colors.secondaryText }]}>{month.month}</Text>
                  <Text style={[styles.barValue, { color: colors.secondaryText }]}>
                    UGX{month.revenue.toFixed(0)}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Category Distribution */}
        <Card style={[styles.chartCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>Inventory by Category</Text>
          <View style={styles.categoryList}>
            {categoryStats.map((category, index) => (
              <View key={index} style={styles.categoryItem}>
                <View style={styles.categoryInfo}>
                  <View
                    style={[
                      styles.categoryColor,
                      { backgroundColor: category.color || colors.accent },
                    ]}
                  />
                  <Text style={[styles.categoryName, { color: colors.text }]}>
                    {category.name}
                  </Text>
                </View>
                <View style={styles.categoryStats}>
                  <Text style={[styles.categoryValue, { color: colors.secondaryText }]}>
                    {category.productCount} products
                  </Text>
                  <Text style={[styles.categoryPercentage, { color: colors.secondaryText }]}>
                    {category.percentage.toFixed(1)}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <Card
            style={[
              styles.alertCard,
              { backgroundColor: colors.alertBg, borderLeftColor: colors.warning },
            ]}
          >
            <Text style={[styles.alertTitle, { color: colors.alertText }]}>Low Stock Alert</Text>
            <Text style={[styles.alertDescription, { color: colors.alertText }]}>
              {lowStockProducts.length} product
              {lowStockProducts.length > 1 ? 's' : ''} need restocking
            </Text>
            {lowStockProducts.slice(0, 5).map(product => (
              <View key={product.id} style={styles.lowStockItem}>
                <Text style={[styles.lowStockName, { color: colors.alertText }]}>
                  {product.name}
                </Text>
                <Text style={[styles.lowStockQuantity, { color: colors.alertText }]}>
                  {product.quantity} / {product.minQuantity} min
                </Text>
              </View>
            ))}
            {lowStockProducts.length > 5 && (
              <Text style={[styles.moreItems, { color: colors.alertText }]}>
                +{lowStockProducts.length - 5} more items need attention
              </Text>
            )}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 16, marginTop: 4 },
  scrollView: { flex: 1, paddingHorizontal: 20 },
  metricsContainer: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  metricCard: { flex: 1, alignItems: 'center', paddingVertical: 20 },
  metricIcon: { marginBottom: 12 },
  metricValue: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  metricLabel: { fontSize: 12, textAlign: 'center' },
  chartCard: { marginBottom: 16, borderRadius: 12, padding: 12 },
  chartTitle: { fontSize: 18, fontWeight: '600', marginBottom: 20 },
  chart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 160 },
  chartBar: { alignItems: 'center', flex: 1 },
  barContainer: { height: 120, justifyContent: 'flex-end', marginBottom: 8 },
  bar: { width: 20, borderRadius: 2, minHeight: 4 },
  barLabel: { fontSize: 12, marginBottom: 2 },
  barValue: { fontSize: 10 },
  categoryList: { gap: 16 },
  categoryItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  categoryColor: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  categoryName: { fontSize: 14, fontWeight: '500' },
  categoryStats: { alignItems: 'flex-end' },
  categoryValue: { fontSize: 14 },
  categoryPercentage: { fontSize: 12 },
  alertCard: { borderLeftWidth: 4, marginBottom: 16, padding: 16 },
  alertTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  alertDescription: { fontSize: 14, marginBottom: 16 },
  lowStockItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  lowStockName: { fontSize: 14, fontWeight: '500' },
  lowStockQuantity: { fontSize: 12 },
  moreItems: { fontSize: 12, fontStyle: 'italic', textAlign: 'center', marginTop: 8 },
});
