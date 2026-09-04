// server/emails/emailBranding.js
/**
 * Shared branding, design system tokens, and interactive helpers
 * for all Yuhum Studios transactional and promotional emails.
 */

const STUDIO_BRAND = {
  name: "Yuhum Studios",
  tagline: "Self-Shoot Studio Lounge",
  address: "Santa Rosa City, Laguna, Philippines",
  email: "yuhumstudios22@gmail.com",
  phone: "+63 912 345 6789",
  mapsUrl: "https://maps.google.com/?q=The+Yuhum+Studios+Self-shoot+Santa+Rosa",
  instagramUrl: "https://www.instagram.com/yuhum.studios/",
  facebookUrl: "https://www.facebook.com/yuhum.studiosph",
  tiktokUrl: "https://www.tiktok.com/@yuhumstudios",
  websiteUrl: process.env.CLIENT_URL || "https://yuhumstudio.com",
  // Publicly hosted GitHub Raw asset for the official "yuhum.studios home pic.jpg"
  // Confirmed 200 OK across public mail clients (Gmail, Outlook Web, Apple Mail).
  logoUrl:
    process.env.STUDIO_LOGO_URL ||
    "https://raw.githubusercontent.com/Cyruss-09/YUHUM-STUDIOS-WEBSITE/main/client/public/yuhum.studios%20home%20pic.jpg",
};

/**
 * Generates an interactive Google Calendar 'Add to Calendar' URL
 */
function createGoogleCalendarUrl({ title, description, location, dateStr, timeStr }) {
  try {
    const cleanDate = (dateStr || "").replace(/^[A-Za-z]+,\s*/, "").trim();
    const baseDate = new Date(`${cleanDate} ${timeStr || "10:00 AM"}`);

    if (isNaN(baseDate.getTime())) {
      return null;
    }

    const startDate = baseDate;
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // default 1 hr session

    const formatUtc = (d) =>
      d.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const dates = `${formatUtc(startDate)}/${formatUtc(endDate)}`;
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: title || "Yuhum Studios Self-Shoot Session",
      details: description || "Your reserved photography session at Yuhum Studios.",
      location: location || STUDIO_BRAND.address,
      dates,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  } catch (err) {
    return null;
  }
}

/**
 * Standard Email Header with official Yuhum Studios circular logo badge
 */
function renderEmailHeader({
  logoUrl = STUDIO_BRAND.logoUrl,
  categoryBadge = "SELF-SHOOT STUDIO LOUNGE",
  title = "Yuhum Studios",
  subtitle = null,
  isDark = false,
}) {
  const bg = isDark
    ? "linear-gradient(135deg, #161F30 0%, #0B0F17 100%)"
    : "linear-gradient(135deg, #FAF7F2 0%, #F3ECE2 100%)";
  const borderBottom = isDark ? "#2A364F" : "#E8DFD1";
  const logoBorder = isDark ? "#F59E0B" : "#A3704C";
  const logoShadow = isDark
    ? "0 4px 18px rgba(245, 158, 11, 0.25)"
    : "0 4px 16px rgba(163, 112, 76, 0.18)";
  const badgeBg = isDark ? "rgba(245, 158, 11, 0.15)" : "#EFE6DA";
  const badgeBorder = isDark ? "rgba(245, 158, 11, 0.35)" : "#DFD3C3";
  const badgeColor = isDark ? "#F59E0B" : "#8C5A35";
  const titleColor = isDark ? "#F8FAFC" : "#2C221E";
  const dotColor = isDark ? "#F59E0B" : "#A3704C";
  const subtitleColor = isDark ? "#94A3B8" : "#7A6B63";

  return `
    <!-- Header with Brand Logo and Identity -->
    <tr>
      <td style="background: ${bg}; padding: 34px 24px 26px; text-align: center; border-bottom: 1px solid ${borderBottom};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center">
              <!-- Circular Logo with Brand Ring -->
              <a href="${STUDIO_BRAND.websiteUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 3px; border-radius: 50%; border: 2px solid ${logoBorder}; box-shadow: ${logoShadow}; background-color: #ffffff; text-align: center;">
                      <img
                        src="${logoUrl}"
                        alt="Yuhum Studios Logo"
                        width="80"
                        height="80"
                        style="display: block; width: 80px; height: 80px; object-fit: cover; border-radius: 50%; border: 0;"
                      />
                    </td>
                  </tr>
                </table>
              </a>

              <!-- Category Badge -->
              <div style="margin-top: 14px; display: inline-block; padding: 4px 14px; background-color: ${badgeBg}; border: 1px solid ${badgeBorder}; border-radius: 999px; font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: ${badgeColor}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                ${categoryBadge}
              </div>

              <!-- Brand Name -->
              <h1 style="margin: 10px 0 0; font-family: Georgia, 'Times New Roman', serif; font-size: 25px; font-weight: normal; letter-spacing: 0.12em; text-transform: uppercase; color: ${titleColor}; line-height: 1.2;">
                Yuhum<span style="color: ${dotColor};">.</span>Studios
              </h1>

              ${subtitle ? `
                <p style="margin: 6px 0 0; font-size: 12px; letter-spacing: 0.05em; color: ${subtitleColor}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                  ${subtitle}
                </p>
              ` : ""}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

/**
 * Bulletproof Interactive CTA Button
 */
function renderCtaButton({
  href,
  text,
  isDark = false,
  secondary = false,
  icon = "",
  style = "",
}) {
  const gradient = secondary
    ? isDark
      ? "background: #1E293B; border: 1px solid #334155; color: #F1F5F9;"
      : "background: #FFFFFF; border: 1px solid #D8C7B5; color: #2C221E;"
    : isDark
      ? "background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: #0F172A; font-weight: 700; box-shadow: 0 4px 16px rgba(245, 158, 11, 0.35);"
      : "background: linear-gradient(135deg, #A3704C 0%, #8C5A35 100%); color: #FFFFFF; font-weight: 600; box-shadow: 0 4px 16px rgba(163, 112, 76, 0.32);";

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto; display: inline-table;">
      <tr>
        <td align="center" style="border-radius: 999px;">
          <a
            href="${href}"
            target="_blank"
            style="display: inline-block; padding: 13px 28px; text-decoration: none; border-radius: 999px; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; ${gradient} ${style}"
          >
            ${icon ? `<span style="margin-right: 6px;">${icon}</span>` : ""}${text}
          </a>
        </td>
      </tr>
    </table>
  `;
}

