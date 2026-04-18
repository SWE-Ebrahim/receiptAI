import React from 'react';
import type { ReceiptExtractionData, Category } from '../../../services/scanApi';

interface DataExtractionFormProps {
  extractedData: ReceiptExtractionData;
  categories: Category[];
  onChange: (data: Partial<ReceiptExtractionData>) => void;
  onSubmit: () => void;
  onRetake: () => void;
  isSubmitting: boolean;
}

const DataExtractionForm: React.FC<DataExtractionFormProps> = ({
  extractedData,
  categories,
  onChange,
  onSubmit,
  onRetake,
  isSubmitting,
}) => {
  const handleChange = (field: keyof ReceiptExtractionData, value: any) => {
    onChange({ [field]: value });
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-success';
    if (score >= 0.6) return 'text-warning';
    return 'text-error';
  };

  const getConfidenceIcon = (score: number) => {
    if (score >= 0.8) return 'check_circle';
    if (score >= 0.6) return 'warning';
    return 'error';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-on-surface">Extracted Information</h3>

      {/* Merchant */}
      <div>
        <label className="block text-sm font-medium text-on-surface/70 mb-2">
          Merchant
        </label>
        <div className="relative">
          <input
            type="text"
            value={extractedData.merchant}
            onChange={(e) => handleChange('merchant', e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all pr-10"
          />
          <span
            className={`material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 ${getConfidenceColor(
              extractedData.confidence.merchant
            )}`}
          >
            {getConfidenceIcon(extractedData.confidence.merchant)}
          </span>
        </div>
      </div>

      {/* Date and Amount */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-on-surface/70 mb-2">Date</label>
          <input
            type="date"
            value={extractedData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-on-surface/70 mb-2">Amount (AED)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm font-semibold">AED</span>
            <input
              type="number"
              step="0.01"
              value={extractedData.amount}
              onChange={(e) => handleChange('amount', parseFloat(e.target.value))}
              className="w-full pl-16 pr-10 py-3 rounded-xl bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
            <span
              className={`material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 ${getConfidenceColor(
                extractedData.confidence.amount
              )}`}
            >
              {getConfidenceIcon(extractedData.confidence.amount)}
            </span>
          </div>
        </div>
      </div>

      {/* Tax (optional) */}
      <div>
        <label className="block text-sm font-medium text-on-surface/70 mb-2">Tax (Optional, AED)</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm font-semibold">AED</span>
          <input
            type="number"
            step="0.01"
            value={extractedData.tax || ''}
            onChange={(e) => handleChange('tax', e.target.value ? parseFloat(e.target.value) : null)}
            placeholder="0.00"
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
          value={extractedData.category || ''}
          onChange={(e) => handleChange('category', e.target.value || null)}
          className={`w-full px-4 py-3 rounded-xl bg-surface-container-low border focus:ring-2 outline-none transition-all ${
            !extractedData.category 
              ? 'border-error focus:border-error focus:ring-error/20' 
              : 'border-outline-variant focus:border-primary focus:ring-primary/20'
          }`}
          required
        >
          <option value="">Select a category... (Required)</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {!extractedData.category && (
          <p className="text-xs text-error mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">warning</span>
            Category is required to save this receipt
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onRetake}
          disabled={isSubmitting}
          className="flex-1 py-3 rounded-xl bg-surface-container text-on-surface font-medium hover:bg-surface-container-high transition-colors disabled:opacity-50"
        >
          Retake
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting || !extractedData.category}
          className={`flex-1 py-3 rounded-xl font-medium shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
            !extractedData.category
              ? 'bg-outline-variant text-on-surface-variant cursor-not-allowed opacity-50'
              : 'bg-primary text-white hover:shadow-xl'
          }`}
        >
          {isSubmitting ? (
            <>
              <span className="material-symbols-outlined animate-spin">sync</span>
              Saving...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">save</span>
              Save Receipt
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DataExtractionForm;
