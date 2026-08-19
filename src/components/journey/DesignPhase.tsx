"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookmarkCheck,
  Layout,
  Layers,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  MoveLeft,
  MoveRight,
  PenTool,
  Grid,
} from "lucide-react";

import { ProblemData } from "@/lib/problemContent";

interface DesignPhaseProps {
  onComplete: () => void;
  onBackToJourney?: () => void;
  problemData?: ProblemData | null;
}

// Generic role chips — not problem-specific
const AVAILABLE_USER_CHIPS = [
  "End Consumers",
  "Business Owners",
  "Operations Teams",
  "Logistics Partners",
  "Administrators",
  "Other",
];

// Generic feature suggestions — not problem-specific
const AVAILABLE_FEATURES = [
  "Real-Time Tracking",
  "Notifications / Alerts",
  "Dashboard / Analytics",
  "User Management",
  "Payment Integration",
  "Document Upload",
  "Search & Filter",
  "Reporting",
  "Messaging",
  "API Integration",
  "Mobile App",
];

interface ScreenItem {
  id: string;
  name: string;
  description: string;
}

interface JourneyStepItem {
  id: string;
  name: string;
}

interface SketchItem {
  id: string;
  screenLabel: string;
  imageUrl: string | null;
  drawLater: boolean;
}

// Empty defaults — no problem-specific content
const EMPTY_SCREENS: ScreenItem[] = [
  { id: "s1", name: "Screen 1: ", description: "" },
  { id: "s2", name: "Screen 2: ", description: "" },
  { id: "s3", name: "Screen 3: ", description: "" },
];

const EMPTY_JOURNEY: JourneyStepItem[] = [
  { id: "j1", name: "Step 1" },
  { id: "j2", name: "Step 2" },
];

const EMPTY_SKETCHES: SketchItem[] = [
  { id: "sk1", screenLabel: "Screen 1", imageUrl: null, drawLater: false },
  { id: "sk2", screenLabel: "Screen 2", imageUrl: null, drawLater: false },
  { id: "sk3", screenLabel: "Screen 3", imageUrl: null, drawLater: false },
];

