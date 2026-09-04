// server/emails/PasswordResetEmail.js
const {
  STUDIO_BRAND,
  renderEmailHeader,
  renderCtaButton,
  renderEmailFooter,
} = require("./emailBranding");

/**
 * Redesigned Client Password Reset Email for Yuhum Studios
 * Features official circular logo, high-visibility interactive CTA,
 * security countdown pill, and secure fallback.
 */
function PasswordResetEmail({ resetUrl, username, email }) {
  const displayName = username || (email ? email.split("@")[0] : "there");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Yuhum Studios Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8F5F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #2C221E;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8F5F0; padding: 36px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 550px; background-color: #FFFFFF; border: 1px solid #E8DFD1; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 32px rgba(163, 112, 76, 0.08);">
          
          <!-- Brand Header with Logo -->
          ${renderEmailHeader({
            categoryBadge: "ACCOUNT SECURITY",
            title: "Yuhum Studios",
            subtitle: "Self-Shoot Studio Lounge Client Access",
          })}

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 30px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <!-- Security Icon Pill -->
                <div style="display: inline-block; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; background-color: #FAF2EB; border: 1px solid #E4D2C1; color: #A3704C; font-size: 22px; margin-bottom: 14px;">
                  🔑
                </div>
                
                <h2 style="margin: 0 0 10px; font-family: Georgia, 'Times New Roman', serif; font-size: 23px; color: #2C221E; font-weight: normal;">
                  Password Reset Request
                </h2>
                
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #6A5A53;">
                  Hi <strong style="color: #2C221E;">${displayName}</strong>, we received a request to reset your password for your <strong>Yuhum Studios</strong> account.
                </p>
              </div>

              <!-- Interactive Primary Action Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    ${renderCtaButton({
                      href: resetUrl,
                      text: "Reset My Password",
                      icon: "🔐",
                    })}
                  </td>
                </tr>
              </table>

              <!-- Security Notice Badge -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF7F2; border: 1px solid #E8DFD1; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px;">
                <tr>
                  <td style="font-size: 12px; line-height: 1.6; color: #7A6B63;">
                    ⏱️ <strong>Security note:</strong> This single-use link is valid for <strong>30 minutes</strong>. If you did not initiate this request, you can safely ignore this email — your password will remain unchanged and your account is secure.
                  </td>
                </tr>
              </table>

              <!-- Fallback Direct URL -->
              <div style="border-top: 1px dashed #E8DFD1; padding-top: 18px; text-align: left;">
                <p style="margin: 0 0 6px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #9E9189; font-weight: 600;">
                  Having trouble clicking the button?
                </p>
                <p style="margin: 0; font-size: 11px; word-break: break-all; color: #A3704C; line-height: 1.5;">
                  <a href="${resetUrl}" style="color: #A3704C; text-decoration: underline;">${resetUrl}</a>
                </p>
              </div>

            </td>
          </tr>

          <!-- Interactive Footer -->
          ${renderEmailFooter({
            showSocials: true,
            supportNote: "Questions or security concerns? Contact yuhumstudios22@gmail.com.",
          })}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

module.exports = { PasswordResetEmail };