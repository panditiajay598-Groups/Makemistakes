/**
 * MakeMistakes — Client-Side IndexedDB Problem Statement Caching Service
 *
 * Objectives & Constraints:
 * 1. Schema Version 2: Guarantees object stores "problems" and "catalog_meta" exist.
 * 2. Complete fault-tolerance: Missing stores, quota limits, or corrupted DB connections
 *    are handled safely and return safe cache-miss values without throwing.
 * 3. Never blocks authoritative network loading or causes infinite spinners.
 * 4. Appends cached and newly fetched records (+20 per batch) without duplication.
 * 5. Supports offline access to previously loaded records.
 * 6. SECURITY & ISOLATION:
 *    - Never caches private user information, authentication secrets, payment info,
 *      or authoritative unlock decisions in IndexedDB.
 *    - User progress / status / lock decisions are merged dynamically on the client
 *      or returned authoritatively by the server.
 * 7. 24-hour TTL with timestamp checking and cache invalidation.
 * 8. Never attempts to download all 1,848+ records automatically.
 */

export interface StoredProblemCatalogItem {
  problemId: string;
  title: string;
  problemStatement: string;
  description: string;
  category: string;
  difficulty: string | null;
  country: string | null;
  source: { name?: string; type?: string } | null;
  relatedInformation: { context?: string } | null;
  skills: string[];
  estimatedHours: number | null;
  cachedAt: number;
}

const DB_NAME = "makemistakes_problems_db";
const DB_VERSION = 2; // Upgraded to v2 to guarantee object stores exist
const PROBLEMS_STORE = "problems";
const META_STORE = "catalog_meta";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours TTL for static problem catalog
const OPEN_TIMEOUT_MS = 1000;

let dbPromise: Promise<IDBDatabase | null> | null = null;

export function isIndexedDbSupported(): boolean {
  return typeof window !== "undefined" && typeof window.indexedDB !== "undefined" && window.indexedDB !== null;
}

/**
 * Initializes and returns the IndexedDB singleton connection.
 * If connection fails, upgrade is blocked, or timeout occurs, safely returns null
 * and resets connection state so subsequent calls can retry cleanly.
 */
export function getProblemDb(): Promise<IDBDatabase | null> {
  if (!isIndexedDbSupported()) {
    return Promise.resolve(null);
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve) => {
    let hasResolved = false;
    const safeResolve = (val: IDBDatabase | null) => {
      if (!hasResolved) {
        hasResolved = true;
        if (timer) clearTimeout(timer);
        if (!val) {
          dbPromise = null; // Allow retry on failure
        }
        resolve(val);
      }
    };

    const timer = setTimeout(() => {
      console.warn("[IndexedDB] Database connection timed out, proceeding without cache.");
      safeResolve(null);
    }, OPEN_TIMEOUT_MS);

    const handleUpgradeNeeded = (event: IDBVersionChangeEvent, req: IDBOpenDBRequest) => {
      try {
        const db = req.result;
        const targetReq = event.currentTarget as IDBOpenDBRequest | null;
        const tx = targetReq?.transaction || req.transaction;

        // 1. Ensure problems store exists
        let problemStore: IDBObjectStore | null = null;
        if (!db.objectStoreNames.contains(PROBLEMS_STORE)) {
          problemStore = db.createObjectStore(PROBLEMS_STORE, { keyPath: "problemId" });
        } else if (tx) {
          problemStore = tx.objectStore(PROBLEMS_STORE);
        }

        // 2. Ensure indexes exist on problems store
        if (problemStore) {
          if (!problemStore.indexNames.contains("category")) {
            problemStore.createIndex("category", "category", { unique: false });
          }
          if (!problemStore.indexNames.contains("difficulty")) {
            problemStore.createIndex("difficulty", "difficulty", { unique: false });
          }
          if (!problemStore.indexNames.contains("cachedAt")) {
            problemStore.createIndex("cachedAt", "cachedAt", { unique: false });
          }
        }

        // 3. Ensure catalog_meta store exists
        if (!db.objectStoreNames.contains(META_STORE)) {
          db.createObjectStore(META_STORE, { keyPath: "key" });
        }
      } catch (upgradeErr) {
        console.warn("[IndexedDB] Error during onupgradeneeded:", upgradeErr);
      }
    };

    const attachDbEvents = (db: IDBDatabase) => {
      db.onversionchange = () => {
        try {
          db.close();
        } catch {}
        dbPromise = null;
      };
      db.onclose = () => {
        dbPromise = null;
      };
      db.onerror = () => {
        dbPromise = null;
      };
    };

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        handleUpgradeNeeded(event, request);
      };

      request.onsuccess = () => {
        try {
          const db = request.result;

          // Verify both required object stores exist. If missing, upgrade schema by 1 to trigger repair
          if (!db.objectStoreNames.contains(PROBLEMS_STORE) || !db.objectStoreNames.contains(META_STORE)) {
            console.warn("[IndexedDB] Database opened with missing stores. Upgrading to repair missing stores...");
            const repairVersion = db.version + 1;
            db.close();

            const repairReq = window.indexedDB.open(DB_NAME, repairVersion);
            repairReq.onupgradeneeded = (e) => handleUpgradeNeeded(e, repairReq);
            repairReq.onsuccess = () => {
              const repairedDb = repairReq.result;
              attachDbEvents(repairedDb);
              safeResolve(repairedDb);
            };
            repairReq.onerror = () => safeResolve(null);
            repairReq.onblocked = () => safeResolve(null);
            return;
          }

          attachDbEvents(db);
          safeResolve(db);
        } catch (successErr) {
          console.warn("[IndexedDB] Error on db success handler:", successErr);
          safeResolve(null);
        }
      };

      request.onerror = (err) => {
        console.warn("[IndexedDB] Failed opening database:", request.error || err);
        safeResolve(null);
      };

      request.onblocked = () => {
        console.warn("[IndexedDB] Database upgrade blocked by another active connection.");
        safeResolve(null);
      };
    } catch (e) {
      console.warn("[IndexedDB] Exception opening database:", e);
      safeResolve(null);
    }
  });

  return dbPromise;
}

