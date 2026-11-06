import { Request, Response } from "express";
import { OTPService } from "../services/otp.service";
import { otpSuccessPayload, publicOtpError } from "../../src/lib/security/otpSecurity";

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

      res.status(200).json(otpSuccessPayload(result, process.env, "development"));
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      const publicError = publicOtpError(message, "send");
      if (!message.startsWith("OTP_RATE_LIMIT:") && !message.startsWith("EMAIL_DELIVERY_FAILED:")) {
        console.error("Failed to send OTP:", error);
      }
      res.status(publicError.status).json({
        success: false,
        message: publicError.message,
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

      res.status(200).json(otpSuccessPayload(result, process.env, "development"));
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      const publicError = publicOtpError(message, "send");
      if (!message.startsWith("OTP_RATE_LIMIT:") && !message.startsWith("EMAIL_DELIVERY_FAILED:")) {
        console.error("Failed to resend OTP:", error);
      }
      res.status(publicError.status).json({
        success: false,
        message: publicError.message,
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
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      const publicError = publicOtpError(message, "verify");
      if (publicError.status !== 429) console.error("OTP verification failed:", error);
      res.status(publicError.status).json({
        success: false,
        verified: false,
        message: publicError.message,
      });
    }
  }
}
