"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

interface SocialButtonsProps {
  label?: string;
  onClick?: () => void;
  callbackUrl?: string;
}

export default function SocialButtons({
  label = "Continue with Google",
  onClick,
  callbackUrl = "/onboarding",
}: SocialButtonsProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleClick = async () => {
    setErrorMessage(null);
    setLoading(true);

    try {
      if (onClick) {
        await onClick();
        setLoading(false);
        return;
      }

      if (typeof window !== "undefined" && !navigator.onLine) {
        const netErr = "Network error: Please check your internet connection and try again.";
        setErrorMessage(netErr);
        setLoading(false);
        return;
      }

      const googleClientId =
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
        process.env.GOOGLE_CLIENT_ID;

      if (!googleClientId) {
        setErrorMessage(
          "Google Auth is not configured. Please define NEXT_PUBLIC_GOOGLE_CLIENT_ID in your .env.local file to initiate Google OAuth."
        );
        setLoading(false);
        return;
      }

      const redirectUri = encodeURIComponent(
        `${window.location.origin}${callbackUrl}`
      );
      const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
        googleClientId
      )}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20profile%20email&prompt=select_account`;

      window.location.href = googleOAuthUrl;
    } catch (err: any) {
      const msg = err?.message || "Failed to launch Google Sign-In. Please try again.";
      setErrorMessage(msg);
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Centered OR Divider */}
      <div className="flex items-center my-4 w-full" aria-hidden="true">
        <div className="flex-1 border-t border-zinc-200" />
        <span className="px-3 text-[11px] font-mono text-zinc-400 uppercase shrink-0">
          OR
        </span>
        <div className="flex-1 border-t border-zinc-200" />
      </div>

      {/* Error Toast Notification Banner */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-start justify-between gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 animate-in fade-in duration-200"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <span className="leading-relaxed font-sans">{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-amber-600 hover:text-amber-800 shrink-0 p-0.5 bg-transparent border-none cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Social Login Buttons Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 transition-all hover:bg-zinc-50 hover:border-zinc-300 active:scale-[0.98] cursor-pointer disabled:opacity-60 shadow-sm"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.8-.7-1.4-1.6-1.8-2.6z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
            />
          </svg>
          <span className="truncate">{loading ? "Redirecting..." : "Google"}</span>
        </button>

        {/* GitHub OAuth Button */}
        <button
          type="button"
          onClick={() => alert("GitHub sign-in initiated.")}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 transition-all hover:bg-zinc-50 hover:border-zinc-300 active:scale-[0.98] cursor-pointer shadow-sm"
        >
          <svg className="h-4 w-4 shrink-0 fill-current text-zinc-900" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
          <span className="truncate">GitHub</span>
        </button>
      </div>
    </div>
  );
}
