import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getAuthenticatedIdentity } from "@/lib/security/sessionIdentity";

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

  try {
    const db = await getDb();
    const problemId = body.problemId.trim();
    const journey = await db.collection("user_journeys").findOne({
      userId: { $in: identity.userIds },
      problemId,
    });
    const storedToken = journey?.phases?.deploy?.vercelAccessToken;
    if (!journey || typeof storedToken !== "string" || !storedToken) {
      return NextResponse.json({ error: "Vercel connection not found" }, { status: 404 });
    }

    await db.collection("user_journeys").updateOne(
      { _id: journey._id, userId: journey.userId, problemId },
      {
        $unset: {
          "phases.deploy.vercelAccessToken": "",
          "phases.deploy.vercelUsername": "",
          "phases.deploy.vercelAvatarUrl": "",
          "phases.deploy.vercelConnectedAt": "",
        },
        $set: { updatedAt: new Date() },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Vercel Disconnect] Request failed:", error);
    return NextResponse.json({ error: "Unable to disconnect Vercel" }, { status: 500 });
  }
}
