import { type Db } from "mongodb";

/**
 * MakeMistakes Problem Unlock Eligibility Engine
 *
 * Single source of truth for problem-unlock thresholds and eligibility calculations:
 * - 50% Beginner problems completion required
 * - 30% Intermediate problems completion required
 * - Both required to unlock Advanced problem challenges
 */

export const BEGINNER_UNLOCK_THRESHOLD = 0.5;
export const INTERMEDIATE_UNLOCK_THRESHOLD = 0.3;
export const CATALOG_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

export interface CatalogTotals {
  beginnerTotal: number;
  intermediateTotal: number;
  advancedTotal: number;
}

export interface UserCompletionsSummary {
  completedBeginner: number;
  completedIntermediate: number;
}

export interface UnlockProgress extends CatalogTotals, UserCompletionsSummary {
  beginnerRequired: number;
  intermediateRequired: number;
  advancedUnlocked: boolean;
}

export interface CatalogMeta extends CatalogTotals {
  categories: string[];
  difficulties: string[];
  problemDifficulties: Map<string, string>;
  lastFetched: number;
}

let cachedCatalogMeta: CatalogMeta | null = null;

/**
 * Resets the in-memory catalog metadata cache (useful for testing or post-import refreshes).
 */
export function invalidateCatalogMetaCache(): void {
  cachedCatalogMeta = null;
}

/**
 * Computes required completion count based on total problems and percentage threshold.
 * Uses Math.ceil to preserve exact rounding behavior.
 */
export function computeRequiredCount(total: number, thresholdPercent: number): number {
  const safeTotal = Math.max(0, Number.isFinite(total) ? Math.floor(total) : 0);
  return Math.ceil(safeTotal * thresholdPercent);
}

/**
 * Evaluates unlock progress and advanced eligibility from catalog totals and user completions.
 */
export function computeUnlockProgress(
  totals: CatalogTotals,
  completions: UserCompletionsSummary
): UnlockProgress {
  const beginnerTotal = Math.max(0, totals.beginnerTotal || 0);
  const intermediateTotal = Math.max(0, totals.intermediateTotal || 0);
  const advancedTotal = Math.max(0, totals.advancedTotal || 0);

  const completedBeginner = Math.max(0, completions.completedBeginner || 0);
  const completedIntermediate = Math.max(0, completions.completedIntermediate || 0);

  const beginnerRequired = computeRequiredCount(beginnerTotal, BEGINNER_UNLOCK_THRESHOLD);
  const intermediateRequired = computeRequiredCount(intermediateTotal, INTERMEDIATE_UNLOCK_THRESHOLD);

  const advancedUnlocked =
    beginnerTotal > 0 &&
    intermediateTotal > 0 &&
    completedBeginner >= beginnerRequired &&
    completedIntermediate >= intermediateRequired;

  return {
    completedBeginner,
    beginnerTotal,
    beginnerRequired,
    completedIntermediate,
    intermediateTotal,
    intermediateRequired,
    advancedTotal,
    advancedUnlocked,
  };
}

/**
 * Determines if an individual problem is locked for a user.
 * Advanced problems are locked if advancedUnlocked is false AND user has not started it.
 */
export function isProblemLocked(params: {
  difficulty: string | null;
  advancedUnlocked: boolean;
  userStatus: "not_started" | "in_progress" | "completed";
}): boolean {
  const { difficulty, advancedUnlocked, userStatus } = params;
  return difficulty === "Advanced" && !advancedUnlocked && userStatus === "not_started";
}

/**
 * Formats the standardized error message when an advanced problem is locked.
 */
export function formatAdvancedLockError(progress: UnlockProgress): string {
  return `Advanced problems are locked. You must complete 50% of Beginner problems (${progress.completedBeginner}/${progress.beginnerTotal}, ${progress.beginnerRequired} required) and 30% of Intermediate problems (${progress.completedIntermediate}/${progress.intermediateTotal}, ${progress.intermediateRequired} required) to unlock Advanced challenges.`;
}

/**
 * Counts user completions across beginner and intermediate difficulties from raw database docs.
 */
