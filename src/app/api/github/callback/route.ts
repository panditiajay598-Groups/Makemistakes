import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getAuthenticatedIdentity } from "@/lib/security/sessionIdentity";
import {
  consumeGithubOAuthState,
  encryptGithubAccessToken,
  validateGithubTokenEncryptionConfiguration,
} from "@/lib/security/githubOAuth";

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
    return NextResponse.json({ error: "Invalid GitHub OAuth callback" }, { status: 400 });
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "GitHub OAuth is not configured" }, { status: 503 });
  }

  try {
    validateGithubTokenEncryptionConfiguration();
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "GitHub integration is unavailable" }, { status: 503 });
    }

    const db = await getDb();
    const oauthState = await consumeGithubOAuthState(db, rawState, identity);
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

    // 1. Exchange OAuth code for Access Token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!tokenRes.ok || typeof accessToken !== "string" || !accessToken) {
      console.error("[GitHub Callback] Token exchange failed:", tokenRes.status);
      return NextResponse.json({ error: "GitHub token exchange failed" }, { status: 502 });
    }

    // 2. Fetch authenticated GitHub user details
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "MakeMistakes-App",
      },
    });

    if (!userRes.ok) {
      console.error("[GitHub Callback] GitHub identity lookup failed:", userRes.status);
      return NextResponse.json({ error: "Unable to verify GitHub account" }, { status: 502 });
    }

    const userData = await userRes.json();
    const githubUsername = typeof userData.login === "string" ? userData.login : "";
    const githubAvatarUrl = userData.avatar_url || "";
    if (!githubUsername) {
      return NextResponse.json({ error: "GitHub returned an invalid account identity" }, { status: 502 });
    }

    const result = await db.collection("user_journeys").updateOne(
      { userId: oauthState.userId, problemId },
      {
        $set: {
          "phases.deploy.githubAccessToken": encryptGithubAccessToken(accessToken),
          "phases.deploy.githubUsername": githubUsername,
          "phases.deploy.githubAvatarUrl": githubAvatarUrl,
          "phases.deploy.connectedAt": new Date(),
          updatedAt: new Date(),
        },
      }
    );
    if (result.matchedCount !== 1) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // 4. Redirect back to GitHub Push Phase (Step 7) with connected status
    return NextResponse.redirect(
      `${appBaseUrl}/journey/${encodeURIComponent(problemId)}?step=7&githubConnected=true&username=${encodeURIComponent(githubUsername)}`
    );
  } catch (err: any) {
    console.error("[GitHub Callback] Account linking failed:", err);
    return NextResponse.json({ error: "GitHub account linking failed" }, { status: 500 });
  }
}
