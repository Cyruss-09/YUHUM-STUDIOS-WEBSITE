// ReviewEmail.js
const ReviewEmail = (data = {}) => {
  const {
    overallRating = 5,
    equipmentEase,
    roomPrivacy,
    propsSelection,
    favoriteBackdrop,
    comments,
  } = data;

  const ratingNum = Number(overallRating) || 5;

  // Render stars dynamically
  const renderStars = (rating) => {
    let stars = "";
    for (let i = 1; i <= 5; i++) {
      stars += `<span style="font-size: 18px; color: ${
        i <= rating ? "#D97706" : "#E5E7EB"
      }; margin: 0 1px;">★</span>`;
    }
    return stars;
  };

  // Helper for breakdown rows
  const renderMetricRow = (label, score) => {
    if (!score) return "";
    return `
      <tr>
        <td style="padding: 6px 0; color: #5D4037; font-size: 13px; font-weight: 300;">${label}</td>
        <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #2D1B18;">${score} / 5</td>
      </tr>
    `;
  };

  const hasBreakdown = equipmentEase || roomPrivacy || propsSelection || favoriteBackdrop;

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank You for Your Feedback</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #FDFBF7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        
        <!-- Outer Wrapper -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FDFBF7; padding: 40px 16px;">
          <tr>
            <td align="center">
              
              <!-- Card Container -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #FFFFFF; border: 1px solid #F0E6DD; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(45, 27, 24, 0.04);">
                
                <!-- Hero Header -->
                <tr>
                  <td style="background-color: #2D1B18; padding: 36px 32px; text-align: center;">
                    <div style="display: inline-block; background-color: #3E2723; border: 1px solid #5D4037; border-radius: 20px; padding: 4px 14px; margin-bottom: 16px;">
                      <span style="color: #FDE68A; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">Feedback Confirmation</span>
                    </div>
                    <h1 style="color: #FFFBEB; font-size: 22px; font-weight: 300; margin: 0; letter-spacing: -0.3px; line-height: 1.3;">
                      Thank You for Shuttering with Us
                    </h1>
                    <p style="color: #A1887F; font-size: 13px; font-weight: 300; margin: 8px 0 0 0;">
                      Yuhum Self-Photo Studio
                    </p>
                  </td>
                </tr>

                <!-- Main Content -->
                <tr>
                  <td style="padding: 32px 32px 24px 32px;">
                    <p style="margin: 0 0 16px 0; color: #2D1B18; font-size: 15px; font-weight: 400;">
                      Hi there,
                    </p>
                    <p style="margin: 0 0 24px 0; color: #5D4037; font-size: 14px; line-height: 1.6; font-weight: 300;">
                      We received your feedback! Your insights help us fine-tune our private rooms, lighting setups, and backdrop selections for every session.
                    </p>

                    <!-- Overall Score Highlight Card -->
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAF5F0; border: 1px solid #F0E6DD; border-radius: 14px; margin-bottom: 20px;">
                      <tr>
                        <td style="padding: 20px; text-align: center;">
                          <p style="margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; tracking: 1.5px; color: #A1887F; font-weight: 600;">Overall Rating</p>
                          <div style="margin-bottom: 6px;">
                            ${renderStars(ratingNum)}
                          </div>
                          <p style="margin: 0; color: #2D1B18; font-size: 18px; font-weight: 600;">
                            ${ratingNum} / 5 Stars
                          </p>
                        </td>
                      </tr>
                    </table>

                    ${
                      hasBreakdown
                        ? `
                    <!-- Detailed Breakdown -->
                    <div style="border: 1px solid #F0E6DD; border-radius: 14px; padding: 18px; margin-bottom: 24px; background-color: #FFFFFF;">
                      <p style="margin: 0 0 12px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #A1887F; font-weight: 600;">Session Details</p>
                      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                        ${renderMetricRow("Equipment Ease", equipmentEase)}
                        ${renderMetricRow("Room Privacy", roomPrivacy)}
                        ${renderMetricRow("Props Variety", propsSelection)}
                        ${
                          favoriteBackdrop
                            ? `
                        <tr>
                          <td style="padding: 6px 0; color: #5D4037; font-size: 13px; font-weight: 300;">Selected Backdrop</td>
                          <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #2D1B18;">${favoriteBackdrop}</td>
                        </tr>
                        `
                            : ""
                        }
                      </table>
                    </div>
                    `
                        : ""
                    }

                    ${
                      comments
                        ? `
                    <!-- User Comments Quote Block -->
                    <div style="background-color: #FFFDF9; border-left: 3px solid #D97706; padding: 12px 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                      <p style="margin: 0; color: #5D4037; font-size: 13px; font-style: italic; line-height: 1.5;">
                        "${comments}"
                      </p>
                    </div>
                    `
                        : ""
                    }

                    <!-- Book Next Session CTA -->
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 28px;">
                      <tr>
                        <td align="center">
                          <a href="http://localhost:3000" target="_blank" style="display: inline-block; background-color: #2D1B18; color: #FFFBEB; font-size: 13px; text-decoration: none; font-weight: 500; letter-spacing: 0.5px; padding: 14px 28px; border-radius: 12px; transition: background-color 0.2s;">
                            Book Your Next Session
                          </a>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>

                <!-- Footer Divider -->
                <tr>
                  <td style="padding: 0 32px;">
                    <hr style="border: 0; border-top: 1px solid #F0E6DD; margin: 0;" />
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 32px; text-align: center;">
                    <p style="margin: 0 0 4px 0; color: #2D1B18; font-size: 13px; font-weight: 600;">
                      The Yuhum Studio Team
                    </p>
                    <p style="margin: 0; color: #A1887F; font-size: 11px; font-weight: 300;">
                      Creating private spaces for authentic photos.
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
};

module.exports = { ReviewEmail };