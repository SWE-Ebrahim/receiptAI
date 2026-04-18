/**
 * Spending Summary Card
 * 
 * Bento grid hero section showing spending insights
 */
interface SpendingSummaryProps {
  totalSpending: number;
  transactionCount: number;
  averagePerDay: number;
  topCategory: {
    name: string;
    amount: number;
    percentage: number;
  } | null;
  duration: string;
  customStartDate?: string;
  customEndDate?: string;
}

const SpendingSummaryCard = ({ 
  totalSpending, 
  transactionCount, 
  averagePerDay,
  topCategory,
  duration,
  customStartDate,
  customEndDate
}: SpendingSummaryProps) => {
  const formatDuration = (d: string) => {
    if (d === 'custom' && customStartDate && customEndDate) {
      return `${customStartDate} - ${customEndDate}`;
    }
    const map: Record<string, string> = {
      today: 'Today',
      daily: 'This Week',
      weekly: 'This Week',
      monthly: 'This Month',
      all: 'All Time'
    };
    return map[d] || 'This Period';
  };

  return (
    <section className="grid grid-cols-2 gap-4">
      {/* Total Spending Card */}
      <div className="col-span-2 p-6 rounded-[2rem] bg-gradient-to-br from-primary to-primary-container shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <p className="text-xs font-medium text-white/80 uppercase tracking-wider mb-2">Total Spending</p>
          <h2 className="text-4xl font-bold text-white">
            {totalSpending === 0 ? 'AED 0.00' : `AED ${totalSpending.toFixed(2)}`}
          </h2>
          <p className="text-sm text-white/70 mt-2">{formatDuration(duration)}</p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="p-5 rounded-[1.5rem] bg-secondary-container">
        {topCategory ? (
          <>
            <div className="w-20 h-20 mx-auto mb-3 rounded-full border-8 border-primary/30 border-t-primary relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{Math.round(topCategory.percentage)}%</span>
              </div>
            </div>
            <p className="text-center text-sm font-medium text-on-surface truncate">{topCategory.name}</p>
            <p className="text-center text-xs text-on-surface/60 mt-1">AED {topCategory.amount.toFixed(2)}</p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-3xl">category</span>
            </div>
            <p className="text-center text-sm font-medium text-on-surface/60">No data</p>
          </>
        )}
      </div>

      {/* Quick Stats */}
      <div className="p-5 rounded-[1.5rem] bg-tertiary-container">
        <div className="space-y-3">
          <div>
            <p className="text-xs text-on-surface/60">Transactions</p>
            <p className="text-2xl font-bold text-on-surface">{transactionCount}</p>
          </div>
          <div>
            <p className="text-xs text-on-surface/60">Avg/Day</p>
            <p className="text-2xl font-bold text-on-surface">
              {averagePerDay === 0 ? 'AED 0.00' : `AED ${averagePerDay.toFixed(2)}`}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpendingSummaryCard;
