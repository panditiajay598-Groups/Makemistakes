import { NextResponse } from "next/server";
import { OTPService } from "@backend/services/otp.service";

export async function POST(req: Request) {
  try {
    const { email, otp, redirectTo } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, verified: false, message: "Email and OTP are required." },
        { status: 400 }
      );
    }

    const result = await OTPService.verifyOTP(email, otp);

    return NextResponse.json({
      success: true,
      verified: result.verified,
      ...(redirectTo ? { redirectTo } : {}),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        verified: false,
        message: error.message || "OTP verification failed.",
      },
      { status: 400 }
    );
  }
}
