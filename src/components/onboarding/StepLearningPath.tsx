"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  Check,
  HelpCircle,
  Bot,
  Globe,
  Smartphone,
  BarChart3,
  ShieldCheck,
  Cloud,
  Sparkles,
  Star,
  Flame,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StepLearningPathProps } from "./types";

export default function StepLearningPath({
  selectedPath = "🤖 AI Engineering",
  onNext,
}: StepLearningPathProps) {
  const [path, setPath] = useState(selectedPath);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);

  const learningPaths = [
    {
      id: "🤖 AI Engineering",
      title: "AI Engineering",
      iconEmoji: "🤖",
      icon: Bot,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      desc: "Build intelligent applications, AI agents, LLM integrations & neural workflows.",
      recommended: true,
      badgeText: "RECOMMENDED",
    },
    {
      id: "🌐 Web Development",
      title: "Web Development",
      iconEmoji: "🌐",
      icon: Globe,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
      desc: "Create full-stack web products with Next.js, React, APIs, and real databases.",
      popular: true,
      badgeText: "POPULAR",
    },
    {
      id: "📱 Mobile Development",
      title: "Mobile Development",
      iconEmoji: "📱",
      icon: Smartphone,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      desc: "Build native iOS & Android applications with fluid user interfaces.",
    },
    {
      id: "📊 Data Science",
      title: "Data Science",
      iconEmoji: "📊",
      icon: BarChart3,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
      desc: "Analyze datasets, build predictive models, and surface actionable insights.",
    },
    {
      id: "🔒 Cybersecurity",
      title: "Cybersecurity",
      iconEmoji: "🔒",
      icon: ShieldCheck,
      color: "text-rose-400 bg-rose-500/10 border-rose-500/30",
      desc: "Protect applications, audit security vulnerability vectors, and harden infrastructure.",
    },
    {
      id: "☁️ Cloud & DevOps",
      title: "Cloud & DevOps",
      iconEmoji: "☁️",
      icon: Cloud,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
      desc: "Deploy, scale, and automate cloud infrastructure with modern CI/CD pipelines.",
    },
  ];

  const quizQuestions = [
    {
      question: "What excites you most about software development?",
      options: [
        { label: "Building smart AI agents & chatbots", path: "🤖 AI Engineering" },
        { label: "Creating interactive web apps people use daily", path: "🌐 Web Development" },
        { label: "Building apps that run natively on phones", path: "📱 Mobile Development" },
        { label: "Uncovering trends & patterns in data", path: "📊 Data Science" },
        { label: "Securing networks & finding vulnerabilities", path: "🔒 Cybersecurity" },
        { label: "Managing cloud servers & automated pipelines", path: "☁️ Cloud & DevOps" },
      ],
    },
  ];

  const handleSelectPath = (pathId: string) => {
    if (pathId === "not-sure") {
      setShowQuiz(true);
    } else {
      setShowQuiz(false);
      setPath(pathId);
    }
  };

  const handleQuizChoice = (chosenPath: string) => {
    setQuizAnswer(chosenPath);
    setPath(chosenPath);
    setTimeout(() => {
      setShowQuiz(false);
    }, 350);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(path);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 max-w-4xl mx-auto py-2"
    >
      {/* Header */}
      <div className="space-y-3 text-center max-w-xl mx-auto">
        <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-50">
          Choose Your Learning Path
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
          Select your primary engineering discipline to personalize your mission curriculum.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {showQuiz ? (
          /* Path Discovery Quiz View */
          <motion.div
            key="quiz"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-amber-500/30 bg-zinc-900/80 p-6 sm:p-8 backdrop-blur-xl max-w-2xl mx-auto space-y-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Path Discovery Quiz
                </span>
              </div>
              <button
                onClick={() => setShowQuiz(false)}
                className="text-xs font-mono text-zinc-400 hover:text-zinc-200 bg-transparent border-none cursor-pointer"
              >
                Back to Path List
              </button>
            </div>

            <h3 className="font-display text-lg font-bold text-zinc-100">
              {quizQuestions[0].question}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quizQuestions[0].options.map((opt, idx) => {
                const isSelected = quizAnswer === opt.path;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuizChoice(opt.path)}
                    className={`p-4 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "border-amber-500 bg-amber-500/20 text-amber-300 shadow-md shadow-amber-500/10"
                        : "border-zinc-800 bg-zinc-950/80 text-zinc-200 hover:border-zinc-700 hover:bg-zinc-900"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="h-4 w-4 text-amber-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          /* Interactive Path Selection Tiles Grid */
          <motion.form
            key="tiles"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {learningPaths.map((item) => {
                const isSelected = path === item.id;
                const IconComponent = item.icon;

                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -3, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectPath(item.id)}
                    className={`group relative rounded-2xl border p-5 cursor-pointer transition-all flex flex-col justify-between overflow-hidden ${
                      isSelected
                        ? "border-amber-500 bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-zinc-950 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/40"
                        : "border-zinc-850 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/80"
                    }`}
                  >
                    {/* Top Row: Icon & Selection Badge / Recommended Badge */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div
                          className={`h-11 w-11 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105 ${item.color}`}
                        >
                          <IconComponent className="h-5 w-5" />
                        </div>

                        <div className="flex items-center gap-2">
                          {item.recommended && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                              <Star className="h-3 w-3 fill-amber-400" />
                              {item.badgeText}
                            </span>
                          )}
                          {item.popular && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-blue-400 bg-blue-500/20 px-2.5 py-0.5 rounded-full border border-blue-500/30">
                              <Flame className="h-3 w-3 fill-blue-400" />
                              {item.badgeText}
                            </span>
                          )}

                          <div
                            className={`h-5 w-5 rounded-full flex items-center justify-center border transition-all ${
                              isSelected
                                ? "border-amber-500 bg-amber-500 text-zinc-950 shadow-sm"
                                : "border-zinc-700 bg-zinc-900 group-hover:border-zinc-500"
                            }`}
                          >
                            {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1 pt-1">
                        <h3
                          className={`text-base font-bold font-display transition-colors ${
                            isSelected ? "text-amber-400" : "text-zinc-100 group-hover:text-amber-300"
                          }`}
                        >
                          {item.title}
                        </h3>
                        <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Interactive "I'm Not Sure" Tile */}
              <motion.div
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectPath("not-sure")}
                className="group rounded-2xl border border-dashed border-zinc-700/80 bg-zinc-900/20 p-5 cursor-pointer transition-all hover:border-amber-500/50 hover:bg-zinc-900/60 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-11 w-11 rounded-xl border border-zinc-800 bg-zinc-900 flex items-center justify-center text-amber-400">
                      <HelpCircle className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-mono text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      QUIZ
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold font-display text-amber-400">
                      I'm Not Sure
                    </h3>
                    <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                      Take our 30-second path discovery quiz to find your recommended discipline.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Bottom Submit Action */}
            <div className="flex flex-col items-center gap-3 pt-2">
              <button
                type="submit"
                className="group relative inline-flex h-12 items-center justify-center gap-3 rounded-xl bg-amber-500 px-9 text-sm font-bold text-zinc-950 transition-all hover:bg-amber-400 active:scale-98 cursor-pointer shadow-lg shadow-amber-500/20 border-none"
              >
                <span>Continue Path</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <span className="font-mono text-xs text-zinc-500">
                Selected path: <strong className="text-amber-400">{path}</strong>
              </span>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
