import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, ShoppingCart, DollarSign } from 'lucide-react-native';
import { useInventory } from '../../contexts/inventory-context';
import { useAuth } from '../../contexts/auth-context';
import { useTheme } from '../../contexts/theme-context'; // 🌙 Import theme
import { Product, Sale } from '../../types/inventory';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

// Format number as UGX
const formatUGX = (amount: number) => `UGX ${amount.toLocaleString('en-UG')}`;

export default function SalesScreen() {
  const { products, sales, recordSale } = useInventory();
  const { user, hasPermission } = useAuth();
  const { theme } = useTheme(); // 🎨 Access theme
  const isDark = theme === 'dark';

  // 🎨 Theme colors
  const colors = {
    background: isDark ? '#0f172a' : '#f8fafc',
    text: isDark ? '#f1f5f9' : '#1e293b',
    secondaryText: isDark ? '#cbd5e1' : '#64748b',
    card: isDark ? '#1e293b' : '#ffffff',
    border: isDark ? '#334155' : '#e2e8f0',
    accent: '#2563eb',
    success: '#10b981',
  };

  const [showSaleModal, setShowSaleModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);

  const availableProducts = products.filter((p: Product) => p.quantity > 0);

  const handleRecordSale = async () => {
    if (!selectedProduct || !quantity) {
      Alert.alert('Error', 'Please select a product and enter quantity');
      return;
    }

    const product = products.find((p: Product) => p.id === selectedProduct);
    if (!product) {
      Alert.alert('Error', 'Product not found');
      return;
    }

    const saleQuantity = parseInt(quantity);
    if (saleQuantity <= 0 || saleQuantity > product.quantity) {
      Alert.alert('Error', `Invalid quantity. Available: ${product.quantity}`);
      return;
    }

    setLoading(true);
    try {
      await recordSale({
        productId: selectedProduct,
        quantity: saleQuantity,
        unitPrice: product.price,
        totalAmount: product.price * saleQuantity,
        customerName: customerName || undefined,
        userId: user?.id || '',
      });

      setShowSaleModal(false);
      setSelectedProduct('');
      setQuantity('');
      setCustomerName('');
      Alert.alert('Success', 'Sale recorded successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to record sale');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getProductName = (productId: string) => {
    const product = products.find((p: Product) => p.id === productId);
    return product?.name || 'Unknown Product';
  };

  const todaysSales = sales.filter((sale: Sale) => {
    const saleDate = new Date(sale.createdAt);
    const today = new Date();
    return saleDate.toDateString() === today.toDateString();
  });

  const todaysRevenue = todaysSales.reduce((total: number, sale: Sale) => total + sale.totalAmount, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Sales Management</Text>
        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
          {sales.length} total sales recorded
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
          <View style={styles.statIcon}>
            <ShoppingCart size={24} color={colors.accent} />
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>{todaysSales.length}</Text>
          <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Today's Sales</Text>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
          <View style={styles.statIcon}>
            <DollarSign size={24} color={colors.success} />
          </View>
          <Text style={[styles.statValue, { color: colors.success }]}>
            {formatUGX(todaysRevenue)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Today's Revenue</Text>
        </Card>
      </View>

      {/* Action Button */}
      <View style={styles.actionContainer}>
        {hasPermission('staff') && (
          <Button
            title="Record New Sale"
            onPress={() => setShowSaleModal(true)}
            style={[styles.recordButton, { backgroundColor: colors.success }]}
          />
        )}
      </View>

      {/* Sales List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Sales</Text>

        {sales.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors.secondaryText }]}>
              No sales recorded yet
            </Text>
          </View>
        ) : (
          sales
            .sort(
              (a: Sale, b: Sale) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            .map((sale: Sale) => (
              <Card key={sale.id} style={[styles.saleCard, { backgroundColor: colors.card }]}>
                <View style={styles.saleHeader}>
                  <Text style={[styles.productName, { color: colors.text }]}>
                    {getProductName(sale.productId)}
                  </Text>
                  <Text style={[styles.saleAmount, { color: colors.success }]}>
                    {formatUGX(sale.totalAmount)}
                  </Text>
                </View>

                <View style={styles.saleDetails}>
                  <Text style={[styles.saleDetail, { color: colors.secondaryText }]}>
                    Quantity: {sale.quantity} × {formatUGX(sale.unitPrice)}
                  </Text>
                  {sale.customerName && (
                    <Text style={[styles.saleDetail, { color: colors.secondaryText }]}>
                      Customer: {sale.customerName}
                    </Text>
                  )}
                  <Text style={[styles.saleDate, { color: colors.secondaryText }]}>
                    {formatDate(sale.createdAt)}
                  </Text>
                </View>
              </Card>
            ))
        )}
      </ScrollView>

      {/* Sale Modal */}
      <Modal
        visible={showSaleModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSaleModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View
            style={[
              styles.modalHeader,
              { backgroundColor: colors.card, borderBottomColor: colors.border },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>Record New Sale</Text>
            <TouchableOpacity onPress={() => setShowSaleModal(false)}>
              <Text style={{ color: colors.accent, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Select Product</Text>
            <ScrollView style={styles.productList} showsVerticalScrollIndicator={false}>
              {availableProducts.map((product: Product) => (
                <TouchableOpacity
                  key={product.id}
                  style={[
                    styles.productOption,
                    {
                      backgroundColor:
                        selectedProduct === product.id ? colors.accent + '22' : colors.card,
                      borderColor:
                        selectedProduct === product.id ? colors.accent : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedProduct(product.id)}
                >
                  <Text style={[styles.productOptionName, { color: colors.text }]}>
                    {product.name}
                  </Text>
                  <Text style={[styles.productOptionDetails, { color: colors.secondaryText }]}>
                    {formatUGX(product.price)} • {product.quantity} available
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Input
              label="Quantity"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              placeholder="Enter quantity"
            />

            <Input
              label="Customer Name (Optional)"
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="Enter customer name"
            />

            {selectedProduct && quantity && (
              <Card style={[styles.summaryCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.summaryTitle, { color: colors.text }]}>Sale Summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>
                    Product:
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    {getProductName(selectedProduct)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>
                    Quantity:
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>{quantity}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>
                    Unit Price:
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    {formatUGX(products.find((p) => p.id === selectedProduct)?.price || 0)}
                  </Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: colors.border }]}>
                  <Text style={[styles.totalLabel, { color: colors.text }]}>Total:</Text>
                  <Text style={[styles.totalValue, { color: colors.success }]}>
                    {formatUGX(
                      (products.find((p) => p.id === selectedProduct)?.price || 0) *
                        parseInt(quantity || '0')
                    )}
                  </Text>
                </View>
              </Card>
            )}

            <Button
              title="Record Sale"
              onPress={handleRecordSale}
              loading={loading}
              disabled={!selectedProduct || !quantity}
              style={[styles.recordSaleButton, { backgroundColor: colors.success }]}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 16, marginTop: 4 },
  statsContainer: { flexDirection: 'row', paddingHorizontal: 20, gap: 16 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 20 },
  statIcon: { marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { fontSize: 12, textAlign: 'center' },
  actionContainer: { paddingHorizontal: 20, paddingVertical: 16 },
  scrollView: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  saleCard: { marginBottom: 12, borderRadius: 12, padding: 12 },
  saleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  saleDetails: { marginTop: 4, gap: 4 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalContent: { flex: 1, padding: 20 },
  inputLabel: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  productList: { maxHeight: 200, marginBottom: 20 },
  productOption: { padding: 16, borderRadius: 8, marginBottom: 8, borderWidth: 1 },
  summaryCard: { marginVertical: 20, borderRadius: 8, padding: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  totalRow: { borderTopWidth: 1, paddingTop: 8, marginTop: 8 },
  totalLabel: { fontSize: 16, fontWeight: 'bold' },
  totalValue: { fontSize: 16, fontWeight: 'bold' },
  recordSaleButton: { marginTop: 20 },
});
