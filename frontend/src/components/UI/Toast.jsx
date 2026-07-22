import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { Icon } from "./helpers";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  const hideToast = () => setToast(null);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && <ToastItem toast={toast} onClose={hideToast} />}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

function ToastItem({ toast, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3200);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bg = toast.type === "error" ? "bg-red-600" : "bg-emerald-700";
  const iconName = toast.type === "error" ? "ban" : "circle-check";

  return (
    <div className={`fixed bottom-5 right-5 z-50 max-w-sm px-5 py-3.5 rounded-2xl ${bg} text-white shadow-2xl animate-slide-down flex items-center gap-3 text-sm font-semibold`} role="status" aria-live="polite">
      <Icon name={iconName} className="text-lg" />
      <span>{toast.message}</span>
    </div>
  );
}

export default function Toast() {
  return null;
}
