import { NextResponse } from "next/server";
import { PaymentService } from "@/lib/paymentService";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature =
      req.headers.get("x-razorpay-signature") ||
      req.headers.get("x-signature") ||
      "";

    if (!signature) {
      return NextResponse.json(
        { success: false, error: "Missing webhook signature header" },
        { status: 400 }
      );
    }

    const result = await PaymentService.processWebhook({ rawBody, signature });
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[Webhook Error]:", err);
    const status = err.message?.includes("INVALID_WEBHOOK_SIGNATURE") ? 400 : 500;
    return NextResponse.json(
      { success: false, error: err.message || "Webhook processing error" },
      { status }
    );
  }
}
