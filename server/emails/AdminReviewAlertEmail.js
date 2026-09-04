// server/emails/AdminReviewAlertEmail.js
const {
  STUDIO_BRAND,
  renderEmailHeader,
  renderCtaButton,
  renderEmailFooter,
} = require("./emailBranding");

/**
 * Admin Notification Email for New Customer Feedback / Reviews
 * Features official circular logo, rating metric cards, customer quote,
 * and quick-action link to the Admin Dashboard.
 */
function AdminReviewAlertEmail({
  userEmail,
  overallRating,
  equipmentEase,
  roomPrivacy,
  propsSelection,
  favoriteBackdrop,
  comments,
  recommend,
}) {
  const stars = (n) => {
    const val = Number(n) || 0;
    return Array.from({ length: 5 }, (_, i) =>
      i < val
        ? "<span style=\"color: #F59E0B;\">★</span>"
        : "<span style=\"color: #475569;\">☆</span>"
    ).join(" ");
  };

  const metricRow = (label, value) => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #334155; color: #94A3B8; font-size: 13px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        ${label}
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid #334155; text-align: right; font-size: 15px; letter-spacing: 2px;">
        ${value ? stars(value) : "<span style=\"color: #64748B; font-size: 12px; letter-spacing: normal;\">N/A</span>"}
      </td>
    </tr>
  `;

  const safeRecommend =
    recommend === true
      ? "<span style=\"color: #10B981; font-weight: 700;\">✅ Yes, would recommend</span>"
      : recommend === false
        ? "<span style=\"color: #EF4444; font-weight: 700;\">❌ No</span>"
        : "<span style=\"color: #94A3B8;\">Not specified</span>";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Customer Review • Yuhum Studios Admin</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0B0F17; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #E2E8F0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0B0F17; padding: 36px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #161F30; border: 1px solid #2A364F; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 48px rgba(0, 0, 0, 0.6);">
          
          <!-- Brand Header with Logo (Dark Luxury Mode) -->
          ${renderEmailHeader({
            categoryBadge: "ADMIN NOTIFICATION",
            title: "Yuhum Studios",
            subtitle: "Customer Review & Studio Performance Feed",
            isDark: true,
          })}

          <!-- Main Content -->
          <tr>
            <td style="padding: 34px 28px;">
              
              <!-- Subject Header -->
              <div style="margin-bottom: 24px;">
                <span style="display: inline-block; padding: 3px 10px; background-color: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 6px; font-size: 11px; font-weight: 700; color: #F59E0B; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">
                  New Feedback Received
                </span>
                <h2 style="margin: 6px 0 6px; font-size: 22px; font-weight: 700; color: #F8FAFC;">
                  Customer Session Review (${overallRating || "N/A"} ⭐)
                </h2>
                <p style="margin: 0; font-size: 13px; color: #94A3B8;">
                  Reviewer: <a href="mailto:${userEmail || ""}" style="color: #38BDF8; text-decoration: none;">${userEmail || "Anonymous"}</a>
                </p>
              </div>

              <!-- Rating Metrics Table -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0F172A; border: 1px solid #2A364F; border-radius: 14px; padding: 18px 20px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      ${metricRow("Overall Experience", overallRating)}
                      ${metricRow("Equipment Ease", equipmentEase)}
                      ${metricRow("Room Privacy", roomPrivacy)}
                      ${metricRow("Props Selection", propsSelection)}
                    </table>

                    <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #2A364F; font-size: 13px; color: #CBD5E1;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="color: #94A3B8; font-size: 13px;">Favorite Backdrop:</td>
                          <td style="text-align: right; color: #F8FAFC; font-weight: 600; font-size: 13px;">
                            ${favoriteBackdrop || "None selected"}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-top: 6px; color: #94A3B8; font-size: 13px;">Recommends Us:</td>
                          <td style="padding-top: 6px; text-align: right; font-size: 13px;">
                            ${safeRecommend}
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Customer Comments Block -->
              <div style="margin-bottom: 28px;">
                <p style="margin: 0 0 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #94A3B8; font-weight: 700;">
                  Customer Comments:
                </p>
                <div style="background-color: #0F172A; border: 1px solid #2A364F; border-left: 4px solid #F59E0B; border-radius: 8px; padding: 16px 18px; color: #E2E8F0; font-size: 14px; line-height: 1.6; font-style: italic;">
                  "${comments || "No written remarks provided."}"
                </div>
              </div>

              <!-- Interactive Quick Link to Admin Dashboard -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 18px 0 10px;">
                <tr>
                  <td align="center">
                    ${renderCtaButton({
                      href: `${STUDIO_BRAND.websiteUrl}/admin`,
                      text: "Open Admin Dashboard",
                      isDark: true,
                      icon: "📊",
                    })}
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Interactive Footer (Dark Mode) -->
          ${renderEmailFooter({
            isDark: true,
            showSocials: false,
            supportNote: "Yuhum Studios Operations & Administration System",
          })}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

module.exports = { AdminReviewAlertEmail };
