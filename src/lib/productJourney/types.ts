// ============================================================
// Product Journey — Core Type Definitions
// Single source of truth for all journey data structures.
// ============================================================

// ─── Workspace Tools ─────────────────────────────────────────
export type WorkspaceToolType =
  | "rich-text"
  | "research-notes"
  | "whiteboard"
  | "wireframe-canvas"
  | "database-diagram"
  | "code-editor"
  | "terminal"
  | "browser-preview"
  | "sql-editor"
  | "debugger"
  | "testing-console"
  | "deployment-console"
  | "logs-viewer"
  | "analytics-dashboard"
  | "feedback-viewer";

// ─── Phase ───────────────────────────────────────────────────
export type PhaseId =
  | "discover"
  | "research"
  | "design"
  | "plan"
  | "build"
  | "test"
  | "launch"
  | "improve";

export type MissionEngineStep =
  | "BRIEF"
  | "WORKSPACE"
  | "SUBMITTING"
  | "REVIEW"
  | "COMPLETED";

export interface PhaseDefinition {
  id: PhaseId;
  label: string;
  emoji: string;
  purpose: string;
  activities: string[];
  workspaceTools: WorkspaceToolType[];
  /**
   * 0-indexed position in the lifecycle.
   * Drives sequential phase unlock logic — a phase unlocks
   * only after order (n-1) is fully complete.
   */
  order: number;
}

// ─── Mission ─────────────────────────────────────────────────

/**
 * Lightweight mission reference stored inside a Product.
 * Full mission content (deliverables, hints, resources) lives
 * in missionsData.ts and is loaded on-demand by the engine.
 */
export interface MissionRef {
  id: string;
  order: number; // 1-indexed position within the phase
  title: string;
  brief: string; // one-sentence summary shown on the dashboard
  estimatedTime: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

// ─── Product ─────────────────────────────────────────────────

export interface PhaseWithMissions {
  phaseId: PhaseId;
  missions: MissionRef[]; // ordered by MissionRef.order
}

/**
 * A Product is the top-level object that drives the entire
 * journey. Different products supply different missions while
 * reusing the same 8-phase lifecycle and engine.
 */
export interface Product {
  id: string;
  name: string;
  tagline: string;
  category: string; // e.g. "EdTech SaaS", "AI Tool"
  /** All 8 phases, in lifecycle order (Discover → Improve). */
  phases: PhaseWithMissions[];
}

// ─── Progress Tracking ───────────────────────────────────────

export interface MissionProgress {
  missionId: string;
  phaseId: PhaseId;
  completed: boolean;
  completedAt?: string;
  currentStep: MissionEngineStep;
}

/**
 * Persisted per-product progress state.
 * Stored in localStorage under a product-specific key.
 */
export interface JourneyProgress {
  productId: string;
  currentPhaseId: PhaseId;
  currentMissionId: string;
  /** Phase IDs where every mission is complete. */
  completedPhaseIds: PhaseId[];
  /** missionId → per-mission progress snapshot */
  missionProgress: Record<string, MissionProgress>;
  startedAt: string;
  lastActivityAt: string;
}
