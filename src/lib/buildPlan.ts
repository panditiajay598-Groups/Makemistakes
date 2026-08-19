import type { ProblemBuildSpec, ProblemBuildTask, ProblemData } from "@/lib/problemContent";

export type ResponsibilityLevel =
  | "starter"
  | "foundation"
  | "intermediate"
  | "advanced"
  | "expert";

/** Who owns the code for this micro-step. */
export type StepOwnership = "provided" | "student";

export interface DerivedBuildTask {
  id: number;
  title: string;
  description: string;
  /** Plain-English coach card (Antigravity-style "What this means"). */
  whatThisMeans: string;
  ownership: StepOwnership;
  requirements: string[];
  validationCriteria: string[];
  hints: string[];
  codeChecks: string[];
  todoMarkers: string[];
  /** Scaffold template key used by buildWorkspace. */
  scaffoldKey:
    | "shell"
    | "navbar"
    | "hero"
    | "createForm"
    | "list"
    | "detail"
    | "auth"
    | "api"
    | "persist"
    | "polish"
    | "architecture"
    | "tradeoffs"
    | "expertSlice";
}

export interface DerivedBuildPlan {
  responsibility: ResponsibilityLevel;
  responsibilityLabel: string;
  responsibilityBlurb: string;
  objective: string;
  constraints: string[];
  hints: string[];
  expectedOutcome: string;
  tasks: DerivedBuildTask[];
  scaffoldingIntensity: 1 | 2 | 3 | 4 | 5;
  providedCount: number;
  studentCount: number;
  totalSteps: number;
}

const LEVEL_META: Record<
  ResponsibilityLevel,
  {
    label: string;
    blurb: string;
    scaffolding: 1 | 2 | 3 | 4 | 5;
    /** Share of steps the student writes (0–1). Rest are provided by MakeMistakes. */
    studentShare: number;
    minSteps: number;
    maxSteps: number;
  }
> = {
  starter: {
    label: "Beginner",
    blurb: "We provide most of the product code. You complete a few guided write steps.",
    scaffolding: 1,
    studentShare: 0.22, // e.g. 9 steps → ~2 student, 7 provided
    minSteps: 6,
    maxSteps: 9,
  },
  foundation: {
    label: "Foundation",
    blurb: "We scaffold the shell; you connect a couple of features yourself.",
    scaffolding: 2,
    studentShare: 0.35,
    minSteps: 6,
    maxSteps: 9,
  },
  intermediate: {
    label: "Intermediate",
    blurb: "About half the steps are yours — auth, API, and persistence decisions.",
    scaffolding: 3,
    studentShare: 0.5,
    minSteps: 7,
    maxSteps: 9,
  },
  advanced: {
    label: "Advanced",
    blurb: "Most steps are yours. We only give thin shells and architecture prompts.",
    scaffolding: 4,
    studentShare: 0.7,
    minSteps: 7,
    maxSteps: 10,
  },
  expert: {
    label: "Expert",
    blurb: "Minimal recipe. You own nearly every step and defend trade-offs.",
    scaffolding: 5,
    studentShare: 0.85,
    minSteps: 5,
    maxSteps: 8,
  },
};

export function coreNounForProblem(problemData?: ProblemData | null): string {
  const statement =
    problemData?.problemStatement || problemData?.title || "";
  const category = problemData?.category || "Product";
  return coreNounFromProblem(statement, category);
}

function coreNounFromProblem(statement: string, category: string): string {
  const s = statement.toLowerCase();
  if (/freelance|freelancer|project/.test(s)) return "Engagement";
  if (/retail|inventory|stock|supplier/.test(s)) return "Order";
  if (/invoice|payment|billing/.test(s)) return "Invoice";
  if (/delivery|logistics|pickup/.test(s)) return "Shipment";
  if (/repair|technician/.test(s)) return "Ticket";
  if (/medication|dose|pill/.test(s)) return "Medicine";
  if (/booking|salon|appointment/.test(s)) return "Booking";
  if (/student|course|lesson/.test(s)) return "Course";
  if (/notif|alert|reminder/.test(s)) return "Reminder";
  const cat = category.split(/[\s&/]+/)[0] || "Item";
  return cat.replace(/s$/i, "") || "Item";
}

