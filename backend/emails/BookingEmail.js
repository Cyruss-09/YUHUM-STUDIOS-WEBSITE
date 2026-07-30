// Returns an HTML string for the booking confirmation email.
function BookingEmail({
  packageTitle,
  basePrice,
  studio,
  date,
  time,
  addOns,
  firstName,
  lastName,
  phone,
  email,
  paymentMode,
  couponCode,
  findUs,
}) {
  // Logo embedded as base64 so it renders without needing external hosting.
  // NOTE: Outlook desktop (Windows) blocks base64 images by default.
  // For guaranteed delivery everywhere, host this file on your site/CDN
  // and swap LOGO_SRC for a public URL instead (e.g. https://yuhumstudio.com/logo.jpg).
  const LOGO_SRC =
    "https://instagram.fmnl32-1.fna.fbcdn.net/v/t51.2885-19/296548404_794701854868915_1658652551879748302_n.jpg?efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDI0LmMyIn0&_nc_ht=instagram.fmnl32-1.fna.fbcdn.net&_nc_cat=107&_nc_oc=Q6cZ2gF7YgMZOasdB0OoyHkZQpYzpmyFIZqWKWEDYgHj58-d9qNWNf7ZvI7yRBLtShQQPMY&_nc_ohc=CmqS9ydfpuIQ7kNvwHSnR0T&_nc_gid=UPL8cXl45baDJ3v3EzKhxg&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AQGDGWryreDurdI_plsj3LPaQ32kBwv-kvTjWifOe8TlaA&oe=6A707C12&_nc_sid=7a9f4b";
  const row = (label, value) => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #f0ebe9; color: #8a7d78; font-size: 13px; width: 40%; vertical-align: top;">
        ${label}
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid #f0ebe9; color: #2D1B18; font-size: 14px; font-weight: 600; text-align: right; vertical-align: top;">
        ${value}
      </td>
    </tr>
  `;

  return `
    <div style="background-color: #f5f0ee; padding: 32px 16px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(45,27,24,0.08);">

        <!-- Header with logo -->
        <tr>
          <td style="background: #f5f0ee; padding: 32px 32px 24px; text-align: center;">
            <img src="${LOGO_SRC}" alt="Yuhum Studios" width="140" style="display: block; margin: 0 auto; max-width: 140px; height: auto;" />
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding: 32px;">
            <p style="color: #2D1B18; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
              Hi ${firstName || "there"}, thanks for booking with us! Here are your session details:
            </p>

            <!-- Highlight card -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #faf6f4; border-radius: 12px; padding: 4px; margin-bottom: 24px;">
              <tr>
                <td style="padding: 20px;">
                  <p style="margin: 0 0 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #a68f87;">Package</p>
                  <p style="margin: 0 0 16px; font-size: 18px; font-weight: 700; color: #2D1B18;">${packageTitle}</p>

                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width: 50%;">
                        <p style="margin: 0 0 2px; font-size: 12px; color: #a68f87;">Date</p>
                        <p style="margin: 0; font-size: 14px; font-weight: 600; color: #2D1B18;">${date}</p>
                      </td>
                      <td style="width: 50%;">
                        <p style="margin: 0 0 2px; font-size: 12px; color: #a68f87;">Time</p>
                        <p style="margin: 0; font-size: 14px; font-weight: 600; color: #2D1B18;">${time}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Detail rows -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${row("Studio", studio)}
              ${row("Price", basePrice)}
              ${row("Add-ons", addOns)}
              ${row("Full Name", `${firstName || "N/A"} ${lastName || ""}`.trim())}
              ${row("Email", email || "N/A")}
              ${row("Phone", phone || "N/A")}
              ${row("Payment Mode", paymentMode || "N/A")}
              ${row("Coupon Code", couponCode || "None")}
              ${row("How you found us", findUs || "N/A")}
            </table>

            <p style="color: #2D1B18; font-size: 14px; line-height: 1.6; margin: 28px 0 0;">
              Need to reschedule or have a question? Just reply to this email — we're happy to help.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background: #faf6f4; padding: 20px 32px; text-align: center;">
            <p style="color: #a68f87; font-size: 12px; margin: 0;">
              — Yuhum Studio
            </p>
          </td>
        </tr>

      </table>
    </div>
  `;
}

module.exports = { BookingEmail };
