/**
 * Suggested Category Component
 * 
 * Displays AI-suggested categories based on spending patterns
 */

interface SuggestedCategoryProps {
  name: string;
  icon: string;
  onAdd: (name: string, icon: string) => void;
}

const SuggestedCategory = ({ name, icon, onAdd }: SuggestedCategoryProps) => {
  return (
    <div className="p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-tertiary">{icon}</span>
          </div>
          <div>
            <h4 className="font-medium text-on-surface">{name}</h4>
            <p className="text-xs text-on-surface/60 mt-0.5">Based on your spending patterns</p>
          </div>
        </div>
        <button 
          onClick={() => onAdd(name, icon)}
          className="px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default SuggestedCategory;
