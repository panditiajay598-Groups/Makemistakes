"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import CheckoutModal from "@/components/payment/CheckoutModal";
import { PLANS, PlanTier } from "@/lib/plans";
import {
  CheckCircle2,
  ShieldCheck,
  Zap,
  Sparkles,
  HelpCircle,
  ArrowRight,
  Lock,
} from "lucide-react";

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>("PRO");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [currentPlan, setCurrentPlan] = useState<string>("FREE");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("user_email") || "";
      setUserEmail(email);

      // Fetch live subscription status
      fetch("/api/subscription/me")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.plan) {
            setCurrentPlan(data.plan);
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleOpenCheckout = (planId: PlanTier) => {
    if (planId === "FREE") return;
    setSelectedPlan(planId);
    setCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-teal-500/30 selection:text-white flex flex-col">
      <Navbar />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Account-Bound & Recruiter-Verified Subscriptions</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-serif text-white tracking-tight">
            Prove by Shipping. <br />
            <span className="text-teal-400">Invest in Real Proof of Work.</span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-sans">
            Choose the level of AI mentoring, concurrency load testing, and verified recruiter
            visibility you need to transition from student to startup engineer.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-20">
          {(["FREE", "PRO", "MAX"] as PlanTier[]).map((tierKey) => {
            const plan = PLANS[tierKey];
            const isCurrent = currentPlan === tierKey;
            const isHighlighted = plan.highlighted;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-200 ${
                  isHighlighted
                    ? "bg-zinc-900/90 border-2 border-teal-500/60 shadow-2xl shadow-teal-500/10"
                    : "bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700"
                }`}
              >
                {isHighlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-teal-600 text-white font-mono text-[11px] font-bold uppercase tracking-wider shadow-md">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400">
                      {plan.badge}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                        Current Plan
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold font-serif text-white">{plan.name}</h3>
                  <p className="text-xs text-zinc-400 mt-2 min-h-[36px] leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="mt-6 mb-8 pb-6 border-b border-zinc-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black font-mono text-white">
                        ₹{plan.price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs font-mono text-zinc-400">
                        / {plan.billingPeriod}
                      </span>
                    </div>
                    <div className="mt-2 text-xs font-mono text-teal-400/90 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      <span>{plan.aiCreditsPerMonth.toLocaleString()} AI Credits / mo</span>
                    </div>
                  </div>

                  {/* Feature List */}
                  <div className="space-y-3 mb-8">
                    <span className="text-[11px] font-mono text-zinc-400 uppercase font-bold tracking-wider block">
                      What&apos;s included:
                    </span>
                    <ul className="space-y-2.5">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-zinc-300">
                          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                          <span className="leading-tight">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleOpenCheckout(tierKey)}
                  disabled={isCurrent}
                  className={`w-full py-3.5 rounded-2xl font-semibold text-xs tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    isCurrent
                      ? "bg-zinc-800 text-zinc-500 cursor-default"
                      : isHighlighted
                      ? "bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-600/20"
                      : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                  }`}
                >
                  {isCurrent ? (
                    <span>Active on Your Account</span>
                  ) : tierKey === "FREE" ? (
                    <span>Included Free</span>
                  ) : (
                    <>
                      <span>Upgrade to {plan.name}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Security & Isolation FAQ */}
        <div className="max-w-3xl mx-auto space-y-6 pt-10 border-t border-zinc-800">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold font-serif text-white">
              Billing Security & Account Entitlement FAQ
            </h2>
            <p className="text-xs text-zinc-400">
              Clear answers on how payments and subscriptions operate on MakeMistakes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <h4 className="text-sm font-bold text-white font-serif flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>Account-Bound Isolation</span>
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                When you purchase a plan, it is cryptographically attached to your internal account
                ID. No other browser, device, or user can hijack your subscription benefits.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <h4 className="text-sm font-bold text-white font-serif flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>AI Credits & Expiration</span>
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Your credits are allocated immediately upon verified payment. If your subscription
                expires, you gracefully fall back to the Free Community Tier without losing your
                work.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <h4 className="text-sm font-bold text-white font-serif flex items-center gap-2">
                <Lock className="w-4 h-4 text-teal-400" />
                <span>Changing Your Email</span>
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                If you update your verified email address, your subscription remains active because
                it is bound to your immutable internal account ID.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <h4 className="text-sm font-bold text-white font-serif flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-zinc-400" />
                <span>Refunds & Cancellations</span>
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                You can cancel at any time. When a refund is processed by our billing team, access is
                safely reverted without touching any of your saved project repositories.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        selectedPlan={selectedPlan}
        userEmail={userEmail}
        onSuccess={() => {
          setCurrentPlan(selectedPlan);
        }}
      />
    </div>
  );
}
