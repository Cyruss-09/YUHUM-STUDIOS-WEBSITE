// server/emails/BookingEmail.js
const {
  STUDIO_BRAND,
  createGoogleCalendarUrl,
  renderEmailHeader,
  renderCtaButton,
  renderEmailFooter,
} = require("./emailBranding");

/**
 * Redesigned Booking Confirmation Email for Yuhum Studios
 * Featuring official circular logo, calendar integration, studio directions,
 * and high-engagement user interaction actions.
 */
function BookingEmail({
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
  paymentMode = "Studio Counter / GCash",
  couponCode = "",
  findUs = "Social Media",
}) {
  const fullName = `${firstName || ""} ${lastName || ""}`.trim() || "Valued Guest";
  const safeStudio = studio || "Studio Suite";
  const calendarUrl = createGoogleCalendarUrl({
    title: `Yuhum Studios Session (${packageTitle})`,
    description: `Booking with Yuhum Studios. Package: ${packageTitle}. Studio: ${safeStudio}. Contact: ${STUDIO_BRAND.phone}`,
    location: `${safeStudio}, ${STUDIO_BRAND.address}`,
    dateStr: date,
    timeStr: time,
  });

  const detailRow = (label, value, isHighlight = false) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #F0EAE1; color: #7A6B63; font-size: 13px; width: 38%; vertical-align: top; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        ${label}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #F0EAE1; color: ${isHighlight ? "#A3704C" : "#2C221E"}; font-size: 14px; font-weight: ${isHighlight ? "700" : "600"}; text-align: right; vertical-align: top; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
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
  <title>Booking Confirmed - ${packageTitle} | Yuhum Studios</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8F5F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #2C221E;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8F5F0; padding: 36px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #E8DFD1; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 32px rgba(163, 112, 76, 0.08);">
          
          <!-- Brand Header with Logo -->
          ${renderEmailHeader({
            categoryBadge: "BOOKING CONFIRMATION",
            title: "Yuhum Studios",
            subtitle: "Your creative self-shoot studio lounge experience is locked in!",
          })}

          <!-- Email Content Body -->
          <tr>
            <td style="padding: 34px 28px;">

              <!-- Personal Greeting -->
              <div style="text-align: left; margin-bottom: 24px;">
                <h2 style="margin: 0 0 10px; font-family: Georgia, 'Times New Roman', serif; font-size: 23px; color: #2C221E; font-weight: normal; letter-spacing: -0.01em;">
                  We can't wait to see you, ${firstName || "there"}! ✨
                </h2>
                <p style="margin: 0; font-size: 14px; line-height: 1.65; color: #5C4D46;">
                  Your reservation is officially confirmed. Here are all the details for your upcoming self-shoot session at <strong>Yuhum Studios</strong>:
                </p>
              </div>

              <!-- Interactive Highlight Session Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #FAF7F2 0%, #F5EFE6 100%); border: 1px solid #E8DFD1; border-radius: 16px; padding: 22px; margin-bottom: 28px; box-shadow: 0 4px 14px rgba(45, 27, 24, 0.03);">
                <tr>
                  <td>
                    <!-- Suite & Package Tags -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="left">
                          <span style="display: inline-block; padding: 3px 10px; background-color: #A3704C; color: #FFFFFF; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; border-radius: 6px;">
                            ${safeStudio}
                          </span>
                        </td>
                        <td align="right">
                          <span style="font-size: 12px; font-weight: 600; color: #8C5A35;">
                            Confirmed Session
                          </span>
                        </td>
                      </tr>
                    </table>

                    <!-- Package Title -->
                    <h3 style="margin: 12px 0 16px; font-family: Georgia, 'Times New Roman', serif; font-size: 20px; font-weight: normal; color: #2C221E;">
                      ${packageTitle}
                    </h3>

                    <!-- Date & Time Highlights -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border: 1px solid #EADFD3; border-radius: 12px; padding: 14px 16px; margin-bottom: 18px;">
                      <tr>
                        <td style="width: 50%; vertical-align: top; border-right: 1px solid #F0EAE1; padding-right: 12px;">
                          <p style="margin: 0 0 2px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #9E9189; font-weight: 600;">
                            🗓️ Date
                          </p>
                          <p style="margin: 0; font-size: 14px; font-weight: 700; color: #2C221E;">
                            ${date}
                          </p>
                        </td>
                        <td style="width: 50%; vertical-align: top; padding-left: 14px;">
                          <p style="margin: 0 0 2px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #9E9189; font-weight: 600;">
                            ⏰ Time
                          </p>
                          <p style="margin: 0; font-size: 14px; font-weight: 700; color: #2C221E;">
                            ${time}
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Interactive User Action: Add to Calendar -->
                    ${calendarUrl ? `
                      <div style="text-align: center;">
                        <a href="${calendarUrl}" target="_blank" style="display: inline-block; background-color: #FFFFFF; border: 1px solid #A3704C; color: #A3704C; text-decoration: none; font-size: 12px; font-weight: 600; padding: 9px 20px; border-radius: 999px; letter-spacing: 0.05em;">
                          📅 Add to Google Calendar
                        </a>
                      </div>
                    ` : ""}

                  </td>
                </tr>
              </table>

              <!-- Detailed Booking Information -->
              <h4 style="margin: 0 0 12px; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #2C221E;">
                Session Summary
              </h4>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
                ${detailRow("Studio Location", safeStudio)}
                ${detailRow("Session Package", packageTitle)}
                ${detailRow("Package Rate", basePrice, true)}
                ${detailRow("Selected Add-ons", addOns || "None")}
                ${couponCode ? detailRow("Promo / Coupon Code", couponCode, true) : ""}
                ${detailRow("Guest Name", fullName)}
                ${detailRow("Contact Phone", phone)}
                ${detailRow("Contact Email", email)}
                ${detailRow("Payment Method", paymentMode)}
                ${findUs ? detailRow("Discovered Via", findUs) : ""}
              </table>

              <!-- Quick Action Bar -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF7F2; border: 1px dashed #E8DFD1; border-radius: 14px; padding: 18px 20px; margin-bottom: 28px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px; font-size: 13px; font-weight: 700; color: #2C221E;">
                      🗺️ Finding Yuhum Studios
                    </p>
                    <p style="margin: 0 0 14px; font-size: 13px; line-height: 1.5; color: #5C4D46;">
                      ${STUDIO_BRAND.address}
                    </p>
                    <div style="text-align: left;">
                      <a href="${STUDIO_BRAND.mapsUrl}" target="_blank" style="display: inline-block; background-color: #A3704C; color: #FFFFFF; font-size: 12px; font-weight: 600; text-decoration: none; padding: 8px 18px; border-radius: 8px;">
                        Open Directions in Google Maps ↗
                      </a>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Helpful Studio Session Tips -->
              <div style="background-color: #FFFFFF; border-left: 3px solid #A3704C; padding: 14px 18px; margin-bottom: 28px;">
                <p style="margin: 0 0 6px; font-size: 13px; font-weight: 700; color: #2C221E;">
                  💡 Tips for a Smooth Session
                </p>
                <ul style="margin: 0; padding-left: 18px; font-size: 13px; line-height: 1.6; color: #5C4D46;">
                  <li>Please arrive <strong>5 to 10 minutes</strong> before your scheduled time for seamless check-in.</li>
                  <li>Our suites are <strong>pet-friendly</strong>! Bring your pet's treats and accessories.</li>
                  <li>Pro lighting and wireless remote shutter are all setup and ready when you enter.</li>
                </ul>
              </div>

              <!-- Assistance Note -->
              <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #7A6B63; text-align: center;">
                Need to reschedule or have special questions? Just reply directly to this email or call us at
                <a href="tel:${STUDIO_BRAND.phone.replace(/\s+/g, "")}" style="color: #A3704C; text-decoration: underline; font-weight: 600;">${STUDIO_BRAND.phone}</a>.
              </p>

            </td>
          </tr>

          <!-- Interactive Footer -->
          ${renderEmailFooter({
            showSocials: true,
            supportNote: "We can't wait to capture your happiest moments at Yuhum Studios.",
          })}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

module.exports = { BookingEmail };
