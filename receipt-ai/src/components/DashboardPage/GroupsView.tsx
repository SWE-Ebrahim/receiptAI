/**
 * Groups View Component
 * 
 * Category management with:
 * - Categories grid in bento style
 * - Add new category button
 * - Smart suggestions
 * - Full CRUD operations
 */
import { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/categoriesApi';
import type { Category } from '../../services/categoriesApi';
import CategoryCard from './GroupViewComponents/CategoryCard';
import AddCategoryButton from './GroupViewComponents/AddCategoryButton';
import SuggestedCategory from './GroupViewComponents/SuggestedCategory';
import CategoryModal from './GroupViewComponents/CategoryModal';
const GroupsView = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const suggestions = [
    { name: 'Healthcare', icon: 'medical_services' },
    { name: 'Education', icon: 'school' },
    { name: 'Travel', icon: 'flight' },
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📂 [GroupsView] Fetching categories...');
      
      const data = await getCategories();
      console.log(`✅ [GroupsView] Loaded ${data.length} categories`);
      setCategories(data);
    } catch (err: any) {
      console.error('❌ [GroupsView] Failed to fetch categories:', err);
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setEditData(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (id: string) => {
    const category = categories.find(c => c.id === id);
    if (category) {
      setEditData(category);
      setIsModalOpen(true);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const category = categories.find(c => c.id === id);
    if (!category) return;

    if (category.receipt_count && category.receipt_count > 0) {
      alert(`Cannot delete "${category.name}" because it has ${category.receipt_count} receipt(s). Please reassign or delete those receipts first.`);
      return;
    }

    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return;
    }

    try {
      console.log(`🗑️ [GroupsView] Deleting category: ${id}`);
      await deleteCategory(id);
      console.log('✅ [GroupsView] Category deleted');
      
      // Refresh list
      fetchCategories();
    } catch (err: any) {
      console.error('❌ [GroupsView] Failed to delete category:', err);
      alert(err.message || 'Failed to delete category');
    }
  };

  const handleModalSubmit = async (data: { name: string; icon: string; color: string }) => {
    try {
      if (editData) {
        // Update existing category
        console.log(`✏️ [GroupsView] Updating category: ${editData.id}`);
        await updateCategory(editData.id, data);
        console.log('✅ [GroupsView] Category updated');
      } else {
        // Create new category
        console.log('📝 [GroupsView] Creating new category');
        await createCategory(data);
        console.log('✅ [GroupsView] Category created');
      }
      
      // Close modal and refresh
      setIsModalOpen(false);
      setEditData(null);
      fetchCategories();
    } catch (err: any) {
      console.error('❌ [GroupsView] Failed to save category:', err);
      alert(err.message || 'Failed to save category');
    }
  };

  const handleAddSuggestion = async (name: string, icon: string) => {
    try {
      console.log(`📝 [GroupsView] Adding suggested category: ${name}`);
      await createCategory({
        name,
        icon,
        color: '#6750A4'
      });
      console.log('✅ [GroupsView] Suggested category added');
      fetchCategories();
    } catch (err: any) {
      console.error('❌ [GroupsView] Failed to add suggestion:', err);
      alert(err.message || 'Failed to add category');
    }
  };

  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 px-6 pt-6 pb-4 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/15">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-semibold text-on-surface">Categories</h1>
          <button className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center hover:bg-secondary-container/80 transition-colors">
            <span className="material-symbols-outlined text-primary">add</span>
          </button>
        </div>
      </header>

      <div className="px-6 space-y-6">
        {/* Categories Grid - Bento Style */}
        <section className="mt-6">
          <h3 className="text-lg font-semibold text-on-surface mb-4">Your Categories</h3>
          
          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-5 rounded-[1.5rem] bg-surface-container-low animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-outline-variant/20 mb-3"></div>
                  <div className="h-5 bg-outline-variant/20 rounded w-24 mb-2"></div>
                  <div className="h-4 bg-outline-variant/20 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-error-container/20 border border-error/20 p-6 rounded-2xl">
              <p className="text-error text-sm">{error}</p>
              <button 
                onClick={fetchCategories}
                className="mt-3 text-sm text-primary font-medium hover:opacity-80"
              >
                Try Again
              </button>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-outline-variant/40 mb-4">category</span>
              <p className="text-on-surface/60 text-lg font-medium">No categories yet</p>
              <p className="text-on-surface/40 text-sm mt-2">Create your first category to organize receipts</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {categories.map((category, index) => (
                <CategoryCard
                  key={category.id}
                  id={category.id}
                  name={category.name}
                  icon={category.icon}
                  color={category.color}
                  count={category.receipt_count || 0}
                  onEdit={handleEditCategory}
                  onDelete={handleDeleteCategory}
                  isFirst={index === 0}
                />
              ))}
            </div>
          )}
        </section>

        {/* Add New Category Button */}
        <AddCategoryButton onClick={handleAddCategory} />

        {/* Smart Suggestions */}
        <section>
          <h3 className="text-lg font-semibold text-on-surface mb-4">Suggested Categories</h3>
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <SuggestedCategory
                key={index}
                name={suggestion.name}
                icon={suggestion.icon}
                onAdd={handleAddSuggestion}
              />
            ))}
          </div>
        </section>

        {/* Info Card */}
        <section>
          <div className="p-5 rounded-2xl bg-gradient-to-br from-secondary-container to-tertiary-container border border-outline-variant/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary">lightbulb</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-on-surface mb-1">Pro Tip</h4>
                <p className="text-sm text-on-surface/70 leading-relaxed">
                  Organize your receipts into categories to get better insights and track your spending habits more effectively.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditData(null);
        }}
        onSubmit={handleModalSubmit}
        editData={editData}
      />
    </div>
  )
}

export default GroupsView
