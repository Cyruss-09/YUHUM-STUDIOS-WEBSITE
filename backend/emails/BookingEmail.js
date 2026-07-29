// Returns an HTML string for the booking confirmation email.
// Called as: BookingEmail({ packageTitle, basePrice, studio, date, time, addOns, userEmail })
function BookingEmail({
  packageTitle,
  basePrice,
  studio,
  date,
  time,
  addOns,
  userEmail,
}) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e5e5; border-radius: 12px; padding: 24px;">
      <h2 style="color: #2D1B18; margin-top: 0;">Your Booking is Confirmed!</h2>
      <p>Hi ${userEmail || "there"}, thanks for booking with Yuhum Studio. Here are your session details:</p>

      <hr style="border: none; border-top: 1px solid #eee;" />

      <ul style="line-height: 1.8; padding-left: 20px;">
        <li><strong>Package:</strong> ${packageTitle}</li>
        <li><strong>Price:</strong> ${basePrice}</li>
        <li><strong>Studio:</strong> ${studio}</li>
        <li><strong>Date:</strong> ${date}</li>
        <li><strong>Time:</strong> ${time}</li>
        <li><strong>Add-ons:</strong> ${addOns}</li>
      </ul>

      <p style="margin-top: 24px;">If you need to reschedule or have any questions, just reply to this email.</p>
      <p style="color: #999; font-size: 12px; margin-top: 24px;">— Yuhum Studio</p>
    </div>
  `;
}

module.exports = { BookingEmail };