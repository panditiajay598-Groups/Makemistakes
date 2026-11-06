import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  COOKIE_CONSENT_KEY,
  COOKIE_POLICY_VERSION,
  defaultConsentPreferences,
  type ConsentPreferences,
} from "@/lib/cookieConsent";

function normalizePreferences(value: Partial<ConsentPreferences> | undefined): ConsentPreferences {
  return {
    necessary: true,
    functional: Boolean(value?.functional),
    analytics: Boolean(value?.analytics),
    marketing: Boolean(value?.marketing),
  };
}

export async function GET() {
  const cookieStore = await cookies();
  const consentCookie = cookieStore.get(COOKIE_CONSENT_KEY)?.value;

  if (!consentCookie) {
    return NextResponse.json({
      preferences: defaultConsentPreferences,
      policyVersion: COOKIE_POLICY_VERSION,
      consented: false,
    });
  }

  try {
    const parsed = JSON.parse(consentCookie) as Partial<ConsentPreferences> & { policyVersion?: string };
    const preferences = normalizePreferences(parsed);
    return NextResponse.json({
      preferences,
      policyVersion: parsed.policyVersion ?? COOKIE_POLICY_VERSION,
      consented: true,
    });
  } catch {
    return NextResponse.json({
      preferences: defaultConsentPreferences,
      policyVersion: COOKIE_POLICY_VERSION,
      consented: false,
    });
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    preferences?: Partial<ConsentPreferences>;
    policyVersion?: string;
  };

  const normalized = normalizePreferences(body.preferences);
  const policyVersion = body.policyVersion ?? COOKIE_POLICY_VERSION;
  const payload = {
    ...normalized,
    timestamp: new Date().toISOString(),
    policyVersion,
  };

  const response = NextResponse.json({
    success: true,
    preferences: normalized,
    policyVersion,
    timestamp: payload.timestamp,
  });

  response.cookies.set(COOKIE_CONSENT_KEY, JSON.stringify(payload), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365 * 2,
    sameSite: "lax",
    httpOnly: false,
  });

  return response;
}
