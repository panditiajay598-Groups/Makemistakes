/**
 * MakeMistakes Learning Engine
 *
 * Controls how Nova AI assists the student during the Build phase.
 * The core philosophy: the student builds, Nova teaches.
 * AI assistance reduces as the student's demonstrated capability increases.
 */

// ─────────────────────────────────────────────────────────────────────────────
// BUILD MODES
// ─────────────────────────────────────────────────────────────────────────────

export type BuildMode = "guided" | "assisted" | "independent";

export const BUILD_MODE_META: Record<
  BuildMode,
  {
    label: string;
    description: string;
    studentRole: string;
    novaRole: string;
    projectRange: string;
  }
> = {
  guided: {
    label: "Guided Build",
    description: "Nova guides you step-by-step. You do the work; Nova teaches.",
    studentRole: "BUILD THE PRODUCT",
    novaRole: "TEACH & GUIDE YOU",
    projectRange: "Projects 1–3",
  },
  assisted: {
    label: "Assisted Build",
    description: "You own most of the implementation. Nova helps when you need it.",
    studentRole: "OWN THE IMPLEMENTATION",
    novaRole: "ASSIST WHEN NEEDED",
    projectRange: "Projects 4–6",
  },
  independent: {
    label: "Independent Build",
    description: "You build independently. Nova reviews and audits.",
    studentRole: "BUILD INDEPENDENTLY",
    novaRole: "REVIEW & AUDIT",
    projectRange: "Projects 7+",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// AGENT PERMISSIONS — task-level controls
// ─────────────────────────────────────────────────────────────────────────────

export interface AgentPermission {
  /** Explain concepts, what a function does, why a pattern exists */
  explain: boolean;
  /** Give a directional hint (e.g. "Start by creating a component") */
  hint: boolean;
  /** Show a small, focused relevant example (not full solution) */
  example: boolean;
  /** Debug error messages and explain root causes */
  debug: boolean;
  /** Generate small isolated code snippets (< 30 lines) */
  snippetGeneration: boolean;
  /** Generate a complete component (single file) */
  codeGeneration: boolean;
  /** Fix the student's existing code when they share it */
  directFix: boolean;
  /** Create and scaffold a complete feature independently */
  createFeature: boolean;
  /** Modify multiple files or the entire project at once */
  modifyMultipleFiles: boolean;
  /** Auto-implement an entire screen without the student asking for specifics */
  autoImplementScreen: boolean;
}

export const PERMISSIONS: Record<BuildMode, AgentPermission> = {
  guided: {
    explain: true,
    hint: true,
    example: true,
    debug: true,
    snippetGeneration: true,
    codeGeneration: false,  // Must NOT auto-generate full components
    directFix: false,       // Fix only when student explicitly pastes code + asks
    createFeature: false,
    modifyMultipleFiles: false,
    autoImplementScreen: false,
  },
  assisted: {
    explain: true,
    hint: true,
    example: true,
    debug: true,
    snippetGeneration: true,
    codeGeneration: true,   // Can generate components when appropriate
    directFix: true,        // Can fix shared code
    createFeature: false,   // Still should not auto-build entire features
    modifyMultipleFiles: false,
    autoImplementScreen: false,
  },
  independent: {
    explain: true,
    hint: true,
    example: true,
    debug: true,
    snippetGeneration: true,
    codeGeneration: true,
    directFix: true,
    createFeature: true,    // Can create when explicitly requested
    modifyMultipleFiles: true,
    autoImplementScreen: false, // Never auto-implement without asking
  },
};

// Override permissions for specific task types
export function getPermissionsForTask(
  mode: BuildMode,
  taskType: "provided" | "student"
): AgentPermission {
  const base = { ...PERMISSIONS[mode] };
  if (taskType === "provided") {
    // Provided scaffold steps: Nova can explain fully — student studies
    return { ...base, explain: true, hint: true };
  }
  // Student write steps: enforce learning constraints
  return base;
}

// ─────────────────────────────────────────────────────────────────────────────
// HINT LADDER — progressive assistance levels
// ─────────────────────────────────────────────────────────────────────────────

export type HintLevel = 0 | 1 | 2 | 3 | 4 | 5;

export const HINT_LADDER: Record<
  HintLevel,
  { label: string; description: string; buttonText: string }
> = {
  0: {
    label: "Attempt",
    description: "Try it yourself first",
    buttonText: "Try It Yourself",
  },
  1: {
    label: "Explain",
    description: "Explain the concept behind this task",
    buttonText: "Explain This",
  },
  2: {
    label: "Hint",
    description: "Give me a directional hint to start",
    buttonText: "Give Me a Hint",
  },
  3: {
    label: "Example",
    description: "Show a small, focused example",
    buttonText: "Show an Example",
  },
  4: {
    label: "Code Help",
    description: "Help me with the specific code for this task",
    buttonText: "Help With Code",
  },
  5: {
    label: "Debug",
    description: "Help me debug this specific error",
    buttonText: "Help Me Debug",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT SKILL TRACKING
// ─────────────────────────────────────────────────────────────────────────────

export type SkillLevel =
  | "NOT_STARTED"
  | "INTRODUCED"
  | "PRACTICING"
  | "ASSISTED"
  | "INDEPENDENT";

export type SkillName =
  | "jsx_components"
  | "css_styling"
  | "responsive_design"
  | "state_management"
  | "forms"
  | "api_integration"
  | "database"
  | "authentication"
  | "error_handling"
  | "testing"
  | "git"
  | "deployment"
  | "debugging"
  | "project_architecture";

export interface StudentSkill {
  skill: SkillName;
  level: SkillLevel;
  evidence?: string; // What the student demonstrated
  updatedAt?: string;
}

export const SKILL_LABELS: Record<SkillName, string> = {
  jsx_components: "Components (JSX)",
  css_styling: "CSS & Styling",
  responsive_design: "Responsive Design",
  state_management: "State Management",
  forms: "Forms & Validation",
  api_integration: "API Integration",
  database: "Database & Data",
  authentication: "Authentication",
  error_handling: "Error Handling",
  testing: "Testing",
  git: "Git & Version Control",
  deployment: "Deployment",
  debugging: "Debugging",
  project_architecture: "Project Architecture",
};

// ─────────────────────────────────────────────────────────────────────────────
// BUILD MODE RESOLUTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Determine the appropriate build mode based on:
 * - How many projects the student has completed
 * - Their demonstrated skill levels
 *
 * Project count alone is not sufficient — skill evidence also matters.
 */
export function resolveBuildMode(
  completedProjectCount: number,
  skills: StudentSkill[]
): BuildMode {
  // Count skills where student has demonstrated independence
  const independentSkills = skills.filter(
    (s) => s.level === "INDEPENDENT" || s.level === "ASSISTED"
  ).length;

  // Projects 1–3: Always Guided (regardless of skills)
  if (completedProjectCount < 3) return "guided";

  // Projects 4–6: Assisted, but only if student has some demonstrated skills
  if (completedProjectCount < 7) {
    // If they have no demonstrated skills, keep guided longer
    if (independentSkills < 2) return "guided";
    return "assisted";
  }

  // Projects 7+: Independent, but only if skills justify it
  if (independentSkills >= 5) return "independent";
  if (independentSkills >= 2) return "assisted";
  return "guided";
}

// ─────────────────────────────────────────────────────────────────────────────
// MISSION PROGRESS TRACKING
// ─────────────────────────────────────────────────────────────────────────────

export interface MissionProgress {
  missionId: number;
  status: "not_started" | "in_progress" | "submitted" | "completed";
  attempts: number;
  hintsUsed: HintLevel[];
  startedAt?: string;
  completedAt?: string;
  /** Student's explanation of what they built (learning evidence) */
  explanation?: string;
  /** Code ownership check answers */
  ownershipAnswers?: Array<{ question: string; answer: string }>;
}

export interface BuildPhaseState {
  status: "not_started" | "in_progress" | "completed";
  buildMode: BuildMode;
  completedProjectCount: number;
  missionProgress: MissionProgress[];
  skills: StudentSkill[];
}

export function getDefaultBuildPhaseState(): BuildPhaseState {
  return {
    status: "not_started",
    buildMode: "guided",
    completedProjectCount: 0,
    missionProgress: [],
    skills: [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// LEARNING CHECKS — periodic prompts to verify understanding
// ─────────────────────────────────────────────────────────────────────────────

export const LEARNING_CHECK_QUESTIONS = {
  stateChange: [
    "What did you just add to make this component remember data?",
    "Why did you add state here instead of passing it as a prop?",
    "What happens in the UI when this state value changes?",
  ],
  componentCreation: [
    "What is the purpose of this component you just created?",
    "Which file imports and uses this component?",
    "What props does this component need to work?",
  ],
  formImplementation: [
    "What happens when the user submits this form?",
    "How does your form prevent empty submissions?",
    "Where does the form data go after submission?",
  ],
  apiIntegration: [
    "What API endpoint does this code call?",
    "What happens if the API request fails?",
    "Where in the UI does the API response appear?",
  ],
  debugging: [
    "What was causing this error?",
    "How did you figure out the root cause?",
    "What would you check next time you see a similar error?",
  ],
};

/** Randomly pick a learning check question for a given context */
export function pickLearningCheck(
  context: keyof typeof LEARNING_CHECK_QUESTIONS
): string {
  const questions = LEARNING_CHECK_QUESTIONS[context];
  return questions[Math.floor(Math.random() * questions.length)];
}

// ─────────────────────────────────────────────────────────────────────────────
// NOVA BEHAVIOR TEMPLATES — how Nova should respond at each level
// ─────────────────────────────────────────────────────────────────────────────

export function buildNovaGuidancePrefix(
  mode: BuildMode,
  missionTitle: string,
  permissions: AgentPermission
): string {
  const meta = BUILD_MODE_META[mode];

  if (mode === "guided") {
    return `This is a **Guided Build** task. Your goal is to implement "${missionTitle}" yourself.

Before I help, have you tried it? A good first step is:
1. Read the mission requirements carefully
2. Look at your approved design in the Journey Blueprint
3. Identify which files need to change
4. Start with the structure, then add logic

I can help you with:
${permissions.explain ? "✓ **Explain** — What this concept means\n" : ""}${permissions.hint ? "✓ **Hint** — A directional nudge to get started\n" : ""}${permissions.example ? "✓ **Example** — A small, focused code example\n" : ""}${permissions.debug ? "✓ **Debug** — Help diagnose a specific error\n" : ""}
What I won't do yet: Write the complete component for you.
Which type of help do you need?`;
  }

  if (mode === "assisted") {
    return `**Assisted Build** mode for "${missionTitle}".

You should be implementing this yourself. I can help when you're stuck.

Available help: Explain · Hint · Example · Code review · Debug
I can also generate specific components when you've made a real attempt first.`;
  }

  // independent
  return `**Independent Build** mode for "${missionTitle}".

I'm your technical reviewer and architect. You own the implementation.
Share your approach or code and I'll give you architectural feedback and identify edge cases.`;
}
