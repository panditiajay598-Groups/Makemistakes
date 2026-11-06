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
  } catch (err: unknown) {
    const code = err instanceof Error ? err.message : "";
    console.error("[Webhook Error]:", code.split(":")[0] || "UNKNOWN");
    const status = code.includes("INVALID_WEBHOOK_SIGNATURE") || code.includes("INVALID_WEBHOOK")
      ? 400
      : code.includes("PAYMENT_UNAVAILABLE")
      ? 503
      : 500;
    return NextResponse.json(
      { success: false, error: "Webhook processing failed" },
      { status }
    );
  }
}
