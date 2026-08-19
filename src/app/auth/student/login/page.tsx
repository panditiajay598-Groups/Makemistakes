"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import AuthInput from "@/components/auth/AuthInput";
import SocialButtons from "@/components/auth/SocialButtons";

export default function StudentLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "", remember: false });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};

    if (!formData.email) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
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
        localStorage.setItem("user_email", formData.email);
        localStorage.setItem("user_role", "student");
        localStorage.setItem("redirect_to", "/workspace");
      }
      setTimeout(() => {
        router.push(`/auth/verify?email=${encodeURIComponent(formData.email)}&role=student&redirectTo=/workspace`);
      }, 1200);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Header */}
      <div className="space-y-1.5 text-left">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
            Student Portal
          </span>
          <Link href="/auth" className="text-xs font-mono text-zinc-500 hover:text-zinc-300 no-underline">
            Switch Role
          </Link>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50">
          Welcome Back
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
          Continue building your Proof-of-Work portfolio.
        </p>
      </div>

      {submitted ? (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-3">
          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
          <h4 className="font-display font-semibold text-zinc-100 text-sm">Authenticated Successfully</h4>
          <p className="text-xs text-zinc-400 font-sans">Redirecting to your student builder dashboard...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <AuthInput
            label="Email Address"
            type="email"
            placeholder="sarah@example.com"
            icon={Mail}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
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

          {/* Options Row */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-zinc-400 font-sans cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.remember}
                onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                className="rounded border-zinc-800 bg-zinc-900 text-amber-500 focus:ring-0 h-3.5 w-3.5"
              />
              <span>Remember Me</span>
            </label>

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

          {/* Google OAuth */}
          <SocialButtons label="Sign In with Google" />

        </form>
      )}

      {/* Switcher Footer */}
      <div className="pt-4 border-t border-zinc-850 text-center text-xs text-zinc-400 font-sans">
        Don't have an account?{" "}
        <Link href="/auth/student/signup" className="text-amber-500 hover:text-amber-400 font-semibold no-underline">
          Create Account
        </Link>
      </div>

    </div>
  );
}
