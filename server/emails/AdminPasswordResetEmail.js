// server/emails/AdminPasswordResetEmail.js
const {
  STUDIO_BRAND,
  renderEmailHeader,
  renderCtaButton,
  renderEmailFooter,
} = require("./emailBranding");

/**
 * Redesigned Admin Security Password Reset Email for Yuhum Studios
 * Features official circular logo with amber glowing accent, dark-mode security console
 * aesthetic, high-privilege alert box, and interactive reset authorization CTA.
 */
function AdminPasswordResetEmail({ resetUrl, adminName, adminEmail }) {
  const displayName = adminName || "Administrator";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Security Password Reset • Yuhum Studios</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0B0F17; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #E2E8F0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0B0F17; padding: 36px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #161F30; border: 1px solid #2A364F; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 48px rgba(0, 0, 0, 0.6);">
          
          <!-- Brand Header with Logo (Dark Luxury Mode) -->
          ${renderEmailHeader({
            categoryBadge: "ADMIN ACCESS SECURITY",
            title: "Yuhum Studios",
            subtitle: "Management & Operations Console",
            isDark: true,
          })}

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 36px 30px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <!-- Security Shield Icon -->
                <div style="display: inline-block; width: 52px; height: 52px; line-height: 52px; border-radius: 14px; background: rgba(245, 158, 11, 0.14); border: 1px solid rgba(245, 158, 11, 0.35); color: #F59E0B; font-size: 24px; margin-bottom: 14px;">
                  🛡️
                </div>

                <h2 style="margin: 0 0 10px; font-size: 21px; font-weight: 700; color: #F8FAFC; letter-spacing: -0.01em;">
                  Admin Password Reset Request
                </h2>

                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #94A3B8;">
                  An administrative password reset was initiated for <strong style="color: #F1F5F9;">${displayName}</strong> (${adminEmail || "Admin"}).
                </p>
              </div>

              <!-- High Privilege Alert Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: rgba(11, 15, 23, 0.85); border: 1px solid #2A364F; border-left: 4px solid #F59E0B; border-radius: 12px; padding: 16px 18px; margin-bottom: 28px;">
                <tr>
                  <td style="font-size: 12px; line-height: 1.6; color: #CBD5E1;">
                    ⚠️ <strong>Elevated Security Notice:</strong> This authorization grants full administrative access to studio bookings, customer records, calendar blackout dates, and system configuration.
                  </td>
                </tr>
              </table>

              <!-- Interactive Primary Action Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    ${renderCtaButton({
                      href: resetUrl,
                      text: "Authorize Admin Reset",
                      isDark: true,
                      icon: "⚡",
                    })}
                  </td>
                </tr>
              </table>

              <!-- Expiry Alert Pill -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0F172A; border: 1px solid #2A364F; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px;">
                <tr>
                  <td style="font-size: 12px; line-height: 1.5; color: #94A3B8;">
                    ⏱️ <strong>Token Expiry:</strong> This secure single-use token expires in <strong>30 minutes</strong>. If you did not initiate this request, verify your account security immediately.
                  </td>
                </tr>
              </table>

              <!-- Fallback Direct Admin Link -->
              <div style="border-top: 1px dashed #2A364F; padding-top: 18px; text-align: left;">
                <p style="margin: 0 0 6px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748B; font-weight: 600;">
                  Direct Admin Reset URL:
                </p>
                <p style="margin: 0; font-size: 11px; word-break: break-all; color: #F59E0B; line-height: 1.5;">
                  <a href="${resetUrl}" style="color: #F59E0B; text-decoration: underline;">${resetUrl}</a>
                </p>
              </div>

            </td>
          </tr>

          <!-- Interactive Footer (Dark Mode) -->
          ${renderEmailFooter({
            isDark: true,
            showSocials: false,
            supportNote: "Restricted Access • Authorized Yuhum Studios Personnel Only",
          })}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

module.exports = { AdminPasswordResetEmail };