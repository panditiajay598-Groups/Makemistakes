"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Globe,
  ShieldCheck,
  Users,
  Settings,
  Terminal,
  ArrowRight,
  CheckCircle2,
  Clock,
  Github,
  ExternalLink,
  Trophy,
  Sparkles,
  RefreshCw,
  FolderPlus,
  Layers,
  Award,
  Activity,
  Code2,
} from "lucide-react";
import { getOnboardingProfile, UserOnboardingProfile } from "@/lib/onboardingStore";
import { getJourneyUserId } from "@/lib/journeyUser";

interface ProjectCardData {
  problemId: string;
  title: string;
  description: string;
  category: string;
  difficulty: string | null;
  status: string;
  completedPhases: number;
  totalPhases: number;
  progressPercentage: number;
  currentPhase: number;
  completionDate: string | null;
  lastWorkedDate: string | null;
  techStack: string[];
  githubUrl: string | null;
  liveUrl: string | null;
}

interface AchievementData {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

interface PortfolioSummary {
  projectsBuilt: number;
  totalProjects: number;
  phasesCompleted: number;
  portfolioProgress: number;
  achievements: AchievementData[];
  skills: string[];
}

export default function PortfolioPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserOnboardingProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "all" | "milestones" | "certificates" | "activity">("overview");
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<ProjectCardData[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary>({
    projectsBuilt: 0,
    totalProjects: 0,
    phasesCompleted: 0,
    portfolioProgress: 0,
    achievements: [],
    skills: [],
  });

  const userId = getJourneyUserId();

  const fetchPortfolioData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/portfolio?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
        if (data.summary) {
          setSummary(data.summary);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch portfolio data:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Onboarding route guard & Initial Data Load
  useEffect(() => {
    const activeProf = getOnboardingProfile();
    setProfile(activeProf);
    if (!activeProf?.onboardingCompleted) {
      router.push("/onboarding");
      return;
    }
    fetchPortfolioData();
  }, [router, fetchPortfolioData]);

  const navItems = [
    { id: "buildos",   label: "BuildOS",          icon: LayoutDashboard, href: "/dashboard" },
    { id: "journey",   label: "Product Journey",  icon: Map,             href: "/dashboard/journey" },
    { id: "products",  label: "Products",          icon: Globe,           href: "/dashboard/products" },
    { id: "portfolio", label: "Portfolio",         icon: ShieldCheck,     href: "/dashboard/portfolio" },
    { id: "settings",  label: "Settings",          icon: Settings,        href: "/dashboard/settings" },
  ];

  const userInitial = profile?.whoAreYouRole?.charAt(0)?.toUpperCase() ?? "N";

  const formatDate = (isoString: string | null) => {
    if (!isoString) return null;
    try {
      return new Date(isoString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return null;
    }
  };

  const handleStartBuilding = async () => {
    try {
      const res = await fetch(
        `/api/journey/active?userId=${encodeURIComponent(userId)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.problemId) {
          router.push(`/journey/${data.problemId}?step=${data.currentPhase || 1}`);
          return;
        }
      }
    } catch (e) {}
    router.push("/journey/P000001?step=1");
  };

  const handleProjectClick = (problemId: string, currentPhase: number) => {
    router.push(`/journey/${problemId}?step=${currentPhase || 1}`);
  };

  return (
    <div className="h-screen bg-[#F5F5F0] text-zinc-900 font-sans antialiased selection:bg-teal-700 selection:text-white flex flex-col lg:flex-row overflow-hidden">
      {/* ================================================================ */}
      {/* SIDEBAR                                                            */}
      {/* ================================================================ */}
      <aside className="w-full lg:w-[210px] h-auto lg:h-screen bg-white border-b lg:border-b-0 lg:border-r border-zinc-200 flex flex-col justify-between shrink-0 py-6 px-4 overflow-y-auto lg:sticky lg:top-0 z-30">
        <div className="flex flex-col gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-zinc-900 font-bold no-underline group px-1"
          >
            <div className="h-8 w-8 rounded-xl bg-teal-700 flex items-center justify-center text-white font-black text-xs font-mono shadow-sm shadow-teal-700/20 group-hover:scale-105 transition-transform shrink-0">
              <Terminal className="h-4 w-4 text-white" />
            </div>
            <div className="leading-tight">
              <span className="font-bold text-base block text-zinc-900 tracking-tight">
                BuildOS
              </span>
              <span className="text-[10px] font-mono text-teal-700 block font-semibold -mt-0.5">
                MakeMistakes OS v6.0
              </span>
            </div>
          </Link>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === "portfolio";
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.href !== "#") router.push(item.href);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-sans transition-all cursor-pointer border ${
                    isActive
                      ? "bg-teal-50 border-teal-100 text-teal-900 font-semibold"
                      : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 border-transparent font-normal"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? "text-teal-700" : "text-zinc-400"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="px-1 pt-4">
          <div className="h-9 w-9 rounded-full bg-zinc-800 flex items-center justify-center text-white text-xs font-bold font-mono select-none">
            {userInitial}
          </div>
        </div>
      </aside>

      {/* ================================================================ */}
      {/* MAIN CONTENT                                                       */}
      {/* ================================================================ */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        {/* Header */}
        <header className="h-14 border-b border-zinc-200 bg-white px-7 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div>
            <h1 className="text-sm font-bold text-zinc-900 tracking-tight font-sans">
              Portfolio
            </h1>
            <p className="text-[11px] text-zinc-400 font-sans -mt-0.5">
              Verified Proof of Work
            </p>
          </div>

          <button
            onClick={fetchPortfolioData}
            title="Reload Portfolio Data"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 text-xs font-mono transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-teal-700" : ""}`} />
            <span>Refresh</span>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6 sm:p-8 max-w-6xl mx-auto w-full space-y-8">
          {/* ============================================================ */}
          {/* BANNER                                                       */}
          {/* ============================================================ */}
          <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-zinc-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-3 max-w-2xl">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 font-mono text-xs font-semibold uppercase tracking-wider">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
                <span>My Portfolio</span>
              </span>

              <h2 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight leading-tight text-white">
                Your products, your progress, your journey.
              </h2>

              <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
                Every project card below is dynamically compiled from your active database problem journeys and verified milestones on MakeMistakes OS.
              </p>
            </div>
          </div>

          {/* ============================================================ */}
          {/* NAVIGATION TABS                                              */}
          {/* ============================================================ */}
          <div className="flex items-center gap-2 border-b border-zinc-200 pb-3 overflow-x-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 rounded-xl text-xs font-sans font-semibold transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-teal-800 text-white shadow-xs"
                  : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-xl text-xs font-sans font-semibold transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-teal-800 text-white shadow-xs"
                  : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              All Projects ({projects.length})
            </button>
            <button
              onClick={() => setActiveTab("milestones")}
              className={`px-4 py-2 rounded-xl text-xs font-sans font-semibold transition-all cursor-pointer ${
                activeTab === "milestones"
                  ? "bg-teal-800 text-white shadow-xs"
                  : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              Milestones & Achievements
            </button>
            <button
              onClick={() => setActiveTab("certificates")}
              className={`px-4 py-2 rounded-xl text-xs font-sans font-semibold transition-all cursor-pointer ${
                activeTab === "certificates"
                  ? "bg-teal-800 text-white shadow-xs"
                  : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              Certificates
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`px-4 py-2 rounded-xl text-xs font-sans font-semibold transition-all cursor-pointer ${
                activeTab === "activity"
                  ? "bg-teal-800 text-white shadow-xs"
                  : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              Activity
            </button>
          </div>

          {/* ============================================================ */}
          {/* STATS SUMMARY BAR                                            */}
          {/* ============================================================ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
              <span className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider block">
                Projects Built
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-zinc-900">
                  {summary.projectsBuilt}
                </span>
                <span className="text-xs text-zinc-500 font-sans">
                  / {summary.totalProjects} started
                </span>
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
              <span className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider block">
                Phases Completed
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-teal-800">
                  {summary.phasesCompleted}
                </span>
                <span className="text-xs text-zinc-500 font-sans">
                  total phases
                </span>
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
              <span className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider block">
                Portfolio Progress
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-emerald-700">
                  {summary.portfolioProgress}%
                </span>
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
              <span className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider block">
                Achievements
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-amber-700">
                  {summary.achievements.filter((a) => a.unlocked).length}
                </span>
                <span className="text-xs text-zinc-500 font-sans">
                  / {summary.achievements.length} unlocked
                </span>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* MAIN SECTION: MY PROJECTS                                    */}
          {/* ============================================================ */}
          {(activeTab === "overview" || activeTab === "all") && (
            <section className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-serif font-bold text-zinc-900">
                    My Projects
                  </h3>
                  <p className="text-xs text-zinc-500 font-sans mt-0.5">
                    Real database problem statements and journey progress for your identity.
                  </p>
                </div>

                <button
                  onClick={handleStartBuilding}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-white text-xs font-semibold font-sans transition-all cursor-pointer shadow-xs"
                >
                  <span>Start New Challenge</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {loading ? (
                <div className="py-16 text-center bg-white border border-zinc-200 rounded-2xl">
                  <RefreshCw className="h-6 w-6 animate-spin text-teal-700 mx-auto mb-2" />
                  <p className="text-xs font-mono text-zinc-400">Loading database projects...</p>
                </div>
              ) : projects.length === 0 ? (
                /* EMPTY STATE */
                <div className="bg-white border border-zinc-200 rounded-3xl p-10 sm:p-14 text-center max-w-xl mx-auto space-y-5 shadow-xs">
                  <div className="h-16 w-16 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-center text-teal-700 mx-auto">
                    <FolderPlus className="h-8 w-8 text-teal-700" />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xl font-serif font-bold text-zinc-900">
                      No projects yet.
                    </h4>
                    <p className="text-xs text-zinc-500 font-sans leading-relaxed max-w-md mx-auto">
                      You haven&apos;t started any product challenges yet. Begin your first problem statement to start building your verified portfolio.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleStartBuilding}
                      className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-teal-800 hover:bg-teal-700 text-white text-xs font-semibold font-sans transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
                    >
                      <span>Start Your First Product →</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* PROJECT CARDS GRID */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map((project) => {
                    const isDone = project.status === "Completed";
                    const formattedCompDate = formatDate(project.completionDate);
                    const formattedWorkDate = formatDate(project.lastWorkedDate);

                    return (
                      <div
                        key={project.problemId}
                        onClick={() => handleProjectClick(project.problemId, project.currentPhase)}
                        className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          {/* Header badges */}
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-mono font-bold bg-teal-50 border border-teal-100 text-teal-800 px-2.5 py-0.5 rounded-md">
                                {project.problemId}
                              </span>
                              <span className="text-[11px] font-mono text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md">
                                {project.category}
                              </span>
                            </div>

                            <span
                              className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                                isDone
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : project.status === "In Progress"
                                  ? "bg-teal-100 text-teal-900 border border-teal-200"
                                  : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                              }`}
                            >
                              {isDone && <CheckCircle2 className="h-3 w-3 text-emerald-700" />}
                              {project.status}
                            </span>
                          </div>

                          {/* Title */}
                          <h4 className="text-base font-bold font-sans text-zinc-900 group-hover:text-teal-800 transition-colors line-clamp-2">
                            {project.title}
                          </h4>

                          {/* Description */}
                          <p className="text-xs text-zinc-600 font-sans leading-relaxed line-clamp-3">
                            {project.description}
                          </p>

                          {/* Tech stack pills if present */}
                          {project.techStack && project.techStack.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {project.techStack.map((tech, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="text-[10px] font-mono bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded border border-zinc-200"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Progress Bar & Details */}
                        <div className="space-y-4 pt-4 border-t border-zinc-100">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-mono">
                              <span className="text-zinc-600 font-semibold">
                                {project.completedPhases} / {project.totalPhases} Phases Completed
                              </span>
                              <span className="text-teal-800 font-bold">
                                {project.progressPercentage}%
                              </span>
                            </div>

                            <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  isDone ? "bg-emerald-600" : "bg-teal-700"
                                }`}
                                style={{ width: `${project.progressPercentage}%` }}
                              />
                            </div>
                          </div>

                          {/* Date details */}
                          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                            {isDone && formattedCompDate ? (
                              <span className="flex items-center gap-1 text-emerald-700">
                                <CheckCircle2 className="h-3 w-3" />
                                Completed: {formattedCompDate}
                              </span>
                            ) : formattedWorkDate ? (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-zinc-400" />
                                Last worked: {formattedWorkDate}
                              </span>
                            ) : (
                              <span>Phase {project.currentPhase} active</span>
                            )}

                            {/* GitHub & Live links if present */}
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              {project.githubUrl && (
                                <a
                                  href={project.githubUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="View GitHub Repository"
                                  className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors"
                                >
                                  <Github className="h-3.5 w-3.5" />
                                </a>
                              )}
                              {project.liveUrl && (
                                <a
                                  href={project.liveUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="View Live Demo"
                                  className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 transition-colors"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              )}
                            </div>
                          </div>

                          {/* CTA Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProjectClick(project.problemId, project.currentPhase);
                            }}
                            className={`w-full py-2.5 rounded-xl text-xs font-semibold font-sans transition-all flex items-center justify-center gap-2 cursor-pointer ${
                              isDone
                                ? "bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900"
                                : "bg-teal-800 hover:bg-teal-700 text-white shadow-xs"
                            }`}
                          >
                            <span>
                              {isDone
                                ? "View Completed Project"
                                : project.completedPhases > 0
                                ? `Resume Phase ${project.currentPhase}`
                                : "Start Challenge"}
                            </span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* ============================================================ */}
          {/* MILESTONES & ACHIEVEMENTS TAB                                */}
          {/* ============================================================ */}
          {(activeTab === "overview" || activeTab === "milestones") && (
            <section className="bg-white border border-zinc-200 rounded-3xl p-7 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                <Trophy className="h-5 w-5 text-amber-600" />
                <h3 className="text-lg font-serif font-bold text-zinc-900">
                  Milestones & Achievements
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {summary.achievements.map((ach) => (
                  <div
                    key={ach.id}
                    className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all ${
                      ach.unlocked
                        ? "bg-amber-50/50 border-amber-200 text-zinc-900"
                        : "bg-zinc-50 border-zinc-200 opacity-60 text-zinc-500"
                    }`}
                  >
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 text-sm ${
                        ach.unlocked
                          ? "bg-amber-100 text-amber-800 border border-amber-300 font-bold"
                          : "bg-zinc-200 text-zinc-400"
                      }`}
                    >
                      {ach.unlocked ? "🏆" : "🔒"}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold font-sans text-zinc-900">
                          {ach.title}
                        </h4>
                        {ach.unlocked && (
                          <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded uppercase">
                            Unlocked
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-600 font-sans mt-0.5 leading-relaxed">
                        {ach.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ============================================================ */}
          {/* CERTIFICATES TAB                                             */}
          {/* ============================================================ */}
          {activeTab === "certificates" && (
            <section className="bg-white border border-zinc-200 rounded-3xl p-8 text-center space-y-4 shadow-xs">
              <Award className="h-10 w-10 text-teal-700 mx-auto" />
              <h3 className="text-lg font-serif font-bold text-zinc-900">
                Verified Audit Certificates
              </h3>
              <p className="text-xs text-zinc-500 font-sans max-w-md mx-auto leading-relaxed">
                Complete a product challenge through all 8 phases to generate your cryptographically verified Socratic Audit Certificate.
              </p>

              {summary.projectsBuilt > 0 ? (
                <div className="pt-2 flex justify-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>{summary.projectsBuilt} Certificate(s) Ready for Export</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs font-mono text-zinc-400">
                  No completed products available yet.
                </p>
              )}
            </section>
          )}

          {/* ============================================================ */}
          {/* ACTIVITY TAB                                                 */}
          {/* ============================================================ */}
          {activeTab === "activity" && (
            <section className="bg-white border border-zinc-200 rounded-3xl p-7 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                <Activity className="h-5 w-5 text-teal-700" />
                <h3 className="text-lg font-serif font-bold text-zinc-900">
                  Recent Journey Activity
                </h3>
              </div>

              <div className="space-y-3">
                {projects.map((p) => (
                  <div
                    key={p.problemId}
                    className="p-3.5 rounded-xl border border-zinc-100 bg-zinc-50/50 flex items-center justify-between text-xs font-sans"
                  >
                    <div className="flex items-center gap-3">
                      <Code2 className="h-4 w-4 text-teal-700" />
                      <div>
                        <p className="font-semibold text-zinc-900">{p.title}</p>
                        <p className="text-[10px] font-mono text-zinc-400">
                          {p.problemId} • {p.completedPhases} of {p.totalPhases} phases completed
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-500">
                      {formatDate(p.lastWorkedDate) || "Active"}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
