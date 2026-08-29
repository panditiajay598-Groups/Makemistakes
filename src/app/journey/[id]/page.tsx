"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Terminal,
  Map,
  Globe,
  ShieldCheck,
  Users,
  Settings,
  ArrowLeft,
  CheckCircle2,
  LayoutDashboard,
} from "lucide-react";
import { getOnboardingProfile, UserOnboardingProfile } from "@/lib/onboardingStore";
import { getJourneyUserId } from "@/lib/journeyUser";
import { clearProblemJourneyData } from "@/lib/productJourney/journeyStore";
import type { ProblemData } from "@/lib/problemContent";

import DiscoverPhase from "@/components/journey/DiscoverPhase";
import ResearchPhase from "@/components/journey/ResearchPhase";
import DesignPhase from "@/components/journey/DesignPhase";
import PlanPhase from "@/components/journey/PlanPhase";
import BuildPhase from "@/components/journey/BuildPhase";
import TestPhase from "@/components/journey/TestPhase";
import GitHubPushPhase from "@/components/journey/GitHubPushPhase";
import ImprovePhase from "@/components/journey/ImprovePhase";
import PortfolioShowcase from "@/components/journey/PortfolioShowcase";
import ProblemCompletionModal from "@/components/journey/ProblemCompletionModal";

type JourneyStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

function journeyStepStorageKey(userId: string, problemId: string) {
  const cleanUser = (userId || "default_user").toString().trim().toLowerCase();
  return `makemistakes_journey_v2_step_${cleanUser}_${problemId}`;
}

function loadJourneyStep(userId: string, problemId: string): JourneyStep {
  if (typeof window === "undefined") return 1;
  try {
    const raw = localStorage.getItem(journeyStepStorageKey(userId, problemId));
    const n = raw ? parseInt(raw, 10) : NaN;
    if (n >= 1 && n <= 9) return n as JourneyStep;
  } catch {
    /* ignore */
  }
  return 1;
}

function saveJourneyStep(userId: string, problemId: string, step: JourneyStep) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(journeyStepStorageKey(userId, problemId), String(step));
  } catch {
    /* ignore */
  }
}

