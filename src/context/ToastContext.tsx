import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  addToast: (title: string, type?: ToastType, message?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const duration = toast.duration ?? (toast.type === 'error' ? 6000 : 4000);
    const newToast: ToastItem = { ...toast, id };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      dismissToast(id);
    }, duration);
  }, [dismissToast]);

  const success = useCallback((title: string, message?: string) => showToast({ type: 'success', title, message }), [showToast]);
  const error = useCallback((title: string, message?: string) => showToast({ type: 'error', title, message }), [showToast]);
  const warning = useCallback((title: string, message?: string) => showToast({ type: 'warning', title, message }), [showToast]);
  const info = useCallback((title: string, message?: string) => showToast({ type: 'info', title, message }), [showToast]);
  const addToast = useCallback((title: string, type: ToastType = 'info', message?: string) => showToast({ type, title, message }), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, addToast, success, error, warning, info, dismissToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
        {toasts.map((toast) => {
          let bg = 'bg-white border-l-4 border-l-[#2E7D5B] text-black';
          let icon = <CheckCircle2 className="w-5 h-5 text-[#2E7D5B] shrink-0" />;

          if (toast.type === 'error') {
            bg = 'bg-white border-l-4 border-l-[#C84A4A] text-black';
            icon = <XCircle className="w-5 h-5 text-[#C84A4A] shrink-0" />;
          } else if (toast.type === 'warning') {
            bg = 'bg-white border-l-4 border-l-[#C99720] text-black';
            icon = <AlertTriangle className="w-5 h-5 text-[#C99720] shrink-0" />;
          } else if (toast.type === 'info') {
            bg = 'bg-white border-l-4 border-l-[#397B94] text-black';
            icon = <Info className="w-5 h-5 text-[#397B94] shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-lg shadow-lg border border-[#D8E5E2] p-4 flex items-start gap-3 transition-all transform translate-y-0 ${bg}`}
              role="alert"
            >
              {icon}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-tight text-black">{toast.title}</p>
                {toast.message && <p className="text-xs text-[#60716D] mt-1 leading-relaxed">{toast.message}</p>}
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-[#60716D] hover:text-black transition-colors p-1 -mr-1 -mt-1 rounded focus:outline-none focus:ring-2 focus:ring-[#00201C]"
                aria-label="Tutup notifikasi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
