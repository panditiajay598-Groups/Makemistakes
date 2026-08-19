import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { saveCode } from "@/lib/codeStore";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    saveCode(email, code);

    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000";

    const emailTemplate = (targetEmail: string, verificationCode: string) => {
      const redirectUrl = `${appBaseUrl}/auth/verify?email=${encodeURIComponent(targetEmail)}&code=${encodeURIComponent(verificationCode)}`;
      const fromHeader = process.env.SMTP_FROM || (smtpUser ? `"MakeMistakes Team" <${smtpUser}>` : `"MakeMistakes Verification" <noreply@makemistakes.com>`);
      return {
        from: fromHeader,
        to: targetEmail,
        subject: `${verificationCode} is your MakeMistakes Verification Code`,
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #09090b; color: #f4f4f5; padding: 32px; border-radius: 8px; max-width: 480px; margin: 0 auto; border: 1px solid #27272a;">
            <h2 style="color: #f59e0b; margin-top: 0;">MakeMistakes Verification</h2>
            <p style="color: #a1a1aa; font-size: 14px;">Use the following 6-digit security code or click the button below to verify your account:</p>
            <div style="background-color: #18181b; padding: 16px; border-radius: 6px; text-align: center; margin: 20px 0; border: 1px solid #3f3f46;">
              <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #f59e0b;">${verificationCode}</span>
            </div>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${redirectUrl}" target="_blank" style="display: inline-block; background-color: #f59e0b; color: #09090b; font-weight: bold; font-size: 14px; text-decoration: none; padding: 12px 24px; border-radius: 6px;">
                Verify Email &amp; Complete Login &rarr;
              </a>
            </div>
            <p style="color: #71717a; font-size: 12px;">This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
          </div>
        `,
      };
    };

    // Try custom/Gmail SMTP first if credentials are in .env.local
    if (smtpUser && smtpPass && !smtpPass.includes("Tarak@renu")) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        await transporter.sendMail(emailTemplate(email, code));

        return NextResponse.json({
          success: true,
          mode: "smtp",
          code,
          message: `Verification code sent to ${email} via SMTP!`,
        });
      } catch (smtpErr: any) {
        console.warn("[MakeMistakes SMTP Custom Warning]:", smtpErr?.message);
        // Fall through to Ethereal Test Inbox
      }
    }

    // Option B: Ethereal Automatic Test Inbox
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

      const info = await etherealTransporter.sendMail(emailTemplate(email, code));
      const previewUrl = nodemailer.getTestMessageUrl(info);

      console.log(`\n==============================================`);
      console.log(`[Ethereal Test Inbox Email Dispatched]`);
      console.log(`To: ${email}`);
      console.log(`Code: [ ${code} ]`);
      console.log(`Preview URL: ${previewUrl}`);
      console.log(`==============================================\n`);

      return NextResponse.json({
        success: true,
        mode: "ethereal",
        code,
        previewUrl: previewUrl || undefined,
        message: `Verification email sent! Click 'View Email in Test Inbox' to see the message.`,
      });
    } catch (etherealErr: any) {
      console.error("Ethereal Test Inbox error:", etherealErr);

      // Ultimate fallback
      return NextResponse.json({
        success: true,
        mode: "dev",
        code,
        message: `Demo mode: Verification Code (${code}) generated for ${email}.`,
      });
    }
  } catch (error: any) {
    console.error("Error in /api/auth/send-code:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to process verification code.",
      },
      { status: 500 }
    );
  }
}
