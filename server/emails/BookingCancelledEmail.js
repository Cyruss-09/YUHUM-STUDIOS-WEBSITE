// server/emails/BookingCancelledEmail.js
const {
  STUDIO_BRAND,
  renderEmailHeader,
  renderCtaButton,
  renderEmailFooter,
} = require("./emailBranding");

/**
 * Booking Cancellation Confirmation Email for Yuhum Studios
 * Confirms cancellation to the customer with full session summary,
 * polite next steps, support contact, and a CTA to rebook anytime.
 */
function BookingCancelledEmail({
  packageTitle = "Self-Shoot Studio Session",
  basePrice = "₱0",
  studio = "Studio Suite",
  date = "Scheduled Date",
  time = "Scheduled Time",
  addOns = "None",
  firstName = "Valued Guest",
  lastName = "",
  phone = "N/A",
  email = "N/A",
  bookingId = null,
  paymentMode = "Studio Counter / GCash",
  reason = null,
}) {
  const fullName = `${firstName || ""} ${lastName || ""}`.trim() || "Valued Guest";
  const safeStudio = studio || "Studio Suite";
  const referenceId = bookingId ? `#YS-${String(bookingId).padStart(4, "0")}` : "N/A";

  const detailRow = (label, value, isHighlight = false) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #F0EAE1; color: #7A6B63; font-size: 13px; width: 38%; vertical-align: top; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        ${label}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #F0EAE1; color: ${isHighlight ? "#B91C1C" : "#2C221E"}; font-size: 14px; font-weight: ${isHighlight ? "700" : "600"}; text-align: right; vertical-align: top; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        ${value || "N/A"}
      </td>
    </tr>
  `;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Cancelled - ${packageTitle} | Yuhum Studios</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8F5F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #2C221E;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8F5F0; padding: 36px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #E8DFD1; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 32px rgba(163, 112, 76, 0.08);">
          
          <!-- Brand Header with Logo -->
          ${renderEmailHeader({
            categoryBadge: "BOOKING CANCELLED",
            title: "Yuhum Studios",
            subtitle: "Your booking cancellation has been successfully processed",
          })}

          <!-- Email Content Body -->
          <tr>
            <td style="padding: 34px 28px;">

              <!-- Personal Greeting -->
              <div style="text-align: left; margin-bottom: 24px;">
                <h2 style="margin: 0 0 10px; font-family: Georgia, 'Times New Roman', serif; font-size: 23px; color: #2C221E; font-weight: normal; letter-spacing: -0.01em;">
                  Hi, ${firstName || "there"} 👋
                </h2>
                <p style="margin: 0; font-size: 14px; line-height: 1.65; color: #5C4D46;">
                  This email confirms that your session reservation at <strong>Yuhum Studios</strong> has been <strong>cancelled</strong>. The reserved slot has been released back into our calendar.
                </p>
              </div>

              <!-- Cancelled Session Highlight Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #FEF2F2 0%, #FFF5F5 100%); border: 1px solid #FECACA; border-radius: 16px; padding: 22px; margin-bottom: 28px;">
                <tr>
                  <td>
                    <!-- Tags -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="left">
                          <span style="display: inline-block; padding: 4px 10px; background-color: #EF4444; color: #FFFFFF; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; border-radius: 6px;">
                            ${safeStudio}
                          </span>
                        </td>
                        <td align="right">
                          <span style="display: inline-block; padding: 4px 10px; background-color: #FEE2E2; color: #B91C1C; font-size: 11px; font-weight: 700; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.05em;">
                            ● Cancelled
                          </span>
                        </td>
                      </tr>
                    </table>

                    <!-- Package Title -->
                    <h3 style="margin: 12px 0 16px; font-family: Georgia, 'Times New Roman', serif; font-size: 20px; font-weight: normal; color: #7F1D1D;">
                      ${packageTitle}
                    </h3>

                    <!-- Date & Time Box -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border: 1px solid #FCA5A5; border-radius: 12px; padding: 14px 16px;">
                      <tr>
                        <td style="width: 50%; vertical-align: top; border-right: 1px solid #FEE2E2; padding-right: 12px;">
                          <p style="margin: 0 0 2px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #991B1B; font-weight: 600;">
                            🗓️ Originally Scheduled
                          </p>
                          <p style="margin: 0; font-size: 14px; font-weight: 700; color: #2C221E;">
                            ${date}
                          </p>
                        </td>
                        <td style="width: 50%; vertical-align: top; padding-left: 14px;">
                          <p style="margin: 0 0 2px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #991B1B; font-weight: 600;">
                            ⏰ Scheduled Time
                          </p>
                          <p style="margin: 0; font-size: 14px; font-weight: 700; color: #2C221E;">
                            ${time}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Detailed Summary Table -->
              <h4 style="margin: 0 0 12px; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #2C221E;">
                Cancelled Session Details
              </h4>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
                ${detailRow("Reference ID", referenceId)}
                ${detailRow("Status", "Cancelled", true)}
                ${reason ? detailRow("Reason Provided", reason) : ""}
                ${detailRow("Studio Location", safeStudio)}
                ${detailRow("Session Package", packageTitle)}
                ${detailRow("Package Rate", basePrice)}
                ${detailRow("Selected Add-ons", addOns || "None")}
                ${detailRow("Guest Name", fullName)}
                ${phone && phone !== "N/A" ? detailRow("Contact Phone", phone) : ""}
                ${email && email !== "N/A" ? detailRow("Contact Email", email) : ""}
                ${paymentMode ? detailRow("Payment Method", paymentMode) : ""}
              </table>

              <!-- Friendly Rebooking Callout -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF7F2; border: 1px solid #E8DFD1; border-radius: 14px; padding: 22px; margin-bottom: 28px; text-align: center;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px; font-family: Georgia, 'Times New Roman', serif; font-size: 17px; font-weight: normal; color: #2C221E;">
                      Change of plans? We hope to see you another time! ✨
                    </p>
                    <p style="margin: 0 0 18px; font-size: 13px; line-height: 1.6; color: #7A6B63;">
                      Whenever you're ready to create lasting memories, our self-shoot studio lounge is always open for your creative moments.
                    </p>
                    ${renderCtaButton({
                      text: "Book a New Session",
                      url: `${STUDIO_BRAND.websiteUrl}#book`,
                    })}
                  </td>
                </tr>
              </table>

              <!-- Assistance / Support Info -->
              <div style="background-color: #FFFFFF; border-left: 3px solid #EF4444; padding: 14px 18px; margin-bottom: 28px;">
                <p style="margin: 0 0 6px; font-size: 13px; font-weight: 700; color: #2C221E;">
                  💬 Questions About Payments or Rescheduling?
                </p>
                <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #5C4D46;">
                  If you made an advance payment or have questions regarding refunds and credit re-application, please reach out to our studio desk. We're here to help!
                </p>
              </div>

              <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #7A6B63; text-align: center;">
                Call/SMS: <a href="tel:${STUDIO_BRAND.phone.replace(/\s+/g, "")}" style="color: #A3704C; text-decoration: underline; font-weight: 600;">${STUDIO_BRAND.phone}</a>
                &nbsp;|&nbsp;
                Email: <a href="mailto:${STUDIO_BRAND.email}" style="color: #A3704C; text-decoration: underline; font-weight: 600;">${STUDIO_BRAND.email}</a>
              </p>

            </td>
          </tr>

          <!-- Interactive Footer -->
          ${renderEmailFooter({
            showSocials: true,
            supportNote: "Thank you for choosing Yuhum Studios. We hope to welcome you soon.",
          })}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

module.exports = { BookingCancelledEmail };
