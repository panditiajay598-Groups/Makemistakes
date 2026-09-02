import type { ProblemData } from "@/lib/problemContent";
import {
  coreNounForProblem,
  deriveBuildPlan,
  type DerivedBuildPlan,
  type DerivedBuildTask,
  type ResponsibilityLevel,
  type StepOwnership,
} from "@/lib/buildPlan";

export interface BuildMission {
  id: number;
  title: string;
  subtitle: string;
  time: string;
  ownership: StepOwnership;
  whatThisMeans: string;
  criteria: string[];
  validationCriteria: string[];
  requirements: string[];
  hints: string[];
  codeChecks: string[];
  todoMarkers: string[];
  files: string[];
  whyFileExists: string;
  componentTree: string[];
  quizQuestion: string;
  quizAnswer: string;
  quizHint: string;
  previewHero: string;
  previewSideTitle: string;
  previewSideItems: { label: string; status: string }[];
  tests: string[];
}

export interface BuildWorkspace {
  problemId: string;
  productName: string;
  productSlug: string;
  tagline: string;
  category: string;
  statement: string;
  responsibility: ResponsibilityLevel;
  responsibilityLabel: string;
  responsibilityBlurb: string;
  buildObjective: string;
  constraints: string[];
  expectedOutcome: string;
  scaffoldingIntensity: 1 | 2 | 3 | 4 | 5;
  providedCount: number;
  studentCount: number;
  missions: BuildMission[];
  fileContents: Record<number, Record<string, string>>;
  novaHints: string[];
}

function titleCase(words: string[]): string {
  return words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
}

export function deriveProductName(problemData?: ProblemData | null): string {
  const title = (problemData?.title || problemData?.problemStatement || "").trim();
  const category = (problemData?.category || "Product").trim();

  const emDash = title.split(/\s+[—–-]\s+/)[0]?.trim();
  if (emDash && emDash.length > 2 && emDash.length < 40 && !/^why\b/i.test(emDash)) {
    return emDash.replace(/[^a-zA-Z0-9\s]/g, "").trim() || "BuildOS App";
  }

  const lower = title.toLowerCase();
  const keywordMap: Array<[RegExp, string]> = [
    [/freelance|freelancer/, "TrustWork"],
    [/retail|kirana|distributor/, "RetailLink"],
    [/invoice|billing|payment/, "PayFlow"],
    [/logistics|delivery|pickup/, "ShipSure"],
    [/repair|technician/, "FixFast"],
    [/inventory|stock|supplier/, "StockSync"],
    [/restaurant|ingredient|wholesale/, "KitchenBuy"],
    [/verify|verification|identity/, "VerifyHub"],
    [/medication|dose|pill|health/, "MedReminder"],
    [/salon|beauty|stylist/, "StyleBook"],
    [/parking|valet/, "ParkWise"],
    [/pet|kennel/, "PetStay"],
    [/gift/, "GiftNow"],
    [/education|edtech|school/, "LearnLoop"],
    [/real estate|apartment|home/, "HomeStack"],
  ];

  for (const [re, name] of keywordMap) {
    if (re.test(lower)) return name;
  }

  const catToken = category.split(/[\s&/]+/).filter(Boolean)[0] || "Product";
  return `${titleCase([catToken])}OS`;
}

function estimateTime(ownership: StepOwnership): string {
  return ownership === "provided" ? "5–10 min" : "15–25 min";
}

