import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/authSession";
import { PaymentService } from "@/lib/paymentService";
import { authenticatedSubscriptionUserId } from "@/lib/security/subscriptionSecurity";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const session = await getAuthSession(req);
    const userId = authenticatedSubscriptionUserId(session);
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const subscriptionData = await PaymentService.getAccountSubscription(userId);

    return NextResponse.json({
      authenticated: true,
      ...subscriptionData,
    });
  } catch (err: any) {
    console.error("[Subscription Status Error]:", err);
    return NextResponse.json(
      { error: "Failed to fetch subscription status" },
      { status: 500 }
    );
  }
}
