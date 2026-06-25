import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
});

// ─── Frontend calendar cache ─────────────────────────────────────────────────
// Caches calendar responses for 10 minutes per username+year combo.
// Eliminates the backend round-trip on every year click after first load.
const _calCache = new Map();   // key → { data, expiresAt }
const CAL_TTL   = 10 * 60 * 1000; // 10 minutes in ms

function calCacheGet(key) {
  const entry = _calCache.get(key);
  if (entry && entry.expiresAt > Date.now()) return entry.data;
  _calCache.delete(key);
  return null;
}

function calCacheSet(key, data) {
  _calCache.set(key, { data, expiresAt: Date.now() + CAL_TTL });
}

// ─── API functions ────────────────────────────────────────────────────────────
export const fetchProfile = (username, year) => {
  const tzOffset = new Date().getTimezoneOffset();
  const params = { tz_offset: tzOffset };
  if (year && year !== "Current") {
    params.year = year;
  }
  return api.get(`/api/profile/${username}`, { params }).then((r) => r.data);
};

export const fetchProfileCalendar = async (username, year) => {
  const key = `${username}:${year ?? "current"}`;

  // Return cached instantly if available
  const cached = calCacheGet(key);
  if (cached) return cached;

  const params = {};
  if (year && year !== "Current") params.year = year;

  const data = await api
    .get(`/api/profile/${username}/calendar`, { params })
    .then((r) => r.data);

  calCacheSet(key, data);
  return data;
};

/**
 * Prefetch calendar data for all active years in the background.
 * Called right after the initial profile loads so year switching is instant.
 */
export const prefetchCalendarYears = (username, activeYears = []) => {
  if (!username || !activeYears.length) return;
  activeYears.forEach((year) => {
    const key = `${username}:${year}`;
    if (!calCacheGet(key)) {
      // Fire and forget — no await, runs silently in background
      fetchProfileCalendar(username, year).catch(() => {});
    }
  });
};

export const fetchRecommendations = (username, { company, difficulty, limit = 20 } = {}) => {
  const params = { limit };
  if (company) params.company = company;
  if (difficulty) params.difficulty = difficulty;
  return api.get(`/api/recommendations/${username}`, { params }).then((r) => r.data);
};

export const fetchCompanyProblems = (company, { difficulty, limit = 20 } = {}) => {
  const params = { limit };
  if (difficulty) params.difficulty = difficulty;
  return api.get(`/api/recommendations/company/${company}`, { params }).then((r) => r.data);
};

export const generatePlan = (body) =>
  api.post(`/api/planner/generate`, body).then((r) => r.data);

export const compareProfiles = (username1, username2) =>
  api.post(`/api/compare/`, { username1, username2 }).then((r) => r.data);

export default api;
