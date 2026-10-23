import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getAuthSession } from "@/lib/authSession";
import { applyNoStoreHeaders } from "@/lib/cacheHeaders";

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
          { error: "Unauthorized. Authentication session required." },
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

    const userFilter = authIdentifiers.length === 1
      ? { userId: authIdentifiers[0] }
      : { userId: { $in: authIdentifiers } };

    const db = await getDb();
    const collection = db.collection("user_preferences");
    const prefDoc = await collection.findOne(userFilter);

    if (!prefDoc) {
      return NextResponse.json({
        exists: false,
        preferences: DEFAULT_PREFERENCES,
      });
    }

    const { _id, ...rest } = prefDoc;
    return applyNoStoreHeaders(
      NextResponse.json({
        exists: true,
        preferences: {
          ...DEFAULT_PREFERENCES,
          ...rest,
          notifications: {
            ...DEFAULT_PREFERENCES.notifications,
            ...(rest.notifications || {}),
          },
        },
      })
    );
  } catch (err: any) {
    console.error("Error in GET /api/settings/preferences:", err);
    return applyNoStoreHeaders(
      NextResponse.json(
        { error: err.message || "Failed to load preferences" },
        { status: 500 }
      )
    );
  }
}

export async function POST(req: Request) {
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
          { error: "Unauthorized. Authentication session required." },
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

    const body = await req.json().catch(() => ({}));
    const preferences = body.preferences || {};

    const db = await getDb();
    const collection = db.collection("user_preferences");
    const now = new Date();

    const updatedPreferences = {
      userId: primaryUserId,
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

    const existing = await collection.findOne(userFilter);
    if (existing) {
      const isUnchanged =
        (existing.defaultDashboard || "/dashboard") === updatedPreferences.defaultDashboard &&
        (existing.language || "English") === updatedPreferences.language &&
        (existing.dateFormat || "MMM DD, YYYY") === updatedPreferences.dateFormat &&
        (existing.theme || "light") === updatedPreferences.theme &&
        Boolean(existing.compactMode) === updatedPreferences.compactMode &&
        Boolean(existing.notifications?.journeyUpdates ?? true) === updatedPreferences.notifications.journeyUpdates &&
        Boolean(existing.notifications?.buildAlerts ?? true) === updatedPreferences.notifications.buildAlerts &&
        Boolean(existing.notifications?.githubAlerts ?? true) === updatedPreferences.notifications.githubAlerts &&
        Boolean(existing.notifications?.aiAlerts ?? false) === updatedPreferences.notifications.aiAlerts &&
        Boolean(existing.notifications?.securityAlerts ?? true) === updatedPreferences.notifications.securityAlerts;

      if (isUnchanged) {
        const { _id, ...rest } = existing;
        return applyNoStoreHeaders(
          NextResponse.json({
            success: true,
            userId: primaryUserId,
            preferences: rest,
            updatedAt: existing.updatedAt || now,
            skippedWrite: true,
          })
        );
      }
    }

    await collection.updateOne(
      userFilter,
      {
        $set: updatedPreferences,
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );

    return applyNoStoreHeaders(
      NextResponse.json({
        success: true,
        userId: primaryUserId,
        preferences: updatedPreferences,
        updatedAt: now,
      })
    );
  } catch (err: any) {
    console.error("Error in POST /api/settings/preferences:", err);
    return applyNoStoreHeaders(
      NextResponse.json(
        { error: err.message || "Failed to save preferences" },
        { status: 500 }
      )
    );
  }
}
