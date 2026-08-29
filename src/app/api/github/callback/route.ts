import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import dns from "dns";

try { dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]); } catch {}

export const runtime = "nodejs";

let cachedClient: MongoClient | null = null;
async function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  if (!cachedClient) {
    cachedClient = new MongoClient(url);
    await cachedClient.connect();
  }
  return cachedClient.db();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const rawState = searchParams.get("state");

  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000";

  let userId = "default_user";
  let problemId = "P000001";
  if (rawState) {
    if (rawState.includes("___")) {
      const parts = rawState.split("___");
      userId = parts[0] || userId;
      problemId = parts[1] || problemId;
    } else {
      try {
        const parsed = JSON.parse(rawState);
        if (parsed.userId) userId = parsed.userId;
        if (parsed.problemId) problemId = parsed.problemId;
      } catch {}
    }
  }

  if (!code) {
    return NextResponse.redirect(`${appBaseUrl}/journey/${problemId}?step=7&error=missing_code`);
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${appBaseUrl}/journey/${problemId}?step=7&error=missing_oauth_config`);
  }

  try {
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

    if (!accessToken) {
      console.error("[GitHub Callback Error]:", tokenData);
      return NextResponse.redirect(`${appBaseUrl}/journey/${problemId}?step=7&error=token_exchange_failed`);
    }

    // 2. Fetch authenticated GitHub user details
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "MakeMistakes-App",
      },
    });

    const userData = await userRes.json();
    const githubUsername = userData.login || "";
    const githubAvatarUrl = userData.avatar_url || "";

    // 3. Save connection into MongoDB user_journeys collection under { userId, problemId }
    const db = await getDb();
    const effectiveUserId = userId.toString().trim().toLowerCase();

    await db.collection("user_journeys").updateOne(
      { userId: effectiveUserId, problemId },
      {
        $set: {
          userId: effectiveUserId,
          problemId,
          "phases.deploy.githubAccessToken": accessToken,
          "phases.deploy.githubUsername": githubUsername,
          "phases.deploy.githubAvatarUrl": githubAvatarUrl,
          "phases.deploy.connectedAt": new Date(),
          updatedAt: new Date(),
        },
        $setOnInsert: { status: "in_progress", createdAt: new Date() },
      },
      { upsert: true }
    );

    // 4. Redirect back to GitHub Push Phase (Step 7) with connected status
    return NextResponse.redirect(
      `${appBaseUrl}/journey/${problemId}?step=7&githubConnected=true&username=${encodeURIComponent(githubUsername)}`
    );
  } catch (err: any) {
    console.error("[GitHub Callback Exception]:", err);
    return NextResponse.redirect(`${appBaseUrl}/journey/${problemId}?step=7&error=${encodeURIComponent(err.message)}`);
  }
}
