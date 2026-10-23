"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  Lock,
  UserCheck,
} from "lucide-react";
import { PLANS, PlanTier } from "@/lib/plans";
import CheckoutModal from "@/components/payment/CheckoutModal";
import { getOnboardingProfile, syncUserOnboardingWithBackend } from "@/lib/onboardingStore";

function PlanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>("PRO");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [loadingDestination, setLoadingDestination] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<{ plan: string; isPaid: boolean; credits?: number } | null>(null);

  useEffect(() => {
    // 1. Resolve email from query parameter or localStorage
    const queryEmail = searchParams.get("email");
    let resolvedEmail = "";
    if (queryEmail && /\S+@\S+\.\S+/.test(queryEmail)) {
      resolvedEmail = queryEmail.trim().toLowerCase();
    } else if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user_email");
      if (stored) resolvedEmail = stored.trim().toLowerCase();
    }
    setEmail(resolvedEmail);

    // 2. Check if user already has an active subscription
    if (resolvedEmail) {
      fetch(`/api/subscription/me?email=${encodeURIComponent(resolvedEmail)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.plan) {
            setCurrentPlan({
              plan: data.plan,
              isPaid: Boolean(data.isPaid),
              credits: data.credits?.remaining,
            });
          }
        })
        .catch(() => {});
    }
  }, [searchParams]);

  const getNextDestination = async () => {
    try {
      const returnTo = searchParams.get("returnTo");
      if (returnTo && returnTo.startsWith("/")) {
        return returnTo;
      }
      const hasCompleted = await syncUserOnboardingWithBackend(email);
      const prof = getOnboardingProfile();
      return hasCompleted || prof.onboardingCompleted ? "/dashboard" : "/philosophy";
    } catch {
      return "/dashboard";
    }
  };

  const handleContinueWithFree = async () => {
    setLoadingDestination(true);
    const dest = await getNextDestination();
    router.push(dest);
  };

  const handleSelectPaid = (tier: "PRO" | "MAX") => {
    setSelectedPlan(tier);
    setCheckoutOpen(true);
  };

  const handlePaymentSuccess = async () => {
    setLoadingDestination(true);
    const dest = await getNextDestination();
    router.push(dest);
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 sm:p-8 shadow-xl shadow-zinc-200/50 space-y-6 w-full animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-2 text-left">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full font-semibold uppercase">
            ACCOUNT VERIFIED
          </span>
          <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Active</span>
          </div>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl text-zinc-900 leading-tight">
          Choose Your Builder Plan
        </h2>
        <p className="text-xs sm:text-sm text-zinc-600 font-sans leading-relaxed">
          Select your subscription tier to unlock AI mentoring, concurrency load testing, and
          recruiter verification.
        </p>

        {/* Authenticated Account Callout */}
        <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between text-xs">
          <div className="space-y-0.5 min-w-0 pr-2">
            <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">
              Entitlement Bound To Account
            </span>
            <span className="font-mono text-zinc-900 font-bold truncate block">
              {email || "Authenticated Student"}
            </span>
          </div>
          <span className="text-[10px] font-mono text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded font-semibold shrink-0">
            Internal ID Secured
          </span>
        </div>

        {currentPlan?.isPaid && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
            <div>
              <span className="text-[10px] font-mono text-emerald-800 uppercase font-bold block">
                Active Subscription: {currentPlan.plan}
              </span>
              <span className="text-zinc-600 font-sans">
                {currentPlan.credits ?? 0} AI Credits available
              </span>
            </div>
            <button
              onClick={handleContinueWithFree}
              className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-mono text-[11px] font-bold transition-colors cursor-pointer"
            >
              Go to Workspace &rarr;
            </button>
          </div>
        )}
      </div>

      {/* Plan Options Stack */}
      <div className="space-y-3.5 pt-1">
        {/* 1. PRO BUILDER TIER (RECOMMENDED) */}
        <div className="relative p-5 rounded-2xl border-2 border-teal-600 bg-teal-50/40 shadow-sm hover:border-teal-700 transition-all">
          <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-teal-700 text-white font-mono text-[9px] font-bold uppercase tracking-wider shadow-sm">
            RECOMMENDED
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <h3 className="text-base font-serif font-bold text-zinc-900">
                Pro Builder Tier
              </h3>
              <p className="text-xs text-zinc-500 font-sans">
                Full Socratic mentor reviews & verified portfolio.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold font-mono text-zinc-900">₹999</span>
              <span className="text-[10px] font-mono text-zinc-400"> / mo</span>
            </div>
          </div>

          <ul className="mt-3.5 space-y-1.5 text-xs text-zinc-700 font-sans">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
              <span><strong>1,000 AI Credits / month</strong> for Nova mentor code review</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
              <span>Verified recruiter showcase & telemetry benchmarks</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
              <span>Custom portfolio domain linking</span>
            </li>
          </ul>

          <button
            onClick={() => handleSelectPaid("PRO")}
            className="w-full mt-4 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs transition-all shadow-md shadow-teal-700/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Select Pro Builder (₹999 / mo) &rarr;</span>
          </button>
        </div>

        {/* 2. MAX FOUNDER TIER */}
        <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200 bg-white hover:border-zinc-300 transition-all">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-serif font-bold text-zinc-900">
                  Max Founder Tier
                </h3>
                <span className="text-[9px] font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded uppercase">
                  Elite
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-sans mt-0.5">
                Maximum power for founders & senior candidates.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold font-mono text-zinc-900">₹2,499</span>
              <span className="text-[10px] font-mono text-zinc-400"> / mo</span>
            </div>
          </div>

          <ul className="mt-3 space-y-1.5 text-xs text-zinc-600 font-sans">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
              <span><strong>5,000 AI Credits / month</strong> for intensive building</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
              <span>Direct recruiter introductions & hiring pipeline routing</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
              <span>1-on-1 Socratic mentor escalation</span>
            </li>
          </ul>

          <button
            onClick={() => handleSelectPaid("MAX")}
            className="w-full mt-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Select Max Founder (₹2,499 / mo)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3. FREE COMMUNITY TIER */}
        <div className="pt-2 text-center">
          <button
            onClick={handleContinueWithFree}
            disabled={loadingDestination}
            className="w-full py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 font-medium text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>{loadingDestination ? "Loading Workspace..." : "Or Continue with Free Community Tier (₹0)"}</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
          </button>
          <span className="text-[11px] text-zinc-400 font-sans block mt-1.5">
            Includes 100 AI credits & access to all 8 Product Journey phases.
          </span>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        selectedPlan={selectedPlan}
        userEmail={email}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}

export default function PostLoginPlanPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-mono text-zinc-400">Loading plan options...</div>}>
      <PlanContent />
    </Suspense>
  );
}
