/**
 * History View Component
 * 
 * Transaction history with:
 * - Filter bar
 * - Bento grid hero section
 * - Spending insights
 * - Transaction list
 */
import { useState, useEffect } from 'react';
import { getReceiptHistory, getCategoryBreakdown, getSpendingSummary, exportTransactionsPDF, exportTransactionsAsImage } from '../../services/receiptsApi';
import FilterBar from './HistoryViewComponents/FilterBar';
import SpendingSummaryCard from './HistoryViewComponents/SpendingSummaryCard';
import TransactionList from './HistoryViewComponents/TransactionList';

interface Transaction {
  id: string;
  merchant_name: string;
  receipt_date: string;
  total_amount: number;
  category?: string | null;
  status?: string;
}

const HistoryView = () => {
  const [duration, setDuration] = useState('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSpending, setTotalSpending] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [topCategory, setTopCategory] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistoryData();
  }, [duration, customStartDate, customEndDate]);

  const fetchHistoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`📋 [HistoryView] Fetching data for duration: ${duration}`);

      // Fetch transactions
      const historyData = await getReceiptHistory(duration);
      console.log(`📋 [HistoryView] Transactions loaded: ${historyData.length}`);
      if (historyData.length > 0) {
        console.log('🔍 First transaction sample:', {
          id: historyData[0].id,
          merchant: historyData[0].merchant_name,
          has_image: !!historyData[0].original_file_url,
          image_url_preview: historyData[0].original_file_url ? historyData[0].original_file_url.substring(0, 50) + '...' : 'NO IMAGE',
          file_type: historyData[0].file_type
        });
      }
      setTransactions(historyData);
      
      // Fetch spending summary
      let spendingData;
      if (duration === 'custom' && customStartDate && customEndDate) {
        spendingData = await getSpendingSummary('custom', customStartDate, customEndDate);
      } else {
        spendingData = await getSpendingSummary(duration);
      }
      console.log(`💰 [HistoryView] Spending summary: $${spendingData.totalSpending.toFixed(2)}, ${spendingData.receiptCount} receipts`);
      setTotalSpending(spendingData.totalSpending);
      setTransactionCount(spendingData.receiptCount);

      // Fetch category breakdown
      const categoryData = await getCategoryBreakdown(duration);
      console.log(`📊 [HistoryView] Category breakdown loaded. Top:`, categoryData.topCategory);
      setTopCategory(categoryData.topCategory);

      console.log('✅ [HistoryView] All history data loaded successfully!');
    } catch (err: any) {
      console.error('❌ [HistoryView] Failed to fetch history data:', err);
      setError(err.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  // Handle custom date range from FilterBar
  const handleCustomRangeApply = (startDate: string, endDate: string) => {
    console.log(`📅 [HistoryView] Custom range applied: ${startDate} to ${endDate}`);
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
    setDuration('custom');
  };

  // Calculate average per day
  const getDaysInPeriod = () => {
    if (duration === 'custom' && customStartDate && customEndDate) {
      const start = new Date(customStartDate + 'T00:00:00');
      const end = new Date(customEndDate + 'T00:00:00');
      const diffTime = Math.abs(end.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    switch (duration) {
      case 'today': return 1;
      case 'weekly': return 7;
      case 'monthly': return 30;
      case 'all': return 365; // Approximate
      default: return 7;
    }
  };

  const averagePerDay = transactionCount > 0 ? totalSpending / getDaysInPeriod() : 0;

  // Handle Export File (Auto-detect device)
  const handleExportFile = async () => {
    if (transactions.length === 0) {
      console.warn('No transactions to export');
      return;
    }

    // Detect if mobile device (iOS/Android)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    console.log(`📱 [HistoryView] Device detected: ${isMobile ? 'Mobile' : 'Desktop'}`);
    
    try {
      if (isMobile) {
        // Mobile: Export as Image (PNG)
        console.log('📷 [HistoryView] Exporting as image for mobile device');
        await exportTransactionsAsImage(transactions, duration);
      } else {
        // Desktop: Export as HTML with print dialog
        console.log('📄 [HistoryView] Exporting as HTML for desktop device');
        exportTransactionsPDF(transactions, duration);
      }
    } catch (error) {
      console.error('❌ [HistoryView] Failed to export:', error);
    }
  };

  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 px-6 pt-6 pb-4 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/15">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-semibold text-on-surface">History</h1>
          <button className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center hover:bg-secondary-container/80 transition-colors">
            <span className="material-symbols-outlined text-primary">filter_list</span>
          </button>
        </div>
      </header>

      <div className="px-6 space-y-6">
        {/* Filter Bar */}
        <FilterBar
          selectedDuration={duration}
          onDurationChange={setDuration}
          onCustomRangeApply={handleCustomRangeApply}
        />

        {/* Error State */}
        {error && (
          <section className="bg-error-container/20 border border-error/20 p-6 rounded-2xl">
            <p className="text-error text-sm">{error}</p>
            <button 
              onClick={fetchHistoryData}
              className="mt-3 text-sm text-primary font-medium hover:opacity-80"
            >
              Try Again
            </button>
          </section>
        )}

        {/* Bento Grid Hero Section */}
        <SpendingSummaryCard
          totalSpending={totalSpending}
          transactionCount={transactionCount}
          averagePerDay={averagePerDay}
          topCategory={topCategory}
          duration={duration}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
        />

        {/* Transaction List */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-on-surface">Recent Transactions</h3>
            {transactions.length > 0 && (
              <button 
                onClick={handleExportFile}
                className="text-sm text-primary font-medium hover:opacity-80 flex items-center gap-1 px-4 py-2 rounded-xl bg-primary-container/50 hover:bg-primary-container transition-colors"
                title="Auto-detects device: HTML for desktop, Image for mobile"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                Export File
              </button>
            )}
          </div>
          
          <TransactionList 
            transactions={transactions}
            loading={loading}
          />
        </section>
      </div>
    </div>
  )
}

export default HistoryView;
