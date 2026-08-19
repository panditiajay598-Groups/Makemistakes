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
  GitBranch,
  Lightbulb,
  Check,
  Terminal,
  ExternalLink,
} from "lucide-react";

import { ProblemData } from "@/lib/problemContent";

interface DeployPhaseProps {
  onComplete: () => void;
  onBackToJourney?: () => void;
  problemData?: ProblemData | null;
  userId?: string;
}

export interface DeploymentChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

const INITIAL_CHECKLIST: DeploymentChecklistItem[] = [
  { id: "d1", text: "Verified build passes locally", checked: false },
  { id: "d2", text: "Tested production API endpoints", checked: false },
  { id: "d3", text: "Checked environment variables set in hosting provider", checked: false },
  { id: "d4", text: "Confirmed SSL/HTTPS security working", checked: false },
  { id: "d5", text: "Ran sanity test on live URL", checked: false },
];

export default function DeployPhase({
  onComplete,
  onBackToJourney,
  problemData,
  userId,
}: DeployPhaseProps) {
  const pid = problemData?.problemId ?? "";
  const effectiveUserId = (userId || "default_user").toString().trim().toLowerCase();
  const storageKey = pid && effectiveUserId ? `makemistakes_deploy_${effectiveUserId}_${pid}` : null;

  // Section 1: Push Code to GitHub
  const [githubRepoUrl, setGithubRepoUrl] = useState("");
  const [defaultBranch, setDefaultBranch] = useState("main");
  const [commitMessage, setCommitMessage] = useState("");
  const [isPushed, setIsPushed] = useState(false);
  const [isPushing, setIsPushing] = useState(false);

  // Section 2: Deployment Configuration
  const [hostingPlatform, setHostingPlatform] = useState("");
  const [deploymentMethod, setDeploymentMethod] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [environmentType, setEnvironmentType] = useState("Production");
  const [regionDataCenter, setRegionDataCenter] = useState("");

  // Section 3: Environment Variables
  const [envVariablesText, setEnvVariablesText] = useState("");

  // Section 4: Build & Deployment Commands
  const [buildCommand, setBuildCommand] = useState("npm run build");
  const [startCommand, setStartCommand] = useState("npm start");
  const [installCommand, setInstallCommand] = useState("npm install");

  // Section 5: Deployment Notes & Documentation
  const [deploymentNotesText, setDeploymentNotesText] = useState("");

  // Section 6: Deployment Verification Checklist
  const [checklist, setChecklist] = useState<DeploymentChecklistItem[]>(INITIAL_CHECKLIST);

  // Save Progress State
  const [isSaved, setIsSaved] = useState(false);

  // Load from Server API + localStorage fallback
  useEffect(() => {
    // Step 1: Reset ALL state to defaults (clears previous problem's data)
    setGithubRepoUrl("");
    setDefaultBranch("main");
    setCommitMessage("");
    setIsPushed(false);
    setIsPushing(false);
    setHostingPlatform("");
    setDeploymentMethod("");
    setLiveUrl("");
    setEnvironmentType("Production");
    setRegionDataCenter("");
    setEnvVariablesText("");
    setBuildCommand("npm run build");
    setStartCommand("npm start");
    setInstallCommand("npm install");
    setDeploymentNotesText("");
    setChecklist(INITIAL_CHECKLIST);
    setIsSaved(false);

    if (!pid) return;

    let isSubscribed = true;

    async function loadData() {
      try {
        const res = await fetch(`/api/journey/user-data?userId=${encodeURIComponent(effectiveUserId)}&problemId=${encodeURIComponent(pid)}`);
        if (res.ok) {
          const json = await res.json();
          const dData = json?.phases?.deploy;
          if (isSubscribed && dData) {
            if (dData.githubRepoUrl) setGithubRepoUrl(dData.githubRepoUrl);
            if (dData.defaultBranch) setDefaultBranch(dData.defaultBranch);
            if (dData.commitMessage) setCommitMessage(dData.commitMessage);
            if (dData.hostingPlatform) setHostingPlatform(dData.hostingPlatform);
            if (dData.deploymentMethod) setDeploymentMethod(dData.deploymentMethod);
            if (dData.liveUrl) setLiveUrl(dData.liveUrl);
            if (dData.environmentType) setEnvironmentType(dData.environmentType);
            if (dData.regionDataCenter) setRegionDataCenter(dData.regionDataCenter);
            if (dData.envVariablesText) setEnvVariablesText(dData.envVariablesText);
            if (dData.buildCommand) setBuildCommand(dData.buildCommand);
            if (dData.startCommand) setStartCommand(dData.startCommand);
            if (dData.installCommand) setInstallCommand(dData.installCommand);
            if (dData.deploymentNotesText) setDeploymentNotesText(dData.deploymentNotesText);
            if (Array.isArray(dData.checklist) && dData.checklist.length > 0) setChecklist(dData.checklist);
            return;
          }
        }
      } catch (err) {
        console.warn("[DeployPhase] Server load warning:", err);
      }

      // Fallback to local storage
      if (storageKey) {
        try {
          const saved = localStorage.getItem(storageKey);
          if (saved && isSubscribed) {
            const parsed = JSON.parse(saved);
            if (parsed.githubRepoUrl) setGithubRepoUrl(parsed.githubRepoUrl);
            if (parsed.defaultBranch) setDefaultBranch(parsed.defaultBranch);
            if (parsed.commitMessage) setCommitMessage(parsed.commitMessage);
            if (parsed.hostingPlatform) setHostingPlatform(parsed.hostingPlatform);
            if (parsed.deploymentMethod) setDeploymentMethod(parsed.deploymentMethod);
            if (parsed.liveUrl) setLiveUrl(parsed.liveUrl);
            if (parsed.environmentType) setEnvironmentType(parsed.environmentType);
            if (parsed.regionDataCenter) setRegionDataCenter(parsed.regionDataCenter);
            if (parsed.envVariablesText) setEnvVariablesText(parsed.envVariablesText);
            if (parsed.buildCommand) setBuildCommand(parsed.buildCommand);
            if (parsed.startCommand) setStartCommand(parsed.startCommand);
            if (parsed.installCommand) setInstallCommand(parsed.installCommand);
            if (parsed.deploymentNotesText) setDeploymentNotesText(parsed.deploymentNotesText);
            if (Array.isArray(parsed.checklist)) setChecklist(parsed.checklist);
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
      githubRepoUrl,
      defaultBranch,
      commitMessage,
      hostingPlatform,
      deploymentMethod,
      liveUrl,
      environmentType,
      regionDataCenter,
      envVariablesText,
      buildCommand,
      startCommand,
      installCommand,
      deploymentNotesText,
      checklist,
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
        phase: "deploy",
        data: payload,
      }),
    }).catch((err) => console.warn("[DeployPhase] Server save warning:", err));
  };

  const handleSaveProgress = () => {
    persistData();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handlePushToGitHub = () => {
    if (!githubRepoUrl.trim()) return;
    setIsPushing(true);
    setTimeout(() => {
      setIsPushing(false);
      setIsPushed(true);
      setChecklist((prev) =>
        prev.map((item) =>
          item.id === "c1" ? { ...item, checked: true } : item
        )
      );
    }, 1200);
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  // Validation Check
  const isGithubValid = githubRepoUrl.trim().length > 0;
  const isConfigValid =
    hostingPlatform.trim().length > 0 &&
    deploymentMethod.trim().length > 0 &&
    liveUrl.trim().length > 0 &&
    regionDataCenter.trim().length > 0;
  const isCommandsValid = buildCommand.trim().length > 0 && startCommand.trim().length > 0;

  const isAllValid = isGithubValid && isConfigValid && isCommandsValid;

  return (
    <div className="w-full text-zinc-900 font-sans antialiased selection:bg-teal-700 selection:text-white pb-20">
      {/* ============================================================ */}
      {/* HEADER                                                       */}
      {/* ============================================================ */}
      <header className="w-full pb-6 border-b border-zinc-200/60 mb-10">
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
            <span>{isSaved ? "Deploy Plan Saved!" : "Save Progress"}</span>
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* HERO SECTION                                                 */}
      {/* ============================================================ */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-10">
        <div className="lg:col-span-8 space-y-6 text-left">
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-mono font-semibold tracking-wider text-teal-800 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full uppercase">
              PHASE 7 OF 8 • DEPLOY
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-zinc-900 tracking-tight leading-[1.08]">
            Push Code & Deploy
          </h1>

          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-sans max-w-2xl">
            Push your code to GitHub and deploy your application so others can use your product.
          </p>
        </div>

        {/* Right 3D Rocket / GitHub Illustration */}
        <div className="lg:col-span-4 flex items-center justify-end relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-teal-100/60 via-amber-100/40 to-emerald-100/50 rounded-full blur-3xl -z-10 transform scale-125" />

          <div className="relative w-full max-w-xs aspect-square flex items-center justify-center">
            {/* Rocket Container */}
            <div className="relative z-10 w-52 h-56 bg-white border border-zinc-200/90 rounded-3xl shadow-2xl p-5 flex flex-col justify-between transform rotate-1 hover:rotate-0 transition-transform duration-500">
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
                <span>Deploy Engine</span>
                <span className="text-emerald-600 font-bold">✓ Live Mode</span>
              </div>
            </div>

            {/* GitHub Badge Accent */}
            <div className="absolute -bottom-3 -right-2 z-20 bg-zinc-900 text-white rounded-2xl p-3 shadow-lg flex items-center gap-2 transform rotate-6 border border-white/20">
              <GitBranch className="h-5 w-5 text-teal-400" />
              <span className="text-xs font-mono font-bold">GitHub Sync</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* STEPPER PROGRESS BAR                                         */}
      {/* ============================================================ */}
      <div className="w-full bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs mb-10 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[700px] text-xs font-mono px-4">
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] flex items-center justify-center font-mono">
              1
            </span>
            <span>Discover</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          </div>

          <div className="h-px w-6 bg-zinc-200" />

          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] flex items-center justify-center font-mono">
              2
            </span>
            <span>Research</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          </div>

          <div className="h-px w-6 bg-zinc-200" />

          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] flex items-center justify-center font-mono">
              3
            </span>
            <span>Design</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          </div>

          <div className="h-px w-6 bg-zinc-200" />

          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] flex items-center justify-center font-mono">
              4
            </span>
            <span>Plan</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          </div>

          <div className="h-px w-6 bg-zinc-200" />

          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] flex items-center justify-center font-mono">
              5
            </span>
            <span>Build</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          </div>

          <div className="h-px w-6 bg-zinc-200" />

          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] flex items-center justify-center font-mono">
              6
            </span>
            <span>Test</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          </div>

          <div className="h-px w-6 bg-zinc-200" />

          {/* Active Deploy Step */}
          <div className="flex items-center gap-1.5 text-teal-900 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full font-bold">
            <span className="h-5 w-5 rounded-full bg-teal-800 text-white text-[11px] flex items-center justify-center font-mono">
              7
            </span>
            <span>Deploy</span>
          </div>

          <div className="h-px w-6 bg-zinc-200" />

          <div className="flex items-center gap-1.5 text-zinc-400 font-medium">
            <span className="h-5 w-5 rounded-full bg-zinc-100 text-zinc-500 text-[11px] flex items-center justify-center font-mono">
              8
            </span>
            <span>Improve</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2-COLUMN GRID WORKSHEET (LAYOUT AS SHOWN IN REFERENCE PHOTO) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        {/* ------------------------------------------------------------ */}
        {/* CARD 1 — Push Code to GitHub (Top Left - 6 Cols)             */}
        {/* ------------------------------------------------------------ */}
        <div className="lg:col-span-6 bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="h-7 w-7 rounded-full bg-teal-100 text-teal-800 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <h2 className="font-serif text-xl font-bold text-zinc-900 tracking-tight">
                  Push Code to GitHub
                </h2>
              </div>
              <p className="text-xs text-zinc-500 font-sans leading-relaxed">
                Connect your repository and push your latest code.
              </p>
            </div>

            {/* GitHub Repository URL */}
            <div className="space-y-1">
              <label className="block text-xs font-bold font-mono text-zinc-800">
                GitHub Repository URL
              </label>
              <input
                type="text"
                value={githubRepoUrl}
                onChange={(e) => setGithubRepoUrl(e.target.value)}
                placeholder="e.g. https://github.com/username/repo"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-mono text-zinc-800 placeholder-zinc-400 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-all"
              />
            </div>

            {/* Default Branch */}
            <div className="space-y-1">
              <label className="block text-xs font-bold font-mono text-zinc-800">
                Default Branch
              </label>
              <input
                type="text"
                value={defaultBranch}
                onChange={(e) => setDefaultBranch(e.target.value)}
                placeholder="e.g. main"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-mono text-zinc-800 placeholder-zinc-400 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-all"
              />
            </div>

            {/* Latest Commit Message */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold font-mono text-zinc-800">
                  Latest Commit Message (Optional)
                </label>
                <span className="text-xs font-mono text-zinc-400">
                  {commitMessage.length} / 100
                </span>
              </div>
              <textarea
                rows={2}
                maxLength={100}
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="e.g. Initial commit of my project"
                className="w-full p-3 rounded-xl border border-zinc-200 text-xs font-sans text-zinc-800 placeholder-zinc-400 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-all leading-relaxed"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handlePushToGitHub}
              disabled={isPushing || !githubRepoUrl.trim()}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all shadow-xs cursor-pointer ${
                isPushed
                  ? "bg-emerald-800 text-white"
                  : "bg-teal-900 hover:bg-teal-800 text-white"
              }`}
            >
              <GitBranch className="h-4 w-4 text-teal-400" />
              <span>
                {isPushing
                  ? "Pushing Code to GitHub..."
                  : isPushed
                  ? "✓ Code Pushed to GitHub"
                  : "Connect & Push to GitHub"}
              </span>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* CARD 2 — Deployment Configuration (Top Right - 6 Cols)       */}
        {/* ------------------------------------------------------------ */}
        <div className="lg:col-span-6 bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 rounded-full bg-teal-100 text-teal-800 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <h2 className="font-serif text-xl font-bold text-zinc-900 tracking-tight">
                Deployment Configuration
              </h2>
            </div>
            <p className="text-xs text-zinc-500 font-sans leading-relaxed">
              Configure how and where you want to deploy your application.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Hosting Platform */}
            <div className="space-y-1">
              <label className="block text-xs font-bold font-mono text-zinc-800">
                Hosting Platform
              </label>
              <div className="relative">
                <select
                  value={hostingPlatform}
                  onChange={(e) => setHostingPlatform(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-sans text-zinc-800 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="">Select platform</option>
                  <option value="Vercel">Vercel</option>
                  <option value="Netlify">Netlify</option>
                  <option value="AWS">AWS</option>
                  <option value="Render">Render</option>
                  <option value="DigitalOcean">DigitalOcean</option>
                  <option value="Fly.io">Fly.io</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            {/* Deployment Method */}
            <div className="space-y-1">
              <label className="block text-xs font-bold font-mono text-zinc-800">
                Deployment Method
              </label>
              <div className="relative">
                <select
                  value={deploymentMethod}
                  onChange={(e) => setDeploymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-sans text-zinc-800 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="">Select method</option>
                  <option value="Git Push / CI/CD">Git Push / CI/CD</option>
                  <option value="Docker Container">Docker Container</option>
                  <option value="CLI Deploy">CLI Deploy</option>
                  <option value="Direct Upload">Direct Upload</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            {/* Live URL */}
            <div className="space-y-1">
              <label className="block text-xs font-bold font-mono text-zinc-800">
                Live URL (After Deployment)
              </label>
              <input
                type="text"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="e.g. https://yourapp.com"
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-mono text-zinc-800 placeholder-zinc-400 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none"
              />
            </div>

            {/* Environment */}
            <div className="space-y-1">
              <label className="block text-xs font-bold font-mono text-zinc-800">
                Environment
              </label>
              <div className="relative">
                <select
                  value={environmentType}
                  onChange={(e) => setEnvironmentType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-sans text-zinc-800 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="Production">Production</option>
                  <option value="Staging">Staging</option>
                  <option value="Preview">Preview</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Region / Data Center */}
          <div className="space-y-1 max-w-sm">
            <label className="block text-xs font-bold font-mono text-zinc-800">
              Region / Data Center
            </label>
            <div className="relative">
              <select
                value={regionDataCenter}
                onChange={(e) => setRegionDataCenter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-sans text-zinc-800 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="">Select region</option>
                <option value="us-east-1 (N. Virginia)">us-east-1 (N. Virginia)</option>
                <option value="eu-central-1 (Frankfurt)">eu-central-1 (Frankfurt)</option>
                <option value="ap-south-1 (Mumbai)">ap-south-1 (Mumbai)</option>
                <option value="ap-southeast-1 (Singapore)">ap-southeast-1 (Singapore)</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          {/* Environment Variables */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold font-mono text-zinc-800">
                Environment Variables (Optional)
              </label>
              <span className="text-xs font-mono text-zinc-400">
                {envVariablesText.length} / 300
              </span>
            </div>
            <textarea
              rows={2}
              maxLength={300}
              value={envVariablesText}
              onChange={(e) => setEnvVariablesText(e.target.value)}
              placeholder="KEY=VALUE (one per line)"
              className="w-full p-3 rounded-xl border border-zinc-200 text-xs font-mono text-zinc-800 placeholder-zinc-400 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-all leading-relaxed"
            />
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* CARD 3 — Build / Deployment Commands (Bottom Left - 6 Cols)  */}
        {/* ------------------------------------------------------------ */}
        <div className="lg:col-span-6 bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="h-7 w-7 rounded-full bg-teal-100 text-teal-800 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <h2 className="font-serif text-xl font-bold text-zinc-900 tracking-tight">
                  Build / Deployment Commands
                </h2>
              </div>
              <p className="text-xs text-zinc-500 font-sans leading-relaxed">
                Add the commands needed to build and deploy your project.
              </p>
            </div>

            {/* Build Command */}
            <div className="space-y-1">
              <label className="block text-xs font-bold font-mono text-zinc-800">
                Build Command
              </label>
              <input
                type="text"
                value={buildCommand}
                onChange={(e) => setBuildCommand(e.target.value)}
                placeholder="e.g. npm run build"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-mono text-zinc-800 placeholder-zinc-400 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-all"
              />
            </div>

            {/* Start Command */}
            <div className="space-y-1">
              <label className="block text-xs font-bold font-mono text-zinc-800">
                Start Command
              </label>
              <input
                type="text"
                value={startCommand}
                onChange={(e) => setStartCommand(e.target.value)}
                placeholder="e.g. npm start"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-mono text-zinc-800 placeholder-zinc-400 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-all"
              />
            </div>

            {/* Install Command */}
            <div className="space-y-1">
              <label className="block text-xs font-bold font-mono text-zinc-800">
                Install Command (Optional)
              </label>
              <input
                type="text"
                value={installCommand}
                onChange={(e) => setInstallCommand(e.target.value)}
                placeholder="e.g. npm install"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-mono text-zinc-800 placeholder-zinc-400 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Helper Lightbox Notice */}
          <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200/80 text-xs text-teal-900 flex items-center gap-2.5 font-sans">
            <Lightbulb className="h-4 w-4 text-teal-700 shrink-0" />
            <span>These commands will be used by the platform during deployment.</span>
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* CARD 4 — Deployment Notes & Checklist (Bottom Right - 6 Cols) */}
        {/* ------------------------------------------------------------ */}
        <div className="lg:col-span-6 bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-7 w-7 rounded-full bg-teal-100 text-teal-800 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                    4
                  </span>
                  <h2 className="font-serif text-xl font-bold text-zinc-900 tracking-tight">
                    Deployment Notes
                  </h2>
                </div>
                <span className="text-xs font-mono text-zinc-400">
                  {deploymentNotesText.length} / 300
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-sans leading-relaxed">
                Add any important notes about your deployment.
              </p>
            </div>

            <textarea
              rows={3}
              maxLength={300}
              value={deploymentNotesText}
              onChange={(e) => setDeploymentNotesText(e.target.value)}
              placeholder="e.g. Special setup steps, dependencies, limitations, or anything important..."
              className="w-full p-4 rounded-xl border border-zinc-200 text-xs sm:text-sm font-sans text-zinc-800 placeholder-zinc-400 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-all leading-relaxed"
            />
          </div>

          {/* Subcard: Deployment Checklist */}
          <div className="p-5 rounded-2xl bg-teal-50/40 border border-teal-100 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold font-mono text-zinc-900">
                Deployment Checklist
              </h3>
            </div>

            <div className="space-y-2 text-xs font-sans">
              {checklist.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-2.5 cursor-pointer text-zinc-800 hover:text-zinc-950 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleChecklistItem(item.id)}
                    className="h-4 w-4 text-teal-700 border-zinc-300 rounded focus:ring-teal-500 cursor-pointer"
                  />
                  <span className={item.checked ? "line-through text-zinc-400" : ""}>
                    {item.text}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* BOTTOM VALIDATION & ACTION BAR                               */}
      {/* ============================================================ */}
      <footer className="p-4 sm:p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5 text-emerald-700" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-emerald-950 font-sans">
            Once deployed, your live URL will be saved and shown in your portfolio.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!isAllValid) return;
            persistData();
            onComplete();
          }}
          disabled={!isAllValid}
          className={`inline-flex items-center gap-3 px-8 py-3.5 rounded-full font-semibold font-sans text-sm transition-all shadow-md shrink-0 ${
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
