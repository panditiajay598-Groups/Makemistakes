export type PlanTier = "FREE" | "PRO" | "MAX";

export interface PlanConfig {
  id: PlanTier;
  name: string;
  badge: string;
  description: string;
  price: number; // in INR
  amountInPaise: number; // 1 INR = 100 paise
  currency: "INR";
  billingPeriod: "monthly" | "lifetime";
  aiCreditsPerMonth: number;
  highlighted?: boolean;
  features: string[];
}

export const PLANS: Record<PlanTier, PlanConfig> = {
  FREE: {
    id: "FREE",
    name: "Free Community Tier",
    badge: "Community",
    description: "Full access to foundational engineering challenges and Socratic mentor sandbox.",
    price: 0,
    amountInPaise: 0,
    currency: "INR",
    billingPeriod: "lifetime",
    aiCreditsPerMonth: 100,
    features: [
      "Full access to all 8 Product Journey phases",
      "100 AI credits per month for Socratic hints",
      "Standard test concurrency runner",
      "Public Proof-of-Work portfolio generation",
      "GitHub repository export",
      "Community leaderboard ranking",
    ],
  },
  PRO: {
    id: "PRO",
    name: "Pro Builder Tier",
    badge: "Most Popular",
    description: "For serious student engineers aiming for top-tier startup roles.",
    price: 999,
    amountInPaise: 99900,
    currency: "INR",
    billingPeriod: "monthly",
    aiCreditsPerMonth: 1000,
    highlighted: true,
    features: [
      "Everything in Free Community Tier",
      "1,000 AI credits per month with priority queue",
      "In-depth Socratic Nova AI architectural code reviews",
      "Verified recruiter showcase & telemetry benchmark",
      "Custom portfolio domain linking",
      "High-throughput concurrency test runner (10k req/s)",
      "Priority customer & technical support",
    ],
  },
  MAX: {
    id: "MAX",
    name: "Max Founder Tier",
    badge: "Elite",
    description: "Full unconstrained power for founders and senior engineering candidates.",
    price: 2499,
    amountInPaise: 249900,
    currency: "INR",
    billingPeriod: "monthly",
    aiCreditsPerMonth: 5000,
    features: [
      "Everything in Pro Builder Tier",
      "5,000 AI credits per month for intensive building",
      "Direct recruiter introductions & hiring pipeline routing",
      "Unlimited production architecture reviews",
      "Automated recruiter-certified Proof-of-Work badges",
      "1-on-1 Socratic mentor escalation",
      "Early access to new production mission tracks",
    ],
  },
};

export function getPlanConfig(plan: string): PlanConfig | null {
  const normalized = (plan || "").toString().trim().toUpperCase() as PlanTier;
  return PLANS[normalized] || null;
}
