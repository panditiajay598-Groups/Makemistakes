// ============================================================
// Product Journey — Sample Product
// "MakeMistakes Builder Platform" — the first product every
// learner builds. Missions reference IDs from missionsData.ts
// for Discover/Build phases; stubs exist for future phases.
//
// To add a new product: create another Product object in this
// file (or a separate file) and register it in getProductById.
// ============================================================

import { Product } from "./types";

export const MAKEMISTAKES_PRODUCT: Product = {
  id: "makemistakes-builder-platform",
  name: "MakeMistakes Builder Platform",
  tagline:
    "A real-time platform where developers build products and learn from their mistakes.",
  category: "EdTech SaaS",

  phases: [
    // ── Discover ─────────────────────────────────────────────
    {
      phaseId: "discover",
      missions: [
        {
          id: "mission-1",
          order: 1,
          title: "Problems Before Products",
          brief:
            "Understand who is struggling, why they struggle, and what a better product looks like — before writing any code.",
          estimatedTime: "20 min",
          difficulty: "Beginner",
        },
      ],
    },

    // ── Research ─────────────────────────────────────────────
    {
      phaseId: "research",
      missions: [
        {
          id: "mission-r1",
          order: 1,
          title: "Competitor Landscape Analysis",
          brief:
            "Map the existing learning platforms, identify their critical gaps, and pinpoint the market opportunity for MakeMistakes.",
          estimatedTime: "30 min",
          difficulty: "Beginner",
        },
        {
          id: "mission-r2",
          order: 2,
          title: "User Research Synthesis",
          brief:
            "Consolidate user interviews and survey findings into structured, actionable product insights.",
          estimatedTime: "25 min",
          difficulty: "Intermediate",
        },
      ],
    },

    // ── Design ───────────────────────────────────────────────
    {
      phaseId: "design",
      missions: [
        {
          id: "mission-d1",
          order: 1,
          title: "User Flow Mapping",
          brief:
            "Map the end-to-end journey of a builder — from signup to their first shipped feature.",
          estimatedTime: "30 min",
          difficulty: "Intermediate",
        },
        {
          id: "mission-d2",
          order: 2,
          title: "Database Schema Design",
          brief:
            "Design the normalized relational schema for users, products, missions, submissions, and review records.",
          estimatedTime: "35 min",
          difficulty: "Intermediate",
        },
      ],
    },

    // ── Plan ─────────────────────────────────────────────────
    {
      phaseId: "plan",
      missions: [
        {
          id: "mission-p1",
          order: 1,
          title: "Engineering Roadmap",
          brief:
            "Convert the design into a feature-by-feature engineering plan with technology selection and task breakdown.",
          estimatedTime: "25 min",
          difficulty: "Intermediate",
        },
      ],
    },

    // ── Build ────────────────────────────────────────────────
    {
      phaseId: "build",
      missions: [
        {
          id: "mission-2",
          order: 1,
          title: "Solution Architecture & Schemas",
          brief:
            "Implement the core database schema and API contracts that power the platform backend.",
          estimatedTime: "30 min",
          difficulty: "Intermediate",
        },
        {
          id: "mission-b2",
          order: 2,
          title: "Authentication System",
          brief:
            "Build secure user authentication with OTP, session management, and role-based access control.",
          estimatedTime: "45 min",
          difficulty: "Intermediate",
        },
        {
          id: "mission-b3",
          order: 3,
          title: "Mission Engine API",
          brief:
            "Implement the backend APIs that power mission submission, Nova AI review, and workspace state management.",
          estimatedTime: "60 min",
          difficulty: "Advanced",
        },
      ],
    },

    // ── Test ─────────────────────────────────────────────────
    {
      phaseId: "test",
      missions: [
        {
          id: "mission-t1",
          order: 1,
          title: "Integration Test Suite",
          brief:
            "Write and run integration tests across the mission submission and Nova review pipeline.",
          estimatedTime: "40 min",
          difficulty: "Intermediate",
        },
      ],
    },

    // ── Launch ───────────────────────────────────────────────
    {
      phaseId: "launch",
      missions: [
        {
          id: "mission-l1",
          order: 1,
          title: "Production Deployment",
          brief:
            "Deploy the platform to production with a CI/CD pipeline, environment configuration, and observability stack.",
          estimatedTime: "50 min",
          difficulty: "Advanced",
        },
      ],
    },

    // ── Improve ──────────────────────────────────────────────
    {
      phaseId: "improve",
      missions: [
        {
          id: "mission-i1",
          order: 1,
          title: "User Feedback Analysis",
          brief:
            "Gather early user feedback, identify friction points, and plan Version 1.1 improvements.",
          estimatedTime: "30 min",
          difficulty: "Intermediate",
        },
      ],
    },
  ],
};

// ─── Registry ────────────────────────────────────────────────

const PRODUCT_REGISTRY: Record<string, Product> = {
  [MAKEMISTAKES_PRODUCT.id]: MAKEMISTAKES_PRODUCT,
};

export function getProductById(id: string): Product | null {
  return PRODUCT_REGISTRY[id] ?? null;
}
