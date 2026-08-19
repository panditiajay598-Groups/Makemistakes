"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, Briefcase, ArrowRight, CheckCircle2 } from "lucide-react";

export default function AuthHub() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Header */}
      <div className="space-y-2 text-left">
        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50">
          Welcome to MakeMistakes
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
          Choose how you want to continue.
        </p>
      </div>

      {/* Two Persona Selection Cards */}
      <div className="space-y-4">
        
        {/* Card 1: Student / Builder */}
        <div className="group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 transition-all hover:border-amber-500/40 hover:bg-zinc-900/60 relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-semibold text-zinc-100 group-hover:text-amber-500 transition-colors">
                  Student / Builder
                </h3>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Engineering</span>
              </div>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Build real startup products. Receive AI coaching. Create a verified Proof-of-Work portfolio.
              </p>

              <div className="pt-3 flex items-center gap-3">
                <Link
                  href="/auth/student/signup"
                  className="flex h-8 items-center justify-center gap-1.5 rounded bg-zinc-100 px-3.5 text-xs font-semibold text-zinc-950 transition-all hover:bg-zinc-200 no-underline"
                >
                  <span>Continue as Student</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/auth/student/login"
                  className="text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors no-underline px-2 py-1"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Recruiter */}
        <div className="group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 transition-all hover:border-amber-500/40 hover:bg-zinc-900/60 relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300 group-hover:bg-amber-500/10 group-hover:text-amber-500 group-hover:border group-hover:border-amber-500/20 transition-all">
              <Briefcase className="h-5 w-5" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-semibold text-zinc-100 group-hover:text-amber-500 transition-colors">
                  Recruiter
                </h3>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Hiring</span>
              </div>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Discover builders through verified Proof-of-Work instead of resumes.
              </p>

              <div className="pt-3 flex items-center gap-3">
                <Link
                  href="/auth/recruiter/login"
                  className="flex h-8 items-center justify-center gap-1.5 rounded border border-zinc-800 bg-zinc-900 px-3.5 text-xs font-semibold text-zinc-200 transition-all hover:bg-zinc-800 hover:text-zinc-50 no-underline"
                >
                  <span>Continue as Recruiter</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/auth/recruiter/signup"
                  className="text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors no-underline px-2 py-1"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-zinc-850 flex items-center justify-between text-[11px] font-mono text-zinc-550">
        <span>No credit card required</span>
        <Link href="/" className="text-zinc-400 hover:text-zinc-200 no-underline transition-colors">
          Back to Homepage →
        </Link>
      </div>

    </div>
  );
}
