import axios from "axios";
const API_URL = (process.env.REACT_APP_API_URL || "").replace(/\/$/, "");

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Lightweight in-memory TTL cache ────────────────────────────────────────
// Prevents duplicate network requests when multiple pages call the same endpoint
// within a short time window (e.g., Books.js and AllBooks.js both fetch /books).
const _cache = new Map(); // key → { data, expiresAt }
const CACHE_TTL_MS = 60_000; // 60 seconds — matches server Cache-Control max-age

/**
 * GET request with in-memory TTL cache.
 * Falls through to the real axios call on cache miss or expiry.
 * @param {string} url - Relative URL (e.g. "/books")
 * @param {object} [config] - Optional axios config
 */
export async function cachedGet(url, config) {
  const cached = _cache.get(url);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data; // Return cached response synchronously
  }
  const response = await api.get(url, config);
  _cache.set(url, { data: response, expiresAt: Date.now() + CACHE_TTL_MS });
  return response;
}

/**
 * Invalidate cache for a specific URL (call after writes that affect cached data).
 * @param {string} url
 */
export function invalidateCache(url) {
  _cache.delete(url);
}
