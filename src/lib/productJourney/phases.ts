// ============================================================
// Product Journey — Phase Registry
// Static definitions for the 8 lifecycle phases.
// All products reuse this registry; only missions differ.
// ============================================================

import { PhaseDefinition, PhaseId } from "./types";

export const PHASE_DEFINITIONS: Record<PhaseId, PhaseDefinition> = {
  discover: {
    id: "discover",
    label: "Discover",
    emoji: "🔍",
    purpose: "Understand the real-world problem.",
    activities: [
      "Understand users",
      "Understand business goals",
      "Define requirements",
      "Identify pain points",
    ],
    workspaceTools: ["rich-text", "research-notes"],
    order: 0,
  },

  research: {
    id: "research",
    label: "Research",
    emoji: "📊",
    purpose: "Research competitors, existing products and market opportunities.",
    activities: [
      "Competitor analysis",
      "User research",
      "Feature comparison",
      "Opportunity identification",
    ],
    workspaceTools: ["rich-text", "research-notes"],
    order: 1,
  },

  design: {
    id: "design",
    label: "Design",
    emoji: "✏️",
    purpose: "Design the product before implementation.",
    activities: [
      "User flows",
      "Wireframes",
      "UI Design",
      "Database Design",
      "System Diagrams",
    ],
    workspaceTools: ["whiteboard", "wireframe-canvas", "database-diagram"],
    order: 2,
  },

  plan: {
    id: "plan",
    label: "Plan",
    emoji: "📋",
    purpose: "Convert designs into an engineering roadmap.",
    activities: [
      "Feature planning",
      "Technology selection",
      "API planning",
      "Task breakdown",
      "Development roadmap",
    ],
    workspaceTools: ["rich-text", "research-notes"],
    order: 3,
  },

  build: {
    id: "build",
    label: "Build",
    emoji: "⚙️",
    purpose: "Implement the product.",
    activities: [
      "Authentication",
      "Backend APIs",
      "Database",
      "Frontend",
      "Integrations",
      "Notifications",
    ],
    workspaceTools: ["code-editor", "terminal", "browser-preview", "sql-editor"],
    order: 4,
  },

  test: {
    id: "test",
    label: "Test",
    emoji: "🧪",
    purpose: "Validate the implementation.",
    activities: [
      "Unit testing",
      "Integration testing",
      "Bug fixing",
      "Performance testing",
      "Security testing",
    ],
    workspaceTools: ["debugger", "testing-console"],
    order: 5,
  },

  launch: {
    id: "launch",
    label: "Launch",
    emoji: "🚀",
    purpose: "Release the product.",
    activities: [
      "Deployment",
      "CI/CD",
      "Production",
      "Monitoring",
      "Release preparation",
    ],
    workspaceTools: ["deployment-console", "logs-viewer"],
    order: 6,
  },

  improve: {
    id: "improve",
    label: "Improve",
    emoji: "📈",
    purpose: "Iterate after launch.",
    activities: [
      "User feedback",
      "Analytics",
      "Feature improvements",
      "Version 1.1 planning",
    ],
    workspaceTools: ["analytics-dashboard", "feedback-viewer"],
    order: 7,
  },
};

/** Canonical phase order — drives unlock sequence. */
export const PHASE_ORDER: PhaseId[] = [
  "discover",
  "research",
  "design",
  "plan",
  "build",
  "test",
  "launch",
  "improve",
];

// ─── Helpers ─────────────────────────────────────────────────

export function getPhaseDefinition(phaseId: PhaseId): PhaseDefinition {
  return PHASE_DEFINITIONS[phaseId];
}

/**
 * Returns the phase that comes immediately after `currentPhaseId`,
 * or `null` if the current phase is the last one (Improve).
 */
export function getNextPhaseId(currentPhaseId: PhaseId): PhaseId | null {
  const currentOrder = PHASE_DEFINITIONS[currentPhaseId].order;
  const next = Object.values(PHASE_DEFINITIONS).find(
    (p) => p.order === currentOrder + 1
  );
  return next?.id ?? null;
}
