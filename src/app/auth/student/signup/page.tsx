"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, ShieldCheck, ArrowRight, CheckCircle2, Sparkles, Rocket, Shield } from "lucide-react";
import confetti from "canvas-confetti";
import AuthInput from "@/components/auth/AuthInput";
import PasswordStrength from "@/components/auth/PasswordStrength";
import SocialButtons from "@/components/auth/SocialButtons";
import { resetOnboardingForNewUser } from "@/lib/onboardingStore";

export default function StudentSignup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreed: false,
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validateField = (name: string, value: string, currentData = formData) => {
    let error = "";
    if (name === "fullName") {
      if (!value.trim()) error = "Full name is required";
      else if (value.trim().length < 2) error = "Please enter at least 2 characters";
    }
    if (name === "email") {
      if (!value.trim()) error = "Email address is required";
      else if (!/\S+@\S+\.\S+/.test(value)) error = "Please enter a valid email address";
    }
    if (name === "password") {
      if (!value) error = "Password is required";
      else if (value.length < 8) error = "Password must be at least 8 characters";
    }
    if (name === "confirmPassword") {
      if (!value) error = "Please confirm your password";
      else if (value !== currentData.password) error = "Passwords do not match";
    }
    return error;
  };

  const handleChange = (field: string, value: string | boolean) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);

    if (touched[field]) {
      const err = typeof value === "string" ? validateField(field, value, updatedData) : "";
      setErrors((prev) => ({ ...prev, [field]: err }));

      if (field === "password" && touched.confirmPassword) {
        const confirmErr = validateField("confirmPassword", formData.confirmPassword, updatedData);
        setErrors((prev) => ({ ...prev, confirmPassword: confirmErr }));
      }
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const val = formData[field as keyof typeof formData];
    if (typeof val === "string") {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, val) }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {
      fullName: validateField("fullName", formData.fullName),
      email: validateField("email", formData.email),
      password: validateField("password", formData.password),
      confirmPassword: validateField("confirmPassword", formData.confirmPassword, formData),
    };

    if (!formData.agreed) {
      newErrors.agreed = "You must agree to the Terms of Service & Code of Honor";
    }

    setErrors(newErrors);
    setTouched({ fullName: true, email: true, password: true, confirmPassword: true, agreed: true });

    if (Object.values(newErrors).some((err) => err !== "")) {
      return;
    }

    setLoading(true);

    resetOnboardingForNewUser();

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);

      // Trigger Confetti Sequence
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#0F766E", "#0D9488", "#10B981", "#F59E0B"],
      });

      if (typeof window !== "undefined") {
        localStorage.removeItem("user_verified");
        localStorage.setItem("user_email", formData.email);
        localStorage.setItem("user_role", "student");
        localStorage.setItem("redirect_to", "/dashboard");
      }
    }, 1400);
  };

  const devHandle = formData.fullName.trim().toLowerCase().replace(/\s+/g, "_") || "dev_builder";

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 sm:p-8 shadow-xl shadow-zinc-200/50 space-y-6 w-full animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-2 text-left">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full font-semibold uppercase">
            MISSION ZERO ACCESS
          </span>
          <Link href="/auth" className="text-xs font-mono text-zinc-500 hover:text-zinc-800 no-underline transition-colors">
            Switch Role
          </Link>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl text-zinc-900 leading-tight">
          Create Your Developer Identity
        </h2>
        <p className="text-xs sm:text-sm text-zinc-600 font-sans leading-relaxed">
          Every great developer starts with one decision. Create your account to begin Mission Zero.
        </p>
      </div>

      {submitted ? (
        /* Developer Identity Card Celebration Modal */
        <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-6 text-center space-y-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-center">
            <div className="h-14 w-14 rounded-full bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-700 shadow-inner">
              <CheckCircle2 className="h-7 w-7 text-teal-700" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-mono font-bold uppercase border border-teal-200">
              <Shield className="h-3 w-3" /> Identity Verified
            </div>
            <h3 className="font-serif font-bold text-zinc-900 text-lg sm:text-xl">
              Developer Identity Initialized!
            </h3>
            <p className="text-xs text-zinc-600 font-sans">
              Welcome to MakeMistakes Academy, <span className="text-zinc-900 font-semibold">{formData.fullName}</span>.
            </p>
          </div>

          {/* Developer Badge */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4 text-left space-y-2.5 font-sans shadow-sm">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
              <div>
                <div className="text-xs font-bold text-zinc-900">{formData.fullName}</div>
                <div className="text-[11px] font-mono text-teal-700 font-semibold">@{devHandle}</div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                RANK: LVL 1 DEBUGGER
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-zinc-600">
              <div>
                <span className="text-zinc-400 block text-[9px] uppercase">Starting XP</span>
                <span className="text-amber-600 font-bold flex items-center gap-1">
                  500 XP <Sparkles className="h-3 w-3 fill-amber-500 text-amber-500" />
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[9px] uppercase">Active Mission</span>
                <span className="text-teal-700 font-bold">#001 Queue Debug</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              router.push(`/auth/verify?email=${encodeURIComponent(formData.email)}&role=student&redirectTo=/dashboard`);
            }}
            className="w-full h-11 rounded-full bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border-none shadow-md shadow-teal-700/20"
          >
            <Rocket className="h-4 w-4" />
            <span>Proceed to Email Verification</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        /* Sign Up Form */
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Full Name */}
          <AuthInput
            label="Full Name"
            type="text"
            placeholder="Sarah Jenkins"
            icon={User}
            value={formData.fullName}
            error={touched.fullName ? errors.fullName : undefined}
            isSuccess={touched.fullName && !errors.fullName && formData.fullName.length >= 2}
            onChange={(e) => handleChange("fullName", e.target.value)}
            onBlur={() => handleBlur("fullName")}
            required
            autoComplete="name"
          />

          {/* Email Address */}
          <AuthInput
            label="Email Address"
            type="email"
            placeholder="sarah@example.com"
            icon={Mail}
            value={formData.email}
            error={touched.email ? errors.email : undefined}
            isSuccess={touched.email && !errors.email && formData.email.includes("@")}
            onChange={(e) => handleChange("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            required
            autoComplete="email"
          />

          {/* Password */}
          <div className="space-y-2">
            <AuthInput
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={formData.password}
              error={touched.password ? errors.password : undefined}
              isSuccess={touched.password && !errors.password && formData.password.length >= 8}
              onChange={(e) => handleChange("password", e.target.value)}
              onBlur={() => handleBlur("password")}
              required
              autoComplete="new-password"
            />
            <PasswordStrength password={formData.password} />
          </div>

          {/* Confirm Password */}
          <AuthInput
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            icon={ShieldCheck}
            value={formData.confirmPassword}
            error={touched.confirmPassword ? errors.confirmPassword : undefined}
            isSuccess={
              touched.confirmPassword &&
              !errors.confirmPassword &&
              formData.confirmPassword !== "" &&
              formData.confirmPassword === formData.password
            }
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            onBlur={() => handleBlur("confirmPassword")}
            required
            autoComplete="new-password"
          />

          {/* Agreement Checkbox */}
          <div className="space-y-1">
            <label className="flex items-start gap-2 text-xs text-zinc-600 font-sans cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.agreed}
                onChange={(e) => handleChange("agreed", e.target.checked)}
                className="mt-0.5 rounded border-zinc-300 text-teal-700 focus:ring-teal-600 h-3.5 w-3.5 shrink-0"
              />
              <span>
                I agree to the <span className="text-zinc-900 underline font-medium">Terms of Service</span> and{" "}
                <span className="text-zinc-900 underline font-medium">Code of Honor</span>.
              </span>
            </label>
            {touched.agreed && errors.agreed && <p className="text-[11px] text-rose-600 font-medium">{errors.agreed}</p>}
          </div>

          {/* Full-Pill Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="group flex h-11 w-full items-center justify-center gap-2 rounded-full bg-teal-700 hover:bg-teal-800 active:scale-[0.99] text-xs font-semibold text-white transition-all cursor-pointer border-none mt-3 disabled:opacity-50 shadow-md shadow-teal-700/20"
          >
            <Sparkles className="h-3.5 w-3.5 text-teal-200" />
            <span>{loading ? "Creating Identity..." : "Create Developer Identity →"}</span>
          </button>

          {/* Social OAuth Buttons */}
          <SocialButtons label="Continue with Google" />
        </form>
      )}

      {/* Switcher Footer */}
      <div className="pt-4 border-t border-zinc-100 text-center text-xs text-zinc-500 font-sans">
        Already have an account?{" "}
        <Link href="/auth/student/login" className="text-teal-700 hover:text-teal-800 font-semibold no-underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
