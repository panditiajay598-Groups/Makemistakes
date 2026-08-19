"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  Code2,
  Bot,
  Globe,
  Trophy,
  TrendingUp,
  Check,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Compass,
} from "lucide-react";

export interface DestinationOption {
  id: string;
  title: string;
  emoji: string;
  description: string;
  icon: React.ElementType;
  journey: string;
  projectsOrChallenges: string;
  difficulty: string;
  estimatedTime: string;
}

interface ChooseYourDestinationProps {
  onSelectDestination: (destination: DestinationOption) => void;
  onBackToIdentity: () => void;
}

export default function ChooseYourDestination({
  onSelectDestination,
  onBackToIdentity,
}: ChooseYourDestinationProps) {
  const [selectedDestinationId, setSelectedDestinationId] = useState<string | null>(null);

  const destinations: DestinationOption[] = [
    {
      id: "launch-career",
      title: "Launch My Career",
      emoji: "🚀",
      description:
        "Become interview-ready by building products, solving engineering challenges, and creating a portfolio employers value.",
      icon: Rocket,
      journey: "90–120 Missions",
      projectsOrChallenges: "12 Projects",
      difficulty: "Beginner → Advanced",
      estimatedTime: "4–6 Months",
    },
    {
      id: "product-engineer",
      title: "Become a Product Engineer",
      emoji: "💻",
      description:
        "Learn to design, build, improve, and maintain products used by real users instead of tutorial projects.",
      icon: Code2,
      journey: "100 Missions",
      projectsOrChallenges: "15 Projects",
      difficulty: "Intermediate → Advanced",
      estimatedTime: "5 Months",
    },
    {
      id: "ai-products",
      title: "Build AI Products",
      emoji: "🤖",
      description:
        "Build modern AI applications using APIs, automation, agents, and intelligent workflows.",
      icon: Bot,
      journey: "95 Missions",
      projectsOrChallenges: "10 AI Projects",
      difficulty: "Intermediate",
      estimatedTime: "4 Months",
    },
    {
      id: "build-startup",
      title: "Build My Own Startup",
      emoji: "🌍",
      description:
        "Turn ideas into products by learning MVP development, user validation, and continuous improvement.",
      icon: Globe,
      journey: "110 Missions",
      projectsOrChallenges: "14 Projects",
      difficulty: "Advanced",
      estimatedTime: "6 Months",
    },
    {
      id: "master-interviews",
      title: "Master Coding Interviews",
      emoji: "🏆",
      description:
        "Strengthen problem-solving, debugging, and technical interview skills with practical challenges.",
      icon: Trophy,
      journey: "80 Missions",
      projectsOrChallenges: "300+ Challenges",
      difficulty: "All Levels",
      estimatedTime: "3 Months",
    },
    {
      id: "professional-growth",
      title: "Professional Growth",
      emoji: "📈",
      description:
        "Continue growing through advanced engineering practices, scalable systems, and real-world product development.",
      icon: TrendingUp,
      journey: "Advanced Mastery",
      projectsOrChallenges: "Continuous Projects",
      difficulty: "Advanced → Senior",
      estimatedTime: "Self-Paced",
    },
  ];

  const selectedDestination = destinations.find((d) => d.id === selectedDestinationId);

  const handleContinue = () => {
    if (selectedDestination) {
      onSelectDestination(selectedDestination);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4 font-sans text-left space-y-8 select-none">
      
      {/* Top Header & Navigation */}
      <div className="space-y-4">
        <div className="flex items-center justify-between font-mono text-xs text-zinc-500">
          <button
            onClick={onBackToIdentity}
            className="flex items-center gap-1.5 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer bg-transparent border-none font-mono text-xs font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Developer Identity</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-teal-700" />
              DESTINATION SELECTION
            </span>
            <span className="font-semibold text-zinc-700">Step 3 of 3</span>
          </div>
        </div>

        {/* Header Title & Subtitle */}
        <div className="space-y-3 max-w-3xl">
          <span className="font-mono text-xs font-bold text-teal-800 uppercase tracking-widest block">
            PERSONALIZED LEARNING ROADMAP
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-zinc-900 tracking-tight leading-tight">
            Who Do You Want To Become?
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 font-sans leading-relaxed">
            Choose your primary destination. MakeMistakes will personalize every mission, sprint, project challenge, and AI mentor guidance based on the path you select today.
          </p>
        </div>
      </div>

      {/* 6 Premium Destination Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
        {destinations.map((card) => {
          const Icon = card.icon;
          const isSelected = selectedDestinationId === card.id;

          return (
            <motion.div
              key={card.id}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedDestinationId(card.id)}
              className={`relative p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-5 shadow-sm ${
                isSelected
                  ? "bg-white border-teal-600 ring-2 ring-teal-600/30 shadow-xl shadow-teal-700/10"
                  : "bg-white border-zinc-200/80 hover:border-teal-300 hover:shadow-md"
              }`}
            >
              {/* Top Row: Emoji Icon + Selected Check Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center text-xl transition-colors ${
                      isSelected
                        ? "bg-teal-700 text-white shadow-md shadow-teal-700/20"
                        : "bg-teal-50 text-teal-700 border border-teal-200"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-2xl">{card.emoji}</span>
                </div>

                {isSelected ? (
                  <div className="h-6 w-6 rounded-full bg-teal-700 text-white flex items-center justify-center shadow-md">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <div className="h-6 w-6 rounded-full border border-zinc-200 bg-zinc-50" />
                )}
              </div>

              {/* Card Title & Description */}
              <div className="space-y-2">
                <h3 className="font-serif text-lg font-bold text-zinc-900 leading-snug">
                  {card.title}
                </h3>
                <p className="text-xs text-zinc-600 font-sans leading-relaxed min-h-[48px]">
                  {card.description}
                </p>
              </div>

              {/* Metadata Badges Footer */}
              <div className="pt-3 border-t border-zinc-100 grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="bg-zinc-50 p-2 rounded-xl border border-zinc-200/80">
                  <span className="text-[9px] text-zinc-400 block uppercase">Journey</span>
                  <span className="font-bold text-zinc-800 truncate block">{card.journey}</span>
                </div>

                <div className="bg-zinc-50 p-2 rounded-xl border border-zinc-200/80">
                  <span className="text-[9px] text-zinc-400 block uppercase">Scope</span>
                  <span className="font-bold text-teal-800 truncate block">{card.projectsOrChallenges}</span>
                </div>

                <div className="bg-zinc-50 p-2 rounded-xl border border-zinc-200/80">
                  <span className="text-[9px] text-zinc-400 block uppercase">Level</span>
                  <span className="font-semibold text-zinc-700 truncate block">{card.difficulty}</span>
                </div>

                <div className="bg-zinc-50 p-2 rounded-xl border border-zinc-200/80">
                  <span className="text-[9px] text-zinc-400 block uppercase">Est. Time</span>
                  <span className="font-semibold text-zinc-700 truncate block">{card.estimatedTime}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Reassurance & CTA Section */}
      <div className="pt-6 border-t border-zinc-200/80 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3 text-xs font-sans text-zinc-600 bg-white border border-zinc-200 px-4 py-3 rounded-2xl shadow-sm max-w-lg">
          <RefreshCw className="h-4 w-4 text-teal-700 shrink-0" />
          <p className="leading-tight">
            Don&apos;t worry. Your destination isn&apos;t permanent. You can change your learning path at any time from your settings.
          </p>
        </div>

        <button
          onClick={handleContinue}
          disabled={!selectedDestinationId}
          className="group inline-flex h-13 w-full sm:w-auto items-center justify-center gap-3 rounded-full bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm font-sans px-9 transition-all cursor-pointer shadow-lg shadow-teal-700/20 border-none disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Continue to BuildOS Dashboard</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

    </div>
  );
}
