"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, Mail, ExternalLink, AlertCircle, Edit2, Check, Key } from "lucide-react";
import OTPInput from "./OTPInput";
import ResendTimer from "./ResendTimer";

export function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fetchedEmailRef = useRef<string | null>(null);

  const [email, setEmail] = useState<string>("");
  const [editingEmail, setEditingEmail] = useState<boolean>(false);
  const [newEmailInput, setNewEmailInput] = useState<string>("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);
  const [verified, setVerified] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [targetPath, setTargetPath] = useState<string>("/philosophy");

  const fetchOTP = async (targetEmail: string, isResend = false) => {
    if (!targetEmail || !/\S+@\S+\.\S+/.test(targetEmail)) {
      setEditingEmail(true);
      return;
    }

    try {
      setResending(true);
      setErrorMsg(null);

      const endpoint = isResend ? "/api/auth/resend-otp" : "/api/auth/send-otp";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, redirectTo: targetPath }),
      });

      const data = await res.json();
      setResending(false);

      if (data.success) {
        if (data.previewUrl) {
          setPreviewUrl(data.previewUrl);
        } else {
          setPreviewUrl(null);
        }
        if (data.devOtp) {
          setDevOtp(data.devOtp);
        } else {
          setDevOtp(null);
        }
        setNotification(data.message || `Verification code sent to ${targetEmail}.`);
        setTimeout(() => setNotification(null), 6000);
      } else {
        setErrorMsg(data.message || "Failed to send verification code.");
      }
    } catch (err: any) {
      setResending(false);
      setErrorMsg("Network error sending verification code.");
    }
  };

  const autoVerifyOTP = async (targetEmail: string, otpCode: string, destination: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, otp: otpCode, redirectTo: destination }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success && data.verified) {
        setVerified(true);
        if (typeof window !== "undefined") {
          localStorage.setItem("user_verified", "true");
          localStorage.setItem("user_email", targetEmail);
        }
        const finalDest = "/philosophy";
        setTimeout(() => {
          if (typeof window !== "undefined") {
            window.location.href = finalDest;
          } else {
            router.push(finalDest);
          }
        }, 500);
      } else {
        setErrorMsg(data.message || "Invalid or expired verification link.");
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg("Network failure verifying link.");
    }
  };

  useEffect(() => {
    let activeEmail = searchParams.get("email");
    if (!activeEmail && typeof window !== "undefined") {
      activeEmail = localStorage.getItem("user_email");
    }

    const finalTarget = "/philosophy";
    setTargetPath(finalTarget);

    if (activeEmail) {
      setEmail(activeEmail);
      setNewEmailInput(activeEmail);
      setEditingEmail(false);

      const urlOtp = searchParams.get("otp") || searchParams.get("code");
      if (urlOtp && urlOtp.length === 6 && /^\d{6}$/.test(urlOtp)) {
        setOtp(urlOtp.split(""));
        autoVerifyOTP(activeEmail, urlOtp, finalTarget);
      } else if (fetchedEmailRef.current !== activeEmail) {
        fetchedEmailRef.current = activeEmail;
        fetchOTP(activeEmail, false);
      }
    } else {
      setEmail("");
      setNewEmailInput("");
      setEditingEmail(true);
    }
  }, [searchParams]);

  const handleResendOTP = async () => {
    setOtp(["", "", "", "", "", ""]);
    if (email) {
      await fetchOTP(email, true);
    } else {
      setEditingEmail(true);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newEmailInput.trim().toLowerCase();
    if (!cleanEmail || !/\S+@\S+\.\S+/.test(cleanEmail)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setEmail(cleanEmail);
    fetchedEmailRef.current = cleanEmail;
    if (typeof window !== "undefined") {
      localStorage.setItem("user_email", cleanEmail);
    }
    setEditingEmail(false);
    setOtp(["", "", "", "", "", ""]);

    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set("email", cleanEmail);
    router.replace(`/auth/verify?${currentParams.toString()}`);
    await fetchOTP(cleanEmail, true);
  };

  const handleOpenGmail = () => {
    if (previewUrl) {
      window.open(previewUrl, "_blank", "noopener,noreferrer");
      return;
    }
    const searchTarget = encodeURIComponent("Verify your MakeMistakes account");
    const gmailUrl = email && email.includes("@")
      ? `https://mail.google.com/mail/u/0/#search/${searchTarget}`
      : "https://mail.google.com";
    window.open(gmailUrl, "_blank", "noopener,noreferrer");
  };

  const handleUseDevOtp = () => {
    if (devOtp && devOtp.length === 6) {
      setOtp(devOtp.split(""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join("");
    if (fullOtp.length < 6 || !email) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: fullOtp, redirectTo: "/philosophy" }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success && data.verified) {
        setVerified(true);
        if (typeof window !== "undefined") {
          localStorage.setItem("user_verified", "true");
          localStorage.setItem("user_email", email);
        }
        const destination = "/philosophy";
        setTimeout(() => {
          if (typeof window !== "undefined") {
            window.location.href = destination;
          } else {
            router.push(destination);
          }
        }, 500);
      } else {
        setErrorMsg(data.message || "Invalid OTP code.");
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg("Network failure verifying OTP. Please try again.");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 sm:p-8 shadow-xl shadow-zinc-200/50 space-y-6 w-full animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-2 text-left">
        <span className="text-[10px] font-mono text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full font-semibold uppercase">
          VERIFICATION REQUIRED
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl text-zinc-900 leading-tight">
          Verify Your Email
        </h2>

        {/* Email display and editing */}
        {editingEmail ? (
          <form onSubmit={handleUpdateEmail} className="flex items-center gap-2 pt-1">
            <input
              type="email"
              value={newEmailInput}
              onChange={(e) => setNewEmailInput(e.target.value)}
              className="flex-1 bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-teal-600"
              placeholder="Enter your email address..."
              autoFocus
            />
            <button
              type="submit"
              className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-1 cursor-pointer border-none shadow-sm"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Send OTP</span>
            </button>
          </form>
        ) : (
          <p className="text-xs sm:text-sm text-zinc-600 font-sans leading-relaxed flex items-center flex-wrap gap-1.5">
            <span>We sent a 6-digit security code to</span>
            <span className="font-semibold text-teal-800">{email}</span>
            <button
              type="button"
              onClick={() => setEditingEmail(true)}
              className="text-[11px] text-teal-700 hover:text-teal-900 underline font-mono flex items-center gap-1 bg-transparent border-none cursor-pointer p-0 ml-1 font-semibold"
            >
              <Edit2 className="h-3 w-3" />
              <span>Change Email</span>
            </button>
          </p>
        )}
      </div>

      {/* Security Action Banner */}
      <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4 space-y-2.5 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-teal-700 shrink-0" />
            <span className="text-xs font-semibold text-teal-900">
              Security OTP Sent to {email || 'your email'}
            </span>
          </div>
        </div>


        <div className="flex items-center gap-2 pt-0.5">
          <button
            type="button"
            onClick={handleOpenGmail}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-white text-zinc-800 text-xs font-semibold hover:bg-zinc-50 transition-colors cursor-pointer border border-zinc-200 shadow-sm"
          >
            <ExternalLink className="h-3.5 w-3.5 text-zinc-500" />
            <span>{previewUrl ? "View Test Ethereal Email Inbox ↗" : "Open Email Inbox ↗"}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium text-center animate-in fade-in duration-200">
          {notification}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center flex items-center justify-center gap-1.5 animate-in fade-in duration-200">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {verified ? (
        <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-6 text-center space-y-3">
          <CheckCircle2 className="h-10 w-10 text-teal-700 mx-auto animate-bounce" />
          <h4 className="font-serif font-bold text-zinc-900 text-base">Account Verified!</h4>
          <p className="text-xs text-zinc-600 font-sans">
            Your Developer Identity is ready. Accessing MakeMistakes Philosophy...
          </p>
          <div className="pt-1">
            <button
              onClick={() => router.push("/philosophy")}
              className="text-xs text-teal-700 hover:text-teal-900 font-semibold underline bg-transparent border-none cursor-pointer"
            >
              Click here if not redirected automatically
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 6 Digit OTP Input */}
          <OTPInput otp={otp} setOtp={setOtp} disabled={loading} />

          <button
            type="submit"
            disabled={loading || otp.some((digit) => !digit)}
            className="group flex h-11 w-full items-center justify-center gap-2 rounded-full bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs transition-all cursor-pointer border-none disabled:opacity-50 shadow-md shadow-teal-700/20"
          >
            <span>{loading ? "Verifying..." : "Verify Code & Continue →"}</span>
          </button>

          <ResendTimer onResend={handleResendOTP} loading={resending} />
        </form>
      )}

      {/* Footer */}
      <div className="pt-4 border-t border-zinc-100 text-center text-xs text-zinc-500 font-sans">
        Need help?{" "}
        <Link href="/" className="text-teal-700 hover:text-teal-900 font-semibold no-underline">
          Return to Landing Page
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={<div className="text-center text-xs text-zinc-500 py-8">Loading verification form...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