export function normalizeResponsibility(problem?: ProblemData | null): ResponsibilityLevel {
  const raw = (problem?.learning?.level || problem?.difficulty || "")
    ?.toString()
    .trim()
    .toLowerCase();

  if (!raw) {
    const s = (problem?.problemStatement || problem?.title || "").toLowerCase();
    if (/architecture|trade-?off|distributed|ambiguous|constraint/.test(s)) return "advanced";
    if (/api|database|auth|integrat/.test(s)) return "intermediate";
    // Unlabeled library problems default to beginner-friendly Foundation
    return "starter";
  }

  if (/expert|master/.test(raw)) return "expert";
  if (/advanced|hard|senior/.test(raw)) return "advanced";
  if (/intermediate|medium/.test(raw)) return "intermediate";
  if (/foundation|connect/.test(raw)) return "foundation";
  if (/starter|beginner|easy|novice/.test(raw)) return "starter";
  return "starter";
}

type CatalogStep = Omit<
  DerivedBuildTask,
  "id" | "ownership" | "todoMarkers" | "codeChecks"
> & { preferredStudent?: boolean };

function buildCatalog(noun: string, productHint: string, statement: string): CatalogStep[] {
  const short = statement.replace(/\s+/g, " ").trim().slice(0, 90);
  return [
    {
      title: "App shell",
      description: `Set up the ${productHint} page shell.`,
      whatThisMeans: `This is the outer frame of your app — like the walls of a house. Beginners get this ready-made so you can focus on the important rooms later.`,
      scaffoldKey: "shell",
      requirements: ["Page exports a React component", "Main layout wrapper present"],
      validationCriteria: ["Preview shows the shell", "No crash on Run"],
      hints: ["Look at page.tsx — this is your starting canvas."],
      preferredStudent: false,
    },
    {
      title: "Navbar & brand",
      description: `Add ${productHint} navigation chrome.`,
      whatThisMeans: `The top bar shows your product name and links. We often provide this so the app already feels real.`,
      scaffoldKey: "navbar",
      requirements: ["Navbar with product name", "Primary CTA in header"],
      validationCriteria: ["Navbar visible in Preview", "Product name shown"],
      hints: ["Keep the brand name short and clear."],
      preferredStudent: false,
    },
    {
      title: "Hero / problem pitch",
      description: `Explain the problem: ${short}…`,
      whatThisMeans: `The hero tells visitors what problem you solve in one glance. For beginners this copy is usually provided.`,
      scaffoldKey: "hero",
      requirements: ["Headline tied to the problem", "Short supporting sentence", "CTA button"],
      validationCriteria: ["Headline renders", "CTA button present"],
      hints: ["One job: make the problem obvious."],
      preferredStudent: false,
    },
    {
      title: `Create ${noun} form`,
      description: `Build the form to create a ${noun.toLowerCase()}.`,
      whatThisMeans: `This is often YOUR write step — the form is the heart of the MVP. Fill fields, add a button, and show a simple error if empty.`,
      scaffoldKey: "createForm",
      requirements: [
        `${noun} title field`,
        "Primary submit button",
        "Basic empty-field feedback",
      ],
      validationCriteria: [
        "Form UI renders",
        "Primary button present",
        "No leftover FIXME markers",
      ],
      hints: ["Start with one text input + one button."],
      preferredStudent: true,
    },
    {
      title: `${noun} list`,
      description: `Show saved ${noun.toLowerCase()}s in a list.`,
      whatThisMeans: `After create, users need to see items. Beginners may get a sample list; later levels ask you to wire create → list.`,
      scaffoldKey: "list",
      requirements: ["List of items", "Empty state copy", "Status or label per item"],
      validationCriteria: ["List area renders", "Empty or sample items shown"],
      hints: ["Map over an array of items."],
      preferredStudent: true,
    },
    {
      title: `${noun} detail card`,
      description: `Show one ${noun.toLowerCase()} in more detail.`,
      whatThisMeans: `A detail card makes the product feel complete — title, status, and a short note.`,
      scaffoldKey: "detail",
      requirements: ["Detail card layout", "Status badge", "Back or secondary action"],
      validationCriteria: ["Detail card visible", "Status text present"],
      hints: ["Reuse the same data shape as the list."],
      preferredStudent: false,
    },
    {
      title: "Sign-in shell",
      description: "Add a simple email/password sign-in screen.",
      whatThisMeans: `Auth is an engineering decision. At beginner levels we provide a fake sign-in; intermediate+ may ask you to finish it.`,
      scaffoldKey: "auth",
      requirements: ["Email field", "Password field", "Sign-in button"],
      validationCriteria: ["Auth form renders", "Email + password fields"],
      hints: ["Fake session is fine for MVP."],
      preferredStudent: false,
    },
    {
      title: "Tiny API layer",
      description: `Simulate get/create for ${noun.toLowerCase()}s.`,
      whatThisMeans: `An api.ts file separates UI from data. We may provide the skeleton; you fill create/list at higher levels.`,
      scaffoldKey: "api",
      requirements: ["api module exports", "UI can call list/create"],
      validationCriteria: ["api.ts exports functions", "UI imports api"],
      hints: ["In-memory array = your database."],
      preferredStudent: true,
    },
    {
      title: "Save & sync",
      description: "Persist data with localStorage and show saved status.",
      whatThisMeans: `Refresh shouldn't wipe everything. Beginners often get this provided; intermediates write the save logic.`,
      scaffoldKey: "persist",
      requirements: ["localStorage read/write", "Saved status indicator"],
      validationCriteria: ["localStorage used", "Status text present"],
      hints: ["JSON.stringify the list."],
      preferredStudent: true,
    },
    {
      title: "Polish & empty states",
      description: "Friendly empty states and clearer copy.",
      whatThisMeans: `Polish makes the app feel finished — empty messages, button labels, spacing.`,
      scaffoldKey: "polish",
      requirements: ["Friendly empty state", "Clear button labels"],
      validationCriteria: ["Empty state copy present", "Preview still runs"],
      hints: ["Write like a helpful teammate."],
      preferredStudent: false,
    },
  ];
}

