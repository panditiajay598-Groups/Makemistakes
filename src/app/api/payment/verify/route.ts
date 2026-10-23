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
  } catch (err: any) {
    console.error("[Verify Payment Error]:", err);
    const status =
      err.message?.includes("UNAUTHORIZED")
        ? 401
        : err.message?.includes("FORBIDDEN")
        ? 403
        : err.message?.includes("INVALID_SIGNATURE") || err.message?.includes("BAD_REQUEST")
        ? 400
        : err.message?.includes("ORDER_NOT_FOUND")
        ? 404
        : 500;

    return NextResponse.json(
      {
        success: false,
        error: err.message || "Payment verification failed.",
      },
      { status }
    );
  }
}
