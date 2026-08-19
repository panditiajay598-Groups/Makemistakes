"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookmarkCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Rocket,
  Server,
  Globe,
  ChevronDown,
  Info,
  ShieldCheck,
  Sliders,
  Terminal,
} from "lucide-react";

import { ProblemData } from "@/lib/problemContent";

interface LaunchPhaseProps {
  onComplete: () => void;
  onBackToJourney?: () => void;
  problemData?: ProblemData | null;
}

export interface DeploymentChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface MonitoringToolItem {
  id: string;
  name: string;
  purpose: string;
  configured: boolean;
}

const INITIAL_CHECKLIST: DeploymentChecklistItem[] = [
  { id: "d1", text: "Application deployed to production", checked: false },
  { id: "d2", text: "Domain connected & SSL enabled", checked: false },
  { id: "d3", text: "Environment variables configured", checked: false },
  { id: "d4", text: "Database backups enabled", checked: false },
  { id: "d5", text: "Push notifications configured", checked: false },
  { id: "d6", text: "Error logging & monitoring enabled", checked: false },
  { id: "d7", text: "Final smoke test passed", checked: false },
];

const INITIAL_MONITORING_TOOLS: MonitoringToolItem[] = [
  { id: "m1", name: "Uptime Monitoring", purpose: "Track API uptime and 99.9% availability SLA", configured: false },
  { id: "m2", name: "Error Tracking", purpose: "Capture runtime JS/API crash tracebacks", configured: false },
  { id: "m3", name: "Performance Monitoring", purpose: "Monitor server response latency and DB query speed", configured: false },
  { id: "m4", name: "User Analytics", purpose: "Track active users and key business metrics", configured: false },
];

