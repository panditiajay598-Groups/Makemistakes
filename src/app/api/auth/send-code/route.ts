import { NextResponse } from "next/server";
import { OTPService } from "@backend/services/otp.service";
import { applyNoStoreHeaders } from "@/lib/cacheHeaders";
import { otpSuccessPayload, publicOtpError } from "@/lib/security/otpSecurity";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body?.email;
    if (typeof email !== "string" || !/\S+@\S+\.\S+/.test(email.trim())) {
      return applyNoStoreHeaders(
        NextResponse.json(
          { success: false, message: "Please provide a valid email address." },
          { status: 400 }
        )
      );
    }

    const result = await OTPService.sendOTP(email);
    return applyNoStoreHeaders(
      NextResponse.json({
        ...otpSuccessPayload(
          { devOtp: result.devOtp, previewUrl: result.previewUrl },
          process.env,
          "development"
        ),
        ...(process.env.NODE_ENV === "development" && result.devOtp
          ? { code: result.devOtp }
          : {}),
      })
    );
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const publicError = publicOtpError(code, "send");
    if (!code.startsWith("OTP_RATE_LIMIT:") && !code.startsWith("EMAIL_DELIVERY_FAILED:")) {
      console.error("Error in /api/auth/send-code:", error);
    }
    return applyNoStoreHeaders(
      NextResponse.json(
        { success: false, message: publicError.message },
        { status: publicError.status }
      )
    );
  }
}
