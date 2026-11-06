"use client";

import { useEffect, useState } from "react";
import { COOKIE_POLICY_VERSION, getConsentPreferencesFromDocument, saveConsentPreferences } from "@/lib/cookieConsent";

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState({
    functional: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = getConsentPreferencesFromDocument();
    setPreferences({
      functional: consent.functional,
      analytics: consent.analytics,
      marketing: consent.marketing,
    });

    const hasPreviouslyChosen = typeof document !== "undefined" && document.cookie.includes("mm_cookie_consent=");
    setIsVisible(!hasPreviouslyChosen);
  }, []);

  const applyPreferences = (nextPreferences: typeof preferences) => {
    const merged = {
      necessary: true,
      functional: nextPreferences.functional,
      analytics: nextPreferences.analytics,
      marketing: nextPreferences.marketing,
    };

    saveConsentPreferences(merged, COOKIE_POLICY_VERSION);
    setPreferences(nextPreferences);
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200 bg-white/95 px-4 py-4 shadow-2xl backdrop-blur-sm">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <h2 className="text-lg font-semibold text-zinc-900">Cookie preferences</h2>
            <p className="mt-2 text-sm text-zinc-600">
              MakeMistakes uses strictly necessary cookies for account access and site security. Optional functional, analytics and marketing cookies only activate with your consent.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreferences({ functional: true, analytics: true, marketing: true })}
              className="rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
            >
              Accept All
            </button>
            <button
              type="button"
              onClick={() => applyPreferences({ functional: false, analytics: false, marketing: false })}
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Reject Non-Essential
            </button>
            <button
              type="button"
              onClick={() => setShowCustomize((value) => !value)}
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Customize Preferences
            </button>
          </div>
        </div>

        {showCustomize && (
          <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { key: "functional", label: "Functional" },
                { key: "analytics", label: "Analytics" },
                { key: "marketing", label: "Marketing" },
              ].map((category) => (
                <label key={category.key} className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-700">
                  <span>{category.label}</span>
                  <input
                    type="checkbox"
                    checked={preferences[category.key as keyof typeof preferences]}
                    onChange={(event) =>
                      setPreferences((current) => ({
                        ...current,
                        [category.key]: event.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-zinc-300 text-teal-700 focus:ring-teal-600"
                  />
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => applyPreferences(preferences)}
                className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
