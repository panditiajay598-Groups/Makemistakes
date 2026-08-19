import { Request, Response } from "express";
import { OTPService } from "../services/otp.service";

export class AuthController {
  /**
   * POST /api/auth/send-otp
   */
  public static async sendOTP(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ success: false, message: "Email is required." });
        return;
      }

      const result = await OTPService.sendOTP(email);

      res.status(200).json({
        success: true,
        message: result.message,
        ...(result.previewUrl ? { previewUrl: result.previewUrl } : {}),
        ...(result.devOtp ? { devOtp: result.devOtp } : {}),
      });
    } catch (error: any) {
      const statusCode = error.message.includes("Rate limit") || error.message.includes("wait") ? 429 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to send OTP.",
      });
    }
  }

  /**
   * POST /api/auth/resend-otp
   */
  public static async resendOTP(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ success: false, message: "Email is required." });
        return;
      }

      const result = await OTPService.resendOTP(email);

      res.status(200).json({
        success: true,
        message: result.message,
        ...(result.previewUrl ? { previewUrl: result.previewUrl } : {}),
        ...(result.devOtp ? { devOtp: result.devOtp } : {}),
      });
    } catch (error: any) {
      const statusCode = error.message.includes("wait") || error.message.includes("requests per hour") ? 429 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to resend OTP.",
      });
    }
  }

  /**
   * POST /api/auth/verify-otp
   */
  public static async verifyOTP(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        res.status(400).json({
          success: false,
          message: "Email and OTP are required.",
        });
        return;
      }

      const result = await OTPService.verifyOTP(email, otp);

      res.status(200).json({
        success: true,
        verified: result.verified,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        verified: false,
        message: error.message || "OTP verification failed.",
      });
    }
  }
}
