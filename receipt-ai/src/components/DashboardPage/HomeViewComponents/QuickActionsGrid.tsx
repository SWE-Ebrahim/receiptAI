/**
 * Quick Actions Bento Grid
 * 
 * Primary and secondary action buttons in bento grid layout
 * Matches Home.html design exactly
 */
interface QuickActionsGridProps {
  onNavigateToScan?: () => void;
  onNavigateToHistory?: () => void;
  onNavigateToGroups?: () => void;
}

const QuickActionsGrid = ({ onNavigateToScan, onNavigateToHistory, onNavigateToGroups }: QuickActionsGridProps) => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
      {/* Scan Receipt (Primary Large Action) */}
      <button 
        onClick={onNavigateToScan}
        className="md:col-span-2 relative group overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-container p-8 rounded-2xl text-left h-64 flex flex-col justify-end active:scale-[0.98] transition-all duration-300 shadow-lg hover:shadow-xl border border-primary/20"
      >
        <div className="absolute top-6 right-6">
          <span 
            className="material-symbols-outlined text-on-primary text-6xl opacity-15 group-hover:opacity-30 transition-opacity duration-300" 
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            center_focus_strong
          </span>
        </div>
        <div className="relative z-10">
          <h3 className="font-headline text-3xl font-bold text-on-primary mb-3">Scan Receipt</h3>
          <p className="text-on-primary/90 font-body max-w-xs text-base leading-relaxed">AI-powered extraction of items, taxes, and totals in seconds.</p>
        </div>
      </button>

      <div className="grid grid-cols-1 gap-4">
        {/* View Receipts */}
        <button 
          onClick={onNavigateToHistory}
          className="bg-white border border-outline-variant/20 p-6 rounded-2xl text-left hover:bg-surface-container-high hover:shadow-md transition-all duration-300 active:scale-[0.98] flex flex-col justify-between group"
        >
          <span className="material-symbols-outlined text-primary text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">receipt_long</span>
          <span className="font-headline font-bold text-lg text-on-surface">View Receipts</span>
        </button>

        {/* Categories */}
        <button 
          onClick={onNavigateToGroups}
          className="bg-white border border-outline-variant/20 p-6 rounded-2xl text-left hover:bg-surface-container-high hover:shadow-md transition-all duration-300 active:scale-[0.98] flex flex-col justify-between group"
        >
          <span className="material-symbols-outlined text-primary text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">category</span>
          <span className="font-headline font-bold text-lg text-on-surface">Categories</span>
        </button>
      </div>
    </section>
  );
};

export default QuickActionsGrid;
