import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getAuthenticatedIdentity } from "@/lib/security/sessionIdentity";
import {
  createVercelOAuthState,
  validateVercelTokenEncryptionConfiguration,
} from "@/lib/security/vercelOAuth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const identity = await getAuthenticatedIdentity(req);
  if (!identity) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const problemId = searchParams.get("problemId")?.trim();
  if (!problemId) {
    return NextResponse.json({ error: "problemId is required" }, { status: 400 });
  }

  const clientId = process.env.VERCEL_CLIENT_ID?.trim();
  if (!clientId) {
    return NextResponse.json({ error: "VERCEL_CLIENT_ID is not configured in .env" }, { status: 500 });
  }
  if (!process.env.VERCEL_CLIENT_SECRET?.trim()) {
    return NextResponse.json({ error: "VERCEL_CLIENT_SECRET is not configured in .env" }, { status: 500 });
  }

  try {
    validateVercelTokenEncryptionConfiguration();
  } catch {
    return NextResponse.json({ error: "Vercel token encryption is not configured" }, { status: 503 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Vercel integration is unavailable" }, { status: 503 });
  }

  try {
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000";
    const redirectUri = `${appBaseUrl}/api/vercel/callback`;
    const db = await getDb();
    const journey = await db.collection("user_journeys").findOne({
      userId: { $in: identity.userIds },
      problemId,
    });
    if (!journey) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    const state = await createVercelOAuthState(db, identity, journey.userId, problemId);
    const vercelAuthUrl =
      `https://vercel.com/oauth/authorize?client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}`;

    return NextResponse.redirect(vercelAuthUrl);
  } catch (error) {
    console.error("Failed to start Vercel account linking:", error);
    return NextResponse.json({ error: "Unable to start Vercel account linking" }, { status: 500 });
  }
}
