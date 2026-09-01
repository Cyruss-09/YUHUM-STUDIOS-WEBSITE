// server/emails/AdminPasswordResetEmail.js
// Admin Portal Security Password Reset Email Template

function AdminPasswordResetEmail({ resetUrl, adminName, adminEmail }) {
  const currentYear = new Date().getFullYear();
  const displayName = adminName || "Administrator";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Password Reset Request - Yuhum Studios</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0F172A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #E2E8F0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0F172A; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #1E293B; border: 1px solid #334155; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); padding: 36px 32px 28px; text-align: center; border-bottom: 1px solid #334155;">
              <div style="display: inline-block; padding: 4px 12px; background-color: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; color: #F59E0B; margin-bottom: 12px;">
                🔒 Admin Access Security
              </div>
              <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: normal; letter-spacing: 0.2em; text-transform: uppercase; color: #F8FAFC;">
                Yuhum<span style="color: #F59E0B;">.</span>Studios
              </h1>
              <p style="margin: 6px 0 0; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #94A3B8; font-weight: 600;">
                Management & Operations Portal
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; width: 50px; height: 50px; line-height: 50px; border-radius: 14px; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.3); color: #F59E0B; font-size: 24px; margin-bottom: 14px;">
                  🛡️
                </div>
                <h2 style="margin: 0 0 10px; font-size: 20px; font-weight: 700; color: #F8FAFC; letter-spacing: -0.02em;">
                  Admin Password Reset Request
                </h2>
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #94A3B8;">
                  An administrator password reset was initiated for <strong style="color: #F1F5F9;">${displayName}</strong> (${adminEmail || "Admin"}).
                </p>
              </div>

              <!-- Security Notice Banner -->
              <div style="background-color: rgba(15, 23, 42, 0.8); border: 1px solid #334155; border-left: 4px solid #F59E0B; border-radius: 12px; padding: 14px 18px; margin-bottom: 28px;">
                <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #CBD5E1;">
                  ⚠️ <strong>Elevated Privileges Alert:</strong> This reset grants full administrative access to client booking records, payment configurations, user permissions, and studio CMS settings.
                </p>
              </div>

              <!-- Action Button Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0 28px;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: #0F172A; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; text-decoration: none; padding: 14px 34px; border-radius: 12px; box-shadow: 0 4px 18px rgba(245, 158, 11, 0.35);">
                      Reset Admin Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Token Expiry Pill -->
              <div style="background-color: #0F172A; border: 1px solid #334155; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px; text-align: left;">
                <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #94A3B8;">
                  ⏱️ <strong>Token Expiry:</strong> This secure single-use token expires in <strong>30 minutes</strong>. If you did not request this administrative password reset, please secure your credentials and alert your team lead immediately.
                </p>
              </div>

              <!-- Fallback Plain Link -->
              <div style="border-top: 1px dashed #334155; padding-top: 18px;">
                <p style="margin: 0 0 6px; font-size: 11px; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em;">
                  Direct Admin Reset URL:
                </p>
                <p style="margin: 0; font-size: 11px; word-break: break-all; color: #F59E0B;">
                  <a href="${resetUrl}" style="color: #F59E0B; text-decoration: underline;">${resetUrl}</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0F172A; padding: 20px 32px; text-align: center; border-top: 1px solid #334155; font-size: 11px; color: #64748B; line-height: 1.6;">
              <p style="margin: 0 0 4px;">
                © ${currentYear} Yuhum Studios Inc. • Internal Operations & Admin Portal
              </p>
              <p style="margin: 0;">
                Restricted Access • Authorized Personnel Only
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

module.exports = { AdminPasswordResetEmail };