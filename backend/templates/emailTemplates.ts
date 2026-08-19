/**
 * MakeMistakes Email Templates Engine
 * Decoupled HTML templates for OTP verification, welcome onboarding, and password resets.
 */

export interface OTPTemplateData {
  email: string;
  otp: string;
  redirectUrl: string;
}

export interface WelcomeTemplateData {
  userName: string;
  dashboardUrl: string;
}

export interface ResetPasswordTemplateData {
  email: string;
  resetUrl: string;
}

export class EmailTemplates {
  /**
   * 6-digit OTP Verification HTML Template
   */
  public static getOTPVerificationTemplate({ email, otp, redirectUrl }: OTPTemplateData): { subject: string; html: string } {
    return {
      subject: `${otp} is your MakeMistakes Verification Code`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify your MakeMistakes account</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #09090b; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" style="max-width: 480px; background-color: #18181b; border-radius: 12px; border: 1px solid #27272a; padding: 36px; text-align: left;">
                  <tr>
                    <td style="padding-bottom: 24px;">
                      <span style="font-size: 18px; font-weight: 700; letter-spacing: -0.5px; color: #f59e0b; font-family: monospace;">MakeMistakes</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 14px; line-height: 22px; color: #d4d4d8;">
                      <p style="margin: 0 0 16px 0;">Hello,</p>
                      <p style="margin: 0 0 24px 0;">Use the following 6-digit security code or click the button below to verify your account:</p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding: 10px 0 24px 0;">
                      <div style="display: inline-block; background-color: #09090b; border: 1px solid #3f3f46; border-radius: 8px; padding: 16px 32px; font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 10px; color: #f59e0b;">
                        ${otp}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding: 0 0 28px 0;">
                      <a href="${redirectUrl}" target="_blank" style="display: inline-block; background-color: #f59e0b; color: #09090b; font-family: sans-serif; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                        Verify Email &amp; Complete Login &rarr;
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 13px; line-height: 20px; color: #a1a1aa;">
                      <p style="margin: 0 0 16px 0;">This code expires in <strong>10 minutes</strong>.</p>
                      <p style="margin: 0 0 24px 0;">If you did not request this email, please ignore it.</p>
                      <p style="margin: 0; color: #71717a;">Regards,<br><strong style="color: #d4d4d8;">MakeMistakes Team</strong></p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };
  }

  /**
   * Welcome Onboarding HTML Template
   */
  public static getWelcomeTemplate({ userName, dashboardUrl }: WelcomeTemplateData): { subject: string; html: string } {
    return {
      subject: "Welcome to MakeMistakes — Build Real Systems",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to MakeMistakes</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f4f4f5;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 40px 20px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" style="max-width: 480px; background-color: #18181b; border-radius: 12px; border: 1px solid #27272a; padding: 36px;">
                  <tr>
                    <td style="padding-bottom: 16px;">
                      <h2 style="color: #f59e0b; font-family: monospace; margin: 0;">Welcome, ${userName}!</h2>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 14px; line-height: 22px; color: #d4d4d8;">
                      <p>Your account has been verified. You're ready to start building real-world software challenges with Socratic AI guidance.</p>
                      <div style="text-align: center; margin: 28px 0;">
                        <a href="${dashboardUrl}" style="background-color: #f59e0b; color: #09090b; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                          Open Workspace &rarr;
                        </a>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };
  }
}
