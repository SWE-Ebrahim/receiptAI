import React from 'react';

interface SourceSelectorProps {
  source: 'camera' | 'image' | 'pdf';
  onSourceChange: (source: 'camera' | 'image' | 'pdf') => void;
}

const SourceSelector: React.FC<SourceSelectorProps> = ({ source, onSourceChange }) => {
  const sources = [
    { id: 'camera', icon: 'photo_camera', label: 'Camera' },
    { id: 'image', icon: 'image', label: 'Image' },
    { id: 'pdf', icon: 'picture_as_pdf', label: 'PDF' },
  ] as const;

  return (
    <div className="flex gap-3 p-1.5 rounded-2xl bg-surface-container-low">
      {sources.map((item) => (
        <button
          key={item.id}
          onClick={() => onSourceChange(item.id)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
            source === item.id
              ? 'bg-primary text-white shadow-md'
              : 'text-on-surface/60 hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined">{item.icon}</span>
          <span className="text-sm font-medium">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default SourceSelector;
