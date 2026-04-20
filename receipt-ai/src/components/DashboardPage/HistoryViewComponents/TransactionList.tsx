/**
 * Transaction List Component
 * 
 * Displays list of receipt transactions with:
 * - Expandable details
 * - Download PDF functionality
 * - View receipt image
 * - Edit receipt
 * - Delete receipt
 */
import { useState, useEffect } from 'react';
import { generateReceiptPDF, updateReceipt, deleteReceipt } from '../../../services/receiptsApi';

// API Base URL
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Transaction {
  id: string;
  merchant_name: string;
  receipt_date: string;
  total_amount: number;
  category?: string | null;
  category_id?: string | null;
  status?: string;
  original_file_url?: string | null;
  file_type?: string | null;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  loading: boolean;
}

const getCategoryIcon = (category?: string | null) => {
  const map: Record<string, string> = {
    'Food & Drink': 'restaurant',
    'Groceries': 'shopping_cart',
    'Transport': 'directions_car',
    'Shopping': 'shopping_bag',
    'Utilities': 'home',
    'Healthcare': 'medical_services',
    'Entertainment': 'movie',
    'Other': 'category'
  };
  return map[category || ''] || 'receipt';
};

const formatCurrency = (amount: number) => {
  return `AED ${amount.toFixed(2)}`;
};

