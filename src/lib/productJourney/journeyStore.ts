// ============================================================
// Product Journey — Journey Store
// Client-side localStorage state management.
// Handles: loading, saving, unlocking, completing missions
// and advancing the user through phases.
// ============================================================

import {
  JourneyProgress,
  MissionProgress,
  PhaseId,
  Product,
  MissionRef,
} from "./types";
import { PHASE_ORDER, getNextPhaseId } from "./phases";

const KEY_PREFIX = "makemistakes_journey_";

// ─── Storage ─────────────────────────────────────────────────

function storageKey(productId: string): string {
  return `${KEY_PREFIX}${productId}`;
}

export function getJourneyProgress(productId: string): JourneyProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKey(productId));
    return raw ? (JSON.parse(raw) as JourneyProgress) : null;
  } catch {
    return null;
  }
}

export function clearProblemJourneyData(problemId: string): void {
  if (typeof window === "undefined" || !problemId) return;
  try {
    const keys = [
      `makemistakes_research_v2_data_${problemId}`,
      `makemistakes_design_v2_data_${problemId}`,
      `makemistakes_plan_v2_data_${problemId}`,
      `makemistakes_test_v2_data_${problemId}`,
      `makemistakes_deploy_v2_data_${problemId}`,
      `makemistakes_improve_v2_data_${problemId}`,
      `makemistakes_journey_v2_step_${problemId}`,
      `makemistakes_journey_${problemId}`,
      `makemistakes_research_v2_data_`,
      `makemistakes_design_v2_data_`,
      `makemistakes_plan_v2_data_`,
      `makemistakes_test_v2_data_`,
      `makemistakes_deploy_v2_data_`,
      `makemistakes_improve_v2_data_`,
    ];
    keys.forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.warn("[journeyStore] Failed to clear problem journey data:", e);
  }
}

export function saveJourneyProgress(progress: JourneyProgress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey(progress.productId), JSON.stringify(progress));
  } catch (e) {
    console.warn("[journeyStore] Failed to persist progress:", e);
  }
}

/**
 * Returns the stored progress for a product, or initialises
 * a fresh one starting at the first phase and first mission.
 */
export function getOrInitJourneyProgress(product: Product): JourneyProgress {
  const existing = getJourneyProgress(product.id);
  if (existing) return existing;

  const firstPhase = product.phases[0];
  const firstMission = firstPhase.missions[0];

  const fresh: JourneyProgress = {
    productId: product.id,
    currentPhaseId: firstPhase.phaseId,
    currentMissionId: firstMission.id,
    completedPhaseIds: [],
    missionProgress: {},
    startedAt: new Date().toISOString(),
    lastActivityAt: new Date().toISOString(),
  };

  saveJourneyProgress(fresh);
  return fresh;
}

// ─── Unlock Logic ────────────────────────────────────────────

/**
 * A phase is unlocked when its order index ≤ the current
 * phase's order index (i.e., it has been reached or passed).
 */
export function isPhaseUnlocked(
  phaseId: PhaseId,
  progress: JourneyProgress
): boolean {
  const phaseOrder = PHASE_ORDER.indexOf(phaseId);
  const currentOrder = PHASE_ORDER.indexOf(progress.currentPhaseId);
  return phaseOrder <= currentOrder;
}

export function isPhaseCompleted(
  phaseId: PhaseId,
  progress: JourneyProgress
): boolean {
  return progress.completedPhaseIds.includes(phaseId);
}

export function isMissionCompleted(
  missionId: string,
  progress: JourneyProgress
): boolean {
  return progress.missionProgress[missionId]?.completed === true;
}

// ─── Current Mission ─────────────────────────────────────────

export function getCurrentMissionRef(
  progress: JourneyProgress,
  product: Product
): (MissionRef & { phaseId: PhaseId }) | null {
  const phase = product.phases.find(
    (p) => p.phaseId === progress.currentPhaseId
  );
  if (!phase) return null;

  const mission = phase.missions.find(
    (m) => m.id === progress.currentMissionId
  );
  if (!mission) return null;

  return { ...mission, phaseId: progress.currentPhaseId };
}

// ─── Progress Metrics ────────────────────────────────────────

export function getPhaseProgress(
  phaseId: PhaseId,
  progress: JourneyProgress,
  product: Product
): { completed: number; total: number } {
  const phase = product.phases.find((p) => p.phaseId === phaseId);
  if (!phase) return { completed: 0, total: 0 };

  const total = phase.missions.length;
  const completed = phase.missions.filter(
    (m) => progress.missionProgress[m.id]?.completed === true
  ).length;

  return { completed, total };
}

export function getOverallProgress(
  progress: JourneyProgress,
  product: Product
): { completed: number; total: number } {
  let total = 0;
  let completed = 0;

  for (const phase of product.phases) {
    total += phase.missions.length;
    for (const m of phase.missions) {
      if (progress.missionProgress[m.id]?.completed) completed++;
    }
  }

  return { completed, total };
}

// ─── Mission Completion & Advancement ────────────────────────

/**
 * Marks `missionId` as complete, then:
 * 1. If all missions in the phase are now done → advance to
 *    the next phase's first mission (or stay at Improve).
 * 2. Otherwise → advance to the next mission within the phase.
 *
 * Returns the updated progress and persists it.
 */
export function completeMission(
  missionId: string,
  phaseId: PhaseId,
  currentProgress: JourneyProgress,
  product: Product
): JourneyProgress {
  // Build completed mission record (spread existing first, then override with final values)
  const prev = currentProgress.missionProgress[missionId];
  const completedRecord: MissionProgress = {
    ...(prev ?? {}),
    missionId,
    phaseId,
    completed: true,
    completedAt: new Date().toISOString(),
    currentStep: "COMPLETED",
  };

  const updatedMissionProgress: Record<string, MissionProgress> = {
    ...currentProgress.missionProgress,
    [missionId]: completedRecord,
  };

  // Check if the entire phase is now done
  const currentPhaseData = product.phases.find((p) => p.phaseId === phaseId);
  const phaseMissions = currentPhaseData?.missions ?? [];
  const phaseFullyComplete = phaseMissions.every(
    (m) => updatedMissionProgress[m.id]?.completed === true
  );

  let newPhaseId = phaseId;
  let newMissionId = missionId;
  let completedPhaseIds = [...currentProgress.completedPhaseIds];

  if (phaseFullyComplete) {
    // ── Advance to next phase ─────────────────────────────
    if (!completedPhaseIds.includes(phaseId)) {
      completedPhaseIds.push(phaseId);
    }
    const nextPhase = getNextPhaseId(phaseId);
    if (nextPhase) {
      const nextPhaseData = product.phases.find((p) => p.phaseId === nextPhase);
      const firstNextMission = nextPhaseData?.missions[0];
      if (firstNextMission) {
        newPhaseId = nextPhase;
        newMissionId = firstNextMission.id;
      }
    }
    // If nextPhase is null we are at Improve (last phase) — stay
  } else {
    // ── Advance to next mission in same phase ─────────────
    const completedOrder =
      phaseMissions.find((m) => m.id === missionId)?.order ?? 1;
    const nextMission = phaseMissions.find(
      (m) => m.order === completedOrder + 1
    );
    if (nextMission) {
      newMissionId = nextMission.id;
    }
  }

  const updated: JourneyProgress = {
    ...currentProgress,
    currentPhaseId: newPhaseId,
    currentMissionId: newMissionId,
    completedPhaseIds,
    missionProgress: updatedMissionProgress,
    lastActivityAt: new Date().toISOString(),
  };

  saveJourneyProgress(updated);
  return updated;
}
