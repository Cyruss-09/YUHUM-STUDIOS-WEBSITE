// server/emails/PasswordResetEmail.js
// Client Password Reset Email Template

function PasswordResetEmail({ resetUrl, username, email }) {
  const currentYear = new Date().getFullYear();
  const displayName = username || "there";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Yuhum Studios Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8F5F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #2C221E;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8F5F0; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 540px; background-color: #FFFFFF; border: 1px solid #E8DFD1; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(163, 112, 76, 0.08);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #FAF7F2 0%, #F3ECE2 100%); padding: 36px 32px 28px; text-align: center; border-bottom: 1px solid #E8DFD1;">
              <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: normal; letter-spacing: 0.2em; text-transform: uppercase; color: #2C221E;">
                Yuhum<span style="color: #A3704C;">.</span>Studios
              </h1>
              <p style="margin: 6px 0 0; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #7A6B63; font-weight: 600;">
                Self-Shoot Studio Lounge
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 50%; background-color: #F4EFEA; color: #A3704C; font-size: 22px; margin-bottom: 12px;">
                  🔑
                </div>
                <h2 style="margin: 0 0 8px; font-family: Georgia, 'Times New Roman', serif; font-size: 22px; color: #2C221E; font-weight: normal;">
                  Password Reset Request
                </h2>
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #7A6B63;">
                  Hi <strong style="color: #2C221E;">${displayName}</strong>, we received a request to reset the password for your Yuhum Studios client account.
                </p>
              </div>

              <!-- Action Button Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #A3704C 0%, #8C5A35 100%); color: #FFFFFF; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 14px rgba(163, 112, 76, 0.35);">
                      Reset My Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Notice Badge -->
              <div style="background-color: #FAF7F2; border: 1px solid #E8DFD1; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px; text-align: left;">
                <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #7A6B63;">
                  ⏱️ <strong>Security notice:</strong> This link is valid for <strong>30 minutes</strong> and can only be used once. If you did not make this request, you can safely ignore this email — your account remains completely secure.
                </p>
              </div>

              <!-- Fallback Plain Link -->
              <div style="border-top: 1px dashed #E8DFD1; padding-top: 18px;">
                <p style="margin: 0 0 6px; font-size: 11px; color: #9E9189; text-transform: uppercase; letter-spacing: 0.05em;">
                  Button not working? Copy and paste this link into your browser:
                </p>
                <p style="margin: 0; font-size: 11px; word-break: break-all; color: #A3704C;">
                  <a href="${resetUrl}" style="color: #A3704C; text-decoration: underline;">${resetUrl}</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FAF7F2; padding: 20px 32px; text-align: center; border-top: 1px solid #E8DFD1; font-size: 11px; color: #9E9189; line-height: 1.6;">
              <p style="margin: 0 0 4px;">
                © ${currentYear} Yuhum Studios. All rights reserved.
              </p>
              <p style="margin: 0;">
                Iloilo City, Philippines • <a href="mailto:yuhumstudios22@gmail.com" style="color: #7A6B63; text-decoration: none;">yuhumstudios22@gmail.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

module.exports = { PasswordResetEmail };