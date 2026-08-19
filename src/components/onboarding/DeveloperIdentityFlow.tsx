"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  Globe,
  ShieldCheck,
  Cpu,
  Terminal,
  Sparkles,
  Zap,
  Brain,
  Layers,
  Database,
  Bot,
  CreditCard,
  Activity,
  Play,
  FileText,
  FlaskConical,
  BookOpen,
  Layout,
  MessageSquare,
  Gauge,
  Flame,
  Code2,
  Target,
  RefreshCw,
  Users,
  TrendingUp,
  CheckCircle2,
  Award,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";

export interface DeveloperIdentityResponses {
  futureVision: string;
  engineeringPersonality: string;
  weekendBuild: string;
  debuggingMindset: string;
  learningStyle: string;
  successDefinition: string;
}

interface DeveloperIdentityFlowProps {
  onComplete: (identity: DeveloperIdentityResponses) => void;
  onBackToWelcome: () => void;
}

interface OptionCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

interface StepConfig {
  stepNumber: number;
  question: string;
  subtitle: string;
  options: OptionCard[];
}

export default function DeveloperIdentityFlow({
  onComplete,
  onBackToWelcome,
}: DeveloperIdentityFlowProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Partial<DeveloperIdentityResponses>>({});
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // 6 Full-Screen Steps Config
  const steps: StepConfig[] = [
    // STEP 1: Future Vision
    {
      stepNumber: 1,
      question: "If everything goes exactly as planned, where do you see yourself in 5 years?",
      subtitle: "Your long-term ambition defines the depth and trajectory of the products you will build.",
      options: [
        {
          id: "founding-engineer",
          title: "Founding Engineer at High-Growth Startup",
          description: "Building core product architecture from 0 to 1 with a nimble, elite engineering team.",
          icon: Rocket,
        },
        {
          id: "solo-founder",
          title: "Solo Founder Shipping Micro-SaaS",
          description: "Building, launching, and monetizing independent products with total creative freedom.",
          icon: Globe,
        },
        {
          id: "tech-lead",
          title: "Tech Lead at a Tier-1 Tech Company",
          description: "Architecting mission-critical distributed systems and guiding top engineering talent.",
          icon: ShieldCheck,
        },
        {
          id: "ai-architect",
          title: "AI Systems & Intelligence Architect",
          description: "Building cutting-edge autonomous AI agents, LLM infrastructure, and smart workflows.",
          icon: Cpu,
        },
        {
          id: "open-source",
          title: "Open Source Core Contributor",
          description: "Creating developer tools, frameworks, and foundational libraries used by millions globally.",
          icon: Terminal,
        },
        {
          id: "product-engineer",
          title: "Product Engineer & Experience Designer",
          description: "Crafting ultra-delightful, user-centric software that solves meaningful human problems.",
          icon: Sparkles,
        },
      ],
    },

    // STEP 2: Engineering Personality
    {
      stepNumber: 2,
      question: "What excites you most about software engineering?",
      subtitle: "Understanding what fuels your curiosity helps us tailor your engineering challenges.",
      options: [
        {
          id: "napkin-ideas",
          title: "Turning Napkin Ideas into Live Products",
          description: "The adrenaline of going from a blank code editor to real active users in production.",
          icon: Zap,
        },
        {
          id: "algorithmic-puzzles",
          title: "Solving Complex Algorithmic Puzzles",
          description: "Optimizing performance, tackling hard logic, and making execution blazingly fast.",
          icon: Brain,
        },
        {
          id: "beautiful-interfaces",
          title: "Designing Beautiful Intuitive Interfaces",
          description: "Crafting sleek UI, micro-animations, and fluid design systems that users love.",
          icon: Layers,
        },
        {
          id: "scalable-backend",
          title: "Architecting Scalable Backend Systems",
          description: "Designing bulletproof database schemas, API contracts, and resilient async queues.",
          icon: Database,
        },
        {
          id: "automated-workflows",
          title: "Automating Tedious Manual Workflows",
          description: "Writing scripts and pipelines that eliminate repetitive human effort forever.",
          icon: Bot,
        },
        {
          id: "bleeding-edge-ai",
          title: "Exploring Bleeding-Edge AI & ML Models",
          description: "Integrating neural nets, vector embeddings, and generative AI into real applications.",
          icon: Sparkles,
        },
      ],
    },

    // STEP 3: Weekend Build Challenge
    {
      stepNumber: 3,
      question: "If you had one weekend to build anything, what would you create?",
      subtitle: "Unconstrained build choices reveal your core creative instincts and product drive.",
      options: [
        {
          id: "ai-assistant",
          title: "AI Productivity & Focus Assistant",
          description: "An intelligent agent that organizes tasks, summarizes code, and manages focus time.",
          icon: Bot,
        },
        {
          id: "dev-cli-tool",
          title: "Open-Source Developer Tool or CLI",
          description: "A fast, developer-first command line utility or framework plugin for developers.",
          icon: Terminal,
        },
        {
          id: "realtime-collab",
          title: "Real-Time Collaborative Web App",
          description: "A multi-user canvas or document editor with WebSocket state synchronization.",
          icon: Users,
        },
        {
          id: "micro-saas",
          title: "Sleek Micro-SaaS Product with Paid Users",
          description: "A focused web product with Stripe payments, user authentication, and analytics.",
          icon: CreditCard,
        },
        {
          id: "data-engine",
          title: "High-Frequency Data Engine or Scraper",
          description: "A real-time telemetry stream, market monitor, or automated data aggregator.",
          icon: Activity,
        },
        {
          id: "web-experience",
          title: "Interactive Experimental Web Experience",
          description: "A rich, canvas-driven visual application that wows visitors at first glance.",
          icon: Play,
        },
      ],
    },

    // STEP 4: Debugging Mindset
    {
      stepNumber: 4,
      question: "When you face a difficult bug, what's your first reaction?",
      subtitle: "How you respond to technical friction determines how fast you mature as a senior engineer.",
      options: [
        {
          id: "deep-logs",
          title: "Dive Deep into Logs & Traces Line-by-Line",
          description: "Inspect raw stack traces, add explicit loggers, and isolate execution paths methodically.",
          icon: FileText,
        },
        {
          id: "form-hypotheses",
          title: "Form Hypotheses & Run Isolated Tests",
          description: "Write minimal reproduction test cases to validate technical assumptions step-by-step.",
          icon: FlaskConical,
        },
        {
          id: "docs-and-ai",
          title: "Consult Documentation & AI Reasoning",
          description: "Read authoritative API specs and prompt AI models to analyze root cause edge cases.",
          icon: BookOpen,
        },
        {
          id: "rearchitect",
          title: "Step Back & Re-Architect Conceptually",
          description: "Question the overall system design and rethink the control flow from first principles.",
          icon: Layout,
        },
        {
          id: "rubber-duck",
          title: "Talk Through the Problem Out Loud",
          description: "Rubber-duck debug or discuss subtle edge cases with senior engineering mentors.",
          icon: MessageSquare,
        },
        {
          id: "profiler-tools",
          title: "Profile CPU, Memory & Network Traffic",
          description: "Use DevTools and memory profilers to catch bottlenecks, leaks, and race conditions.",
          icon: Gauge,
        },
      ],
    },

    // STEP 5: Product Thinking & Learning Style
    {
      stepNumber: 5,
      question: "Which statement describes how you learn best?",
      subtitle: "Your learning mechanism shapes how MakeMistakes guides your hands-on engineering journey.",
      options: [
        {
          id: "making-mistakes",
          title: "Building Real Products & Making Mistakes",
          description: "Hands-on trial-and-error by shipping software to real production environments.",
          icon: Flame,
        },
        {
          id: "dissecting-code",
          title: "Dissecting Open-Source Production Codebases",
          description: "Studying how top senior engineers architect real-world production repositories.",
          icon: Code2,
        },
        {
          id: "interactive-challenges",
          title: "Interactive Sprints with Immediate Feedback",
          description: "Solving targeted sprint tasks with automated validation and mentor reviews.",
          icon: Target,
        },
        {
          id: "deep-rfc-docs",
          title: "Reading Deep Documentation & Architecture RFCs",
          description: "Understanding internal mechanics and design trade-offs before writing code.",
          icon: BookOpen,
        },
        {
          id: "mentor-code-reviews",
          title: "Socratic Code Reviews with Senior Mentors",
          description: "Receiving direct, constructive feedback on PRs from experienced staff engineers.",
          icon: Users,
        },
        {
          id: "rapid-iterations",
          title: "Rapid Prototyping & Iterative Refinement",
          description: "Shipping fast MVPs and continuously refining based on real user feedback.",
          icon: RefreshCw,
        },
      ],
    },

    // STEP 6: Success Definition (Personalized!)
    {
      stepNumber: 6,
      question: "When will you feel successful as a developer?",
      subtitle: "Define the milestone that marks true engineering fulfillment for your career.",
      options: [
        {
          id: "daily-active-users",
          title: "When Real Users Use Something I Built Every Day",
          description: "Creating genuine impact by solving real problems for active daily users.",
          icon: Users,
        },
        {
          id: "profitable-product",
          title: "When I Launch My Own Profitable Software Product",
          description: "Achieving financial independence and creative autonomy through my own SaaS.",
          icon: TrendingUp,
        },
        {
          id: "autonomous-solver",
          title: "When I Can Solve Any Complex System Problem Autonomously",
          description: "Reaching deep engineering confidence where no codebase or stack intimidates me.",
          icon: CheckCircle2,
        },
        {
          id: "team-lead-mentor",
          title: "When I Lead an Engineering Team & Mentor Others",
          description: "Guiding product vision, growing junior engineers, and setting technical standards.",
          icon: Award,
        },
        {
          id: "global-scale",
          title: "When My Code Impacts Millions of Users Globally",
          description: "Building high-availability infrastructure that scales to massive global traffic.",
          icon: Globe,
        },
        {
          id: "total-craftsmanship",
          title: "When I Reach Total Technical Freedom & Craftsmanship",
          description: "Mastering full-stack software development to build any software idea effortlessly.",
          icon: Sparkles,
        },
      ],
    },
  ];

  const currentStep = steps[currentStepIndex];

  // Helper to get personalized subtitle for Step 6 based on previous answers
  const getPersonalizedStep6Subtitle = () => {
    const vision = answers.futureVision;
    const personality = answers.engineeringPersonality;

    if (vision?.includes("Solo Founder") || vision?.includes("Micro-SaaS")) {
      return "Personalized for your Founder mindset: Define what true product success looks like for your journey.";
    }
    if (vision?.includes("AI Systems") || personality?.includes("Bleeding-Edge AI")) {
      return "Personalized for your AI Engineer profile: Map out your benchmark for technical mastery.";
    }
    if (vision?.includes("Founding Engineer")) {
      return "Personalized for your Founding Engineer track: Choose the impact milestone that drives you.";
    }
    return "Personalized based on your responses: Define the milestone that marks true engineering fulfillment.";
  };

  // Keyboard accessibility: Press 1-6 to select cards, Enter/Space/Right to continue, Left for back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in text inputs
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;

      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= currentStep.options.length) {
        const option = currentStep.options[num - 1];
        setSelectedOptionId(option.id);
      } else if (e.key === "Enter" || e.key === "ArrowRight") {
        if (selectedOptionId) {
          handleContinue();
        }
      } else if (e.key === "ArrowLeft") {
        handleBack();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStepIndex, selectedOptionId, answers]);

  // Keep selectedOptionId synced when navigating steps
  useEffect(() => {
    const stepKeys: (keyof DeveloperIdentityResponses)[] = [
      "futureVision",
      "engineeringPersonality",
      "weekendBuild",
      "debuggingMindset",
      "learningStyle",
      "successDefinition",
    ];
    const key = stepKeys[currentStepIndex];
    if (key && answers[key]) {
      const match = currentStep.options.find((o) => o.title === answers[key]);
      if (match) {
        setSelectedOptionId(match.id);
      } else {
        setSelectedOptionId(null);
      }
    } else {
      setSelectedOptionId(null);
    }
  }, [currentStepIndex]);

  const handleSelectOption = (option: OptionCard) => {
    setSelectedOptionId(option.id);
  };

  const handleContinue = () => {
    if (!selectedOptionId) return;

    const selectedOption = currentStep.options.find((o) => o.id === selectedOptionId);
    if (!selectedOption) return;

    const stepKeys: (keyof DeveloperIdentityResponses)[] = [
      "futureVision",
      "engineeringPersonality",
      "weekendBuild",
      "debuggingMindset",
      "learningStyle",
      "successDefinition",
    ];

    const currentKey = stepKeys[currentStepIndex];
    const updatedAnswers = {
      ...answers,
      [currentKey]: selectedOption.title,
    };
    setAnswers(updatedAnswers);

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Step 6 complete! Submit developer identity
      onComplete(updatedAnswers as DeveloperIdentityResponses);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      onBackToWelcome();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4 font-sans text-left space-y-8 select-none">
      
      {/* Top Header & Progress Bar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between font-mono text-xs text-zinc-500">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer bg-transparent border-none font-mono text-xs font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{currentStepIndex === 0 ? "Welcome Screen" : `Step ${currentStepIndex}`}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              DEVELOPER IDENTITY DISCOVERY
            </span>
            <span className="font-semibold text-zinc-700">
              Step {currentStep.stepNumber} of 6
            </span>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="h-2 w-full bg-zinc-200/80 rounded-full overflow-hidden border border-zinc-200 shadow-inner">
          <motion.div
            className="h-full bg-teal-700 rounded-full"
            initial={{ width: `${((currentStepIndex) / 6) * 100}%` }}
            animate={{ width: `${((currentStepIndex + 1) / 6) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Main Question Header */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStepIndex}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="space-y-2 max-w-3xl">
            <span className="font-mono text-xs font-bold text-teal-800 uppercase tracking-widest block">
              DISCOVERY STEP {currentStep.stepNumber}
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-zinc-900 tracking-tight leading-tight">
              {currentStep.question}
            </h1>
            <p className="text-sm sm:text-base text-zinc-600 font-sans leading-relaxed">
              {currentStep.stepNumber === 6 ? getPersonalizedStep6Subtitle() : currentStep.subtitle}
            </p>
          </div>

          {/* 5 to 6 Large Visual Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {currentStep.options.map((option, idx) => {
              const Icon = option.icon;
              const isSelected = selectedOptionId === option.id;

              return (
                <motion.div
                  key={option.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectOption(option)}
                  className={`relative p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-sm ${
                    isSelected
                      ? "bg-white border-teal-600 ring-2 ring-teal-600/30 shadow-xl shadow-teal-700/10"
                      : "bg-white border-zinc-200/80 hover:border-teal-300 hover:shadow-md"
                  }`}
                >
                  {/* Top Bar: Icon + Keyboard Shortcut Badge */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`h-11 w-11 rounded-2xl flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-teal-700 text-white shadow-md shadow-teal-700/20"
                          : "bg-teal-50 text-teal-700 border border-teal-200"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] bg-zinc-100 border border-zinc-200 text-zinc-500 px-2 py-0.5 rounded-md font-semibold">
                        Press {idx + 1}
                      </span>
                      {isSelected && (
                        <div className="h-5 w-5 rounded-full bg-teal-700 text-white flex items-center justify-center">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="space-y-1.5 pt-2">
                    <h3 className="font-serif text-base font-bold text-zinc-900 leading-snug">
                      {option.title}
                    </h3>
                    <p className="text-xs text-zinc-600 font-sans leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom Controls Bar */}
          <div className="pt-6 border-t border-zinc-200/80 flex items-center justify-between">
            <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-zinc-500">
              <kbd className="bg-white border border-zinc-200 px-2 py-1 rounded text-[10px] text-zinc-600">1-6</kbd> Select Option
              <span className="mx-1">•</span>
              <kbd className="bg-white border border-zinc-200 px-2 py-1 rounded text-[10px] text-zinc-600">Enter ↵</kbd> Continue
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={handleBack}
                className="px-5 py-3 rounded-full border border-zinc-200 bg-white text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 font-mono text-xs font-semibold cursor-pointer transition-all"
              >
                Back
              </button>

              <button
                onClick={handleContinue}
                disabled={!selectedOptionId}
                className="group inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm font-sans px-8 transition-all cursor-pointer shadow-lg shadow-teal-700/20 border-none disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>{currentStepIndex === 5 ? "Complete & Discover Identity →" : "Continue →"}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
