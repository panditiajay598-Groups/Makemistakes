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

    const collection = db.collection("user_profiles");
    const profileDoc = await collection.findOne({ userId });
    await client.close();

    if (!profileDoc) {
      return NextResponse.json({
        exists: false,
        profile: {
          fullName: "",
          username: userId.includes("@") ? userId.split("@")[0] : userId,
          bio: "",
          email: userId.includes("@") ? userId : "",
          location: "",
          website: "",
          github: "",
          twitter: "",
          linkedin: "",
          avatarUrl: "",
        },
      });
    }

    const { _id, ...rest } = profileDoc;
    return NextResponse.json({
      exists: true,
      profile: rest,
    });
  } catch (err: any) {
    if (client) await client.close().catch(() => {});
    console.error("Error in GET /api/settings/profile:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load profile" },
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
    const profile = body.profile || {};

    if (!DATABASE_URL) {
      return NextResponse.json(
        { error: "DATABASE_URL is not configured" },
        { status: 500 }
      );
    }

    client = new MongoClient(DATABASE_URL);
    await client.connect();
    const db = client.db();

    const collection = db.collection("user_profiles");
    const now = new Date();

    const updatedData = {
      userId,
      fullName: (profile.fullName || "").toString().trim(),
      username: (profile.username || "").toString().trim(),
      bio: (profile.bio || "").toString().trim(),
      email: (profile.email || "").toString().trim(),
      location: (profile.location || "").toString().trim(),
      website: (profile.website || "").toString().trim(),
      github: (profile.github || "").toString().trim(),
      twitter: (profile.twitter || "").toString().trim(),
      linkedin: (profile.linkedin || "").toString().trim(),
      avatarUrl: (profile.avatarUrl || "").toString().trim(),
      updatedAt: now,
    };

    await collection.updateOne(
      { userId },
      {
        $set: updatedData,
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );

    await client.close();

    return NextResponse.json({
      success: true,
      userId,
      profile: updatedData,
      updatedAt: now,
    });
  } catch (err: any) {
    if (client) await client.close().catch(() => {});
    console.error("Error in POST /api/settings/profile:", err);
    return NextResponse.json(
      { error: err.message || "Failed to save profile" },
      { status: 500 }
    );
  }
}
