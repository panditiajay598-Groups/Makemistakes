import { NextResponse } from "next/server";
import { OTPService } from "@backend/services/otp.service";
import { applyNoStoreHeaders } from "@/lib/cacheHeaders";

export async function POST(req: Request) {
  try {
    const { email, redirectTo } = await req.json();

    if (!email) {
      return applyNoStoreHeaders(
        NextResponse.json(
          { success: false, message: "Email is required." },
          { status: 400 }
        )
      );
    }

    const result = await OTPService.resendOTP(email, redirectTo);

    return applyNoStoreHeaders(
      NextResponse.json({
        success: true,
        message: result.message,
        ...(result.previewUrl ? { previewUrl: result.previewUrl } : {}),
        ...(result.devOtp ? { devOtp: result.devOtp } : {}),
      })
    );
  } catch (error: any) {
    const statusCode = error.message?.includes("wait") || error.message?.includes("requests per hour") ? 429 : 400;
    return applyNoStoreHeaders(
      NextResponse.json(
        { success: false, message: error.message || "Failed to resend OTP." },
        { status: statusCode }
      )
    );
  }
}
