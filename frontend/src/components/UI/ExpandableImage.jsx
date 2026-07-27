import { useEffect, useRef, useState } from "react";
import { getFileUrl } from "../../utils/files";
import { Icon } from "./helpers";

const clampZoom = (value) => Math.min(4, Math.max(1, value));

export default function ExpandableImage({ src, alt, className = "" }) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const closeRef = useRef(null);
  const triggerRef = useRef(null);
  const dragRef = useRef(null);
  const url = getFileUrl(typeof src === "string" ? src : src?.url);

  const resetView = () => { setZoom(1); setPosition({ x: 0, y: 0 }); };
  const changeZoom = (nextZoom) => {
    const value = clampZoom(nextZoom);
    setZoom(value);
    if (value === 1) setPosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (!open) return undefined;
    resetView();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "+" || event.key === "=") setZoom((current) => clampZoom(current + 0.25));
      if (event.key === "-") setZoom((current) => clampZoom(current - 0.25));
      if (event.key === "0") resetView();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [open]);

  if (!url) return null;

  return <>
    <button ref={triggerRef} type="button" onClick={() => setOpen(true)} className={`group relative overflow-hidden cursor-zoom-in focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${className}`} aria-label={`Ampliar ${alt.toLowerCase()}`}>
      <img src={url} alt={alt} className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105" />
      <span className="absolute bottom-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-gray-950/70 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true"><Icon name="magnifying-glass-plus" /></span>
    </button>

    {open && <div className="fixed inset-0 z-[100] bg-gray-950/95" role="dialog" aria-modal="true" aria-label={`Vista ampliada de ${alt.toLowerCase()}`}>
      <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white p-1.5 text-gray-950 shadow-xl" role="toolbar" aria-label="Controles de zoom">
        <button type="button" onClick={() => changeZoom(zoom - 0.25)} disabled={zoom <= 1} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-35" aria-label="Alejar imagen"><Icon name="magnifying-glass-minus" /></button>
        <output className="w-14 text-center text-xs font-bold" aria-live="polite">{Math.round(zoom * 100)}%</output>
        <button type="button" onClick={() => changeZoom(zoom + 0.25)} disabled={zoom >= 4} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-35" aria-label="Acercar imagen"><Icon name="magnifying-glass-plus" /></button>
        <button type="button" onClick={resetView} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100" aria-label="Restablecer imagen"><Icon name="rotate-left" /></button>
      </div>
      <div className={`absolute inset-0 flex items-center justify-center overflow-hidden p-4 pt-20 sm:p-8 sm:pt-20 ${zoom > 1 ? "cursor-grab active:cursor-grabbing" : ""}`} style={{ touchAction: "none" }}
        onWheel={(event) => { event.preventDefault(); changeZoom(zoom + (event.deltaY < 0 ? 0.25 : -0.25)); }}
        onDoubleClick={() => changeZoom(zoom === 1 ? 2 : 1)}
        onPointerDown={(event) => { if (zoom <= 1) return; event.currentTarget.setPointerCapture(event.pointerId); dragRef.current = { x: event.clientX, y: event.clientY, originX: position.x, originY: position.y }; }}
        onPointerMove={(event) => { if (dragRef.current) setPosition({ x: dragRef.current.originX + event.clientX - dragRef.current.x, y: dragRef.current.originY + event.clientY - dragRef.current.y }); }}
        onPointerUp={(event) => { dragRef.current = null; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}>
        <img src={url} alt={alt} draggable="false" className="max-h-full max-w-full select-none object-contain" style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${zoom})`, transition: dragRef.current ? "none" : "transform 120ms ease-out" }} />
      </div>
      <button ref={closeRef} type="button" onClick={() => setOpen(false)} className="absolute right-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-950 shadow-lg hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-orange-500" aria-label="Cerrar imagen ampliada"><Icon name="xmark" /></button>
      <p className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full bg-gray-950/75 px-3 py-1.5 text-center text-xs text-white">Rueda para ampliar · arrastra para desplazarte · doble clic para restablecer</p>
    </div>}
  </>;
}
