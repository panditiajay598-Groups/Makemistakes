import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") || "default_user";
  const problemId = searchParams.get("problemId") || "P000001";

  const clientId = (process.env.GITHUB_CLIENT_ID || process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || "").trim();
  if (!clientId) {
    return NextResponse.json({ error: "GITHUB_CLIENT_ID is not configured in .env" }, { status: 500 });
  }

  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000";
  const redirectUri = `${appBaseUrl}/api/github/callback`;
  const state = `${userId}___${problemId}`;

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo%20user&state=${encodeURIComponent(state)}`;

  return NextResponse.redirect(githubAuthUrl);
}
