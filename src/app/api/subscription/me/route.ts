import { NextResponse } from "next/server";
import { getAuthSession, resolveOrCreateUser } from "@/lib/authSession";
import { PaymentService } from "@/lib/paymentService";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const session = await getAuthSession(req);
    let userId: string | null = session?.userId || null;

    // Optional legacy fallback if query has user email and user is already verified
    if (!userId) {
      const { searchParams } = new URL(req.url);
      const email = searchParams.get("email");
      if (email && /\S+@\S+\.\S+/.test(email)) {
        const user = await resolveOrCreateUser(email);
        userId = user.id;
      }
    }

    if (!userId) {
      return NextResponse.json({
        plan: "FREE",
        status: "ACTIVE",
        isPaid: false,
        authenticated: false,
        credits: { total: 100, used: 0, remaining: 100 },
        orders: [],
      });
    }

    const subscriptionData = await PaymentService.getAccountSubscription(userId);

    return NextResponse.json({
      authenticated: true,
      userId,
      email: session?.email,
      ...subscriptionData,
    });
  } catch (err: any) {
    console.error("[Subscription Status Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch subscription status" },
      { status: 500 }
    );
  }
}
