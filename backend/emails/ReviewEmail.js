// Returns an HTML string for the customer thank-you email after a review.
// Called as: ReviewEmail({ overallRating, equipmentEase, roomPrivacy, propsSelection, favoriteBackdrop, comments, userEmail })
function ReviewEmail({
  overallRating,
  equipmentEase,
  roomPrivacy,
  propsSelection,
  favoriteBackdrop,
  comments,
  userEmail,
}) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e5e5; border-radius: 12px; padding: 24px;">
      <h2 style="color: #2D1B18; margin-top: 0;">Thank You for Your Feedback!</h2>
      <p>Hi ${userEmail || "there"}, we really appreciate you taking the time to share your experience with Yuhum Studio.</p>

      <hr style="border: none; border-top: 1px solid #eee;" />

      <p><strong>Here's a summary of what you shared:</strong></p>
      <ul style="line-height: 1.8; padding-left: 20px;">
        <li><strong>Overall Rating:</strong> ${overallRating || "N/A"} / 5</li>
        <li><strong>Equipment Ease:</strong> ${equipmentEase || "N/A"} / 5</li>
        <li><strong>Room Privacy:</strong> ${roomPrivacy || "N/A"} / 5</li>
        <li><strong>Props Selection:</strong> ${propsSelection || "N/A"} / 5</li>
        <li><strong>Favorite Backdrop:</strong> ${favoriteBackdrop || "None selected"}</li>
      </ul>

      ${
        comments
          ? `<p><strong>Your comments:</strong></p>
             <blockquote style="background: #f9f9f9; padding: 12px; border-left: 4px solid #2D1B18; margin: 0;">${comments}</blockquote>`
          : ""
      }

      <p style="margin-top: 24px;">We hope to see you again soon!</p>
      <p style="color: #999; font-size: 12px; margin-top: 24px;">— Yuhum Studio</p>
    </div>
  `;
}

module.exports = { ReviewEmail };