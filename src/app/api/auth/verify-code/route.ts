import { NextResponse } from "next/server";
import { verifyCode } from "@/lib/codeStore";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { success: false, message: "Email and 6-digit verification code are required." },
        { status: 400 }
      );
    }

    const result = verifyCode(email, code);

    if (!result.valid) {
      return NextResponse.json(
        { success: false, message: result.reason || "Invalid verification code." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Account verified successfully!",
    });
  } catch (error: any) {
    console.error("Error in /api/auth/verify-code:", error);
    return NextResponse.json(
      { success: false, message: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}
