import { useEffect, useRef, useState } from "react";
import { getFileUrl } from "../../utils/files";
import { Icon } from "./helpers";

export default function ExpandableImage({ src, alt, className = "" }) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef(null);
  const triggerRef = useRef(null);
  const url = getFileUrl(typeof src === "string" ? src : src?.url);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [open]);

  if (!url) return null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className={`group relative overflow-hidden cursor-zoom-in focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${className}`}
        aria-label={`Ampliar ${alt.toLowerCase()}`}
      >
        <img src={url} alt={alt} className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
        <span className="absolute right-1.5 bottom-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-gray-950/70 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true">
          <Icon name="magnifying-glass-plus" />
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/90 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`Vista ampliada de ${alt.toLowerCase()}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <img src={url} alt={alt} className="max-h-full max-w-full object-contain" />
          <button
            ref={closeRef}
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-950 shadow-lg hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-orange-500"
            aria-label="Cerrar imagen ampliada"
          >
            <Icon name="xmark" />
          </button>
          <p className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-gray-950/70 px-3 py-1.5 text-center text-xs text-white">
            Pulsa Escape o el botÃ³n cerrar para volver
          </p>
        </div>
      )}
    </>
  );
}
