// src/components/common/Modal/index.jsx
import React, { useEffect } from 'react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footerContent,
  maxWidth = 'max-w-2xl'
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-sage-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`relative w-full ${maxWidth} animate-slide-up`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-lg shadow-hover overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-sage-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-sage-900">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-sage-100 rounded-full transition-colors duration-200"
                >
                  <svg className="w-6 h-6 text-sage-500" fill="none" viewBox="0 0 24 24" 
                    stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              {children}
            </div>

            {/* Footer */}
            {footerContent && (
              <div className="px-6 py-4 bg-sage-50 border-t border-sage-200">
                {footerContent}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;