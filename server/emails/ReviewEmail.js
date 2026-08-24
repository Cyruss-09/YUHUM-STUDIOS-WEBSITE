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
  const stars = (n) => {
    const val = Number(n) || 0;
    return Array.from({ length: 5 }, (_, i) =>
      i < val ? "★" : "☆"
    ).join("");
  };

  const ratingRow = (label, value) => `
    <tr>
      <td style="padding: 6px 0; color: #4a3a37; font-size: 14px;">${label}</td>
      <td style="padding: 6px 0; text-align: right; font-size: 15px; letter-spacing: 2px; color: #d9a441;">
        ${value ? stars(value) : `<span style="color:#bbb; letter-spacing:0; font-size:13px;">Not rated</span>`}
      </td>
    </tr>
  `;

  // Friendly opening that reacts a bit to the score, instead of one flat line for everyone
  const overall = Number(overallRating) || 0;
  const opener =
    overall >= 4
      ? "We're so glad your session felt this good — thank you for making our day with a review like this!"
      : overall > 0
        ? "Thanks for the honest feedback — it genuinely helps us make the next visit even better."
        : "Thanks for taking a moment to share your experience with us.";

  const firstName = (userEmail || "").split("@")[0] || "there";

  return `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #fffaf5; border: 1px solid #f0e4da; border-radius: 16px; overflow: hidden;">

      <div style="background: #2D1B18; padding: 28px 24px; text-align: center;">
        <p style="margin: 0; color: #f3d9b1; font-size: 12px; letter-spacing: 3px; text-transform: uppercase;">Yuhum Studio</p>
        <h1 style="margin: 8px 0 0; color: #ffffff; font-size: 22px; font-weight: 600;">Thank you, ${firstName}! 🎉</h1>
      </div>

      <div style="padding: 28px 24px;">
        <p style="color: #3a2a27; font-size: 15px; line-height: 1.6;">${opener}</p>

        <div style="background: #ffffff; border: 1px solid #f0e4da; border-radius: 12px; padding: 18px 20px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            ${ratingRow("Overall Experience", overallRating)}
            ${ratingRow("Equipment Ease", equipmentEase)}
            ${ratingRow("Room Privacy", roomPrivacy)}
            ${ratingRow("Props Selection", propsSelection)}
          </table>
          <div style="border-top: 1px solid #f0e4da; margin-top: 12px; padding-top: 12px; font-size: 14px; color: #4a3a37;">
            <strong>Favorite backdrop:</strong> ${favoriteBackdrop || "None selected"}
          </div>
        </div>

        ${comments
      ? `<p style="color: #3a2a27; font-size: 14px; margin-bottom: 6px;"><strong>What you told us:</strong></p>
               <div style="background: #fff4e6; border-left: 3px solid #d9a441; border-radius: 6px; padding: 14px 16px; color: #4a3a37; font-size: 14px; line-height: 1.6; font-style: italic;">
                 "${comments}"
               </div>`
      : ""
    }

        <div style="text-align: center; margin: 28px 0 8px;">
          <a href="https://yuhumstudio.com/book" style="display: inline-block; background: #2D1B18; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 999px; font-size: 14px; font-weight: 600;">
            Book Your Next Session
          </a>
        </div>

        <p style="color: #7a6a66; font-size: 13px; text-align: center; margin-top: 20px;">
          Have a question about your visit? Just reply to this email — a real person reads every one.
        </p>
      </div>

      <div style="background: #f7ede1; padding: 16px 24px; text-align: center;">
        <p style="color: #a8938d; font-size: 12px; margin: 0;">With gratitude, the Yuhum Studio team</p>
      </div>
    </div>
  `;
}

module.exports = { ReviewEmail };