import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";
import { EmailTemplates } from "../templates/emailTemplates";

interface SmtpAccount {
  user: string;
  pass: string;
  host: string;
  port: number;
  secure: boolean;
}

export class EmailService {
  private static roundRobinIndex = 0;

  /**
   * Helper to retrieve all configured SMTP sender accounts for Round-Robin distribution
   */
  private static getSmtpAccounts(): SmtpAccount[] {
    const accounts: SmtpAccount[] = [];
    const defaultHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const defaultPort = parseInt(process.env.SMTP_PORT || "587", 10);
    const defaultSecure = process.env.SMTP_SECURE === "true";

    // Primary SMTP User
    if (process.env.SMTP_USER && process.env.SMTP_PASS && !process.env.SMTP_PASS.includes("Tarak@renu")) {
      accounts.push({
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        host: defaultHost,
        port: defaultPort,
        secure: defaultSecure,
      });
    }

    // Additional Round-Robin Accounts (GMAIL_USER_1, GMAIL_USER_2, etc.)
    for (let i = 1; i <= 5; i++) {
      const u = process.env[`GMAIL_USER_${i}`] || process.env[`SMTP_USER_${i}`];
      const p = process.env[`GMAIL_APP_PASSWORD_${i}`] || process.env[`SMTP_PASS_${i}`];
      if (u && p) {
        accounts.push({
          user: u,
          pass: p,
          host: defaultHost,
          port: defaultPort,
          secure: defaultSecure,
        });
      }
    }

    return accounts;
  }

  /**
   * Sends 6-digit OTP verification email via Round-Robin SMTP, Resend API, or Ethereal test inbox fallback
   */
  public static async sendVerificationOTP(
    email: string,
    otp: string,
    redirectTo?: string
  ): Promise<{ success: boolean; previewUrl?: string }> {
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000";
    let redirectUrl = `${appBaseUrl}/auth/verify?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`;
    if (redirectTo) {
      redirectUrl += `&redirectTo=${encodeURIComponent(redirectTo)}`;
    }

    const { subject, html } = EmailTemplates.getOTPVerificationTemplate({
      email,
      otp,
      redirectUrl,
    });

    const smtpAccounts = this.getSmtpAccounts();

    // 1. Round-Robin Custom Gmail / SMTP Transports (Delivers to ANY email address)
    if (smtpAccounts.length > 0) {
      const selectedAccount = smtpAccounts[this.roundRobinIndex % smtpAccounts.length];
      this.roundRobinIndex = (this.roundRobinIndex + 1) % smtpAccounts.length;

      try {
        const transporter = nodemailer.createTransport({
          host: selectedAccount.host,
          port: selectedAccount.port,
          secure: selectedAccount.secure,
          auth: {
            user: selectedAccount.user,
            pass: selectedAccount.pass,
          },
        });

        const textContent = `Your MakeMistakes verification code is: ${otp}\n\nClick the link below to verify your account:\n${redirectUrl}\n\nThis code expires in 10 minutes. If you did not request this code, please ignore this email.`;

        await transporter.sendMail({
          from: process.env.SMTP_FROM || `"MakeMistakes Team" <${selectedAccount.user}>`,
          replyTo: process.env.REPLY_TO || "support@makemistakes.in",
          to: email,
          subject,
          text: textContent,
          html,
        });

        console.log(`[SMTP Success] Email sent to ${email} using account ${selectedAccount.user}`);
        return { success: true };
      } catch (err: any) {
        console.warn(`[SMTP Warning] Account ${selectedAccount.user} failed: ${err?.message}. Trying fallback...`);
      }
    }

    // 2. Resend API Integration
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM || "MakeMistakes Team <Support@makemistakes.in>",
            reply_to: process.env.REPLY_TO || "Support@makemistakes.in",
            to: [email],
            subject,
            html,
          }),
        });

        const resData = await response.json();
        if (response.ok && resData.id) {
          console.log(`[Resend API Success] Email ID: ${resData.id} delivered to ${email}`);
          return { success: true };
        }
        console.warn("[Resend API Notice]:", resData);
      } catch (err: any) {
        console.warn("Resend API failed, trying test inbox fallback:", err?.message);
      }
    }

    // 3. Fallback: Ethereal Test Inbox for Development
    try {
      const testAccount = await nodemailer.createTestAccount();
      const etherealTransporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const info = await etherealTransporter.sendMail({
        from: process.env.SMTP_FROM || `"MakeMistakes Team" <Support@makemistakes.in>`,
        to: email,
        subject,
        html,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
      return { success: true, previewUrl };
    } catch (error: any) {
      console.error("Error sending verification email:", error);
      throw new Error("Unable to send verification email.");
    }
  }
}

export const sendVerificationOTP = EmailService.sendVerificationOTP.bind(EmailService);
