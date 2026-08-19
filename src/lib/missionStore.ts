import { getOnboardingProfile, saveOnboardingProfile } from "./onboardingStore";
import { NovaEvaluationResult } from "@/components/mission-engine/missionsData";

export interface MissionState {
  missionId: string;
  step: "BRIEF" | "WORKSPACE" | "SUBMITTING" | "REVIEW" | "COMPLETED";
  drafts: Record<string, string>; // deliverableId -> text content
  researchNotes: string;
  unlockedHintIds: string[];
  iteration: number;
  evaluations: NovaEvaluationResult[];
  completedAt?: string;
}

const STORAGE_PREFIX = "makemistakes_mission_state_";

export function getMissionState(missionId: string): MissionState {
  const defaultState: MissionState = {
    missionId,
    step: "BRIEF",
    drafts: {},
    researchNotes: "",
    unlockedHintIds: [],
    iteration: 1,
    evaluations: [],
  };

  if (typeof window === "undefined") return defaultState;

  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${missionId}`);
    if (raw) {
      return { ...defaultState, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn("Failed to load mission state from localStorage", e);
  }

  return defaultState;
}

export function saveMissionState(state: MissionState): MissionState {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${state.missionId}`, JSON.stringify(state));
    } catch (e) {
      console.warn("Failed to save mission state to localStorage", e);
    }
  }
  return state;
}

export function evaluateSubmissionWithNova(
  missionId: string,
  deliverableDrafts: Record<string, string>,
  iteration: number
): NovaEvaluationResult {
  const allText = Object.values(deliverableDrafts).join("\n\n");
  const wordCount = allText.trim().split(/\s+/).filter(Boolean).length;

  let passed = true;
  let strengths: string[] = [];
  let observations: string[] = [];
  let probingQuestions: string[] = [];
  let suggestions: string[] = [];
  let advice = "";

  if (missionId === "mission-1") {
    strengths = [
      "Target Persona Identification: You clearly identified early-stage software builders and their friction with isolated learning.",
      "Root Cause Recognition: You correctly highlighted that high feedback latency in asynchronous forums (like StackOverflow/Discord) causes high drop-off.",
      "Value Proposition: Your proposed product hypothesis focuses directly on real-time feedback loops during active coding."
    ];

    if (wordCount < 60) {
      passed = false;
      observations = [
        "Your responses are very brief. Senior product engineers provide detailed context around edge cases and market trade-offs.",
        "Consider expanding on how existing tools fail to support synchronous code debugging."
      ];
      probingQuestions = [
        "How would your proposed builder community handle scaling mentor availability during peak hours?",
        "What metrics would you use to measure whether user stuckness has decreased?"
      ];
      suggestions = [
        "Elaborate on the specific user interaction flow when a builder encounters a syntax or logic error.",
        "Compare the response time of your solution versus traditional Q&A forums."
      ];
      advice = "Product engineering is about depth of understanding. Dive deeper into why async tools cause context switching.";
    } else {
      passed = true;
      observations = [
        "Solid problem framing! You recognized that learning to code is emotional as well as technical.",
        "Good distinction between async post-and-wait models vs synchronous presence."
      ];
      probingQuestions = [
        "How will you prevent spam or low-quality help requests in a real-time community?",
        "What mechanisms will encourage experienced builders to guide newer members?"
      ];
      suggestions = [
        "Consider adding reputation incentives or peer review rewards in the next system iteration.",
        "Keep this problem statement handy for Mission 2 when we design the database schemas!"
      ];
      advice = "Great work! You're thinking like a Founding Product Engineer. The next step is translating this problem into a system architecture.";
    }
  } else {
    // Default evaluation for Mission 2 & generic missions
    strengths = [
      "Structured Technical Specification: You defined entity relationships and API contracts cleanly.",
      "Scalability Considerations: Indexed key foreign key relationships for high-concurrency queries."
    ];
    passed = true;
    observations = [
      "Well-thought-out relational boundaries for sessions and user submissions."
    ];
    probingQuestions = [
      "How will the architecture handle WebSocket connection drops during streaming AI responses?"
    ];
    suggestions = [
      "Implement a Redis pub/sub queue for background AI inference tasks."
    ];
    advice = "Architecture is an ongoing trade-off between simplicity and scale. Keep iterating!";
  }

  return {
    iteration,
    passed,
    overallAssessment: passed
      ? "Nova Evaluation: Excellent Problem Framing! Your engineering decisions satisfy all core mission requirements."
      : "Nova Evaluation: Solid Initial Foundation, but needs more technical depth before proceeding.",
    strengths,
    observations,
    probingQuestions,
    suggestions,
    engineeringAdvice: advice
  };
}

export function syncMissionCompletionToOnboarding(
  missionId: string,
  missionTitle: string,
  xpEarned: number,
  nextMissionId: string
) {
  const profile = getOnboardingProfile();
  
  const completedCount = Math.max(profile.completedMissionsCount || 0, 1);
  const newXp = (profile.xp || 0) + xpEarned;
  const newRep = (profile.engineeringReputation || 0) + xpEarned;
  
  saveOnboardingProfile({
    onboardingCompleted: true,
    foundingJourneyCompleted: true,
    mission0Completed: true,
    mission1Completed: true,
    currentMissionId: nextMissionId,
    completedMissionsCount: completedCount,
    xp: newXp,
    engineeringReputation: newRep,
    currentSprintId: nextMissionId,
    currentSprintTitle: `Mission: ${nextMissionTitle(nextMissionId)}`,
    completedAt: new Date().toISOString()
  });
}

function nextMissionTitle(id: string): string {
  if (id === "mission-2") return "Solution Architecture & Schemas";
  if (id === "mission-3") return "Build Core Engine Services";
  return "Next Mission";
}

// ─────────────────────────────────────────────────────────────────────────
// Product Journey Bridge
// Syncs mission completion from the old MissionEngine into the new
// Product Journey architecture. Called alongside syncMissionCompletionToOnboarding.
// ─────────────────────────────────────────────────────────────────────────

export function syncJourneyMissionCompletion(missionId: string): void {
  // Dynamic imports avoid circular dependency issues at module load time
  import("@/lib/productJourney/sampleProduct").then(({ MAKEMISTAKES_PRODUCT }) => {
    import("@/lib/productJourney/journeyStore").then(
      ({ getOrInitJourneyProgress, completeMission }) => {
        const product = MAKEMISTAKES_PRODUCT;

        // Resolve which phase owns this mission
        let phaseId: import("@/lib/productJourney/types").PhaseId | null = null;
        for (const phase of product.phases) {
          if (phase.missions.some((m) => m.id === missionId)) {
            phaseId = phase.phaseId;
            break;
          }
        }

        if (!phaseId) {
          // Mission not part of the journey product — nothing to sync
          return;
        }

        const progress = getOrInitJourneyProgress(product);
        completeMission(missionId, phaseId, progress, product);
      }
    );
  });
}
