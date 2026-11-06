import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { EmailService } from "./email.service";
import {
  consumeOtpOnce,
  invalidateOtpAfterDeliveryFailure,
  isOtpExpired,
  otpAttemptAllowed,
} from "../../src/lib/security/otpSecurity";

export class OTPService {
  /**
   * Generates a cryptographically secure 6-digit OTP using crypto.randomInt
   */
  public static generateOTP(): string {
    return crypto.randomInt(100000, 1000000).toString();
  }

  /**
   * Validates email format using standard regex
   */
  private static isValidEmail(email: string): boolean {
    return typeof email === "string" && /\S+@\S+\.\S+/.test(email.trim());
  }

  /**
   * Sends or generates a new OTP for the specified email with rate limiting & security checks
   */
  /**
   * Sends or generates a new OTP for the specified email with rate limiting & security checks
   */
  public static async sendOTP(
    emailInput: string,
    redirectTo?: string
  ): Promise<{ success: boolean; message: string; previewUrl?: string; devOtp?: string }> {
    const email = typeof emailInput === "string" ? emailInput.trim().toLowerCase() : "";

    if (!this.isValidEmail(email)) {
      throw new Error("Invalid email format.");
    }

    const now = new Date();
    const existingRecord = await prisma.emailVerification.findUnique({ where: { email } });
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const cooldownBoundary = new Date(now.getTime() - 60 * 1000);
    if (existingRecord && existingRecord.lastSentAt > cooldownBoundary) {
      throw new Error("OTP_RATE_LIMIT: Please wait before requesting another verification code.");
    }
    if (
      existingRecord &&
      existingRecord.windowStart > oneHourAgo &&
      existingRecord.hourlyCount >= 5
    ) {
      throw new Error("OTP_RATE_LIMIT: Too many verification code requests. Try again later.");
    }

    const plainOTP = this.generateOTP();
    const otpHash = await bcrypt.hash(plainOTP, 10);
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);
    const windowStart = existingRecord && existingRecord.windowStart > oneHourAgo
      ? existingRecord.windowStart
      : now;
    const hourlyCount = existingRecord && existingRecord.windowStart > oneHourAgo
      ? existingRecord.hourlyCount + 1
      : 1;

    try {
      if (!existingRecord) {
        await prisma.emailVerification.create({
          data: {
            email,
            otpHash,
            expiresAt,
            attempts: 0,
            verified: false,
            lastSentAt: now,
            hourlyCount,
            windowStart,
          },
        });
      } else {
        const updated = await prisma.emailVerification.updateMany({
          where: {
            email,
            otpHash: existingRecord.otpHash,
            lastSentAt: { lte: cooldownBoundary },
            ...(existingRecord.windowStart > oneHourAgo
              ? { hourlyCount: { lt: 5 }, windowStart: existingRecord.windowStart }
              : { windowStart: { lte: oneHourAgo } }),
          },
          data: {
            otpHash,
            expiresAt,
            attempts: 0,
            verified: false,
            lastSentAt: now,
            hourlyCount,
            windowStart,
          },
        });
        if (updated.count !== 1) {
          throw new Error("OTP_RATE_LIMIT: Another verification request was processed. Please wait before retrying.");
        }
      }
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "P2002"
      ) {
        throw new Error("OTP_RATE_LIMIT: Another verification request was processed. Please wait before retrying.");
      }
      throw error;
    }

    let mailResult: { success: boolean; previewUrl?: string };
    try {
      mailResult = await EmailService.sendVerificationOTP(email, plainOTP, redirectTo);
    } catch {
      const invalidated = await invalidateOtpAfterDeliveryFailure(
        () =>
          prisma.emailVerification.updateMany({
            where: { email, otpHash },
            data: { attempts: 5, expiresAt: now },
          }),
        () => prisma.emailVerification.deleteMany({ where: { email, otpHash } })
      );
      if (!invalidated) {
        console.error("Could not invalidate OTP after email delivery failure.");
      }
      throw new Error("EMAIL_DELIVERY_FAILED: Verification email could not be delivered.");
    }

    return {
      success: true,
      message: `Verification code sent to ${email}.`,
      previewUrl: process.env.NODE_ENV === "development" ? mailResult.previewUrl : undefined,
      devOtp: process.env.NODE_ENV === "development" ? plainOTP : undefined,
    };
  }

  /**
   * Resends OTP enforcing the 60-second cooldown period
   */
  public static async resendOTP(
    emailInput: string,
    redirectTo?: string
  ): Promise<{ success: boolean; message: string; previewUrl?: string; devOtp?: string }> {
    return this.sendOTP(emailInput, redirectTo);
  }

  /**
   * Verifies the 6-digit OTP submitted by the user
   */
  public static async verifyOTP(
    emailInput: string,
    otpInput: string
  ): Promise<{ success: boolean; verified: boolean; message?: string }> {
    const email = typeof emailInput === "string" ? emailInput.trim().toLowerCase() : "";
    const otp = otpInput ? otpInput.trim() : "";

    if (!this.isValidEmail(email)) {
      throw new Error("Invalid email format.");
    }

    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      throw new Error("OTP must be exactly 6 numeric digits.");
    }

    const record = await prisma.emailVerification.findUnique({
      where: { email },
    });

    if (!record) {
      throw new Error("Invalid or expired verification code. Please request a new code.");
    }

    const now = new Date();

    // Check expiration (10 min)
    if (isOtpExpired(record.expiresAt, now.getTime())) {
      await prisma.emailVerification.deleteMany({
        where: { email, otpHash: record.otpHash },
      });
      throw new Error("Invalid or expired verification code. Please request a new code.");
    }

    const attempt = await prisma.emailVerification.updateMany({
      where: {
        email,
        otpHash: record.otpHash,
        expiresAt: { gt: now },
        attempts: { lt: 5 },
      },
      data: { attempts: { increment: 1 } },
    });
    if (attempt.count !== 1) {
      throw new Error("Maximum verification attempts exceeded. Please request a new code.");
    }

    const isMatch = await bcrypt.compare(otp, record.otpHash);

    if (!isMatch) {
      const remainingAttempts = Math.max(0, 4 - record.attempts);
      throw new Error(
        remainingAttempts > 0
          ? `Invalid verification code. ${remainingAttempts} attempt(s) remaining.`
          : "Maximum verification attempts exceeded. Please request a new code."
      );
    }

    // Valid OTP: Delete OTP record securely from database (prevents replay attacks)
    const consumed = await consumeOtpOnce(() =>
      prisma.emailVerification.deleteMany({
        where: { email, otpHash: record.otpHash, expiresAt: { gt: new Date() } },
      })
    );
    if (!consumed || !otpAttemptAllowed(record.attempts)) {
      return {
        success: false,
        verified: false,
        message: "Invalid or expired verification code. Please request a new code.",
      };
    }

    return {
      success: true,
      verified: true,
    };
  }
}
