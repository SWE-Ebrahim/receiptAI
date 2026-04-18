import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { getSpendingSummary, type WeeklySpendingData } from '../../../services/receiptsApi';
import DropdownSelector from './DropdownSelector';

interface FlexSummaryCardProps {
  loading: boolean;
  error: string | null;
}

type DurationType = 'today' | 'daily' | 'weekly' | 'monthly' | 'all' | 'custom';

const durationOptions: { value: DurationType; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'daily', label: 'This Week' },
  { value: 'weekly', label: 'Last Week' },
  { value: 'monthly', label: 'This Month' },
  { value: 'all', label: 'All Time' },
  { value: 'custom', label: 'Custom Range' }
];

const FlexSummaryCard = ({ loading, error }: FlexSummaryCardProps) => {
  const [duration, setDuration] = useState<DurationType>('all');
  const [data, setData] = useState<WeeklySpendingData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    if (duration !== 'custom') {
      fetchData();
    }
  }, [duration]);

  const fetchData = async (startDate?: string, endDate?: string) => {
    try {
      setIsRefreshing(true);
      if (duration === 'custom' && startDate && endDate) {
        const result = await getSpendingSummary('custom', startDate, endDate);
        setData(result);
      } else {
        const result = await getSpendingSummary(duration);
        setData(result);
      }
    } catch (err) {
      console.error('❌ Failed to fetch spending data:', err);
      alert('Failed to load spending data. Please check your connection or try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCustomDurationSelect = (value: DurationType) => {
    if (value === 'custom') {
      setIsCustomModalOpen(true);
    } else {
      setDuration(value);
    }
  };

  const handleApplyCustomRange = () => {
    if (!customStartDate || !customEndDate) {
      alert('Please select both start and end dates');
      return;
    }
    if (new Date(customStartDate) > new Date(customEndDate)) {
      alert('Start date must be before end date');
      return;
    }
    setDuration('custom');
    fetchData(customStartDate, customEndDate);
    setIsCustomModalOpen(false);
  };

  const selectedLabel = duration === 'custom' && customStartDate && customEndDate
    ? `${customStartDate} - ${customEndDate}`  // Use raw date strings (YYYY-MM-DD) to avoid timezone bugs
    : durationOptions.find(opt => opt.value === duration)?.label || 'this period';

  // ✅ modal is properly assigned here
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
                {new Date(customStartDate).toLocaleDateString()} → {new Date(customEndDate).toLocaleDateString()}
              </span>
              <span className="text-teal-600 text-xs font-semibold bg-teal-100 px-2 py-0.5 rounded-full">
                {Math.ceil((new Date(customEndDate).getTime() - new Date(customStartDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days
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

  if (loading) {
    return (
      <section className="mb-10">
        <div className="bg-linear-to-br from-surface-container-low to-surface-container p-8 rounded-2xl relative overflow-hidden shadow-sm border border-outline-variant/10 animate-pulse">
          <div className="h-4 bg-outline-variant/20 rounded w-32 mb-4"></div>
          <div className="h-12 bg-outline-variant/20 rounded w-48 mb-4"></div>
          <div className="flex gap-2 items-end h-24">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex-1 bg-outline-variant/20 rounded-t-lg" style={{ height: `${Math.random() * 100}%` }}></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-10">
        <div className="bg-error-container/20 border border-error/20 p-6 rounded-2xl">
          <p className="text-error text-sm">Failed to load spending data</p>
        </div>
      </section>
    );
  }

  if (!data || data.totalSpending === 0) {
    return (
      <section className="mb-10">
        <div className="bg-linear-to-br from-surface-container-low to-surface-container p-8 rounded-2xl relative overflow-hidden shadow-sm border border-outline-variant/10">
          <div className="mb-6">
            <DropdownSelector
              options={durationOptions}
              selected={duration}
              onSelect={(value) => handleCustomDurationSelect(value as DurationType)}
            />
          </div>
          <div className="flex flex-col items-center justify-center gap-4 min-h-60">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-fixed-dim/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            <div className="relative z-10 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-linear-to-br from-secondary-container to-primary/10 flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-primary text-4xl">account_balance_wallet</span>
              </div>
              <h2 className="font-headline text-5xl font-extrabold text-on-surface tracking-tighter mb-3">AED 0.00</h2>
              <p className="text-on-surface-variant text-base font-medium">No spending {selectedLabel.toLowerCase()}</p>
              <p className="text-on-surface-variant/60 text-sm mt-2">Start scanning receipts to track your expenses</p>
            </div>
          </div>
        </div>
        {modal}
      </section>
    );
  }

  const maxDailyAmount = Math.max(...data.dailyBreakdown, 1);

  return (
    <section className="mb-10">
      <div className="bg-linear-to-br from-surface-container-low to-surface-container p-8 rounded-2xl relative overflow-hidden shadow-sm border border-outline-variant/10">
        <div className="mb-6">
          <DropdownSelector
            options={durationOptions}
            selected={duration}
            onSelect={(value) => handleCustomDurationSelect(value as DurationType)}
          />
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative overflow-hidden">
          <div className="relative z-10">
            <p className="font-label text-sm uppercase tracking-widest text-on-surface-variant/70 mb-2 font-semibold">
              {selectedLabel} Spending
            </p>
            <h2 className={`font-headline text-5xl font-extrabold text-on-surface tracking-tighter transition-all duration-300 ${
              isRefreshing ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
            }`}>
              AED {data.totalSpending.toFixed(2)}
            </h2>
            {data.receiptCount > 0 && (
              <div className="mt-4 flex items-center gap-2">
                <span className={`font-bold text-xs px-3 py-1.5 rounded-full shadow-sm ${
                  data.percentageChange >= 0
                    ? 'bg-tertiary-container/30 text-tertiary'
                    : 'bg-primary-container/30 text-primary'
                }`}>
                  {data.percentageChange >= 0 ? '↑' : '↓'} {Math.abs(data.percentageChange)}% from previous period
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2 items-end h-24 relative z-10">
            {data.dailyBreakdown.map((amount, i) => {
              const heightPercentage = (amount / maxDailyAmount) * 100;
              const isToday = i === new Date().getDay() - 1;
              return (
                <div
                  key={i}
                  className={`w-5 rounded-t-lg transition-all duration-500 ease-out ${
                    isToday ? 'bg-linear-to-t from-primary to-primary-container shadow-lg' : 'bg-primary/20'
                  }`}
                  style={{ height: `${Math.max(heightPercentage, 8)}%` }}
                  title={`AED ${amount.toFixed(2)}`}
                ></div>
              );
            })}
          </div>

          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-fixed-dim/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        </div>
      </div>

      {modal}
    </section>
  );
};

export default FlexSummaryCard;