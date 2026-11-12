/**
 * ExamGuard — Client Configuration & Shared Constants
 */

const CONFIG = {
  // Teammate's FastAPI local server default
  API_BASE: window.EXAMGUARD_API_URL || 'http://127.0.0.1:8000',
  
  // Storage keys
  TOKEN_KEY: 'examguard_token',
  USER_KEY: 'examguard_user',
  DEMO_MODE_KEY: 'examguard_demo_mode',
  
  // Validation limits matching backend API contract
  LIMITS: {
    MAX_VIDEO_BYTES: 30 * 1024 * 1024, // 30 MB
    MAX_VIDEO_SECONDS: 60,             // 60 seconds
    ALLOWED_EXTENSIONS: ['.mp4', '.webm', '.mov'],
    ALLOWED_MIME_TYPES: ['video/mp4', 'video/webm', 'video/quicktime']
  },

  // Behavior category definitions
  BEHAVIORS: {
    normal: {
      label: 'Normal Behaviour',
      color: 'emerald',
      hex: '#10b981',
      bgClass: 'bg-emerald-500',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300'
    },
    looking_sideways: {
      label: 'Looking Sideways',
      color: 'amber',
      hex: '#f59e0b',
      bgClass: 'bg-amber-500',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300'
    },
    phone_use: {
      label: 'Phone Usage',
      color: 'rose',
      hex: '#ef4444',
      bgClass: 'bg-rose-500',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300'
    }
  }
};

// Formatting helpers
function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function formatSeconds(seconds) {
  if (seconds === undefined || seconds === null || isNaN(seconds)) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Auth state management helpers
function getAuthToken() {
  return localStorage.getItem(CONFIG.TOKEN_KEY);
}

function setAuthToken(token) {
  if (token) {
    localStorage.setItem(CONFIG.TOKEN_KEY, token);
  } else {
    localStorage.removeItem(CONFIG.TOKEN_KEY);
  }
}

function getCurrentUser() {
  const userJson = localStorage.getItem(CONFIG.USER_KEY);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

function setCurrentUser(user) {
  if (user) {
    localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CONFIG.USER_KEY);
  }
}

function clearAuth() {
  localStorage.removeItem(CONFIG.TOKEN_KEY);
  localStorage.removeItem(CONFIG.USER_KEY);
}

function isDemoMode() {
  const item = localStorage.getItem(CONFIG.DEMO_MODE_KEY);
  // Default to true for Day 1 smooth evaluation
  return item === null ? true : item === 'true';
}

function setDemoMode(enabled) {
  localStorage.setItem(CONFIG.DEMO_MODE_KEY, enabled ? 'true' : 'false');
}
