/**
 * Categories Controller
 * 
 * Handles category CRUD operations
 */

const { supabaseAdmin: supabase } = require('../config/supabase');

/**
 * Get all categories for authenticated user with receipt counts
 */
exports.getCategories = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('📂 Fetching categories for user:', userId);

    // OPTIMIZED: Single query with LEFT JOIN and COUNT
    // Replaces N+1 queries with a single aggregated query
    const { data: categoriesWithCounts, error } = await supabase
      .from('categories')
      .select(`
        *,
        receipts (count)
      `)
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) {
      console.error('❌ Error fetching categories:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch categories',
        error: error.message
      });
    }

    // Transform the nested count into receipt_count field
    const formattedCategories = categoriesWithCounts?.map(cat => ({
      ...cat,
      receipt_count: cat.receipts?.[0]?.count || 0
    })) || [];

    console.log(`✅ Found ${formattedCategories.length} categories`);

    res.json({
      success: true,
      data: formattedCategories
    });
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Create a new category
 */
exports.createCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, icon = 'receipt', color = '#6750A4' } = req.body;

    console.log('📝 Creating category:', { name, icon, color });

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // Check if category already exists
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', userId)
      .eq('name', name.trim())
      .single();

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    // Insert new category
    const { data: category, error } = await supabase
      .from('categories')
      .insert([{
        user_id: userId,
        name: name.trim(),
        icon,
        color
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating category:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create category',
        error: error.message
      });
    }

    console.log('✅ Category created! ID:', category.id);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: {
        ...category,
        receipt_count: 0
      }
    });
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Update an existing category
 */
exports.updateCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, icon, color } = req.body;

    console.log('✏️ Updating category:', id);

    // Verify category belongs to user
    const { data: existing, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Build update object
    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (icon !== undefined) updates.icon = icon;
    if (color !== undefined) updates.color = color;

    // Update category
    const { data: category, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating category:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update category',
        error: error.message
      });
    }

    console.log('✅ Category updated!');

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Delete a category
 */
exports.deleteCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    console.log('🗑️ Deleting category:', id);

    // Verify category belongs to user
    const { data: existing, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has receipts
    const { count } = await supabase
      .from('receipts')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id);

    if (count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category with ${count} receipt(s). Please reassign or delete receipts first.`
      });
    }

    // Delete category
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error deleting category:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete category',
        error: error.message
      });
    }

    console.log('✅ Category deleted!');

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
