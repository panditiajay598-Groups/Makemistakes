"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  FolderGit2,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Globe,
  Lock,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  Sparkles,
  ShieldCheck,
  FileCode,
  ArrowRight,
  Terminal,
  Share2,
} from "lucide-react";
import { ProblemData } from "@/lib/problemContent";
import { deriveBuildWorkspace } from "@/lib/buildWorkspace";

interface GitHubPushPhaseProps {
  onComplete: () => void;
  onBackToJourney?: () => void;
  problemData?: ProblemData | null;
}

export default function GitHubPushPhase({
  onComplete,
  onBackToJourney,
  problemData,
}: GitHubPushPhaseProps) {
  const workspace = useMemo(() => deriveBuildWorkspace(problemData), [problemData]);
  const defaultRepoName = `${workspace.productSlug || "product"}-mvp`;

  const [repoName, setRepoName] = useState(defaultRepoName);
  const [description, setDescription] = useState(
    `Built on MakeMistakes BuildOS — ${workspace.productName}: ${workspace.tagline.slice(0, 90)}`
  );
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [commitMsg, setCommitMsg] = useState("feat: initial MVP release via MakeMistakes BuildOS");
  const [showReadmePreview, setShowReadmePreview] = useState(false);

  // Push State Machine
  const [pushState, setPushState] = useState<"IDLE" | "PREPARING" | "COMMITTING" | "PUSHED">("IDLE");
  const [pushedUrl, setPushedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const autoReadmeContent = `# ${workspace.productName} — MVP

> ${workspace.statement}

Built with **MakeMistakes BuildOS** — an isolated cloud development environment.

## 🚀 Tech Stack
- **Framework**: Next.js 14+ / React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 💡 Key Features
- **Problem Pitch & Hero**: ${workspace.tagline}
- **Component Architecture**: Modular React components (\`app/page.tsx\`, \`Navbar\`, \`Hero\`)
- **Validation**: Full suite of unit & criteria validation checks

## 🛠️ Local Setup
\`\`\`bash
git clone https://github.com/your-username/${repoName}.git
cd ${repoName}
npm install
npm run dev
\`\`\`

---
*Built with ❤️ by an active builder on MakeMistakes OS.*
`;

  const handlePushToGithub = () => {
    if (pushState === "PREPARING" || pushState === "COMMITTING") return;

    setPushState("PREPARING");

    setTimeout(() => {
      setPushState("COMMITTING");
    }, 1200);

    setTimeout(() => {
      setPushState("PUSHED");
      setPushedUrl(`https://github.com/builder-student/${repoName}`);
    }, 2800);
  };

  const handleCopyUrl = () => {
    if (!pushedUrl) return;
    navigator.clipboard.writeText(pushedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 py-4 font-sans text-zinc-900">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-800 font-mono font-bold text-xs uppercase tracking-wider">
              Phase 7 — GitHub Push
            </span>
            <span className="text-xs font-mono text-zinc-400">Step 7 of 8</span>
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            Publish Code to GitHub
          </h1>
          <p className="text-sm text-zinc-600">
            Publish your BuildOS MVP codebase directly to your GitHub profile to build a verified builder portfolio.
          </p>
        </div>

        {onBackToJourney && (
          <button
            type="button"
            onClick={onBackToJourney}
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 border border-zinc-200 rounded-full px-4 py-2 bg-white hover:bg-zinc-50 transition-all cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Journey
          </button>
        )}
      </div>

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: REPO CONFIGURATION (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Repository Details */}
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-zinc-900 flex items-center justify-center text-white font-mono shadow-sm">
                  <FolderGit2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">Repository Details</h3>
                  <p className="text-xs text-zinc-500">Configure your new GitHub repository settings</p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200">
                <button
                  type="button"
                  onClick={() => setVisibility("public")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    visibility === "public"
                      ? "bg-white text-zinc-900 shadow-xs border border-zinc-200"
                      : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  <Globe className="h-3.5 w-3.5 text-teal-600" /> Public
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility("private")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    visibility === "private"
                      ? "bg-white text-zinc-900 shadow-xs border border-zinc-200"
                      : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  <Lock className="h-3.5 w-3.5 text-amber-600" /> Private
                </button>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wide mb-1.5">
                  Repository Name
                </label>
                <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-100 transition-all">
                  <span className="text-xs font-mono text-zinc-400">github.com/your-username/</span>
                  <input
                    type="text"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, "-"))}
                    className="flex-1 font-mono text-xs text-zinc-900 bg-transparent outline-none font-semibold"
                    placeholder="my-product-mvp"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wide mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-zinc-900 bg-zinc-50 border border-zinc-300 rounded-xl focus:border-teal-600 focus:outline-none transition-all"
                  placeholder="Short product description for GitHub header"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wide mb-1.5">
                  Initial Commit Message
                </label>
                <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl font-mono text-xs text-zinc-700">
                  <GitCommit className="h-4 w-4 text-teal-600 shrink-0" />
                  <input
                    type="text"
                    value={commitMsg}
                    onChange={(e) => setCommitMsg(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-zinc-800 font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Auto-Generated README Preview */}
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
            <div className="flex items-center justify-between p-4 bg-zinc-50 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-teal-700" />
                <span className="text-xs font-mono font-bold text-zinc-800">README.md (Auto-Generated)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowReadmePreview(!showReadmePreview)}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 cursor-pointer"
              >
                {showReadmePreview ? "Collapse" : "Preview Content"}
              </button>
            </div>

            {showReadmePreview && (
              <div className="p-4 bg-zinc-950 text-zinc-200 font-mono text-xs leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
                {autoReadmeContent}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTION & STATUS CARD (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Push Banner */}
          <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-teal-950 text-white rounded-2xl p-6 shadow-lg border border-zinc-800 space-y-6 relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-teal-400" />
                <span className="text-xs font-mono font-bold text-zinc-300">Target Branch: main</span>
              </div>
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-teal-950 text-teal-300 border border-teal-800">
                Connected
              </span>
            </div>

            <div className="space-y-3">
              <h4 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-teal-400" />
                Ready to Publish
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Your BuildOS codebase contains 6 verified component files ready to be committed and pushed to your personal GitHub account.
              </p>
            </div>

            {/* Status Indicator */}
            {pushState !== "IDLE" && (
              <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-zinc-300">
                  <span className="flex items-center gap-2">
                    {pushState === "PUSHED" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Loader2 className="h-4 w-4 text-teal-400 animate-spin" />
                    )}
                    <span>
                      {pushState === "PREPARING" && "Preparing files & README..."}
                      {pushState === "COMMITTING" && "Creating initial commit..."}
                      {pushState === "PUSHED" && "Successfully pushed to GitHub!"}
                    </span>
                  </span>
                </div>
              </div>
            )}

            {/* Push Action Button */}
            {pushState !== "PUSHED" ? (
              <button
                type="button"
                onClick={handlePushToGithub}
                disabled={pushState !== "IDLE"}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 font-extrabold text-sm transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {pushState !== "IDLE" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FolderGit2 className="h-4 w-4" />
                )}
                <span>{pushState !== "IDLE" ? "Pushing Code..." : "Push Code to GitHub"}</span>
              </button>
            ) : (
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs text-emerald-300 font-mono font-bold">
                    <span>Repository Published!</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="flex items-center gap-2 bg-zinc-950 p-2 rounded-lg border border-emerald-900/60">
                    <span className="text-[11px] font-mono text-emerald-400 truncate flex-1">{pushedUrl}</span>
                    <button
                      type="button"
                      onClick={handleCopyUrl}
                      className="p-1 text-zinc-400 hover:text-white rounded"
                      title="Copy URL"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <a
                  href={pushedUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> View on GitHub
                </a>
              </div>
            )}
          </div>

          {/* Builder Portfolio Card */}
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-teal-950">Verified Builder Portfolio</h4>
              <p className="text-[11px] text-teal-800 leading-relaxed">
                Pushing your codebase adds a verified GitHub repository badge to your MakeMistakes Builder Portfolio.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER NAVIGATION */}
      <div className="flex justify-between items-center border-t border-zinc-200 pt-6">
        <span className="text-xs text-zinc-400 font-mono">
          Phase 7 of 8 · Push to GitHub
        </span>

        <button
          type="button"
          onClick={onComplete}
          className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-teal-800 hover:bg-teal-700 text-white font-bold text-sm transition-all shadow-md cursor-pointer hover:scale-105"
        >
          <span>Continue to Improve →</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
