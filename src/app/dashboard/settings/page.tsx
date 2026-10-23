"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Globe,
  ShieldCheck,
  Users,
  Settings as SettingsIcon,
  Terminal,
  User,
  Shield,
  Sliders,
  Bell,
  Link as LinkIcon,
  CreditCard,
  Sun,
  Lock,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Github,
  Download,
  Trash2,
  ExternalLink,
  Camera,
  Moon,
  Monitor,
  Zap,
} from "lucide-react";
import CheckoutModal from "@/components/payment/CheckoutModal";
import { getOnboardingProfile, UserOnboardingProfile } from "@/lib/onboardingStore";
import { getJourneyUserId } from "@/lib/journeyUser";

type SettingsCategory =
  | "profile"
  | "account"
  | "preferences"
  | "notifications"
  | "integrations"
  | "billing"
  | "appearance"
  | "privacy";

interface ProfileState {
  fullName: string;
  username: string;
  bio: string;
  email: string;
  location: string;
  website: string;
  github: string;
  twitter: string;
  linkedin: string;
  avatarUrl: string;
}

interface PreferencesState {
  defaultDashboard: string;
  language: string;
  dateFormat: string;
  theme: string;
  compactMode: boolean;
  notifications: {
    journeyUpdates: boolean;
    buildAlerts: boolean;
    githubAlerts: boolean;
    aiAlerts: boolean;
    securityAlerts: boolean;
  };
}

