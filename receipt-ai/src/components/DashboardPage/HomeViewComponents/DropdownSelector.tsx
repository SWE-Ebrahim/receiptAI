import { useState, useRef, useEffect } from 'react';

interface DropdownSelectorProps {
  options: { value: string; label: string }[];
  selected: string;
  onSelect: (value: string) => void;
}

/**
 * Smooth Dropdown Selector
 * 
 * Replaces horizontal scrolling with a smooth dropdown
 */
const DropdownSelector = ({ options, selected, onSelect }: DropdownSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(opt => opt.value === selected);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    onSelect(value);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm text-on-surface rounded-xl border border-outline-variant/20 shadow-sm hover:shadow-md transition-all duration-300 active:scale-95 font-medium text-xs"
      >
        <span className="material-symbols-outlined text-base">calendar_month</span>
        <span>{selectedOption?.label}</span>
        <span className={`material-symbols-outlined text-base transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {/* Dropdown Menu */}
      <div
        className={`absolute top-full left-0 mt-2 w-48 bg-linear-to-br from-surface-container-low to-surface-container rounded-lg shadow-xl border border-outline-variant/20 overflow-hidden transition-all duration-300 z-50 ${
          isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
        }`}
      >
        <div className="py-1">
          {options.map((option) => {
            const isSelected = option.value === selected;
            
            return (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-all duration-200 group ${
                  isSelected
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-on-surface/80 hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className={`material-symbols-outlined text-sm flex-shrink-0 ${isSelected ? 'text-primary' : 'text-on-surface-variant/60 group-hover:text-on-surface-variant'}`}>
                  {option.value === 'today' ? 'today' :
                   option.value === 'daily' ? 'calendar_view_week' :
                   option.value === 'weekly' ? 'date_range' :
                   option.value === 'monthly' ? 'calendar_month' :
                   'history'}
                </span>
                <span className="text-xs font-medium flex-1">{option.label}</span>
                {isSelected && (
                  <span className="material-symbols-outlined text-primary text-sm flex-shrink-0">check_circle</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DropdownSelector;
