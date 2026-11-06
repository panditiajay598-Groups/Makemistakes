import { NextResponse } from "next/server";
import { OTPService } from "@backend/services/otp.service";
import { applyNoStoreHeaders } from "@/lib/cacheHeaders";
import { otpSuccessPayload, publicOtpError } from "@/lib/security/otpSecurity";

export async function POST(req: Request) {
  try {
    const { email, redirectTo } = await req.json();

    if (typeof email !== "string" || !email.trim()) {
      return applyNoStoreHeaders(
        NextResponse.json(
          { success: false, message: "Email is required." },
          { status: 400 }
        )
      );
    }

    const result = await OTPService.sendOTP(email, redirectTo);

    return applyNoStoreHeaders(
      NextResponse.json(
        otpSuccessPayload(
          { previewUrl: result.previewUrl, devOtp: result.devOtp },
          process.env,
          "development"
        )
      )
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const publicError = publicOtpError(message, "send");
    if (!message.startsWith("OTP_RATE_LIMIT:") && !message.startsWith("EMAIL_DELIVERY_FAILED:")) {
      console.error("Failed to send OTP:", error);
    }
    return applyNoStoreHeaders(
      NextResponse.json(
        { success: false, message: publicError.message },
        { status: publicError.status }
      )
    );
  }
}
