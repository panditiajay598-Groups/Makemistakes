"use client";

import React from "react";
import { CheckCircle2, FileText, Code2, Bot, Trophy } from "lucide-react";

interface ProgressTrackerProps {
  currentStep: "BRIEF" | "WORKSPACE" | "SUBMITTING" | "REVIEW" | "COMPLETED";
  onStepClick?: (step: "BRIEF" | "WORKSPACE" | "REVIEW" | "COMPLETED") => void;
}

export default function ProgressTracker({ currentStep, onStepClick }: ProgressTrackerProps) {
  const steps = [
    { id: "BRIEF", label: "1. Brief", icon: FileText },
    { id: "WORKSPACE", label: "2. Work", icon: Code2 },
    { id: "REVIEW", label: "3. Nova Review", icon: Bot },
    { id: "COMPLETED", label: "4. Complete", icon: Trophy },
  ];

  const getStepStatus = (stepId: string) => {
    const order = ["BRIEF", "WORKSPACE", "SUBMITTING", "REVIEW", "COMPLETED"];
    const currentIndex = order.indexOf(currentStep);
    const stepIndex = order.indexOf(stepId === "REVIEW" && currentStep === "SUBMITTING" ? "SUBMITTING" : stepId);

    if (currentStep === stepId) return "current";
    if (currentIndex > stepIndex) return "completed";
    return "upcoming";
  };

  return (
    <div className="flex items-center gap-1.5 sm:gap-3 font-mono text-xs">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const status = getStepStatus(step.id);
        const isClickable = onStepClick && (status === "completed" || status === "current");

        return (
          <React.Fragment key={step.id}>
            <button
              onClick={() => isClickable && onStepClick(step.id as any)}
              disabled={!isClickable}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all ${
                status === "completed"
                  ? "bg-teal-50 border-teal-200 text-teal-800 font-semibold cursor-pointer"
                  : status === "current"
                  ? "bg-teal-700 border-teal-700 text-white font-bold shadow-sm"
                  : "bg-zinc-100/60 border-zinc-200 text-zinc-400 cursor-not-allowed"
              }`}
            >
              {status === "completed" ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-700" />
              ) : (
                <Icon className={`h-3.5 w-3.5 ${status === "current" ? "text-white" : "text-zinc-400"}`} />
              )}
              <span className="hidden md:inline">{step.label}</span>
            </button>

            {idx < steps.length - 1 && (
              <div
                className={`h-0.5 w-3 sm:w-6 rounded-full ${
                  getStepStatus(steps[idx + 1].id) !== "upcoming" ? "bg-teal-700" : "bg-zinc-200"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