/**
 * Sanitizes problem records to strip out any user-specific or sensitive status
 * before storing into IndexedDB.
 */
function sanitizeProblemForStorage(item: Record<string, unknown>): StoredProblemCatalogItem | null {
  if (!item || !item.problemId) return null;

  const src = item.source as { name?: string; type?: string } | undefined;
  const rel = item.relatedInformation as { context?: string } | undefined;

  return {
    problemId: String(item.problemId),
    title: String(item.title || item.problemStatement || item.problemId),
    problemStatement: String(item.problemStatement || item.title || ""),
    description: String(item.description || item.problemDescription || ""),
    category: String(item.category || "Product Challenge"),
    difficulty: item.difficulty ? String(item.difficulty) : null,
    country: item.country ? String(item.country) : null,
    source: src ? { name: src.name, type: src.type } : null,
    relatedInformation: rel?.context ? { context: rel.context } : null,
    skills: Array.isArray(item.skills) ? item.skills.map(String) : [],
    estimatedHours: typeof item.estimatedHours === "number" ? item.estimatedHours : null,
    cachedAt: Date.now(),
  };
}

/**
 * Saves a batch of problems into IndexedDB cache.
 * Fault-tolerant: Failures never throw and never impact application state.
 */
export async function saveProblemsToCache(problems: unknown[]): Promise<void> {
  if (!isIndexedDbSupported() || !Array.isArray(problems) || problems.length === 0) {
    return;
  }

  try {
    const db = await getProblemDb();
    if (!db || !db.objectStoreNames.contains(PROBLEMS_STORE)) {
      return;
    }

    return new Promise((resolve) => {
      try {
        const tx = db.transaction([PROBLEMS_STORE], "readwrite");
        const store = tx.objectStore(PROBLEMS_STORE);

        for (const p of problems) {
          const sanitized = sanitizeProblemForStorage(p as Record<string, unknown>);
          if (sanitized) {
            store.put(sanitized);
          }
        }

        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
        tx.onabort = () => resolve();
      } catch (txErr) {
        console.warn("[IndexedDB] Error during saveProblemsToCache transaction:", txErr);
        resolve();
      }
    });
  } catch (err) {
    console.warn("[IndexedDB] Unexpected error in saveProblemsToCache:", err);
  }
}

/**
 * Retrieves a specific problem by ID from IndexedDB.
 * Fault-tolerant: Returns null on any error or missing record.
 */
export async function getCachedProblemById(problemId: string): Promise<StoredProblemCatalogItem | null> {
  if (!isIndexedDbSupported() || !problemId) return null;

  try {
    const db = await getProblemDb();
    if (!db || !db.objectStoreNames.contains(PROBLEMS_STORE)) {
      return null;
    }

    return new Promise((resolve) => {
      try {
        const tx = db.transaction([PROBLEMS_STORE], "readonly");
        const store = tx.objectStore(PROBLEMS_STORE);
        const req = store.get(problemId);

        req.onsuccess = () => {
          const result = req.result as StoredProblemCatalogItem | undefined;
          if (!result) {
            resolve(null);
            return;
          }
          // Check TTL
          if (Date.now() - (result.cachedAt || 0) > CACHE_TTL_MS) {
            resolve(null);
            return;
          }
          resolve(result);
        };

        req.onerror = () => resolve(null);
      } catch (txErr) {
        console.warn("[IndexedDB] Error during getCachedProblemById:", txErr);
        resolve(null);
      }
    });
  } catch {
    return null;
  }
}

/**
 * Retrieves paginated problems from IndexedDB matching current filters.
 * Fault-tolerant: Always returns null if cache is unavailable or on any error.
 * Guaranteed never to reject or throw.
 */
