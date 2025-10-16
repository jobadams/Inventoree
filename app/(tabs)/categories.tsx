import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Search, Edit, Trash2, Tag } from 'lucide-react-native';
import { useInventory } from '../../contexts/inventory-context';
import { useAuth } from '../../contexts/auth-context';
import Card from '../../components/ui/Card';
import { useTheme } from '../../contexts/theme-context'; // ✅ Import theme

// Generate unique ID for new categories
const generateCategoryId = () => `CAT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

export default function CategoriesScreen() {
  const { categories, products, deleteCategory, addCategory, updateCategory } = useInventory();
  const { hasPermission } = useAuth();
  const { colors } = useTheme(); // ✅ Access global theme colors

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryProductCount = (categoryId: string) =>
    products.filter(product => product.categoryId === categoryId).length;

  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    if (!hasPermission('admin')) {
      Alert.alert('Permission Denied', 'Only admins can delete categories');
      return;
    }

    const productCount = getCategoryProductCount(categoryId);
    if (productCount > 0) {
      Alert.alert(
        'Cannot Delete',
        `This category has ${productCount} product(s). Please reassign or remove them first.`
      );
      return;
    }

    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${categoryName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteCategory(categoryId) },
      ]
    );
  };

  const handleSaveCategory = () => {
    if (!categoryName.trim() || !categoryDescription.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        ...editingCategory,
        name: categoryName,
        description: categoryDescription,
      });
      Alert.alert('Success', 'Category updated successfully');
    } else {
      const newId = generateCategoryId();
      addCategory({
        id: newId,
        name: categoryName,
        description: categoryDescription,
      });
      Alert.alert('Success', `Category added with ID: ${newId}`);
    }

    resetForm();
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description);
    setCategoryId(category.id);
    setShowAddForm(true);
  };

  const resetForm = () => {
    setCategoryName('');
    setCategoryDescription('');
    setCategoryId('');
    setEditingCategory(null);
    setShowAddForm(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Categories</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {categories.length} categories created
        </Text>
      </View>

      {/* Search + Add */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search size={20} color={colors.secondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search categories..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {hasPermission('admin') && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => { resetForm(); setShowAddForm(true); }}
          >
            <Plus size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Add/Edit Form */}
      {showAddForm && hasPermission('admin') && (
        <Card style={{ marginHorizontal: 20, marginBottom: 16, padding: 16, backgroundColor: colors.surface }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8, color: colors.text }}>
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </Text>

          {editingCategory ? (
            <Text style={{ marginBottom: 8, color: colors.textSecondary }}>ID: {categoryId}</Text>
          ) : (
            <Text style={{ marginBottom: 8, color: colors.textSecondary }}>
              New ID will be generated automatically
            </Text>
          )}

          <TextInput
            placeholder="Category Name"
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            value={categoryName}
            onChangeText={setCategoryName}
          />
          <TextInput
            placeholder="Category Description"
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            value={categoryDescription}
            onChangeText={setCategoryDescription}
          />

          <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.primary }]} onPress={handleSaveCategory}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>
              {editingCategory ? 'Save Changes' : 'Add Category'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.cancelButton, { borderColor: colors.border }]} onPress={resetForm}>
            <Text style={{ color: colors.textSecondary }}>Cancel</Text>
          </TouchableOpacity>
        </Card>
      )}

      {/* Categories List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredCategories.map(category => {
          const productCount = getCategoryProductCount(category.id);
          return (
            <Card key={category.id} style={[styles.categoryCard, { backgroundColor: colors.surface }]}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryInfo}>
                  <View style={styles.categoryTitleRow}>
                    <View style={[styles.colorIndicator, { backgroundColor: category.color || colors.primary }]} />
                    <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
                  </View>
                  <Text style={[styles.categoryDescription, { color: colors.textSecondary }]}>{category.description}</Text>
                </View>

                <View style={[styles.productCountBadge, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.productCountText, { color: colors.primary }]}>
                    {productCount} product{productCount !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>

              {hasPermission('admin') && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.primary + '20' }]} onPress={() => handleEditCategory(category)}>
                    <Edit size={16} color={colors.primary} />
                    <Text style={[styles.editButtonText, { color: colors.primary }]}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.deleteButton, { backgroundColor: colors.error + '20' }]} onPress={() => handleDeleteCategory(category.id, category.name)}>
                    <Trash2 size={16} color={colors.error} />
                    <Text style={[styles.deleteButtonText, { color: colors.error }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Card>
          );
        })}

        {filteredCategories.length === 0 && (
          <View style={styles.emptyState}>
            <Tag size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              {searchQuery ? 'No categories found' : 'No categories created yet'}
            </Text>
            {hasPermission('admin') && !searchQuery && (
              <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
                Create your first category to organize your products
              </Text>
            )}
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
  addButton: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 10 },
  submitButton: { padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  cancelButton: { padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1 },
  scrollView: { flex: 1, paddingHorizontal: 20 },
  categoryCard: { marginBottom: 16 },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  categoryInfo: { flex: 1 },
  categoryTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  colorIndicator: { width: 16, height: 16, borderRadius: 8, marginRight: 12 },
  categoryName: { fontSize: 18, fontWeight: '600' },
  categoryDescription: { fontSize: 14, lineHeight: 20, marginLeft: 28 },
  productCountBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  productCountText: { fontSize: 12, fontWeight: '600' },
  actionButtons: { flexDirection: 'row', gap: 12 },
  editButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, flex: 1, justifyContent: 'center' },
  editButtonText: { fontSize: 14, fontWeight: '600', marginLeft: 6 },
  deleteButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, flex: 1, justifyContent: 'center' },
  deleteButtonText: { fontSize: 14, fontWeight: '600', marginLeft: 6 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyStateText: { fontSize: 16, textAlign: 'center', marginTop: 16 },
  emptyStateSubtext: { fontSize: 14, textAlign: 'center', marginTop: 8 },
});
