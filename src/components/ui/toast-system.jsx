import React, { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const toastVariants = {
  success: {
    icon: CheckCircle,
    className: 'bg-green-50 border-green-200 text-green-800',
    iconClassName: 'text-green-500'
  },
  error: {
    icon: AlertCircle,
    className: 'bg-red-50 border-red-200 text-red-800',
    iconClassName: 'text-red-500'
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    iconClassName: 'text-yellow-500'
  },
  info: {
    icon: Info,
    className: 'bg-blue-50 border-blue-200 text-blue-800',
    iconClassName: 'text-blue-500'
  }
};

const Toast = ({ toast, onRemove }) => {
  const variant = toastVariants[toast.type] || toastVariants.info;
  const Icon = variant.icon;

  React.useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        onRemove(toast.id);
      }, toast.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg',
        'animate-slide-in-down transition-all duration-300',
        'max-w-md w-full',
        variant.className
      )}
    >
      <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', variant.iconClassName)} />
      
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="font-semibold text-sm mb-1">{toast.title}</p>
        )}
        {toast.description && (
          <p className="text-sm opacity-90">{toast.description}</p>
        )}
        {toast.action && (
          <div className="mt-3">
            {toast.action}
          </div>
        )}
      </div>

      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 p-1 rounded-md hover:bg-black/10 transition-colors"
        aria-label="Fechar notificação"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now().toString();
    const newToast = {
      id,
      type: 'info',
      duration: 5000,
      ...toast
    };

    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const toast = useCallback({
    success: (title, description, options = {}) => 
      addToast({ type: 'success', title, description, ...options }),
    error: (title, description, options = {}) => 
      addToast({ type: 'error', title, description, ...options }),
    warning: (title, description, options = {}) => 
      addToast({ type: 'warning', title, description, ...options }),
    info: (title, description, options = {}) => 
      addToast({ type: 'info', title, description, ...options }),
    custom: (options) => addToast(options)
  }, [addToast]);

  const value = {
    toast,
    removeToast,
    toasts
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Hook para facilitar o uso
export const useToastActions = () => {
  const { toast } = useToast();
  
  return {
    showSuccess: (message, description) => toast.success(message, description),
    showError: (message, description) => toast.error(message, description),
    showWarning: (message, description) => toast.warning(message, description),
    showInfo: (message, description) => toast.info(message, description)
  };
};