export function calculateUserCompletions(params: {
  completions: Array<{ problemId?: string; [key: string]: any }>;
  userJourneys: Array<{ problemId?: string; status?: string; currentPhase?: number; [key: string]: any }>;
  problemDifficulties: Map<string, string>;
}): UserCompletionsSummary {
  const completionsSet = new Set<string>();
  params.completions.forEach((c) => {
    if (c.problemId) completionsSet.add(c.problemId);
  });

  let completedBeginner = 0;
  let completedIntermediate = 0;

  completionsSet.forEach((pid) => {
    const diff = params.problemDifficulties.get(pid);
    if (diff === "Beginner") completedBeginner++;
    else if (diff === "Intermediate") completedIntermediate++;
  });

  params.userJourneys.forEach((j) => {
    const pid = j.problemId;
    if (pid && !completionsSet.has(pid)) {
      const isCompleted =
        j.status === "completed" ||
        (typeof j.currentPhase === "number" && j.currentPhase > 8);
      if (isCompleted) {
        const diff = params.problemDifficulties.get(pid);
        if (diff === "Beginner") completedBeginner++;
        else if (diff === "Intermediate") completedIntermediate++;
      }
    }
  });

  return { completedBeginner, completedIntermediate };
}

/**
 * Fetches lightweight catalog metadata (counts, categories, difficulties) with a 5-minute cache.
 */
export async function getCatalogMeta(db: Db): Promise<CatalogMeta> {
  const now = Date.now();
  if (cachedCatalogMeta && now - cachedCatalogMeta.lastFetched < CATALOG_CACHE_TTL_MS) {
    return cachedCatalogMeta;
  }

  const problems = await db.collection("problems").find({}, {
    projection: { problemId: 1, category: 1, difficulty: 1, "learning.level": 1 }
  }).toArray();

  let beginnerTotal = 0;
  let intermediateTotal = 0;
  let advancedTotal = 0;
  const categoriesSet = new Set<string>();
  const difficultiesSet = new Set<string>();
  const problemDifficulties = new Map<string, string>();

  problems.forEach((p: any) => {
    if (p.category && typeof p.category === "string" && p.category.trim()) {
      categoriesSet.add(p.category.trim());
    }

    const diff = p.difficulty || p.learning?.level || "";
    if (diff && typeof diff === "string" && diff.trim()) {
      difficultiesSet.add(diff.trim());
    }

    if (p.problemId) {
      problemDifficulties.set(p.problemId, diff);
    }

    if (diff === "Beginner") {
      beginnerTotal++;
    } else if (diff === "Intermediate") {
      intermediateTotal++;
    } else if (diff === "Advanced") {
      advancedTotal++;
    }
  });

  cachedCatalogMeta = {
    categories: Array.from(categoriesSet).sort(),
    difficulties: Array.from(difficultiesSet).sort(),
    beginnerTotal,
    intermediateTotal,
    advancedTotal,
    problemDifficulties,
    lastFetched: now,
  };

  return cachedCatalogMeta;
}

/**
 * Unified evaluator for user unlock progress.
 * Queries catalog metadata, user journeys, and completions, then returns comprehensive progress.
 */
export async function evaluateUserUnlock(
  db: Db,
  userFilter: Record<string, any> | null
): Promise<{
  catalogMeta: CatalogMeta;
  unlockProgress: UnlockProgress;
  userJourneys: any[];
  completions: any[];
  journeysMap: Map<string, any>;
  completionsSet: Set<string>;
  inProgressCount: number;
}> {
  const userJourneysCollection = db.collection("user_journeys");
  const completionsCollection = db.collection("problem_completions");

  const [catalogMeta, userJourneys, completions] = await Promise.all([
    getCatalogMeta(db),
    userFilter ? userJourneysCollection.find(userFilter).toArray() : Promise.resolve([]),
    userFilter ? completionsCollection.find(userFilter).toArray() : Promise.resolve([]),
  ]);

  const journeysMap = new Map<string, any>();
  let inProgressCount = 0;
  userJourneys.forEach((j: any) => {
    if (j.problemId) {
      journeysMap.set(j.problemId, j);
      if (
        j.status === "in_progress" ||
        (typeof j.currentPhase === "number" && j.currentPhase <= 8 && j.status !== "completed")
      ) {
        inProgressCount++;
      }
    }
  });

  const completionsSet = new Set<string>();
  completions.forEach((c: any) => {
    if (c.problemId) completionsSet.add(c.problemId);
  });

  const userCompletions = calculateUserCompletions({
    completions,
    userJourneys,
    problemDifficulties: catalogMeta.problemDifficulties,
  });

  const unlockProgress = computeUnlockProgress(catalogMeta, userCompletions);

  return {
    catalogMeta,
    unlockProgress,
    userJourneys,
    completions,
    journeysMap,
    completionsSet,
    inProgressCount,
  };
}
