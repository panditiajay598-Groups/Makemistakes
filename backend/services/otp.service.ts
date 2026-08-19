import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { EmailService } from "./email.service";

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
    redirectTo?: string,
    isResend: boolean = false
  ): Promise<{ success: boolean; message: string; previewUrl?: string; devOtp?: string }> {
    const email = emailInput.trim().toLowerCase();

    if (!this.isValidEmail(email)) {
      throw new Error("Invalid email format.");
    }

    const existingRecord = await prisma.emailVerification.findUnique({
      where: { email },
    });

    const now = new Date();

    // Enforce 60-second cooldown rate limit only on explicit resend requests
    if (isResend && existingRecord && now.getTime() - new Date(existingRecord.lastSentAt).getTime() < 60000) {
      const waitSeconds = Math.ceil(
        (60000 - (now.getTime() - new Date(existingRecord.lastSentAt).getTime())) / 1000
      );
      throw new Error(`Please wait ${waitSeconds} seconds before requesting a new OTP.`);
    }

    // Check rate limit: Max 5 requests per hour (50 in development)
    const isDev = process.env.NODE_ENV === "development";
    const maxHourly = isDev ? 50 : 5;
    let hourlyCount = 1;
    let windowStart = now;

    if (existingRecord) {
      const hoursPassed = (now.getTime() - new Date(existingRecord.windowStart).getTime()) / (1000 * 60 * 60);

      if (hoursPassed < 1) {
        if (existingRecord.hourlyCount >= maxHourly) {
          throw new Error(`Too many OTP requests. Maximum ${maxHourly} requests per hour.`);
        }
        hourlyCount = existingRecord.hourlyCount + 1;
        windowStart = existingRecord.windowStart;
      }
    }

    // Generate 6-digit OTP & Hash with bcrypt
    const plainOTP = this.generateOTP();
    const otpHash = await bcrypt.hash(plainOTP, 10);
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes expiration

    // Save hashed OTP securely in DB (resets verified to false for new verification flows)
    await prisma.emailVerification.upsert({
      where: { email },
      create: {
        email,
        otpHash,
        expiresAt,
        attempts: 0,
        verified: false,
        lastSentAt: now,
        hourlyCount,
        windowStart,
      },
      update: {
        otpHash,
        expiresAt,
        attempts: 0,
        verified: false,
        lastSentAt: now,
        hourlyCount,
        windowStart,
      },
    });

    // Send email via Nodemailer SMTP service
    const mailResult = await EmailService.sendVerificationOTP(email, plainOTP, redirectTo);

    return {
      success: true,
      message: `Verification code sent to ${email}.`,
      previewUrl: mailResult.previewUrl,
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
    return this.sendOTP(emailInput, redirectTo, true);
  }

  /**
   * Verifies the 6-digit OTP submitted by the user
   */
  public static async verifyOTP(
    emailInput: string,
    otpInput: string
  ): Promise<{ success: boolean; verified: boolean; message?: string }> {
    const email = emailInput.trim().toLowerCase();
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
      throw new Error("No verification request found for this email. Please request an OTP.");
    }

    if (record.verified) {
      return {
        success: true,
        verified: true,
        message: "Email is already verified.",
      };
    }

    const now = new Date();

    // Check expiration (10 min)
    if (now > new Date(record.expiresAt)) {
      throw new Error("Expired OTP. Please request a new verification code.");
    }

    // Check maximum attempts (5)
    if (record.attempts >= 5) {
      throw new Error("Maximum verification attempts exceeded. Please request a new OTP.");
    }

    // Compare bcrypt hash
    const isMatch = await bcrypt.compare(otp, record.otpHash);

    if (!isMatch) {
      const updatedAttempts = record.attempts + 1;
      await prisma.emailVerification.update({
        where: { email },
        data: { attempts: updatedAttempts },
      });

      const remainingAttempts = Math.max(0, 5 - updatedAttempts);
      throw new Error(
        `Invalid OTP code. ${
          remainingAttempts > 0
            ? `${remainingAttempts} attempt(s) remaining.`
            : "Maximum attempts exceeded. Please request a new OTP."
        }`
      );
    }

    // Valid OTP: Delete OTP record securely from database
    await prisma.emailVerification.delete({
      where: { email },
    });

    return {
      success: true,
      verified: true,
    };
  }
}