function scaffoldForTask(opts: {
  task: DerivedBuildTask;
  plan: DerivedBuildPlan;
  productName: string;
  tagline: string;
  coreNoun: string;
}): {
  files: Record<string, string>;
  why: string;
  tree: string[];
  quizQ: string;
  quizA: string;
  quizH: string;
  tests: string[];
} {
  const { task, productName, tagline, coreNoun } = opts;
  const noun = coreNoun;
  const provided = task.ownership === "provided";
  const todo = "__WRITE_ME__";

  const wrap = (files: Record<string, string>, tree: string[]) => ({
    files,
    why: task.description,
    tree,
    quizQ: provided
      ? "What did MakeMistakes give you in this step?"
      : "What must you finish before validation passes?",
    quizA: provided
      ? "Ready-made code to study and Run — then move on."
      : "Replace __WRITE_ME__ with your real implementation and meet the validation checklist.",
    quizH: task.hints[0] || task.whatThisMeans,
    tests: task.validationCriteria.map((c) => (provided ? `✓ ${c}` : `○ ${c}`)),
  });

  switch (task.scaffoldKey) {
    case "shell":
      return wrap(
        {
          "app/page.tsx": `export default function AppShell() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center space-y-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-10 shadow-2xl backdrop-blur-xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold">
          <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
          ${productName} Product Workspace
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          Welcome to ${productName}
        </h1>
        <p className="text-slate-400 text-base leading-relaxed max-w-lg mx-auto">
          Build and customize your application. Use the Monaco editor or instruct Nova AI to synthesize components, create forms, and write backend APIs.
        </p>
        <div className="flex items-center justify-center gap-3 pt-4">
          <button className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all shadow-lg cursor-pointer">
            Explore Features
          </button>
          <button className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all border border-slate-700 cursor-pointer">
            Documentation
          </button>
        </div>
      </div>
    </main>
  );
}
`,
        },
        ["AppShell (page.tsx)"]
      );

    case "navbar":
      return wrap(
        {
          "app/page.tsx": `import { Navbar } from "./Navbar";

export default function WithNavbar() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="p-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold">${productName}</h1>
        <p className="text-sm text-zinc-500 mt-2">${provided ? "Navbar provided — study how the brand sits on top." : `TODO: finish Navbar`}</p>
      </div>
    </main>
  );
}
`,
          "app/Navbar.tsx": provided
            ? `export function Navbar() {
  return (
    <header className="h-14 border-b flex items-center justify-between px-6 bg-white">
      <div className="font-bold text-teal-800">${productName}</div>
      <nav className="flex items-center gap-4 text-sm">
        <a href="#home" className="text-zinc-600 hover:text-zinc-900">Home</a>
        <button className="bg-teal-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">Get Started</button>
      </nav>
    </header>
  );
}
`
            : `export function Navbar() {
  return (
    <header className="h-14 border-b flex items-center justify-between px-6 bg-white shadow-sm">
      <div className="font-bold text-teal-800 text-lg">${productName}</div>
      <nav className="flex items-center gap-4 text-sm font-medium">
        <a href="#home" className="text-zinc-600 hover:text-zinc-900">Home</a>
        <button className="bg-teal-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-teal-600 transition-colors">Get Started</button>
      </nav>
    </header>
  );
}
`,
        },
        ["WithNavbar (page.tsx)", "└── Navbar"]
      );

    case "hero":
      return wrap(
        {
          "app/page.tsx": `import { Hero } from "./Hero";

export default function HeroPage() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
    </main>
  );
}
`,
          "app/Hero.tsx": provided
            ? `export function Hero() {
  return (
    <section className="py-16 px-6 text-center space-y-5 max-w-2xl mx-auto">
      <p className="text-xs font-mono text-teal-700 uppercase">Problem pitch</p>
      <h1 className="text-4xl font-bold tracking-tight">${tagline.slice(0, 72)}${tagline.length > 72 ? "…" : ""}</h1>
      <p className="text-zinc-600">Build ${productName} as a focused MVP that solves this for real users.</p>
      <button className="bg-teal-700 text-white px-6 py-2.5 rounded-full font-semibold">Get Started</button>
    </section>
  );
}
`
            : `export function Hero() {
  return (
    <section className="py-14 px-6 text-center space-y-4 max-w-xl mx-auto">
      <p className="text-xs font-mono text-teal-700 uppercase font-semibold">Welcome to ${productName}</p>
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">${tagline.slice(0, 72)}${tagline.length > 72 ? "…" : ""}</h1>
      <p className="text-sm text-zinc-600">Build ${productName} as a focused MVP that solves this for real users.</p>
      <button className="bg-teal-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-teal-600 transition-colors shadow-sm">
        Explore Product
      </button>
    </section>
  );
}
`,
        },
        ["HeroPage (page.tsx)", "└── Hero"]
      );

    case "createForm":
      if (provided) {
        return wrap(
          {
            "app/page.tsx": `import { ${noun}Form } from "./${noun}Form";

export default function Create${noun}Page() {
  return (
    <main className="p-6 max-w-lg mx-auto space-y-4 bg-white min-h-screen">
      <h1 className="text-2xl font-bold">New ${noun} — ${productName}</h1>
      <p className="text-sm text-zinc-600">${tagline.slice(0, 90)}${tagline.length > 90 ? "…" : ""}</p>
      <${noun}Form />
    </main>
  );
}
`,
            [`app/${noun}Form.tsx`]: `import { useState } from "react";

export function ${noun}Form() {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a title.");
      setSaved(false);
      return;
    }
    setError("");
    setSaved(true);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 border rounded-2xl p-4">
      <label className="block text-xs font-semibold text-zinc-600">${noun} title</label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 text-sm"
        placeholder="e.g. Priority ${noun}"
      />
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
      {saved ? <p className="text-xs text-emerald-600">Saved (demo).</p> : null}
      <button type="submit" className="w-full bg-teal-700 text-white rounded-lg py-2.5 font-semibold text-sm">
        Create ${noun}
      </button>
    </form>
  );
}
`,
          },
          [`Create${noun}Page (page.tsx)`, `└── ${noun}Form`]
        );
      }

      // Student write: starter form component
      return wrap(
        {
          "app/page.tsx": `import { ${noun}Form } from "./${noun}Form";

export default function Create${noun}Page() {
  return (
    <main className="p-6 max-w-lg mx-auto space-y-4 bg-white min-h-screen">
      <h1 className="text-2xl font-bold text-zinc-900">New ${noun} — ${productName}</h1>
      <p className="text-sm text-zinc-600">Create a new ${noun.toLowerCase()} with built-in validation.</p>
      <${noun}Form />
    </main>
  );
}
`,
          [`app/${noun}Form.tsx`]: `import { useState } from "react";

export function ${noun}Form() {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a title.");
      setSaved(false);
      return;
    }
    setError("");
    setSaved(true);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 border border-zinc-200 rounded-2xl p-5 bg-white shadow-sm">
      <div>
        <label className="block text-xs font-semibold text-zinc-700 mb-1">
          ${noun} Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Priority ${noun}"
          className="w-full border border-zinc-300 rounded-lg px-3.5 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {error ? (
        <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2.5">
          {error}
        </p>
      ) : null}

      {saved ? (
        <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
          ✓ ${noun} created successfully!
        </p>
      ) : null}

      <button
        type="submit"
        className="w-full bg-teal-700 hover:bg-teal-600 text-white rounded-lg py-2.5 font-semibold text-sm transition-colors shadow-sm cursor-pointer"
      >
        Create ${noun}
      </button>
    </form>
  );
}
`,
        },
        [`Create${noun}Page (page.tsx)`, `└── ${noun}Form`]
      );

    case "list":
      if (provided) {
        return wrap(
          {
            "app/page.tsx": `import { ${noun}List } from "./${noun}List";

export default function ${noun}ListPage() {
  return (
    <main className="p-6 space-y-4 bg-white min-h-screen">
      <h1 className="text-2xl font-bold">${noun}s — ${productName}</h1>
      <${noun}List />
    </main>
  );
}
`,
            [`app/${noun}List.tsx`]: `export function ${noun}List() {
  const items = [
    { id: "1", title: "Sample ${noun} A", status: "Open" },
    { id: "2", title: "Sample ${noun} B", status: "Done" },
  ];
  return (
    <section className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="flex justify-between border rounded-xl px-4 py-3 bg-zinc-50">
          <span className="text-sm font-semibold">{item.title}</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">{item.status}</span>
        </div>
      ))}
    </section>
  );
}
`,
          },
          [`${noun}ListPage (page.tsx)`, `└── ${noun}List`]
        );
      }

      return wrap(
        {
          "app/page.tsx": `import { ${noun}List } from "./${noun}List";

export default function ${noun}ListPage() {
  return (
    <main className="p-6 space-y-4 bg-white min-h-screen">
      <h1 className="text-2xl font-bold text-zinc-900">${noun}s — ${productName}</h1>
      <${noun}List />
    </main>
  );
}
`,
          [`app/${noun}List.tsx`]: `export function ${noun}List() {
  const items = [
    { id: "1", title: "Sample ${noun} A", status: "Open" },
    { id: "2", title: "Sample ${noun} B", status: "Completed" },
  ];

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="p-4 border border-zinc-200 rounded-xl flex justify-between items-center bg-white shadow-sm">
          <span className="font-medium text-sm text-zinc-900">{item.title}</span>
          <span className="text-xs px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-full font-semibold">{item.status}</span>
        </div>
      ))}
    </div>
  );
}
`,
        },
        [`${noun}ListPage (page.tsx)`, `└── ${noun}List`]
      );

    case "detail":
      return wrap(
        {
          "app/page.tsx": provided
            ? `export default function ${noun}DetailPage() {
  return (
    <main className="p-6 max-w-md mx-auto space-y-4 bg-white min-h-screen">
      <div className="border rounded-2xl p-5 space-y-2">
        <h1 className="text-xl font-bold">Priority ${noun}</h1>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">Open</span>
        <p className="text-sm text-zinc-600">A short note about this ${noun.toLowerCase()} for ${productName}.</p>
        <button className="text-sm text-teal-700 font-semibold">Back to list</button>
      </div>
    </main>
  );
}
`
            : `export default function ${noun}DetailPage() {
  return (
    <main className="p-6 max-w-md mx-auto space-y-4 bg-white min-h-screen">
      <div className="border border-zinc-200 rounded-2xl p-5 space-y-3 shadow-sm">
        <h1 className="text-xl font-bold text-zinc-900">Priority ${noun}</h1>
        <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">Open</span>
        <p className="text-sm text-zinc-600">A detailed view of this ${noun.toLowerCase()} for ${productName}.</p>
        <button className="w-full bg-teal-700 hover:bg-teal-600 text-white font-semibold py-2 rounded-lg text-xs transition-colors">Back to List</button>
      </div>
    </main>
  );
}
`,
        },
        [`${noun}DetailPage (page.tsx)`]
      );

    case "auth":
      return wrap(
        {
          "app/page.tsx": provided
            ? `export default function AuthShell() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-white">
      <form className="w-full max-w-md space-y-3 border rounded-2xl p-6" onSubmit={(e) => e.preventDefault()}>
        <h1 className="text-xl font-bold">Sign in — ${productName}</h1>
        <input type="email" placeholder="Email" className="w-full border rounded-lg px-3 py-2 text-sm" />
        <input type="password" placeholder="Password" className="w-full border rounded-lg px-3 py-2 text-sm" />
        <button className="w-full bg-teal-700 text-white rounded-lg py-2.5 font-semibold text-sm">Sign In</button>
      </form>
    </main>
  );
}
`
            : `/**
 * YOUR WRITE STEP — sign-in UI for ${productName}.
 * Requirements: email field, password field, sign-in button.
 */
export default function AuthShell() {
  // ${todo}
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-white">
      <p className="text-sm text-zinc-500">Build the sign-in form here.</p>
    </main>
  );
}
`,
        },
        ["AuthShell (page.tsx)"]
      );

    case "api":
      if (provided) {
        return wrap(
          {
            "app/page.tsx": `import { list${noun}s, create${noun} } from "./api";

export default function ApiDemoPage() {
  return (
    <main className="p-6 space-y-3 bg-white min-h-screen">
      <h1 className="text-2xl font-bold">${noun} API — ${productName}</h1>
      <p className="text-sm text-zinc-500">Provided API wired for demo.</p>
      <button
        type="button"
        className="bg-teal-700 text-white text-sm px-4 py-2 rounded-lg"
        onClick={() => {
          void create${noun}("Demo");
          void list${noun}s();
        }}
      >
        Ping API
      </button>
    </main>
  );
}
`,
            "app/api.ts": `const db: { id: string; title: string }[] = [];

export async function list${noun}s() {
  return [...db];
}

export async function create${noun}(title: string) {
  const row = { id: String(Date.now()), title };
  db.push(row);
  return row;
}
`,
          },
          ["ApiDemoPage (page.tsx)", "└── app/api.ts"]
        );
      }

      return wrap(
        {
          "app/page.tsx": `import { list${noun}s, create${noun} } from "./api";

export default function ApiDemoPage() {
  return (
    <main className="p-6 space-y-3 bg-white min-h-screen">
      <h1 className="text-2xl font-bold">${noun} API — ${productName}</h1>
      <p className="text-sm text-zinc-500">Your write step: implement api.ts then wire this page.</p>
      <button
        type="button"
        className="border text-sm px-4 py-2 rounded-lg"
        onClick={() => {
          void create${noun}("Demo");
          void list${noun}s();
        }}
      >
        Ping API
      </button>
    </main>
  );
}
`,
          "app/api.ts": `/**
 * YOUR WRITE STEP — simulated API for ${productName}.
 * Implement list${noun}s() and create${noun}(title).
 * In-memory array is fine.
 */
const db: { id: string; title: string }[] = [];

export async function list${noun}s() {
  return ["${todo}" as unknown as { id: string; title: string }];
}

export async function create${noun}(title: string) {
  void title;
  return { id: "${todo}", title: "" };
}
`,
        },
        ["ApiDemoPage (page.tsx)", "└── app/api.ts ← you write this"]
      );

    case "persist":
      return wrap(
        {
          "app/page.tsx": provided
            ? `import { useEffect, useState } from "react";

export default function PersistPage() {
  const [items, setItems] = useState<string[]>([]);
  const [status, setStatus] = useState("Saved");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("${productName}-demo");
      if (raw) setItems(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  function add() {
    const next = [...items, "${noun} " + (items.length + 1)];
    setItems(next);
    localStorage.setItem("${productName}-demo", JSON.stringify(next));
    setStatus("Saved");
  }

  return (
    <main className="p-6 space-y-3 bg-white min-h-screen">
      <p className="text-[10px] font-mono text-teal-700 uppercase">Provided persistence</p>
      <h1 className="text-2xl font-bold">Saved ${noun}s</h1>
      <p className="text-xs font-mono text-teal-700">Sync: {status}</p>
      <button type="button" onClick={add} className="bg-teal-700 text-white text-sm px-4 py-2 rounded-lg">Add</button>
      <ul className="text-sm space-y-1">{items.map((x) => <li key={x}>{x}</li>)}</ul>
    </main>
  );
}
`
            : `/**
 * YOUR WRITE STEP — persist ${noun.toLowerCase()}s with localStorage.
 * Requirements: read/write localStorage, show Saved status, list items.
 */
export default function PersistPage() {
  // ${todo}
  return (
    <main className="p-6 bg-white min-h-screen">
      <h1 className="text-2xl font-bold">Saved ${noun}s</h1>
      <p className="text-sm text-zinc-500">Implement persistence here.</p>
    </main>
  );
}
`,
        },
        ["PersistPage (page.tsx)"]
      );

    case "polish":
    default:
      return wrap(
        {
          "app/page.tsx": provided
            ? `export default function PolishPage() {
  return (
    <main className="p-8 max-w-lg mx-auto space-y-4 bg-white min-h-screen">
      <p className="text-[10px] font-mono text-teal-700 uppercase">Provided polish</p>
      <h1 className="text-2xl font-bold">${productName} is ready to demo</h1>
      <div className="border border-dashed rounded-2xl p-6 text-center text-sm text-zinc-500">
        Empty state: no ${noun.toLowerCase()}s yet — create your first one.
      </div>
      <button className="bg-teal-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold">Create ${noun}</button>
    </main>
  );
}
`
            : `/**
 * YOUR WRITE STEP — polish empty states + clear CTA for ${productName}.
 */
export default function PolishPage() {
  // ${todo}
  return (
    <main className="p-8 bg-white min-h-screen">
      <p className="text-sm text-zinc-500">Add empty state + CTA here.</p>
    </main>
  );
}
`,
        },
        ["PolishPage (page.tsx)"]
      );
  }
}