export default function DesignPhase({
  onComplete,
  onBackToJourney,
  problemData,
  userId,
}: DesignPhaseProps) {
  const pid = problemData?.problemId ?? "";
  const effectiveUserId = (userId || "default_user").toString().trim().toLowerCase();
  const storageKey = pid && effectiveUserId ? `makemistakes_design_${effectiveUserId}_${pid}` : null;

  // Section 1: Product Goal
  const [productGoal, setProductGoal] = useState("");

  // Section 2: Core Users
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [customUserRole, setCustomUserRole] = useState("");
  const [showCustomRoleInput, setShowCustomRoleInput] = useState(false);
  const [userImportance, setUserImportance] = useState("");

  // Section 3: Feature Prioritization (Max 5)
  const [v1Features, setV1Features] = useState<string[]>([]);

  // Section 4: Screen Planning — empty by default
  const [screens, setScreens] = useState<ScreenItem[]>(EMPTY_SCREENS);

  // Section 5: User Journey — empty by default
  const [journeySteps, setJourneySteps] = useState<JourneyStepItem[]>(EMPTY_JOURNEY);
  const [newStepName, setNewStepName] = useState("");

  // Section 6: Low-Fidelity Sketches — empty by default
  const [sketches, setSketches] = useState<SketchItem[]>(EMPTY_SKETCHES);

  // Section 7: Design Decisions
  const [expandedAccordions, setExpandedAccordions] = useState<Record<string, boolean>>({
    a1: true,
  });
  const [designDecisions, setDesignDecisions] = useState("");

  // Save Progress State
  const [isSaved, setIsSaved] = useState(false);

  // Load from Server API + localStorage fallback
  useEffect(() => {
    // Step 1: Reset ALL state to empty/generic defaults (clears previous problem's data)
    setProductGoal("");
    setSelectedUsers([]);
    setCustomUserRole("");
    setShowCustomRoleInput(false);
    setUserImportance("");
    setV1Features([]);
    setScreens(EMPTY_SCREENS);
    setJourneySteps(EMPTY_JOURNEY);
    setSketches(EMPTY_SKETCHES);
    setDesignDecisions("");
    setIsSaved(false);

    if (!pid) return;

    let isSubscribed = true;

    async function loadData() {
      try {
        const res = await fetch(`/api/journey/user-data?userId=${encodeURIComponent(effectiveUserId)}&problemId=${encodeURIComponent(pid)}`);
        if (res.ok) {
          const json = await res.json();
          const dData = json?.phases?.design;
          if (isSubscribed && dData) {
            if (dData.productGoal) setProductGoal(dData.productGoal);
            if (Array.isArray(dData.selectedUsers)) setSelectedUsers(dData.selectedUsers);
            if (dData.userImportance) setUserImportance(dData.userImportance);
            if (Array.isArray(dData.v1Features)) setV1Features(dData.v1Features);
            if (Array.isArray(dData.screens) && dData.screens.length > 0) setScreens(dData.screens);
            if (Array.isArray(dData.journeySteps) && dData.journeySteps.length > 0) setJourneySteps(dData.journeySteps);
            if (Array.isArray(dData.sketches) && dData.sketches.length > 0) setSketches(dData.sketches);
            if (dData.designDecisions) setDesignDecisions(dData.designDecisions);
            return;
          }
        }
      } catch (err) {
        console.warn("[DesignPhase] Server load warning:", err);
      }

      // Fallback to local storage
      if (storageKey) {
        try {
          const saved = localStorage.getItem(storageKey);
          if (saved && isSubscribed) {
            const parsed = JSON.parse(saved);
            if (parsed.productGoal) setProductGoal(parsed.productGoal);
            if (Array.isArray(parsed.selectedUsers)) setSelectedUsers(parsed.selectedUsers);
            if (parsed.userImportance) setUserImportance(parsed.userImportance);
            if (Array.isArray(parsed.v1Features)) setV1Features(parsed.v1Features);
            if (Array.isArray(parsed.screens)) setScreens(parsed.screens);
            if (Array.isArray(parsed.journeySteps)) setJourneySteps(parsed.journeySteps);
            if (Array.isArray(parsed.sketches)) setSketches(parsed.sketches);
            if (parsed.designDecisions) setDesignDecisions(parsed.designDecisions);
          }
        } catch {}
      }
    }

    loadData();

    return () => {
      isSubscribed = false;
    };
  }, [pid, effectiveUserId, storageKey]);

  const persistData = () => {
    if (!pid) return;
    const payload = {
      productGoal,
      selectedUsers,
      userImportance,
      v1Features,
      screens,
      journeySteps,
      sketches,
      designDecisions,
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
        phase: "design",
        data: payload,
      }),
    }).catch((err) => console.warn("[DesignPhase] Server save warning:", err));
  };

  const handleSaveProgress = () => {
    persistData();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Section 2: Core User Chip Toggle
  const toggleUserChip = (user: string) => {
    if (selectedUsers.includes(user)) {
      setSelectedUsers(selectedUsers.filter((u) => u !== user));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleAddCustomUser = () => {
    if (customUserRole.trim() && !selectedUsers.includes(customUserRole.trim())) {
      setSelectedUsers([...selectedUsers, customUserRole.trim()]);
      setCustomUserRole("");
      setShowCustomRoleInput(false);
    }
  };

  // Section 3: Feature Prioritization Toggle (Max 5)
  const toggleV1Feature = (feature: string) => {
    if (v1Features.includes(feature)) {
      setV1Features(v1Features.filter((f) => f !== feature));
    } else {
      if (v1Features.length < 5) {
        setV1Features([...v1Features, feature]);
      }
    }
  };

  // Section 4: Screen Planning Actions
  const handleAddScreen = () => {
    const nextNum = screens.length + 1;
    const newScreen: ScreenItem = {
      id: Date.now().toString(),
      name: `Screen ${nextNum}: New Screen`,
      description: "",
    };
    setScreens([...screens, newScreen]);
  };

  const handleUpdateScreen = (id: string, field: "name" | "description", val: string) => {
    setScreens(
      screens.map((s) => (s.id === id ? { ...s, [field]: val } : s))
    );
  };

  const handleDeleteScreen = (id: string) => {
    if (screens.length > 1) {
      setScreens(screens.filter((s) => s.id !== id));
    }
  };

  // Section 5: User Journey Actions
  const handleAddJourneyStep = () => {
    if (newStepName.trim()) {
      setJourneySteps([
        ...journeySteps,
        { id: Date.now().toString(), name: newStepName.trim() },
      ]);
      setNewStepName("");
    }
  };

  const handleDeleteJourneyStep = (id: string) => {
    if (journeySteps.length > 1) {
      setJourneySteps(journeySteps.filter((j) => j.id !== id));
    }
  };

  const handleMoveJourneyStep = (index: number, direction: "left" | "right") => {
    if (
      (direction === "left" && index === 0) ||
      (direction === "right" && index === journeySteps.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    const updated = [...journeySteps];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setJourneySteps(updated);
  };

  // Section 6: Sketches Actions
  const handleImageUpload = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setSketches(
        sketches.map((sk) => (sk.id === id ? { ...sk, imageUrl: url } : sk))
      );
    };
    reader.readAsDataURL(file);
  };

  const toggleDrawLater = (id: string) => {
    setSketches(
      sketches.map((sk) => (sk.id === id ? { ...sk, drawLater: !sk.drawLater } : sk))
    );
  };

  // Section 7: Accordion Toggle
  const toggleAccordion = (accId: string) => {
    setExpandedAccordions((prev) => ({
      ...prev,
      [accId]: !prev[accId],
    }));
  };

  // Validation Criteria
  const isGoalValid = productGoal.trim().length > 0;
  const isUsersValid = selectedUsers.length > 0;
  const isImportanceValid = userImportance.trim().length > 0;
  const isFeaturesValid = v1Features.length >= 3;
  const isScreensValid =
    screens.length >= 3 && screens.every((s) => s.name.trim() && s.description.trim());
  const isJourneyValid = journeySteps.length >= 2;
  const isDecisionsValid = designDecisions.trim().length > 0;

  const isAllValid =
    isGoalValid &&
    isUsersValid &&
    isImportanceValid &&
    isFeaturesValid &&
    isScreensValid &&
    isJourneyValid &&
    isDecisionsValid;

  return (
    <div className="w-full text-zinc-900 font-sans antialiased selection:bg-teal-700 selection:text-white pb-20">
      {/* ============================================================ */}
      {/* PAGE HEADER                                                  */}
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
            <span>{isSaved ? "Design Saved!" : "Save Progress"}</span>
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* HERO SECTION (TWO-COLUMN WITH WIREFRAME 3D GRAPHIC)           */}
      {/* ============================================================ */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-14">
        <div className="lg:col-span-7 space-y-6 text-left">
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-mono font-semibold tracking-wider text-teal-800 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full uppercase">
              PHASE 3 OF 8 • DESIGN
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-zinc-900 tracking-tight leading-[1.08]">
            Design the Solution
          </h1>

          <p className="font-sans text-xl font-bold text-teal-800 tracking-tight">
            Turn your research into a product users will actually love.
          </p>

          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-sans max-w-2xl">
            Now define your product&apos;s goal, target users, Version 1 features, screen flow, and design decisions before planning development.
          </p>
        </div>

        {/* Right 3D Wireframe / Design Graphic */}
        <div className="lg:col-span-5 flex items-center justify-end relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-teal-100/60 via-amber-100/40 to-emerald-100/50 rounded-full blur-3xl -z-10 transform scale-125" />

          <div className="relative w-full max-w-xs aspect-square flex items-center justify-center">
            {/* Phone Wireframe Mockup */}
            <div className="relative z-10 w-44 h-64 bg-zinc-900 text-white rounded-3xl shadow-2xl p-4 flex flex-col justify-between border border-zinc-800 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="h-2 w-12 bg-teal-400 rounded" />
                <Grid className="h-3.5 w-3.5 text-teal-400" />
              </div>
              <div className="space-y-2 py-2">
                <div className="bg-zinc-800 border border-zinc-700/80 p-2.5 rounded-xl space-y-1">
                  <div className="h-2 w-20 bg-teal-500 rounded" />
                  <div className="h-1.5 w-28 bg-zinc-600 rounded" />
                </div>
                <div className="bg-emerald-600 p-2 rounded-lg text-[9px] font-mono font-bold text-center">
                  ✓ {problemData?.category || "Design"} Solution
                </div>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full" />
            </div>

            {/* Floating Palette Accent */}
            <div className="absolute -top-3 -right-2 z-20 bg-white border border-zinc-200/90 rounded-2xl p-3 shadow-lg flex items-center gap-2 transform rotate-12">
              <PenTool className="h-4 w-4 text-teal-700" />
              <span className="text-[10px] font-mono font-bold text-zinc-800">UX Wireframes</span>
            </div>

            {/* Floating Layers Accent */}
            <div className="absolute -bottom-4 -left-4 z-20 bg-white border border-zinc-200/90 rounded-2xl p-3.5 shadow-lg flex items-center gap-3 transform rotate-6">
              <div className="h-9 w-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-mono font-bold text-zinc-900">Version 1 Scope</p>
                <p className="text-[10px] text-teal-700 font-medium">5 Core Features</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-12">
        {/* ============================================================ */}
        {/* SECTION 1 — PRODUCT GOAL                                     */}
        {/* ============================================================ */}
        <section className="bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono font-bold text-teal-800 bg-teal-50 border border-teal-100 px-2.5 py-0.5 rounded uppercase">
                SECTION 1
              </span>
              <h2 className="font-serif text-2xl font-bold text-zinc-900 tracking-tight mt-1">
                Product Goal
              </h2>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              {productGoal.length} / 200
            </span>
          </div>

          <p className="text-xs text-zinc-500 font-sans">
            Describe in one sentence what your product is trying to achieve.
          </p>

          <textarea
            rows={3}
            maxLength={200}
            value={productGoal}
            onChange={(e) => setProductGoal(e.target.value)}
            placeholder="Type your product goal here..."
            className="w-full p-4 rounded-xl border border-zinc-200 text-xs sm:text-sm font-sans text-zinc-800 placeholder-zinc-400 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-all leading-relaxed"
          />
        </section>

        {/* ============================================================ */}
        {/* SECTION 2 — CORE USERS                                        */}
        {/* ============================================================ */}
        <section className="bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-6">
          <div>
            <span className="text-[11px] font-mono font-bold text-teal-800 bg-teal-50 border border-teal-100 px-2.5 py-0.5 rounded uppercase">
              SECTION 2
            </span>
            <h2 className="font-serif text-2xl font-bold text-zinc-900 tracking-tight mt-1">
              Core Users
            </h2>
          </div>

          {/* Question 1: Selectable chips */}
          <div className="space-y-3">
            <label className="block text-xs font-bold font-mono text-zinc-800 uppercase tracking-wider">
              Who will use your product? <span className="text-rose-600">*</span>
            </label>

            <div className="flex flex-wrap gap-2.5">
              {AVAILABLE_USER_CHIPS.map((chip) => {
                const isSelected = selectedUsers.includes(chip);
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      if (chip === "Other") {
                        setShowCustomRoleInput(!showCustomRoleInput);
                      } else {
                        toggleUserChip(chip);
                      }
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-sans font-medium transition-all border cursor-pointer ${
                      isSelected || (chip === "Other" && showCustomRoleInput)
                        ? "bg-teal-700 border-teal-800 text-white shadow-xs"
                        : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                    }`}
                  >
                    {isSelected ? "✓ " : ""}
                    {chip}
                  </button>
                );
              })}

              {/* Display custom user roles added */}
              {selectedUsers
                .filter((u) => !AVAILABLE_USER_CHIPS.includes(u))
                .map((user) => (
                  <span
                    key={user}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-teal-700 text-white text-xs font-sans font-medium"
                  >
                    ✓ {user}
                    <button
                      onClick={() => toggleUserChip(user)}
                      className="ml-1 hover:text-rose-200 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
            </div>

            {/* Custom User Role Input if "Other" clicked */}
            {showCustomRoleInput && (
              <div className="flex items-center gap-2 max-w-sm pt-1">
                <input
                  type="text"
                  value={customUserRole}
                  onChange={(e) => setCustomUserRole(e.target.value)}
                  placeholder="Specify custom user role..."
                  className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-300 text-xs font-sans focus:outline-none focus:border-teal-600"
                />
                <button
                  type="button"
                  onClick={handleAddCustomUser}
                  className="px-3 py-1.5 bg-teal-700 text-white rounded-lg text-xs font-semibold hover:bg-teal-800 transition-colors cursor-pointer"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          {/* Question 2: Multiline textarea */}
          <div className="space-y-2 pt-2 border-t border-zinc-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold font-mono text-zinc-800 uppercase tracking-wider">
                Why are these users important? <span className="text-rose-600">*</span>
              </label>
              <span className="text-xs font-mono text-zinc-400">
                {userImportance.length} / 300
              </span>
            </div>

            <textarea
              rows={3}
              maxLength={300}
              value={userImportance}
              onChange={(e) => setUserImportance(e.target.value)}
              placeholder="Explain the importance of your users..."
              className="w-full p-4 rounded-xl border border-zinc-200 text-xs sm:text-sm font-sans text-zinc-800 placeholder-zinc-400 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-all leading-relaxed"
            />
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 3 — FEATURE PRIORITIZATION                            */}
        {/* ============================================================ */}
        <section className="bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono font-bold text-teal-800 bg-teal-50 border border-teal-100 px-2.5 py-0.5 rounded uppercase">
                SECTION 3
              </span>
              <h2 className="font-serif text-2xl font-bold text-zinc-900 tracking-tight mt-1">
                Feature Prioritization
              </h2>
            </div>

            <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full">
              Version 1 ({v1Features.length} / 5 selected)
            </span>
          </div>

          <p className="text-xs text-zinc-500 font-sans">
            Which features are essential for Version 1? Select up to 5 core features.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Available Features */}
            <div className="p-5 bg-zinc-50/60 border border-zinc-200/80 rounded-xl space-y-3">
              <h3 className="font-mono text-xs font-bold text-zinc-700 uppercase tracking-wider">
                Available Features
              </h3>

              <div className="flex flex-wrap gap-2 pt-1">
                {AVAILABLE_FEATURES.map((feat) => {
                  const isSelected = v1Features.includes(feat);
                  const isMaxedOut = v1Features.length >= 5 && !isSelected;

                  return (
                    <button
                      key={feat}
                      type="button"
                      disabled={isMaxedOut}
                      onClick={() => toggleV1Feature(feat)}
                      className={`px-3 py-2 rounded-xl text-xs font-sans font-medium transition-all border ${
                        isSelected
                          ? "bg-emerald-100 border-emerald-300 text-emerald-950 opacity-60"
                          : isMaxedOut
                          ? "bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed"
                          : "bg-white border-zinc-200 text-zinc-700 hover:border-teal-300 hover:bg-teal-50/50 cursor-pointer"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {feat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Version 1 Selected Area */}
            <div className="p-5 bg-teal-50/30 border border-teal-200/80 rounded-xl space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-mono text-xs font-bold text-teal-900 uppercase tracking-wider">
                    Version 1 Scope
                  </h3>
                  <span className="text-[10px] font-mono text-teal-700">
                    Limit: 5 Features
                  </span>
                </div>

                {v1Features.length === 0 ? (
                  <div className="h-32 border-2 border-dashed border-teal-200 rounded-xl flex flex-col items-center justify-center text-center p-4 text-xs text-teal-700 font-sans">
                    <span>Click features on the left to add to Version 1</span>
                    <span className="text-[10px] text-teal-500 font-mono mt-1">
                      (Minimum 3 required)
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    {v1Features.map((feat, idx) => (
                      <div
                        key={feat}
                        className="flex items-center justify-between p-3 bg-white border border-teal-200 rounded-xl text-xs font-semibold text-teal-950 shadow-2xs"
                      >
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 rounded-full bg-teal-700 text-white text-[9px] font-mono flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          {feat}
                        </span>

                        <button
                          type="button"
                          onClick={() => toggleV1Feature(feat)}
                          className="text-zinc-400 hover:text-rose-600 cursor-pointer font-mono font-bold text-sm px-1.5"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {v1Features.length > 0 && (
                <p className="text-[10px] font-mono text-teal-700 text-right">
                  {5 - v1Features.length} remaining slot(s)
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 4 — SCREEN PLANNING                                  */}
        {/* ============================================================ */}
        <section className="bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono font-bold text-teal-800 bg-teal-50 border border-teal-100 px-2.5 py-0.5 rounded uppercase">
                SECTION 4
              </span>
              <h2 className="font-serif text-2xl font-bold text-zinc-900 tracking-tight mt-1">
                Screen Planning
              </h2>
            </div>

            <button
              type="button"
              onClick={handleAddScreen}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-white text-xs font-mono font-semibold transition-all cursor-pointer shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Screen</span>
            </button>
          </div>

          <p className="text-xs text-zinc-500 font-sans">
            How many screens does Version 1 need? Define screen titles and core UI details below.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {screens.map((scr, sIdx) => (
              <div
                key={scr.id}
                className="bg-zinc-50/60 border border-zinc-200/80 rounded-xl p-5 space-y-3 flex flex-col justify-between hover:border-zinc-300 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-teal-800 uppercase">
                      Screen {sIdx + 1}
                    </span>
                    {screens.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteScreen(scr.id)}
                        className="text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete Screen"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={scr.name}
                    onChange={(e) =>
                      handleUpdateScreen(scr.id, "name", e.target.value)
                    }
                    placeholder="Screen Name..."
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs font-bold text-zinc-900 bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <textarea
                    rows={4}
                    value={scr.description}
                    onChange={(e) =>
                      handleUpdateScreen(scr.id, "description", e.target.value)
                    }
                    placeholder="Describe UI layout and elements..."
                    className="w-full p-3 rounded-lg border border-zinc-200 text-xs font-sans text-zinc-800 placeholder-zinc-400 bg-white focus:outline-none focus:border-teal-500 transition-all leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 5 — USER JOURNEY                                     */}
        {/* ============================================================ */}
        <section className="bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-6">
          <div>
            <span className="text-[11px] font-mono font-bold text-teal-800 bg-teal-50 border border-teal-100 px-2.5 py-0.5 rounded uppercase">
              SECTION 5
            </span>
            <h2 className="font-serif text-2xl font-bold text-zinc-900 tracking-tight mt-1">
              User Journey
            </h2>
          </div>

          <p className="text-xs text-zinc-500 font-sans">
            What should happen after the user opens the app? Build your screen flow sequence below.
          </p>

          {/* Horizontal Journey Builder */}
          <div className="overflow-x-auto pb-4 pt-2">
            <div className="flex items-center gap-3 min-w-max">
              {journeySteps.map((step, idx) => (
                <React.Fragment key={step.id}>
                  {idx > 0 && (
                    <span className="text-teal-700 font-bold text-sm px-1 font-mono">
                      →
                    </span>
                  )}

                  <div className="p-4 bg-teal-50/50 border border-teal-200/80 rounded-2xl w-48 space-y-2 relative group shadow-2xs">
                    <div className="flex items-center justify-between text-[10px] font-mono text-teal-800 font-bold">
                      <span>STEP {idx + 1}</span>
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => handleMoveJourneyStep(idx, "left")}
                            className="hover:text-teal-900"
                            title="Move left"
                          >
                            <MoveLeft className="h-3 w-3" />
                          </button>
                        )}
                        {idx < journeySteps.length - 1 && (
                          <button
                            type="button"
                            onClick={() => handleMoveJourneyStep(idx, "right")}
                            className="hover:text-teal-900"
                            title="Move right"
                          >
                            <MoveRight className="h-3 w-3" />
                          </button>
                        )}
                        {journeySteps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteJourneyStep(step.id)}
                            className="hover:text-rose-600 ml-1"
                            title="Delete step"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    <input
                      type="text"
                      value={step.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setJourneySteps(
                          journeySteps.map((j) =>
                            j.id === step.id ? { ...j, name: val } : j
                          )
                        );
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-teal-200 bg-white text-xs font-semibold text-teal-950 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Add Step Input */}
          <div className="flex items-center gap-3 max-w-sm pt-2 border-t border-zinc-100">
            <input
              type="text"
              value={newStepName}
              onChange={(e) => setNewStepName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddJourneyStep();
                }
              }}
              placeholder="New step title..."
              className="flex-1 px-3 py-2 rounded-xl border border-zinc-300 text-xs font-sans focus:outline-none focus:border-teal-600"
            />
            <button
              type="button"
              onClick={handleAddJourneyStep}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-white text-xs font-mono font-semibold transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Step</span>
            </button>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 6 — LOW FIDELITY SKETCHES                           */}
        {/* ============================================================ */}
        <section className="bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-6">
          <div>
            <span className="text-[11px] font-mono font-bold text-teal-800 bg-teal-50 border border-teal-100 px-2.5 py-0.5 rounded uppercase">
              SECTION 6
            </span>
            <h2 className="font-serif text-2xl font-bold text-zinc-900 tracking-tight mt-1">
              Low-Fidelity Sketches
            </h2>
            <p className="text-xs text-zinc-500 font-sans mt-1">
              Sketch your key screens. Upload sketches created in any design tool or check &quot;Draw Later&quot;.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sketches.map((sk) => (
              <div
                key={sk.id}
                className="bg-zinc-50/60 border border-zinc-200/80 rounded-2xl p-5 space-y-4 flex flex-col justify-between items-center text-center"
              >
                <span className="text-xs font-mono font-bold text-zinc-800">
                  {sk.screenLabel}
                </span>

                {/* Phone Frame Container */}
                <div className="w-full aspect-[9/16] max-w-[190px] mx-auto bg-white border-2 border-zinc-300 rounded-3xl p-3 shadow-inner flex flex-col items-center justify-center relative overflow-hidden">
                  {sk.imageUrl ? (
                    <img
                      src={sk.imageUrl}
                      alt={sk.screenLabel}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : sk.drawLater ? (
                    <div className="space-y-2 text-center p-2">
                      <PenTool className="h-6 w-6 text-amber-600 mx-auto" />
                      <span className="text-[10px] font-mono font-bold text-amber-800 block">
                        Will Draw Later
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3 text-center p-2">
                      <Smartphone className="h-8 w-8 text-zinc-300 mx-auto" />
                      <p className="text-[10px] text-zinc-400 font-sans">
                        No sketch uploaded
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Controls */}
                <div className="space-y-2 w-full">
                  <label className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-sans font-medium text-zinc-700 cursor-pointer shadow-2xs">
                    <Upload className="h-3.5 w-3.5 text-teal-700" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleImageUpload(sk.id, e.target.files[0]);
                        }
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => toggleDrawLater(sk.id)}
                    className={`w-full py-1.5 px-3 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                      sk.drawLater
                        ? "bg-amber-100 border border-amber-300 text-amber-900 font-bold"
                        : "bg-transparent text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    {sk.drawLater ? "✓ Draw Later Selected" : "Or Check Draw Later"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 7 — DESIGN DECISIONS                                 */}
        {/* ============================================================ */}
        <section className="bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono font-bold text-teal-800 bg-teal-50 border border-teal-100 px-2.5 py-0.5 rounded uppercase">
                SECTION 7
              </span>
              <h2 className="font-serif text-2xl font-bold text-zinc-900 tracking-tight mt-1">
                Design Decisions
              </h2>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              {designDecisions.length} / 500
            </span>
          </div>

          <p className="text-xs text-zinc-500 font-sans">
            Why did you choose this design? Explore key design prompts below.
          </p>

          {/* Expandable Accordions */}
          <div className="space-y-3">
            {[
              { id: "a1", question: "Why did you choose this flow?", hint: "Focus on single-tap dose confirmation to eliminate senior cognitive friction." },
              { id: "a2", question: "Why these features for Version 1?", hint: "Targeting high-impact essentials: 1-tap logging, dose reminders, and caregiver escalation." },
              { id: "a3", question: "Why this navigation?", hint: "Simple 3-screen linear flow prioritizing daily doses over complex settings." },
              { id: "a4", question: "What problem does this design solve?", hint: "Solves forgotten doses, double-dosing hazards, and caregiver check-in anxiety." },
            ].map((acc) => {
              const isExpanded = expandedAccordions[acc.id];
              return (
                <div key={acc.id} className="border border-zinc-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleAccordion(acc.id)}
                    className="w-full flex items-center justify-between p-4 bg-zinc-50/70 hover:bg-zinc-100/60 text-left text-xs sm:text-sm font-bold text-zinc-900 transition-colors cursor-pointer"
                  >
                    <span>{acc.question}</span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-zinc-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-zinc-500" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-4 bg-white border-t border-zinc-100 text-xs text-zinc-600 font-sans leading-relaxed">
                      <p className="font-medium text-teal-800">Key Focus Prompt:</p>
                      <p className="mt-1">{acc.hint}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Large Textarea */}
          <div className="pt-2">
            <label className="block text-xs font-bold font-mono text-zinc-800 uppercase tracking-wider mb-2">
              Design Decisions Explanation <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={4}
              maxLength={500}
              value={designDecisions}
              onChange={(e) => setDesignDecisions(e.target.value)}
              placeholder="Explain your design decisions..."
              className="w-full p-4 rounded-xl border border-zinc-200 text-xs sm:text-sm font-sans text-zinc-800 placeholder-zinc-400 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-all leading-relaxed"
            />
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 8 — VERSION 1 BLUEPRINT SUMMARY CARD                 */}
        {/* ============================================================ */}
        <section className="bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono font-bold text-teal-800 bg-teal-50 border border-teal-100 px-2.5 py-0.5 rounded uppercase">
                SECTION 8
              </span>
              <h2 className="font-serif text-2xl font-bold text-zinc-900 tracking-tight mt-1">
                Version 1 Blueprint
              </h2>
            </div>
            {isAllValid ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Blueprint Ready
              </span>
            ) : (
              <span className="text-xs font-mono text-zinc-400">Drafting</span>
            )}
          </div>

          {!isAllValid ? (
            <div className="p-8 border-2 border-dashed border-zinc-200 rounded-2xl text-center space-y-2 bg-zinc-50/40">
              <Layout className="h-8 w-8 text-zinc-300 mx-auto" />
              <p className="text-xs font-semibold text-zinc-600">
                Complete the above sections to generate your Version 1 Blueprint.
              </p>
              <p className="text-[11px] text-zinc-400 font-mono">
                Fill in Goal, Core Users, 3+ Features, 3+ Screens, Journey, and Decisions.
              </p>
            </div>
          ) : (
            <div className="p-6 bg-teal-50/40 border border-teal-200/80 rounded-2xl space-y-4 text-xs font-sans">
              <div className="flex items-center justify-between border-b border-teal-200/60 pb-3">
                <span className="font-bold text-sm text-teal-950 font-serif">
                  Medication Reminder App — Version 1 Blueprint
                </span>
                <span className="text-[10px] font-mono text-teal-800 font-bold bg-teal-100 px-2 py-0.5 rounded uppercase">
                  VERIFIED DESIGN SCOPE
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="font-mono text-[10px] text-teal-800 font-bold uppercase">PRODUCT GOAL:</p>
                  <p className="text-zinc-800 mt-0.5">{productGoal}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-teal-800 font-bold uppercase">TARGET USERS:</p>
                  <p className="text-zinc-800 mt-0.5">{selectedUsers.join(", ")}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-teal-800 font-bold uppercase">V1 FEATURES ({v1Features.length}):</p>
                  <p className="text-zinc-800 mt-0.5">{v1Features.join(" • ")}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-teal-800 font-bold uppercase">SCREEN SCOPE ({screens.length} Screens):</p>
                  <p className="text-zinc-800 mt-0.5">{screens.map((s) => s.name).join(" • ")}</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ============================================================ */}
        {/* BOTTOM ACTION & VALIDATION                                   */}
        {/* ============================================================ */}
        <footer className="flex flex-col items-center justify-center space-y-4 pt-4 text-center">
          {!isAllValid && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 max-w-md w-full text-left space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Complete the following to proceed:</span>
              </div>
              <ul className="list-disc list-inside text-[11px] space-y-0.5 pl-5 text-amber-800">
                {!isGoalValid && <li>Product Goal statement</li>}
                {(!isUsersValid || !isImportanceValid) && <li>Core Users selection & importance</li>}
                {!isFeaturesValid && <li>At least 3 Version 1 features (currently {v1Features.length}/3)</li>}
                {!isScreensValid && <li>At least 3 completed screen plans</li>}
                {!isJourneyValid && <li>User journey flow</li>}
                {!isDecisionsValid && <li>Design decisions explanation</li>}
              </ul>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              if (!isAllValid) return;
              persistData();
              onComplete();
            }}
            disabled={!isAllValid}
            className={`inline-flex items-center gap-3 px-10 py-4 rounded-full font-semibold font-sans text-base transition-all shadow-md ${
              isAllValid
                ? "bg-teal-800 hover:bg-teal-700 text-white cursor-pointer hover:shadow-lg hover:scale-105"
                : "bg-zinc-200 text-zinc-400 cursor-not-allowed border border-zinc-300 shadow-none"
            }`}
          >
            <span>Continue to Planning →</span>
          </button>
        </footer>
      </div>
    </div>
  );
}
