"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Map as MapIcon,
  Globe,
  ShieldCheck,
  Users,
  Settings,
  Terminal,
  ArrowRight,
  Search,
  CheckCircle2,
  Lock,
  Unlock,
  RefreshCw,
  AlertCircle,
  Package,
  X,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getOnboardingProfile, UserOnboardingProfile } from "@/lib/onboardingStore";
import { getJourneyUserId } from "@/lib/journeyUser";
import {
  saveProblemsToCache,
  getCachedProblemsPage,
  saveCatalogMeta,
} from "@/lib/problemIndexedDb";

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

interface ProblemCardProps {
  product: ProductCatalogItem;
  onSelect: (product: ProductCatalogItem) => void;
  onStartOrContinue: (product: ProductCatalogItem) => void;
}

/**
 * Memoized Problem Card Component
 * Prevents unnecessary re-rendering of existing cards when appending batches.
 */
const ProblemCard = React.memo(function ProblemCard({
  product,
  onSelect,
  onStartOrContinue,
}: ProblemCardProps) {
  const isCompleted = product.userStatus === "completed";
  const isInProgress = product.userStatus === "in_progress";
  const isLocked = !!product.isLocked;

  return (
    <div
      key={product.problemId}
      className={`bg-white rounded-2xl border ${
        isLocked ? "border-rose-200/80 bg-gradient-to-b from-white to-rose-50/20" : "border-zinc-200"
      } p-6 space-y-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group`}
    >
      <div className="space-y-3">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono font-bold bg-teal-50 border border-teal-100 text-teal-800 px-2.5 py-0.5 rounded-md">
              {product.problemId}
            </span>
            {product.category && (
              <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md truncate max-w-[120px]">
                {product.category}
              </span>
            )}
          </div>

          {product.difficulty && (
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                isLocked
                  ? "bg-rose-100 text-rose-800 border border-rose-200"
                  : product.difficulty === "Beginner"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : product.difficulty === "Intermediate"
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-purple-50 text-purple-700 border border-purple-200"
              }`}
            >
              {isLocked && <Lock className="h-3 w-3 text-rose-600" />}
              {product.difficulty} {isLocked ? "🔒" : ""}
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          onClick={() => {
            if (!isLocked) onStartOrContinue(product);
          }}
          className={`text-base font-serif font-bold text-zinc-900 group-hover:text-teal-800 transition-colors line-clamp-2 ${
            !isLocked ? "cursor-pointer" : ""
          }`}
        >
          {product.title}
        </h3>

        {/* Description / Context */}
        <p className="text-xs text-zinc-600 font-sans leading-relaxed line-clamp-3">
          {product.description}
        </p>

        {/* Country / Skills Tags if present */}
        {(product.country || (product.skills && product.skills.length > 0)) && (
          <div className="flex flex-wrap gap-1 pt-1">
            {product.country && (
              <span className="text-[10px] font-mono bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded">
                📍 {product.country}
              </span>
            )}
            {product.skills.slice(0, 2).map((skill, sIdx) => (
              <span
                key={sIdx}
                className="text-[10px] font-mono bg-teal-50/70 text-teal-800 px-2 py-0.5 rounded border border-teal-100"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Status & Actions */}
      <div className="pt-4 border-t border-zinc-100 space-y-3">
        {/* User status badge */}
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-zinc-500">Your Status:</span>
          <span
            className={`font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
              isLocked
                ? "bg-rose-50 text-rose-700 border border-rose-200"
                : isCompleted
                ? "bg-emerald-100 text-emerald-800"
                : isInProgress
                ? "bg-teal-100 text-teal-900"
                : "bg-zinc-100 text-zinc-500"
            }`}
          >
            {isLocked ? (
              <>
                <Lock className="h-3 w-3 text-rose-600" />
                <span>Locked</span>
              </>
            ) : isCompleted ? (
              <>
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                <span>Completed ✓</span>
              </>
            ) : isInProgress ? (
              <span>In Progress (Phase {product.currentPhase})</span>
            ) : (
              <span>Not Started</span>
            )}
          </span>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onSelect(product)}
            className="px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold font-sans cursor-pointer transition-all flex items-center justify-center gap-1"
          >
            <BookOpen className="h-3.5 w-3.5 text-zinc-500" />
            <span>View Details</span>
          </button>

          <button
            type="button"
            disabled={isLocked}
            onClick={() => onStartOrContinue(product)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold font-sans transition-all flex items-center justify-center gap-1 ${
              isLocked
                ? "bg-zinc-200 text-zinc-400 cursor-not-allowed border border-zinc-300"
                : isCompleted
                ? "bg-emerald-700 hover:bg-emerald-600 text-white cursor-pointer"
                : isInProgress
                ? "bg-teal-800 hover:bg-teal-700 text-white cursor-pointer"
                : "bg-teal-800 hover:bg-teal-700 text-white shadow-xs cursor-pointer"
            }`}
          >
            <span>
              {isLocked
                ? "🔒 Locked"
                : isCompleted
                ? "View Journey"
                : isInProgress
                ? "Continue"
                : "Start Building"}
            </span>
            {!isLocked && <ArrowRight className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
});

export default function ProductsPage() {
  const router = useRouter();
  const userId = getJourneyUserId();

  const [profile, setProfile] = useState<UserOnboardingProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  const [products, setProducts] = useState<ProductCatalogItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [difficulties, setDifficulties] = useState<string[]>([]);
  const [unlockProgress, setUnlockProgress] = useState<UnlockProgress | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [sortOrder, setSortOrder] = useState("numerical_asc");

  // Pagination State
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const activeRequestId = React.useRef(0);

  // Detail Modal State
  const [selectedProduct, setSelectedProduct] = useState<ProductCatalogItem | null>(null);

  // Stable callbacks for memoized cards
  const handleSelectProduct = useCallback((product: ProductCatalogItem) => {
    setSelectedProduct(product);
  }, []);

  const handleStartOrContinue = useCallback(
    (product: ProductCatalogItem) => {
      if (product.isLocked) return;
      router.push(`/journey/${product.problemId}?step=${product.currentPhase || 1}`);
    },
    [router]
  );

  // Initial load: fetches first 20 problem statements and syncs with IndexedDB cache
  const loadInitialProducts = useCallback(async () => {
    const reqId = ++activeRequestId.current;
    try {
      setLoading(true);
      setError(null);
      setLoadMoreError(null);

      // 1. Attempt non-blocking cache read for instant render / offline
      try {
        const cached = await getCachedProblemsPage({
          search: searchQuery,
          category: selectedCategory,
          difficulty: selectedDifficulty,
          skip: 0,
          limit: 20,
        });

        if (cached && cached.problems.length > 0 && reqId === activeRequestId.current) {
          const mappedCached: ProductCatalogItem[] = cached.problems.map((p) => ({
            ...p,
            userStatus: "not_started",
            completedPhases: 0,
            currentPhase: 1,
            totalPhases: 8,
            isLocked: false,
          }));
          setProducts(mappedCached);
          setTotalCount(cached.totalCount);
          setHasMore(cached.totalCount > mappedCached.length);
          // Show cached items immediately
          setLoading(false);
        }
      } catch (cacheErr) {
        // Cache misses or errors are non-fatal; continue directly to network fetch
      }

      // 2. Authoritative network fetch
      const params = new URLSearchParams({
        search: searchQuery,
        category: selectedCategory,
        difficulty: selectedDifficulty,
        sort: sortOrder,
        page: "1",
        limit: "20",
        skip: "0",
      });

      const res = await fetch(`/api/products?${params.toString()}`);
      if (reqId !== activeRequestId.current) return;

      if (res.ok) {
        const data = await res.json();
        const items: ProductCatalogItem[] = data.products || data.data || [];
        const count = typeof data.totalCount === "number" ? data.totalCount : 0;
        const more = typeof data.hasMore === "boolean" ? data.hasMore : items.length < count;

        setProducts(items);
        setTotalCount(count);
        setHasMore(more);
        if (data.categories) setCategories(data.categories);
        if (data.difficulties) setDifficulties(data.difficulties);
        if (data.unlockProgress) setUnlockProgress(data.unlockProgress);

        // Save newly fetched 20 problem statements into IndexedDB cache (async, non-blocking)
        saveProblemsToCache(items).catch(() => {});
        saveCatalogMeta({
          categories: data.categories,
          difficulties: data.difficulties,
          totalCount: count,
        }).catch(() => {});
        setError(null);
      } else {
        const errData = await res.json().catch(() => ({}));
        if (products.length === 0) {
          setError(errData.error || "Unable to load problems catalog.");
        } else {
          console.warn("Background catalog revalidation error:", errData.error);
        }
      }
    } catch (networkErr: any) {
      if (reqId === activeRequestId.current) {
        // Fall back to cached problem records if available offline
        try {
          const cached = await getCachedProblemsPage({
            search: searchQuery,
            category: selectedCategory,
            difficulty: selectedDifficulty,
            skip: 0,
            limit: 20,
          });

          if (cached && cached.problems.length > 0) {
            const mappedCached: ProductCatalogItem[] = cached.problems.map((p) => ({
              ...p,
              userStatus: "not_started",
              completedPhases: 0,
              currentPhase: 1,
              totalPhases: 8,
              isLocked: false,
            }));
            setProducts(mappedCached);
            setTotalCount(cached.totalCount);
            setHasMore(cached.totalCount > mappedCached.length);
            setError(null);
          } else {
            setError(networkErr.message || "Failed to connect to problem database.");
          }
        } catch {
          setError(networkErr.message || "Failed to connect to problem database.");
        }
      }
    } finally {
      if (reqId === activeRequestId.current) {
        setLoading(false);
      }
    }
  }, [searchQuery, selectedCategory, selectedDifficulty, sortOrder]);

  // Load More: fetches next 20 problem statements and appends without replacing
  const handleLoadMore = useCallback(async () => {
    if (loadingMore || loading || !hasMore) return;
    const reqId = ++activeRequestId.current;

    try {
      setLoadingMore(true);
      setLoadMoreError(null);

      const currentSkip = products.length;
      const params = new URLSearchParams({
        search: searchQuery,
        category: selectedCategory,
        difficulty: selectedDifficulty,
        sort: sortOrder,
        limit: "20",
        skip: currentSkip.toString(),
      });

      const res = await fetch(`/api/products?${params.toString()}`);
      if (reqId !== activeRequestId.current) return;

      if (res.ok) {
        const data = await res.json();
        const newItems: ProductCatalogItem[] = data.products || data.data || [];
        const count = typeof data.totalCount === "number" ? data.totalCount : totalCount;

        setProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p.problemId));
          const uniqueNew = newItems.filter((p) => !existingIds.has(p.problemId));
          const combined = [...prev, ...uniqueNew];
          const more =
            typeof data.hasMore === "boolean"
              ? data.hasMore
              : combined.length < count;
          setHasMore(more);
          return combined;
        });

        if (typeof data.totalCount === "number") {
          setTotalCount(data.totalCount);
        }

        // Save newly fetched 20 items to IndexedDB (async, non-blocking)
        saveProblemsToCache(newItems).catch(() => {});
      } else {
        const errData = await res.json().catch(() => ({}));
        setLoadMoreError(errData.error || "Failed to load additional problems.");
      }
    } catch (networkErr: any) {
      if (reqId === activeRequestId.current) {
        // Try reading next batch from IndexedDB cache if available offline
        try {
          const currentSkip = products.length;
          const cached = await getCachedProblemsPage({
            search: searchQuery,
            category: selectedCategory,
            difficulty: selectedDifficulty,
            skip: currentSkip,
            limit: 20,
          });

          if (cached && cached.problems.length > 0) {
            const mappedCached: ProductCatalogItem[] = cached.problems.map((p) => ({
              ...p,
              userStatus: "not_started",
              completedPhases: 0,
              currentPhase: 1,
              totalPhases: 8,
              isLocked: false,
            }));

            setProducts((prev) => {
              const existingIds = new Set(prev.map((p) => p.problemId));
              const uniqueNew = mappedCached.filter((p) => !existingIds.has(p.problemId));
              const combined = [...prev, ...uniqueNew];
              setHasMore(combined.length < cached.totalCount);
              return combined;
            });
            setLoadMoreError(null);
          } else {
            setLoadMoreError(networkErr.message || "Network error loading more problems.");
          }
        } catch {
          setLoadMoreError(networkErr.message || "Network error loading more problems.");
        }
      }
    } finally {
      if (reqId === activeRequestId.current) {
        setLoadingMore(false);
      }
    }
  }, [
    loadingMore,
    loading,
    hasMore,
    products.length,
    searchQuery,
    selectedCategory,
    selectedDifficulty,
    sortOrder,
    totalCount,
  ]);

  // Initial Onboarding Route Guard & Initial Load / Filter Reset
  useEffect(() => {
    const activeProf = getOnboardingProfile();
    setProfile(activeProf);
    if (!activeProf?.onboardingCompleted) {
      router.push("/onboarding");
      return;
    }
    loadInitialProducts();
  }, [router, loadInitialProducts]);

  // Sidebar Items
  const navItems = [
    { id: "buildos",   label: "BuildOS",          icon: LayoutDashboard, href: "/dashboard" },
    { id: "journey",   label: "Product Journey",  icon: MapIcon,         href: "/dashboard/journey" },
    { id: "products",  label: "Products",          icon: Globe,           href: "/dashboard/products" },
    { id: "portfolio", label: "Portfolio",         icon: ShieldCheck,     href: "/dashboard/portfolio" },
    { id: "settings",  label: "Settings",          icon: Settings,        href: "/dashboard/settings" },
  ];

  const userInitial = profile?.whoAreYouRole?.charAt(0)?.toUpperCase() ?? "N";

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
              const isActive = item.id === "products";
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
              Products Catalog
            </h1>
            <p className="text-[11px] text-zinc-400 font-sans -mt-0.5">
              Explore real-world problems and build products to solve them.
            </p>
          </div>

          <button
            onClick={loadInitialProducts}
            title="Reload Products List"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 text-xs font-mono transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-teal-700" : ""}`} />
            <span>Reload</span>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* ============================================================ */}
          {/* BANNER                                                       */}
          {/* ============================================================ */}
          <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-zinc-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-3 max-w-3xl">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 font-mono text-xs font-semibold uppercase tracking-wider">
                <Package className="h-3.5 w-3.5 text-teal-400" />
                <span>Problem Statement Catalog</span>
              </span>

              <h2 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight leading-tight text-white">
                Products — Explore real-world problem statements.
              </h2>

              <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
                Browse our verified database of real-world industry problem challenges. Select any problem to inspect details, discover market context, and launch your 8-phase product engineering journey.
              </p>
            </div>
          </div>

          {/* ============================================================ */}
          {/* ADVANCED UNLOCK PROGRESS PANEL                               */}
          {/* ============================================================ */}
          {unlockProgress && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${unlockProgress.advancedUnlocked ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                    {unlockProgress.advancedUnlocked ? (
                      <Unlock className="h-4 w-4" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-mono text-zinc-900 uppercase tracking-wider">
                      Advanced Unlock Progress
                    </h3>
                    <p className="text-[11px] text-zinc-500 font-sans">
                      Complete 50% of Beginner AND 30% of Intermediate problems to unlock Advanced challenges.
                    </p>
                  </div>
                </div>

                <span
                  className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                    unlockProgress.advancedUnlocked
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-amber-50 border-amber-200 text-amber-800"
                  }`}
                >
                  {unlockProgress.advancedUnlocked ? "✓ Advanced Unlocked" : "🔒 Advanced Locked"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-100">
                {/* Beginner Progress */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-zinc-800">Beginner Problems</span>
                    <span className="text-zinc-600">
                      {unlockProgress.completedBeginner} / {unlockProgress.beginnerTotal} completed ({unlockProgress.beginnerRequired} required, 50%)
                    </span>
                  </div>
                  <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-600 h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (unlockProgress.completedBeginner / Math.max(1, unlockProgress.beginnerRequired)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Intermediate Progress */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-zinc-800">Intermediate Problems</span>
                    <span className="text-zinc-600">
                      {unlockProgress.completedIntermediate} / {unlockProgress.intermediateTotal} completed ({unlockProgress.intermediateRequired} required, 30%)
                    </span>
                  </div>
                  <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-600 h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (unlockProgress.completedIntermediate / Math.max(1, unlockProgress.intermediateRequired)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* SEARCH & FILTER CONTROLS BAR                                 */}
          {/* ============================================================ */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 w-full">
                <Search className="h-4 w-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products by Problem ID, Title, Description, or Category..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-sans text-zinc-900 focus:outline-none focus:border-teal-700 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter */}
              {categories.length > 0 && (
                <div className="w-full sm:w-48">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-mono text-zinc-800 focus:outline-none focus:border-teal-700 cursor-pointer"
                  >
                    <option value="All">Category: All ({totalCount || products.length})</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Difficulty Filter */}
              {difficulties.length > 0 && (
                <div className="w-full sm:w-44">
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-mono text-zinc-800 focus:outline-none focus:border-teal-700 cursor-pointer"
                  >
                    <option value="All">Difficulty: All</option>
                    {difficulties.map((diff) => (
                      <option key={diff} value={diff}>
                        {diff}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sort Order */}
              <div className="w-full sm:w-44">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-mono text-zinc-800 focus:outline-none focus:border-teal-700 cursor-pointer"
                >
                  <option value="numerical_asc">Sort: P000001 → P...</option>
                  <option value="numerical_desc">Sort: Highest ID</option>
                  <option value="newest">Sort: Newest First</option>
                  <option value="oldest">Sort: Oldest First</option>
                </select>
              </div>
            </div>

            {/* Active Filter Chips */}
            {(selectedCategory !== "All" || selectedDifficulty !== "All" || searchQuery) && (
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 flex-wrap">
                <span className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">
                  Active Filters:
                </span>
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-100 text-teal-800 text-[11px] font-mono">
                    Search: &quot;{searchQuery}&quot;
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
                  </span>
                )}
                {selectedCategory !== "All" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-100 text-teal-800 text-[11px] font-mono">
                    Cat: {selectedCategory}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory("All")} />
                  </span>
                )}
                {selectedDifficulty !== "All" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-100 text-teal-800 text-[11px] font-mono">
                    Diff: {selectedDifficulty}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedDifficulty("All")} />
                  </span>
                )}

                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                    setSelectedDifficulty("All");
                  }}
                  className="text-[11px] font-mono text-teal-700 underline font-semibold ml-auto cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* PRODUCTS GRID / STATES                                       */}
          {/* ============================================================ */}
          {loading ? (
            <div className="py-20 text-center bg-white border border-zinc-200 rounded-3xl space-y-3 shadow-xs">
              <RefreshCw className="h-7 w-7 animate-spin text-teal-700 mx-auto" />
              <p className="text-xs font-mono text-zinc-400">Loading problem statements from database...</p>
            </div>
          ) : error ? (
            /* ERROR STATE */
            <div className="bg-white border border-rose-200 rounded-3xl p-10 text-center max-w-lg mx-auto space-y-4 shadow-xs">
              <AlertCircle className="h-10 w-10 text-rose-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-serif font-bold text-zinc-900">
                  Unable to load problems.
                </h3>
                <p className="text-xs text-zinc-500 font-sans">{error}</p>
              </div>
              <button
                onClick={loadInitialProducts}
                className="px-5 py-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-white text-xs font-semibold font-sans cursor-pointer transition-all"
              >
                Retry
              </button>
            </div>
          ) : products.length === 0 ? (
            /* EMPTY STATE */
            <div className="bg-white border border-zinc-200 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
              <Package className="h-12 w-12 text-zinc-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-lg font-serif font-bold text-zinc-900">
                  No matching problems found.
                </h3>
                <p className="text-xs text-zinc-500 font-sans">
                  Try adjusting your search query or filter selections.
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedDifficulty("All");
                }}
                className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-mono font-semibold cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            /* PRODUCTS GRID (MEMOIZED TO AVOID UNNECESSARY RE-RENDERING) */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProblemCard
                  key={product.problemId}
                  product={product}
                  onSelect={handleSelectProduct}
                  onStartOrContinue={handleStartOrContinue}
                />
              ))}
            </div>
          )}

          {/* Incremental Load More Pagination Controls */}
          {products.length > 0 && (
            <div className="pt-8 pb-4 flex flex-col items-center justify-center space-y-4 border-t border-zinc-200">
              <div className="text-xs font-mono text-zinc-500 text-center">
                Showing <span className="font-semibold text-zinc-900">{products.length}</span> of{" "}
                <span className="font-semibold text-zinc-900">{totalCount}</span> matching problem statements
              </div>

              {loadMoreError && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{loadMoreError}</span>
                  <button
                    onClick={handleLoadMore}
                    className="font-bold underline hover:text-rose-900 cursor-pointer ml-2"
                  >
                    Retry
                  </button>
                </div>
              )}

              {hasMore ? (
                <button
                  type="button"
                  id="load-more-btn"
                  disabled={loadingMore || loading}
                  onClick={handleLoadMore}
                  className={`px-6 py-2.5 rounded-xl border text-xs font-mono font-semibold transition-all inline-flex items-center gap-2 shadow-xs ${
                    loadingMore
                      ? "bg-zinc-100 border-zinc-300 text-zinc-400 cursor-not-allowed"
                      : "bg-white hover:bg-zinc-50 border-zinc-300 hover:border-zinc-400 text-zinc-800 cursor-pointer"
                  }`}
                >
                  {loadingMore ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin text-teal-700" />
                      <span>Loading next 20 problems...</span>
                    </>
                  ) : (
                    <>
                      <span>Load More (+20)</span>
                      <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
                    </>
                  )}
                </button>
              ) : (
                <div className="text-xs font-mono text-zinc-400 bg-zinc-50 px-4 py-2 rounded-xl border border-zinc-200">
                  ✓ All {totalCount} matching problems loaded
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ============================================================ */}
      {/* PROBLEM STATEMENT DETAILS MODAL                              */}
      {/* ============================================================ */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-7 sm:p-9 max-w-2xl w-full space-y-6 shadow-2xl border border-zinc-200 max-h-[90vh] overflow-y-auto">
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
                <h4 className="font-mono font-bold text-zinc-900 text-xs uppercase">
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
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold font-sans transition-all ${
                  selectedProduct.isLocked
                    ? "bg-zinc-200 text-zinc-400 cursor-not-allowed border border-zinc-300"
                    : "bg-teal-800 hover:bg-teal-700 text-white cursor-pointer shadow-sm"
                }`}
              >
                <span>
                  {selectedProduct.isLocked
                    ? "🔒 Locked — Complete Requirements"
                    : selectedProduct.userStatus === "completed"
                    ? "View Completed Journey"
                    : selectedProduct.userStatus === "in_progress"
                    ? `Continue Phase ${selectedProduct.currentPhase}`
                    : "Start Building"}
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
