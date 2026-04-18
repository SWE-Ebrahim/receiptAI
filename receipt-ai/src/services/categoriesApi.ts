/**
 * Categories API Service
 * 
 * Handles all category-related API calls:
 * - Fetch user categories
 * - Create new category
 * - Update category
 * - Delete category
 */

import { apiGet, apiPost, apiPut, apiDelete } from '../services/api';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  receipt_count?: number;
  created_at?: string;
}

/**
 * Get all user categories with receipt counts
 */
export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await apiGet('/categories');
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch categories');
    }

    return response.data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Create a new category
 */
export const createCategory = async (data: {
  name: string;
  icon: string;
  color: string;
}): Promise<Category> => {
  try {
    const response = await apiPost('/categories', data);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to create category');
    }

    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

/**
 * Update an existing category
 */
export const updateCategory = async (id: string, data: {
  name?: string;
  icon?: string;
  color?: string;
}): Promise<Category> => {
  try {
    const response = await apiPut(`/categories/${id}`, data);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to update category');
    }

    return response.data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

/**
 * Delete a category
 */
export const deleteCategory = async (id: string): Promise<void> => {
  try {
    const response = await apiDelete(`/categories/${id}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete category');
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};
