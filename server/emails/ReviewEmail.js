// server/emails/ReviewEmail.js
const {
  STUDIO_BRAND,
  renderEmailHeader,
  renderCtaButton,
  renderEmailFooter,
} = require("./emailBranding");

/**
 * Redesigned Customer Review Thank-You Email for Yuhum Studios
 * Features official circular logo, golden star breakdown card, customer quote callout,
 * interactive booking CTA, and social tagging prompt.
 */
function ReviewEmail({
  overallRating,
  equipmentEase,
  roomPrivacy,
  propsSelection,
  favoriteBackdrop,
  comments,
  userEmail,
}) {
  const stars = (n) => {
    const val = Number(n) || 0;
    return Array.from({ length: 5 }, (_, i) =>
      i < val
        ? "<span style=\"color: #D4A359;\">★</span>"
        : "<span style=\"color: #D8C7B8;\">☆</span>"
    ).join(" ");
  };

  const ratingRow = (label, value) => `
    <tr>
      <td style="padding: 9px 0; border-bottom: 1px solid #F0EAE1; color: #5C4D46; font-size: 13px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        ${label}
      </td>
      <td style="padding: 9px 0; border-bottom: 1px solid #F0EAE1; text-align: right; font-size: 16px; letter-spacing: 2px;">
        ${value ? stars(value) : "<span style=\"color: #A8988F; font-size: 12px; letter-spacing: normal;\">Not rated</span>"}
      </td>
    </tr>
  `;

  const overall = Number(overallRating) || 0;
  const opener =
    overall >= 4
      ? "We're over the moon knowing your session felt so memorable! Thank you for brightening our day with your kind review."
      : overall > 0
        ? "Thank you so much for your honest feedback — every insight helps our studio team refine and elevate future visits."
        : "Thank you for taking a moment to share your self-shoot lounge experience with us.";

  const displayName = (userEmail || "").split("@")[0] || "there";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank you for your review • Yuhum Studios</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8F5F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #2C221E;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8F5F0; padding: 36px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #E8DFD1; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 32px rgba(163, 112, 76, 0.08);">
          
          <!-- Brand Header with Logo -->
          ${renderEmailHeader({
            categoryBadge: "CUSTOMER EXPERIENCE & FEEDBACK",
            title: "Yuhum Studios",
            subtitle: "Self-Shoot Studio Lounge",
          })}

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 28px;">
              
              <!-- Greeting & Opener -->
              <h2 style="margin: 0 0 12px; font-family: Georgia, 'Times New Roman', serif; font-size: 24px; color: #2C221E; font-weight: normal; letter-spacing: -0.01em;">
                Thank you, ${displayName}! 🎉
              </h2>

              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.7; color: #5C4D46;">
                ${opener}
              </p>

              <!-- Ratings Summary Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #FAF7F2 0%, #F5EFE6 100%); border: 1px solid #E8DFD1; border-radius: 16px; padding: 22px 24px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #A3704C; font-weight: 700;">
                      ⭐ Your Session Scores
                    </p>
                    
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      ${ratingRow("Overall Experience", overallRating)}
                      ${ratingRow("Equipment & Clicker Ease", equipmentEase)}
                      ${ratingRow("Studio Room Privacy", roomPrivacy)}
                      ${ratingRow("Props & Backdrop Selection", propsSelection)}
                    </table>

                    <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #E8DFD1; font-size: 13px; color: #5C4D46;">
                      <strong>Favorite backdrop:</strong>
                      <span style="display: inline-block; margin-left: 6px; padding: 2px 10px; background-color: #FFFFFF; border: 1px solid #D8C7B5; border-radius: 6px; font-size: 12px; font-weight: 600; color: #2C221E;">
                        ${favoriteBackdrop || "None selected"}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Customer Comments Quote -->
              ${comments ? `
                <div style="margin-bottom: 26px;">
                  <p style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #7A6B63; font-weight: 700;">
                    What you shared with our team:
                  </p>
                  <div style="background-color: #FFFDF9; border-left: 4px solid #A3704C; border: 1px solid #F0EAE1; border-left-width: 4px; border-radius: 10px; padding: 16px 20px; font-style: italic; font-size: 14px; line-height: 1.6; color: #3E302B;">
                    "${comments}"
                  </div>
                </div>
              ` : ""}

              <!-- Interactive CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 28px 0 24px;">
                <tr>
                  <td align="center">
                    ${renderCtaButton({
                      href: `${STUDIO_BRAND.websiteUrl}#book`,
                      text: "Book Your Next Session",
                      icon: "📸",
                    })}
                  </td>
                </tr>
              </table>

              <!-- Social Tagging Feature -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF7F2; border: 1px dashed #E8DFD1; border-radius: 14px; padding: 18px 20px; text-align: center; margin-bottom: 12px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 6px; font-size: 13px; font-weight: 700; color: #2C221E;">
                      ✨ Share your shots with us
                    </p>
                    <p style="margin: 0 0 10px; font-size: 13px; color: #6A5A53; line-height: 1.5;">
                      Tag <strong>@yuhum.studios</strong> on Instagram to be featured on our official stories & highlights!
                    </p>
                    <a href="${STUDIO_BRAND.instagramUrl}" target="_blank" style="display: inline-block; font-size: 12px; font-weight: 600; color: #A3704C; text-decoration: underline;">
                      Follow @yuhum.studios ↗
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Interactive Footer -->
          ${renderEmailFooter({
            showSocials: true,
            supportNote: "Have questions about your photos or prints? Reply directly to this email anytime.",
          })}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

module.exports = { ReviewEmail };