const formatDate = (dateStr: string) => {
  // Parse as local date (YYYY-MM-DD format from database)
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

const TransactionList = ({ transactions, loading }: TransactionListProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<Transaction | null>(null);
  const [editingReceipt, setEditingReceipt] = useState<Transaction | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    merchant_name: '',
    receipt_date: '',
    total_amount: 0,
    category_id: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_BASE}/scan/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCategories(result.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  // Open edit modal
  const handleEditClick = (tx: Transaction, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingReceipt(tx);
    setEditForm({
      merchant_name: tx.merchant_name,
      receipt_date: tx.receipt_date.split('T')[0], // Format for date input
      total_amount: tx.total_amount,
      category_id: tx.category_id || '',
    });
  };

  // Save edited receipt
  const handleSaveEdit = async () => {
    if (!editingReceipt) return;

    // Validate required fields
    if (!editForm.category_id) {
      alert('Category is required!');
      return;
    }

    if (!editForm.merchant_name.trim()) {
      alert('Merchant name is required!');
      return;
    }

    try {
      setIsSaving(true);
      await updateReceipt(editingReceipt.id, editForm);
      
      // Close modal and refresh
      setEditingReceipt(null);
      window.location.reload(); // Simple way to refresh the list
    } catch (error: any) {
      console.error('Error updating receipt:', error);
      alert(error.message || 'Failed to update receipt');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete receipt
  const handleDeleteReceipt = async (tx: Transaction, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm(`Are you sure you want to delete this receipt from ${tx.merchant_name}?`)) {
      return;
    }

    try {
      await deleteReceipt(tx.id);
      window.location.reload(); // Refresh the list
    } catch (error: any) {
      console.error('Error deleting receipt:', error);
      alert(error.message || 'Failed to delete receipt');
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-2xl bg-surface-container-low animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-outline-variant/20"></div>
                <div>
                  <div className="h-4 bg-outline-variant/20 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-outline-variant/20 rounded w-20"></div>
                </div>
              </div>
              <div className="h-4 bg-outline-variant/20 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-6xl text-outline-variant/40 mb-4">receipt_long</span>
        <p className="text-on-surface/60 text-lg font-medium">No transactions found</p>
        <p className="text-on-surface/40 text-sm mt-2">Start scanning receipts to see your history</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => (
        <div 
          key={tx.id}
          className="p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer group"
          onClick={() => setExpandedId(expandedId === tx.id ? null : tx.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary">{getCategoryIcon(tx.category)}</span>
              </div>
              <div>
                <h4 className="font-medium text-on-surface">{tx.merchant_name || 'Unknown Merchant'}</h4>
                <p className="text-xs text-on-surface/60 mt-0.5">{formatDate(tx.receipt_date)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-on-surface">{formatCurrency(tx.total_amount || 0)}</p>
              {tx.category && (
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-secondary-container text-xs font-medium text-primary">
                  {tx.category}
                </span>
              )}
            </div>
          </div>

          {/* Expanded details */}
          {expandedId === tx.id && (
            <div className="mt-4 pt-4 border-t border-outline-variant/20">
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p className="text-on-surface/60">Status</p>
                  <p className="font-medium text-on-surface capitalize">{tx.status || 'processed'}</p>
                </div>
                <div>
                  <p className="text-on-surface/60">Category</p>
                  <p className="font-medium text-on-surface">{tx.category || 'Uncategorized'}</p>
                </div>
              </div>
              
              {/* Action Buttons - Always show 4 buttons */}
              <div className="flex gap-2">
                {/* View Original Image - Always visible */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (tx.original_file_url) {
                      setViewingReceipt(tx);
                    } else {
                      alert('No original image available for this receipt');
                    }
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl transition-colors ${
                    tx.original_file_url
                      ? 'bg-secondary-container hover:bg-secondary-container/80'
                      : 'bg-outline-variant/30 opacity-50 cursor-not-allowed'
                  }`}
                  title={tx.original_file_url ? "View Original Uploaded File" : "No image available"}
                >
                  <span className="material-symbols-outlined text-primary text-sm">image</span>
                  <span className="text-xs font-medium text-primary hidden sm:inline">View Image</span>
                </button>
                <button
                  onClick={(e) => handleEditClick(tx, e)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-tertiary-container hover:bg-tertiary-container/80 transition-colors"
                  title="Edit Receipt"
                >
                  <span className="material-symbols-outlined text-tertiary text-sm">edit</span>
                  <span className="text-xs font-medium text-tertiary hidden sm:inline">Edit</span>
                </button>
                <button
                  onClick={(e) => handleDeleteReceipt(tx, e)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-error-container hover:bg-error-container/80 transition-colors"
                  title="Delete Receipt"
                >
                  <span className="material-symbols-outlined text-error text-sm">delete</span>
                  <span className="text-xs font-medium text-error hidden sm:inline">Delete</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    generateReceiptPDF(tx);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-primary-container hover:bg-primary-container/80 transition-colors"
                  title="Print System PDF Format"
                >
                  <span className="material-symbols-outlined text-primary text-sm">print</span>
                  <span className="text-xs font-medium text-primary hidden sm:inline">Print PDF</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* View Receipt Modal */}
      {viewingReceipt && viewingReceipt.original_file_url && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setViewingReceipt(null)}
        >
          <div 
            className="relative max-w-4xl w-full max-h-[90vh] bg-surface rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-outline-variant/20">
              <div>
                <h3 className="text-lg font-semibold text-on-surface">{viewingReceipt.merchant_name}</h3>
                <p className="text-sm text-on-surface-variant">
                  {new Date(viewingReceipt.receipt_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <button
                onClick={() => setViewingReceipt(null)}
                className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface">close</span>
              </button>
            </div>

            {/* Image Container */}
            <div className="overflow-auto max-h-[calc(90vh-140px)] bg-black flex items-center justify-center p-4">
              <img
                src={viewingReceipt.original_file_url}
                alt={`Receipt from ${viewingReceipt.merchant_name}`}
                className="max-w-full h-auto object-contain rounded-lg"
                onError={(e) => {
                  console.error('Failed to load receipt image');
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-family="sans-serif" font-size="14"%3EImage not available%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>

            {/* Footer with amount */}
            <div className="p-6 border-t border-outline-variant/20 bg-surface-container-low">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-on-surface-variant">Total Amount</p>
                  <p className="text-2xl font-bold text-on-surface">AED {viewingReceipt.total_amount.toFixed(2)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      generateReceiptPDF(viewingReceipt);
                      setViewingReceipt(null);
                    }}
                    className="px-6 py-3 rounded-xl bg-primary-container hover:bg-primary-container/80 transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-primary">picture_as_pdf</span>
                    <span className="font-medium text-primary">Download PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Receipt Modal */}
      {editingReceipt && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setEditingReceipt(null)}
        >
          <div 
            className="relative max-w-lg w-full bg-surface rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-outline-variant/20">
              <h3 className="text-lg font-semibold text-on-surface">Edit Receipt</h3>
              <button
                onClick={() => setEditingReceipt(null)}
                className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface">close</span>
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Merchant Name */}
              <div>
                <label className="block text-sm font-medium text-on-surface/70 mb-2">
                  Merchant Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.merchant_name}
                  onChange={(e) => setEditForm({ ...editForm, merchant_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Enter merchant name"
                  required
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-on-surface/70 mb-2">Date</label>
                <input
                  type="date"
                  value={editForm.receipt_date}
                  onChange={(e) => setEditForm({ ...editForm, receipt_date: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-on-surface/70 mb-2">Amount (AED)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm font-semibold">AED</span>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.total_amount}
                    onChange={(e) => setEditForm({ ...editForm, total_amount: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-16 pr-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Category - REQUIRED */}
              <div>
                <label className="block text-sm font-medium text-on-surface/70 mb-2">
                  Category <span className="text-error">* (Required)</span>
                </label>
                <select
                  value={editForm.category_id}
                  onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  required
                >
                  <option value="">Select a category...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {!editForm.category_id && (
                  <p className="text-xs text-error mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">warning</span>
                    Category is required to save this receipt
                  </p>
                )}
              </div>
            </div>

            {/* Footer with buttons */}
            <div className="p-6 border-t border-outline-variant/20 bg-surface-container-low">
              <div className="flex gap-3">
                <button
                  onClick={() => setEditingReceipt(null)}
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-xl bg-surface-container text-on-surface font-medium hover:bg-surface-container-high transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving || !editForm.category_id || !editForm.merchant_name.trim()}
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-medium shadow-lg hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">save</span>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