export default function GenericProblemJourneyPage() {
  const router = useRouter();
  const params = useParams();
  const userId = getJourneyUserId();

  // Extract exact route problemId from URL params
  const targetId = params?.id ? (Array.isArray(params.id) ? params.id[0] : (params.id as string)) : null;
  const rawId = targetId || "P000001";

  const [profile, setProfile] = useState<UserOnboardingProfile | null>(null);
  const [currentStep, setCurrentStep] = useState<JourneyStep>(1);
  const [stepHydrated, setStepHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState("journey");

  // Problem details & error state from MongoDB (includes difficulty / learning / build when present)
  const [problemData, setProblemData] = useState<ProblemData | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Completion modal state
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completedProblemInfo, setCompletedProblemInfo] = useState<{ problemId: string; title: string }>({
    problemId: rawId,
    title: "Product Challenge"
  });
  const [nextProblemInfo, setNextProblemInfo] = useState<{
    problemId: string;
    title: string;
    category?: string;
    level?: string | null;
  } | null>(null);

  useEffect(() => {
    const activeProf = getOnboardingProfile();
    setProfile(activeProf);
    if (!activeProf?.onboardingCompleted) {
      router.push("/onboarding");
    }
  }, [router]);

  // One-time localStorage cleanup: remove ALL old v1 storage keys.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const CLEANUP_DONE_KEY = "mmp_v1_cleanup_completed_v2";
    if (localStorage.getItem(CLEANUP_DONE_KEY) === "true") return;

    try {
      let removed = 0;
      Object.keys(localStorage)
        .filter((k) => k.startsWith("makemistakes_"))
        .forEach((k) => {
          const keep =
            k.includes("_v2_") ||
            k.includes("_v3_") ||
            k.includes("_v2_cleaned") ||
            k.includes("_v2_data_");
          if (!keep) {
            localStorage.removeItem(k);
            removed++;
          }
        });

      localStorage.setItem(CLEANUP_DONE_KEY, "true");
    } catch (e) {
      console.warn("[MMP Cleanup] localStorage cleanup failed:", e);
    }
  }, []);

  // Fetch problem details + restore last journey step for this problem (refresh-safe & server-synced)
  useEffect(() => {
    if (!targetId) return;
    let isSubscribed = true;

    async function fetchProblemAndJourney() {
      try {
        setFetchError(null);

        // Check URL query parameters (e.g. ?step=1 or ?reset=true)
        let hasExplicitUrlStep = false;
        let urlStepVal: JourneyStep = 1;

        if (typeof window !== "undefined") {
          const urlParams = new URLSearchParams(window.location.search);
          const urlStep = urlParams.get("step");
          const isReset = urlParams.get("reset") === "true";

          if (isReset) {
            hasExplicitUrlStep = true;
            urlStepVal = 1;
            clearProblemJourneyData(targetId!);
            saveJourneyStep(userId, targetId!, 1);
          } else if (urlStep && !isNaN(parseInt(urlStep, 10))) {
            const parsed = parseInt(urlStep, 10);
            if (parsed >= 1 && parsed <= 9) {
              hasExplicitUrlStep = true;
              urlStepVal = parsed as JourneyStep;
              saveJourneyStep(userId, targetId!, urlStepVal);
            }
          }
        }

        // 1. Fetch problem content details
        const res = await fetch(`/api/journey/problem?id=${encodeURIComponent(targetId!)}&userId=${encodeURIComponent(userId)}`);
        if (res.ok && isSubscribed) {
          const data = await res.json();
          setProblemData(data);
          setCompletedProblemInfo({
            problemId: data.problemId || targetId!,
            title: data.title || "Product Challenge",
          });
        } else if (isSubscribed) {
          const errData = await res.json().catch(() => ({}));
          setFetchError(errData.error || `Problem '${targetId}' was not found.`);
        }

        // 2. Fetch server user journey state to resolve exact currentPhase
        let serverStep: JourneyStep = 1;
        try {
          const uRes = await fetch(`/api/journey/user-data?userId=${encodeURIComponent(userId)}&problemId=${encodeURIComponent(targetId!)}`);
          if (uRes.ok) {
            const uData = await uRes.json();
            if (typeof uData.currentPhase === "number" && uData.currentPhase >= 1 && uData.currentPhase <= 9) {
              serverStep = uData.currentPhase as JourneyStep;
            }
          }
        } catch (uErr) {
          console.warn("[JourneyPage] Server user-data load warning:", uErr);
        }

        if (isSubscribed) {
          const finalStep = hasExplicitUrlStep ? urlStepVal : (serverStep || loadJourneyStep(userId, targetId!));
          setCurrentStep(finalStep);
          saveJourneyStep(userId, targetId!, finalStep);
          setStepHydrated(true);
        }
      } catch {
        if (isSubscribed) {
          setFetchError("Failed to connect to problem database.");
        }
      }
    }

    setStepHydrated(false);
    setProblemData(null);
    fetchProblemAndJourney();
    window.scrollTo({ top: 0, behavior: "smooth" });

    return () => {
      isSubscribed = false;
    };
  }, [targetId, userId]);

  // Listen for browser Back/Forward navigation (popstate)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const urlStep = urlParams.get("step");
      if (urlStep && !isNaN(parseInt(urlStep, 10))) {
        const parsed = parseInt(urlStep, 10);
        if (parsed >= 1 && parsed <= 9) {
          setCurrentStep(parsed as JourneyStep);
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Persist current step whenever it changes (sync both localStorage & MongoDB)
  useEffect(() => {
    if (!targetId || !stepHydrated) return;
    saveJourneyStep(userId, targetId, currentStep);

    // Sync to Server MongoDB user_journeys record
    fetch("/api/journey/user-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        problemId: targetId,
        currentPhase: currentStep,
      }),
    }).catch((err) => console.warn("[JourneyPage] Server step sync warning:", err));

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const currentUrlStep = url.searchParams.get("step");
      if (currentUrlStep !== String(currentStep)) {
        url.searchParams.set("step", String(currentStep));
        window.history.pushState({ step: currentStep }, "", url.toString());
      }
    }
  }, [targetId, currentStep, stepHydrated, userId]);

  const navItems = [
    { id: "buildos",   label: "BuildOS",          icon: LayoutDashboard, href: "/dashboard" },
    { id: "journey",   label: "Product Journey",  icon: Map,             href: "/dashboard/journey" },
    { id: "products",  label: "Products",          icon: Globe,           href: "/dashboard/products" },
    { id: "portfolio", label: "Portfolio",         icon: ShieldCheck,     href: "/dashboard/portfolio" },
    { id: "network",   label: "Builder Network",   icon: Users,           href: "#" },
    { id: "settings",  label: "Settings",          icon: Settings,        href: "/dashboard/settings" },
  ];

  const userInitial = profile?.whoAreYouRole?.charAt(0)?.toUpperCase() ?? "N";

  const nextStep = () => {
    if (currentStep === 8) {
      // Phase 8 (Improve) Complete — Handle Problem Completion
      handleCompleteJourney();
    } else if (currentStep < 9) {
      setCurrentStep((prev) => (prev + 1) as JourneyStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as JourneyStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const redirectingRef = useRef(false);

  const handleCompleteJourney = async () => {
    try {
      const res = await fetch("/api/journey/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId: rawId, userId: getJourneyUserId() }),
      });
      if (res.ok) {
        const data = await res.json();
        setCompletedProblemInfo(
          data.completedProblem || {
            problemId: rawId,
            title: problemData?.title || "Product Challenge",
          }
        );
        setNextProblemInfo(data.nextProblem || null);
        setShowCompletionModal(true);
      } else {
        setShowCompletionModal(true);
      }
    } catch (e) {
      console.warn("Completion API call error:", e);
      setShowCompletionModal(true);
    }
  };

  const handleStartNextChallenge = useCallback((nextId: string) => {
    if (!nextId || redirectingRef.current) return;
    redirectingRef.current = true;
    setShowCompletionModal(false);
    // New problem always starts at Discover with clean slate
    clearProblemJourneyData(nextId);
    saveJourneyStep(userId, nextId, 1);
    setCurrentStep(1);
    window.location.href = `/journey/${nextId}?step=1&reset=true`;
  }, []);

  const stepMeta = [
    { number: 1, title: "Discover", subtitle: "Discover the Problem" },
    { number: 2, title: "Research", subtitle: "What Already Exists?" },
    { number: 3, title: "Design", subtitle: "Design the Solution" },
    { number: 4, title: "Plan", subtitle: "Plan the Engineering Work" },
    { number: 5, title: "Build", subtitle: "Build the Product" },
    { number: 6, title: "Test", subtitle: "Validate the Product" },
    { number: 7, title: "Push to GitHub", subtitle: "Publish Code & Portfolio" },
    { number: 8, title: "Improve", subtitle: "Build Version 1.1" },
  ];

  return (
    <div className="h-screen bg-[#F5F5F0] text-zinc-900 font-sans antialiased selection:bg-teal-700 selection:text-white flex flex-col lg:flex-row overflow-hidden">

      {/* SIDEBAR */}
      {currentStep !== 5 && (
        <aside className="w-full lg:w-[210px] h-auto lg:h-screen bg-white border-b lg:border-b-0 lg:border-r border-zinc-200 flex flex-col justify-between shrink-0 py-6 px-4 overflow-y-auto lg:sticky lg:top-0 z-30">
          <div className="flex flex-col gap-6">

            {/* Brand */}
            <Link
              href="/"
              className="flex items-center gap-2.5 text-zinc-900 font-bold no-underline group px-1"
            >
              <div className="h-8 w-8 rounded-xl bg-teal-700 flex items-center justify-center text-white font-black text-xs font-mono shadow-sm shadow-teal-700/20 group-hover:scale-105 transition-transform shrink-0">
                <Terminal className="h-4 w-4 text-white" />
              </div>
              <div className="leading-tight">
                <span className="font-bold text-base block text-zinc-900 tracking-tight">BuildOS</span>
                <span className="text-[10px] font-mono text-teal-700 block font-semibold -mt-0.5">
                  MakeMistakes OS v6.0
                </span>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
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

          {/* User avatar */}
          <div className="px-1 pt-4">
            <div className="h-9 w-9 rounded-full bg-zinc-800 flex items-center justify-center text-white text-xs font-bold font-mono select-none">
              {userInitial}
            </div>
          </div>
        </aside>
      )}

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">

        {/* Top Stepper Navigation (Hidden on Step 1..8 for clean design) */}
        {currentStep > 8 && (
          <header className="bg-white border-b border-zinc-200 px-6 sm:px-12 lg:px-16 py-4 flex items-center justify-between sticky top-0 z-20 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-full uppercase">
                Product Journey
              </span>
              <span className="text-zinc-300">•</span>
              <span className="text-xs font-mono text-zinc-500">
                Phase {currentStep} of 8
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              {stepMeta.map((s) => {
                const isCurrent = currentStep === s.number;
                const isPast = currentStep > s.number;
                return (
                  <button
                    key={s.number}
                    onClick={() => setCurrentStep(s.number as JourneyStep)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-teal-700 text-white font-bold shadow-xs"
                        : isPast
                        ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                        : "bg-zinc-100 text-zinc-400 hover:text-zinc-700"
                    }`}
                  >
                    <span>{s.number}.</span>
                    <span>{s.title}</span>
                    {isPast && <CheckCircle2 className="h-3 w-3 text-emerald-600 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </header>
        )}

        {/* Main Content Area */}
        <main key={rawId} className={`flex-1 overflow-y-auto w-full mx-auto ${currentStep === 5 ? "p-0 max-w-none" : "max-w-[1550px] px-6 sm:px-12 lg:px-16 py-6"}`}>

          {/* EMPTY DATABASE STATE */}
          {fetchError ? (
            <div className="w-full max-w-2xl mx-auto my-16 p-8 sm:p-12 rounded-3xl bg-white border border-zinc-200 shadow-xl text-center space-y-6">
              <div className="h-16 w-16 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Map className="h-8 w-8 text-amber-600" />
              </div>
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold tracking-wider text-amber-800 bg-amber-100/70 border border-amber-200 px-3.5 py-1 rounded-full uppercase">
                  PROBLEM LIBRARY EMPTY
                </span>
                <h2 className="text-2xl font-bold text-zinc-900 font-sans tracking-tight">
                  No problems available yet
                </h2>
                <p className="text-sm text-zinc-500 font-sans max-w-md mx-auto leading-relaxed">
                  Your next problem will appear here once the Problem Library is loaded.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-teal-800 hover:bg-teal-700 text-white text-xs font-semibold font-mono transition-all shadow-sm cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* SCREEN 1 — DISCOVER */}
              {currentStep === 1 && (
                <DiscoverPhase
                  key={rawId}
                  userId={userId}
                  problemData={problemData}
                  onComplete={nextStep}
                  onBackToJourney={() => router.push("/dashboard/journey")}
                />
              )}

              {/* SCREEN 2 — RESEARCH */}
              {currentStep === 2 && (
                <ResearchPhase
                  key={rawId}
                  userId={userId}
                  problemData={problemData}
                  onComplete={nextStep}
                  onBackToJourney={() => router.push("/dashboard/journey")}
                />
              )}

              {/* SCREEN 3 — DESIGN */}
              {currentStep === 3 && (
                <DesignPhase
                  key={rawId}
                  problemData={problemData}
                  onComplete={nextStep}
                  onBackToJourney={() => router.push("/dashboard/journey")}
                />
              )}

              {/* SCREEN 4 — PLAN */}
              {currentStep === 4 && (
                <PlanPhase
                  key={rawId}
                  problemData={problemData}
                  onComplete={nextStep}
                  onBackToJourney={() => router.push("/dashboard/journey")}
                />
              )}

              {/* SCREEN 5 — BUILD */}
              {currentStep === 5 && (
                <BuildPhase
                  key={rawId}
                  problemData={problemData}
                  onComplete={nextStep}
                  onBackToJourney={() => router.push("/dashboard/journey")}
                />
              )}

              {/* SCREEN 6 — TEST */}
              {currentStep === 6 && (
                <TestPhase
                  key={rawId}
                  problemData={problemData}
                  onComplete={nextStep}
                  onBackToJourney={() => router.push("/dashboard/journey")}
                />
              )}

              {/* SCREEN 7 — GITHUB PUSH */}
              {currentStep === 7 && (
                <GitHubPushPhase
                  key={rawId}
                  userId={userId}
                  problemData={problemData}
                  onComplete={nextStep}
                  onBackToJourney={() => router.push("/dashboard/journey")}
                />
              )}

              {/* SCREEN 8 — IMPROVE */}
              {currentStep === 8 && (
                <ImprovePhase
                  key={rawId}
                  problemData={problemData}
                  onComplete={nextStep}
                  onBackToJourney={() => router.push("/dashboard/journey")}
                />
              )}

              {/* SCREEN 9 — PORTFOLIO SHOWCASE */}
              {currentStep === 9 && (
                <PortfolioShowcase
                  key={rawId}
                  problemData={problemData}
                  onBackToDashboard={() => router.push("/dashboard")}
                />
              )}
            </>
          )}

        </main>
      </div>

      {/* PROBLEM COMPLETION & NEXT CHALLENGE MODAL */}
      {showCompletionModal && (
        <ProblemCompletionModal
          completedProblem={completedProblemInfo}
          nextProblem={nextProblemInfo}
          onStartNextChallenge={handleStartNextChallenge}
          onViewPortfolio={() => {
            setShowCompletionModal(false);
            router.push("/dashboard");
          }}
        />
      )}
    </div>
  );
}
