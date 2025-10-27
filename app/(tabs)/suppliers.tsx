import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Search, Edit, Trash2, Phone, Mail, MapPin, User } from 'lucide-react-native';
import { useInventory } from '../../contexts/inventory-context';
import { useAuth } from '../../contexts/auth-context';
import { useTheme } from '../../contexts/theme-context'; // 🌙 Import theme
import Card from '../../components/ui/Card';

export default function SuppliersScreen() {
  const { suppliers, products, addSupplier, deleteSupplier, updateSupplier } = useInventory();
  const { hasPermission } = useAuth();
  const { theme } = useTheme(); // 🎨 Access the current theme (light/dark)

  const isDark = theme === 'dark';
  const colors = {
    background: isDark ? '#0f172a' : '#f8fafc',
    text: isDark ? '#f1f5f9' : '#1e293b',
    secondaryText: isDark ? '#cbd5e1' : '#64748b',
    card: isDark ? '#1e293b' : '#ffffff',
    border: isDark ? '#334155' : '#e2e8f0',
    button: '#2563eb',
    delete: '#ef4444',
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);

  const [supplierName, setSupplierName] = useState('');
  const [supplierContact, setSupplierContact] = useState('');
  const [supplierEmail, setSupplierEmail] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [supplierAddress, setSupplierAddress] = useState('');

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSupplierProductCount = (supplierId: string) =>
    products.filter(product => product.supplierId === supplierId).length;

  const handleDeleteSupplier = (supplierId: string, supplierName: string) => {
    if (!hasPermission('admin')) {
      Alert.alert('Permission Denied', 'Only admins can delete suppliers');
      return;
    }
    const productCount = getSupplierProductCount(supplierId);
    if (productCount > 0) {
      Alert.alert(
        'Cannot Delete',
        `This supplier has ${productCount} product(s) associated with it. Reassign or remove them first.`
      );
      return;
    }
    Alert.alert(
      'Delete Supplier',
      `Are you sure you want to delete "${supplierName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteSupplier(supplierId) },
      ]
    );
  };

  const handleSaveSupplier = async () => {
    if (!supplierName || !supplierContact || !supplierEmail || !supplierPhone || !supplierAddress) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (editingSupplier) {
      await updateSupplier(editingSupplier.id, {
        name: supplierName,
        contactPerson: supplierContact,
        email: supplierEmail,
        phone: supplierPhone,
        address: supplierAddress,
      });
      Alert.alert('Success', 'Supplier updated successfully');
    } else {
      await addSupplier({
        name: supplierName,
        contactPerson: supplierContact,
        email: supplierEmail,
        phone: supplierPhone,
        address: supplierAddress,
      });
      Alert.alert('Success', 'Supplier added successfully');
    }

    resetForm();
  };

  const handleEditSupplier = (supplier: any) => {
    setEditingSupplier(supplier);
    setSupplierName(supplier.name);
    setSupplierContact(supplier.contactPerson);
    setSupplierEmail(supplier.email);
    setSupplierPhone(supplier.phone);
    setSupplierAddress(supplier.address);
    setShowAddForm(true);
  };

  const resetForm = () => {
    setSupplierName('');
    setSupplierContact('');
    setSupplierEmail('');
    setSupplierPhone('');
    setSupplierAddress('');
    setEditingSupplier(null);
    setShowAddForm(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Suppliers</Text>
        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
          {suppliers.length} suppliers registered
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Search size={20} color={colors.secondaryText} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search suppliers..."
            placeholderTextColor={colors.secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {hasPermission('admin') && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.button }]}
            onPress={() => {
              resetForm();
              setShowAddForm(true);
            }}
          >
            <Plus size={20} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>

      {showAddForm && hasPermission('admin') && (
        <Card style={{ marginHorizontal: 20, marginBottom: 16, padding: 16, backgroundColor: colors.card }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: colors.text, marginBottom: 8 }}>
            {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
          </Text>

          <TextInput placeholder="Supplier Name" style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={supplierName} onChangeText={setSupplierName} />
          <TextInput placeholder="Contact Person" style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={supplierContact} onChangeText={setSupplierContact} />
          <TextInput placeholder="Email" style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={supplierEmail} onChangeText={setSupplierEmail} />
          <TextInput placeholder="Phone" style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={supplierPhone} onChangeText={setSupplierPhone} />
          <TextInput placeholder="Address" style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={supplierAddress} onChangeText={setSupplierAddress} />

          <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.button }]} onPress={handleSaveSupplier}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
              {editingSupplier ? 'Save Changes' : 'Add Supplier'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.cancelButton, { borderColor: colors.secondaryText }]} onPress={resetForm}>
            <Text style={{ color: colors.secondaryText }}>Cancel</Text>
          </TouchableOpacity>
        </Card>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredSuppliers.map((supplier) => {
          const productCount = getSupplierProductCount(supplier.id);

          return (
            <Card key={supplier.id} style={[styles.supplierCard, { backgroundColor: colors.card }]}>
              <View style={styles.supplierHeader}>
                <Text style={[styles.supplierName, { color: colors.text }]}>{supplier.name}</Text>
                <View style={[styles.productCountBadge, { backgroundColor: isDark ? '#1d4ed8' : '#eff6ff' }]}>
                  <Text style={[styles.productCountText, { color: isDark ? '#fff' : '#2563eb' }]}>
                    {productCount} product{productCount !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>

              <View style={styles.contactInfo}>
                <View style={styles.contactItem}>
                  <User size={16} color={colors.secondaryText} />
                  <Text style={[styles.contactText, { color: colors.secondaryText }]}>{supplier.contactPerson}</Text>
                </View>
                <View style={styles.contactItem}>
                  <Mail size={16} color={colors.secondaryText} />
                  <Text style={[styles.contactText, { color: colors.secondaryText }]}>{supplier.email}</Text>
                </View>
                <View style={styles.contactItem}>
                  <Phone size={16} color={colors.secondaryText} />
                  <Text style={[styles.contactText, { color: colors.secondaryText }]}>{supplier.phone}</Text>
                </View>
                <View style={styles.contactItem}>
                  <MapPin size={16} color={colors.secondaryText} />
                  <Text style={[styles.contactText, { color: colors.secondaryText }]}>{supplier.address}</Text>
                </View>
              </View>

              {hasPermission('admin') && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.editButton, { backgroundColor: isDark ? '#1e40af' : '#eff6ff' }]}
                    onPress={() => handleEditSupplier(supplier)}
                  >
                    <Edit size={16} color={isDark ? '#93c5fd' : '#2563eb'} />
                    <Text style={[styles.editButtonText, { color: isDark ? '#93c5fd' : '#2563eb' }]}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.deleteButton, { backgroundColor: isDark ? '#7f1d1d' : '#fef2f2' }]}
                    onPress={() => handleDeleteSupplier(supplier.id, supplier.name)}
                  >
                    <Trash2 size={16} color={colors.delete} />
                    <Text style={[styles.deleteButtonText, { color: colors.delete }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Card>
          );
        })}

        {filteredSuppliers.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors.secondaryText }]}>
              {searchQuery ? 'No suppliers found matching your search' : 'No suppliers registered'}
            </Text>
          </View>
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
  searchContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20, gap: 12 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16 },
  addButton: { borderRadius: 12, width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  scrollView: { flex: 1, paddingHorizontal: 20 },
  supplierCard: { marginBottom: 16, padding: 16, borderRadius: 12 },
  supplierHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  supplierName: { fontSize: 18, fontWeight: '600', flex: 1 },
  productCountBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  productCountText: { fontSize: 12, fontWeight: '600' },
  contactInfo: { gap: 12, marginBottom: 16 },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  contactText: { fontSize: 14, flex: 1 },
  actionButtons: { flexDirection: 'row', gap: 12 },
  editButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, flex: 1, justifyContent: 'center' },
  editButtonText: { fontSize: 14, fontWeight: '600', marginLeft: 6 },
  deleteButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, flex: 1, justifyContent: 'center' },
  deleteButtonText: { fontSize: 14, fontWeight: '600', marginLeft: 6 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyStateText: { fontSize: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 10 },
  submitButton: { padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  cancelButton: { padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1 },
});
