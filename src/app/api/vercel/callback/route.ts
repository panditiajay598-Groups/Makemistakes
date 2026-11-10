import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getAuthenticatedIdentity } from "@/lib/security/sessionIdentity";
import {
  consumeVercelOAuthState,
  encryptVercelAccessToken,
  validateVercelTokenEncryptionConfiguration,
} from "@/lib/security/vercelOAuth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const identity = await getAuthenticatedIdentity(req);
  if (!identity) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const rawState = searchParams.get("state");

  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000";
  if (!code || !rawState || rawState.length > 200) {
    return NextResponse.json({ error: "Invalid Vercel OAuth callback" }, { status: 400 });
  }

  const clientId = process.env.VERCEL_CLIENT_ID;
  const clientSecret = process.env.VERCEL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Vercel OAuth is not configured" }, { status: 503 });
  }

  try {
    validateVercelTokenEncryptionConfiguration();
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Vercel integration is unavailable" }, { status: 503 });
    }

    const db = await getDb();
    const oauthState = await consumeVercelOAuthState(db, rawState, identity);
    if (!oauthState) {
      return NextResponse.json({ error: "Invalid, expired, or already used OAuth state" }, { status: 400 });
    }
    const problemId = oauthState.problemId;
    const journey = await db.collection("user_journeys").findOne({
      userId: oauthState.userId,
      problemId,
    });
    if (!journey) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // Exchange OAuth code for access token
    const tokenRes = await fetch("https://api.vercel.com/v1/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: `${appBaseUrl}/api/vercel/callback`,
      }),
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!tokenRes.ok || typeof accessToken !== "string" || !accessToken) {
      console.error("[Vercel Callback] Token exchange failed:", tokenRes.status);
      return NextResponse.json({ error: "Vercel token exchange failed" }, { status: 502 });
    }

    // Fetch authenticated Vercel user details
    const userRes = await fetch("https://api.vercel.com/v2/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!userRes.ok) {
      console.error("[Vercel Callback] Identity lookup failed:", userRes.status);
      return NextResponse.json({ error: "Unable to verify Vercel account" }, { status: 502 });
    }

    const userData = await userRes.json();
    const vercelUsername = userData.user?.username || userData.username || "";
    const vercelAvatarUrl = userData.user?.avatar || userData.avatar || "";
    if (!vercelUsername) {
      return NextResponse.json({ error: "Vercel returned an invalid account identity" }, { status: 502 });
    }

    const result = await db.collection("user_journeys").updateOne(
      { userId: oauthState.userId, problemId },
      {
        $set: {
          "phases.deploy.vercelAccessToken": encryptVercelAccessToken(accessToken),
          "phases.deploy.vercelUsername": vercelUsername,
          "phases.deploy.vercelAvatarUrl": vercelAvatarUrl,
          "phases.deploy.vercelConnectedAt": new Date(),
          updatedAt: new Date(),
        },
      }
    );
    if (result.matchedCount !== 1) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    return NextResponse.redirect(
      `${appBaseUrl}/dashboard/settings?tab=integrations&vercelConnected=true&username=${encodeURIComponent(vercelUsername)}`
    );
  } catch (err) {
    console.error("[Vercel Callback] Account linking failed:", err);
    return NextResponse.json({ error: "Vercel account linking failed" }, { status: 500 });
  }
}
