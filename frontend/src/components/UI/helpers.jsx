const icons = {
  house: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  ),
  "house-chimney-user": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <circle cx="12" cy="7" r="3" />
    </svg>
  ),
  "house-user": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <circle cx="12" cy="7" r="3" />
    </svg>
  ),
  "magnifying-glass": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  "circle-question": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  ),
  "clipboard-list": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4" />
      <path d="M12 16h4" />
      <path d="M8 11h.01" />
      <path d="M8 16h.01" />
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  "gauge-high": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <path d="m12 14 4-4" />
      <path d="M3.34 19a10 10 0 1 1 17.32 0" />
    </svg>
  ),
  inbox: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  ),
  "id-card": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <circle cx="12" cy="10" r="3" />
      <path d="M7 21v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  "file-shield": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <path d="M15 22H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h8.5a1.5 1.5 0 0 0 3 0H21a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1 1 1 0 0 1-1 1H12" />
      <path d="M17 3v5a1 1 0 0 0 1 1h5" />
      <path d="m9 13 2 2 4-4" />
    </svg>
  ),
  "chart-pie": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  ),
  "chart-column": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <path d="M7 16h8" />
      <path d="M7 11h12" />
      <path d="M7 6h3" />
    </svg>
  ),
  "user-check": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  ),
  "user-shield": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
      <path d="M12 11v2" />
      <path d="M12 16h.01" />
    </svg>
  ),
  "user-plus": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" x2="19" y1="8" y2="14" />
      <line x1="22" x2="16" y1="11" y2="11" />
    </svg>
  ),
  "right-to-bracket": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" x2="3" y1="12" y2="12" />
    </svg>
  ),
  "right-from-bracket": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  ),
  wrench: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  bolt: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  broom: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <path d="M15 11h.01" />
      <path d="M11 15h.01" />
      <path d="M16 16h.01" />
      <path d="m2 22 4-4" />
      <path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
      <path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
      <path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
      <path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z" />
      <path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z" />
      <path d="M15.47 13.47 17 15l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z" />
      <path d="M19.47 9.47 21 11l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L13 11l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z" />
    </svg>
  ),
  "paint-roller": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <rect width="16" height="6" x="6" y="4" rx="2" />
      <path d="M22 7h-2a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2" />
      <path d="M6 18v3a1 1 0 0 0 1 1h2" />
      <path d="M3 11l.7-2.7A2 2 0 0 1 5.6 7h12.8a2 2 0 0 1 1.9 1.3L21 11" />
    </svg>
  ),
  hammer: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9" />
      <path d="M17.64 15 22 10.64" />
      <path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25V6.5a.5.5 0 0 0-.5-.5H16.6c-.85 0-1.65-.33-2.25-.93l-1.25-1.25" />
      <path d="M13.64 15l-5.66 5.66a2.12 2.12 0 0 1-3 0c-.83-.83-.83-2.17 0-3L11 9" />
      <path d="M16 16.5c.6-.6.93-1.4.93-2.25V9.5a.5.5 0 0 0-.5-.5H13.6" />
      <path d="M11 6.5V3a.5.5 0 0 0-.5-.5H9c-.85 0-1.65.33-2.25.93" />
    </svg>
  ),
  seedling: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <path d="M12 22V8" />
      <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
      <path d="M9 6.22 12 3" />
      <path d="M9 12c0 2.76 3 6 3 6s3-3.24 3-6" />
      <path d="M12 6.22 15 3" />
      <path d="M5.6 12H2" />
      <path d="M22 12h-3.6" />
    </svg>
  ),
  plug: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <path d="M12 22v-5" />
      <path d="M9 8V2" />
      <path d="M15 8V2" />
      <path d="M18 8v5a6 6 0 0 1-6 6v0a6 6 0 0 1-6-6V8z" />
    </svg>
  ),
  truck: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  ),
  key: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="m21 2-9.6 9.6" />
      <path d="m15.5 7.5 3 3L22 7l-3-3" />
      <path d="m14.5 7.5 3 3L22 7l-3-3" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" className="w-[1em] h-[1em]">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  "dollar-sign": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  "paper-plane": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <path d="m22 2-7 20-4-9-9-4z" />
      <path d="M22 2 11 13" />
    </svg>
  ),
  "shield-halved": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M12 22V12" />
    </svg>
  ),
  "circle-check": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  "check-double": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <path d="M18 6 7 17l-5-5" />
      <path d="m22 10-9.5 9.5L10 17" />
    </svg>
  ),
  "chevron-right": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
  "circle-info": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  ),
  envelope: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  briefcase: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </svg>
  ),
  "location-dot": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  "map-location-dot": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  tags: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
  ),
  route: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <circle cx="6" cy="19" r="3" />
      <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
      <circle cx="18" cy="5" r="3" />
    </svg>
  ),
  award: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  ),
  sliders: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <line x1="4" x2="4" y1="21" y2="14" />
      <line x1="4" x2="4" y1="10" y2="3" />
      <line x1="12" x2="12" y1="21" y2="12" />
      <line x1="12" x2="12" y1="8" y2="3" />
      <line x1="20" x2="20" y1="21" y2="16" />
      <line x1="20" x2="20" y1="12" y2="3" />
      <line x1="2" x2="6" y1="14" y2="14" />
      <line x1="10" x2="14" y1="8" y2="8" />
      <line x1="18" x2="22" y1="16" y2="16" />
    </svg>
  ),
  list: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <line x1="8" x2="21" y1="6" y2="6" />
      <line x1="8" x2="21" y1="12" y2="12" />
      <line x1="8" x2="21" y1="18" y2="18" />
      <line x1="3" x2="3.01" y1="6" y2="6" />
      <line x1="3" x2="3.01" y1="12" y2="12" />
      <line x1="3" x2="3.01" y1="18" y2="18" />
    </svg>
  ),
  "rotate-left": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <path d="M2 12a10 10 0 0 1 10-10c3.1 0 5.85 1.46 7.75 3.75" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
      <path d="m2 20 3-3" />
      <path d="M2 17l3 3" />
    </svg>
  ),
  rotate: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  ),
  trash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  spinner: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em] animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  ),
  ban: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <circle cx="12" cy="12" r="10" />
      <path d="m4.9 4.9 14.2 14.2" />
    </svg>
  ),
  toolbox: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2" />
      <rect width="6" height="4" x="9" y="2" />
      <path d="M12 12v3" />
      <path d="M6 12v3" />
    </svg>
  ),
  "layer-group": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </svg>
  ),
  xmark: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  ),
  bars: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1em] h-[1em]">
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  ),
};

