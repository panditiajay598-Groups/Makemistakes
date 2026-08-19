export interface ProofOfWorkRecord {
  id: string;
  attemptId: string;
  missionId: string;
  title: string;
  score: number;
  completedAt: string;
  verifiedMetric: string;
  reflectionSummary: string;
  githubRepo: string;
  techStack: string[];
  codeSnapshot?: Record<string, string>;
}

export interface Attempt {
  id: string;
  missionId: string;
  missionTitle: string;
  attemptNumber: number;
  status: "In Progress" | "Completed" | "Abandoned";
  progress: number; // 0 to 100
  currentStep: number;
  totalSteps: number;
  startedAt: string;
  completedAt?: string;
  abandonedAt?: string;
  score?: number;
  proofOfWork?: ProofOfWorkRecord;
  codeWritten?: Record<string, string>;
}

export type MissionAttemptStatus =
  | "Not Started"
  | "In Progress"
  | "Completed"
  | "Practicing Again"
  | "Locked";

const ATTEMPTS_KEY = "makemistakes_mission_attempts_v1";

// Seed initial realistic data for demonstration
const SEED_ATTEMPTS: Attempt[] = [
  {
    id: "att-rate-limiter-1",
    missionId: "stop-api-crashing-traffic-spikes",
    missionTitle: "Stop an API from Crashing Under Traffic Spikes",
    attemptNumber: 1,
    status: "Completed",
    progress: 100,
    currentStep: 8,
    totalSteps: 8,
    startedAt: "2026-07-15T10:00:00.000Z",
    completedAt: "2026-07-18T14:30:00.000Z",
    score: 92,
    proofOfWork: {
      id: "pow-rate-limiter-1",
      attemptId: "att-rate-limiter-1",
      missionId: "stop-api-crashing-traffic-spikes",
      title: "Fixed Window Rate Limiter with Redis INCR",
      score: 92,
      completedAt: "July 18, 2026",
      verifiedMetric: "< 8.4ms latency at 5,000 req/sec",
      reflectionSummary: "Attempt #1 established the baseline Redis client connection and fixed window counter logic. Handled burst traffic well but had minor boundary edge cases.",
      githubRepo: "https://github.com/makemistakes/rate-limiter-attempt-1",
      techStack: ["Redis", "Node.js", "TypeScript"],
    },
  },
  {
    id: "att-rate-limiter-2",
    missionId: "stop-api-crashing-traffic-spikes",
    missionTitle: "Stop an API from Crashing Under Traffic Spikes",
    attemptNumber: 2,
    status: "Completed",
    progress: 100,
    currentStep: 8,
    totalSteps: 8,
    startedAt: "2026-07-20T09:00:00.000Z",
    completedAt: "2026-07-22T16:45:00.000Z",
    score: 95,
    proofOfWork: {
      id: "pow-rate-limiter-2",
      attemptId: "att-rate-limiter-2",
      missionId: "stop-api-crashing-traffic-spikes",
      title: "Sliding Window Log Lua Limiter Engine",
      score: 95,
      completedAt: "July 22, 2026",
      verifiedMetric: "< 3.2ms P99 latency overhead at 10,000 req/sec",
      reflectionSummary: "Attempt #2 refactored the limiter to use atomic Redis Lua scripts for true sliding-window accuracy under 100k req/min traffic spikes.",
      githubRepo: "https://github.com/makemistakes/rate-limiter-attempt-2",
      techStack: ["Redis", "Lua", "TypeScript"],
    },
  },
  {
    id: "att-rate-limiter-3",
    missionId: "stop-api-crashing-traffic-spikes",
    missionTitle: "Stop an API from Crashing Under Traffic Spikes",
    attemptNumber: 3,
    status: "In Progress",
    progress: 41,
    currentStep: 3,
    totalSteps: 8,
    startedAt: new Date().toISOString(),
  },
  {
    id: "att-kv-store-1",
    missionId: "inmemory-keyvalue-store-lru",
    missionTitle: "Construct an In-Memory Key-Value Store",
    attemptNumber: 1,
    status: "Completed",
    progress: 100,
    currentStep: 8,
    totalSteps: 8,
    startedAt: "2026-07-10T12:00:00.000Z",
    completedAt: "2026-07-12T18:20:00.000Z",
    score: 98,
    proofOfWork: {
      id: "pow-kv-store-1",
      attemptId: "att-kv-store-1",
      missionId: "inmemory-keyvalue-store-lru",
      title: "O(1) LRU Eviction & AOF Persistent KV Store",
      score: 98,
      completedAt: "July 12, 2026",
      verifiedMetric: "1,250,000 ops/sec single-threaded benchmark",
      reflectionSummary: "Built a doubly-linked list hashmap hybrid with TTL expiration sweeps.",
      githubRepo: "https://github.com/makemistakes/kv-store-lru",
      techStack: ["Rust", "TypeScript"],
    },
  },
];

