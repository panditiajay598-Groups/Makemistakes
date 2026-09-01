"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookmarkCheck,
  CheckCircle2,
  Plus,
  Trash2,
  GripVertical,
  ArrowDown,
  Sparkles,
  ClipboardCheck,
  FileCheck,
  AlertCircle,
} from "lucide-react";

import { ProblemData } from "@/lib/problemContent";

interface PlanPhaseProps {
  onComplete: () => void;
  onBackToJourney?: () => void;
  problemData?: ProblemData | null;
  userId?: string;
}

interface ModuleItem {
  id: string;
  name: string;
}

interface TechDecisions {
  frontend: string;
  backend: string;
  database: string;
  authentication: string;
  notifications: string;
  hosting: string;
  externalApis: string;
}

interface DatabaseEntityItem {
  id: string;
  name: string;
  description: string;
  attributes: string;
}

interface ApplicationFlowStep {
  id: string;
  text: string;
}

interface RoadmapPhaseItem {
  id: string;
  name: string;
}

const INITIAL_MODULES: ModuleItem[] = [
  { id: "m1", name: "Module Name 1" },
  { id: "m2", name: "Module Name 2" },
  { id: "m3", name: "Module Name 3" },
];

const INITIAL_TECH: TechDecisions = {
  frontend: "",
  backend: "",
  database: "",
  authentication: "",
  notifications: "",
  hosting: "",
  externalApis: "",
};

const INITIAL_DB_ENTITIES: DatabaseEntityItem[] = [
  {
    id: "e1",
    name: "",
    description: "",
    attributes: "",
  },
  {
    id: "e2",
    name: "",
    description: "",
    attributes: "",
  },
  {
    id: "e3",
    name: "",
    description: "",
    attributes: "",
  },
];

const INITIAL_FLOW_STEPS: ApplicationFlowStep[] = [
  { id: "f1", text: "Step 1: e.g. User" },
  { id: "f2", text: "Step 2: e.g. Frontend (Web / Mobile)" },
  { id: "f3", text: "Step 3: e.g. Backend / API" },
  { id: "f4", text: "Step 4: e.g. Database" },
  { id: "f5", text: "Step 5: e.g. Response / Output" },
];

const INITIAL_ROADMAP: RoadmapPhaseItem[] = [
  { id: "r1", name: "Phase 1" },
  { id: "r2", name: "Phase 2" },
  { id: "r3", name: "Phase 3" },
  { id: "r4", name: "Phase 4" },
];

import { getJourneyUserId } from "@/lib/journeyUser";

