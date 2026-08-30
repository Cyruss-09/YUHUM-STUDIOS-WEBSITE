// emails/PasswordResetEmail.js
const PasswordResetEmail = ({ resetUrl }) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e5e5; border-radius: 12px; padding: 24px;">
    <h2 style="color: #2D1B18;">Reset Your Password</h2>
    <p>We received a request to reset your Yuhum Studio account password.</p>
    <p><a href="${resetUrl}" style="background:#2D1B18;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Reset Password</a></p>
    <p style="color:#888;font-size:13px;">This link expires in 15 minutes. If you didn't request this, ignore this email.</p>
  </div>
`;

module.exports = { PasswordResetEmail };