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
          message: "You must be logged in to an authenticated MakeMistakes account to purchase a plan.",
        },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { planId, billingName, billingPhone } = body;

    if (!planId) {
      return NextResponse.json(
        { success: false, error: "BAD_REQUEST", message: "Plan ID is required (PRO or MAX)." },
        { status: 400 }
      );
    }

    const orderData = await PaymentService.createOrder({
      session,
      planId,
      billingName,
      billingPhone,
    });

    return NextResponse.json({
      success: true,
      order: orderData,
    });
  } catch (err: unknown) {
    const code = err instanceof Error ? err.message : "";
    if (code.startsWith("PAYMENT_UNAVAILABLE:")) {
      console.error("[Create Order Error]: Payment gateway is unavailable.");
    } else {
      console.error("[Create Order Error]:", err);
    }
    const status = code.includes("UNAUTHORIZED")
      ? 401
      : code.includes("INVALID_PLAN")
      ? 400
      : code.includes("PAYMENT_UNAVAILABLE")
      ? 503
      : 500;

    return NextResponse.json(
      {
        success: false,
        error: code.includes("INVALID_PLAN")
          ? "Invalid subscription plan."
          : "Unable to create a payment order.",
      },
      { status }
    );
  }
}
