// ============================================================
// API Configuration — AUTO DETECTS web vs mobile
// ============================================================
// • PC browser (localhost:5173)  → uses http://localhost:5000
// • Phone (10.48.44.85:5173)     → uses http://10.48.44.85:5000
// No manual switching needed!
// ============================================================

const hostname = window.location.hostname;
export const API_BASE = (hostname === 'localhost' || hostname === '127.0.0.1')
  ? 'http://localhost:5000'
  : `http://${hostname}:5000`;
