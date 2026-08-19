"use client";

import React from "react";
import { CheckCircle2, Lock, Sparkles, Clock, ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";
import { SprintTask } from "./types";

interface SprintTasksSectionProps {
  tasks?: SprintTask[];
  onOpenTask: (taskId: string) => void;
}

export default function SprintTasksSection({
  tasks = [
    {
      id: "task-1",
      number: 1,
      title: "Understand Requirements",
      description: "Analyze customer problem brief and define technical constraints.",
      status: "completed",
      estimatedTime: "15 min",
      difficulty: "Easy",
    },
    {
      id: "task-2",
      number: 2,
      title: "Design User Flow & System Architecture",
      description: "Map out system diagrams, component boundaries, and HTTP API specs.",
      status: "in-progress",
      estimatedTime: "45 min",
      difficulty: "Intermediate",
    },
    {
      id: "task-3",
      number: 3,
      title: "Database Schema & Indexing",
      description: "Define PostgreSQL tables, foreign keys, and Redis caching models.",
      status: "locked",
      estimatedTime: "30 min",
      difficulty: "Intermediate",
      dependencies: ["Task 2"],
    },
    {
      id: "task-4",
      number: 4,
      title: "Architecture Review & Submission",
      description: "Submit system architecture brief for Senior Engineering Review.",
      status: "locked",
      estimatedTime: "20 min",
      difficulty: "Advanced",
      dependencies: ["Task 3"],
    },
  ],
  onOpenTask,
}: SprintTasksSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-4xl mx-auto py-4 font-sans text-left"
    >
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-zinc-100">Sprint Tasks</h2>
          <p className="text-xs text-zinc-400 font-sans">
            Complete tasks sequentially to progress through Sprint 2.
          </p>
        </div>
        <span className="font-mono text-xs text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 font-bold">
          4 Sprint Tasks
        </span>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => {
          const isDone = task.status === "completed";
          const isInProgress = task.status === "in-progress";

          return (
            <div
              key={task.id}
              onClick={() => task.status !== "locked" && onOpenTask(task.id)}
              className={`p-5 rounded-2xl border transition-all ${
                isDone
                  ? "bg-zinc-950/80 border-emerald-500/30 text-zinc-200"
                  : isInProgress
                  ? "bg-zinc-900 border-amber-500/50 text-zinc-100 ring-1 ring-amber-500/30 shadow-xl cursor-pointer"
                  : "bg-zinc-950/40 border-zinc-800/60 text-zinc-600 opacity-75"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                      isDone
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : isInProgress
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm"
                        : "bg-zinc-900 text-zinc-600 border border-zinc-800"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : isInProgress ? (
                      <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                    ) : (
                      <Lock className="h-4 w-4 text-zinc-600" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-amber-400 font-bold">
                        Task {task.number}
                      </span>
                      <h3 className="font-display text-sm font-bold text-zinc-100">
                        {task.title}
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                      {task.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center font-mono text-xs">
                  <span className="text-zinc-500 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {task.estimatedTime}
                  </span>

                  {isInProgress && (
                    <button
                      onClick={() => onOpenTask(task.id)}
                      className="h-9 px-4 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs font-sans rounded-xl transition-all cursor-pointer border-none flex items-center gap-1.5"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
