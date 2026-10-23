import { NextResponse } from "next/server";
import { OTPService } from "@backend/services/otp.service";
import { applyNoStoreHeaders } from "@/lib/cacheHeaders";

export async function POST(req: Request) {
  try {
    const { email, otp, redirectTo } = await req.json();

    if (!email || !otp) {
      return applyNoStoreHeaders(
        NextResponse.json(
          { success: false, verified: false, message: "Email and OTP are required." },
          { status: 400 }
        )
      );
    }

    const result = await OTPService.verifyOTP(email, otp);

    if (result.verified) {
      const { resolveOrCreateUser, signSessionToken, SESSION_COOKIE_NAME, SESSION_EXPIRY_MS } = await import("@/lib/authSession");
      const user = await resolveOrCreateUser(email);
      const token = signSessionToken({ userId: user.id, email: user.email, role: user.role });

      const response = NextResponse.json({
        success: true,
        verified: true,
        token,
        user: { id: user.id, email: user.email, role: user.role },
        ...(redirectTo ? { redirectTo } : {}),
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
    }

    return applyNoStoreHeaders(
      NextResponse.json({
        success: true,
        verified: false,
        ...(redirectTo ? { redirectTo } : {}),
      })
    );
  } catch (error: any) {
    return applyNoStoreHeaders(
      NextResponse.json(
        {
          success: false,
          verified: false,
          message: error.message || "OTP verification failed.",
        },
        { status: 400 }
      )
    );
  }
}
