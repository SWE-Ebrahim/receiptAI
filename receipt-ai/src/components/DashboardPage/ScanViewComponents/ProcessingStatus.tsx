import React from 'react';

interface ProcessingStatusProps {
  step: string;
  progress?: number;
}

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ step, progress }) => {
  // Map steps to icons and descriptions
  const getStepInfo = (stepText: string) => {
    const steps: Record<string, { icon: string; description: string }> = {
      'Initializing OCR engine...': {
        icon: 'memory',
        description: 'Loading AI models...',
      },
      'Analyzing receipt...': {
        icon: 'analytics',
        description: 'Scanning document structure...',
      },
      'Extracting data...': {
        icon: 'text_fields',
        description: 'Reading text and numbers...',
      },
      'Validating data...': {
        icon: 'verified',
        description: 'Checking accuracy...',
      },
      'Saving receipt...': {
        icon: 'cloud_upload',
        description: 'Storing in database...',
      },
    };
    return steps[stepText] || { icon: 'sync', description: 'Processing...' };
  };

  const stepInfo = getStepInfo(step);

  return (
    <div className="bg-surface-container-low rounded-3xl p-8 space-y-6 shadow-xl border border-outline-variant/20">
      {/* Animated Icon */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping"></div>
        <div className="relative w-20 h-20 rounded-full bg-primary-container flex items-center justify-center">
          <span className={`material-symbols-outlined text-4xl text-primary ${progress === undefined ? 'animate-spin' : ''}`}>
            {stepInfo.icon}
          </span>
        </div>
      </div>

      {/* Step Text */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-on-surface">{step}</h3>
        <p className="text-sm text-on-surface-variant">{stepInfo.description}</p>
      </div>
      
      {/* Progress Bar */}
      {progress !== undefined && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-on-surface-variant">
            <span>Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-surface-container-high rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-500 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Dots Animation */}
      {progress === undefined && (
        <div className="flex justify-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      )}
    </div>
  );
};

export default ProcessingStatus;