export function getAllAttempts(): Attempt[] {
  if (typeof window === "undefined") return SEED_ATTEMPTS;
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    if (!raw) {
      localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(SEED_ATTEMPTS));
      return SEED_ATTEMPTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to load attempts from localStorage", e);
    return SEED_ATTEMPTS;
  }
}

export function saveAllAttempts(attempts: Attempt[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
  } catch (e) {
    console.warn("Failed to save attempts to localStorage", e);
  }
}

/**
 * Returns the single currently active attempt across all missions in the system.
 */
export function getActiveAttempt(): Attempt | null {
  const attempts = getAllAttempts();
  return attempts.find((a) => a.status === "In Progress") || null;
}

/**
 * Get all attempts for a specific mission, sorted by attempt number ascending.
 */
export function getAttemptsForMission(missionId: string): Attempt[] {
  const attempts = getAllAttempts();
  return attempts
    .filter((a) => a.missionId === missionId)
    .sort((a, b) => a.attemptNumber - b.attemptNumber);
}

export interface MissionStateDetails {
  status: MissionAttemptStatus;
  activeAttempt: Attempt | null;
  completedAttempts: Attempt[];
  allAttempts: Attempt[];
  totalAttempts: number;
  canStartOrResume: boolean;
  lockedByAttempt: Attempt | null;
}

/**
 * Derives comprehensive mission state according to the Core Rules:
 * - Single active attempt allowed system-wide.
 * - Completed mission shows Completed if no active attempt on this mission.
 * - Practicing Again if completed attempts exist AND an active attempt exists on this mission.
 * - Locked if an active attempt exists on ANOTHER mission.
 */
export function getMissionStateDetails(missionId: string): MissionStateDetails {
  const systemActiveAttempt = getActiveAttempt();
  const missionAttempts = getAttemptsForMission(missionId);
  const completedAttempts = missionAttempts.filter((a) => a.status === "Completed");
  const missionActiveAttempt = missionAttempts.find((a) => a.status === "In Progress") || null;

  // Is another mission active?
  const isAnotherMissionActive =
    systemActiveAttempt !== null && systemActiveAttempt.missionId !== missionId;

  if (isAnotherMissionActive) {
    return {
      status: "Locked",
      activeAttempt: null,
      completedAttempts,
      allAttempts: missionAttempts,
      totalAttempts: missionAttempts.length,
      canStartOrResume: false,
      lockedByAttempt: systemActiveAttempt,
    };
  }

  if (missionActiveAttempt) {
    if (completedAttempts.length > 0) {
      return {
        status: "Practicing Again",
        activeAttempt: missionActiveAttempt,
        completedAttempts,
        allAttempts: missionAttempts,
        totalAttempts: missionAttempts.length,
        canStartOrResume: true,
        lockedByAttempt: null,
      };
    } else {
      return {
        status: "In Progress",
        activeAttempt: missionActiveAttempt,
        completedAttempts,
        allAttempts: missionAttempts,
        totalAttempts: missionAttempts.length,
        canStartOrResume: true,
        lockedByAttempt: null,
      };
    }
  }

  if (completedAttempts.length > 0) {
    return {
      status: "Completed",
      activeAttempt: null,
      completedAttempts,
      allAttempts: missionAttempts,
      totalAttempts: missionAttempts.length,
      canStartOrResume: true, // can click Practice Again
      lockedByAttempt: null,
    };
  }

  return {
    status: "Not Started",
    activeAttempt: null,
    completedAttempts: [],
    allAttempts: missionAttempts,
    totalAttempts: missionAttempts.length,
    canStartOrResume: true,
    lockedByAttempt: null,
  };
}

/**
 * Creates or resumes an attempt for a mission.
 * Enforces: Only ONE active attempt across the entire system.
 */
