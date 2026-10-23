import { NextResponse } from "next/server";
import { verifyCode } from "@/lib/codeStore";
import { applyNoStoreHeaders } from "@/lib/cacheHeaders";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return applyNoStoreHeaders(
        NextResponse.json(
          { success: false, message: "Email and 6-digit verification code are required." },
          { status: 400 }
        )
      );
    }

    const result = verifyCode(email, code);

    if (!result.valid) {
      return applyNoStoreHeaders(
        NextResponse.json(
          { success: false, message: result.reason || "Invalid verification code." },
          { status: 400 }
        )
      );
    }

    const { resolveOrCreateUser, signSessionToken, SESSION_COOKIE_NAME, SESSION_EXPIRY_MS } = await import("@/lib/authSession");
    const user = await resolveOrCreateUser(email);
    const token = signSessionToken({ userId: user.id, email: user.email, role: user.role });

    const response = NextResponse.json({
      success: true,
      verified: true,
      token,
      user: { id: user.id, email: user.email, role: user.role },
      message: "Account verified successfully!",
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: Math.floor(SESSION_EXPIRY_MS / 1000),
    });

    return applyNoStoreHeaders(response);
  } catch (error: any) {
    console.error("Error in /api/auth/verify-code:", error);
    return applyNoStoreHeaders(
      NextResponse.json(
        { success: false, message: "Verification failed. Please try again." },
        { status: 500 }
      )
    );
  }
}
