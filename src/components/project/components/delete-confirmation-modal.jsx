import { useState } from 'react';
import { X } from 'lucide-react';
import { useI18n } from '../../../providers/i18n.provider';

const DeleteConfirmation = ({ isOpen, onCancel, onDelete }) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { t } = useI18n();

  const handleDelete = async () => {
    if (confirmationText.toLowerCase() === 'delete') {
      setIsDeleting(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsDeleting(false);
      setConfirmationText('');
      onDelete();
    }
  };

  const handleCancel = () => {
    onCancel();
    setConfirmationText('');
  };
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleCancel}
    >
      {/* Modal Content */}
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          disabled={isDeleting}
        >
          <X size={24} />
        </button>

        <div className="p-6 sm:p-8">
          {/* Warning Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          {/* Modal Header */}
          <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">
            {t('delete_modal.question')}
          </h2>
          <p className="text-slate-600 mb-6 text-center">
            {t('delete_modal.explination1')}{' '}
            <span className="font-mono font-bold text-red-600">delete</span>{' '}
            {t('delete_modal.explination2')}.
          </p>

          {/* Confirmation Input */}
          <div className="mb-6">
            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={t('delete_modal.placeholder.delete')}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
              disabled={isDeleting}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
              disabled={isDeleting}
            >
              {t('delete_modal.button.cancel')}
            </button>
            <button
              onClick={handleDelete}
              disabled={
                confirmationText.toLowerCase() !== 'delete' || isDeleting
              }
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] disabled:hover:scale-100"
            >
              {isDeleting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {t('delete_modal.status')}
                </div>
              ) : (
                t('delete_modal.button.delete')
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