export async function getCachedProblemsPage(options: {
  search?: string;
  category?: string;
  difficulty?: string;
  skip?: number;
  limit?: number;
}): Promise<{ problems: StoredProblemCatalogItem[]; totalCount: number } | null> {
  if (!isIndexedDbSupported()) return null;

  try {
    const db = await getProblemDb();
    if (!db || !db.objectStoreNames.contains(PROBLEMS_STORE)) {
      return null;
    }

    return new Promise((resolve) => {
      try {
        const tx = db.transaction([PROBLEMS_STORE], "readonly");
        const store = tx.objectStore(PROBLEMS_STORE);
        const req = store.getAll();

        req.onsuccess = () => {
          try {
            const all: StoredProblemCatalogItem[] = req.result || [];
            if (all.length === 0) {
              resolve(null);
              return;
            }

            const now = Date.now();
            // Filter out expired entries
            const valid = all.filter((item) => now - (item.cachedAt || 0) <= CACHE_TTL_MS);
            if (valid.length === 0) {
              resolve(null);
              return;
            }

            // Apply client-side search & filtering to cached entries
            const search = (options.search || "").toLowerCase().trim();
            const category = options.category || "All";
            const difficulty = options.difficulty || "All";

            const filtered = valid.filter((item) => {
              if (category !== "All" && item.category?.toLowerCase() !== category.toLowerCase()) {
                return false;
              }
              if (difficulty !== "All" && item.difficulty?.toLowerCase() !== difficulty.toLowerCase()) {
                return false;
              }
              if (search) {
                const matchId = item.problemId?.toLowerCase().includes(search);
                const matchTitle = item.title?.toLowerCase().includes(search);
                const matchStmt = item.problemStatement?.toLowerCase().includes(search);
                const matchDesc = item.description?.toLowerCase().includes(search);
                const matchCat = item.category?.toLowerCase().includes(search);
                if (!matchId && !matchTitle && !matchStmt && !matchDesc && !matchCat) {
                  return false;
                }
              }
              return true;
            });

            // Deterministic sort by problemId ascending
            filtered.sort((a, b) => a.problemId.localeCompare(b.problemId, undefined, { numeric: true }));

            const totalCount = filtered.length;
            const skip = options.skip || 0;
            const limit = options.limit || 20;
            const paginated = filtered.slice(skip, skip + limit);

            resolve({
              problems: paginated,
              totalCount,
            });
          } catch (filterErr) {
            console.warn("[IndexedDB] Error filtering cached records:", filterErr);
            resolve(null);
          }
        };

        req.onerror = () => resolve(null);
      } catch (txErr) {
        console.warn("[IndexedDB] Error during getCachedProblemsPage transaction:", txErr);
        resolve(null);
      }
    });
  } catch (err) {
    console.warn("[IndexedDB] Unexpected error in getCachedProblemsPage:", err);
    return null;
  }
}

/**
 * Saves metadata (e.g. categories, difficulties, totalCount) into IndexedDB.
 * Fault-tolerant: Never throws.
 */
export async function saveCatalogMeta(meta: {
  categories?: string[];
  difficulties?: string[];
  totalCount?: number;
}): Promise<void> {
  if (!isIndexedDbSupported()) return;

  try {
    const db = await getProblemDb();
    if (!db || !db.objectStoreNames.contains(META_STORE)) {
      return;
    }

    return new Promise((resolve) => {
      try {
        const tx = db.transaction([META_STORE], "readwrite");
        const store = tx.objectStore(META_STORE);
        store.put({ key: "global_meta", ...meta, updatedAt: Date.now() });
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
        tx.onabort = () => resolve();
      } catch {
        resolve();
      }
    });
  } catch {
    // Non-fatal
  }
}

/**
 * Retrieves catalog metadata from IndexedDB.
 * Fault-tolerant: Returns null on failure.
 */
export async function getCatalogMeta(): Promise<{
  categories?: string[];
  difficulties?: string[];
  totalCount?: number;
} | null> {
  if (!isIndexedDbSupported()) return null;

  try {
    const db = await getProblemDb();
    if (!db || !db.objectStoreNames.contains(META_STORE)) {
      return null;
    }

    return new Promise((resolve) => {
      try {
        const tx = db.transaction([META_STORE], "readonly");
        const store = tx.objectStore(META_STORE);
        const req = store.get("global_meta");

        req.onsuccess = () => {
          resolve(req.result || null);
        };
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  } catch {
    return null;
  }
}

/**
 * Clears the problem statement IndexedDB cache.
 * Fault-tolerant: Never throws.
 */
export async function clearProblemCache(): Promise<void> {
  if (!isIndexedDbSupported()) return;

  try {
    const db = await getProblemDb();
    if (!db) return;

    const availableStores = [PROBLEMS_STORE, META_STORE].filter((s) => db.objectStoreNames.contains(s));
    if (availableStores.length === 0) return;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(availableStores, "readwrite");
        for (const storeName of availableStores) {
          tx.objectStore(storeName).clear();
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  } catch (err) {
    console.warn("[IndexedDB] Error clearing problem cache:", err);
  }
}
