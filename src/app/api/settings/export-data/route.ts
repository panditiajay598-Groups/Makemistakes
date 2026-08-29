import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import dns from "dns";

try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {}

const DATABASE_URL = process.env.DATABASE_URL;

export async function GET(req: Request) {
  let client: MongoClient | null = null;
  try {
    const { searchParams } = new URL(req.url);
    const userId = (searchParams.get("userId") || "default_user")
      .toString()
      .trim()
      .toLowerCase();

    if (!DATABASE_URL) {
      return NextResponse.json(
        { error: "DATABASE_URL is not configured" },
        { status: 500 }
      );
    }

    client = new MongoClient(DATABASE_URL);
    await client.connect();
    const db = client.db();

    const profileDoc = await db.collection("user_profiles").findOne({ userId });
    const prefDoc = await db.collection("user_preferences").findOne({ userId });
    const journeys = await db.collection("user_journeys").find({ userId }).toArray();
    const completions = await db.collection("problem_completions").find({ userId }).toArray();

    await client.close();

    const exportData = {
      user: userId,
      exportedAt: new Date().toISOString(),
      profile: profileDoc ? { ...profileDoc, _id: undefined } : null,
      preferences: prefDoc ? { ...prefDoc, _id: undefined } : null,
      journeysCount: journeys.length,
      journeys: journeys.map(({ _id, ...j }) => j),
      completionsCount: completions.length,
      completions: completions.map(({ _id, ...c }) => c),
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="makemistakes-data-export-${userId}.json"`,
      },
    });
  } catch (err: any) {
    if (client) await client.close().catch(() => {});
    console.error("Error in GET /api/settings/export-data:", err);
    return NextResponse.json(
      { error: err.message || "Failed to export personal data" },
      { status: 500 }
    );
  }
}
