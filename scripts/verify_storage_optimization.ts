/**
 * Verification Script for Tasks 12 & 13:
 * - Task 12: Cache Repeated localStorage Parsing
 * - Task 13: Remove Duplicate Storage Reads
 */

import {
  getCachedParsedItem,
  setCachedParsedItem,
  removeCachedItem,
  invalidateStorageCache,
  getStoredAuthToken,
} from "../src/lib/storageCache";
import { getJourneyUserId, clearJourneyUserIdCache } from "../src/lib/journeyUser";
import { getAllAttempts, saveAllAttempts } from "../src/lib/attemptsStore";
import { getOnboardingProfile, saveOnboardingProfile } from "../src/lib/onboardingStore";

let passed = 0;
let failed = 0;

function assert(condition: boolean, name: string) {
  if (condition) {
    console.log(`[PASS] ${name}`);
    passed++;
  } else {
    console.error(`[FAIL] ${name}`);
    failed++;
  }
}

// Mock window and localStorage for Node testing environment
const store: Record<string, string> = {};
let getItemCallCount = 0;
let setItemCallCount = 0;

const mockLocalStorage = {
  getItem: (key: string): string | null => {
    getItemCallCount++;
    return store[key] ?? null;
  },
  setItem: (key: string, value: string): void => {
    setItemCallCount++;
    store[key] = value;
  },
  removeItem: (key: string): void => {
    delete store[key];
  },
  clear: (): void => {
    for (const k of Object.keys(store)) delete store[k];
  },
};

(global as any).window = {
  addEventListener: () => {},
  removeEventListener: () => {},
};
(global as any).localStorage = mockLocalStorage;

async function runTests() {
  console.log("=================================================");
  console.log("Verifying Tasks 12 & 13: Storage Caching & Deduplication");
  console.log("=================================================\n");

  // --- Task 12 Tests: Repeated JSON Parsing Cache ---
  console.log("--- Task 12: JSON Parsing Cache Tests ---");

  // 1. Missing keys return default value safely
  const defaultVal = { count: 0 };
  const res1 = getCachedParsedItem("missing_key", defaultVal);
  assert(res1 === defaultVal && res1.count === 0, "1. Missing key returns default value without error");

  // 2. Setting and reading cached JSON
  setCachedParsedItem("test_counter", { count: 42 });
  const res2 = getCachedParsedItem("test_counter", { count: 0 });
  assert(res2.count === 42, "2. Valid stored JSON parses correctly");

  // 3. Repeated reads reuse parsed object without re-parsing
  const res3a = getCachedParsedItem("test_counter", { count: 0 });
  const res3b = getCachedParsedItem("test_counter", { count: 0 });
  assert(res3a === res3b, "3. Repeated reads of unchanged key return identical reference (cached parse)");

  // 4. Malformed JSON fallback
  store["corrupt_key"] = "{ not-valid-json: !! ";
  const res4 = getCachedParsedItem("corrupt_key", { fallback: true });
  assert(res4.fallback === true, "4. Malformed JSON falls back safely to default value");

  // 5. Updating value reflects immediately in parsed cache
  setCachedParsedItem("test_counter", { count: 100 });
  const res5 = getCachedParsedItem("test_counter", { count: 0 });
  assert(res5.count === 100 && res5 !== res3a, "5. Updated JSON reflects immediately in cache");

  // 6. removeCachedItem removes from both storage and memory
  removeCachedItem("test_counter");
  const res6 = getCachedParsedItem("test_counter", { count: 0 });
  assert(res6.count === 0 && store["test_counter"] === undefined, "6. removeCachedItem clears storage and memory cache");

  console.log("\n--- Task 13: Duplicate Storage Reads Tests ---");

  // 7. Deduplicated getJourneyUserId reads
  clearJourneyUserIdCache();
  store["user_email"] = "learner@makemistakes.com";
  getItemCallCount = 0;

  const id1 = getJourneyUserId();
  const id2 = getJourneyUserId();
  const id3 = getJourneyUserId();

  assert(id1 === "learner@makemistakes.com", "7a. Journey user ID correctly resolves to user email");
  assert(id1 === id2 && id2 === id3, "7b. Repeated getJourneyUserId calls return identical result");
  assert(getItemCallCount === 1, `7c. 3 calls to getJourneyUserId resulted in only ${getItemCallCount} storage read (deduplicated)`);

  // 8. Invalidation on account switch / logout
  invalidateStorageCache();
  store["user_email"] = "newuser@makemistakes.com";
  const idAfterSwitch = getJourneyUserId();
  assert(idAfterSwitch === "newuser@makemistakes.com", "8. Invalidation on account switch immediately fetches fresh user identity");

  // 9. attemptsStore caching integration
  mockLocalStorage.clear();
  invalidateStorageCache();
  const initialAttempts = getAllAttempts();
  assert(Array.isArray(initialAttempts) && initialAttempts.length > 0, "9a. getAllAttempts loads seed attempts correctly");

  const readCountBefore = getItemCallCount;
  const attemptsAgain = getAllAttempts();
  assert(attemptsAgain === initialAttempts, "9b. Repeated getAllAttempts returns cached parsed array reference");

  // 10. onboardingStore caching integration
  mockLocalStorage.clear();
  invalidateStorageCache();
  store["user_email"] = "candidate@makemistakes.com";

  const profile1 = getOnboardingProfile();
  assert(profile1.onboardingStep === 1, "10a. Initial onboarding profile loaded with correct defaults");

  saveOnboardingProfile({ onboardingStep: 2 });
  const profile2 = getOnboardingProfile();
  assert(profile2.onboardingStep === 2, "10b. Saved onboarding profile updates cache and preserves state");

  console.log("\n=================================================");
  console.log(`Summary: ${passed} passed, ${failed} failed`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
