"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Layout,
  ShoppingBag,
  Users,
  BarChart3,
  BookOpen,
  Briefcase,
  Wallet,
  Check,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  Flame,
  Zap,
  Rocket,
  ShieldCheck,
} from "lucide-react";

export interface FirstProductOption {
  id: string;
  title: string;
  category: string;
  badge: string;
  description: string;
  icon: React.ElementType;
  whatYouWillBuild: string;
  modules: string[];
  estimatedJourney: string;
  difficulty: string;
  reward: string;
  realWorldImpact: string;
}

interface ChooseYourFirstProductProps {
  onSelectProduct: (product: FirstProductOption) => void;
  onBackToDestination: () => void;
}

export default function ChooseYourFirstProduct({
  onSelectProduct,
  onBackToDestination,
}: ChooseYourFirstProductProps) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const products: FirstProductOption[] = [
    // 1. AI Assistant
    {
      id: "ai-assistant",
      title: "AI Co-Pilot & Workspace Assistant",
      category: "Artificial Intelligence",
      badge: "🔥 Most Popular",
      description: "An intelligent autonomous co-pilot that summarizes code, executes tasks, and manages workflows.",
      icon: Bot,
      whatYouWillBuild: "Build a context-aware AI workspace assistant with streaming chat responses, custom document indexing, prompt memory, and automated workflow execution.",
      modules: ["Streaming Chat UI", "Prompt History", "Vector Context Indexing", "Tool Execution Pipeline", "User Preference Memory", "API Rate Limiting"],
      estimatedJourney: "95 Missions",
      difficulty: "Intermediate",
      reward: "+150 PTS • AI Engineer Badge",
      realWorldImpact: "Automates daily developer tasks and boosts team focus time by 40%.",
    },

    // 2. SaaS Platform
    {
      id: "saas-platform",
      title: "B2B Subscription SaaS Platform",
      category: "Software as a Service",
      badge: "🚀 Founder Track",
      description: "A complete multi-tenant SaaS application with team workspaces, subscription billing, and usage metrics.",
      icon: Layout,
      whatYouWillBuild: "Build a production-grade multi-tenant B2B SaaS platform featuring organization management, Stripe billing tiers, role-based permissions, and usage analytics.",
      modules: ["Multi-Tenant Workspaces", "Stripe Subscription Billing", "Role-Based Access Control", "Usage Analytics Engine", "Team Invites", "Custom Webhooks"],
      estimatedJourney: "110 Missions",
      difficulty: "Advanced",
      reward: "+200 PTS • SaaS Founder Badge",
      realWorldImpact: "Enables independent software creators to launch and monetize niche web applications.",
    },

    // 3. Marketplace
    {
      id: "marketplace",
      title: "Digital Product Marketplace",
      category: "E-Commerce & Commerce",
      badge: "💎 High Value",
      description: "A modern online marketplace where sellers list digital assets, and buyers discover, order, and review items.",
      icon: ShoppingBag,
      whatYouWillBuild: "Build a multi-vendor digital marketplace featuring product catalog search, shopping cart checkout, seller payout tracking, and verified customer reviews.",
      modules: ["Vendor Storefronts", "Instant Elastic Search", "Shopping Cart Checkout", "Stripe Connect Payouts", "Order Management", "Verified Reviews"],
      estimatedJourney: "110 Missions",
      difficulty: "Advanced",
      reward: "+180 PTS • Commerce Architect",
      realWorldImpact: "Powers peer-to-peer digital commerce and instant creator monetization.",
    },

    // 4. Social Platform
    {
      id: "social-platform",
      title: "Real-Time Builder Community",
      category: "Social & Community",
      badge: "⚡ Real-Time",
      description: "A social network for engineers to share build updates, collaborate on projects, and follow feed activities.",
      icon: Users,
      whatYouWillBuild: "Build a real-time builder network with live activity feeds, nested comment threads, user follow graphs, instant notifications, and media uploads.",
      modules: ["Live Activity Feed", "User Follow Graph", "Nested Comment Threads", "Real-Time Notifications", "Direct Messaging", "Media Storage Pipeline"],
      estimatedJourney: "105 Missions",
      difficulty: "Intermediate → Advanced",
      reward: "+160 PTS • Full-Stack Social Badge",
      realWorldImpact: "Connects global product engineers to share knowledge and build in public.",
    },

    // 5. Analytics Dashboard
    {
      id: "analytics-dashboard",
      title: "Real-Time Telemetry & Analytics Engine",
      category: "Data & Performance",
      badge: "📊 Data Systems",
      description: "A high-performance analytics dashboard that ingests events, calculates metrics, and renders real-time charts.",
      icon: BarChart3,
      whatYouWillBuild: "Build a real-time analytics engine that processes high-velocity event streams, generates aggregated metric time-series, and renders live interactive charts.",
      modules: ["High-Throughput Ingestion", "Time-Series Aggregation", "Interactive Charting UI", "Custom Filter Engine", "Alert Trigger System", "Export PDF/CSV Reports"],
      estimatedJourney: "100 Missions",
      difficulty: "Intermediate",
      reward: "+170 PTS • Telemetry Engineer",
      realWorldImpact: "Provides real-time system visibility and business metrics for decision makers.",
    },

    // 6. Learning Platform
    {
      id: "learning-platform",
      title: "Interactive Learning & Challenge Simulator",
      category: "EdTech & Simulation",
      badge: "⭐ Core Architecture",
      description: "An interactive education platform featuring step-by-step tracks, automated code submission, and streak tracking.",
      icon: BookOpen,
      whatYouWillBuild: "Build a hands-on learning simulator with interactive module steps, automated submission verification, gamified streak badges, and student progress graphs.",
      modules: ["Interactive Module Steps", "Automated Submission Checker", "Gamified XP & Streaks", "Course Catalog Navigation", "Student Certificate Export", "Leaderboard Metrics"],
      estimatedJourney: "100 Missions",
      difficulty: "Intermediate",
      reward: "+150 PTS • Product Engineer",
      realWorldImpact: "Replaces boring lecture courses with interactive hands-on problem solving.",
    },

    // 7. CRM System
    {
      id: "crm-system",
      title: "Customer Relationship & Pipeline CRM",
      category: "Enterprise Software",
      badge: "💼 Enterprise",
      description: "A streamlined CRM system to track sales leads, manage customer contacts, and automate follow-up tasks.",
      icon: Briefcase,
      whatYouWillBuild: "Build a Kanban-style pipeline CRM to manage deals, schedule contact follow-ups, log communication history, and generate conversion reports.",
      modules: ["Drag-and-Drop Pipeline", "Contact Management DB", "Activity Audit Logs", "Email Task Scheduling", "Deal Stage Analytics", "Team Access Permissions"],
      estimatedJourney: "95 Missions",
      difficulty: "Intermediate",
      reward: "+160 PTS • Enterprise Systems Badge",
      realWorldImpact: "Streamlines revenue operations and sales team workflows.",
    },

    // 8. Finance Platform
    {
      id: "finance-platform",
      title: "Personal Finance & Expense Engine",
      category: "FinTech & Banking",
      badge: "🔒 High Security",
      description: "A secure financial manager that categorizes expenses, tracks budgets, and generates monthly income reports.",
      icon: Wallet,
      whatYouWillBuild: "Build a secure personal finance engine featuring transaction categorization, automated budget alerts, bank ledger calculations, and visual spending trends.",
      modules: ["Double-Entry Ledger DB", "Transaction Auto-Categorize", "Budget Threshold Alerts", "Visual Spending Trends", "Encrypted Data Vault", "Recurring Expense Calculator"],
      estimatedJourney: "100 Missions",
      difficulty: "Intermediate → Advanced",
      reward: "+175 PTS • FinTech Architect",
      realWorldImpact: "Helps users achieve financial clarity and track personal wealth.",
    },
  ];

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const handleContinue = () => {
    if (selectedProduct) {
      onSelectProduct(selectedProduct);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-4 font-sans text-left space-y-8 select-none">
      
      {/* Top Header & Navigation */}
      <div className="space-y-4">
        <div className="flex items-center justify-between font-mono text-xs text-zinc-500">
          <button
            onClick={onBackToDestination}
            className="flex items-center gap-1.5 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer bg-transparent border-none font-mono text-xs font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Destination</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 flex items-center gap-1.5">
              <Rocket className="h-3.5 w-3.5 text-teal-700" />
              FIRST PRODUCT SELECTION
            </span>
            <span className="font-semibold text-zinc-700">Step 4 of 4</span>
          </div>
        </div>

        {/* Header Title & Subtitle */}
        <div className="space-y-3 max-w-3xl">
          <span className="font-mono text-xs font-bold text-teal-800 uppercase tracking-widest block">
            YOUR FIRST STARTUP VISION
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-zinc-900 tracking-tight leading-tight">
            What do you want to build?
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 font-sans leading-relaxed">
            Every great company started with one idea. Today, you&apos;re choosing yours. This isn&apos;t a tutorial project — it&apos;s the first product you&apos;ll bring to life.
          </p>
        </div>
      </div>

      {/* Cinematic Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 pt-2">
        {products.map((card) => {
          const Icon = card.icon;
          const isSelected = selectedProductId === card.id;

          return (
            <motion.div
              key={card.id}
              whileHover={{ y: -6, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setSelectedProductId(card.id)}
              className={`relative p-6 sm:p-7 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-6 shadow-sm ${
                isSelected
                  ? "bg-white border-teal-600 ring-2 ring-teal-600/30 shadow-xl shadow-teal-700/10"
                  : "bg-white border-zinc-200/80 hover:border-teal-300 hover:shadow-md"
              }`}
            >
              {/* Top Row: Icon + Badge + Selection Check */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-teal-700 text-white shadow-md shadow-teal-700/20"
                        : "bg-teal-50 text-teal-700 border border-teal-200"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <div>
                    <span className="font-mono text-[10px] text-teal-800 font-bold uppercase tracking-wider block">
                      {card.category}
                    </span>
                    <span className="font-mono text-[11px] bg-teal-50 text-teal-800 px-2 py-0.5 rounded-full border border-teal-200 font-semibold inline-block mt-0.5">
                      {card.badge}
                    </span>
                  </div>
                </div>

                {isSelected ? (
                  <div className="h-6 w-6 rounded-full bg-teal-700 text-white flex items-center justify-center shadow-md shrink-0">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <div className="h-6 w-6 rounded-full border border-zinc-200 bg-zinc-50 shrink-0" />
                )}
              </div>

              {/* Title & Short Description */}
              <div className="space-y-2">
                <h3 className="font-serif text-xl font-bold text-zinc-900 leading-snug">
                  {card.title}
                </h3>
                <p className="text-xs text-zinc-600 font-sans leading-relaxed">
                  {card.description}
                </p>
              </div>

              {/* What You Will Build Box */}
              <div className="bg-zinc-50 border border-zinc-200/80 p-4 rounded-2xl space-y-2">
                <span className="font-mono text-[10px] text-teal-800 font-bold uppercase tracking-wider block">
                  WHAT YOU WILL BUILD
                </span>
                <p className="text-xs text-zinc-700 font-sans leading-relaxed">
                  {card.whatYouWillBuild}
                </p>
              </div>

              {/* Key Product Modules Checklist */}
              <div className="space-y-2">
                <span className="font-mono text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">
                  Product Modules You&apos;ll Create
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                  {card.modules.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-zinc-700 bg-white border border-zinc-200/60 p-2 rounded-xl text-[11px]">
                      <span className="text-emerald-700 font-bold">✓</span>
                      <span className="truncate">{m}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer Metrics */}
              <div className="pt-4 border-t border-zinc-100 flex items-center justify-between font-mono text-[11px]">
                <div className="flex items-center gap-3">
                  <span className="text-zinc-500">
                    Journey: <strong className="text-zinc-900 font-bold">{card.estimatedJourney}</strong>
                  </span>
                  <span className="text-zinc-300">•</span>
                  <span className="text-zinc-500">
                    Level: <strong className="text-teal-800 font-semibold">{card.difficulty}</strong>
                  </span>
                </div>

                <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                  {card.reward}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Reassurance & CTA Section */}
      <div className="pt-6 border-t border-zinc-200/80 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3 text-xs font-sans text-zinc-600 bg-white border border-zinc-200 px-4 py-3 rounded-2xl shadow-sm max-w-lg">
          <Zap className="h-4 w-4 text-teal-700 shrink-0" />
          <p className="leading-tight">
            Don&apos;t worry. This is only your first product. As your engineering skills grow, you&apos;ll unlock many more product journeys.
          </p>
        </div>

        <button
          onClick={handleContinue}
          disabled={!selectedProductId}
          className="group inline-flex h-13 w-full sm:w-auto items-center justify-center gap-3 rounded-full bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm font-sans px-9 transition-all cursor-pointer shadow-lg shadow-teal-700/20 border-none disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Continue Building →</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

    </div>
  );
}
