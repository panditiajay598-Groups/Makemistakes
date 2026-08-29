import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import dns from "dns";

try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {}

const DATABASE_URL = process.env.DATABASE_URL;

const DEFAULT_PREFERENCES = {
  defaultDashboard: "/dashboard",
  language: "English",
  dateFormat: "MMM DD, YYYY",
  theme: "light",
  compactMode: false,
  notifications: {
    journeyUpdates: true,
    buildAlerts: true,
    githubAlerts: true,
    aiAlerts: false,
    securityAlerts: true,
  },
};

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

    const collection = db.collection("user_preferences");
    const prefDoc = await collection.findOne({ userId });
    await client.close();

    if (!prefDoc) {
      return NextResponse.json({
        exists: false,
        preferences: DEFAULT_PREFERENCES,
      });
    }

    const { _id, ...rest } = prefDoc;
    return NextResponse.json({
      exists: true,
      preferences: {
        ...DEFAULT_PREFERENCES,
        ...rest,
        notifications: {
          ...DEFAULT_PREFERENCES.notifications,
          ...(rest.notifications || {}),
        },
      },
    });
  } catch (err: any) {
    if (client) await client.close().catch(() => {});
    console.error("Error in GET /api/settings/preferences:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load preferences" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  let client: MongoClient | null = null;
  try {
    const body = await req.json().catch(() => ({}));
    const userId = (body.userId || "default_user")
      .toString()
      .trim()
      .toLowerCase();
    const preferences = body.preferences || {};

    if (!DATABASE_URL) {
      return NextResponse.json(
        { error: "DATABASE_URL is not configured" },
        { status: 500 }
      );
    }

    client = new MongoClient(DATABASE_URL);
    await client.connect();
    const db = client.db();

    const collection = db.collection("user_preferences");
    const now = new Date();

    const updatedPreferences = {
      userId,
      defaultDashboard: preferences.defaultDashboard || "/dashboard",
      language: preferences.language || "English",
      dateFormat: preferences.dateFormat || "MMM DD, YYYY",
      theme: preferences.theme || "light",
      compactMode: typeof preferences.compactMode === "boolean" ? preferences.compactMode : false,
      notifications: {
        journeyUpdates: typeof preferences.notifications?.journeyUpdates === "boolean" ? preferences.notifications.journeyUpdates : true,
        buildAlerts: typeof preferences.notifications?.buildAlerts === "boolean" ? preferences.notifications.buildAlerts : true,
        githubAlerts: typeof preferences.notifications?.githubAlerts === "boolean" ? preferences.notifications.githubAlerts : true,
        aiAlerts: typeof preferences.notifications?.aiAlerts === "boolean" ? preferences.notifications.aiAlerts : false,
        securityAlerts: typeof preferences.notifications?.securityAlerts === "boolean" ? preferences.notifications.securityAlerts : true,
      },
      updatedAt: now,
    };

    await collection.updateOne(
      { userId },
      {
        $set: updatedPreferences,
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );

    await client.close();

    return NextResponse.json({
      success: true,
      userId,
      preferences: updatedPreferences,
      updatedAt: now,
    });
  } catch (err: any) {
    if (client) await client.close().catch(() => {});
    console.error("Error in POST /api/settings/preferences:", err);
    return NextResponse.json(
      { error: err.message || "Failed to save preferences" },
      { status: 500 }
    );
  }
}