function relatedHint(problemData?: ProblemData | null): string | null {
  const opp = problemData?.relatedInformation?.opportunity;
  if (opp && opp.length > 40) return `Opportunity signal: ${opp.slice(0, 180)}…`;
  const ctx = problemData?.relatedInformation?.context;
  if (ctx && ctx.length > 40) return `Context: ${ctx.slice(0, 180)}…`;
  return null;
}

export function deriveBuildWorkspace(problemData?: ProblemData | null): BuildWorkspace {
  const problemId = problemData?.problemId || "P000001";
  const statement =
    problemData?.problemStatement ||
    problemData?.title ||
    "Build a focused product that solves a real market problem.";
  const category = problemData?.category || "Product Design";
  const productName = deriveProductName(problemData);
  const productSlug = productName.toLowerCase().replace(/\s+/g, "-");
  const tagline = statement.replace(/\?+$/, "").trim();
  const coreNoun = coreNounForProblem(problemData);
  const plan = deriveBuildPlan(problemData);

  const fileContents: Record<number, Record<string, string>> = {};
  const missions: BuildMission[] = plan.tasks.map((task) => {
    const built = scaffoldForTask({
      task,
      plan,
      productName,
      tagline,
      coreNoun,
    });
    fileContents[task.id] = built.files;
    return {
      id: task.id,
      title: task.title,
      subtitle: task.ownership === "provided" ? "Provided for you" : "Your write step",
      time: estimateTime(task.ownership),
      ownership: task.ownership,
      whatThisMeans: task.whatThisMeans,
      criteria: task.requirements,
      validationCriteria: task.validationCriteria,
      requirements: task.requirements,
      hints: [...plan.hints, ...task.hints],
      codeChecks: task.codeChecks,
      todoMarkers: task.todoMarkers,
      files: Object.keys(built.files),
      whyFileExists: built.why,
      componentTree: built.tree,
      quizQuestion: built.quizQ,
      quizAnswer: built.quizA,
      quizHint: built.quizH,
      previewHero: `${productName}: ${task.title}`,
      previewSideTitle: plan.responsibilityLabel,
      previewSideItems: [
        {
          label: task.ownership === "provided" ? "Provided" : "You write",
          status: `${task.id}/${plan.totalSteps}`,
        },
        { label: "Level", status: plan.responsibilityLabel },
      ],
      tests: built.tests,
    };
  });

  const novaHints = [
    `${productName} · ${plan.responsibilityLabel}: ${plan.providedCount} provided steps, ${plan.studentCount} your write.`,
    `Objective: ${plan.objective}`,
    relatedHint(problemData),
  ].filter(Boolean) as string[];

  return {
    problemId,
    productName,
    productSlug,
    tagline,
    category,
    statement,
    responsibility: plan.responsibility,
    responsibilityLabel: plan.responsibilityLabel,
    responsibilityBlurb: plan.responsibilityBlurb,
    buildObjective: plan.objective,
    constraints: plan.constraints,
    expectedOutcome: plan.expectedOutcome,
    scaffoldingIntensity: plan.scaffoldingIntensity,
    providedCount: plan.providedCount,
    studentCount: plan.studentCount,
    missions,
    fileContents,
    novaHints,
  };
}

