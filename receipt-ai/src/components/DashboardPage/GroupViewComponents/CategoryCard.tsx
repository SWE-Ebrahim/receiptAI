/**
 * Category Card Component
 * 
 * Displays individual category in bento grid style
 */

interface CategoryCardProps {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isFirst?: boolean;
}

const CategoryCard = ({ 
  id, 
  name, 
  icon, 
  color, 
  count, 
  onEdit, 
  onDelete,
  isFirst = false 
}: CategoryCardProps) => {
  return (
    <div
      className={`p-5 rounded-[1.5rem] bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer group ${
        isFirst ? 'col-span-2' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <span 
            className="material-symbols-outlined text-2xl"
            style={{ color }}
          >
            {icon}
          </span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(id);
            }}
            className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center hover:bg-secondary-container/80"
          >
            <span className="material-symbols-outlined text-xs text-primary">edit</span>
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
            className="w-8 h-8 rounded-full bg-error-container flex items-center justify-center hover:bg-error-container/80"
          >
            <span className="material-symbols-outlined text-xs text-error">delete</span>
          </button>
        </div>
      </div>
      <h4 className="font-semibold text-on-surface text-lg">{name}</h4>
      <p className="text-sm text-on-surface/60 mt-1">{count} receipts</p>
    </div>
  );
};

export default CategoryCard;
