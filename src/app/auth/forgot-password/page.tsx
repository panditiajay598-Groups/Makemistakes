"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, ArrowRight } from "lucide-react";
import AuthInput from "@/components/auth/AuthInput";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Email address is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Header */}
      <div className="space-y-1.5 text-left">
        <Link
          href="/auth"
          className="inline-flex items-center gap-1 text-xs font-mono text-zinc-500 hover:text-zinc-300 no-underline mb-2"
        >
          <ArrowLeft className="h-3 w-3" /> Back to Auth Hub
        </Link>
        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50">
          Reset Password
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
          Enter your email address and we'll send you instructions to reset your password.
        </p>
      </div>

      {sent ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-6 text-center space-y-3">
          <CheckCircle2 className="h-8 w-8 text-amber-500 mx-auto" />
          <h4 className="font-display font-semibold text-zinc-100 text-sm">Reset Link Sent</h4>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
            We've sent a password reset link to <span className="font-mono text-zinc-200">{email}</span>. Please check your inbox.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setSent(false)}
              className="text-xs text-amber-500 hover:text-amber-400 font-semibold bg-transparent border-none cursor-pointer"
            >
              Didn't receive email? Try again
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            label="Email Address"
            type="email"
            placeholder="sarah@example.com"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="group flex h-10 w-full items-center justify-center gap-1.5 rounded bg-zinc-100 text-xs font-semibold text-zinc-950 transition-all hover:bg-zinc-200 active:scale-[0.99] cursor-pointer border-none mt-2 disabled:opacity-50"
          >
            <span>{loading ? "Sending..." : "Send Reset Link"}</span>
            {!loading && <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />}
          </button>
        </form>
      )}

      {/* Switcher Footer */}
      <div className="pt-4 border-t border-zinc-850 text-center text-xs text-zinc-400 font-sans">
        Remember your password?{" "}
        <Link href="/auth/student/login" className="text-amber-500 hover:text-amber-400 font-semibold no-underline">
          Back to Sign In
        </Link>
      </div>

    </div>
  );
}