function pickStepCount(level: ResponsibilityLevel, statement: string): number {
  const meta = LEVEL_META[level];
  let n = meta.minSteps;
  const len = statement.length;
  if (len > 120) n += 1;
  if (len > 220) n += 1;
  if (/api|auth|database|notif|multi|timezone|offline/i.test(statement)) n += 1;
  return Math.min(meta.maxSteps, Math.max(meta.minSteps, n));
}

function studentCountFor(total: number, share: number): number {
  // Example: 9 steps × 0.22 ≈ 2 student write steps
  const raw = Math.round(total * share);
  return Math.min(total - 1, Math.max(1, raw));
}

function assignOwnership(
  catalog: CatalogStep[],
  studentCount: number,
  level: ResponsibilityLevel
): DerivedBuildTask[] {
  // Prefer marking preferredStudent steps as student-owned; fill remaining from the end
  const indices = catalog.map((_, i) => i);
  const preferred = indices.filter((i) => catalog[i].preferredStudent);
  const nonPreferred = indices.filter((i) => !catalog[i].preferredStudent);
  const studentIdx = new Set<number>();

  for (const i of preferred) {
    if (studentIdx.size >= studentCount) break;
    studentIdx.add(i);
  }
  // Prefer later non-preferred if still need more (advanced/expert)
  const fillOrder =
    level === "starter" || level === "foundation"
      ? [...preferred.filter((i) => !studentIdx.has(i)), ...nonPreferred].reverse()
      : [...nonPreferred, ...preferred.filter((i) => !studentIdx.has(i))];

  for (const i of fillOrder) {
    if (studentIdx.size >= studentCount) break;
    studentIdx.add(i);
  }

  return catalog.map((step, i) => {
    const ownership: StepOwnership = studentIdx.has(i) ? "student" : "provided";
    return {
      id: i + 1,
      title: step.title,
      description: step.description,
      whatThisMeans: step.whatThisMeans,
      ownership,
      requirements: step.requirements,
      validationCriteria:
        ownership === "provided"
          ? ["Click Run and confirm Preview looks right", "Read “What this means” once"]
          : step.validationCriteria,
      hints: step.hints,
      scaffoldKey: step.scaffoldKey,
      codeChecks: ownership === "provided" ? ["export ", "return"] : ["export ", "return", "button"],
      todoMarkers: ownership === "provided" ? [] : ["__WRITE_ME__"],
    };
  });
}

