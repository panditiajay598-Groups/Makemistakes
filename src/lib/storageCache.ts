/**
 * MakeMistakes — Centralized Client-Side Storage & Parsing Cache
 *
 * Objectives (Tasks 12 & 13):
 * 1. Cache repeated JSON.parse operations on unchanged localStorage keys.
 * 2. Eliminate redundant DOM storage reads within components and render cycles.
 * 3. Safely handle SSR, missing values, and malformed JSON.
 * 4. Automatic cache invalidation on storage changes, account switching, or logout.
 */

interface CacheEntry<T> {
  raw: string | null;
  parsed: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();

// Listen for cross-tab or external storage mutations to keep cache fresh
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key) {
      memoryCache.delete(event.key);
    } else {
      memoryCache.clear();
    }
    if (!event.key || event.key === "user_email" || event.key === "makemistakes_journey_user_id") {
      clearJourneyUserIdCache();
    }
  });

  // Intercept direct same-tab localStorage mutations to ensure same-tab changes never leave stale cached values
  if (typeof window.localStorage !== "undefined" && window.localStorage) {
    const proto = Object.getPrototypeOf(window.localStorage) || window.localStorage;
    const origSet = window.localStorage.setItem?.bind(window.localStorage);
    const origRemove = window.localStorage.removeItem?.bind(window.localStorage);
    const origClear = window.localStorage.clear?.bind(window.localStorage);

    if (origSet && origRemove && origClear) {
      window.localStorage.setItem = (key: string, value: string): void => {
        origSet(key, value);
        const entry = memoryCache.get(key);
        if (entry && entry.raw !== value) {
          memoryCache.delete(key);
        }
        if (key === "user_email" || key === "makemistakes_journey_user_id") {
          clearJourneyUserIdCache();
        }
      };

      window.localStorage.removeItem = (key: string): void => {
        origRemove(key);
        memoryCache.delete(key);
        if (key === "user_email" || key === "makemistakes_journey_user_id") {
          clearJourneyUserIdCache();
        }
      };

      window.localStorage.clear = (): void => {
        origClear();
        invalidateStorageCache();
      };
    }
  }
}

/**
 * Reads and parses a JSON item from localStorage with memory caching.
 * Re-parses JSON only if the raw stored string has changed.
 */
export function getCachedParsedItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") {
    return defaultValue;
  }

  try {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      memoryCache.delete(key);
      return defaultValue;
    }

    const cached = memoryCache.get(key);
    if (cached && cached.raw === raw) {
      return cached.parsed;
    }

    const parsed = JSON.parse(raw) as T;
    memoryCache.set(key, { raw, parsed, timestamp: Date.now() });
    return parsed;
  } catch (err) {
    console.warn(`[storageCache] Corrupt JSON in key "${key}", falling back to default:`, err);
    return defaultValue;
  }
}

/**
 * Serializes and stores a JSON item in localStorage and updates the memory cache.
 */
export function setCachedParsedItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;

  try {
    const raw = JSON.stringify(value);
    localStorage.setItem(key, raw);
    memoryCache.set(key, { raw, parsed: value, timestamp: Date.now() });
  } catch (err) {
    console.warn(`[storageCache] Failed to write key "${key}":`, err);
  }
}

/**
 * Removes an item from localStorage and evicts it from the memory cache.
 */
export function removeCachedItem(key: string): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(key);
    memoryCache.delete(key);
  } catch (err) {
    console.warn(`[storageCache] Failed to remove key "${key}":`, err);
  }
}

import { clearJourneyUserIdCache } from "./journeyUser";

/**
 * Clears the storage cache on logout or user switching to prevent cross-user state leaks.
 */
export function invalidateStorageCache(): void {
  memoryCache.clear();
  clearJourneyUserIdCache();
}

/**
 * Retrieves the stored client auth token once with short-circuit fallback.
 * Checks "auth_token" first, falling back to "token".
 */
export function getStoredAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("auth_token") || localStorage.getItem("token") || null;
  } catch {
    return null;
  }
}
