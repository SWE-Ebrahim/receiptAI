/**
 * Filter Bar Component
 * 
 * Duration filter buttons for history view with custom date range support
 */
import { useState } from 'react';
import { createPortal } from 'react-dom';

interface FilterBarProps {
  selectedDuration: string;
  onDurationChange: (duration: string) => void;
  onCustomRangeApply?: (startDate: string, endDate: string) => void;
}

const durations = [
  { value: 'all', label: 'All Time' },
  { value: 'monthly', label: 'This Month' },
  { value: 'weekly', label: 'This Week' },
  { value: 'today', label: 'Today' },
  { value: 'custom', label: 'Custom' }
];

const FilterBar = ({ selectedDuration, onDurationChange, onCustomRangeApply }: FilterBarProps) => {
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const handleCustomClick = () => {
    setIsCustomModalOpen(true);
  };

  const handleApplyCustomRange = () => {
    if (!customStartDate || !customEndDate) {
      alert('Please select both start and end dates');
      return;
    }
    if (customStartDate > customEndDate) {
      alert('Start date must be before end date');
      return;
    }
    
    // Call the parent callback with the date range
    if (onCustomRangeApply) {
      onCustomRangeApply(customStartDate, customEndDate);
    }
    setIsCustomModalOpen(false);
  };

  const modal = isCustomModalOpen ? createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-gray-100">

        {/* Header */}
        <div className="p-6 pb-0">
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-teal-600 text-2xl">date_range</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Custom Date Range</h2>
          <p className="text-gray-500 text-sm mt-1">Choose your start and end dates</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500">
              Start Date
            </label>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-blue-50/60 border border-blue-100 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:outline-none text-gray-900 text-sm"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500">
              End Date
            </label>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-blue-50/60 border border-blue-100 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:outline-none text-gray-900 text-sm"
              max={new Date().toISOString().split('T')[0]}
              min={customStartDate || undefined}
            />
          </div>

          {customStartDate && customEndDate && (
            <div className="p-3 bg-teal-50 rounded-xl border border-teal-100 flex items-center justify-between">
              <span className="text-teal-700 text-sm font-medium">
                {customStartDate} → {customEndDate}
              </span>
              <span className="text-teal-600 text-xs font-semibold bg-teal-100 px-2 py-0.5 rounded-full">
                {Math.ceil((new Date(customEndDate + 'T00:00:00').getTime() - new Date(customStartDate + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24)) + 1} days
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={() => setIsCustomModalOpen(false)}
            className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-medium text-sm hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApplyCustomRange}
            disabled={!customStartDate || !customEndDate}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
              customStartDate && customEndDate
                ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:from-teal-700 hover:to-teal-600 shadow-md'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-sm">check</span>
            Apply Range
          </button>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <section className="mt-6">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {durations.map((duration) => (
            <button
              key={duration.value}
              onClick={() => duration.value === 'custom' ? handleCustomClick() : onDurationChange(duration.value)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedDuration === duration.value
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-surface-container-low text-on-surface/70 hover:bg-surface-container'
              }`}
            >
              {duration.label}
            </button>
          ))}
        </div>
      </section>
      {modal}
    </>
  );
};

export default FilterBar;
