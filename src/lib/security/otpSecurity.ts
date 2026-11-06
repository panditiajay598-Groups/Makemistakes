export function isOtpExpired(expiresAt: Date | number, now = Date.now()): boolean {
  return now >= new Date(expiresAt).getTime();
}

export function canUseDevelopmentEmailPreview(
  env: Pick<NodeJS.ProcessEnv, "NODE_ENV">
): boolean {
  return env.NODE_ENV === "development";
}

export function otpAttemptAllowed(attempts: number, maximum = 5): boolean {
  return attempts < maximum;
}

export async function consumeOtpOnce(
  consumeMatchingCode: () => Promise<{ count: number }>
): Promise<boolean> {
  const result = await consumeMatchingCode();
  return result.count === 1;
}

export async function invalidateOtpAfterDeliveryFailure(
  expireCurrentOtp: () => Promise<{ count: number }>,
  deleteCurrentOtp: () => Promise<{ count: number }>
): Promise<boolean> {
  try {
    if ((await expireCurrentOtp()).count === 1) return true;
  } catch {
    // Delete is the fallback if the record could not be marked expired.
  }
  try {
    return (await deleteCurrentOtp()).count === 1;
  } catch {
    return false;
  }
}

export function otpSuccessPayload(
  result: { previewUrl?: string; devOtp?: string },
  env: Pick<NodeJS.ProcessEnv, "NODE_ENV">,
  mode: string
) {
  const payload: {
    success: true;
    mode: string;
    message: string;
    previewUrl?: string;
    devOtp?: string;
  } = {
    success: true,
    mode: env.NODE_ENV === "development" ? mode : "email",
    message: "Verification email sent.",
  };
  if (env.NODE_ENV === "development") {
    if (result.previewUrl) payload.previewUrl = result.previewUrl;
    if (result.devOtp) payload.devOtp = result.devOtp;
  }
  return payload;
}

export function publicOtpError(message: string, operation: "send" | "verify") {
  if (message.startsWith("OTP_RATE_LIMIT:") || message.includes("Maximum verification attempts")) {
    return { status: 429, message: "Too many verification attempts. Please wait and try again." };
  }
  if (message.startsWith("EMAIL_DELIVERY_FAILED:") && operation === "send") {
    return { status: 503, message: "Unable to send a verification email. Please try again later." };
  }
  if (
    message.includes("Invalid email format") ||
    message.includes("OTP must be exactly") ||
    message.includes("Invalid or expired verification code") ||
    message.includes("Invalid verification code")
  ) {
    return {
      status: 400,
      message: operation === "send"
        ? "Unable to process the verification request."
        : "Invalid or expired verification code. Please request a new code.",
    };
  }
  return {
    status: 500,
    message: operation === "send"
      ? "Unable to process the verification request."
      : "Unable to verify the code. Please try again later.",
  };
}