export function startOrResumeAttempt(
  missionId: string,
  missionTitle: string,
  totalSteps = 8
): { success: boolean; attempt?: Attempt; error?: string; lockedByTitle?: string } {
  const state = getMissionStateDetails(missionId);

  if (state.status === "Locked" && state.lockedByAttempt) {
    return {
      success: false,
      error: `You already have an active attempt on "${state.lockedByAttempt.missionTitle}" (Attempt #${state.lockedByAttempt.attemptNumber}). Finish or abandon it before starting another mission.`,
      lockedByTitle: state.lockedByAttempt.missionTitle,
    };
  }

  // If this mission already has an active attempt, return it (resume)
  if (state.activeAttempt) {
    return { success: true, attempt: state.activeAttempt };
  }

  // Otherwise, create a new attempt (Attempt #1 or Attempt #N for Practice Again)
  const attempts = getAllAttempts();
  const nextAttemptNumber = state.totalAttempts + 1;
  const newAttempt: Attempt = {
    id: `att-${missionId}-${nextAttemptNumber}-${Date.now()}`,
    missionId,
    missionTitle,
    attemptNumber: nextAttemptNumber,
    status: "In Progress",
    progress: Math.round((1 / totalSteps) * 100),
    currentStep: 1,
    totalSteps,
    startedAt: new Date().toISOString(),
  };

  attempts.push(newAttempt);
  saveAllAttempts(attempts);

  return { success: true, attempt: newAttempt };
}

/**
 * Explicit helper to trigger "Practice Again"
 * Creates Attempt #(N+1) without touching previous completed attempts or proofs of work.
 */
export function practiceAgain(
  missionId: string,
  missionTitle: string,
  totalSteps = 8
): { success: boolean; attempt?: Attempt; error?: string } {
  return startOrResumeAttempt(missionId, missionTitle, totalSteps);
}

/**
 * Abandons an active attempt.
 * Preserves progress & saved code, marks status as "Abandoned", freeing up active attempt slot.
 */
export function abandonAttempt(attemptId: string): { success: boolean; attempt?: Attempt } {
  const attempts = getAllAttempts();
  const attempt = attempts.find((a) => a.id === attemptId);

  if (!attempt) return { success: false };

  attempt.status = "Abandoned";
  attempt.abandonedAt = new Date().toISOString();

  saveAllAttempts(attempts);
  return { success: true, attempt };
}

/**
 * Marks an attempt as Completed and generates/attaches its unique Proof of Work.
 */
export function completeAttempt(
  attemptId: string,
  powDetails?: Partial<ProofOfWorkRecord>
): { success: boolean; attempt?: Attempt } {
  const attempts = getAllAttempts();
  const attempt = attempts.find((a) => a.id === attemptId);

  if (!attempt) return { success: false };

  attempt.status = "Completed";
  attempt.progress = 100;
  attempt.currentStep = attempt.totalSteps;
  attempt.completedAt = new Date().toISOString();
  attempt.score = powDetails?.score || Math.floor(Math.random() * 8) + 92;

  const formatDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  attempt.proofOfWork = {
    id: `pow-${attempt.id}`,
    attemptId: attempt.id,
    missionId: attempt.missionId,
    title: powDetails?.title || `${attempt.missionTitle} Solution`,
    score: attempt.score,
    completedAt: formatDate(attempt.completedAt),
    verifiedMetric: powDetails?.verifiedMetric || "< 5ms latency overhead at 10k req/sec",
    reflectionSummary:
      powDetails?.reflectionSummary ||
      `Completed Attempt #${attempt.attemptNumber} with high performance and zero test failures.`,
    githubRepo: powDetails?.githubRepo || `https://github.com/makemistakes/${attempt.missionId}-att${attempt.attemptNumber}`,
    techStack: powDetails?.techStack || ["TypeScript", "Node.js"],
    codeSnapshot: attempt.codeWritten,
  };

  saveAllAttempts(attempts);
  return { success: true, attempt };
}

/**
 * Updates step/progress on an attempt.
 */
export function updateAttemptProgress(
  attemptId: string,
  currentStep: number,
  codeWritten?: Record<string, string>
): void {
  const attempts = getAllAttempts();
  const attempt = attempts.find((a) => a.id === attemptId);
  if (!attempt || attempt.status !== "In Progress") return;

  attempt.currentStep = currentStep;
  attempt.progress = Math.round((currentStep / attempt.totalSteps) * 100);
  if (codeWritten) {
    attempt.codeWritten = { ...attempt.codeWritten, ...codeWritten };
  }

  saveAllAttempts(attempts);
}