export default function PlanPhase({
  onComplete,
  onBackToJourney,
  problemData,
  userId,
}: PlanPhaseProps) {
  const pid = problemData?.problemId ?? "";
  const effectiveUserId = (userId || getJourneyUserId()).toString().trim().toLowerCase();
  const storageKey = pid && effectiveUserId ? `makemistakes_plan_${effectiveUserId}_${pid}` : null;

  // 1. Architecture Modules State
  const [modules, setModules] = useState<ModuleItem[]>(INITIAL_MODULES);

  // 2. Tech Stack Decisions State
  const [techDecisions, setTechDecisions] = useState<TechDecisions>(INITIAL_TECH);

  // 3. Database Schema Entities State
  const [dbEntities, setDbEntities] = useState<DatabaseEntityItem[]>(INITIAL_DB_ENTITIES);

  // 4. Data Flow Steps State
  const [flowSteps, setFlowSteps] = useState<ApplicationFlowStep[]>(INITIAL_FLOW_STEPS);

  // 5. Build Roadmap Phases State
  const [roadmapPhases, setRoadmapPhases] = useState<RoadmapPhaseItem[]>(INITIAL_ROADMAP);

  // 6. Risks & Challenges
  const [risksText, setRisksText] = useState("");

  // Save State Indicator
  const [isSaved, setIsSaved] = useState(false);

  // Load from Server API + localStorage fallback
  useEffect(() => {
    // Step 1: Reset ALL state to empty defaults (clears previous problem's data)
    setModules(INITIAL_MODULES);
    setTechDecisions(INITIAL_TECH);
    setDbEntities(INITIAL_DB_ENTITIES);
    setFlowSteps(INITIAL_FLOW_STEPS);
    setRoadmapPhases(INITIAL_ROADMAP);
    setRisksText("");
    setIsSaved(false);

    if (!pid) return;

    let isSubscribed = true;

    async function loadData() {
      try {
        const res = await fetch(`/api/journey/user-data?userId=${encodeURIComponent(effectiveUserId)}&problemId=${encodeURIComponent(pid)}`);
        if (res.ok) {
          const json = await res.json();
          const pData = json?.phases?.plan;
          if (isSubscribed && pData) {
            if (Array.isArray(pData.modules) && pData.modules.length > 0) setModules(pData.modules);
            if (pData.techDecisions) setTechDecisions({ ...INITIAL_TECH, ...pData.techDecisions });
            if (Array.isArray(pData.dbEntities) && pData.dbEntities.length > 0) setDbEntities(pData.dbEntities);
            if (Array.isArray(pData.flowSteps) && pData.flowSteps.length > 0) setFlowSteps(pData.flowSteps);
            if (Array.isArray(pData.roadmapPhases) && pData.roadmapPhases.length > 0) setRoadmapPhases(pData.roadmapPhases);
            if (pData.risksText) setRisksText(pData.risksText);
            return;
          }
        }
      } catch (err) {
        console.warn("[PlanPhase] Server load warning:", err);
      }

      // Fallback to local storage
      if (storageKey) {
        try {
          const saved = localStorage.getItem(storageKey);
          if (saved && isSubscribed) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed.modules)) setModules(parsed.modules);
            if (parsed.techDecisions) setTechDecisions(parsed.techDecisions);
            if (Array.isArray(parsed.dbEntities)) setDbEntities(parsed.dbEntities);
            if (Array.isArray(parsed.flowSteps)) setFlowSteps(parsed.flowSteps);
            if (Array.isArray(parsed.roadmapPhases)) setRoadmapPhases(parsed.roadmapPhases);
            if (parsed.risksText) setRisksText(parsed.risksText);
          }
        } catch {}
      }
    }

    loadData();

    return () => {
      isSubscribed = false;
    };
  }, [pid, effectiveUserId, storageKey]);

  const persistData = (
    mods: ModuleItem[],
    tech: TechDecisions,
    dbs: DatabaseEntityItem[],
    flow: ApplicationFlowStep[],
    rdm: RoadmapPhaseItem[],
    risks: string
  ) => {
    if (!pid) return;
    const payload = {
      modules: mods,
      techDecisions: tech,
      dbEntities: dbs,
      flowSteps: flow,
      roadmapPhases: rdm,
      risksText: risks,
    };

    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify({ problemId: pid, userId: effectiveUserId, ...payload }));
      } catch {}
    }

    fetch("/api/journey/user-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: effectiveUserId,
        problemId: pid,
        phase: "plan",
        data: payload,
      }),
    }).catch((err) => console.warn("[PlanPhase] Server save warning:", err));
  };

  const handleSaveProgress = () => {
    persistData(modules, techDecisions, dbEntities, flowSteps, roadmapPhases, risksText);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Section 1: Modules Handlers
  const handleAddModule = () => {
    const nextNum = modules.length + 1;
    setModules([
      ...modules,
      { id: Date.now().toString(), name: `Module Name ${nextNum}` },
    ]);
  };

  const handleUpdateModule = (id: string, name: string) => {
    setModules(modules.map((m) => (m.id === id ? { ...m, name } : m)));
  };

  const handleDeleteModule = (id: string) => {
    if (modules.length > 1) {
      setModules(modules.filter((m) => m.id !== id));
    }
  };

  // Section 2: Tech Decision Handler
  const handleTechChange = (key: keyof TechDecisions, val: string) => {
    setTechDecisions((prev) => ({ ...prev, [key]: val }));
  };

  // Section 3: Database Entity Handlers
  const handleAddEntity = () => {
    setDbEntities([
      ...dbEntities,
      { id: Date.now().toString(), name: "", description: "", attributes: "" },
    ]);
  };

  const handleUpdateEntity = (
    id: string,
    field: keyof DatabaseEntityItem,
    val: string
  ) => {
    setDbEntities(
      dbEntities.map((e) => (e.id === id ? { ...e, [field]: val } : e))
    );
  };

  const handleDeleteEntity = (id: string) => {
    if (dbEntities.length > 1) {
      setDbEntities(dbEntities.filter((e) => e.id !== id));
    }
  };

  // Section 4: Application Flow Handlers
  const handleAddFlowStep = () => {
    const nextNum = flowSteps.length + 1;
    setFlowSteps([
      ...flowSteps,
      { id: Date.now().toString(), text: `Step ${nextNum}: e.g. New Step` },
    ]);
  };

  const handleUpdateFlowStep = (id: string, text: string) => {
    setFlowSteps(flowSteps.map((s) => (s.id === id ? { ...s, text } : s)));
  };

  const handleDeleteFlowStep = (id: string) => {
    if (flowSteps.length > 1) {
      setFlowSteps(flowSteps.filter((s) => s.id !== id));
    }
  };

  // Section 5: Roadmap Phase Handlers
  const handleAddRoadmapPhase = () => {
    const nextNum = roadmapPhases.length + 1;
    setRoadmapPhases([
      ...roadmapPhases,
      { id: Date.now().toString(), name: `Phase ${nextNum}` },
    ]);
  };

  const handleUpdateRoadmapPhase = (id: string, name: string) => {
    setRoadmapPhases(
      roadmapPhases.map((r) => (r.id === id ? { ...r, name } : r))
    );
  };

  const handleDeleteRoadmapPhase = (id: string) => {
    if (roadmapPhases.length > 1) {
      setRoadmapPhases(roadmapPhases.filter((r) => r.id !== id));
    }
  };

  // Validation Criteria
  const hasModules = modules.some((m) => m.name.trim().length > 0);
  const hasTech = Object.values(techDecisions).some((v) => v.trim().length > 0);
  const hasEntities = dbEntities.some(
    (e) => e.name.trim().length > 0 || e.description.trim().length > 0
  );
  const hasFlow = flowSteps.some((f) => f.text.trim().length > 0);
  const hasRoadmap = roadmapPhases.some((r) => r.name.trim().length > 0);
  const hasRisks = risksText.trim().length > 0;

  const isWorksheetComplete =
    hasModules && hasTech && hasEntities && hasFlow && hasRoadmap && hasRisks;

  return (
    <div className="w-full text-zinc-900 font-sans antialiased selection:bg-teal-700 selection:text-white pb-20">
      {/* ============================================================ */}
      {/* HEADER                                                       */}
      {/* ============================================================ */}
      <header className="w-full pb-6 border-b border-zinc-200/60 mb-12">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/journey"
            onClick={(e) => {
              if (onBackToJourney) {
                e.preventDefault();
                onBackToJourney();
              }
            }}
            className="inline-flex items-center gap-2 text-xs font-mono font-medium text-zinc-500 hover:text-zinc-900 transition-colors group cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            <span>← Back to Journey</span>
          </Link>

          <button
            onClick={handleSaveProgress}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-mono font-semibold text-zinc-700 shadow-sm transition-all cursor-pointer"
          >
            <BookmarkCheck className="h-3.5 w-3.5 text-teal-700" />
            <span>{isSaved ? "Plan Saved!" : "Save Progress"}</span>
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* HERO SECTION (TWO-COLUMN WITH 3D CLIPBOARD GRAPHIC)          */}
      {/* ============================================================ */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-14">
        <div className="lg:col-span-8 space-y-6 text-left">
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-mono font-semibold tracking-wider text-teal-800 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full uppercase">
              PHASE 4 OF 8 • PLAN
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-zinc-900 tracking-tight leading-[1.08]">
            Plan the Engineering Work
          </h1>

          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-sans max-w-2xl">
            Before writing code, break your product into manageable engineering tasks and decide how it will be built.
          </p>
        </div>

        {/* Right 3D Clipboard Illustration */}
        <div className="lg:col-span-4 flex items-center justify-end relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-teal-100/60 via-amber-100/40 to-emerald-100/50 rounded-full blur-3xl -z-10 transform scale-125" />

          <div className="relative w-full max-w-xs aspect-square flex items-center justify-center">
            {/* Main 3D Clipboard Container */}
            <div className="relative z-10 w-44 h-60 bg-white border border-zinc-200/90 rounded-3xl shadow-2xl p-5 flex flex-col justify-between transform -rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div className="h-3 w-10 bg-teal-700 rounded-md" />
                <ClipboardCheck className="h-5 w-5 text-teal-700" />
              </div>
              <div className="space-y-3 py-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div className="h-2 w-24 bg-zinc-200 rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div className="h-2 w-20 bg-zinc-200 rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div className="h-2 w-28 bg-zinc-200 rounded" />
                </div>
              </div>
              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span>Architecture</span>
                <span className="text-teal-700 font-bold">100% Plan</span>
              </div>
            </div>

            {/* Pencil Accent */}
            <div className="absolute -top-3 -right-3 z-20 bg-gradient-to-r from-rose-400 to-amber-400 w-14 h-6 rounded-full shadow-md transform rotate-45 flex items-center justify-center text-white text-[10px] font-mono font-bold">
              Pencil
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2-COLUMN GRID WORKSHEET (CARDS 1 TO 6)                        */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* ------------------------------------------------------------ */}
        {/* CARD 1 — PROJECT MODULES                                    */}
        {/* ------------------------------------------------------------ */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 rounded-full bg-teal-100 text-teal-800 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <h2 className="font-serif text-xl font-bold text-zinc-900 tracking-tight">
                Project Modules
              </h2>
            </div>
            <p className="text-xs text-zinc-500 font-sans leading-relaxed">
              What major modules does your product need? Break your product into independent engineering modules.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {modules.map((mod) => (
              <div key={mod.id} className="flex items-center gap-2.5">
                <GripVertical className="h-4 w-4 text-zinc-300 shrink-0 cursor-grab" />
                <input
                  type="text"
                  value={mod.name}
                  onChange={(e) => handleUpdateModule(mod.id, e.target.value)}
                  placeholder="Module Name..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-xs sm:text-sm font-sans text-zinc-800 placeholder-zinc-400 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-all"
                />
                {modules.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteModule(mod.id)}
                    className="p-2 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Delete Module"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleAddModule}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-mono font-semibold text-zinc-700 shadow-2xs transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-teal-700" />
              <span>Add Module</span>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* CARD 2 — TECHNOLOGY DECISIONS                                */}
        {/* ------------------------------------------------------------ */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 rounded-full bg-teal-100 text-teal-800 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <h2 className="font-serif text-xl font-bold text-zinc-900 tracking-tight">
                Technology Decisions
              </h2>
            </div>
            <p className="text-xs text-zinc-500 font-sans leading-relaxed">
              What technologies will you use? Fill in the technologies you plan to use for your product.
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            {[
              { key: "frontend", label: "Frontend", placeholder: "e.g. Next.js 14, Tailwind CSS, TypeScript" },
              { key: "backend", label: "Backend", placeholder: "e.g. Node.js Express, Next.js API Routes" },
              { key: "database", label: "Database", placeholder: "e.g. PostgreSQL, Prisma ORM" },
              { key: "authentication", label: "Authentication", placeholder: "e.g. NextAuth.js, JWT, OTP" },
              { key: "notifications", label: "Notifications", placeholder: "e.g. Web Push API, Twilio SMS" },
              { key: "hosting", label: "Hosting", placeholder: "e.g. Vercel, AWS EC2, Docker" },
              { key: "externalApis", label: "External APIs", placeholder: "e.g. FDA Open Data, SendGrid" },
            ].map((row) => (
              <div key={row.key} className="flex items-center gap-3">
                <span className="w-28 text-xs font-semibold text-zinc-700 shrink-0 font-sans">
                  {row.label}
                </span>
                <input
                  type="text"
                  value={techDecisions[row.key as keyof TechDecisions]}
                  onChange={(e) =>
                    handleTechChange(row.key as keyof TechDecisions, e.target.value)
                  }
                  placeholder={row.placeholder}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-zinc-200 text-xs font-sans text-zinc-800 placeholder-zinc-400 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-all"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* CARD 3 — DATABASE PLANNING                                   */}
        {/* ------------------------------------------------------------ */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 rounded-full bg-teal-100 text-teal-800 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <h2 className="font-serif text-xl font-bold text-zinc-900 tracking-tight">
                Database Planning
              </h2>
            </div>
            <p className="text-xs text-zinc-500 font-sans leading-relaxed">
              What data will your application store? Define your database entities and their important attributes.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 text-[11px] font-mono font-bold text-zinc-500 px-1 uppercase tracking-wider">
              <div className="col-span-3">Entity Name</div>
              <div className="col-span-4">Description</div>
              <div className="col-span-4">Important Attributes</div>
              <div className="col-span-1 text-center">Action</div>
            </div>

            {/* Entity Rows */}
            {dbEntities.map((ent) => (
              <div key={ent.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-3">
                  <input
                    type="text"
                    value={ent.name}
                    onChange={(e) =>
                      handleUpdateEntity(ent.id, "name", e.target.value)
                    }
                    placeholder="e.g. User"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs font-sans text-zinc-800 placeholder-zinc-400 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-4">
                  <input
                    type="text"
                    value={ent.description}
                    onChange={(e) =>
                      handleUpdateEntity(ent.id, "description", e.target.value)
                    }
                    placeholder="e.g. Stores user info"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs font-sans text-zinc-800 placeholder-zinc-400 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-4">
                  <input
                    type="text"
                    value={ent.attributes}
                    onChange={(e) =>
                      handleUpdateEntity(ent.id, "attributes", e.target.value)
                    }
                    placeholder="e.g. id, name, email"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs font-sans text-zinc-800 placeholder-zinc-400 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-1 text-center">
                  {dbEntities.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteEntity(ent.id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete Entity"
                    >
                      <Trash2 className="h-3.5 w-3.5 mx-auto" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleAddEntity}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-mono font-semibold text-zinc-700 shadow-2xs transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-teal-700" />
              <span>Add Entity</span>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* CARD 4 — APPLICATION FLOW                                    */}
        {/* ------------------------------------------------------------ */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 rounded-full bg-teal-100 text-teal-800 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                4
              </span>
              <h2 className="font-serif text-xl font-bold text-zinc-900 tracking-tight">
                Application Flow
              </h2>
            </div>
            <p className="text-xs text-zinc-500 font-sans leading-relaxed">
              How will information move through your system? Build a simple flow of how your application will work.
            </p>
          </div>

          <div className="space-y-2 pt-1">
            {flowSteps.map((step, sIdx) => (
              <React.Fragment key={step.id}>
                {sIdx > 0 && (
                  <div className="flex justify-center my-1">
                    <ArrowDown className="h-4 w-4 text-zinc-300" />
                  </div>
                )}
                <div className="flex items-center gap-2.5">
                  <GripVertical className="h-4 w-4 text-zinc-300 shrink-0 cursor-grab" />
                  <input
                    type="text"
                    value={step.text}
                    onChange={(e) =>
                      handleUpdateFlowStep(step.id, e.target.value)
                    }
                    placeholder="Step details..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-xs sm:text-sm font-sans text-zinc-800 placeholder-zinc-400 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-all"
                  />
                  {flowSteps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteFlowStep(step.id)}
                      className="p-2 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete Step"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </React.Fragment>
            ))}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleAddFlowStep}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-mono font-semibold text-zinc-700 shadow-2xs transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-teal-700" />
              <span>Add Step</span>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* CARD 5 — DEVELOPMENT ROADMAP                                 */}
        {/* ------------------------------------------------------------ */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 rounded-full bg-teal-100 text-teal-800 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                5
              </span>
              <h2 className="font-serif text-xl font-bold text-zinc-900 tracking-tight">
                Development Roadmap
              </h2>
            </div>
            <p className="text-xs text-zinc-500 font-sans leading-relaxed">
              In what order will you build your product? Create your implementation phases.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {roadmapPhases.map((phase) => (
              <div key={phase.id} className="flex items-center gap-2.5">
                <GripVertical className="h-4 w-4 text-zinc-300 shrink-0 cursor-grab" />
                <input
                  type="text"
                  value={phase.name}
                  onChange={(e) =>
                    handleUpdateRoadmapPhase(phase.id, e.target.value)
                  }
                  placeholder="Phase Name..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-xs sm:text-sm font-sans text-zinc-800 placeholder-zinc-400 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-all"
                />
                {roadmapPhases.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteRoadmapPhase(phase.id)}
                    className="p-2 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Delete Phase"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleAddRoadmapPhase}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-mono font-semibold text-zinc-700 shadow-2xs transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-teal-700" />
              <span>Add Phase</span>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* CARD 6 — RISKS & CHALLENGES                                 */}
        {/* ------------------------------------------------------------ */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="h-7 w-7 rounded-full bg-teal-100 text-teal-800 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                  6
                </span>
                <h2 className="font-serif text-xl font-bold text-zinc-900 tracking-tight">
                  Risks & Challenges
                </h2>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                {risksText.length} / 1000
              </span>
            </div>

            <p className="text-xs text-zinc-500 font-sans leading-relaxed">
              What challenges do you expect while building this product? Describe technical risks, assumptions, dependencies, or difficult parts.
            </p>
          </div>

          <div className="pt-1 flex-1">
            <textarea
              rows={7}
              maxLength={1000}
              value={risksText}
              onChange={(e) => setRisksText(e.target.value)}
              placeholder="Type your thoughts..."
              className="w-full h-full p-4 rounded-xl border border-zinc-200 text-xs sm:text-sm font-sans text-zinc-800 placeholder-zinc-400 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-all leading-relaxed resize-y"
            />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* CARD 7 — PLANNING SUMMARY (FULL-WIDTH BOTTOM CARD)           */}
      {/* ============================================================ */}
      <section className="bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-4 mb-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-7 w-7 rounded-full bg-teal-100 text-teal-800 text-xs font-mono font-bold flex items-center justify-center shrink-0">
              7
            </span>
            <div>
              <h2 className="font-serif text-xl font-bold text-zinc-900 tracking-tight">
                Planning Summary
              </h2>
              <p className="text-xs text-zinc-500 font-sans mt-0.5">
                Complete the planning worksheet to generate your Engineering Blueprint.
              </p>
            </div>
          </div>

          {isWorksheetComplete ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Engineering Blueprint Ready
            </span>
          ) : (
            <span className="text-xs font-mono text-zinc-400">In Progress</span>
          )}
        </div>

        {!isWorksheetComplete ? (
          <div className="p-8 border-2 border-dashed border-zinc-200 rounded-2xl text-center space-y-3 bg-zinc-50/40">
            <FileCheck className="h-9 w-9 text-teal-600/70 mx-auto" />
            <p className="text-xs font-semibold text-zinc-700">
              Complete the planning worksheet to generate your Engineering Blueprint.
            </p>
            <p className="text-[11px] font-mono text-zinc-400">
              Fill in Modules, Tech Stack, Database Entities, App Flow, Roadmap, and Risks.
            </p>
          </div>
        ) : (
          <div className="p-6 bg-teal-50/40 border border-teal-200/80 rounded-2xl space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-teal-200/60 pb-3">
              <span className="font-bold text-sm text-teal-950 font-serif">
                Engineering Blueprint Summary
              </span>
              <span className="text-[10px] font-mono text-teal-800 font-bold bg-teal-100 px-2 py-0.5 rounded uppercase">
                READY FOR BUILD PHASE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="font-mono text-[10px] text-teal-800 font-bold uppercase">PROJECT MODULES ({modules.length}):</p>
                <p className="text-zinc-800 mt-0.5">{modules.map((m) => m.name).join(" • ")}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] text-teal-800 font-bold uppercase">DATABASE ENTITIES ({dbEntities.length}):</p>
                <p className="text-zinc-800 mt-0.5">{dbEntities.filter((e) => e.name).map((e) => e.name).join(" • ") || "Defined"}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] text-teal-800 font-bold uppercase">ROADMAP PHASES ({roadmapPhases.length}):</p>
                <p className="text-zinc-800 mt-0.5">{roadmapPhases.map((r) => r.name).join(" • ")}</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* BOTTOM ACTION & VALIDATION                                   */}
      {/* ============================================================ */}
      <footer className="flex flex-col items-center justify-center space-y-4 text-center">
        {!isWorksheetComplete && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2 max-w-md w-full">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>Complete all sections to unlock the Build phase.</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            if (!isWorksheetComplete) return;
            handleSaveProgress();
            onComplete();
          }}
          disabled={!isWorksheetComplete}
          className={`inline-flex items-center gap-3 px-10 py-4 rounded-full font-semibold font-sans text-base transition-all shadow-md ${
            isWorksheetComplete
              ? "bg-teal-800 hover:bg-teal-700 text-white cursor-pointer hover:shadow-lg hover:scale-105"
              : "bg-zinc-200 text-zinc-400 cursor-not-allowed border border-zinc-300 shadow-none"
          }`}
        >
          <span>Continue to Build →</span>
        </button>
      </footer>
    </div>
  );
}
