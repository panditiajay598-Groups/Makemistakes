export type ConsentCategory = "necessary" | "functional" | "analytics" | "marketing";

export type ConsentPreferences = {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
};

export const COOKIE_CONSENT_KEY = "mm_cookie_consent";
export const COOKIE_POLICY_VERSION = "2026.01";

export const defaultConsentPreferences: ConsentPreferences = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
};

export function getDefaultConsentPreferences(): ConsentPreferences {
  return {
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  };
}

export function parseConsentCookie(cookieValue: string | undefined): ConsentPreferences {
  if (!cookieValue) {
    return getDefaultConsentPreferences();
  }

  try {
    const parsed = JSON.parse(cookieValue) as Partial<ConsentPreferences>;
    return {
      necessary: true,
      functional: Boolean(parsed.functional),
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
    };
  } catch {
    return getDefaultConsentPreferences();
  }
}

export function getConsentPreferencesFromDocument(): ConsentPreferences {
  if (typeof document === "undefined") {
    return getDefaultConsentPreferences();
  }

  const cookies = document.cookie.split(";");
  const consentCookie = cookies
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${COOKIE_CONSENT_KEY}=`));

  if (!consentCookie) {
    return getDefaultConsentPreferences();
  }

  const value = decodeURIComponent(consentCookie.split("=").slice(1).join("="));
  return parseConsentCookie(value);
}

export function saveConsentPreferences(preferences: ConsentPreferences, policyVersion: string = COOKIE_POLICY_VERSION) {
  if (typeof document === "undefined") {
    return;
  }

  const payload = {
    ...preferences,
    policyVersion,
    timestamp: new Date().toISOString(),
  };

  const maxAge = 60 * 60 * 24 * 365 * 2;
  document.cookie = `${COOKIE_CONSENT_KEY}=${encodeURIComponent(JSON.stringify(payload))}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

export function getConsentForCategory(category: ConsentCategory): boolean {
  if (category === "necessary") return true;
  const consent = getConsentPreferencesFromDocument();
  return consent[category] ?? false;
}
