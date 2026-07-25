function BookingEmail({ packageTitle, basePrice, studio, date, time, addOns }) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
      </head>
      <body style="margin: 0; padding: 40px 15px; background-color: #f7f5f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        
        <!-- Main Card Container -->
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #eae5e0; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);">
          
          <!-- Dark Header -->
          <tr>
            <td style="background-color: #2D1B18; padding: 44px 32px 36px 32px; text-align: center;">
              
              <!-- Badge -->
              <div style="display: inline-block; border: 1px solid #735a4c; border-radius: 4px; padding: 4px 12px; margin-bottom: 20px;">
                <span style="color: #dcb386; font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">BOOKING CONFIRMATION</span>
              </div>
              
              <!-- Main Title -->
              <h1 style="color: #ffffff; font-family: 'Georgia', serif; font-size: 24px; font-weight: 400; margin: 0 0 10px 0; letter-spacing: -0.2px;">
                Your Session is Confirmed!
              </h1>
              
              <!-- Subtitle -->
              <p style="color: #a39288; font-size: 13px; margin: 0; font-weight: 400; letter-spacing: 0.3px;">
                Yuhum Self-Photo Studio
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <p style="color: #333333; font-size: 14px; margin: 0 0 12px 0; font-weight: 500;">
                Hi there,
              </p>
              <p style="color: #666666; font-size: 13px; line-height: 1.6; margin: 0 0 28px 0;">
                We're excited to host you! We have received your booking and reserved your studio space. Please review your session summary below.
              </p>

              <!-- Package Highlight Box -->
              <div style="background-color: #fcfaf7; border-radius: 8px; padding: 20px; text-align: center; border: 1px solid #f3eeeA; margin-bottom: 32px;">
                <span style="color: #99887c; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; display: block; margin-bottom: 6px;">
                  SELECTED PACKAGE
                </span>
                <div style="color: #2D1B18; font-family: 'Georgia', serif; font-size: 20px; font-weight: 500; margin-bottom: 4px;">
                  ${packageTitle}
                </div>
                <div style="color: #8c6e58; font-size: 15px; font-weight: 600;">
                  ${basePrice}
                </div>
              </div>

              <!-- Session Details Section -->
              <div style="margin-bottom: 28px;">
                <span style="color: #99887c; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; display: block; margin-bottom: 16px;">
                  SESSION DETAILS
                </span>

                <!-- Details List Table -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px;">
                  
                  <tr>
                    <td style="color: #666666; padding: 8px 0; border-bottom: 1px solid #f5f2ee;">Studio Setup</td>
                    <td align="right" style="color: #1a1a1a; font-weight: 500; padding: 8px 0; border-bottom: 1px solid #f5f2ee;">${studio}</td>
                  </tr>

                  <tr>
                    <td style="color: #666666; padding: 8px 0; border-bottom: 1px solid #f5f2ee;">Date</td>
                    <td align="right" style="color: #1a1a1a; font-weight: 500; padding: 8px 0; border-bottom: 1px solid #f5f2ee;">${date}</td>
                  </tr>

                  <tr>
                    <td style="color: #666666; padding: 8px 0; border-bottom: 1px solid #f5f2ee;">Time Slot</td>
                    <td align="right" style="color: #1a1a1a; font-weight: 500; padding: 8px 0; border-bottom: 1px solid #f5f2ee;">${time}</td>
                  </tr>

                  <tr>
                    <td style="color: #666666; padding: 8px 0;">Add-ons</td>
                    <td align="right" style="color: #1a1a1a; font-weight: 500; padding: 8px 0;">${addOns}</td>
                  </tr>

                </table>
              </div>

              <!-- Quick Tip Callout -->
              <div style="border-left: 2px solid #dcb386; padding-left: 14px; margin: 32px 0 36px 0;">
                <p style="color: #666666; font-size: 12px; font-style: italic; line-height: 1.5; margin: 0;">
                  "Please arrive 10 minutes prior to your slot to prepare and enjoy the full duration of your session."
                </p>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 16px;">
                <a href="https://yuhumstudios.com" target="_blank" style="background-color: #2D1B18; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 600; padding: 12px 28px; border-radius: 6px; display: inline-block; letter-spacing: 0.5px;">
                  Manage Your Booking
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer Signature -->
          <tr>
            <td style="border-top: 1px solid #f0ebe6; padding: 24px 36px 32px 36px; text-align: center;">
              <div style="color: #333333; font-size: 13px; font-weight: 600; margin-bottom: 4px;">
                The Yuhum Studio Team
              </div>
              <div style="color: #999999; font-size: 11px;">
                Creating private spaces for authentic photos.
              </div>
            </td>
          </tr>

        </table>
      </body>
    </html>
  `;
}

module.exports = { BookingEmail };
