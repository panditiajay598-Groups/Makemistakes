import crypto from "crypto";
import { prisma } from "@backend/lib/prisma";
import { getPlanConfig, PlanTier, PLANS } from "./plans";
import { SessionPayload } from "./authSession";
import {
  activateCapturedPayment,
  constantTimeHexMatch,
  isWebhookSignatureValid,
  sandboxPaymentsEnabled,
  activatePaymentOnce,
} from "./security/paymentSecurity";
import {
  deductCreditsAtomically,
  type CreditStore,
  type DeductOptions,
  type CreditStoreBalance,
} from "./security/creditDeduction";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "";

export interface CreateOrderParams {
  session: SessionPayload;
  planId: string;
  billingName?: string;
  billingPhone?: string;
}

export interface VerifyPaymentParams {
  session: SessionPayload;
  orderId: string;
  gatewayPaymentId: string;
  gatewaySignature: string;
  idempotencyKey?: string;
}

export interface WebhookParams {
  rawBody: string;
  signature: string;
}

export class PaymentService {
  /**
   * Generates a deterministic sandbox signature for automated testing / sandbox mode
   */
  public static generateSandboxSignature(orderId: string, paymentId: string): string {
    if (!sandboxPaymentsEnabled(process.env)) {
      throw new Error("SANDBOX_DISABLED: Sandbox payments are unavailable.");
    }
    const secret = process.env.PAYMENT_SANDBOX_SECRET;
    if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
      throw new Error("PAYMENT_UNAVAILABLE: A dedicated sandbox secret is required.");
    }
    return crypto
      .createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");
  }

  /**
   * 1. CREATE PAYMENT ORDER
   * Resolves internal account ID from trusted server session.
   * Resolves verified email from server record.
   * Determines authoritative price and currency on the server.
   */
  public static async createOrder({ session, planId }: CreateOrderParams) {
    if (!session || !session.userId) {
      throw new Error("UNAUTHORIZED: Valid session required to create payment order.");
    }

    // Verify user exists in database and get authoritative record
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      throw new Error("ACCOUNT_NOT_FOUND: Authenticated user record does not exist.");
    }

    // Validate selected plan against server-controlled config
    const planConfig = getPlanConfig(planId);
    if (!planConfig || planConfig.id === "FREE") {
      throw new Error("INVALID_PLAN: You can only purchase paid tiers (PRO or MAX).");
    }

    // Server-authoritative amount & currency
    const amount = planConfig.amountInPaise;
    const currency = planConfig.currency;
    const orderId = `ord_mm_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const isRazorpayConfigured = Boolean(
      RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET && !RAZORPAY_KEY_ID.includes("your-")
    );
    const useSandbox = !isRazorpayConfigured && sandboxPaymentsEnabled(process.env);
    if (!isRazorpayConfigured && !useSandbox) {
      throw new Error("PAYMENT_UNAVAILABLE: Razorpay is not configured.");
    }

    let gatewayOrderId = orderId;
    const gatewayType = useSandbox ? "SANDBOX" : "RAZORPAY";

    if (isRazorpayConfigured) {
      const authHeader = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");
      const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${authHeader}`,
        },
        body: JSON.stringify({
          amount,
          currency,
          receipt: orderId,
          notes: {
            internalUserId: user.id,
            internalUserEmail: user.email,
            plan: planConfig.id,
          },
        }),
      });

      const rzpData = rzpRes.ok ? await rzpRes.json() : null;
      if (
        !rzpRes.ok ||
        typeof rzpData?.id !== "string" ||
        rzpData.amount !== amount ||
        rzpData.currency !== currency
      ) {
        console.error("[Razorpay] Order creation failed:", rzpRes.status);
        throw new Error("PAYMENT_UNAVAILABLE: Unable to create a Razorpay order.");
      }
      gatewayOrderId = rzpData.id;
    }

    // Persist PaymentOrder in Database bound to user.id and user.email
    const paymentOrder = await prisma.paymentOrder.create({
      data: {
        orderId,
        userId: user.id,
        userEmail: user.email,
        plan: planConfig.id,
        amount,
        currency,
        status: "CREATED",
        gateway: gatewayType,
        gatewayOrderId,
      },
    });

    const sandboxPaymentId = gatewayType === "SANDBOX" ? `pay_sandbox_${crypto.randomBytes(16).toString("hex")}` : undefined;
    const sandboxSignature = gatewayType === "SANDBOX" && sandboxPaymentId
      ? this.generateSandboxSignature(gatewayOrderId, sandboxPaymentId)
      : undefined;

    return {
      orderId: paymentOrder.orderId,
      gatewayOrderId,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
      plan: planConfig.id,
      planName: planConfig.name,
      userEmail: user.email,
      userName: user.name || user.email.split("@")[0],
      gateway: gatewayType,
      keyId: isRazorpayConfigured ? RAZORPAY_KEY_ID : undefined,
      ...(gatewayType === "SANDBOX" ? { sandboxPaymentId, sandboxSignature } : {}),
    };
  }

  /**
   * 2. SECURE PAYMENT VERIFICATION & IDEMPOTENT ACTIVATION
   * Validates signature, amount, currency, account binding, and status.
   */
  public static async verifyPayment({
    session,
    orderId,
    gatewayPaymentId,
    gatewaySignature,
  }: VerifyPaymentParams) {
    if (!session || !session.userId) {
      throw new Error("UNAUTHORIZED: Session required for payment verification.");
    }

    if (!orderId || !gatewayPaymentId || !gatewaySignature) {
      throw new Error("BAD_REQUEST: orderId, gatewayPaymentId, and gatewaySignature are required.");
    }

    // Fetch the order from the database
    const order = await prisma.paymentOrder.findUnique({
      where: { orderId },
    });

    if (!order) {
      throw new Error("ORDER_NOT_FOUND: Payment order does not exist.");
    }

    // STRICT USER ISOLATION: Order must belong to authenticated account ID
    if (order.userId !== session.userId) {
      throw new Error("FORBIDDEN: You cannot verify or claim a payment order that belongs to another account.");
    }

    // IDEMPOTENCY: If already activated, return safe idempotent response
    if (order.status === "PAID") {
      const existingSub = await prisma.subscription.findUnique({
        where: { userId: session.userId },
      });
      const credits = await prisma.aiCreditBalance.findUnique({
        where: { userId: session.userId },
      });

      return {
        success: true,
        alreadyProcessed: true,
        plan: order.plan,
        status: "ACTIVE",
        subscription: existingSub,
        credits: credits?.remainingCredits || 0,
        message: "Payment was previously verified and entitlement is active.",
      };
    }

    // Only CREATED orders can be verified
    if (order.status !== "CREATED") {
      throw new Error(`INVALID_STATUS: Order cannot be verified in '${order.status}' status.`);
    }

    const planConfig = getPlanConfig(order.plan);
    if (!planConfig) {
      throw new Error("INVALID_PLAN: Plan configuration not found.");
    }
    if (order.amount !== planConfig.amountInPaise || order.currency !== planConfig.currency) {
      throw new Error("INVALID_PAYMENT: Stored order amount or currency does not match the plan.");
    }

    if (order.gateway === "SANDBOX") {
      if (!sandboxPaymentsEnabled(process.env)) {
        throw new Error("SANDBOX_DISABLED: Sandbox payment orders cannot be verified in this environment.");
      }
      const expected = this.generateSandboxSignature(order.gatewayOrderId || "", gatewayPaymentId);
      if (!constantTimeHexMatch(gatewaySignature, expected)) {
        throw new Error("INVALID_SIGNATURE: Payment signature verification failed.");
      }
      return this.activateVerifiedOrder(order, gatewayPaymentId, gatewaySignature);
    }

    if (order.gateway !== "RAZORPAY" || !order.gatewayOrderId || !RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      throw new Error("PAYMENT_UNAVAILABLE: A valid Razorpay order is required.");
    }

    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(`${order.gatewayOrderId}|${gatewayPaymentId}`)
      .digest("hex");
    if (!constantTimeHexMatch(gatewaySignature, expectedSignature)) {
      throw new Error("INVALID_SIGNATURE: Payment signature verification failed.");
    }

    const paymentResponse = await fetch(
      `https://api.razorpay.com/v1/payments/${encodeURIComponent(gatewayPaymentId)}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64")}`,
        },
      }
    );
    if (!paymentResponse.ok) {
      throw new Error("PAYMENT_UNVERIFIED: Razorpay could not confirm the payment.");
    }
    const payment = await paymentResponse.json();
    return activateCapturedPayment(order, payment, gatewayPaymentId, () =>
      this.activateVerifiedOrder(order, gatewayPaymentId, gatewaySignature)
    );
  }

  private static async activateVerifiedOrder(
    order: { id: string; userId: string; orderId: string; plan: string },
    gatewayPaymentId: string,
    gatewaySignature?: string
  ) {
    const planConfig = getPlanConfig(order.plan);
    if (!planConfig || planConfig.id === "FREE") {
      throw new Error("INVALID_PLAN: Plan configuration not found.");
    }
    const now = new Date();
    const expiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const creditsToGrant = planConfig.aiCreditsPerMonth;

    return prisma.$transaction(async (transaction) =>
      activatePaymentOnce(
        async () => {
          const update = await transaction.paymentOrder.updateMany({
            where: { id: order.id, status: "CREATED" },
            data: {
              status: "PAID",
              gatewayPaymentId,
              gatewaySignature,
              idempotencyKey: gatewayPaymentId,
              activatedAt: now,
            },
          });
          return update.count === 1;
        },
        async () => {
          const subscription = await transaction.subscription.upsert({
            where: { userId: order.userId },
            create: {
              userId: order.userId,
              plan: order.plan,
              status: "ACTIVE",
              startDate: now,
              expiryDate,
              orderId: order.orderId,
              gatewayPaymentId,
            },
            update: {
              plan: order.plan,
              status: "ACTIVE",
              startDate: now,
              expiryDate,
              orderId: order.orderId,
              gatewayPaymentId,
            },
          });
          const balance = await transaction.aiCreditBalance.upsert({
            where: { userId: order.userId },
            create: {
              userId: order.userId,
              totalCredits: creditsToGrant,
              usedCredits: 0,
              remainingCredits: creditsToGrant,
            },
            update: {
              totalCredits: { increment: creditsToGrant },
              remainingCredits: { increment: creditsToGrant },
            },
          });
          await transaction.aiCreditTransaction.create({
            data: {
              userId: order.userId,
              amount: creditsToGrant,
              type: "PURCHASE_GRANT",
              referenceId: order.orderId,
              balanceAfter: balance.remainingCredits,
            },
          });
          return {
            success: true,
            activated: true,
            alreadyProcessed: false,
            plan: order.plan,
            planName: planConfig.name,
            status: "ACTIVE",
            expiryDate,
            creditsGranted: creditsToGrant,
            totalRemainingCredits: balance.remainingCredits,
            subscription,
          };
        },
        async () => {
        const existing = await transaction.paymentOrder.findUnique({ where: { id: order.id } });
        if (existing?.status === "PAID" && existing.gatewayPaymentId === gatewayPaymentId) {
          return {
            success: true,
            alreadyProcessed: true,
            plan: order.plan,
            status: "ACTIVE",
          };
        }
        throw new Error("PAYMENT_ALREADY_PROCESSED: Order is no longer payable.");
        }
      )
    );
  }

  /**
   * 3. WEBHOOK PROCESSOR (IDEMPOTENT)
   */
  public static async processWebhook({ rawBody, signature }: WebhookParams) {
    if (!rawBody || !signature) {
      throw new Error("Missing rawBody or signature for webhook");
    }
    if (!RAZORPAY_WEBHOOK_SECRET) {
      throw new Error("PAYMENT_UNAVAILABLE: Razorpay webhook secret is not configured.");
    }

    if (!isWebhookSignatureValid(rawBody, signature, RAZORPAY_WEBHOOK_SECRET)) {
      throw new Error("INVALID_WEBHOOK_SIGNATURE");
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;

    if (eventType === "order.paid" || eventType === "payment.captured") {
      const paymentEntity = event.payload?.payment?.entity;
      if (
        !paymentEntity ||
        typeof paymentEntity.id !== "string" ||
        typeof paymentEntity.order_id !== "string"
      ) {
        throw new Error("INVALID_WEBHOOK: Captured payment details are missing.");
      }

      const order = await prisma.paymentOrder.findFirst({
        where: {
          gatewayOrderId: paymentEntity.order_id,
        },
      });

      if (!order) {
        return { success: true, message: "Order not found in database" };
      }
      if (order.gateway !== "RAZORPAY") {
        throw new Error("INVALID_WEBHOOK: Captured payment does not match the stored order.");
      }

      return activateCapturedPayment(order, paymentEntity, paymentEntity.id, () =>
        this.activateVerifiedOrder(order, paymentEntity.id, signature)
      );
    }

    if (eventType === "refund.processed") {
      const refundEntity = event.payload?.refund?.entity;
      const paymentEntity = event.payload?.payment?.entity;
      const gatewayPaymentId = refundEntity?.payment_id || paymentEntity?.id;

      if (gatewayPaymentId) {
        const order = await prisma.paymentOrder.findUnique({
          where: { gatewayPaymentId },
        });

        if (order && order.gateway === "RAZORPAY" && order.status === "PAID") {
          await prisma.$transaction(async (transaction) => {
            const updated = await transaction.paymentOrder.updateMany({
              where: { id: order.id, status: "PAID", gatewayPaymentId },
              data: { status: "REFUNDED" },
            });
            if (updated.count !== 1) return;
            await transaction.subscription.updateMany({
              where: { userId: order.userId, orderId: order.orderId },
              data: { plan: "FREE", status: "REFUNDED" },
            });
            const [purchaseGrant, balance] = await Promise.all([
              transaction.aiCreditTransaction.findFirst({
                where: { userId: order.userId, referenceId: order.orderId, type: "PURCHASE_GRANT" },
              }),
              transaction.aiCreditBalance.findUnique({ where: { userId: order.userId } }),
            ]);
            const creditsToRevoke = Math.min(
              purchaseGrant?.amount || 0,
              balance?.remainingCredits || 0
            );
            let balanceAfter = balance?.remainingCredits || 0;
            if (creditsToRevoke > 0) {
              const balanceUpdate = await transaction.aiCreditBalance.updateMany({
                where: {
                  userId: order.userId,
                  remainingCredits: { gte: creditsToRevoke },
                },
                data: { remainingCredits: { decrement: creditsToRevoke } },
              });
              if (balanceUpdate.count !== 1) {
                throw new Error("REFUND_RETRY: Credit balance changed during refund processing.");
              }
              balanceAfter -= creditsToRevoke;
            }
            await transaction.aiCreditTransaction.create({
              data: {
                userId: order.userId,
                amount: -creditsToRevoke,
                type: "REFUND_DEDUCT",
                referenceId: order.orderId,
                balanceAfter,
              },
            });
          });
        }
      }

      return { success: true, message: "Refund processed and access updated" };
    }

    return { success: true, message: `Ignored unhandled event: ${eventType}` };
  }

  /**
   * 4. AUTHORITATIVE SUBSCRIPTION STATUS RESOLUTION
   * Evaluates active status, expiration, and credit balance.
   */
  public static async getAccountSubscription(userId: string) {
    if (!userId) {
      return {
        plan: "FREE",
        status: "ACTIVE",
        isPaid: false,
        config: PLANS.FREE,
        credits: { total: 100, used: 0, remaining: 100 },
        orders: [],
      };
    }

    const [sub, creditBalance, orders] = await Promise.all([
      prisma.subscription.findUnique({ where: { userId } }),
      prisma.aiCreditBalance.findUnique({ where: { userId } }),
      prisma.paymentOrder.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    const now = new Date();
    let currentPlan: PlanTier = (sub?.plan as PlanTier) || "FREE";
    let status = sub?.status || "ACTIVE";

    // Enforce Expiration: if expiryDate has passed and status is ACTIVE
    if (sub && sub.expiryDate && now > new Date(sub.expiryDate) && sub.status === "ACTIVE") {
      status = "EXPIRED";
      currentPlan = "FREE";

      // Mark expired in database
      await prisma.subscription.update({
        where: { userId },
        data: { status: "EXPIRED" },
      });
    }

    const planConfig = PLANS[currentPlan] || PLANS.FREE;

    return {
      plan: currentPlan,
      status,
      isPaid: currentPlan !== "FREE" && status === "ACTIVE",
      startDate: sub?.startDate || null,
      expiryDate: sub?.expiryDate || null,
      config: planConfig,
      credits: {
        total: creditBalance?.totalCredits ?? 100,
        used: creditBalance?.usedCredits ?? 0,
        remaining: creditBalance?.remainingCredits ?? 100,
      },
      orders: orders.map((o) => ({
        orderId: o.orderId,
        plan: o.plan,
        amount: o.amount,
        currency: o.currency,
        status: o.status,
        createdAt: o.createdAt,
      })),
    };
  }

  /**
   * 5. ATOMIC AI CREDIT DEDUCTION
   * Ensures user balance cannot be overspent under concurrency and handles transient retries.
   */
  public static async deductAiCredit(
    userId: string,
    cost: number = 1,
    reference: string = "nova_query",
    options?: DeductOptions
  ) {
    const store: CreditStore = {
      async decrementIfSufficient(uid: string, c: number): Promise<boolean> {
        const update = await prisma.aiCreditBalance.updateMany({
          where: {
            userId: uid,
            remainingCredits: { gte: c },
          },
          data: {
            usedCredits: { increment: c },
            remainingCredits: { decrement: c },
          },
        });
        return update.count === 1;
      },

      async getBalance(uid: string): Promise<CreditStoreBalance | null> {
        const record = await prisma.aiCreditBalance.findUnique({
          where: { userId: uid },
          select: {
            remainingCredits: true,
            totalCredits: true,
            usedCredits: true,
          },
        });
        return record;
      },

      async initializeBalanceIfMissing(uid: string, defaultCredits: number = 100): Promise<boolean> {
        try {
          await prisma.aiCreditBalance.create({
            data: {
              userId: uid,
              totalCredits: defaultCredits,
              usedCredits: 0,
              remainingCredits: defaultCredits,
            },
          });
          return true;
        } catch (err: any) {
          if (err?.code === "P2002") {
            return true;
          }
          throw err;
        }
      },

      async recordTransaction(
        uid: string,
        amount: number,
        type: string,
        referenceId: string,
        balanceAfter: number
      ): Promise<void> {
        await prisma.aiCreditTransaction.create({
          data: {
            userId: uid,
            amount,
            type,
            referenceId,
            balanceAfter,
          },
        });
      },
    };

    return deductCreditsAtomically(store, userId, cost, reference, options);
  }
}