export function validateMissionCode(opts: {
  mission: BuildMission;
  files: Record<string, string>;
  hasRun: boolean;
}): { ok: boolean; failures: string[] } {
  const failures: string[] = [];
  if (!opts.hasRun) {
    failures.push("Click Run so Preview compiles at least once before completing this step.");
  }

  const combined = Object.values(opts.files || {}).join("\n");
  if (!combined.trim()) {
    failures.push("No code files found for this step.");
    return { ok: false, failures };
  }

  // Provided steps: Run is enough (plus soft export check)
  if (opts.mission.ownership === "provided") {
    if (!/export\s+(default\s+)?(function|const)|export\s+function/i.test(combined)) {
      failures.push("Provided code should still export a component — don't delete the exports.");
    }
    return { ok: failures.length === 0, failures };
  }

  for (const marker of opts.mission.todoMarkers || []) {
    if (combined.includes(marker)) {
      failures.push(`Replace leftover marker \`${marker}\` with real implementation.`);
    }
  }

  for (const check of opts.mission.codeChecks || []) {
    if (!combined.toLowerCase().includes(check.toLowerCase())) {
      failures.push(`Code should include something like \`${check.trim()}\`.`);
    }
  }

  return { ok: failures.length === 0, failures };
}

export function answerNovaQuestion(opts: {
  question: string;
  workspace: BuildWorkspace;
  mission: BuildMission;
  activeFile: string;
}): string {
  const q = opts.question.toLowerCase();
  const { workspace, mission, activeFile } = opts;

  if (/mean|what this|explain|why/.test(q)) {
    return mission.whatThisMeans;
  }
  if (/provided|mine|write|own/.test(q)) {
    return mission.ownership === "provided"
      ? `Step ${mission.id} is **provided** by MakeMistakes. Study it, Run Preview, check validation, and continue.`
      : `Step ${mission.id} is **your write step**. Replace FIXME markers and meet validation.`;
  }
  if (/next|roadmap|objective/.test(q)) {
    return `Objective: ${workspace.buildObjective}\nStep ${mission.id}/${workspace.missions.length}: ${mission.title} (${mission.ownership}).`;
  }
  return `For ${workspace.productName} · ${mission.title}: ${mission.whatThisMeans}\nWorking in \`${activeFile}\`.`;
}

export function buildProgressStorageKey(problemId: string): string {
  return `makemistakes_build_v5_${problemId}`;
}

export interface BuildProgressState {
  completedMissionIds: number[];
  activeMissionId: number;
  criteriaCheck: Record<string, boolean>;
}

export function loadBuildProgress(problemId: string): BuildProgressState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(buildProgressStorageKey(problemId));
    if (!raw) return null;
    return JSON.parse(raw) as BuildProgressState;
  } catch {
    return null;
  }
}

export function saveBuildProgress(problemId: string, state: BuildProgressState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(buildProgressStorageKey(problemId), JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function defaultCriteriaState(criteria: string[]): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  criteria.forEach((_, i) => {
    out[`c${i + 1}`] = false;
  });
  return out;
}
