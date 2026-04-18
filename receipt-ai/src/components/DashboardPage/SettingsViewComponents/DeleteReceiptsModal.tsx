/**
 * Delete Receipts Modal
 * 
 * Allows users to delete all their receipts with confirmation
 */
import { useState } from 'react';
import useToast from '../../../hooks/useToast';
import { scanApi } from '../../../services/scanApi';

interface DeleteReceiptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // Callback to refresh parent component
}

const DeleteReceiptsModal = ({ isOpen, onClose, onSuccess }: DeleteReceiptsModalProps) => {
  const { success, error, info } = useToast();
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAllReceipts = async () => {
    if (confirmText !== 'DELETE') {
      error('Please type DELETE to confirm');
      return;
    }

    setIsDeleting(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        error('Authentication required. Please login again.');
        setIsDeleting(false);
        return;
      }

      console.log('🗑️ Deleting all receipts...');
      
      const result = await scanApi.deleteAllReceipts();
      
      console.log('✅ All receipts deleted:', result);
      success('All receipts have been deleted successfully');
      
      // Reset and close
      setConfirmText('');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to delete receipts:', err);
      error(err.message || 'Failed to delete receipts');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-surface rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden">
        {/* Warning Header */}
        <div className="bg-error-container p-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-error/20 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-error text-4xl">delete_forever</span>
          </div>
          <h2 className="text-xl font-bold text-on-error-container">Delete All Receipts</h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-on-surface text-center">
            This will permanently delete all your receipts. This action cannot be undone!
          </p>

          <div className="p-4 bg-error-container/30 rounded-2xl border border-error/20">
            <p className="text-error text-sm font-medium text-center">
              ⚠️ This will delete ALL receipts from your database
            </p>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-on-surface">
              Type <span className="font-bold text-error">DELETE</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-surface-container border border-outline-variant focus:border-primary focus:outline-none text-on-surface"
              placeholder="Type DELETE here"
              disabled={isDeleting}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-surface-container text-on-surface font-medium hover:bg-surface-container-high transition-colors"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteAllReceipts}
            disabled={confirmText !== 'DELETE' || isDeleting}
            className={`flex-1 py-3 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 ${
              confirmText === 'DELETE' && !isDeleting
                ? 'bg-error text-on-error-container hover:bg-error/90'
                : 'bg-error/30 text-on-surface/40 cursor-not-allowed'
            }`}
          >
            {isDeleting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">delete</span>
                Delete All
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteReceiptsModal;
