import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getAuthSession, SESSION_COOKIE_NAME } from "@/lib/authSession";
import { prisma } from "@backend/lib/prisma";
import { applyNoStoreHeaders } from "@/lib/cacheHeaders";

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
          { error: "Unauthorized. Authentication session required to delete account." },
          { status: 401 }
        )
      );
    }

    const body = await req.json().catch(() => ({}));
    const confirmation = (body.confirmation || "").toString().trim();

    if (confirmation !== "DELETE") {
      return applyNoStoreHeaders(
        NextResponse.json(
          { error: "Invalid confirmation phrase. Please type DELETE to confirm." },
          { status: 400 }
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

    // 1. Delete user's specific native collections
    await Promise.all([
      db.collection("user_profiles").deleteMany(userFilter),
      db.collection("user_preferences").deleteMany(userFilter),
      db.collection("user_journeys").deleteMany(userFilter),
      db.collection("problem_completions").deleteMany(userFilter),
      db.collection("build_workspaces").deleteMany(userFilter),
    ]);

    // 2. Cascade delete Prisma user account (cascades subscriptions, orders, and credit balance)
    try {
      if (session.userId && /^[0-9a-fA-F]{24}$/.test(session.userId)) {
        await prisma.user.deleteMany({ where: { id: session.userId } });
      } else if (session.email) {
        await prisma.user.deleteMany({ where: { email: session.email } });
      }
    } catch (prismaErr) {
      console.warn("Prisma user cleanup notice during account deletion:", prismaErr);
    }

    const response = NextResponse.json({
      success: true,
      userId: primaryUserId,
      message: "Account and associated data deleted successfully.",
    });

    // Clear session cookie on account deletion
    response.cookies.delete(SESSION_COOKIE_NAME);

    return applyNoStoreHeaders(response);
  } catch (err: any) {
    console.error("Error in POST /api/settings/delete-account:", err);
    return applyNoStoreHeaders(
      NextResponse.json(
        { error: err.message || "Failed to delete account" },
        { status: 500 }
      )
    );
  }
}
