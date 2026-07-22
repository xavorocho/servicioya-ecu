import { useEffect, useRef } from "react";

export default function Modal({ open, onClose, children }) {
  const ref = useRef(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      ref.current?.focus();
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape" && open) onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div ref={ref} className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl animate-modal outline-none" tabIndex={-1}>
        {children}
      </div>
    </div>
  );
}
