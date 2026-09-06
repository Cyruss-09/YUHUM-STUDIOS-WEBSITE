// server/emails/SubscriberEmail.js
const {
  STUDIO_BRAND,
  renderEmailHeader,
  renderCtaButton,
  renderEmailFooter,
} = require("./emailBranding");

/**
 * Redesigned Subscriber Campaign & Welcome Email for Yuhum Studios
 * Features official circular logo, editorial layout, prominent interactive CTAs,
 * and social community links.
 */
function SubscriberEmail({
  name,
  clientName,
  email,
  messageBody,
  unsubscribeUrl,
  actionText = "Explore Studio Packages",
  actionUrl,
} = {}) {
  const displayName =
    clientName ||
    name ||
    (email && typeof email === "string" && email.includes("@")
      ? email.split("@")[0]
      : null) ||
    "there";

  const resolvedActionUrl = actionUrl || `${STUDIO_BRAND.websiteUrl}#book`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yuhum Studios • Newsletter & Updates</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8F5F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #2C221E;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8F5F0; padding: 36px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #E8DFD1; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 32px rgba(163, 112, 76, 0.08);">
          
          <!-- Brand Header with Logo -->
          ${renderEmailHeader({
    categoryBadge: "STUDIO JOURNAL & UPDATES",
    title: "Yuhum Studios",
    subtitle: "Moments, stories, and creative snapshots from our lounge.",
  })}

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 30px;">
              
              <!-- Greeting -->
              <h2 style="margin: 0 0 14px; font-family: Georgia, 'Times New Roman', serif; font-size: 24px; color: #2C221E; font-weight: normal; letter-spacing: -0.01em;">
                Hi ${displayName} 👋
              </h2>

              <p style="margin: 0 0 22px; font-size: 15px; line-height: 1.7; color: #5C4D46;">
                Thank you for being part of the <strong>Yuhum Studios</strong> circle. Here is the latest news, updates, and promos straight from our self-shoot suites:
              </p>

              <!-- Editorial Story / Message Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #FAF7F2 0%, #F5EFE6 100%); border-left: 4px solid #A3704C; border-radius: 12px; padding: 22px 24px; margin-bottom: 28px;">
                <tr>
                  <td style="font-size: 15px; line-height: 1.75; color: #3E302B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    ${(messageBody || "")
      .split("\n")
      .filter((p) => p.trim())
      .map((paragraph) => `<p style="margin: 0 0 14px;">${paragraph}</p>`)
      .join("") ||
    "<p style=\"margin: 0;\">We are excited to share new backdrop themes, seasonal packages, and studio perks with you soon!</p>"
    }
                  </td>
                </tr>
              </table>

              <!-- Interactive CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0 28px;">
                <tr>
                  <td align="center">
                    ${renderCtaButton({
      href: resolvedActionUrl,
      text: actionText,
      icon: "✨",
    })}
                  </td>
                </tr>
              </table>

              <!-- Community Invitation Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF7F2; border: 1px solid #E8DFD1; border-radius: 14px; padding: 18px 20px; text-align: center; margin-bottom: 24px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px; font-size: 13px; font-weight: 700; color: #2C221E; letter-spacing: 0.05em; text-transform: uppercase;">
                      📸 Tag us in your studio shots
                    </p>
                    <p style="margin: 0 0 12px; font-size: 13px; color: #6A5A53; line-height: 1.5;">
                      Tag <strong>@yuhum.studios</strong> on Instagram & TikTok to be featured on our community feed and get surprise studio rewards!
                    </p>
                    <a href="${STUDIO_BRAND.instagramUrl}" target="_blank" style="display: inline-block; font-size: 12px; font-weight: 600; color: #A3704C; text-decoration: underline;">
                      Follow @yuhum.studios on Instagram ↗
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Interactive Footer with Unsubscribe -->
          ${renderEmailFooter({
      showSocials: true,
      unsubscribeUrl,
      supportNote: "You are receiving this because you subscribed to updates at Yuhum Studios.",
    })}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

module.exports = { SubscriberEmail };