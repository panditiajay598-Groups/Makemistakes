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

    const db = await getDb();
    const collection = db.collection("user_profiles");
    const profileDoc = await collection.findOne(userFilter);

    if (!profileDoc) {
      const defaultEmail = session.email || "";
      const defaultUsername = defaultEmail.includes("@")
        ? defaultEmail.split("@")[0]
        : primaryUserId;

      return applyNoStoreHeaders(
        NextResponse.json({
        exists: false,
        profile: {
          fullName: "",
          username: defaultUsername,
          bio: "",
          email: defaultEmail,
          location: "",
          website: "",
          github: "",
          twitter: "",
          linkedin: "",
          avatarUrl: "",
        },
      })
    );
  }

  const { _id, ...rest } = profileDoc;
  return applyNoStoreHeaders(
    NextResponse.json({
      exists: true,
      profile: rest,
    })
  );
} catch (err: any) {
  console.error("Error in GET /api/settings/profile:", err);
  return applyNoStoreHeaders(
    NextResponse.json(
      { error: err.message || "Failed to load profile" },
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

    // Authoritative identity derived strictly from session
    const primaryUserId = authIdentifiers[0] || session.userId;
    const userFilter = authIdentifiers.length === 1
      ? { userId: authIdentifiers[0] }
      : { userId: { $in: authIdentifiers } };

    const body = await req.json().catch(() => ({}));
    const profile = body.profile || {};

    const db = await getDb();
    const collection = db.collection("user_profiles");
    const now = new Date();

    const updatedData = {
      userId: primaryUserId,
      fullName: (profile.fullName || "").toString().trim(),
      username: (profile.username || "").toString().trim(),
      bio: (profile.bio || "").toString().trim(),
      email: (profile.email || session.email || "").toString().trim(),
      location: (profile.location || "").toString().trim(),
      website: (profile.website || "").toString().trim(),
      github: (profile.github || "").toString().trim(),
      twitter: (profile.twitter || "").toString().trim(),
      linkedin: (profile.linkedin || "").toString().trim(),
      avatarUrl: (profile.avatarUrl || "").toString().trim(),
      updatedAt: now,
    };

    const existing = await collection.findOne(userFilter);
    if (existing) {
      const isUnchanged =
        (existing.fullName || "") === updatedData.fullName &&
        (existing.username || "") === updatedData.username &&
        (existing.bio || "") === updatedData.bio &&
        (existing.email || "") === updatedData.email &&
        (existing.location || "") === updatedData.location &&
        (existing.website || "") === updatedData.website &&
        (existing.github || "") === updatedData.github &&
        (existing.twitter || "") === updatedData.twitter &&
        (existing.linkedin || "") === updatedData.linkedin &&
        (existing.avatarUrl || "") === updatedData.avatarUrl;

      if (isUnchanged) {
        const { _id, ...rest } = existing;
        return applyNoStoreHeaders(
          NextResponse.json({
            success: true,
            userId: primaryUserId,
            profile: rest,
            updatedAt: existing.updatedAt || now,
            skippedWrite: true,
          })
        );
      }
    }

    await collection.updateOne(
      userFilter,
      {
        $set: updatedData,
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );

    return applyNoStoreHeaders(
      NextResponse.json({
        success: true,
        userId: primaryUserId,
        profile: updatedData,
        updatedAt: now,
      })
    );
  } catch (err: any) {
    console.error("Error in POST /api/settings/profile:", err);
    return applyNoStoreHeaders(
      NextResponse.json(
        { error: err.message || "Failed to save profile" },
        { status: 500 }
      )
    );
  }
}
