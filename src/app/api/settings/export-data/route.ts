import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getAuthSession } from "@/lib/authSession";
import { applyNoStoreHeaders } from "@/lib/cacheHeaders";

export async function GET(req: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return applyNoStoreHeaders(
        NextResponse.json(
          { error: "DATABASE_URL is not configured" },
          { status: 500 }
        )
      );
    }

    const session = await getAuthSession(req);
    if (!session) {
      return applyNoStoreHeaders(
        NextResponse.json(
          { error: "Unauthorized. Authentication session required to export personal data." },
          { status: 401 }
        )
      );
    }

    const authIdentifiers: string[] = [];
    if (session.email?.trim()) {
      authIdentifiers.push(session.email.trim().toLowerCase());
    }
    if (session.userId?.trim() && !authIdentifiers.includes(session.userId.trim())) {
      authIdentifiers.push(session.userId.trim());
    }

    const primaryUserId = authIdentifiers[0] || session.userId;
    const userFilter = authIdentifiers.length === 1
      ? { userId: authIdentifiers[0] }
      : { userId: { $in: authIdentifiers } };

    const db = await getDb();

    const [profileDoc, prefDoc, journeys, completions, workspaces] = await Promise.all([
      db.collection("user_profiles").findOne(userFilter),
      db.collection("user_preferences").findOne(userFilter),
      db.collection("user_journeys").find(userFilter).toArray(),
      db.collection("problem_completions").find(userFilter).toArray(),
      db.collection("build_workspaces").find(userFilter).toArray(),
    ]);

    const exportData = {
      user: primaryUserId,
      email: session.email || null,
      exportedAt: new Date().toISOString(),
      profile: profileDoc ? { ...profileDoc, _id: undefined } : null,
      preferences: prefDoc ? { ...prefDoc, _id: undefined } : null,
      journeysCount: journeys.length,
      journeys: journeys.map(({ _id, ...j }) => j),
      completionsCount: completions.length,
      completions: completions.map(({ _id, ...c }) => c),
      workspacesCount: workspaces.length,
      workspaces: workspaces.map(({ _id, ...w }) => w),
    };

    const res = new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="makemistakes-data-export-${primaryUserId}.json"`,
      },
    });
    return applyNoStoreHeaders(res);
  } catch (err: any) {
    console.error("Error in GET /api/settings/export-data:", err);
    return applyNoStoreHeaders(
      NextResponse.json(
        { error: err.message || "Failed to export personal data" },
        { status: 500 }
      )
    );
  }
}