export function Icon({ name, className = "" }) {
  const icon = icons[name];
  if (icon) {
    return <span className={`inline-flex items-center justify-center align-middle leading-none ${className}`} aria-hidden="true">{icon}</span>;
  }
  return <span className={`inline-flex items-center justify-center align-middle leading-none ${className}`} aria-hidden="true">⚙</span>;
}

export function initials(name) {
  return String(name || "SY").split(" ").filter(Boolean).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export function stars(value) {
  const total = Math.round(Number(value || 0));
  return "★".repeat(total) + "☆".repeat(5 - total);
}

export function statusClass(status) {
  const map = {
    "Pendiente": "bg-amber-50 text-amber-700 border-amber-200",
    "Aprobado": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Activo": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Confirmada": "bg-indigo-50 text-indigo-700 border-indigo-200",
    "En proceso": "bg-purple-50 text-purple-700 border-purple-200",
    "Completada": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Cancelada": "bg-red-50 text-red-700 border-red-200",
    "Rechazada": "bg-red-50 text-red-700 border-red-200",
  };
  return map[status] || "bg-gray-50 text-gray-700 border-gray-200";
}

export function StatCard({ value, label, icon, color = "blue" }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    teal: "bg-cyan-50 text-cyan-600",
    green: "bg-emerald-50 text-emerald-600",
    orange: "bg-amber-50 text-amber-600",
    purple: "bg-purple-50 text-purple-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <article className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${colors[color] || colors.blue}`}>
        <Icon name={icon} />
      </div>
      <div>
        <strong className="block text-2xl font-extrabold text-gray-900 leading-tight">{value}</strong>
        <span className="text-sm text-gray-500 font-semibold">{label}</span>
      </div>
    </article>
  );
}

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${statusClass(status)}`}>
      {status}
    </span>
  );
}

export function Avatar({ name, className = "" }) {
  return (
    <span className={`w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${className}`}>
      {initials(name)}
    </span>
  );
}

export function Breadcrumb({ items }) {
  if (!items?.length) return null;
  return (
    <nav className="flex flex-wrap items-center gap-1.5 mb-3 text-xs font-semibold text-gray-500" aria-label="Ruta de navegación">
      {items.map((item, i) => (
        i < items.length - 1
          ? <><a href={item.href} className="text-blue-600 hover:underline">{item.label}</a><Icon name="chevron-right" className="text-[0.5rem] opacity-40" /></>
          : <span>{item.label}</span>
      ))}
    </nav>
  );
}

export function EmptyState({ icon, title, message, action }) {
  return (
    <div className="text-center py-12 px-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
      <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-2xl">
        <Icon name={icon} />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm mx-auto mb-5">{message}</p>
      {action}
    </div>
  );
}

export function StatusChart({ requests }) {
  const statuses = [
    { key: "Pendiente", icon: "clock", color: "orange" },
    { key: "Confirmada", icon: "circle-check", color: "blue" },
    { key: "En proceso", icon: "spinner", color: "purple" },
    { key: "Completada", icon: "check-double", color: "green" },
    { key: "Cancelada", icon: "ban", color: "red" },
  ];
  const max = Math.max(...statuses.map((s) => requests.filter((r) => r.status === s.key).length), 1);

  const barColors = {
    orange: "from-amber-500 to-amber-300",
    blue: "from-blue-600 to-blue-400",
    purple: "from-purple-600 to-purple-400",
    green: "from-emerald-600 to-emerald-400",
    red: "from-red-500 to-red-300",
  };

  return (
    <div className="space-y-3">
      {statuses.map((s) => {
        const count = requests.filter((r) => r.status === s.key).length;
        const width = Math.round((count / max) * 100);
        return (
          <div key={s.key} className="grid grid-cols-[120px_1fr_40px] gap-3 items-center">
            <span className="flex items-center gap-2 text-sm font-semibold text-gray-600"><Icon name={s.icon} className="w-4 text-center" /> {s.key}</span>
            <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
              <div className={`h-full rounded-full bg-gradient-to-r ${barColors[s.color]} transition-all duration-500`} style={{ width: `${width}%` }} />
            </div>
            <span className="text-right font-extrabold text-sm text-gray-800">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

export function DonutChart({ providers }) {
  const approved = providers.filter((p) => p.status === "Aprobado").length;
  const pending = providers.filter((p) => p.status === "Pendiente").length;
  const rejected = providers.filter((p) => p.status === "Rechazada").length;
  const total = providers.length || 1;
  const pct = Math.round((approved / total) * 100);

  const gradient = `conic-gradient(#059669 0% ${(approved / total) * 100}%, #d97706 ${(approved / total) * 100}% ${((approved + pending) / total) * 100}%, #dc2626 ${((approved + pending) / total) * 100}% 100%)`;

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <div className="w-28 h-28 rounded-full relative flex items-center justify-center flex-shrink-0" style={{ background: gradient }}>
        <div className="w-[70px] h-[70px] rounded-full bg-white absolute" />
        <div className="relative z-10 text-center">
          <strong className="block text-xl font-extrabold text-gray-900">{pct}%</strong>
          <small className="text-[0.6rem] font-semibold text-gray-500">Aprobados</small>
        </div>
      </div>
      <div className="space-y-1.5 text-sm font-semibold text-gray-600">
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-600" /> Aprobados ({approved})</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-600" /> Pendientes ({pending})</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-600" /> Rechazados ({rejected})</div>
      </div>
    </div>
  );
}
