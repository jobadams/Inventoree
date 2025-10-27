import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Search, Edit, Trash2, AlertTriangle } from 'lucide-react-native';
import { useInventory } from '../../contexts/inventory-context';
import { useAuth } from '../../contexts/auth-context';
import { Product } from '../../types/inventory';
import Card from '../../components/ui/Card';
import { useTheme } from '../../contexts/theme-context'; // ✅ Theme context

// SKU generator
const generateSKU = () => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const timestamp = Date.now().toString().slice(-4);
  return `PRD-${timestamp}${randomNum}`;
};

const formatUGX = (amount: number) => `UGX ${amount.toLocaleString('en-UG')}`;

export default function InventoryScreen() {
  const { products, categories, suppliers, addProduct, deleteProduct, updateProduct } =
    useInventory();
  const { hasPermission } = useAuth();
  const { theme, colors } = useTheme(); // ✅ Get theme colors

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [productName, setProductName] = useState('');
  const [productQuantity, setProductQuantity] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productSupplier, setProductSupplier] = useState('');

  const resetForm = () => {
    setProductName('');
    setProductQuantity('');
    setProductPrice('');
    setProductCategory('');
    setProductSupplier('');
    setEditingProduct(null);
    setShowAddForm(false);
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryName = (categoryId: string) =>
    categories.find((c) => c.id === categoryId)?.name || 'Unknown';
  const getSupplierName = (supplierId: string) =>
    suppliers.find((s) => s.id === supplierId)?.name || 'Unknown';

  const getStockStatus = (product: Product) => {
    if (product.quantity === 0)
      return { status: 'Out of Stock', color: colors.error, bgColor: colors.errorBg };
    if (product.quantity <= product.minQuantity)
      return { status: 'Low Stock', color: colors.warning, bgColor: colors.warningBg };
    return { status: 'In Stock', color: colors.success, bgColor: colors.successBg };
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (!hasPermission('admin')) {
      Alert.alert('Permission Denied', 'Only admins can delete products');
      return;
    }

    Alert.alert('Delete Product', `Delete "${productName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteProduct(productId) },
    ]);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductName(product.name);
    setProductQuantity(product.quantity.toString());
    setProductPrice(product.price.toString());
    setProductCategory(product.categoryId);
    setProductSupplier(product.supplierId);
    setShowAddForm(true);
  };

  const handleSaveProduct = async () => {
    if (
      !productName ||
      !productQuantity ||
      !productPrice ||
      !productCategory ||
      !productSupplier
    ) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (editingProduct) {
      await updateProduct(editingProduct.id, {
        ...editingProduct,
        name: productName,
        sku: editingProduct.sku,
        quantity: parseInt(productQuantity, 10),
        price: parseFloat(productPrice),
        categoryId: productCategory,
        supplierId: productSupplier,
      });
      Alert.alert('Success', 'Product updated successfully');
    } else {
      const newSKU = generateSKU();
      await addProduct({
        name: productName,
        sku: newSKU,
        quantity: parseInt(productQuantity, 10),
        price: parseFloat(productPrice),
        categoryId: productCategory,
        supplierId: productSupplier,
        description: '',
        minQuantity: 1,
        cost: 0,
      });
      Alert.alert('Success', `Product added successfully with SKU: ${newSKU}`);
    }

    resetForm();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Inventory Management</Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>
          {products.length} products in stock
        </Text>
      </View>

      {/* Search + Add */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Search size={20} color={colors.subtext} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.subtext}
          />
        </View>
        {hasPermission('admin') && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              resetForm();
              setShowAddForm(true);
            }}
          >
            <Plus size={20} color={colors.onPrimary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Add/Edit form */}
      {showAddForm && (
        <Card style={{ marginHorizontal: 20, marginBottom: 16, padding: 16, backgroundColor: colors.card }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8, color: colors.text }}>
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </Text>

          <TextInput
            placeholder="Product Name"
            style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
            value={productName}
            onChangeText={setProductName}
            placeholderTextColor={colors.subtext}
          />

          {editingProduct && (
            <TextInput
              placeholder="SKU"
              style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
              value={editingProduct.sku}
              editable={false}
            />
          )}

          <TextInput
            placeholder="Quantity"
            style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
            value={productQuantity}
            onChangeText={setProductQuantity}
            keyboardType="numeric"
            placeholderTextColor={colors.subtext}
          />
          <TextInput
            placeholder="Price (UGX)"
            style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
            value={productPrice}
            onChangeText={setProductPrice}
            keyboardType="numeric"
            placeholderTextColor={colors.subtext}
          />

          <Text style={{ marginBottom: 4, color: colors.text }}>Category:</Text>
          <View style={styles.pickerContainer}>
            {categories.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={
                  productCategory === c.id
                    ? [styles.selectedItem, { backgroundColor: colors.selectedBg, borderColor: colors.primary }]
                    : [styles.item, { backgroundColor: colors.card, borderColor: colors.border }]
                }
                onPress={() => setProductCategory(c.id)}
              >
                <Text style={{ color: colors.text }}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{ marginBottom: 4, color: colors.text }}>Supplier:</Text>
          <View style={styles.pickerContainer}>
            {suppliers.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={
                  productSupplier === s.id
                    ? [styles.selectedItem, { backgroundColor: colors.selectedBg, borderColor: colors.primary }]
                    : [styles.item, { backgroundColor: colors.card, borderColor: colors.border }]
                }
                onPress={() => setProductSupplier(s.id)}
              >
                <Text style={{ color: colors.text }}>{s.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.primary }]} onPress={handleSaveProduct}>
            <Text style={{ color: colors.onPrimary, fontWeight: 'bold' }}>
              {editingProduct ? 'Save Changes' : 'Add Product'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.cancelButton, { borderColor: colors.border }]} onPress={resetForm}>
            <Text style={{ color: colors.subtext }}>Cancel</Text>
          </TouchableOpacity>
        </Card>
      )}

      {/* Product list */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredProducts.map((product) => {
          const stockStatus = getStockStatus(product);

          return (
            <Card key={product.id} style={{ ...styles.productCard, backgroundColor: colors.card }}>
              <View style={styles.productHeader}>
                <View style={styles.productInfo}>
                  <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>
                  <Text style={[styles.productSku, { color: colors.subtext }]}>SKU: {product.sku}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: stockStatus.bgColor }]}>
                  <Text style={[styles.statusText, { color: stockStatus.color }]}>{stockStatus.status}</Text>
                </View>
              </View>

              <View style={styles.productDetails}>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.subtext }]}>Category:</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{getCategoryName(product.categoryId)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.subtext }]}>Supplier:</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{getSupplierName(product.supplierId)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.subtext }]}>Quantity:</Text>
                  <Text style={[styles.detailValue, { color: stockStatus.color }]}>{product.quantity} units</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.subtext }]}>Price:</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{formatUGX(product.price)}</Text>
                </View>
              </View>

              {product.quantity <= product.minQuantity && (
                <View style={[styles.warningContainer, { backgroundColor: colors.warningBg }]}>
                  <AlertTriangle size={16} color={colors.warning} />
                  <Text style={[styles.warningText, { color: colors.warning }]}>{`Stock is below minimum level (${product.minQuantity} units)`}</Text>
                </View>
              )}

              {hasPermission('admin') && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.editBg }]} onPress={() => handleEditProduct(product)}>
                    <Edit size={16} color={colors.primary} />
                    <Text style={[styles.editButtonText, { color: colors.primary }]}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.deleteButton, { backgroundColor: colors.errorBg }]} onPress={() => handleDeleteProduct(product.id, product.name)}>
                    <Trash2 size={16} color={colors.error} />
                    <Text style={[styles.deleteButtonText, { color: colors.error }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 16, marginTop: 4 },
  searchContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20, gap: 12 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16 },
  addButton: { borderRadius: 12, width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  scrollView: { flex: 1 },
  productCard: { marginBottom: 16, marginHorizontal: 20, padding: 16 },
  productHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  productInfo: { flex: 1 },
  productName: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  productSku: { fontSize: 14 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  productDetails: { gap: 8, marginBottom: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: 14, fontWeight: '500' },
  detailValue: { fontSize: 14, fontWeight: '600' },
  warningContainer: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, marginBottom: 16 },
  warningText: { fontSize: 12, marginLeft: 8, flex: 1 },
  actionButtons: { flexDirection: 'row', gap: 12 },
  editButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, flex: 1, justifyContent: 'center' },
  editButtonText: { fontSize: 14, fontWeight: '600', marginLeft: 6 },
  deleteButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, flex: 1, justifyContent: 'center' },
  deleteButtonText: { fontSize: 14, fontWeight: '600', marginLeft: 6 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 10 },
  submitButton: { padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  cancelButton: { padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, marginBottom: 8 },
  pickerContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  item: { padding: 8, borderRadius: 8 },
  selectedItem: { padding: 8, borderRadius: 8 },
});
