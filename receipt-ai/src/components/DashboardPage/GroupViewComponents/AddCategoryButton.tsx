/**
 * Add Category Button Component
 * 
 * Opens modal to create new category
 */

interface AddCategoryButtonProps {
  onClick: () => void;
}

const AddCategoryButton = ({ onClick }: AddCategoryButtonProps) => {
  return (
    <section>
      <button 
        onClick={onClick}
        className="w-full p-5 rounded-[1.5rem] border-2 border-dashed border-outline-variant hover:border-primary hover:bg-primary/5 transition-all group"
      >
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-secondary-container group-hover:bg-primary/10 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-primary">add_circle</span>
          </div>
          <div className="text-left">
            <h4 className="font-medium text-on-surface">Add New Category</h4>
            <p className="text-sm text-on-surface/60 mt-0.5">Create custom category</p>
          </div>
        </div>
      </button>
    </section>
  );
};

export default AddCategoryButton;
