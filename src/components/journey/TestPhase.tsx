"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookmarkCheck,
  CheckCircle2,
  Plus,
  Trash2,
  ClipboardCheck,
  Search,
  ChevronDown,
  ShieldCheck,
  Bug,
} from "lucide-react";

import { ProblemData } from "@/lib/problemContent";

interface TestPhaseProps {
  onComplete: () => void;
  onBackToJourney?: () => void;
  problemData?: ProblemData | null;
  userId?: string;
}

export interface TestScenario {
  id: string;
  feature: string;
  expectedResult: string;
  actualResult: string;
  status: "Pass" | "Fail" | null;
}

// Empty generic test scenarios — no problem-specific content
const EMPTY_SCENARIOS: TestScenario[] = [
  {
    id: "sc1",
    feature: "",
    expectedResult: "",
    actualResult: "",
    status: "Pass",
  },
  {
    id: "sc2",
    feature: "",
    expectedResult: "",
    actualResult: "",
    status: "Pass",
  },
  {
    id: "sc3",
    feature: "",
    expectedResult: "",
    actualResult: "",
    status: "Pass",
  },
];

export default function TestPhase({
  onComplete,
  onBackToJourney,
  problemData,
  userId,
}: TestPhaseProps) {
  const pid = problemData?.problemId ?? "";
  const effectiveUserId = (userId || "default_user").toString().trim().toLowerCase();
  const storageKey = pid && effectiveUserId ? `makemistakes_test_${effectiveUserId}_${pid}` : null;

  // Section 1: Test Objective
  const [whatValidating, setWhatValidating] = useState("");
  const [goalOfTest, setGoalOfTest] = useState("");

  // Section 2: Test Scenarios
  const [scenarios, setScenarios] = useState<TestScenario[]>(EMPTY_SCENARIOS);

  // Section 3: Test Environment
  const [device, setDevice] = useState("iPhone 13");
  const [browser, setBrowser] = useState("Chrome");
  const [operatingSystem, setOperatingSystem] = useState("iOS 17");
  const [networkCondition, setNetworkCondition] = useState("WiFi (High Speed)");
  const [testingMethod, setTestingMethod] = useState("Manual Testing");

  // Section 4: Improvements Found
  const [improvementsFound, setImprovementsFound] = useState("");

  // Section 5: Final Validation Summary
  const [finalSummary, setFinalSummary] = useState("");

  // Save Progress State
  const [isSaved, setIsSaved] = useState(false);

  // Load from Server API + localStorage fallback
  useEffect(() => {
    // Step 1: Reset ALL state to empty defaults (clears previous problem's data)
    setWhatValidating("");
    setGoalOfTest("");
    setScenarios(EMPTY_SCENARIOS);
    setDevice("iPhone 13");
    setBrowser("Chrome");
    setOperatingSystem("iOS 17");
    setNetworkCondition("WiFi (High Speed)");
    setTestingMethod("Manual Testing");
    setImprovementsFound("");
    setFinalSummary("");
    setIsSaved(false);

    if (!pid) return;

    let isSubscribed = true;

    async function loadData() {
      try {
        const res = await fetch(`/api/journey/user-data?userId=${encodeURIComponent(effectiveUserId)}&problemId=${encodeURIComponent(pid)}`);
        if (res.ok) {
          const json = await res.json();
          const tData = json?.phases?.test;
          if (isSubscribed && tData) {
            if (tData.whatValidating) setWhatValidating(tData.whatValidating);
            if (tData.goalOfTest) setGoalOfTest(tData.goalOfTest);
            if (Array.isArray(tData.scenarios) && tData.scenarios.length > 0) setScenarios(tData.scenarios);
            if (tData.device) setDevice(tData.device);
            if (tData.browser) setBrowser(tData.browser);
            if (tData.operatingSystem) setOperatingSystem(tData.operatingSystem);
            if (tData.networkCondition) setNetworkCondition(tData.networkCondition);
            if (tData.testingMethod) setTestingMethod(tData.testingMethod);
            if (tData.improvementsFound) setImprovementsFound(tData.improvementsFound);
            if (tData.finalSummary) setFinalSummary(tData.finalSummary);
            return;
          }
        }
      } catch (err) {
        console.warn("[TestPhase] Server load warning:", err);
      }

      // Fallback to local storage
      if (storageKey) {
        try {
          const saved = localStorage.getItem(storageKey);
          if (saved && isSubscribed) {
            const parsed = JSON.parse(saved);
            if (parsed.whatValidating) setWhatValidating(parsed.whatValidating);
            if (parsed.goalOfTest) setGoalOfTest(parsed.goalOfTest);
            if (Array.isArray(parsed.scenarios)) setScenarios(parsed.scenarios);
            if (parsed.device) setDevice(parsed.device);
            if (parsed.browser) setBrowser(parsed.browser);
            if (parsed.operatingSystem) setOperatingSystem(parsed.operatingSystem);
            if (parsed.networkCondition) setNetworkCondition(parsed.networkCondition);
            if (parsed.testingMethod) setTestingMethod(parsed.testingMethod);
            if (parsed.improvementsFound) setImprovementsFound(parsed.improvementsFound);
            if (parsed.finalSummary) setFinalSummary(parsed.finalSummary);
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
      whatValidating,
      goalOfTest,
      scenarios,
      device,
      browser,
      operatingSystem,
      networkCondition,
      testingMethod,
      improvementsFound,
      finalSummary,
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
        phase: "test",
        data: payload,
      }),
    }).catch((err) => console.warn("[TestPhase] Server save warning:", err));
  };

  const handleSaveProgress = () => {
    persistData();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Scenario Handlers
  const handleAddScenario = () => {
    setScenarios([
      ...scenarios,
      {
        id: Date.now().toString(),
        feature: "",
        expectedResult: "",
        actualResult: "",
        status: null,
      },
    ]);
  };

  const handleUpdateScenario = (
    id: string,
    field: keyof TestScenario,
    value: any
  ) => {
    setScenarios(
      scenarios.map((sc) => (sc.id === id ? { ...sc, [field]: value } : sc))
    );
  };

  const handleDeleteScenario = (id: string) => {
    setScenarios(scenarios.filter((sc) => sc.id !== id));
  };

  // Validation Checks
  const isObjectiveValid =
    whatValidating.trim().length > 0 && goalOfTest.trim().length > 0;
  const isScenariosValid =
    scenarios.length >= 3 &&
    scenarios.every(
      (s) =>
        s.feature.trim().length > 0 &&
        s.expectedResult.trim().length > 0 &&
        s.actualResult.trim().length > 0 &&
        s.status !== null
    );
  const isEnvironmentValid =
    device.trim().length > 0 &&
    browser.trim().length > 0 &&
    operatingSystem.trim().length > 0 &&
    networkCondition.trim().length > 0 &&
    testingMethod.trim().length > 0;
  const isImprovementsValid = improvementsFound.trim().length > 0;
  const isFinalSummaryValid = finalSummary.trim().length > 0;

  const isAllValid =
    isObjectiveValid &&
    isScenariosValid &&
    isEnvironmentValid &&
    isImprovementsValid &&
    isFinalSummaryValid;

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
            <span>{isSaved ? "Test Plan Saved!" : "Save Progress"}</span>
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* HERO SECTION                                                 */}
      {/* ============================================================ */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-14">
        <div className="lg:col-span-8 space-y-6 text-left">
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-mono font-semibold tracking-wider text-teal-800 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full uppercase">
              PHASE 6 OF 7 • TEST
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-zinc-900 tracking-tight leading-[1.08]">
            Validate the Product
          </h1>

          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-sans max-w-2xl">
            Teach quality assurance. Verify reliability, notification delivery accuracy, and edge-case handling before launching to users.
          </p>
        </div>

        {/* Right 3D QA Illustration */}
        <div className="lg:col-span-4 flex items-center justify-end relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-teal-100/60 via-amber-100/40 to-emerald-100/50 rounded-full blur-3xl -z-10 transform scale-125" />

          <div className="relative w-full max-w-xs aspect-square flex items-center justify-center">
            {/* 3D Clipboard Container */}
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
                <span>QA Audit</span>
                <span className="text-teal-700 font-bold">{scenarios.length} Scenarios</span>
              </div>
            </div>

            {/* Magnifying Glass Accent */}
            <div className="absolute -top-3 -right-2 z-20 bg-white border border-zinc-200/90 rounded-2xl p-3 shadow-lg flex items-center gap-2 transform rotate-12">
              <Search className="h-4 w-4 text-teal-700" />
              <Bug className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2-COLUMN GRID WORKSHEET (LAYOUT AS SHOWN IN REFERENCE PHOTO) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        {/* ------------------------------------------------------------ */}
        {/* LEFT SIDE: CARD 1 (Test Objective) & CARD 3 (Test Environment)*/}
        {/* ------------------------------------------------------------ */}
        <div className="lg:col-span-6 space-y-8">
          {/* CARD 1 — TEST OBJECTIVE */}
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="h-7 w-7 rounded-full bg-teal-100 text-teal-800 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <h2 className="font-serif text-xl font-bold text-zinc-900 tracking-tight">
                  Test Objective
                </h2>
              </div>
              <p className="text-xs text-zinc-500 font-sans leading-relaxed">
                Define what you are testing and the goal of this phase.
              </p>
            </div>

            {/* What are you validating? */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold font-mono text-zinc-800 uppercase tracking-wider">
                  What are you validating?
                </label>
                <span className="text-xs font-mono text-zinc-400">
                  {whatValidating.length} / 200
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={200}
                value={whatValidating}
                onChange={(e) => setWhatValidating(e.target.value)}
                placeholder="e.g. Notifications, reminders, sync, edge cases..."
                className="w-full p-4 rounded-xl border border-zinc-200 text-xs sm:text-sm font-sans text-zinc-800 placeholder-zinc-400 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-all leading-relaxed"
              />
            </div>

            {/* Goal of this test phase */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-100">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold font-mono text-zinc-800 uppercase tracking-wider">
                  Goal of this test phase
                </label>
                <span className="text-xs font-mono text-zinc-400">
                  {goalOfTest.length} / 200
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={200}
                value={goalOfTest}
                onChange={(e) => setGoalOfTest(e.target.value)}
                placeholder="e.g. Ensure reminders are accurate and users never miss a dose."
                className="w-full p-4 rounded-xl border border-zinc-200 text-xs sm:text-sm font-sans text-zinc-800 placeholder-zinc-400 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-all leading-relaxed"
              />
            </div>
          </div>

          {/* CARD 3 — TEST ENVIRONMENT */}
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="h-7 w-7 rounded-full bg-teal-100 text-teal-800 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <h2 className="font-serif text-xl font-bold text-zinc-900 tracking-tight">
                  Test Environment
                </h2>
              </div>
              <p className="text-xs text-zinc-500 font-sans leading-relaxed">
                Where and how did you test the product?
              </p>
            </div>

            <div className="space-y-4">
              {/* Row 1: Device, Browser, OS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold font-mono text-zinc-800">
                    Device
                  </label>
                  <div className="relative">
                    <select
                      value={device}
                      onChange={(e) => setDevice(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-sans text-zinc-800 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="iPhone 13">iPhone 13</option>
                      <option value="Android 12">Android 12</option>
                      <option value="MacBook Pro">MacBook Pro</option>
                      <option value="Windows PC">Windows PC</option>
                      <option value="iPad Pro">iPad Pro</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold font-mono text-zinc-800">
                    Browser
                  </label>
                  <div className="relative">
                    <select
                      value={browser}
                      onChange={(e) => setBrowser(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-sans text-zinc-800 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="Chrome">Chrome</option>
                      <option value="Safari">Safari</option>
                      <option value="Firefox">Firefox</option>
                      <option value="Edge">Edge</option>
                      <option value="Mobile Safari">Mobile Safari</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold font-mono text-zinc-800">
                    Operating System
                  </label>
                  <div className="relative">
                    <select
                      value={operatingSystem}
                      onChange={(e) => setOperatingSystem(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-sans text-zinc-800 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="iOS 17">iOS 17</option>
                      <option value="Android 14">Android 14</option>
                      <option value="macOS Sonoma">macOS Sonoma</option>
                      <option value="Windows 11">Windows 11</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Row 2: Network Condition, Testing Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold font-mono text-zinc-800">
                    Network Condition
                  </label>
                  <div className="relative">
                    <select
                      value={networkCondition}
                      onChange={(e) => setNetworkCondition(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-sans text-zinc-800 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="WiFi (High Speed)">WiFi (High Speed)</option>
                      <option value="4G / 5G LTE">4G / 5G LTE</option>
                      <option value="Slow 3G Network">Slow 3G Network</option>
                      <option value="Offline Mode">Offline Mode</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold font-mono text-zinc-800">
                    Testing Method
                  </label>
                  <div className="relative">
                    <select
                      value={testingMethod}
                      onChange={(e) => setTestingMethod(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-sans text-zinc-800 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="Manual Testing">Manual Testing</option>
                      <option value="Exploratory Testing">Exploratory Testing</option>
                      <option value="Automated Script">Automated Script</option>
                      <option value="User Acceptance Test">User Acceptance Test</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* RIGHT SIDE: CARD 2 (Test Scenarios Builder)                  */}
        {/* ------------------------------------------------------------ */}
        <div className="lg:col-span-6 bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="h-7 w-7 rounded-full bg-teal-100 text-teal-800 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <h2 className="font-serif text-xl font-bold text-zinc-900 tracking-tight">
                    Test Scenarios
                  </h2>
                  <p className="text-xs text-zinc-500 font-sans">
                    Create test scenarios and record results.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddScenario}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-mono font-semibold text-teal-800 shadow-2xs transition-all cursor-pointer shrink-0"
              >
                <Plus className="h-3.5 w-3.5 text-teal-700" />
                <span>Add Scenario</span>
              </button>
            </div>

            {/* Scenario Cards List */}
            {scenarios.length === 0 ? (
              <div className="py-12 border-2 border-dashed border-zinc-200 rounded-2xl text-center space-y-2 bg-zinc-50/40">
                <ClipboardCheck className="h-9 w-9 text-zinc-400 mx-auto" />
                <p className="text-xs font-bold text-zinc-700">No scenarios added yet.</p>
                <p className="text-[11px] font-mono text-zinc-400">Add at least 3 scenarios.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
                {scenarios.map((sc, idx) => (
                  <div
                    key={sc.id}
                    className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/40 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between border-b border-zinc-200/60 pb-2">
                      <span className="text-xs font-bold font-mono text-zinc-800">
                        Scenario {idx + 1}
                      </span>
                      {scenarios.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteScenario(sc.id)}
                          className="p-1 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete Scenario"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Feature / Functionality */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold font-mono text-zinc-700">
                        Feature / Functionality
                      </label>
                      <input
                        type="text"
                        value={sc.feature}
                        onChange={(e) =>
                          handleUpdateScenario(sc.id, "feature", e.target.value)
                        }
                        placeholder="e.g. Schedule a reminder"
                        className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-sans text-zinc-800 placeholder-zinc-400 bg-white focus:border-teal-500 focus:outline-none"
                      />
                    </div>

                    {/* Expected Result */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold font-mono text-zinc-700">
                        Expected Result
                      </label>
                      <input
                        type="text"
                        value={sc.expectedResult}
                        onChange={(e) =>
                          handleUpdateScenario(sc.id, "expectedResult", e.target.value)
                        }
                        placeholder="e.g. Reminder should be delivered on time"
                        className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-sans text-zinc-800 placeholder-zinc-400 bg-white focus:border-teal-500 focus:outline-none"
                      />
                    </div>

                    {/* Actual Result */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold font-mono text-zinc-700">
                        Actual Result
                      </label>
                      <input
                        type="text"
                        value={sc.actualResult}
                        onChange={(e) =>
                          handleUpdateScenario(sc.id, "actualResult", e.target.value)
                        }
                        placeholder="e.g. Describe what actually happened"
                        className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-sans text-zinc-800 placeholder-zinc-400 bg-white focus:border-teal-500 focus:outline-none"
                      />
                    </div>

                    {/* Status Radio Options */}
                    <div className="space-y-1 pt-1">
                      <label className="block text-[11px] font-bold font-mono text-zinc-700">
                        Status
                      </label>
                      <div className="flex items-center gap-6 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-800">
                          <input
                            type="radio"
                            name={`status-${sc.id}`}
                            checked={sc.status === "Pass"}
                            onChange={() =>
                              handleUpdateScenario(sc.id, "status", "Pass")
                            }
                            className="h-3.5 w-3.5 text-teal-700 border-zinc-300 focus:ring-teal-500 cursor-pointer"
                          />
                          <span>Pass</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-800">
                          <input
                            type="radio"
                            name={`status-${sc.id}`}
                            checked={sc.status === "Fail"}
                            onChange={() =>
                              handleUpdateScenario(sc.id, "status", "Fail")
                            }
                            className="h-3.5 w-3.5 text-rose-600 border-zinc-300 focus:ring-rose-500 cursor-pointer"
                          />
                          <span>Fail</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* PROBLEM KNOWLEDGE VERIFICATION QUIZ SECTION                   */}
      {/* ============================================================ */}
      {problemData?.quiz && problemData.quiz.length > 0 && (
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-6 mb-10">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 rounded-full bg-teal-100 text-teal-800 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                Q
              </span>
              <div>
                <h2 className="font-serif text-xl font-bold text-zinc-900 tracking-tight">
                  Problem Knowledge Verification Quiz
                </h2>
                <p className="text-xs text-zinc-500 font-sans">
                  Targeted questions from {pid || "problem"} dataset ({problemData.quiz.length} Questions)
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
              {pid} Quiz
            </span>
          </div>

          <div className="space-y-6">
            {problemData.quiz.map((q, idx) => (
              <div key={q.id || idx} className="p-4 sm:p-5 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-3">
                <h3 className="text-xs sm:text-sm font-bold text-zinc-900 font-sans leading-snug">
                  Q{idx + 1}: {q.question}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {q.options.map((opt: string, optIdx: number) => {
                    const isCorrect = optIdx === q.correctIndex;
                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-xl border text-xs font-sans flex items-start gap-2 ${
                          isCorrect
                            ? "bg-emerald-50/80 border-emerald-300 text-emerald-950 font-semibold shadow-2xs"
                            : "bg-white border-zinc-200 text-zinc-700"
                        }`}
                      >
                        <span className={`font-mono font-bold shrink-0 ${isCorrect ? "text-emerald-700" : "text-zinc-500"}`}>
                          Option {String.fromCharCode(65 + optIdx)}:
                        </span>
                        <span>{opt}</span>
                      </div>
                    );
                  })}
                </div>
                {q.explanation && (
                  <p className="text-[11px] text-zinc-600 font-sans italic bg-white p-3 rounded-xl border border-zinc-200/80">
                    <span className="font-bold font-mono text-teal-700 uppercase not-italic mr-1.5">Explanation:</span>
                    {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* BOTTOM ROW: CARD 4 (Improvements Found) & CARD 5 (Final Summary) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        {/* CARD 4 — IMPROVEMENTS FOUND */}
        <div className="lg:col-span-6 bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="h-7 w-7 rounded-full bg-teal-100 text-teal-800 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                  4
                </span>
                <h2 className="font-serif text-xl font-bold text-zinc-900 tracking-tight">
                  Improvements Found
                </h2>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                {improvementsFound.length} / 400
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-sans leading-relaxed">
              What issues or improvements did you notice while testing?
            </p>
          </div>

          <div className="pt-1 flex-1">
            <textarea
              rows={4}
              maxLength={400}
              value={improvementsFound}
              onChange={(e) => setImprovementsFound(e.target.value)}
              placeholder="Write your observations and improvement suggestions..."
              className="w-full h-full p-4 rounded-xl border border-zinc-200 text-xs sm:text-sm font-sans text-zinc-800 placeholder-zinc-400 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-all leading-relaxed resize-y"
            />
          </div>
        </div>

        {/* CARD 5 — FINAL VALIDATION SUMMARY */}
        <div className="lg:col-span-6 bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="h-7 w-7 rounded-full bg-teal-100 text-teal-800 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                  5
                </span>
                <h2 className="font-serif text-xl font-bold text-zinc-900 tracking-tight">
                  Final Validation Summary
                </h2>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                {finalSummary.length} / 300
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-sans leading-relaxed">
              What did you learn after testing? Are you confident to launch?
            </p>
          </div>

          <div className="pt-1 flex-1">
            <textarea
              rows={4}
              maxLength={300}
              value={finalSummary}
              onChange={(e) => setFinalSummary(e.target.value)}
              placeholder="Write your final summary..."
              className="w-full h-full p-4 rounded-xl border border-zinc-200 text-xs sm:text-sm font-sans text-zinc-800 placeholder-zinc-400 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-all leading-relaxed resize-y"
            />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* BOTTOM VALIDATION ALERT BAR & PRIMARY BUTTON                 */}
      {/* ============================================================ */}
      <footer className="space-y-6">
        {/* Full Width Bottom Validation Alert Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/60 border border-teal-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5 text-teal-700" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-teal-950 font-serif">
                Complete all sections to continue
              </p>
              <p className="text-[11px] text-teal-700 font-sans">
                Make sure you&apos;ve filled out everything before moving to the next phase.
              </p>
            </div>
          </div>

          {/* 5 Checklist Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span
              className={`px-3 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${
                isObjectiveValid
                  ? "bg-emerald-100 border-emerald-300 text-emerald-800 font-bold"
                  : "bg-white border-zinc-200 text-zinc-500"
              }`}
            >
              {isObjectiveValid ? "✓" : "○"} Test Objective
            </span>

            <span
              className={`px-3 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${
                isScenariosValid
                  ? "bg-emerald-100 border-emerald-300 text-emerald-800 font-bold"
                  : "bg-white border-zinc-200 text-zinc-500"
              }`}
            >
              {isScenariosValid ? "✓" : "○"} Min. 3 Scenarios
            </span>

            <span
              className={`px-3 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${
                isEnvironmentValid
                  ? "bg-emerald-100 border-emerald-300 text-emerald-800 font-bold"
                  : "bg-white border-zinc-200 text-zinc-500"
              }`}
            >
              {isEnvironmentValid ? "✓" : "○"} Test Environment
            </span>

            <span
              className={`px-3 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${
                isImprovementsValid
                  ? "bg-emerald-100 border-emerald-300 text-emerald-800 font-bold"
                  : "bg-white border-zinc-200 text-zinc-500"
              }`}
            >
              {isImprovementsValid ? "✓" : "○"} Improvements
            </span>

            <span
              className={`px-3 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${
                isFinalSummaryValid
                  ? "bg-emerald-100 border-emerald-300 text-emerald-800 font-bold"
                  : "bg-white border-zinc-200 text-zinc-500"
              }`}
            >
              {isFinalSummaryValid ? "✓" : "○"} Final Summary
            </span>
          </div>
        </div>

        {/* Primary CTA Button */}
        <div className="flex justify-center">
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
            <span>Continue to Push to GitHub →</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
