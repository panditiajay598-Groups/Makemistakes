"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Cpu,
  Layers,
  Database,
  WifiOff,
  UserCheck,
  Zap,
  HelpCircle,
  Smartphone,
  TrendingDown,
  Terminal,
} from "lucide-react";

export interface BuilderProfileMetrics {
  problemSolving: "High" | "Medium" | "Advanced";
  debugging: "High" | "Medium" | "Advanced";
  architecture: "Beginner" | "Intermediate" | "Advanced";
  planning: "High" | "Medium" | "Advanced";
  userThinking: "High" | "Medium" | "Advanced";
}

interface ScenarioOption {
  id: string;
  label: string;
  description: string;
  trait: keyof BuilderProfileMetrics;
  traitLevel: "High" | "Medium" | "Advanced" | "Intermediate";
}

interface Scenario {
  id: number;
  title: string;
  category: string;
  icon: React.ElementType;
  story: string;
  options: ScenarioOption[];
}

interface BuilderAssessmentProps {
  onCompleteAssessment: (profile: BuilderProfileMetrics) => void;
  onBackToProduct: () => void;
}

export default function BuilderAssessment({
  onCompleteAssessment,
  onBackToProduct,
}: BuilderAssessmentProps) {
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isGeneratingJourney, setIsGeneratingJourney] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  // Hidden scoring accumulator
  const [scores, setScores] = useState<Record<string, number>>({
    problemSolving: 0,
    debugging: 0,
    architecture: 0,
    planning: 0,
    userThinking: 0,
  });

  const scenarios: Scenario[] = [
    // Scenario 1: AI Assistant Persistence
    {
      id: 1,
      title: "Conversation History & Persistence",
      category: "Product Architecture",
      icon: Cpu,
      story: "A user signs into your AI Workspace Assistant. They ask complex questions, close the browser window, and return tomorrow expecting their conversation history intact. What should your product do?",
      options: [
        {
          id: "s1-a",
          label: "Automatically sync chat history to encrypted database on every message",
          description: "Persist messages instantly with background auto-save and restore seamlessly on re-login.",
          trait: "architecture",
          traitLevel: "Advanced",
        },
        {
          id: "s1-b",
          label: "Save session locally in browser memory and prompt user to export history",
          description: "Keep data in local storage for speed, requiring explicit user action to backup to cloud.",
          trait: "planning",
          traitLevel: "Medium",
        },
        {
          id: "s1-c",
          label: "Start a fresh session every time for privacy and performance",
          description: "Prioritize lightweight fast loads without persisting background state across days.",
          trait: "problemSolving",
          traitLevel: "Medium",
        },
      ],
    },

    // Scenario 2: Offline Shopping Cart
    {
      id: 2,
      title: "Offline Network Resilience",
      category: "User Experience & Reliability",
      icon: WifiOff,
      story: "A customer is adding products to their shopping cart on your marketplace. Suddenly, their internet connection drops. What should happen in your product?",
      options: [
        {
          id: "s2-a",
          label: "Save cart state locally & sync transparently when connection restores",
          description: "Optimistic UI: Let the user continue browsing cart items offline and queue API updates.",
          trait: "userThinking",
          traitLevel: "High",
        },
        {
          id: "s2-b",
          label: "Show a subtle non-blocking banner and pause cart modifications",
          description: "Notify the user immediately about connectivity loss without erasing draft selections.",
          trait: "problemSolving",
          traitLevel: "High",
        },
        {
          id: "s2-c",
          label: "Block page interactions until connection returns to avoid price mismatch",
          description: "Prevent inventory oversell by locking cart updates until server responds.",
          trait: "architecture",
          traitLevel: "Intermediate",
        },
      ],
    },

    // Scenario 3: Missing Feature Discovery
    {
      id: 3,
      title: "Feature Discoverability & Navigation",
      category: "Product Design",
      icon: Layers,
      story: "Multiple active users report that they cannot find a crucial search filter feature that your team spent weeks building. What should you improve first?",
      options: [
        {
          id: "s3-a",
          label: "Analyze user click heatmaps to redesign the search layout hierarchy",
          description: "Use usage telemetry data to place the feature prominently where users naturally look.",
          trait: "userThinking",
          traitLevel: "High",
        },
        {
          id: "s3-b",
          label: "Add an interactive 10-second onboarding tooltip highlighting the feature",
          description: "Guide existing and new users with a subtle contextual callout on their next visit.",
          trait: "planning",
          traitLevel: "High",
        },
        {
          id: "s3-c",
          label: "Send an email product update announcing the location of the search filter",
          description: "Notify users externally through newsletter release notes and documentation.",
          trait: "problemSolving",
          traitLevel: "Medium",
        },
      ],
    },

    // Scenario 4: Post-Release Slowness
    {
      id: 4,
      title: "System Performance Outage",
      category: "Debugging & Operations",
      icon: Zap,
      story: "Your application suddenly becomes 5x slower immediately after releasing a new dashboard feature. What should you investigate first?",
      options: [
        {
          id: "s4-a",
          label: "Check database query metrics for unindexed or N+1 query loops",
          description: "Inspect slow query logs and DB CPU spikes caused by missing database indexes.",
          trait: "debugging",
          traitLevel: "Advanced",
        },
        {
          id: "s4-b",
          label: "Inspect recent git commits to identify API payload changes",
          description: "Diff recent pull requests to isolate memory leaks or bloated response payloads.",
          trait: "debugging",
          traitLevel: "High",
        },
        {
          id: "s4-c",
          label: "Immediately rollback to the previous stable production release",
          description: "Restore normal speed for users first, then debug the regression in staging environment.",
          trait: "planning",
          traitLevel: "Advanced",
        },
      ],
    },

    // Scenario 5: High Feature Requests
    {
      id: 5,
      title: "Feature Prioritization Trade-offs",
      category: "Product Strategy",
      icon: RefreshCw,
      story: "Hundreds of community members request a complex feature that is outside your core product vision. How do you decide whether to build it?",
      options: [
        {
          id: "s5-a",
          label: "Evaluate if it serves core product vision before committing engineering time",
          description: "Prioritize features that align with long-term strategy rather than building bloated add-ons.",
          trait: "planning",
          traitLevel: "Advanced",
        },
        {
          id: "s5-b",
          label: "Build a lightweight plugin API so users or third parties can add it themselves",
          description: "Empower the community via open webhooks and extensions without cluttering core code.",
          trait: "architecture",
          traitLevel: "Advanced",
        },
        {
          id: "s5-c",
          label: "Create a prototype MVP for 5% of users to measure real engagement",
          description: "Test demand with a minimal experiment before committing full sprint cycles.",
          trait: "userThinking",
          traitLevel: "High",
        },
      ],
    },

    // Scenario 6: Password Reset Complaints
    {
      id: 6,
      title: "Authentication Experience",
      category: "Security & UX",
      icon: UserCheck,
      story: "Your sign-in page receives frequent support tickets because users repeatedly forget passwords. How would you improve the authentication experience?",
      options: [
        {
          id: "s6-a",
          label: "Implement passwordless Magic Email OTP / Social OAuth sign-in",
          description: "Eliminate password friction completely with instant 6-digit email codes and Google login.",
          trait: "userThinking",
          traitLevel: "High",
        },
        {
          id: "s6-b",
          label: "Simplify the password reset flow to a 1-click email recovery link",
          description: "Make password recovery effortless with instant magic reset tokens.",
          trait: "problemSolving",
          traitLevel: "High",
        },
        {
          id: "s6-c",
          label: "Add a password manager helper tooltip on the login form",
          description: "Guide users to store secure passwords in 1Password or browser vaults.",
          trait: "planning",
          traitLevel: "Medium",
        },
      ],
    },

    // Scenario 7: Mobile-Only Bug
    {
      id: 7,
      title: "Device-Specific Edge Case",
      category: "Cross-Platform Debugging",
      icon: Smartphone,
      story: "A critical UI alignment bug appears strictly on mobile Safari browsers, but works perfectly on desktop Chrome. What is your first step?",
      options: [
        {
          id: "s7-a",
          label: "Connect Safari Developer Tools & inspect mobile viewport layout bounds",
          description: "Inspect mobile DOM elements, flexbox bounds, and touch event listeners directly.",
          trait: "debugging",
          traitLevel: "High",
        },
        {
          id: "s7-b",
          label: "Check CSS media query breakpoints and flex wrap rules for mobile widths",
          description: "Review responsive CSS rules to fix overflow and dynamic layout math.",
          trait: "problemSolving",
          traitLevel: "High",
        },
        {
          id: "s7-c",
          label: "Replicate the issue on an actual physical mobile device",
          description: "Test real touch gestures and device renderer behavior before editing code.",
          trait: "debugging",
          traitLevel: "Medium",
        },
      ],
    },

    // Scenario 8: Low Retention Analysis
    {
      id: 8,
      title: "Product Retention & Growth",
      category: "Product Growth & Lifecycle",
      icon: TrendingDown,
      story: "Your product is functioning without bugs, but analytics show that 80% of new signups stop returning after Day 1. What would you investigate?",
      options: [
        {
          id: "s8-a",
          label: "Map the initial onboarding flow to identify where users drop off before seeing value",
          description: "Find the exact 'Aha!' moment and eliminate unnecessary onboarding steps.",
          trait: "userThinking",
          traitLevel: "High",
        },
        {
          id: "s8-b",
          label: "Conduct 1-on-1 feedback interviews with churned users to understand pain points",
          description: "Talk directly to users who left to discover qualitative reasons behind drop-offs.",
          trait: "userThinking",
          traitLevel: "Advanced",
        },
        {
          id: "s8-c",
          label: "Build automated day-3 re-engagement email notifications with value highlights",
          description: "Remind users of unfinished tasks and new product features via automated emails.",
          trait: "planning",
          traitLevel: "High",
        },
      ],
    },
  ];

  const currentScenario = scenarios[currentScenarioIndex];

  // Sync selection when step changes
  useEffect(() => {
    setSelectedOptionId(null);
  }, [currentScenarioIndex]);

  const handleSelectOption = (option: ScenarioOption) => {
    setSelectedOptionId(option.id);
  };

  const handleContinue = () => {
    if (!selectedOptionId) return;

    // Accumulate score
    const selectedOption = currentScenario.options.find((o) => o.id === selectedOptionId);
    if (selectedOption) {
      setScores((prev) => ({
        ...prev,
        [selectedOption.trait]: (prev[selectedOption.trait] || 0) + 1,
      }));
    }

    if (currentScenarioIndex < scenarios.length - 1) {
      setCurrentScenarioIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Calculate final scores based on choices made
      const finalScores = {
        ...scores,
        ...(selectedOption ? { [selectedOption.trait]: (scores[selectedOption.trait] || 0) + 1 } : {}),
      };

      const profile: BuilderProfileMetrics = {
        problemSolving: finalScores.problemSolving > 1 ? "Advanced" : "High",
        debugging: finalScores.debugging > 1 ? "Advanced" : "High",
        architecture: finalScores.architecture > 1 ? "Advanced" : "Intermediate",
        planning: finalScores.planning > 1 ? "Advanced" : "High",
        userThinking: finalScores.userThinking > 1 ? "Advanced" : "High",
      };

      // Immediately pass calculated profile to stage 5 GeneratingJourneyTransition screen
      onCompleteAssessment(profile);
    }
  };

  const handleBack = () => {
    if (currentScenarioIndex > 0) {
      setCurrentScenarioIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      onBackToProduct();
    }
  };

  const Icon = currentScenario.icon;

  return (
    <div className="w-full max-w-4xl mx-auto py-4 font-sans text-left space-y-8 select-none">
      
      {/* Top Header & Progress Bar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between font-mono text-xs text-zinc-500">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer bg-transparent border-none font-mono text-xs font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{currentScenarioIndex === 0 ? "Back to First Product" : `Scenario ${currentScenarioIndex}`}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 flex items-center gap-1.5">
              <Brain className="h-3.5 w-3.5 text-teal-700" />
              MISSION ZERO
            </span>
            <span className="font-semibold text-zinc-700">
              Scenario {currentScenario.id} of 8
            </span>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="h-2 w-full bg-zinc-200/80 rounded-full overflow-hidden border border-zinc-200 shadow-inner">
          <motion.div
            className="h-full bg-teal-700 rounded-full"
            initial={{ width: `${((currentScenarioIndex) / 8) * 100}%` }}
            animate={{ width: `${((currentScenarioIndex + 1) / 8) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Main Scenario Header */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScenarioIndex}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="bg-white border border-teal-200/80 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl shadow-zinc-200/40 relative overflow-hidden">
            
            {/* Scenario Category & Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
              <div className="space-y-1">
                <span className="font-mono text-xs font-bold text-teal-800 uppercase tracking-widest block">
                  SCENARIO {currentScenario.id} • {currentScenario.category}
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                  {currentScenario.title}
                </h1>
              </div>

              <div className="h-11 w-11 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shadow-sm shrink-0">
                <Icon className="h-5 w-5" />
              </div>
            </div>

            {/* Subtitle Reassurance */}
            <p className="text-xs text-zinc-600 font-sans leading-relaxed">
              Before we build your product, we want to understand how you think. There are no right or wrong scores — every answer helps us personalize your journey.
            </p>

            {/* Story-based Scenario Description */}
            <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl space-y-2">
              <span className="font-mono text-[10px] text-teal-800 font-bold uppercase tracking-wider block">
                PRODUCT PROBLEM SCENARIO
              </span>
              <p className="text-sm sm:text-base text-zinc-800 font-sans leading-relaxed font-medium">
                {currentScenario.story}
              </p>
            </div>

            {/* Interactive Options List */}
            <div className="space-y-3 pt-2">
              <span className="font-mono text-xs font-bold text-zinc-900 uppercase tracking-wider block">
                What should your product or engineering response be?
              </span>

              <div className="space-y-3">
                {currentScenario.options.map((option) => {
                  const isSelected = selectedOptionId === option.id;

                  return (
                    <motion.div
                      key={option.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleSelectOption(option)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-1.5 shadow-sm ${
                        isSelected
                          ? "bg-white border-teal-600 ring-2 ring-teal-600/30 shadow-md shadow-teal-700/10"
                          : "bg-white border-zinc-200/80 hover:border-teal-300 hover:bg-zinc-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-serif text-sm sm:text-base font-bold text-zinc-900">
                          {option.label}
                        </h3>

                        {isSelected ? (
                          <div className="h-5 w-5 rounded-full bg-teal-700 text-white flex items-center justify-center shadow-sm shrink-0">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="h-5 w-5 rounded-full border border-zinc-200 bg-zinc-50 shrink-0" />
                        )}
                      </div>

                      <p className="text-xs text-zinc-600 font-sans leading-relaxed">
                        {option.description}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Footer Navigation Bar */}
            <div className="pt-6 border-t border-zinc-100 flex items-center justify-between">
              <div className="text-xs font-mono text-zinc-500 flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-teal-700" />
                <span>Evaluates engineering reasoning &amp; product thinking.</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleBack}
                  className="px-5 py-2.5 rounded-full border border-zinc-200 bg-white text-zinc-700 hover:text-zinc-900 font-mono text-xs font-semibold cursor-pointer transition-all"
                >
                  Back
                </button>

                <button
                  onClick={handleContinue}
                  disabled={!selectedOptionId}
                  className="group inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs font-sans px-8 transition-all cursor-pointer shadow-lg shadow-teal-700/20 border-none disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>{currentScenarioIndex === 7 ? "Complete Mission Zero →" : "Next Scenario →"}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>

          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
