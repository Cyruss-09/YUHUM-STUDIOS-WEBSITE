// ── Save as server/emails/PasswordChangedEmail.js ───────────────────────
// Plain template function, matching the style of your other emails/*.js
// files (BookingEmail.js, PasswordResetEmail.js, etc). If those files pull
// shared header/footer markup or colors from ./emailBranding.js, swap the
// BRAND block below for that import instead — I don't have that file's
// exports, so this version is self-contained.

const BRAND = {
    primary: "#A3704C",
    ink: "#2C221E",
    muted: "#7A6B63",
    cream: "#FBF9F5",
    border: "#E8DFD1",
    alert: "#B3441F",
};

function PasswordChangedEmail({ username = "there", changedAt = new Date() }) {
    const formatted = new Date(changedAt).toLocaleString("en-PH", {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: "Asia/Manila",
    });

    return `
  <html lang="en">
    <body style="margin:0; padding:32px 0; background-color:${BRAND.cream}; font-family: Georgia, 'Times New Roman', serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <table role="presentation" width="480" cellpadding="0" cellspacing="0"
              style="background-color:#ffffff; border-radius:16px; border:1px solid ${BRAND.border}; padding:40px 36px;">
              <tr>
                <td>
                  <p style="color:${BRAND.muted}; font-size:11px; letter-spacing:0.05em; margin:0 0 18px; text-transform:uppercase;">
                    Yuhum Studios
                  </p>
                  <h1 style="color:${BRAND.ink}; font-size:20px; margin:0 0 8px;">Password Changed</h1>
                  <p style="color:${BRAND.muted}; font-size:14px; line-height:22px; margin:0 0 4px;">
                    Hi ${username}, this confirms the password for your Yuhum Studios account was
                    successfully changed on <strong>${formatted}</strong>.
                  </p>

                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                    style="background-color:#FCF8F3; border:1px solid ${BRAND.border}; border-radius:12px; margin:20px 0;">
                    <tr>
                      <td style="padding:14px 16px;">
                        <p style="color:${BRAND.ink}; font-size:13px; line-height:20px; margin:0;">
                          If you made this change, no further action is needed.
                        </p>
                      </td>
                    </tr>
                  </table>

                  <p style="color:${BRAND.alert}; font-size:13px; line-height:20px; margin:0 0 24px;">
                    Didn't make this change? Reset your password right away or reply to this
                    email so we can help secure your account.
                  </p>

                  <hr style="border:none; border-top:1px solid ${BRAND.border}; margin:0 0 16px;" />

                  <p style="color:${BRAND.muted}; font-size:11px; margin:0;">
                    Yuhum Studios · Iloilo City, Philippines
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

module.exports = { PasswordChangedEmail };