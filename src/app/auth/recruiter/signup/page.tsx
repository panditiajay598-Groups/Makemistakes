"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Building, Mail, Phone, Briefcase, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import AuthInput from "@/components/auth/AuthInput";
import PasswordStrength from "@/components/auth/PasswordStrength";

export default function RecruiterSignup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    companyEmail: "",
    mobileNumber: "",
    designation: "",
    password: "",
    confirmPassword: "",
    agreed: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.companyName.trim()) newErrors.companyName = "Company name is required";
    
    if (!formData.companyEmail) {
      newErrors.companyEmail = "Company work email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.companyEmail)) {
      newErrors.companyEmail = "Please enter a valid company email address";
    }

    if (!formData.mobileNumber) newErrors.mobileNumber = "Mobile number is required";
    if (!formData.designation.trim()) newErrors.designation = "Designation is required";

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreed) {
      newErrors.agreed = "You must agree to the Terms of Service";
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
        localStorage.setItem("user_email", formData.companyEmail);
        localStorage.setItem("user_role", "recruiter");
        localStorage.setItem("redirect_to", "/workspace");
      }
      setTimeout(() => {
        router.push(`/auth/verify?email=${encodeURIComponent(formData.companyEmail)}&role=recruiter&redirectTo=/workspace`);
      }, 1200);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Header */}
      <div className="space-y-1.5 text-left">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded">
            Recruiter Onboarding
          </span>
          <Link href="/auth" className="text-xs font-mono text-zinc-500 hover:text-zinc-300 no-underline">
            Switch Role
          </Link>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50">
          Join as a Recruiter
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
          Evaluate builders through verified Proof-of-Work instead of resumes.
        </p>
      </div>

      {submitted ? (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-3">
          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
          <h4 className="font-display font-semibold text-zinc-100 text-sm">Recruiter Account Registered</h4>
          <p className="text-xs text-zinc-400 font-sans">Redirecting to email verification...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AuthInput
              label="Full Name"
              type="text"
              placeholder="Alex Vance"
              icon={User}
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              error={errors.fullName}
              required
            />

            <AuthInput
              label="Company Name"
              type="text"
              placeholder="Linear / Vercel"
              icon={Building}
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              error={errors.companyName}
              required
            />
          </div>

          <AuthInput
            label="Company Email"
            type="email"
            placeholder="alex@company.com"
            icon={Mail}
            value={formData.companyEmail}
            onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
            error={errors.companyEmail}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AuthInput
              label="Mobile Number"
              type="tel"
              placeholder="+1 (555) 000-0000"
              icon={Phone}
              value={formData.mobileNumber}
              onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
              error={errors.mobileNumber}
              required
            />

            <AuthInput
              label="Designation"
              type="text"
              placeholder="Head of Talent"
              icon={Briefcase}
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              error={errors.designation}
              required
            />
          </div>

          <div className="space-y-2">
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
            <PasswordStrength password={formData.password} />
          </div>

          <AuthInput
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            error={errors.confirmPassword}
            required
          />

          {/* Checkbox */}
          <div className="space-y-1 pt-1">
            <label className="flex items-start gap-2 text-xs text-zinc-400 font-sans cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.agreed}
                onChange={(e) => setFormData({ ...formData, agreed: e.target.checked })}
                className="mt-0.5 rounded border-zinc-800 bg-zinc-900 text-amber-500 focus:ring-0 h-3.5 w-3.5 shrink-0"
              />
              <span>
                I agree to the <span className="text-zinc-200 underline">Terms of Service</span>.
              </span>
            </label>
            {errors.agreed && <p className="text-[11px] text-red-400">{errors.agreed}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="group flex h-10 w-full items-center justify-center gap-1.5 rounded bg-zinc-100 text-xs font-semibold text-zinc-950 transition-all hover:bg-zinc-200 active:scale-[0.99] cursor-pointer border-none mt-2 disabled:opacity-50"
          >
            <span>{loading ? "Registering..." : "Create Recruiter Account"}</span>
            {!loading && <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />}
          </button>

        </form>
      )}

      {/* Switcher Footer */}
      <div className="pt-4 border-t border-zinc-850 text-center text-xs text-zinc-400 font-sans">
        Already have a recruiter account?{" "}
        <Link href="/auth/recruiter/login" className="text-amber-500 hover:text-amber-400 font-semibold no-underline">
          Sign In
        </Link>
      </div>

    </div>
  );
}
