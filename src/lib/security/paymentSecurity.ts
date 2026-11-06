import crypto from "crypto";

export type PaymentOrderSnapshot = {
  amount: number;
  currency: string;
  gatewayOrderId: string | null;
};

export type GatewayPaymentSnapshot = {
  id: string;
  order_id: string;
  status: string;
  amount: number;
  currency: string;
};

export function sandboxPaymentsEnabled(
  env: { NODE_ENV?: string; PAYMENT_SANDBOX_ENABLED?: string }
): boolean {
  return env.NODE_ENV !== "production" && env.PAYMENT_SANDBOX_ENABLED === "true";
}

export function constantTimeHexMatch(actual: string, expected: string): boolean {
  if (!/^[\da-f]+$/i.test(actual) || actual.length !== expected.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(actual, "hex"), Buffer.from(expected, "hex"));
}

export function isCapturedPaymentValid(
  order: PaymentOrderSnapshot,
  payment: GatewayPaymentSnapshot,
  expectedPaymentId?: string
): boolean {
  return Boolean(
    order.gatewayOrderId &&
      payment.id &&
      (!expectedPaymentId || payment.id === expectedPaymentId) &&
      payment.order_id === order.gatewayOrderId &&
      payment.status === "captured" &&
      Number.isInteger(payment.amount) &&
      payment.amount === order.amount &&
      payment.currency === order.currency
  );
}

export async function activateCapturedPayment<T>(
  order: PaymentOrderSnapshot,
  payment: GatewayPaymentSnapshot,
  expectedPaymentId: string,
  activate: () => Promise<T>
): Promise<T> {
  if (!isCapturedPaymentValid(order, payment, expectedPaymentId)) {
    throw new Error("PAYMENT_UNVERIFIED: Payment capture does not match the stored order.");
  }
  return activate();
}

export async function activatePaymentOnce<T, U>(
  claim: () => Promise<boolean>,
  grant: () => Promise<T>,
  alreadyProcessed: () => Promise<U>
): Promise<T | U> {
  if (!(await claim())) {
    return alreadyProcessed();
  }
  return grant();
}

export function isWebhookSignatureValid(
  rawBody: string,
  actualSignature: string,
  secret: string
): boolean {
  if (!secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return constantTimeHexMatch(actualSignature, expected);
}
