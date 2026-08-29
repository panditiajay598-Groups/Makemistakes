import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import dns from "dns";

try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {}

const DATABASE_URL = process.env.DATABASE_URL;

export async function POST(req: Request) {
  let client: MongoClient | null = null;
  try {
    const body = await req.json().catch(() => ({}));
    const userId = (body.userId || "default_user")
      .toString()
      .trim()
      .toLowerCase();
    const confirmation = (body.confirmation || "").toString().trim();

    if (confirmation !== "DELETE") {
      return NextResponse.json(
        { error: "Invalid confirmation phrase. Please type DELETE to confirm." },
        { status: 400 }
      );
    }

    if (!DATABASE_URL) {
      return NextResponse.json(
        { error: "DATABASE_URL is not configured" },
        { status: 500 }
      );
    }

    client = new MongoClient(DATABASE_URL);
    await client.connect();
    const db = client.db();

    // Delete user's specific data
    await db.collection("user_profiles").deleteMany({ userId });
    await db.collection("user_preferences").deleteMany({ userId });
    await db.collection("user_journeys").deleteMany({ userId });
    await db.collection("problem_completions").deleteMany({ userId });

    await client.close();

    return NextResponse.json({
      success: true,
      userId,
      message: "Account and associated data deleted successfully.",
    });
  } catch (err: any) {
    if (client) await client.close().catch(() => {});
    console.error("Error in POST /api/settings/delete-account:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete account" },
      { status: 500 }
    );
  }
}
