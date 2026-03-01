import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

const TOAST_DURATION = {
  success: 4000,
  error: 0,
  info: 3000
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback((type, message) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);

    const ttl = TOAST_DURATION[type] ?? 3000;
    if (ttl > 0) {
      setTimeout(() => removeToast(id), ttl);
    }
  }, [removeToast]);

  const value = useMemo(() => ({
    success: (msg) => pushToast("success", msg),
    error: (msg) => pushToast("error", msg),
    info: (msg) => pushToast("info", msg)
  }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`radar-card px-4 py-3 text-sm shadow-glow border border-transparent ${
              toast.type === "success"
                ? "bg-emerald-100 text-emerald-900 border-emerald-200"
                : toast.type === "error"
                ? "bg-red-100 text-red-900 border-red-200"
                : "bg-sky-100 text-sky-900 border-sky-200"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <span>{toast.message}</span>
              {toast.type === "error" && (
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="text-xs uppercase tracking-wide text-radar-muted hover:text-radar-text"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
};
