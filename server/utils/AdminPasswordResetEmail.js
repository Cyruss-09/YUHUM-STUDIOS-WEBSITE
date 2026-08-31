const { resend } = require("../config/mailer");

const FROM_EMAIL = process.env.FROM_EMAIL;
const isDevSandbox = process.env.DEV_EMAIL_SANDBOX === "true";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

async function sendAdminResetEmail(toEmail, resetLink) {
    const recipient = isDevSandbox ? ADMIN_EMAIL : toEmail;

    await resend.emails.send({
        from: FROM_EMAIL,
        to: recipient,
        subject: "Reset your Yuhum Studios Admin password",
        html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #2C1810;">Reset your admin password</h2>
        <p>We received a request to reset the password for this admin account.</p>
        <p>
          <a href="${resetLink}"
             style="display:inline-block; background:#2C1810; color:#fdfbf7; padding:12px 20px; border-radius:8px; text-decoration:none;">
            Reset Password
          </a>
        </p>
        <p style="font-size: 12px; color: #7A6B63;">
          This link expires in 30 minutes. If you didn't request this, you can ignore this email.
        </p>
      </div>
    `,
    });
}

module.exports = { sendAdminResetEmail };