/**
 * Standard Interactive Email Footer
 */
function renderEmailFooter({
  isDark = false,
  unsubscribeUrl = null,
  showSocials = true,
  supportNote = null,
}) {
  const bg = isDark ? "#0B0F17" : "#FAF7F2";
  const borderTop = isDark ? "#243048" : "#E8DFD1";
  const textColor = isDark ? "#94A3B8" : "#7A6B63";
  const mutedColor = isDark ? "#64748B" : "#A8988F";
  const linkColor = isDark ? "#F59E0B" : "#A3704C";
  const currentYear = new Date().getFullYear();

  return `
    <!-- Interactive Studio Footer -->
    <tr>
      <td style="background-color: ${bg}; padding: 32px 24px; text-align: center; border-top: 1px solid ${borderTop}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          
          ${showSocials ? `
            <!-- Interactive Social Community Links -->
            <tr>
              <td align="center" style="padding-bottom: 20px;">
                <p style="margin: 0 0 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: ${mutedColor}; font-weight: 600;">
                  Connect with Yuhum Studios
                </p>
                <div style="font-size: 12px; line-height: 2;">
                  <a href="${STUDIO_BRAND.instagramUrl}" target="_blank" style="color: ${linkColor}; text-decoration: none; font-weight: 600; margin: 0 8px;">
                    📸 Instagram
                  </a>
                  <span style="color: ${mutedColor};">•</span>
                  <a href="${STUDIO_BRAND.facebookUrl}" target="_blank" style="color: ${linkColor}; text-decoration: none; font-weight: 600; margin: 0 8px;">
                    💬 Facebook
                  </a>
                  <span style="color: ${mutedColor};">•</span>
                  <a href="${STUDIO_BRAND.tiktokUrl}" target="_blank" style="color: ${linkColor}; text-decoration: none; font-weight: 600; margin: 0 8px;">
                    🎵 TikTok
                  </a>
                  <span style="color: ${mutedColor};">•</span>
                  <a href="${STUDIO_BRAND.websiteUrl}" target="_blank" style="color: ${linkColor}; text-decoration: none; font-weight: 600; margin: 0 8px;">
                    🌐 Website
                  </a>
                </div>
              </td>
            </tr>
          ` : ""}

          <!-- Studio Location & Interactive Contact -->
          <tr>
            <td align="center" style="padding-bottom: 14px; font-size: 12px; color: ${textColor}; line-height: 1.7;">
              <p style="margin: 0;">
                📍 <strong>${STUDIO_BRAND.name}</strong> • ${STUDIO_BRAND.address}
              </p>
              <p style="margin: 4px 0 0;">
                <a href="${STUDIO_BRAND.mapsUrl}" target="_blank" style="color: ${linkColor}; text-decoration: underline;">
                  Open Studio in Google Maps ↗
                </a>
                <span style="color: ${mutedColor}; margin: 0 6px;">•</span>
                <a href="mailto:${STUDIO_BRAND.email}" style="color: ${textColor}; text-decoration: none;">
                  ${STUDIO_BRAND.email}
                </a>
              </p>
            </td>
          </tr>

          ${supportNote ? `
            <tr>
              <td align="center" style="padding-bottom: 14px; font-size: 12px; color: ${textColor}; line-height: 1.6;">
                ${supportNote}
              </td>
            </tr>
          ` : ""}

          ${unsubscribeUrl ? `
            <tr>
              <td align="center" style="padding-top: 8px; padding-bottom: 10px;">
                <a href="${unsubscribeUrl}" target="_blank" style="color: ${mutedColor}; font-size: 11px; text-decoration: underline;">
                  Unsubscribe from promotional emails
                </a>
              </td>
            </tr>
          ` : ""}

          <!-- Copyright -->
          <tr>
            <td align="center" style="padding-top: 10px; font-size: 11px; color: ${mutedColor};">
              © ${currentYear} ${STUDIO_BRAND.name}. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  `;
}

module.exports = {
  STUDIO_BRAND,
  createGoogleCalendarUrl,
  renderEmailHeader,
  renderCtaButton,
  renderEmailFooter,
};