function fromAuthoredSpec(
  spec: ProblemBuildSpec,
  level: ResponsibilityLevel,
  noun: string
): DerivedBuildPlan {
  const meta = LEVEL_META[level];
  const tasksIn = spec.tasks || [];
  const total = Math.max(1, tasksIn.length);
  const studentCount = studentCountFor(total, meta.studentShare);
  const studentFromEnd = new Set(
    Array.from({ length: studentCount }, (_, i) => total - studentCount + i)
  );

  const tasks: DerivedBuildTask[] = tasksIn.map((t, i) => {
    const ownership: StepOwnership = studentFromEnd.has(i) ? "student" : "provided";
    const title = t.title || `Task ${i + 1}`;
    const requirements = t.requirements?.length
      ? t.requirements
      : [`Implement ${title}`, `Keep focus on ${noun}`];
    return {
      id: i + 1,
      title,
      description: t.description || `Complete ${title}.`,
      whatThisMeans:
        ownership === "provided"
          ? `MakeMistakes provides this step. Read the code, Run Preview, then continue.`
          : `This is your write step. Implement the requirements; ask Nova if stuck.`,
      ownership,
      requirements,
      validationCriteria:
        ownership === "provided"
          ? ["Run Preview once", "Acknowledge this provided step"]
          : t.validationCriteria?.length
            ? t.validationCriteria
            : requirements.slice(0, 3),
      hints: t.hints || [],
      scaffoldKey: "createForm",
      codeChecks: ["export ", "return"],
      todoMarkers: ownership === "provided" ? [] : ["__WRITE_ME__"],
    };
  });

  return {
    responsibility: level,
    responsibilityLabel: meta.label,
    responsibilityBlurb: meta.blurb,
    objective: spec.objective,
    constraints: spec.constraints || [],
    hints: spec.hints || [],
    expectedOutcome: spec.expectedOutcome || spec.objective,
    tasks,
    scaffoldingIntensity: meta.scaffolding,
    providedCount: tasks.filter((t) => t.ownership === "provided").length,
    studentCount: tasks.filter((t) => t.ownership === "student").length,
    totalSteps: tasks.length,
  };
}

export function deriveBuildPlan(problemData?: ProblemData | null): DerivedBuildPlan {
  const statement =
    problemData?.problemStatement ||
    problemData?.title ||
    "Build a focused product that solves a real market problem.";
  const category = problemData?.category || "Product";
  const noun = coreNounFromProblem(statement, category);
  const level = normalizeResponsibility(problemData);
  const meta = LEVEL_META[level];
  const productHint =
    (problemData?.title || category).split(/\s+[—–-]\s+/)[0]?.trim().slice(0, 40) || "Product";

  if (
    problemData?.build?.objective &&
    Array.isArray(problemData.build.tasks) &&
    problemData.build.tasks.length
  ) {
    return fromAuthoredSpec(problemData.build, level, noun);
  }

  const total = pickStepCount(level, statement);
  const catalog = buildCatalog(noun, productHint, statement).slice(0, total);
  const studentCount = studentCountFor(total, meta.studentShare);
  const tasks = assignOwnership(catalog, studentCount, level);
  const providedCount = tasks.filter((t) => t.ownership === "provided").length;

  const objective =
    level === "expert"
      ? `Solve: ${statement.slice(0, 160)}. Own most steps; defend decisions.`
      : `Build ${productHint} in ${total} micro-steps — ${providedCount} provided by MakeMistakes, ${studentCount} for you to write.`;

  return {
    responsibility: level,
    responsibilityLabel: meta.label,
    responsibilityBlurb: meta.blurb,
    objective,
    constraints:
      level === "starter" || level === "foundation"
        ? [
            "Read provided steps — don't rewrite them unless asked",
            "On YOUR steps, replace FIXME markers",
            "Run Preview after each step",
          ]
        : [
            "You own most implementation decisions",
            "Keep the MVP scoped to the problem statement",
          ],
    hints: [
      `${meta.label}: ${providedCount} provided · ${studentCount} your write`,
      "Ask Nova “what this means” anytime — like a patient mentor.",
    ],
    expectedOutcome: `A working ${productHint} slice with ${studentCount} student-authored step(s).`,
    tasks,
    scaffoldingIntensity: meta.scaffolding,
    providedCount,
    studentCount,
    totalSteps: total,
  };
}
