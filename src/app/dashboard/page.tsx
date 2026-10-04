"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Globe,
  ShieldCheck,
  Settings,
  Terminal,
  ArrowRight,
  Search,
  CheckCircle2,
  Lock,
  Unlock,
  RefreshCw,
  Sparkles,
  BookOpen,
  Filter,
  X,
  Play,
  Zap,
  AlertCircle,
  Layers,
} from "lucide-react";
import { getOnboardingProfile, UserOnboardingProfile } from "@/lib/onboardingStore";
import { getJourneyUserId } from "@/lib/journeyUser";

interface ProductCatalogItem {
  problemId: string;
  title: string;
  problemStatement: string;
  description: string;
  category: string;
  difficulty: string | null;
  country: string | null;
  source: { name?: string; type?: string } | null;
  relatedInformation: { context?: string } | null;
  skills: string[];
  estimatedHours: number | null;
  userStatus: "not_started" | "in_progress" | "completed";
  completedPhases: number;
  currentPhase: number;
  totalPhases: number;
  isLocked?: boolean;
}

interface UnlockProgress {
  completedBeginner: number;
  beginnerTotal: number;
  beginnerRequired: number;
  completedIntermediate: number;
  intermediateTotal: number;
  intermediateRequired: number;
  advancedTotal: number;
  advancedUnlocked: boolean;
}

