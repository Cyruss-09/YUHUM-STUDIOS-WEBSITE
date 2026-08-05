// Returns an HTML string for a subscriber campaign email.
// Called as: SubscriberEmail({ name, messageBody, unsubscribeUrl })
function SubscriberEmail({ name, messageBody, unsubscribeUrl }) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e5e5; border-radius: 12px; padding: 24px;">
      <h2 style="color: #2D1B18; margin-top: 0;">Hi ${name || "there"}!</h2>

      <div style="line-height: 1.7;">
        ${messageBody || ""}
      </div>

      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />

      <p style="color: #999; font-size: 12px;">
        You're receiving this because you subscribed to Yuhum Studio updates.
        ${unsubscribeUrl ? `<a href="${unsubscribeUrl}" style="color: #999;">Unsubscribe</a>` : ""}
      </p>
    </div>
  `;
}

module.exports = { SubscriberEmail };
