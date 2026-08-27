import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { X } from 'lucide-react';

export interface ModalConfig {
  id?: string;
  title: string;
  subtitle?: string;
  content: (props: { closeModal: () => void; draftKey?: string }) => ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  draftKey?: string; // Optional draft key to store temporary form state
  showCloseButton?: boolean;
}

interface ModalContextValue {
  openModal: (config: ModalConfig) => void;
  replaceModal: (config: ModalConfig) => void;
  closeModal: () => void;
  isOpen: boolean;
  activeModal: ModalConfig | null;
  saveDraft: (key: string, data: any) => void;
  getDraft: <T = any>(key: string) => T | null;
  clearDraft: (key: string) => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

const DRAFT_STORAGE_PREFIX = 'ckg_modal_draft_';

const ModalBodyContent: React.FC<{
  content: (props: { closeModal: () => void; draftKey?: string }) => ReactNode;
  closeModal: () => void;
  draftKey?: string;
}> = ({ content, closeModal, draftKey }) => {
  return <>{content({ closeModal, draftKey })}</>;
};

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeModal, setActiveModal] = useState<ModalConfig | null>(null);

  // Close modal
  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  // Open modal (replaces any previous modal, enforcing single-modal lock)
  const openModal = useCallback((config: ModalConfig) => {
    setActiveModal(config);
  }, []);

  // Replace modal cleanly
  const replaceModal = useCallback((config: ModalConfig) => {
    setActiveModal(config);
  }, []);

  // Draft management helpers
  const saveDraft = useCallback((key: string, data: any) => {
    try {
      sessionStorage.setItem(`${DRAFT_STORAGE_PREFIX}${key}`, JSON.stringify(data));
    } catch {
      // ignore
    }
  }, []);

  const getDraft = useCallback(<T,>(key: string): T | null => {
    try {
      const raw = sessionStorage.getItem(`${DRAFT_STORAGE_PREFIX}${key}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const clearDraft = useCallback((key: string) => {
    try {
      sessionStorage.removeItem(`${DRAFT_STORAGE_PREFIX}${key}`);
    } catch {
      // ignore
    }
  }, []);

  // Handle ESC key press globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeModal) {
        closeModal();
      }
    };

    if (activeModal) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [activeModal, closeModal]);

  // Size mapping
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  const currentSize = activeModal?.size || 'md';

  return (
    <ModalContext.Provider
      value={{
        openModal,
        replaceModal,
        closeModal,
        isOpen: !!activeModal,
        activeModal,
        saveDraft,
        getDraft,
        clearDraft,
      }}
    >
      {children}

      {/* Global Modal Backdrop & Viewport */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200 overflow-y-auto"
          // HARD LOCK REQUIREMENT: Clicking or tapping anywhere on backdrop IMMEDIATELY closes the modal
          onMouseDown={closeModal}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={`relative w-full ${sizeClasses[currentSize]} my-8 bg-white rounded-xl shadow-2xl border border-[#D8E5E2] flex flex-col max-h-[90vh] overflow-hidden transform transition-all animate-in zoom-in-95 duration-200`}
            // Crucial: Stops clicks inside modal content from triggering backdrop close
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between px-6 py-4 border-b border-[#D8E5E2] bg-[#F8FBFA] shrink-0">
              <div className="pr-4">
                <h3 className="text-lg font-semibold text-black leading-snug">{activeModal.title}</h3>
                {activeModal.subtitle && (
                  <p className="text-xs text-[#60716D] mt-0.5 leading-relaxed">{activeModal.subtitle}</p>
                )}
              </div>
              {activeModal.showCloseButton !== false && (
                <button
                  onClick={closeModal}
                  className="text-[#60716D] hover:text-black hover:bg-[#E1F5FE] p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#00201C]"
                  aria-label="Tutup modal (ESC)"
                  title="Tutup (ESC)"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              <ModalBodyContent
                content={activeModal.content}
                closeModal={closeModal}
                draftKey={activeModal.draftKey}
              />
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
};