export default function BuildOSPage() {
  const router = useRouter();
  const userId = getJourneyUserId();

  const [profile, setProfile] = useState<UserOnboardingProfile | null>(null);
  const [activeTab, setActiveTab] = useState("buildos");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductCatalogItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [difficulties, setDifficulties] = useState<string[]>([]);
  const [unlockProgress, setUnlockProgress] = useState<UnlockProgress | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  // Selected detail modal
  const [selectedProduct, setSelectedProduct] = useState<ProductCatalogItem | null>(null);

  // Onboarding route guard
  useEffect(() => {
    const activeProf = getOnboardingProfile();
    setProfile(activeProf);
    if (!activeProf?.onboardingCompleted) {
      router.push("/onboarding");
    }
  }, [router]);

  // Fetch problem statements from database API
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        userId,
        search: searchQuery,
        category: selectedCategory,
        difficulty: selectedDifficulty,
        sort: "numerical_asc",
      });

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        if (data.categories) setCategories(data.categories);
        if (data.difficulties) setDifficulties(data.difficulties);
        if (data.unlockProgress) setUnlockProgress(data.unlockProgress);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || "Failed to load problem statements from database.");
      }
    } catch (err: any) {
      console.error("Error fetching problems:", err);
      setError("Network error while loading problem statements.");
    } finally {
      setLoading(false);
    }
  }, [userId, searchQuery, selectedCategory, selectedDifficulty]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const navItems = [
    { id: "buildos",   label: "BuildOS",          icon: LayoutDashboard, href: "/dashboard" },
    { id: "journey",   label: "Product Journey",  icon: Map,             href: "/dashboard/journey" },
    { id: "products",  label: "Products",          icon: Globe,           href: "/dashboard/products" },
    { id: "portfolio", label: "Portfolio",         icon: ShieldCheck,     href: "/dashboard/portfolio" },
    { id: "settings",  label: "Settings",          icon: Settings,        href: "/dashboard/settings" },
  ];

  const userInitial = profile?.whoAreYouRole?.charAt(0)?.toUpperCase() ?? "B";

  // Calculate summary metrics
  const inProgressCount = products.filter((p) => p.userStatus === "in_progress").length;
  const completedCount = products.filter((p) => p.userStatus === "completed").length;
  const activeProblem = products.find((p) => p.userStatus === "in_progress");

  return (
    <div className="h-screen bg-[#F5F5F0] text-zinc-900 font-sans antialiased selection:bg-teal-700 selection:text-white flex flex-col lg:flex-row overflow-hidden">

      {/* ================================================================ */}
      {/* SIDEBAR                                                            */}
      {/* ================================================================ */}
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

      {/* ================================================================ */}
      {/* MAIN CONTENT                                                       */}
      {/* ================================================================ */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">

        {/* Top Header */}
        <header className="h-14 border-b border-zinc-200 bg-white px-7 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div>
            <h1 className="text-sm font-bold text-zinc-900 tracking-tight font-sans">
              BuildOS Dashboard
            </h1>
            <p className="text-[11px] text-zinc-400 font-sans -mt-0.5">
              Select a Problem Statement & Start Building
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono font-medium text-teal-800 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full">
              <Sparkles className="h-3.5 w-3.5 text-teal-600" />
              {products.length} Problems Available
            </span>
            <a
              href="/onboarding?reset=true"
              className="text-xs font-mono text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              Reset Onboarding ↺
            </a>
          </div>
        </header>

        {/* Dashboard Main Content */}
        <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">

          {/* Welcome Banner & Stats */}
          <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-zinc-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-teal-950/10 relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-200 font-mono text-[11px] font-semibold">
                  <Terminal className="h-3.5 w-3.5" />
                  MakeMistakes OS • Product Library
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                  Welcome to your Builder Workspace.
                </h2>
                <p className="text-zinc-300 text-xs sm:text-sm font-sans leading-relaxed">
                  Choose a real-world problem statement from our database below. Walk through the 8-phase Product Engineering workflow to research, design, spec, and ship your solution.
                </p>
              </div>

              {/* Stat Counters */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center min-w-[100px]">
                  <div className="text-2xl font-bold font-mono text-white">{products.length}</div>
                  <div className="text-[10px] font-mono text-teal-200 uppercase tracking-wider">Total</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center min-w-[100px]">
                  <div className="text-2xl font-bold font-mono text-amber-300">{inProgressCount}</div>
                  <div className="text-[10px] font-mono text-amber-200 uppercase tracking-wider">Building</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center min-w-[100px]">
                  <div className="text-2xl font-bold font-mono text-emerald-300">{completedCount}</div>
                  <div className="text-[10px] font-mono text-emerald-200 uppercase tracking-wider">Shipped</div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Mission Hero (If user has problem in progress) */}
          {activeProblem && (
            <div className="bg-white border border-teal-200 rounded-2xl p-6 shadow-md shadow-teal-500/5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-teal-700">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono font-bold text-[11px] animate-pulse">
                    ⚡ In Progress
                  </span>
                  <span className="text-xs font-mono font-semibold text-zinc-500">
                    Phase {activeProblem.currentPhase} of {activeProblem.totalPhases}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-lg text-zinc-900">
                  {activeProblem.title}
                </h3>
                <p className="text-xs text-zinc-600 line-clamp-1">
                  {activeProblem.problemStatement}
                </p>
              </div>

              <button
                onClick={() => router.push(`/journey/${activeProblem.problemId}?step=${activeProblem.currentPhase}`)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-teal-800 hover:bg-teal-700 text-white font-semibold text-xs transition-all shadow-sm shrink-0 cursor-pointer"
              >
                <span>Continue Building (Phase {activeProblem.currentPhase})</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search problem statements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-sans text-zinc-800 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition-all"
              />
            </div>

            {/* Category & Difficulty Filters */}
            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono shrink-0">
                <Filter className="h-3.5 w-3.5 text-zinc-400" />
                <span>Filter:</span>
              </div>

              {/* Category Dropdown */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono text-zinc-700 focus:outline-none focus:ring-2 focus:ring-teal-600/30 cursor-pointer shrink-0"
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Difficulty Dropdown */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono text-zinc-700 focus:outline-none focus:ring-2 focus:ring-teal-600/30 cursor-pointer shrink-0"
              >
                <option value="All">All Difficulties</option>
                {difficulties.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff}
                  </option>
                ))}
              </select>

              <button
                onClick={fetchProducts}
                title="Refresh library"
                className="p-2 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer shrink-0"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-teal-700" : ""}`} />
              </button>
            </div>
          </div>

          {/* Problem Statements Header */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <h3 className="text-lg font-serif font-bold text-zinc-900 tracking-tight">
                Problem Statements
              </h3>
              <p className="text-xs text-zinc-500 font-sans">
                Select a problem statement to launch your 8-phase product build journey.
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              Showing {products.length} statement{products.length === 1 ? "" : "s"}
            </span>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-rose-800 text-xs font-sans">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Loading State */}
          {loading && products.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4 animate-pulse"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-20 bg-zinc-200 rounded-md" />
                    <div className="h-5 w-16 bg-zinc-200 rounded-md" />
                  </div>
                  <div className="h-6 w-3/4 bg-zinc-200 rounded-md" />
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-zinc-100 rounded" />
                    <div className="h-3 w-5/6 bg-zinc-100 rounded" />
                    <div className="h-3 w-2/3 bg-zinc-100 rounded" />
                  </div>
                  <div className="h-9 w-full bg-zinc-200 rounded-xl pt-4" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            /* Empty State */
            <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center space-y-3">
              <Layers className="h-10 w-10 text-zinc-300 mx-auto" />
              <h4 className="font-serif font-bold text-zinc-800 text-base">
                No matching problem statements found
              </h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Try adjusting your search query or reset filters to view all available problem statements in our database.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedDifficulty("All");
                }}
                className="mt-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-mono font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            /* Problem Statements Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const isLocked = product.isLocked;
                const isInProgress = product.userStatus === "in_progress";
                const isCompleted = product.userStatus === "completed";

                return (
                  <div
                    key={product.problemId}
                    className={`bg-white border rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 relative group hover:shadow-lg ${
                      isLocked
                        ? "border-zinc-200 bg-zinc-50/50 opacity-90"
                        : isInProgress
                        ? "border-teal-300 shadow-md shadow-teal-500/5 ring-1 ring-teal-500/20"
                        : isCompleted
                        ? "border-emerald-200 bg-emerald-50/10"
                        : "border-zinc-200 hover:border-teal-200"
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Card Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold bg-teal-50 border border-teal-100 text-teal-800 px-2.5 py-0.5 rounded-md">
                            {product.problemId}
                          </span>
                          {product.category && (
                            <span className="text-[11px] font-mono text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-md truncate max-w-[120px]">
                              {product.category}
                            </span>
                          )}
                        </div>

                        {/* Difficulty Badge */}
                        {product.difficulty && (
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                              product.difficulty === "Beginner"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : product.difficulty === "Intermediate"
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-purple-50 text-purple-800 border-purple-200"
                            }`}
                          >
                            {product.difficulty}
                          </span>
                        )}
                      </div>

                      {/* Card Title & Statement */}
                      <div>
                        <h4 className="font-serif font-bold text-base text-zinc-900 tracking-tight leading-snug group-hover:text-teal-800 transition-colors">
                          {product.title}
                        </h4>
                        <p className="mt-2 text-xs text-zinc-600 leading-relaxed line-clamp-3">
                          {product.problemStatement || product.description}
                        </p>
                      </div>

                      {/* Skills Tags */}
                      {product.skills && product.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {product.skills.slice(0, 3).map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              className="text-[10px] font-mono bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-md"
                            >
                              {skill}
                            </span>
                          ))}
                          {product.skills.length > 3 && (
                            <span className="text-[10px] font-mono text-zinc-400">
                              +{product.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card Footer & CTA */}
                    <div className="pt-5 mt-4 border-t border-zinc-100 flex items-center justify-between gap-3">
                      {/* Status indicator */}
                      <div className="text-[11px] font-mono">
                        {isLocked ? (
                          <span className="text-rose-600 font-semibold flex items-center gap-1">
                            <Lock className="h-3 w-3" /> Locked
                          </span>
                        ) : isCompleted ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Shipped
                          </span>
                        ) : isInProgress ? (
                          <span className="text-amber-700 font-semibold">
                            Phase {product.currentPhase}/8
                          </span>
                        ) : (
                          <span className="text-zinc-400">Ready to build</span>
                        )}
                      </div>

                      {/* Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-mono font-medium transition-colors cursor-pointer"
                        >
                          Details
                        </button>

                        <button
                          disabled={!!isLocked}
                          onClick={() => {
                            if (isLocked) return;
                            const step = product.currentPhase || 1;
                            router.push(`/journey/${product.problemId}?step=${step}`);
                          }}
                          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold font-sans transition-all cursor-pointer ${
                            isLocked
                              ? "bg-zinc-200 text-zinc-400 cursor-not-allowed border border-zinc-300"
                              : isInProgress
                              ? "bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                              : isCompleted
                              ? "bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
                              : "bg-teal-800 hover:bg-teal-700 text-white shadow-sm"
                          }`}
                        >
                          <span>
                            {isLocked
                              ? "🔒 Locked"
                              : isInProgress
                              ? "Continue"
                              : isCompleted
                              ? "Review"
                              : "Start Building"}
                          </span>
                          {!isLocked && <ArrowRight className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </main>

      </div>

      {/* ================================================================ */}
      {/* PROBLEM STATEMENT DETAIL MODAL                                     */}
      {/* ================================================================ */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white border border-zinc-200 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-teal-50 border border-teal-100 text-teal-800 px-2.5 py-0.5 rounded-md">
                    {selectedProduct.problemId}
                  </span>
                  {selectedProduct.category && (
                    <span className="text-xs font-mono text-zinc-500 bg-zinc-100 px-2.5 py-0.5 rounded-md">
                      {selectedProduct.category}
                    </span>
                  )}
                  {selectedProduct.difficulty && (
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-md ${
                        selectedProduct.isLocked
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {selectedProduct.difficulty} {selectedProduct.isLocked ? "🔒" : ""}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-serif font-bold text-zinc-900 pt-1">
                  {selectedProduct.title}
                </h2>
              </div>

              <button
                onClick={() => setSelectedProduct(null)}
                className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition-colors cursor-pointer shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Locked Notice Banner inside Modal if Advanced is locked */}
            {selectedProduct.isLocked && unlockProgress && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-2 text-rose-900">
                <div className="flex items-center gap-2 font-mono font-bold text-xs">
                  <Lock className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>🔒 Advanced Problem Locked</span>
                </div>
                <p className="text-xs font-sans leading-relaxed text-rose-800">
                  Complete <strong>{unlockProgress.beginnerRequired}</strong> Beginner problems (currently {unlockProgress.completedBeginner}/{unlockProgress.beginnerTotal}) AND <strong>{unlockProgress.intermediateRequired}</strong> Intermediate problems (currently {unlockProgress.completedIntermediate}/{unlockProgress.intermediateTotal}) to unlock Advanced challenges.
                </p>
              </div>
            )}

            {/* Problem Statement Body */}
            <div className="space-y-4 text-xs font-sans text-zinc-700 leading-relaxed">
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1.5">
                <h4 className="font-mono font-bold text-zinc-900 text-xs uppercase tracking-wider">
                  Full Problem Statement
                </h4>
                <p className="text-zinc-800 text-sm leading-normal">
                  {selectedProduct.problemStatement || selectedProduct.title}
                </p>
              </div>

              {selectedProduct.relatedInformation?.context && (
                <div className="space-y-1.5">
                  <h4 className="font-mono font-bold text-zinc-900 uppercase">
                    Industry Context & Background
                  </h4>
                  <p className="text-zinc-600 leading-relaxed">
                    {selectedProduct.relatedInformation.context}
                  </p>
                </div>
              )}

              {selectedProduct.source?.name && (
                <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500 pt-1">
                  <span>Source: {selectedProduct.source.name}</span>
                  {selectedProduct.country && <span>• Location: {selectedProduct.country}</span>}
                </div>
              )}

              {selectedProduct.skills && selectedProduct.skills.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-zinc-100">
                  <h4 className="font-mono font-bold text-zinc-900 uppercase">
                    Skills Covered
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProduct.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-100 text-teal-800 font-mono text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer CTA */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
              <span className="text-xs font-mono text-zinc-500">
                8-Phase Product Journey Workflow
              </span>

              <button
                type="button"
                disabled={!!selectedProduct.isLocked}
                onClick={() => {
                  if (selectedProduct.isLocked) return;
                  const pid = selectedProduct.problemId;
                  const step = selectedProduct.currentPhase || 1;
                  setSelectedProduct(null);
                  router.push(`/journey/${pid}?step=${step}`);
                }}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold font-sans transition-all cursor-pointer ${
                  selectedProduct.isLocked
                    ? "bg-zinc-200 text-zinc-400 cursor-not-allowed border border-zinc-300"
                    : "bg-teal-800 hover:bg-teal-700 text-white shadow-sm"
                }`}
              >
                <span>
                  {selectedProduct.isLocked
                    ? "🔒 Locked — Complete Requirements"
                    : selectedProduct.userStatus === "completed"
                    ? "View Completed Journey"
                    : selectedProduct.userStatus === "in_progress"
                    ? `Continue Phase ${selectedProduct.currentPhase}`
                    : "Start Building This Problem"}
                </span>
                {!selectedProduct.isLocked && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