import { Suspense } from "react";

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = getJourneyUserId();

  const initialTab = (searchParams.get("tab") as SettingsCategory) || "profile";
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");

  const [profile, setProfile] = useState<UserOnboardingProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile state
  const [profileState, setProfileState] = useState<ProfileState>({
    fullName: "",
    username: "",
    bio: "",
    email: "",
    location: "",
    website: "",
    github: "",
    twitter: "",
    linkedin: "",
    avatarUrl: "",
  });

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Preferences state
  const [preferencesState, setPreferencesState] = useState<PreferencesState>({
    defaultDashboard: "/dashboard",
    language: "English",
    dateFormat: "MMM DD, YYYY",
    theme: "light",
    compactMode: false,
    notifications: {
      journeyUpdates: true,
      buildAlerts: true,
      githubAlerts: true,
      aiAlerts: false,
      securityAlerts: true,
    },
  });

  // Modal & Avatar states
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [customAvatarInput, setCustomAvatarInput] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [deleteStatus, setDeleteStatus] = useState<"idle" | "deleting" | "error">("idle");
  const [upgradeNotice, setUpgradeNotice] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [checkoutPlan, setCheckoutPlan] = useState<"PRO" | "MAX">("PRO");
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubUsername, setGithubUsername] = useState("");

  // Update tab in URL search params without page reload
  const handleCategoryChange = (cat: SettingsCategory) => {
    setActiveCategory(cat);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", cat);
    window.history.pushState({ tab: cat }, "", url.toString());
  };

  // Sync tab with back/forward browser navigation
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab") as SettingsCategory;
    if (tabFromUrl && tabFromUrl !== activeCategory) {
      setActiveCategory(tabFromUrl);
    }
  }, [searchParams, activeCategory]);

  // Load Profile & Preferences from API + Onboarding defaults
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const authHeaders: Record<string, string> = {};
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
        if (token) authHeaders["Authorization"] = `Bearer ${token}`;
      }

      // 1. Fetch Profile
      const profRes = await fetch(`/api/settings/profile`, {
        headers: authHeaders,
        credentials: "same-origin",
      });
      if (profRes.ok) {
        const pData = await profRes.json();
        if (pData.profile) {
          setProfileState((prev) => ({
            ...prev,
            ...pData.profile,
            email: pData.profile.email || (userId.includes("@") ? userId : prev.email),
          }));
        }
      }

      // 2. Fetch Preferences
      const prefRes = await fetch(`/api/settings/preferences`, {
        headers: authHeaders,
        credentials: "same-origin",
      });
      if (prefRes.ok) {
        const prData = await prefRes.json();
        if (prData.preferences) {
          setPreferencesState(prData.preferences);
          // Apply theme / compact mode if present
          if (typeof window !== "undefined") {
            const isDark =
              prData.preferences.theme === "dark" ||
              (prData.preferences.theme === "system" &&
                window.matchMedia("(prefers-color-scheme: dark)").matches);

            if (isDark) {
              document.documentElement.classList.add("dark");
            } else {
              document.documentElement.classList.remove("dark");
            }

            if (prData.preferences.compactMode) {
              document.documentElement.classList.add("compact-mode");
            } else {
              document.documentElement.classList.remove("compact-mode");
            }
          }
        }
      }

      // 3. Fetch Journey GitHub status
      try {
        const jRes = await fetch(`/api/journey/active?userId=${encodeURIComponent(userId)}`);
        if (jRes.ok) {
          const jData = await jRes.json();
          if (jData.problemId) {
            const uDataRes = await fetch(`/api/journey/user-data?userId=${encodeURIComponent(userId)}&problemId=${encodeURIComponent(jData.problemId)}`);
            if (uDataRes.ok) {
              const uData = await uDataRes.json();
              if (uData.phases?.deploy?.githubRepoUrl || uData.phases?.deploy?.githubUsername) {
                setGithubConnected(true);
                setGithubUsername(uData.phases.deploy.githubUsername || "GitHub Connected");
              }
            }
          }
        }
      } catch (jErr) {}

      try {
        const subRes = await fetch(`/api/subscription/me?email=${encodeURIComponent(profileState.email || userId)}`);
        if (subRes.ok) {
          const subData = await subRes.json();
          setSubscriptionData(subData);
        }
      } catch (subErr) {
        console.warn("Failed to load subscription status:", subErr);
      }
    } catch (err) {
      console.warn("Failed to load settings data:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial Onboarding Route Guard & Data Fetch
  useEffect(() => {
    const activeProf = getOnboardingProfile();
    setProfile(activeProf);
    if (!activeProf?.onboardingCompleted) {
      router.push("/onboarding");
      return;
    }
    loadData();
  }, [router, loadData]);

  // Save Profile Handler
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSaveStatus("saving");
      setErrorMessage("");

      const authHeaders: Record<string, string> = {};
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
        if (token) authHeaders["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/settings/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        credentials: "same-origin",
        body: JSON.stringify({
          userId,
          profile: profileState,
        }),
      });

      if (res.ok) {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMessage(errData.error || "Save failed.");
        setSaveStatus("error");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error. Failed to save changes.");
      setSaveStatus("error");
    }
  };

  // Save Preferences Handler
  const handleSavePreferences = async (updatedPrefs: Partial<PreferencesState>) => {
    const nextPrefs = {
      ...preferencesState,
      ...updatedPrefs,
      notifications: {
        ...preferencesState.notifications,
        ...(updatedPrefs.notifications || {}),
      },
    };
    setPreferencesState(nextPrefs);

    // Apply theme & compact mode visually
    if (typeof window !== "undefined") {
      const isDark =
        nextPrefs.theme === "dark" ||
        (nextPrefs.theme === "system" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);

      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      if (nextPrefs.compactMode) {
        document.documentElement.classList.add("compact-mode");
      } else {
        document.documentElement.classList.remove("compact-mode");
      }
    }

    try {
      const authHeaders: Record<string, string> = {};
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
        if (token) authHeaders["Authorization"] = `Bearer ${token}`;
      }

      await fetch("/api/settings/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        credentials: "same-origin",
        body: JSON.stringify({
          userId,
          preferences: nextPrefs,
        }),
      });
    } catch (err) {
      console.warn("Failed to persist preferences:", err);
    }
  };

  // Export Data Handler
  const handleExportData = () => {
    window.open(`/api/settings/export-data?userId=${encodeURIComponent(userId)}`, "_blank");
  };

  // Delete Account Handler
  const handleDeleteAccount = async () => {
    if (deleteConfirmInput.trim() !== "DELETE") {
      return;
    }
    try {
      setDeleteStatus("deleting");
      const authHeaders: Record<string, string> = {};
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
        if (token) authHeaders["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/settings/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        credentials: "same-origin",
        body: JSON.stringify({
          userId,
          confirmation: "DELETE",
        }),
      });

      if (res.ok) {
        localStorage.clear();
        router.push("/onboarding?reset=true");
      } else {
        setDeleteStatus("error");
      }
    } catch (e) {
      setDeleteStatus("error");
    }
  };

  // Navigation Items
  const navItems = [
    { id: "buildos",   label: "BuildOS",          icon: LayoutDashboard, href: "/dashboard" },
    { id: "journey",   label: "Product Journey",  icon: Map,             href: "/dashboard/journey" },
    { id: "products",  label: "Products",          icon: Globe,           href: "/dashboard/products" },
    { id: "portfolio", label: "Portfolio",         icon: ShieldCheck,     href: "/dashboard/portfolio" },
    { id: "settings",  label: "Settings",          icon: SettingsIcon,    href: "/dashboard/settings" },
  ];

  const userInitial = (profileState.fullName || profile?.whoAreYouRole || "U")
    .charAt(0)
    .toUpperCase();

  // Settings Categories
  const categories: { id: SettingsCategory; label: string; icon: any; keywords: string }[] = [
    { id: "profile",       label: "Profile",         icon: User,       keywords: "name email bio photo github avatar user" },
    { id: "account",       label: "Account",         icon: Shield,     keywords: "plan status member since login timezone" },
    { id: "preferences",   label: "Preferences",     icon: Sliders,    keywords: "default dashboard language date format" },
    { id: "notifications", label: "Notifications",   icon: Bell,       keywords: "updates build alerts email github ai" },
    { id: "integrations",  label: "Integrations",    icon: LinkIcon,   keywords: "github vercel google ai OAuth token" },
    { id: "billing",       label: "Billing",         icon: CreditCard, keywords: "plan payment invoice subscription upgrade" },
    { id: "appearance",    label: "Appearance",      icon: Sun,        keywords: "theme light dark compact mode density" },
    { id: "privacy",       label: "Data & Privacy",  icon: Lock,       keywords: "export data privacy session delete account" },
  ];

  // Filter Categories by Search Query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase().trim();
    return categories.filter(
      (c) => c.label.toLowerCase().includes(q) || c.keywords.toLowerCase().includes(q)
    );
  }, [searchQuery, categories]);

  return (
    <div className={`h-screen bg-[#F5F5F0] text-zinc-900 font-sans antialiased selection:bg-teal-700 selection:text-white flex flex-col lg:flex-row overflow-hidden ${preferencesState.compactMode ? "text-sm" : ""}`}>
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
              const isActive = item.id === "settings";
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
              Settings
            </h1>
            <p className="text-[11px] text-zinc-400 font-sans -mt-0.5">
              Manage your account, preferences and integrations.
            </p>
          </div>

          {/* Settings Search Field */}
          <div className="relative w-48 sm:w-64">
            <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search settings..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-zinc-200 bg-zinc-50 text-xs text-zinc-800 focus:outline-none focus:border-teal-700 transition-colors font-sans"
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 sm:p-8 max-w-6xl mx-auto w-full space-y-8">
          {/* ============================================================ */}
          {/* CATEGORY NAV TABS                                            */}
          {/* ============================================================ */}
          <div className="flex items-center gap-1.5 border-b border-zinc-200 pb-3 overflow-x-auto">
            {filteredCategories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-sans font-semibold transition-all cursor-pointer shrink-0 border ${
                    isActive
                      ? "bg-teal-800 text-white border-teal-800 shadow-xs"
                      : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? "text-white" : "text-zinc-400"}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="py-20 text-center bg-white border border-zinc-200 rounded-3xl space-y-2">
              <RefreshCw className="h-6 w-6 animate-spin text-teal-700 mx-auto" />
              <p className="text-xs font-mono text-zinc-400">Loading settings...</p>
            </div>
          ) : (
            <>
              {/* ============================================================ */}
              {/* 1. PROFILE SECTION                                           */}
              {/* ============================================================ */}
              {activeCategory === "profile" && (
                <form onSubmit={handleSaveProfile} className="bg-white border border-zinc-200 rounded-3xl p-7 sm:p-9 space-y-7 shadow-xs">
                  <div className="border-b border-zinc-100 pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-serif font-bold text-zinc-900">
                        Profile Information
                      </h2>
                      <p className="text-xs text-zinc-500 font-sans mt-0.5">
                        Update your public profile details and social connections.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={saveStatus === "saving"}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-white text-xs font-semibold font-sans transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      {saveStatus === "saving" ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : saveStatus === "saved" ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                          <span>✓ Changes saved</span>
                        </>
                      ) : (
                        <span>Save Changes</span>
                      )}
                    </button>
                  </div>

                  {saveStatus === "error" && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-sans flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-rose-600" />
                        <span>{errorMessage || "Save failed. Please try again."}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveProfile}
                        className="text-xs font-mono font-bold underline cursor-pointer"
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {/* Profile Photo Avatar */}
                  <div className="flex items-center gap-5">
                    <div className="relative group">
                      {profileState.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={profileState.avatarUrl}
                          alt="Avatar"
                          className="h-16 w-16 rounded-full object-cover border-2 border-teal-700"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-zinc-800 text-white text-xl font-mono font-bold flex items-center justify-center border-2 border-zinc-700">
                          {userInitial}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowAvatarModal(true)}
                        className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-teal-700 text-white flex items-center justify-center shadow-md cursor-pointer hover:bg-teal-600 transition-colors"
                      >
                        <Camera className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 font-sans">
                        {profileState.fullName || "Your Profile Photo"}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowAvatarModal(true)}
                        className="mt-1 text-xs font-mono text-teal-700 hover:text-teal-900 font-semibold cursor-pointer"
                      >
                        Change Photo →
                      </button>
                    </div>
                  </div>

                  {/* Form Inputs Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-semibold text-zinc-700 block">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileState.fullName}
                        onChange={(e) => setProfileState({ ...profileState, fullName: e.target.value })}
                        placeholder="e.g. Arjun Mehta"
                        className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-sans text-zinc-900 focus:outline-none focus:border-teal-700"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-semibold text-zinc-700 block">
                        Username
                      </label>
                      <input
                        type="text"
                        value={profileState.username}
                        onChange={(e) => setProfileState({ ...profileState, username: e.target.value })}
                        placeholder="e.g. arjunmehta"
                        className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-sans text-zinc-900 focus:outline-none focus:border-teal-700"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs font-mono font-semibold text-zinc-700 block">
                        Bio
                      </label>
                      <textarea
                        rows={3}
                        value={profileState.bio}
                        onChange={(e) => setProfileState({ ...profileState, bio: e.target.value })}
                        placeholder="Tell builders and recruiters about your engineering journey..."
                        className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-sans text-zinc-900 focus:outline-none focus:border-teal-700"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-semibold text-zinc-700 block">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileState.email}
                        onChange={(e) => setProfileState({ ...profileState, email: e.target.value })}
                        placeholder="name@example.com"
                        className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-sans text-zinc-900 focus:outline-none focus:border-teal-700"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-semibold text-zinc-700 block">
                        Location
                      </label>
                      <input
                        type="text"
                        value={profileState.location}
                        onChange={(e) => setProfileState({ ...profileState, location: e.target.value })}
                        placeholder="e.g. Bengaluru, India"
                        className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-sans text-zinc-900 focus:outline-none focus:border-teal-700"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-semibold text-zinc-700 block">
                        Website / Portfolio Link
                      </label>
                      <input
                        type="url"
                        value={profileState.website}
                        onChange={(e) => setProfileState({ ...profileState, website: e.target.value })}
                        placeholder="https://yourwebsite.com"
                        className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-sans text-zinc-900 focus:outline-none focus:border-teal-700"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-semibold text-zinc-700 block">
                        GitHub Profile
                      </label>
                      <input
                        type="text"
                        value={profileState.github}
                        onChange={(e) => setProfileState({ ...profileState, github: e.target.value })}
                        placeholder="https://github.com/username"
                        className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-sans text-zinc-900 focus:outline-none focus:border-teal-700"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-semibold text-zinc-700 block">
                        Twitter / X Handle
                      </label>
                      <input
                        type="text"
                        value={profileState.twitter}
                        onChange={(e) => setProfileState({ ...profileState, twitter: e.target.value })}
                        placeholder="@username"
                        className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-sans text-zinc-900 focus:outline-none focus:border-teal-700"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-semibold text-zinc-700 block">
                        LinkedIn Profile
                      </label>
                      <input
                        type="text"
                        value={profileState.linkedin}
                        onChange={(e) => setProfileState({ ...profileState, linkedin: e.target.value })}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-sans text-zinc-900 focus:outline-none focus:border-teal-700"
                      />
                    </div>
                  </div>
                </form>
              )}

              {/* ============================================================ */}
              {/* 2. ACCOUNT OVERVIEW SECTION                                  */}
              {/* ============================================================ */}
              {activeCategory === "account" && (
                <div className="bg-white border border-zinc-200 rounded-3xl p-7 sm:p-9 space-y-6 shadow-xs">
                  <div className="border-b border-zinc-100 pb-4">
                    <h2 className="text-lg font-serif font-bold text-zinc-900">
                      Account Overview
                    </h2>
                    <p className="text-xs text-zinc-500 font-sans mt-0.5">
                      View real membership details, identity verification, and plan tier.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                        Current Plan
                      </span>
                      <span className="text-base font-bold text-teal-800 font-mono block">
                        Free Community Tier
                      </span>
                      <span className="text-[11px] text-zinc-500 font-sans block">
                        Full access to Product Journey engine
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                        Account Status
                      </span>
                      <span className="text-base font-bold text-emerald-700 font-mono flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Active
                      </span>
                      <span className="text-[11px] text-zinc-500 font-sans block">
                        Verified Builder Identity
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                        User ID / Handle
                      </span>
                      <span className="text-sm font-bold text-zinc-800 font-mono truncate block">
                        {userId}
                      </span>
                      <span className="text-[11px] text-zinc-500 font-sans block">
                        Authenticated session
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-zinc-100">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 font-sans">
                        Need additional features or recruiter highlight?
                      </h4>
                      <p className="text-[11px] text-zinc-500 font-sans mt-0.5">
                        Upgrade your account to access custom domain linking and recruiter referrals.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setUpgradeNotice(true)}
                      className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-white text-xs font-semibold font-sans cursor-pointer transition-all shrink-0"
                    >
                      Upgrade Plan
                    </button>
                  </div>

                  {upgradeNotice && (
                    <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-sans flex items-center justify-between">
                      <span>Pro plan upgrades are currently in preview. Free Community Tier features remain fully active for your account.</span>
                      <button onClick={() => setUpgradeNotice(false)} className="font-mono text-xs text-teal-700 underline font-bold cursor-pointer ml-2">Dismiss</button>
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================ */}
              {/* 3. PREFERENCES SECTION                                       */}
              {/* ============================================================ */}
              {activeCategory === "preferences" && (
                <div className="bg-white border border-zinc-200 rounded-3xl p-7 sm:p-9 space-y-6 shadow-xs">
                  <div className="border-b border-zinc-100 pb-4">
                    <h2 className="text-lg font-serif font-bold text-zinc-900">
                      Preferences & Display
                    </h2>
                    <p className="text-xs text-zinc-500 font-sans mt-0.5">
                      Customize default dashboard views, language formats, and compact mode.
                    </p>
                  </div>

                  <div className="space-y-5">
                    {/* Default Dashboard */}
                    <div className="flex items-center justify-between gap-4 py-2 border-b border-zinc-100">
                      <div>
                        <h3 className="text-xs font-bold text-zinc-900 font-sans">
                          Default Dashboard Destination
                        </h3>
                        <p className="text-[11px] text-zinc-500 font-sans">
                          Choose which view opens when navigating to MakeMistakes OS.
                        </p>
                      </div>

                      <select
                        value={preferencesState.defaultDashboard}
                        onChange={(e) => handleSavePreferences({ defaultDashboard: e.target.value })}
                        className="px-3 py-1.5 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-mono text-zinc-800 focus:outline-none focus:border-teal-700 cursor-pointer"
                      >
                        <option value="/dashboard">BuildOS Workspace (/dashboard)</option>
                        <option value="/dashboard/journey">Product Journey (/dashboard/journey)</option>
                        <option value="/dashboard/portfolio">My Portfolio (/dashboard/portfolio)</option>
                      </select>
                    </div>

                    {/* Language */}
                    <div className="flex items-center justify-between gap-4 py-2 border-b border-zinc-100">
                      <div>
                        <h3 className="text-xs font-bold text-zinc-900 font-sans">
                          Language
                        </h3>
                        <p className="text-[11px] text-zinc-500 font-sans">
                          Primary language for problem statements and UI.
                        </p>
                      </div>

                      <select
                        value={preferencesState.language}
                        onChange={(e) => handleSavePreferences({ language: e.target.value })}
                        className="px-3 py-1.5 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-mono text-zinc-800 focus:outline-none focus:border-teal-700 cursor-pointer"
                      >
                        <option value="English">English (US)</option>
                      </select>
                    </div>

                    {/* Date Format */}
                    <div className="flex items-center justify-between gap-4 py-2 border-b border-zinc-100">
                      <div>
                        <h3 className="text-xs font-bold text-zinc-900 font-sans">
                          Date Format
                        </h3>
                        <p className="text-[11px] text-zinc-500 font-sans">
                          Display format for portfolio completion timestamps.
                        </p>
                      </div>

                      <select
                        value={preferencesState.dateFormat}
                        onChange={(e) => handleSavePreferences({ dateFormat: e.target.value })}
                        className="px-3 py-1.5 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-mono text-zinc-800 focus:outline-none focus:border-teal-700 cursor-pointer"
                      >
                        <option value="MMM DD, YYYY">MMM DD, YYYY (e.g. Aug 28, 2026)</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 28/08/2026)</option>
                      </select>
                    </div>

                    {/* Compact Mode Toggle */}
                    <div className="flex items-center justify-between gap-4 py-2">
                      <div>
                        <h3 className="text-xs font-bold text-zinc-900 font-sans">
                          Compact Mode
                        </h3>
                        <p className="text-[11px] text-zinc-500 font-sans">
                          Reduce UI element padding and spacing across workspaces.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSavePreferences({ compactMode: !preferencesState.compactMode })}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          preferencesState.compactMode ? "bg-teal-700" : "bg-zinc-200"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            preferencesState.compactMode ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* 4. NOTIFICATIONS SECTION                                     */}
              {/* ============================================================ */}
              {activeCategory === "notifications" && (
                <div className="bg-white border border-zinc-200 rounded-3xl p-7 sm:p-9 space-y-6 shadow-xs">
                  <div className="border-b border-zinc-100 pb-4">
                    <h2 className="text-lg font-serif font-bold text-zinc-900">
                      Notifications & Alerts
                    </h2>
                    <p className="text-xs text-zinc-500 font-sans mt-0.5">
                      Configure real notification preferences for your product engineering journey.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        key: "journeyUpdates",
                        title: "Product Journey Updates",
                        desc: "Get notified when a new phase or mission is unlocked.",
                      },
                      {
                        key: "buildAlerts",
                        title: "BuildOS Sandbox Alerts",
                        desc: "Notifications for environment build status and test results.",
                      },
                      {
                        key: "githubAlerts",
                        title: "GitHub Push Notifications",
                        desc: "Receive confirmation when repositories are pushed to GitHub.",
                      },
                      {
                        key: "aiAlerts",
                        title: "AI Mentor Feedback",
                        desc: "Receive Socratic AI code review suggestions during Build phase.",
                      },
                      {
                        key: "securityAlerts",
                        title: "Account Security Alerts",
                        desc: "Critical alerts regarding login sessions and credentials.",
                      },
                    ].map((item) => {
                      const enabled = (preferencesState.notifications as any)[item.key];
                      return (
                        <div key={item.key} className="flex items-center justify-between gap-4 py-3 border-b border-zinc-100">
                          <div>
                            <h3 className="text-xs font-bold text-zinc-900 font-sans">
                              {item.title}
                            </h3>
                            <p className="text-[11px] text-zinc-500 font-sans">
                              {item.desc}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleSavePreferences({
                                notifications: {
                                  ...preferencesState.notifications,
                                  [item.key]: !enabled,
                                },
                              })
                            }
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                              enabled ? "bg-teal-700" : "bg-zinc-200"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                enabled ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* 5. INTEGRATIONS SECTION                                      */}
              {/* ============================================================ */}
              {activeCategory === "integrations" && (
                <div className="bg-white border border-zinc-200 rounded-3xl p-7 sm:p-9 space-y-6 shadow-xs">
                  <div className="border-b border-zinc-100 pb-4">
                    <h2 className="text-lg font-serif font-bold text-zinc-900">
                      External Integrations
                    </h2>
                    <p className="text-xs text-zinc-500 font-sans mt-0.5">
                      Connect external services to push repositories and deploy applications.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* GitHub Integration */}
                    <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="h-10 w-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shrink-0">
                          <Github className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-zinc-900 font-sans">
                              GitHub
                            </h3>
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                githubConnected
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : "bg-zinc-200 text-zinc-600"
                              }`}
                            >
                              {githubConnected ? "Connected" : "Not Connected"}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-500 font-sans mt-0.5">
                            {githubConnected
                              ? `Connected as @${githubUsername}`
                              : "Push product challenge code directly to your GitHub account."}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const clientId = "Ov23liYrGHHiwhTsUBWb";
                          const redirectUri = `${window.location.origin}/api/github/callback`;
                          window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,user`;
                        }}
                        className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold font-sans cursor-pointer transition-all shrink-0"
                      >
                        {githubConnected ? "Re-authorize GitHub" : "Connect GitHub"}
                      </button>
                    </div>

                    {/* Vercel Integration */}
                    <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="h-10 w-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shrink-0 font-bold font-mono">
                          ▲
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-zinc-900 font-sans">
                            Vercel
                          </h3>
                          <p className="text-[11px] text-zinc-500 font-sans mt-0.5">
                            Deploy live web application previews during Deploy phase.
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-mono text-zinc-400 bg-zinc-200 px-3 py-1.5 rounded-xl font-semibold">
                        Ready for Deploy Phase
                      </span>
                    </div>

                    {/* AI Provider Integration */}
                    <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="h-10 w-10 rounded-xl bg-teal-800 text-white flex items-center justify-center shrink-0">
                          <Terminal className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-zinc-900 font-sans">
                            BuildOS Nova AI Mentor
                          </h3>
                          <p className="text-[11px] text-zinc-500 font-sans mt-0.5">
                            Socratic guidance engine powered by Groq Cloud & Qwen 3.6.
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-mono text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl font-bold border border-emerald-200">
                        ✓ Active
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* 6. BILLING SECTION                                           */}
              {/* ============================================================ */}
              {activeCategory === "billing" && (
                <div className="bg-white border border-zinc-200 rounded-3xl p-7 sm:p-9 space-y-6 shadow-xs">
                  <div className="border-b border-zinc-100 pb-4">
                    <h2 className="text-lg font-serif font-bold text-zinc-900">
                      Billing & Subscription
                    </h2>
                    <p className="text-xs text-zinc-500 font-sans mt-0.5">
                      Authoritative account-bound subscription, AI credit balances, and verified entitlements.
                    </p>
                  </div>

                  {/* Current Active Plan Card */}
                  <div className="p-6 rounded-2xl border border-teal-200 bg-teal-50/60 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase font-bold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded">
                          Current Plan
                        </span>
                        <h3 className="text-xl font-serif font-bold text-zinc-900 mt-1">
                          {subscriptionData?.plan === "MAX"
                            ? "Max Founder Tier"
                            : subscriptionData?.plan === "PRO"
                            ? "Pro Builder Tier"
                            : "Free Community Tier"}
                        </h3>
                      </div>
                      <span className="text-2xl font-bold font-mono text-zinc-900">
                        {subscriptionData?.plan === "MAX"
                          ? "₹2,499 / mo"
                          : subscriptionData?.plan === "PRO"
                          ? "₹999 / mo"
                          : "₹0 (Free)"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="p-3 bg-white/80 rounded-xl border border-teal-100 space-y-1">
                        <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">
                          Entitlement Status
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {subscriptionData?.status || "ACTIVE"}
                        </span>
                      </div>

                      <div className="p-3 bg-white/80 rounded-xl border border-teal-100 space-y-1">
                        <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">
                          AI Credits Available
                        </span>
                        <span className="text-xs font-mono font-bold text-teal-900 flex items-center gap-1">
                          <Zap className="h-3.5 w-3.5 text-teal-600" />
                          {subscriptionData?.credits?.remaining ?? 100} / {subscriptionData?.credits?.total ?? 100}
                        </span>
                      </div>

                      <div className="p-3 bg-white/80 rounded-xl border border-teal-100 space-y-1">
                        <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">
                          Billing Cycle
                        </span>
                        <span className="text-xs font-mono font-bold text-zinc-700">
                          {subscriptionData?.expiryDate
                            ? `Renews ${new Date(subscriptionData.expiryDate).toLocaleDateString()}`
                            : "Free Forever"}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-600 font-sans leading-relaxed">
                      Your subscription is bound to this internal account. Socratic Nova AI reviews,
                      proof of work portfolio telemetry, and recruiter verification are authorized
                      authoritatively on the server.
                    </p>
                  </div>

                  {/* Available Upgrades Section */}
                  <div className="space-y-4 pt-2">
                    <h3 className="text-sm font-serif font-bold text-zinc-900">
                      Available Subscription Tiers
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* PRO BUILDER */}
                      <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded uppercase">
                              Most Popular
                            </span>
                            <span className="text-lg font-bold font-mono text-zinc-900">₹999 / mo</span>
                          </div>
                          <h4 className="text-base font-serif font-bold text-zinc-900 mt-2">
                            Pro Builder Tier
                          </h4>
                          <p className="text-xs text-zinc-500 mt-1">
                            For serious student engineers aiming for top startup roles.
                          </p>
                          <ul className="mt-3 space-y-1.5 text-xs text-zinc-600 font-sans">
                            <li className="flex items-center gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-teal-700 shrink-0" />
                              <span>1,000 AI Credits / month with priority queue</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-teal-700 shrink-0" />
                              <span>Verified recruiter telemetry benchmark</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-teal-700 shrink-0" />
                              <span>Custom domain portfolio linking</span>
                            </li>
                          </ul>
                        </div>

                        <button
                          onClick={() => {
                            setCheckoutPlan("PRO");
                            setShowCheckoutModal(true);
                          }}
                          disabled={subscriptionData?.plan === "PRO"}
                          className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                            subscriptionData?.plan === "PRO"
                              ? "bg-zinc-200 text-zinc-500 cursor-default"
                              : "bg-teal-800 hover:bg-teal-700 text-white"
                          }`}
                        >
                          {subscriptionData?.plan === "PRO" ? "Current Active Plan" : "Upgrade to Pro (₹999)"}
                        </button>
                      </div>

                      {/* MAX FOUNDER */}
                      <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded uppercase">
                              Elite Tier
                            </span>
                            <span className="text-lg font-bold font-mono text-zinc-900">₹2,499 / mo</span>
                          </div>
                          <h4 className="text-base font-serif font-bold text-zinc-900 mt-2">
                            Max Founder Tier
                          </h4>
                          <p className="text-xs text-zinc-500 mt-1">
                            Full unconstrained power for founders and senior engineering candidates.
                          </p>
                          <ul className="mt-3 space-y-1.5 text-xs text-zinc-600 font-sans">
                            <li className="flex items-center gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-teal-700 shrink-0" />
                              <span>5,000 AI Credits / month for intensive building</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-teal-700 shrink-0" />
                              <span>Direct recruiter introductions & routing</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-teal-700 shrink-0" />
                              <span>1-on-1 Socratic mentor escalation</span>
                            </li>
                          </ul>
                        </div>

                        <button
                          onClick={() => {
                            setCheckoutPlan("MAX");
                            setShowCheckoutModal(true);
                          }}
                          disabled={subscriptionData?.plan === "MAX"}
                          className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                            subscriptionData?.plan === "MAX"
                              ? "bg-zinc-200 text-zinc-500 cursor-default"
                              : "bg-zinc-900 hover:bg-zinc-800 text-white"
                          }`}
                        >
                          {subscriptionData?.plan === "MAX" ? "Current Active Plan" : "Upgrade to Max (₹2,499)"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order History Table if exists */}
                  {subscriptionData?.orders && subscriptionData.orders.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-zinc-100">
                      <h4 className="text-xs font-mono font-bold uppercase text-zinc-700">
                        Payment & Order History
                      </h4>
                      <div className="overflow-x-auto rounded-xl border border-zinc-200">
                        <table className="w-full text-left text-xs font-sans">
                          <thead className="bg-zinc-50 text-zinc-500 font-mono text-[11px] border-b border-zinc-200">
                            <tr>
                              <th className="p-3">Order ID</th>
                              <th className="p-3">Plan</th>
                              <th className="p-3">Amount</th>
                              <th className="p-3">Status</th>
                              <th className="p-3">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100">
                            {subscriptionData.orders.map((o: any) => (
                              <tr key={o.orderId} className="hover:bg-zinc-50/50">
                                <td className="p-3 font-mono text-zinc-800 truncate max-w-[140px]">{o.orderId}</td>
                                <td className="p-3 font-medium text-zinc-900">{o.plan}</td>
                                <td className="p-3 font-mono text-zinc-700">₹{(o.amount / 100).toLocaleString("en-IN")}</td>
                                <td className="p-3">
                                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                                    o.status === "PAID"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : o.status === "CREATED"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-red-100 text-red-800"
                                  }`}>
                                    {o.status}
                                  </span>
                                </td>
                                <td className="p-3 text-zinc-400 font-mono text-[11px]">
                                  {new Date(o.createdAt).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================ */}
              {/* 7. APPEARANCE SECTION                                        */}
              {/* ============================================================ */}
              {activeCategory === "appearance" && (
                <div className="bg-white border border-zinc-200 rounded-3xl p-7 sm:p-9 space-y-6 shadow-xs">
                  <div className="border-b border-zinc-100 pb-4">
                    <h2 className="text-lg font-serif font-bold text-zinc-900">
                      Appearance & Theme
                    </h2>
                    <p className="text-xs text-zinc-500 font-sans mt-0.5">
                      Select theme preferences and layout density for MakeMistakes OS.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-xs font-mono font-semibold text-zinc-700 block">
                        Theme Preference
                      </label>

                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { id: "light", label: "Light", icon: Sun },
                          { id: "dark", label: "Dark (Preview)", icon: Moon },
                          { id: "system", label: "System", icon: Monitor },
                        ].map((t) => {
                          const Icon = t.icon;
                          const isSelected = preferencesState.theme === t.id;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => handleSavePreferences({ theme: t.id })}
                              className={`p-4 rounded-2xl border flex flex-col items-center gap-2 text-center cursor-pointer transition-all ${
                                isSelected
                                  ? "border-teal-700 bg-teal-50/50 text-teal-900 font-semibold shadow-xs"
                                  : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                              }`}
                            >
                              <Icon className={`h-5 w-5 ${isSelected ? "text-teal-700" : "text-zinc-400"}`} />
                              <span className="text-xs font-sans">{t.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-zinc-900 font-sans">
                          Interface Compact Mode
                        </h3>
                        <p className="text-[11px] text-zinc-500 font-sans">
                          Saves screen space on smaller laptop monitors.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSavePreferences({ compactMode: !preferencesState.compactMode })}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          preferencesState.compactMode ? "bg-teal-700" : "bg-zinc-200"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            preferencesState.compactMode ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* 8. DATA & PRIVACY SECTION                                    */}
              {/* ============================================================ */}
              {activeCategory === "privacy" && (
                <div className="bg-white border border-zinc-200 rounded-3xl p-7 sm:p-9 space-y-6 shadow-xs">
                  <div className="border-b border-zinc-100 pb-4">
                    <h2 className="text-lg font-serif font-bold text-zinc-900">
                      Data & Privacy Controls
                    </h2>
                    <p className="text-xs text-zinc-500 font-sans mt-0.5">
                      Export your data or manage destructive account operations securely.
                    </p>
                  </div>

                  <div className="space-y-5">
                    {/* Export Data */}
                    <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50 flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xs font-bold text-zinc-900 font-sans">
                          Export Personal Data
                        </h3>
                        <p className="text-[11px] text-zinc-500 font-sans mt-0.5">
                          Download a copy of your completed journeys, profile, and portfolio milestones in JSON format.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleExportData}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-white text-xs font-semibold font-sans cursor-pointer transition-all shrink-0"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Export Data (JSON)</span>
                      </button>
                    </div>

                    {/* Delete Account (Destructive) */}
                    <div className="p-5 rounded-2xl border border-rose-200 bg-rose-50/40 flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xs font-bold text-rose-900 font-sans">
                          Delete Account
                        </h3>
                        <p className="text-[11px] text-rose-700 font-sans mt-0.5">
                          Permanently delete your profile, progress, and stored journey records. This action cannot be undone.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold font-sans cursor-pointer transition-all shrink-0 shadow-xs"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete Account</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ============================================================ */}
      {/* AVATAR PHOTO MODAL                                           */}
      {/* ============================================================ */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-7 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-serif font-bold text-zinc-900">
              Change Profile Photo
            </h3>
            <p className="text-xs text-zinc-500 font-sans">
              Enter an image URL for your profile avatar.
            </p>

            <input
              type="url"
              value={customAvatarInput}
              onChange={(e) => setCustomAvatarInput(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-sans text-zinc-900 focus:outline-none focus:border-teal-700"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (customAvatarInput.trim()) {
                    setProfileState({ ...profileState, avatarUrl: customAvatarInput.trim() });
                  }
                  setShowAvatarModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-white text-xs font-semibold cursor-pointer"
              >
                Apply Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* DELETE ACCOUNT CONFIRMATION MODAL                            */}
      {/* ============================================================ */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-7 max-w-md w-full space-y-4 shadow-2xl border border-rose-200">
            <div className="flex items-center gap-2 text-rose-700">
              <AlertCircle className="h-5 w-5" />
              <h3 className="text-base font-serif font-bold">
                Confirm Account Deletion
              </h3>
            </div>

            <p className="text-xs text-zinc-600 font-sans leading-relaxed">
              This will permanently remove your profile, preferences, and all problem journey progress from MakeMistakes. Type <strong className="font-mono text-zinc-900">DELETE</strong> to confirm.
            </p>

            <input
              type="text"
              value={deleteConfirmInput}
              onChange={(e) => setDeleteConfirmInput(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full px-3.5 py-2 rounded-xl border border-rose-300 bg-rose-50/30 text-xs font-mono text-zinc-900 focus:outline-none focus:border-rose-600"
            />

            {deleteStatus === "error" && (
              <p className="text-xs font-mono text-rose-600">
                Failed to delete account. Please verify input.
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmInput.trim() !== "DELETE" || deleteStatus === "deleting"}
                onClick={handleDeleteAccount}
                className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold cursor-pointer disabled:opacity-40"
              >
                {deleteStatus === "deleting" ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ============================================================ */}
      {/* 9. CHECKOUT / UPGRADE MODAL                                  */}
      {/* ============================================================ */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        selectedPlan={checkoutPlan}
        userEmail={profileState.email || userId}
        onSuccess={() => {
          loadData();
        }}
      />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 p-8 text-zinc-400 font-sans text-xs">Loading settings...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
