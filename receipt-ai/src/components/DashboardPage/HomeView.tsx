import { useEffect, useState } from 'react';
import { FlexSummaryCard, QuickActionsGrid, RecentActivityList } from './HomeViewComponents';

/**
 * Home View Component
 * 
 * Dashboard home page with:
 * - Weekly spending summary (from API)
 * - Quick actions bento grid
 * - Recent activity list (from API)
 * 
 * Matches Home.html design exactly
 */
interface HomeViewProps {
  onNavigateToSettings?: () => void;
  onNavigateToScan?: () => void;
  onNavigateToHistory?: () => void;
  onNavigateToGroups?: () => void;
}

const HomeView = ({ onNavigateToSettings, onNavigateToScan, onNavigateToHistory, onNavigateToGroups }: HomeViewProps) => {
  const [userName, setUserName] = useState<string>('User');

  useEffect(() => {
    loadUserData();

    // Real-time polling: refresh data every 30 seconds (handled by FlexSummaryCard)
    const pollInterval = setInterval(() => {
      // FlexSummaryCard handles its own data fetching
    }, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(pollInterval);
  }, []);

  const loadUserData = () => {
    try {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        console.log('🔍 User data from localStorage:', user);
        console.log('🔍 Username:', user.username);
        console.log('🔍 Display name:', user.display_name);
        console.log('🔍 Name:', user.name);
        console.log('🔍 Email:', user.email);
        
        // Use username from signup (priority order: username -> display_name -> name -> email username)
        let displayName = user.username || user.display_name || user.name || user.email?.split('@')[0] || 'User';
        
        // Extract only the first word (username) if it contains spaces
        if (displayName && displayName.includes(' ')) {
          displayName = displayName.split(' ')[0];
        }
        
        console.log('✅ Final display name:', displayName);
        setUserName(displayName);
      }
    } catch (err) {
      console.error('Failed to load user data:', err);
    }
  };

  const handleSeeAll = () => {
    // Navigate to history view
    window.location.hash = '#/dashboard?tab=history';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-surface-bright to-surface pb-32">
      {/* TopAppBar - Light Theme */}
      <header className="bg-white/80 backdrop-blur-xl flex justify-between items-center w-full px-6 py-4 fixed top-0 z-50 border-b border-outline-variant/10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center overflow-hidden shadow-md">
            <span className="material-symbols-outlined text-on-primary text-xl">person</span>
          </div>
          <h1 className="text-xl font-bold text-on-surface font-headline tracking-tight capitalize">{userName}</h1>
        </div>
        <button 
          onClick={onNavigateToSettings}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors active:scale-95 duration-200"
        >
          <span className="material-symbols-outlined text-on-surface/60">settings</span>
        </button>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-5xl mx-auto">
        {/* Hero Section: Flexible Spending Summary */}
        <FlexSummaryCard loading={false} error={null} />

        {/* Primary Actions: Bento Grid */}
        <QuickActionsGrid 
          onNavigateToScan={onNavigateToScan}
          onNavigateToHistory={onNavigateToHistory}
          onNavigateToGroups={onNavigateToGroups}
        />

        {/* Recent Activity */}
        <RecentActivityList onSeeAll={handleSeeAll} />
      </main>
    </div>
  );
};

export default HomeView;
