import { useState, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

const Toast = ({ message, type, duration = 2000, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const enterTimer = setTimeout(() => setIsVisible(true), 10);

    const leaveTimer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(onClose, 400);
    }, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(leaveTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(onClose, 400);
  };

  const config = {
    success: {
      icon: 'check_circle',
      iconColor: 'text-teal-600',
      bg: 'bg-white',
      border: 'border-teal-200',
      dot: 'bg-teal-500',
      label: 'text-teal-700',
    },
    error: {
      icon: 'error',
      iconColor: 'text-red-500',
      bg: 'bg-white',
      border: 'border-red-200',
      dot: 'bg-red-500',
      label: 'text-red-700',
    },
    warning: {
      icon: 'warning',
      iconColor: 'text-amber-500',
      bg: 'bg-white',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
      label: 'text-amber-700',
    },
    info: {
      icon: 'info',
      iconColor: 'text-blue-500',
      bg: 'bg-white',
      border: 'border-blue-200',
      dot: 'bg-blue-500',
      label: 'text-blue-700',
    },
  }[type];

  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-400 ease-out ${
        isVisible && !isLeaving
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-4'
      }`}
      style={{ minWidth: '320px', maxWidth: '90vw' }}
    >
      <div
        className={`${config.bg} border ${config.border} rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3`}
      >
        {/* Icon */}
        <span className={`material-symbols-outlined text-2xl flex-shrink-0 ${config.iconColor}`}>
          {config.icon}
        </span>

        {/* Message */}
        <p className="text-gray-800 text-sm font-medium flex-1 leading-snug">
          {message}
        </p>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <span className="material-symbols-outlined text-base text-gray-400">close</span>
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl overflow-hidden">
        <div
          className={`h-full ${config.dot} rounded-b-2xl`}
          style={{
            animation: `shrink ${duration}ms linear forwards`,
          }}
        />
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default Toast;