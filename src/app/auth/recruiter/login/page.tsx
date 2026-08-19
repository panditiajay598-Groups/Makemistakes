"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, CheckCircle2, Briefcase } from "lucide-react";
import AuthInput from "@/components/auth/AuthInput";

export default function RecruiterLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({ workEmail: "", password: "" });
  const [errors, setErrors] = useState<{ workEmail?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { workEmail?: string; password?: string } = {};

    if (!formData.workEmail) {
      newErrors.workEmail = "Work email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.workEmail)) {
      newErrors.workEmail = "Please enter a valid work email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      if (typeof window !== "undefined") {
        localStorage.removeItem("user_verified");
        localStorage.setItem("user_email", formData.workEmail);
        localStorage.setItem("user_role", "recruiter");
        localStorage.setItem("redirect_to", "/workspace");
      }
      setTimeout(() => {
        router.push(`/auth/verify?email=${encodeURIComponent(formData.workEmail)}&role=recruiter&redirectTo=/workspace`);
      }, 1200);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Header */}
      <div className="space-y-1.5 text-left">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded">
            Recruiter Portal
          </span>
          <Link href="/auth" className="text-xs font-mono text-zinc-500 hover:text-zinc-300 no-underline">
            Switch Role
          </Link>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50">
          Welcome Back
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
          Access verified builder portfolios.
        </p>
      </div>

      {submitted ? (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-3">
          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
          <h4 className="font-display font-semibold text-zinc-100 text-sm">Authenticated Successfully</h4>
          <p className="text-xs text-zinc-400 font-sans">Redirecting to recruiter portal...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <AuthInput
            label="Work Email"
            type="email"
            placeholder="alex@company.com"
            icon={Mail}
            value={formData.workEmail}
            onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
            error={errors.workEmail}
            required
          />

          <AuthInput
            label="Password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={errors.password}
            required
          />

          <div className="flex justify-end pt-1">
            <Link
              href="/auth/forgot-password"
              className="text-xs text-amber-500 hover:text-amber-400 no-underline font-medium"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="group flex h-10 w-full items-center justify-center gap-1.5 rounded bg-zinc-100 text-xs font-semibold text-zinc-950 transition-all hover:bg-zinc-200 active:scale-[0.99] cursor-pointer border-none mt-2 disabled:opacity-50"
          >
            <span>{loading ? "Authenticating..." : "Sign In"}</span>
            {!loading && <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />}
          </button>

        </form>
      )}

      {/* Switcher Footer */}
      <div className="pt-4 border-t border-zinc-850 text-center text-xs text-zinc-400 font-sans">
        Looking to hire better builders?{" "}
        <Link href="/auth/recruiter/signup" className="text-amber-500 hover:text-amber-400 font-semibold no-underline">
          Join as a Recruiter
        </Link>
      </div>

    </div>
  );
}
