import React from 'react';

interface ScanningOverlayProps {
  isVisible: boolean;
}

const ScanningOverlay: React.FC<ScanningOverlayProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center p-8 z-10">
      <div className="relative w-full max-w-xs">
        {/* Corner Markers */}
        <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
        <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
        <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
        
        {/* Scanning Line Animation */}
        <div className="absolute inset-0 border-2 border-primary/30 rounded-lg animate-pulse"></div>
        <div className="absolute left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(96,165,250,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
      </div>
    </div>
  );
};

export default ScanningOverlay;
