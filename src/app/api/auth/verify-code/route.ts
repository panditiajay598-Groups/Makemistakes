import { NextResponse } from "next/server";
import { OTPService } from "@backend/services/otp.service";
import { applyNoStoreHeaders } from "@/lib/cacheHeaders";
import { publicOtpError } from "@/lib/security/otpSecurity";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (typeof email !== "string" || typeof code !== "string" || !email || !code) {
      return applyNoStoreHeaders(
        NextResponse.json(
          { success: false, message: "Email and 6-digit verification code are required." },
          { status: 400 }
        )
      );
    }

    const result = await OTPService.verifyOTP(email, code);

    if (!result.verified) {
      return applyNoStoreHeaders(
        NextResponse.json(
          { success: false, message: "Invalid or expired verification code. Please request a new code." },
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const publicError = publicOtpError(message, "verify");
    if (publicError.status !== 429) console.error("Error in /api/auth/verify-code:", error);
    return applyNoStoreHeaders(
      NextResponse.json(
        {
          success: false,
          message: publicError.message,
        },
        { status: publicError.status }
      )
    );
  }
}
