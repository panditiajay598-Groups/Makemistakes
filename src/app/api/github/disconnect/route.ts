import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getAuthenticatedIdentity } from "@/lib/security/sessionIdentity";
import {
  decryptGithubAccessToken,
  validateGithubTokenEncryptionConfiguration,
} from "@/lib/security/githubOAuth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const identity = await getAuthenticatedIdentity(request);
  if (!identity) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let body: { problemId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (typeof body.problemId !== "string" || !body.problemId.trim()) {
    return NextResponse.json({ error: "problemId is required" }, { status: 400 });
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "GitHub OAuth is not configured" }, { status: 503 });
  }

  try {
    validateGithubTokenEncryptionConfiguration();
    const db = await getDb();
    const problemId = body.problemId.trim();
    const journey = await db.collection("user_journeys").findOne({
      userId: { $in: identity.userIds },
      problemId,
    });
    const storedToken = journey?.phases?.deploy?.githubAccessToken;
    if (!journey || typeof storedToken !== "string" || !storedToken) {
      return NextResponse.json({ error: "GitHub connection not found" }, { status: 404 });
    }

    const { token } = decryptGithubAccessToken(storedToken);
    const revokeResponse = await fetch(
      `https://api.github.com/applications/${encodeURIComponent(clientId)}/grant`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({ access_token: token }),
      }
    );
    if (!revokeResponse.ok) {
      console.error("[GitHub Disconnect] Token revocation failed:", revokeResponse.status);
      return NextResponse.json({ error: "GitHub token revocation failed" }, { status: 502 });
    }

    await db.collection("user_journeys").updateOne(
      { _id: journey._id, userId: journey.userId, problemId },
      {
        $unset: {
          "phases.deploy.githubAccessToken": "",
          "phases.deploy.githubUsername": "",
          "phases.deploy.githubAvatarUrl": "",
          "phases.deploy.connectedAt": "",
        },
        $set: { updatedAt: new Date() },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[GitHub Disconnect] Request failed:", error);
    return NextResponse.json({ error: "Unable to disconnect GitHub" }, { status: 500 });
  }
}
