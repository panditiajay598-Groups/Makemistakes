/**
 * MakeMistakes — Centralized Problem ID Parsing, Normalization & Sorting Utilities
 *
 * Provides shared logic for:
 * 1. Parsing numeric sequences from problem IDs (e.g. "P000001" -> 1).
 * 2. Canonical problem ID formatting ("P000001") and display labels ("Problem 01").
 * 3. Deterministic ascending & descending comparison functions.
 * 4. High-performance numerical sorting of problem collections.
 */

export const CANONICAL_ID_PREFIX = "P";
export const CANONICAL_PAD_LENGTH = 6;
export const LEGACY_MEDICATION_REMINDER_ID = "medication-reminder";
export const DEFAULT_PROBLEM_ID = "P000001";

/**
 * Extracts the numeric sequence from a problem ID string or number.
 * Returns 0 if no digits exist or if input is null/undefined.
 *
 * Examples:
 *   parseProblemNumber("P000001") => 1
 *   parseProblemNumber("P001848") => 1848
 *   parseProblemNumber(42) => 42
 *   parseProblemNumber("medication-reminder") => 0
 *   parseProblemNumber(null) => 0
 */
export function parseProblemNumber(input: unknown): number {
  if (typeof input === "number") {
    return Number.isFinite(input) ? Math.floor(input) : 0;
  }
  if (!input) return 0;
  const digits = String(input).replace(/\D/g, "");
  if (!digits) return 0;
  const parsed = parseInt(digits, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Formats a numeric problem number into the canonical zero-padded ID (e.g. 1 -> "P000001").
 */
export function formatProblemId(num: number): string {
  const safeNum = Math.max(0, Math.floor(num));
  return `${CANONICAL_ID_PREFIX}${safeNum.toString().padStart(CANONICAL_PAD_LENGTH, "0")}`;
}

/**
 * Normalizes input problem identifiers to their canonical form.
 * Specifically maps the legacy "medication-reminder" alias to "P000001".
 */
export function normalizeProblemId(input: unknown): string {
  if (!input) return DEFAULT_PROBLEM_ID;
  const trimmed = String(input).trim();
  if (trimmed === LEGACY_MEDICATION_REMINDER_ID) {
    return DEFAULT_PROBLEM_ID;
  }
  const num = parseProblemNumber(trimmed);
  if (num > 0) {
    return formatProblemId(num);
  }
  return trimmed || DEFAULT_PROBLEM_ID;
}

/**
 * Formats a problem ID into a human-readable display label (e.g. "Problem 01", "Problem 1848").
 * Preserves legacy display behavior where single-digit numbers are zero-padded to 2 digits.
 */
export function formatProblemLabel(input?: unknown): string {
  if (!input) return "Problem";
  const num = parseProblemNumber(input);
  if (num > 0) {
    return `Problem ${num < 10 ? `0${num}` : num}`;
  }
  return String(input);
}

/**
 * Deterministic ascending comparator for problem IDs.
 * Sorts primarily by parsed numeric value, with a stable lexicographical tie-breaker.
 */
export function compareProblemIds(a: unknown, b: unknown): number {
  const numA = parseProblemNumber(a);
  const numB = parseProblemNumber(b);
  if (numA !== numB) {
    return numA - numB;
  }
  // Stable tie-breaker for identical numbers or malformed IDs
  return String(a || "").localeCompare(String(b || ""));
}

/**
 * Deterministic descending comparator for problem IDs.
 */
export function compareProblemIdsDesc(a: unknown, b: unknown): number {
  const numA = parseProblemNumber(a);
  const numB = parseProblemNumber(b);
  if (numA !== numB) {
    return numB - numA;
  }
  return String(b || "").localeCompare(String(a || ""));
}

/**
 * Comparator for problem document objects having a `problemId` property (Ascending).
 */
export function compareProblems<T extends Record<string, any>>(a: T, b: T): number {
  return compareProblemIds(a?.problemId, b?.problemId);
}

/**
 * Comparator for problem document objects having a `problemId` property (Descending).
 */
export function compareProblemsDesc<T extends Record<string, any>>(a: T, b: T): number {
  return compareProblemIdsDesc(a?.problemId, b?.problemId);
}

/**
 * Sorts a collection of problem objects numerically by their `problemId`.
 *
 * Options:
 * - `inPlace`: If false, returns a sorted shallow copy without mutating the original array (default: true).
 * - `descending`: If true, sorts in descending order (default: false).
 */
export function sortProblemsNumerically<T extends Record<string, any>>(
  problems: T[],
  options?: { inPlace?: boolean; descending?: boolean }
): T[] {
  if (!Array.isArray(problems)) return [];
  const inPlace = options?.inPlace !== false;
  const target = inPlace ? problems : [...problems];
  const comparator = options?.descending ? compareProblemsDesc : compareProblems;
  return target.sort(comparator);
}

