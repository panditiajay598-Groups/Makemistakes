"use client";

import React from "react";
import { Check, X, ShieldAlert, ShieldCheck } from "lucide-react";

interface PasswordStrengthProps {
  password?: string;
}

export default function PasswordStrength({ password = "" }: PasswordStrengthProps) {
  if (!password) return null;

  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  const getLabel = () => {
    switch (score) {
      case 0:
      case 1:
        return { text: "Weak", color: "text-rose-600", bg: "bg-rose-500" };
      case 2:
        return { text: "Fair", color: "text-amber-600", bg: "bg-amber-500" };
      case 3:
        return { text: "Strong", color: "text-teal-600", bg: "bg-teal-600" };
      case 4:
        return { text: "Excellent", color: "text-teal-700", bg: "bg-teal-700" };
      default:
        return { text: "Weak", color: "text-zinc-400", bg: "bg-zinc-200" };
    }
  };

  const strength = getLabel();

  return (
    <div className="space-y-2 pt-1.5 p-3 rounded-xl border border-zinc-200 bg-zinc-50/70 backdrop-blur-sm">
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-600 text-[11px] font-medium flex items-center gap-1">
          {score >= 3 ? (
            <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
          ) : (
            <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
          )}
          Password Strength
        </span>
        <span className={`text-[11px] font-mono font-bold ${strength.color}`}>
          {strength.text}
        </span>
      </div>

      {/* 4 Segment Bars */}
      <div className="flex items-center justify-between gap-1.5">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              score >= level ? strength.bg : "bg-zinc-200"
            }`}
          />
        ))}
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] font-sans pt-1">
        <div className={`flex items-center gap-1.5 ${checks.length ? "text-teal-700 font-semibold" : "text-zinc-400"}`}>
          {checks.length ? <Check className="h-3 w-3 stroke-[3]" /> : <X className="h-3 w-3" />}
          <span>8+ characters</span>
        </div>
        <div className={`flex items-center gap-1.5 ${checks.uppercase ? "text-teal-700 font-semibold" : "text-zinc-400"}`}>
          {checks.uppercase ? <Check className="h-3 w-3 stroke-[3]" /> : <X className="h-3 w-3" />}
          <span>Uppercase letter</span>
        </div>
        <div className={`flex items-center gap-1.5 ${checks.number ? "text-teal-700 font-semibold" : "text-zinc-400"}`}>
          {checks.number ? <Check className="h-3 w-3 stroke-[3]" /> : <X className="h-3 w-3" />}
          <span>Number</span>
        </div>
        <div className={`flex items-center gap-1.5 ${checks.special ? "text-teal-700 font-semibold" : "text-zinc-400"}`}>
          {checks.special ? <Check className="h-3 w-3 stroke-[3]" /> : <X className="h-3 w-3" />}
          <span>Special character</span>
        </div>
      </div>
    </div>
  );
}
