import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/authSession";
import { PaymentService } from "@/lib/paymentService";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession(req);

    if (!session || !session.userId) {
      return NextResponse.json(
        {
          success: false,
          error: "UNAUTHORIZED",
          message: "You must be logged in to verify a payment.",
        },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { orderId, gatewayPaymentId, gatewaySignature, idempotencyKey } = body;

    if (!orderId || !gatewayPaymentId || !gatewaySignature) {
      return NextResponse.json(
        {
          success: false,
          error: "BAD_REQUEST",
          message: "orderId, gatewayPaymentId, and gatewaySignature are required.",
        },
        { status: 400 }
      );
    }

    const result = await PaymentService.verifyPayment({
      session,
      orderId,
      gatewayPaymentId,
      gatewaySignature,
      idempotencyKey,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const code = err instanceof Error ? err.message : "";
    console.error("[Verify Payment Error]:", code.split(":")[0] || "UNKNOWN");
    const status = code.includes("UNAUTHORIZED")
        ? 401
        : code.includes("FORBIDDEN")
        ? 403
        : code.includes("INVALID_SIGNATURE") ||
          code.includes("INVALID_PAYMENT") ||
          code.includes("SANDBOX_DISABLED") ||
          code.includes("BAD_REQUEST")
        ? 400
        : code.includes("ORDER_NOT_FOUND")
        ? 404
        : code.includes("PAYMENT_UNAVAILABLE")
        ? 503
        : code.includes("PAYMENT_UNVERIFIED")
        ? 402
        : 500;

    return NextResponse.json(
      {
        success: false,
        error: code.includes("PAYMENT_UNVERIFIED")
          ? "Payment has not been confirmed as captured."
          : "Payment verification failed.",
      },
      { status }
    );
  }
}
