/**
 * Category Modal Component
 * 
 * Modal for adding/editing categories
 */

import { useState, useEffect } from 'react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; icon: string; color: string }) => void;
  editData?: {
    id: string;
    name: string;
    icon: string;
    color: string;
  } | null;
}

const ICON_OPTIONS = [
  'restaurant', 'shopping_cart', 'directions_car', 'shopping_bag',
  'movie', 'home', 'medical_services', 'school', 'flight',
  'sports_gymnastics', 'pets', 'gamepad', 'music_note',
  'coffee', 'cake', 'liquor', 'fastfood', 'local_pizza'
];

const COLOR_OPTIONS = [
  '#6750A4', '#F44336', '#E91E63', '#9C27B0', '#673AB7',
  '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688',
  '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107',
  '#FF9800', '#FF5722', '#795548', '#9E9E9E', '#607D8B'
];

const CategoryModal = ({ isOpen, onClose, onSubmit, editData }: CategoryModalProps) => {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('receipt');
  const [selectedColor, setSelectedColor] = useState('#6750A4');

  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setSelectedIcon(editData.icon);
      setSelectedColor(editData.color);
    } else {
      setName('');
      setSelectedIcon('receipt');
      setSelectedColor('#6750A4');
    }
  }, [editData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Please enter a category name');
      return;
    }

    onSubmit({
      name: name.trim(),
      icon: selectedIcon,
      color: selectedColor
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/20">
          <h2 className="text-xl font-semibold text-on-surface">
            {editData ? 'Edit Category' : 'New Category'}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-on-surface/80 mb-2">
              Category Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Coffee & Snacks"
              className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-on-surface"
              autoFocus
            />
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-on-surface/80 mb-2">
              Icon
            </label>
            <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto p-2 rounded-xl bg-surface-container-low">
              {ICON_OPTIONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                    selectedIcon === icon
                      ? 'bg-primary text-white scale-110'
                      : 'bg-surface hover:bg-surface-container text-on-surface/70'
                  }`}
                >
                  <span className="material-symbols-outlined">{icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-on-surface/80 mb-2">
              Color
            </label>
            <div className="grid grid-cols-10 gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    selectedColor === color
                      ? 'ring-2 ring-offset-2 ring-primary scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 rounded-xl bg-surface-container-low">
            <p className="text-xs text-on-surface/60 mb-2">Preview:</p>
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${selectedColor}20` }}
              >
                <span 
                  className="material-symbols-outlined"
                  style={{ color: selectedColor }}
                >
                  {selectedIcon}
                </span>
              </div>
              <span className="font-medium text-on-surface">{name || 'Category Name'}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-outline-variant text-on-surface font-medium hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity"
            >
              {editData ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