export default function LaunchPhase({
  onComplete,
  onBackToJourney,
  problemData,
}: LaunchPhaseProps) {
  const pid = problemData?.problemId ?? "";
  const storageKey = pid ? `makemistakes_launch_v2_data_${pid}` : null;
  // Section 1: Deployment Checklist
  const [checklist, setChecklist] = useState<DeploymentChecklistItem[]>(INITIAL_CHECKLIST);

  // Section 2: Launch Configuration
  const [productionUrl, setProductionUrl] = useState("");
  const [domainName, setDomainName] = useState("");
  const [hostingProvider, setHostingProvider] = useState("Vercel");
  const [regionDataCenter, setRegionDataCenter] = useState("us-east-1 (N. Virginia)");
  const [deploymentMethod, setDeploymentMethod] = useState("Git Push / CI/CD Pipeline");
  const [environmentType, setEnvironmentType] = useState("Production");
  const [deploymentNotes, setDeploymentNotes] = useState("");

  // Section 3: Monitoring & Maintenance
  const [monitoringTools, setMonitoringTools] = useState<MonitoringToolItem[]>(INITIAL_MONITORING_TOOLS);

  // Section 4: Initial User Onboarding Plan
  const [onboardingPlan, setOnboardingPlan] = useState("");

  // Section 5: Release Notes & Announcements
  const [releaseNotes, setReleaseNotes] = useState("");

  // Section 6: Launch Risks & Mitigation
  const [launchRisks, setLaunchRisks] = useState("");

  // Save Progress State
  const [isSaved, setIsSaved] = useState(false);

  // Load from localStorage — ALWAYS reset state first, then load problem-specific data
  useEffect(() => {
    // Step 1: Reset ALL state to defaults (clears previous problem's data)
    setChecklist(INITIAL_CHECKLIST);
    setProductionUrl("");
    setDomainName("");
    setHostingProvider("Vercel");
    setRegionDataCenter("us-east-1 (N. Virginia)");
    setDeploymentMethod("Git Push / CI/CD Pipeline");
    setEnvironmentType("Production");
    setDeploymentNotes("");
    setMonitoringTools(INITIAL_MONITORING_TOOLS);
    setOnboardingPlan("");
    setReleaseNotes("");
    setLaunchRisks("");
    setIsSaved(false);

    // Step 2: Load saved data for THIS specific problem (if exists)
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.checklist)) setChecklist(parsed.checklist);
        if (parsed.productionUrl) setProductionUrl(parsed.productionUrl);
        if (parsed.domainName) setDomainName(parsed.domainName);
        if (parsed.hostingProvider) setHostingProvider(parsed.hostingProvider);
        if (parsed.regionDataCenter) setRegionDataCenter(parsed.regionDataCenter);
        if (parsed.deploymentMethod) setDeploymentMethod(parsed.deploymentMethod);
        if (parsed.environmentType) setEnvironmentType(parsed.environmentType);
        if (parsed.deploymentNotes) setDeploymentNotes(parsed.deploymentNotes);
        if (Array.isArray(parsed.monitoringTools)) setMonitoringTools(parsed.monitoringTools);
        if (parsed.onboardingPlan) setOnboardingPlan(parsed.onboardingPlan);
        if (parsed.releaseNotes) setReleaseNotes(parsed.releaseNotes);
        if (parsed.launchRisks) setLaunchRisks(parsed.launchRisks);
      }
    } catch (e) {
      console.warn("Failed to load saved launch data:", e);
    }
  }, [storageKey]); // Re-runs whenever the problem changes

  const persistData = () => {
    if (!storageKey) return;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          checklist,
          productionUrl,
          domainName,
          hostingProvider,
          regionDataCenter,
          deploymentMethod,
          environmentType,
          deploymentNotes,
          monitoringTools,
          onboardingPlan,
          releaseNotes,
          launchRisks,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch (e) {
      console.warn("Failed to save launch data:", e);
    }
  };

  const handleSaveProgress = () => {
    persistData();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Section 1: Checklist Handlers
  const toggleChecklistItem = (id: string) => {
    setChecklist(
      checklist.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleUpdateChecklistText = (id: string, text: string) => {
    setChecklist(
      checklist.map((item) => (item.id === id ? { ...item, text } : item))
    );
  };

  const handleAddChecklistItem = () => {
    const nextNum = checklist.length + 1;
    setChecklist([
      ...checklist,
      { id: Date.now().toString(), text: `Checklist Item ${nextNum}`, checked: false },
    ]);
  };

  const handleDeleteChecklistItem = (id: string) => {
    if (checklist.length > 1) {
      setChecklist(checklist.filter((item) => item.id !== id));
    }
  };

  // Section 3: Monitoring Tools Handlers
  const toggleMonitoringConfigured = (id: string) => {
    setMonitoringTools(
      monitoringTools.map((m) =>
        m.id === id ? { ...m, configured: !m.configured } : m
      )
    );
  };

  const handleAddMonitoringTool = () => {
    const nextNum = monitoringTools.length + 1;
    setMonitoringTools([
      ...monitoringTools,
      {
        id: Date.now().toString(),
        name: `Custom Monitoring Tool ${nextNum}`,
        purpose: "Describe monitoring metrics...",
        configured: false,
      },
    ]);
  };

  const handleUpdateMonitoringTool = (id: string, field: "name" | "purpose", val: string) => {
    setMonitoringTools(
      monitoringTools.map((m) => (m.id === id ? { ...m, [field]: val } : m))
    );
  };

  const handleDeleteMonitoringTool = (id: string) => {
    if (monitoringTools.length > 1) {
      setMonitoringTools(monitoringTools.filter((m) => m.id !== id));
    }
  };

  // Validation Criteria
  const isChecklistValid = checklist.length >= 5;
  const isConfigValid =
    productionUrl.trim().length > 0 &&
    domainName.trim().length > 0 &&
    hostingProvider.trim().length > 0;
  const isMonitoringValid = monitoringTools.some((m) => m.configured || m.name.trim().length > 0);
  const isOnboardingValid = onboardingPlan.trim().length > 0;
  const isReleaseNotesValid = releaseNotes.trim().length > 0;
  const isRisksValid = launchRisks.trim().length > 0;

  const isAllValid =
    isChecklistValid &&
    isConfigValid &&
    isMonitoringValid &&
    isOnboardingValid &&
    isReleaseNotesValid &&
    isRisksValid;

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
            <span>{isSaved ? "Launch Plan Saved!" : "Save Progress"}</span>
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* HERO SECTION (65% LEFT, 35% RIGHT 3D ROCKET ILLUSTRATION)     */}
      {/* ============================================================ */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-14">
        <div className="lg:col-span-8 space-y-6 text-left">
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-mono font-semibold tracking-wider text-teal-800 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full uppercase">
              PHASE 7 OF 8 • LAUNCH
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-zinc-900 tracking-tight leading-[1.08]">
            Launch to Real Users
          </h1>

          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-sans max-w-2xl">
            Prepare your application for production. Configure deployment, verify release readiness, and plan how your first users will experience your product.
          </p>
        </div>

        {/* Right 3D Rocket / Cloud Illustration */}
        <div className="lg:col-span-4 flex items-center justify-end relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-teal-100/60 via-amber-100/40 to-emerald-100/50 rounded-full blur-3xl -z-10 transform scale-125" />

          <div className="relative w-full max-w-xs aspect-square flex items-center justify-center">
            {/* Rocket Icon Box */}
            <div className="relative z-10 w-48 h-56 bg-white border border-zinc-200/90 rounded-3xl shadow-2xl p-5 flex flex-col justify-between transform -rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div className="h-3 w-10 bg-teal-700 rounded-md" />
                <Rocket className="h-5 w-5 text-teal-700" />
              </div>
              <div className="space-y-3 py-2 text-center">
                <div className="h-12 w-12 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 mx-auto flex items-center justify-center">
                  <Server className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <div className="h-2 w-28 bg-zinc-200 rounded mx-auto" />
                  <div className="h-2 w-20 bg-emerald-400 rounded mx-auto" />
                </div>
              </div>
              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span>Production Live</span>
                <span className="text-emerald-600 font-bold">✓ SSL Ready</span>
              </div>
            </div>

            {/* Checkmark Badge Accent */}
            <div className="absolute -bottom-3 -right-2 z-20 bg-emerald-600 text-white rounded-2xl p-3 shadow-lg flex items-center gap-2 transform rotate-6 border border-white/40">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-xs font-mono font-bold">v1.0 Release</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2-COLUMN GRID LAUNCH WORKSHEET (CARDS 1 TO 7)                 */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* ------------------------------------------------------------ */}
        {/* CARD 1 — DEPLOYMENT CHECKLIST (Left Column - 6 Cols)          */}
        {/* ------------------------------------------------------------ */}
        <div className="lg:col-span-6 bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 rounded-full bg-teal-100 text-teal-800 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <h2 className="font-serif text-xl font-bold text-zinc-900 tracking-tight">
                Deployment Checklist
              </h2>
            </div>
            <p className="text-xs text-zinc-500 font-sans leading-relaxed">
              Complete all steps before launching to real users.
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            {checklist.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/50 hover:bg-white transition-all text-xs"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleChecklistItem(item.id)}
                    className="h-4 w-4 text-teal-700 border-zinc-300 rounded focus:ring-teal-500 cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) =>
                      handleUpdateChecklistText(item.id, e.target.value)
                    }
                    className={`flex-1 font-sans text-xs sm:text-sm bg-transparent focus:outline-none border-b border-transparent focus:border-teal-500 ${
                      item.checked
                        ? "line-through text-zinc-400"
                        : "font-medium text-zinc-900"
                    }`}
                  />
                </div>

                {checklist.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteChecklistItem(item.id)}
                    className="p-1 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
                    title="Delete Item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleAddChecklistItem}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-mono font-semibold text-zinc-700 shadow-2xs transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-teal-700" />
              <span>Add Checklist Item</span>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* CARD 2 — LAUNCH CONFIGURATION (Right Column - 6 Cols)         */}
        {/* ------------------------------------------------------------ */}
        <div className="lg:col-span-6 bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 rounded-full bg-teal-100 text-teal-800 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <h2 className="font-serif text-xl font-bold text-zinc-900 tracking-tight">
                Launch Configuration
              </h2>
            </div>
            <p className="text-xs text-zinc-500 font-sans leading-relaxed">
              Enter your production configuration details.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Production URL */}
            <div className="space-y-1">
              <label className="block text-xs font-bold font-mono text-zinc-800 uppercase tracking-wider">
                Production URL <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={productionUrl}
                onChange={(e) => setProductionUrl(e.target.value)}
                placeholder="https://yourapp.com"
                className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs font-mono text-zinc-800 placeholder-zinc-400 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-all"
              />
            </div>

            {/* Domain Name */}
            <div className="space-y-1">
              <label className="block text-xs font-bold font-mono text-zinc-800 uppercase tracking-wider">
                Domain Name <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
                placeholder="e.g. medreminder.app"
                className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs font-mono text-zinc-800 placeholder-zinc-400 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-all"
              />
            </div>

            {/* Hosting Provider */}
            <div className="space-y-1">
              <label className="block text-xs font-bold font-mono text-zinc-800 uppercase tracking-wider">
                Hosting Provider <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <select
                  value={hostingProvider}
                  onChange={(e) => setHostingProvider(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs font-sans text-zinc-800 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none appearance-none transition-all cursor-pointer"
                >
                  <option value="Vercel">Vercel</option>
                  <option value="AWS (Amazon Web Services)">AWS (Amazon Web Services)</option>
                  <option value="Render">Render</option>
                  <option value="DigitalOcean">DigitalOcean</option>
                  <option value="Fly.io">Fly.io</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            {/* Region / Data Center */}
            <div className="space-y-1">
              <label className="block text-xs font-bold font-mono text-zinc-800 uppercase tracking-wider">
                Region / Data Center
              </label>
              <div className="relative">
                <select
                  value={regionDataCenter}
                  onChange={(e) => setRegionDataCenter(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs font-sans text-zinc-800 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none appearance-none transition-all cursor-pointer"
                >
                  <option value="us-east-1 (N. Virginia)">us-east-1 (N. Virginia)</option>
                  <option value="eu-central-1 (Frankfurt)">eu-central-1 (Frankfurt)</option>
                  <option value="ap-south-1 (Mumbai)">ap-south-1 (Mumbai)</option>
                  <option value="ap-southeast-1 (Singapore)">ap-southeast-1 (Singapore)</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            {/* Deployment Method */}
            <div className="space-y-1">
              <label className="block text-xs font-bold font-mono text-zinc-800 uppercase tracking-wider">
                Deployment Method
              </label>
              <div className="relative">
                <select
                  value={deploymentMethod}
                  onChange={(e) => setDeploymentMethod(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs font-sans text-zinc-800 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none appearance-none transition-all cursor-pointer"
                >
                  <option value="Git Push / CI/CD Pipeline">Git Push / CI/CD Pipeline</option>
                  <option value="Docker Container Registry">Docker Container Registry</option>
                  <option value="CLI Manual Deployment">CLI Manual Deployment</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            {/* Environment */}
            <div className="space-y-1">
              <label className="block text-xs font-bold font-mono text-zinc-800 uppercase tracking-wider">
                Environment
              </label>
              <div className="relative">
                <select
                  value={environmentType}
                  onChange={(e) => setEnvironmentType(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs font-sans text-zinc-800 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none appearance-none transition-all cursor-pointer"
                >
                  <option value="Production">Production</option>
                  <option value="Staging">Staging</option>
                  <option value="Preview">Preview</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Notes (Optional) */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold font-mono text-zinc-800 uppercase tracking-wider">
                Notes (Optional)
              </label>
              <span className="text-xs font-mono text-zinc-400">
                {deploymentNotes.length} / 300
              </span>
            </div>
            <textarea
              rows={2}
              maxLength={300}
              value={deploymentNotes}
              onChange={(e) => setDeploymentNotes(e.target.value)}
              placeholder="Add any important notes about your deployment..."
              className="w-full p-3 rounded-xl border border-zinc-200 text-xs font-sans text-zinc-800 placeholder-zinc-400 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-all leading-relaxed"
            />
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* CARD 3 — MONITORING & MAINTENANCE (Middle Left - 6 Cols)      */}
        {/* ------------------------------------------------------------ */}
        <div className="lg:col-span-6 bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 rounded-full bg-teal-100 text-teal-800 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <h2 className="font-serif text-xl font-bold text-zinc-900 tracking-tight">
                Monitoring & Maintenance
              </h2>
            </div>
            <p className="text-xs text-zinc-500 font-sans leading-relaxed">
              Track your application health and user activity.
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            {monitoringTools.map((tool) => (
              <div
                key={tool.id}
                className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-white transition-all text-xs"
              >
                <div className="flex-1 min-w-0 pr-3 space-y-0.5">
                  <input
                    type="text"
                    value={tool.name}
                    onChange={(e) =>
                      handleUpdateMonitoringTool(tool.id, "name", e.target.value)
                    }
                    className="font-bold text-zinc-900 bg-transparent focus:outline-none text-xs sm:text-sm w-full"
                  />
                  <input
                    type="text"
                    value={tool.purpose}
                    onChange={(e) =>
                      handleUpdateMonitoringTool(tool.id, "purpose", e.target.value)
                    }
                    placeholder="Describe purpose..."
                    className="text-[11px] text-zinc-500 bg-transparent focus:outline-none w-full"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleMonitoringConfigured(tool.id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                      tool.configured
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-amber-100 text-amber-800 border border-amber-300"
                    }`}
                  >
                    {tool.configured ? "✓ Configured" : "Not Configured"}
                  </button>

                  {monitoringTools.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteMonitoringTool(tool.id)}
                      className="p-1 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete Tool"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleAddMonitoringTool}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-mono font-semibold text-zinc-700 shadow-2xs transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-teal-700" />
              <span>Add Monitoring Tool</span>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* CARD 4 — INITIAL USER ONBOARDING PLAN (Middle Right - 6 Cols) */}
        {/* ------------------------------------------------------------ */}
        <div className="lg:col-span-6 bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="h-7 w-7 rounded-full bg-teal-100 text-teal-800 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                  4
                </span>
                <h2 className="font-serif text-xl font-bold text-zinc-900 tracking-tight">
                  Initial User Onboarding Plan
                </h2>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                {onboardingPlan.length} / 400
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-sans leading-relaxed">
              How will you welcome and guide your first users?
            </p>
          </div>

          <div className="pt-1 flex-1">
            <textarea
              rows={6}
              maxLength={400}
              value={onboardingPlan}
              onChange={(e) => setOnboardingPlan(e.target.value)}
              placeholder="Describe your onboarding strategy, welcome messages, tutorials, and support plan..."
              className="w-full h-full p-4 rounded-xl border border-zinc-200 text-xs sm:text-sm font-sans text-zinc-800 placeholder-zinc-400 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-all leading-relaxed resize-y"
            />
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* CARD 5 — RELEASE NOTES & ANNOUNCEMENTS (Bottom Left - 6 Cols) */}
        {/* ------------------------------------------------------------ */}
        <div className="lg:col-span-6 bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="h-7 w-7 rounded-full bg-teal-100 text-teal-800 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                  5
                </span>
                <h2 className="font-serif text-xl font-bold text-zinc-900 tracking-tight">
                  Release Notes & Announcements
                </h2>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                {releaseNotes.length} / 300
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-sans leading-relaxed">
              Write release notes or announcements for your users.
            </p>
          </div>

          <div className="pt-1 flex-1">
            <textarea
              rows={5}
              maxLength={300}
              value={releaseNotes}
              onChange={(e) => setReleaseNotes(e.target.value)}
              placeholder="What's new in this release? Any important notes for your users?"
              className="w-full h-full p-4 rounded-xl border border-zinc-200 text-xs sm:text-sm font-sans text-zinc-800 placeholder-zinc-400 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-all leading-relaxed resize-y"
            />
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* CARD 6 — LAUNCH RISKS & MITIGATION (Bottom Right - 6 Cols)   */}
        {/* ------------------------------------------------------------ */}
        <div className="lg:col-span-6 bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="h-7 w-7 rounded-full bg-teal-100 text-teal-800 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                  6
                </span>
                <h2 className="font-serif text-xl font-bold text-zinc-900 tracking-tight">
                  Launch Risks & Mitigation
                </h2>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                {launchRisks.length} / 300
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-sans leading-relaxed">
              What could go wrong after launch? Describe risks and mitigation plans.
            </p>
          </div>

          <div className="pt-1 flex-1">
            <textarea
              rows={5}
              maxLength={300}
              value={launchRisks}
              onChange={(e) => setLaunchRisks(e.target.value)}
              placeholder="Describe technical risks, scaling challenges, or fallback plans..."
              className="w-full h-full p-4 rounded-xl border border-zinc-200 text-xs sm:text-sm font-sans text-zinc-800 placeholder-zinc-400 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-all leading-relaxed resize-y"
            />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* CARD 7 — RELEASE READINESS SUMMARY (FULL-WIDTH BOTTOM CARD)   */}
      {/* ============================================================ */}
      <section className="bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-4 mb-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-7 w-7 rounded-full bg-teal-100 text-teal-800 text-xs font-mono font-bold flex items-center justify-center shrink-0">
              7
            </span>
            <div>
              <h2 className="font-serif text-xl font-bold text-zinc-900 tracking-tight">
                Release Readiness Summary
              </h2>
              <p className="text-xs text-zinc-500 font-sans mt-0.5">
                Complete the launch worksheet to generate your Release Readiness Summary.
              </p>
            </div>
          </div>

          {isAllValid ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Release Summary Ready
            </span>
          ) : (
            <span className="text-xs font-mono text-zinc-400">In Progress</span>
          )}
        </div>

        {!isAllValid ? (
          <div className="p-8 border-2 border-dashed border-zinc-200 rounded-2xl text-center space-y-3 bg-zinc-50/40">
            <Rocket className="h-9 w-9 text-teal-600/70 mx-auto" />
            <p className="text-xs font-semibold text-zinc-700">
              Complete the launch worksheet to generate your Release Readiness Summary.
            </p>
            <p className="text-[11px] font-mono text-zinc-400">
              Fill in Checklist (5+ items), Configuration, Monitoring, Onboarding, Release Notes, and Risks.
            </p>
          </div>
        ) : (
          <div className="p-6 bg-teal-50/40 border border-teal-200/80 rounded-2xl space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-teal-200/60 pb-3">
              <span className="font-bold text-sm text-teal-950 font-serif">
                Production Release Blueprint v1.0
              </span>
              <span className="text-[10px] font-mono text-teal-800 font-bold bg-teal-100 px-2 py-0.5 rounded uppercase">
                VERIFIED RELEASE PLAN
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="font-mono text-[10px] text-teal-800 font-bold uppercase">PRODUCTION URL:</p>
                <p className="text-zinc-800 mt-0.5 font-mono">{productionUrl}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] text-teal-800 font-bold uppercase">HOSTING PROVIDER:</p>
                <p className="text-zinc-800 mt-0.5">{hostingProvider} ({regionDataCenter})</p>
              </div>
              <div>
                <p className="font-mono text-[10px] text-teal-800 font-bold uppercase">CHECKLIST COMPLETED:</p>
                <p className="text-zinc-800 mt-0.5">{checklist.filter((c) => c.checked).length} / {checklist.length} Verified</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* BOTTOM ACTION & VALIDATION                                   */}
      {/* ============================================================ */}
      <footer className="flex flex-col items-center justify-center space-y-4 text-center">
        {!isAllValid && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 max-w-md w-full text-left space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Complete the following to continue:</span>
            </div>
            <ul className="list-disc list-inside text-[11px] space-y-0.5 pl-5 text-amber-800">
              {!isChecklistValid && <li>Deployment Checklist (Minimum 5 Items)</li>}
              {!isConfigValid && <li>Launch Configuration (Production URL, Domain, Hosting)</li>}
              {!isMonitoringValid && <li>Monitoring & Maintenance plan</li>}
              {!isOnboardingValid && <li>User Onboarding Plan</li>}
              {!isReleaseNotesValid && <li>Release Notes & Announcements</li>}
              {!isRisksValid && <li>Launch Risks & Mitigation</li>}
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
          <span>Continue to Improve →</span>
        </button>
      </footer>
    </div>
  );
}
