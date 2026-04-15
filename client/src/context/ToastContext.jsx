import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

const ToastContext = createContext(null);
const DEFAULT_DURATION = 4500;

const TOAST_TYPE_STYLES = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-rose-200 bg-rose-50 text-rose-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  info: 'border-sky-200 bg-sky-50 text-sky-900'
};

const resolveToastType = (value) => {
  const type = String(value || 'info').trim().toLowerCase();
  return TOAST_TYPE_STYLES[type] ? type : 'info';
};

const createToastId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    if (!id) return;
    setToasts((prev) => prev.filter((toast) => toast.id !== id));

    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const pushToast = useCallback((message, options = {}) => {
    const text = String(message || '').trim();
    if (!text) return '';

    const id = createToastId();
    const type = resolveToastType(options.type);
    const duration = Number.isFinite(Number(options.duration))
      ? Math.max(1200, Number(options.duration))
      : DEFAULT_DURATION;

    setToasts((prev) => [...prev, { id, text, type }]);
    const timer = window.setTimeout(() => {
      removeToast(id);
    }, duration);
    timersRef.current.set(id, timer);

    return id;
  }, [removeToast]);

  useEffect(() => () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current.clear();
  }, []);

  const value = useMemo(() => ({
    show: pushToast,
    success: (message, options = {}) => pushToast(message, { ...options, type: 'success' }),
    error: (message, options = {}) => pushToast(message, { ...options, type: 'error' }),
    warning: (message, options = {}) => pushToast(message, { ...options, type: 'warning' }),
    info: (message, options = {}) => pushToast(message, { ...options, type: 'info' }),
    dismiss: removeToast,
    dismissAll: () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current.clear();
      setToasts([]);
    }
  }), [pushToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        className="pointer-events-none fixed inset-x-0 top-4 z-[120] flex justify-center px-4 sm:justify-end"
        aria-live="polite"
        aria-atomic="false"
      >
        <div className="w-full max-w-sm space-y-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-lg border px-4 py-3 shadow-md backdrop-blur-sm ${TOAST_TYPE_STYLES[toast.type]}`}
              role="status"
            >
              <div className="flex items-start gap-3">
                <p className="flex-1 text-sm font-medium">{toast.text}</p>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="rounded px-1.5 py-0.5 text-xs font-semibold opacity-70 hover:opacity-100"
                  aria-label="Dismiss notification"
                >
                  Close
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

