import { useEffect, useState } from 'react';
import { getRecentActivity, type RecentActivityItem } from '../../../services/receiptsApi';

interface RecentActivityProps {
  onSeeAll?: () => void;
}

/**
 * Recent Activity List
 * 
 * Displays the 5 most recent receipts with category icons
 * Matches Home.html design exactly
 */
const RecentActivityList = ({ onSeeAll }: RecentActivityProps) => {
  const [activities, setActivities] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentActivity();
    // Removed polling - data is now cached and refreshed on navigation
  }, []);

  const fetchRecentActivity = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRecentActivity();
      setActivities(data);
    } catch (err) {
      console.error('Failed to fetch recent activity:', err);
      setError('Failed to load recent activity');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string, receiptTime?: string | null) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Reset both to midnight for accurate day comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const receiptDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    // Calculate difference in days (positive = past, negative = future)
    const diffMs = today.getTime() - receiptDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Use receipt_time if available, otherwise use time from created_at
    const displayTime = receiptTime || date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    if (diffDays === 0) {
      return `Today • ${displayTime}`;
    } else if (diffDays === 1) {
      return `Yesterday • ${displayTime}`;
    } else if (diffDays > 1 && diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <section className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-headline text-xl font-bold text-on-surface">Recent Activity</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface-container-low p-5 rounded-lg flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-outline-variant/20"></div>
                <div>
                  <div className="h-4 bg-outline-variant/20 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-outline-variant/20 rounded w-24"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-4 bg-outline-variant/20 rounded w-16 mb-2"></div>
                <div className="h-4 bg-outline-variant/20 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-headline text-xl font-bold text-on-surface">Recent Activity</h3>
        </div>
        <div className="bg-error-container/20 border border-error/20 p-6 rounded-xl">
          <p className="text-error text-sm">{error}</p>
        </div>
      </section>
    );
  }

  // Empty state
  if (activities.length === 0) {
    return (
      <section className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-headline text-xl font-bold text-on-surface">Recent Activity</h3>
        </div>
        <div className="bg-surface-container-low p-12 rounded-xl text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-3xl">receipt_long</span>
          </div>
          <h4 className="font-headline font-bold text-lg text-on-surface mb-2">No receipts yet</h4>
          <p className="text-on-surface-variant text-sm">Start scanning receipts to see your activity here</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-headline text-xl font-bold text-on-surface">Recent Activity</h3>
        <button 
          onClick={onSeeAll}
          className="text-primary font-bold text-sm hover:underline transition-colors"
        >
          See all
        </button>
      </div>
      
      <div className="space-y-3">
        {activities.map((activity) => (
          <div 
            key={activity.id}
            className="group bg-white border border-outline-variant/15 p-5 rounded-2xl flex items-center justify-between hover:bg-surface-container-high hover:shadow-md hover:border-outline-variant/30 transition-all duration-300 hover:scale-[1.01] active:scale-100 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full ${activity.categoryColor}/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <span className="material-symbols-outlined" style={{ color: activity.categoryColor.replace('bg-', 'text-') }}>
                  {activity.categoryIcon}
                </span>
              </div>
              <div>
                <h4 className="font-headline font-bold text-on-surface">{activity.merchant}</h4>
                <p className="text-sm text-on-surface-variant/70 mt-0.5">{formatDate(activity.date, activity.receipt_time)}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="font-headline font-bold text-on-surface text-lg">AED {activity.amount.toFixed(2)}</p>
              <span className="inline-block mt-1 text-[10px] uppercase tracking-wider text-on-surface-variant font-bold px-2.5 py-1 bg-surface-container rounded-full">
                {activity.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecentActivityList;
