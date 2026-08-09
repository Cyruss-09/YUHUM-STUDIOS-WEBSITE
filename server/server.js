require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");
const { BookingEmail } = require("./emails/BookingEmail");
const { ReviewEmail } = require("./emails/ReviewEmail");
const { SubscriberEmail } = require("./emails/SubscriberEmail");

const pool = require("./config/db");
const { verifyToken, requireAdmin } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");

const app = express();
app.use(cors());
app.use(express.json());

// Test DB connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Database Connection Failed:", err.message);
  } else {
    console.log("✅ Successfully connected to PostgreSQL Database!");
    release();
  }
});

// --- AUTH + ADMIN ROUTES ---
// /api/auth/register and /api/auth/login — open to anyone
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// --- RESEND INITIALIZATION & DIAGNOSTICS ---
const rawKey = (process.env.RESEND_API_KEY || "").trim();
const resend = rawKey ? new Resend(rawKey) : null;

console.log("--- Resend Env Diagnostics ---");
console.log("Resend API Key Loaded:", rawKey ? "✅ Yes" : "❌ Missing");
if (rawKey) {
  console.log("Key Preview:", `${rawKey.substring(0, 6)}...`);
}
console.log("------------------------------");

const FROM_EMAIL =
  process.env.FROM_EMAIL || "Yuhum Studio <onboarding@resend.dev>";
const ADMIN_EMAIL =
  process.env.STUDIO_RECEIVER_EMAIL || "yuhumstudios22@gmail.com";

// --- EMAIL SANDBOX MODE ---
// While using Resend's shared sandbox domain (onboarding@resend.dev) without
// a verified domain, Resend only allows sending to the email address on your
// own Resend account. Set DEV_EMAIL_SANDBOX=true in .env during local
// development so every email safely routes to ADMIN_EMAIL instead of
// triggering a 403. Once you verify a domain (resend.com/domains) and set a
// custom FROM_EMAIL on that domain, set DEV_EMAIL_SANDBOX=false (or remove it)
// to start sending to real customer addresses.
const SANDBOX_MODE = process.env.DEV_EMAIL_SANDBOX === "true";
const SANDBOX_RECIPIENT = ADMIN_EMAIL; // must match your Resend account email

console.log(
  SANDBOX_MODE
    ? "📦 Email sandbox mode: ON — all emails will be sent to " +
        SANDBOX_RECIPIENT
    : "📤 Email sandbox mode: OFF — emails will be sent to real recipients",
);

// Simple email format check, reused wherever we need to validate a customer email.
const isValidEmail = (value) =>
  typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

// Decides where an email actually gets sent:
// - In sandbox mode, everything goes to SANDBOX_RECIPIENT (avoids Resend 403s).
// - Otherwise, sends to the real candidate email if it's valid, falling back
//   to ADMIN_EMAIL only when no usable address was provided.
const resolveRecipient = (candidateEmail) => {
  if (SANDBOX_MODE) return SANDBOX_RECIPIENT;
  return isValidEmail(candidateEmail) ? candidateEmail.trim() : ADMIN_EMAIL;
};

/* ================= BOOKINGS ROUTE ================= */
// CHANGED: added verifyToken — booking now requires a logged-in user.
// req.user is set by verifyToken (from the JWT) and gives us { id, role }.
app.post("/api/bookings", verifyToken, async (req, res) => {
  const {
    packageId,
    packageTitle,
    basePrice,
    studio,
    date,
    dayOfWeek,
    time,
    addOns,
    firstName,
    lastName,
    phone,
    email,
    termsAccepted,
    paymentMode,
    couponCode,
    findUs,
  } = req.body;

  try {
    const addOnsArray = Array.isArray(addOns) ? addOns : [];

    // Safe fallback values
    const safePackageTitle = packageTitle || "Studio Session";
    const safeBasePrice = basePrice || "₱0";
    const safeStudio = studio || "Standard Studio";

    // Resolve alternative naming conventions from frontend payload
    const resolvedFindUs = findUs || null;
    const resolvedPaymentMode = paymentMode || null;
    const resolvedTerms =
      termsAccepted === true || termsAccepted === "true" || termsAccepted === 1;

    // CHANGED: added user_id column — ties every booking to the
    // authenticated user (req.user.id) instead of only a typed-in email.
    const queryText = `
      INSERT INTO bookings (
        package_id, 
        package_title, 
        base_price, 
        studio, 
        booking_date, 
        day_of_week, 
        booking_time, 
        add_ons, 
        "firstName", 
        "lastName", 
        phone, 
        email, 
        "termsAccepted", 
        "findUs", 
        "paymentMode", 
        "couponCode",
        user_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *;
    `;

    const values = [
      packageId || null,
      safePackageTitle,
      safeBasePrice,
      safeStudio,
      date || null,
      dayOfWeek || null,
      time || null,
      addOnsArray,
      firstName || null,
      lastName || null,
      phone ? parseInt(phone, 10) : null,
      email || null,
      resolvedTerms,
      resolvedFindUs,
      resolvedPaymentMode,
      couponCode || null,
      req.user.id, // CHANGED: attach the logged-in user's id
    ];

    const dbResult = await pool.query(queryText, values);

    const formattedAddOns =
      addOnsArray.length > 0 ? addOnsArray.join(", ") : "None";

    let emailSent = false;

    try {
      if (resend) {
        const recipient = resolveRecipient(email);

        const bookingHtml = BookingEmail({
          packageTitle: safePackageTitle,
          basePrice: safeBasePrice,
          studio: safeStudio,
          date:
            dayOfWeek && date
              ? `${dayOfWeek}, ${date}`
              : date || "Scheduled Date",
          time: time || "Scheduled Time",
          addOns: formattedAddOns,
          firstName,
          lastName,
          phone,
          email,
          paymentMode: resolvedPaymentMode,
          couponCode,
          findUs: resolvedFindUs,
        });

        await resend.emails.send({
          from: FROM_EMAIL,
          to: [recipient],
          subject: `Booking Confirmed - ${safePackageTitle}`,
          html: bookingHtml,
        });

        emailSent = true;
      }
    } catch (emailErr) {
      console.error(
        "⚠️ Booking saved, but Resend email dispatch failed:",
        emailErr.message || emailErr,
      );
    }

    return res.status(201).json({
      success: true,
      message: emailSent
        ? "Booking saved and confirmation email sent!"
        : "Booking saved successfully!",
      data: dbResult.rows[0],
    });
  } catch (error) {
    console.error("❌ Database query error (bookings):", error);
    return res.status(500).json({
      success: false,
      error: "Failed to complete booking processing.",
    });
  }
});

/* ================= REVIEWS ROUTE ================= */
app.post("/api/reviews", async (req, res) => {
  const {
    userEmail,
    overallRating,
    equipmentEase,
    roomPrivacy,
    propsSelection,
    favoriteBackdrop,
    comments,
    recommend,
  } = req.body;

  try {
    const queryText = `
      INSERT INTO reviews (overall_rating, equipment_ease, room_privacy, props_selection, favorite_backdrop, comments, recommend, user_email)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    // FIX: `recommend` had no fallback. If the frontend didn't send it (e.g. an
    // untouched yes/no toggle), it arrives as `undefined`, and node-postgres
    // throws on undefined query parameters — which crashed this entire route
    // (500) before the review was ever saved or an email ever attempted.
    const safeRecommend =
      recommend === true || recommend === "true" || recommend === 1
        ? true
        : recommend === false || recommend === "false" || recommend === 0
          ? false
          : null;

    const values = [
      overallRating || 0,
      equipmentEase || 0,
      roomPrivacy || 0,
      propsSelection || 0,
      favoriteBackdrop || null,
      comments || null,
      safeRecommend,
      userEmail || null,
    ];

    const result = await pool.query(queryText, values);

    let adminEmailSent = false;
    let customerEmailSent = false;

    // --- 1. Admin notification: always goes to the studio inbox ---
    try {
      if (resend) {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: [ADMIN_EMAIL],
          subject: `New Review Submitted (${overallRating || "N/A"} ⭐)`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e5e5; border-radius: 12px; padding: 24px;">
              <h2 style="color: #2D1B18;">New Customer Feedback Received</h2>
              <p><strong>Reviewer Email:</strong> ${userEmail || "Not provided"}</p>
              <hr style="border: none; border-top: 1px solid #eee;" />
              <ul style="line-height: 1.8;">
                <li><strong>Overall Rating:</strong> ${overallRating || "N/A"} / 5</li>
                <li><strong>Equipment Ease:</strong> ${equipmentEase || "N/A"} / 5</li>
                <li><strong>Room Privacy:</strong> ${roomPrivacy || "N/A"} / 5</li>
                <li><strong>Props Selection:</strong> ${propsSelection || "N/A"} / 5</li>
                <li><strong>Favorite Backdrop:</strong> ${favoriteBackdrop || "None selected"}</li>
                <li><strong>Recommends Us:</strong> ${safeRecommend === true ? "Yes" : safeRecommend === false ? "No" : "N/A"}</li>
              </ul>
              <p><strong>Comments:</strong></p>
              <blockquote style="background: #f9f9f9; padding: 12px; border-left: 4px solid #2D1B18; margin: 0;">
                ${comments || "No additional comments"}
              </blockquote>
            </div>
          `,
        });
        adminEmailSent = true;
      }
    } catch (adminEmailErr) {
      console.error(
        "⚠️ Review saved, but admin notification email failed:",
        adminEmailErr.message || adminEmailErr,
      );
    }

    // --- 2. Customer thank-you: routed through resolveRecipient so sandbox
    //        mode and the "valid email" fallback are both handled in one place ---
    try {
      if (resend) {
        const customerRecipient = resolveRecipient(userEmail);

        const reviewHtml = ReviewEmail({
          overallRating,
          equipmentEase,
          roomPrivacy,
          propsSelection,
          favoriteBackdrop,
          comments,
          userEmail,
        });

        await resend.emails.send({
          from: FROM_EMAIL,
          to: [customerRecipient],
          subject: "Thank you for your review! - Yuhum Studio",
          html: reviewHtml,
        });
        customerEmailSent = true;
      }
    } catch (customerEmailErr) {
      console.error(
        "⚠️ Review saved, but customer thank-you email failed:",
        customerEmailErr.message || customerEmailErr,
      );
    }

    return res.status(201).json({
      success: true,
      message:
        adminEmailSent && customerEmailSent
          ? "Review submitted! Admin notified and thank-you email sent."
          : adminEmailSent
            ? "Review submitted and admin notified! (Thank-you email not sent.)"
            : "Review submitted successfully!",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Database error (reviews):", err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to submit review." });
  }
});

/* ================= SUBSCRIBER EMAIL RESENDER ROUTE ================= */
app.post("/api/resend-campaign", async (req, res) => {
  const { campaignId } = req.body;

  if (!campaignId) {
    return res.status(400).json({ error: "Campaign ID is required." });
  }

  try {
    const campaignResult = await pool.query(
      "SELECT * FROM campaigns WHERE id = $1",
      [campaignId],
    );

    if (campaignResult.rows.length === 0) {
      return res.status(404).json({ error: "Campaign not found." });
    }
    const campaign = campaignResult.rows[0];

    const queryText = `
      SELECT s.id, s.email 
      FROM subscribers s 
      LEFT JOIN campaign_logs cl ON s.id = cl.subscriber_id AND cl.campaign_id = $1
      WHERE s.status = 'active' AND cl.id IS NULL
    `;
    const subscriberResult = await pool.query(queryText, [campaignId]);
    const subscribers = subscriberResult.rows;

    if (subscribers.length === 0) {
      return res.status(200).json({
        message: "No pending subscribers found for resending this campaign.",
      });
    }

    if (!resend) {
      return res
        .status(500)
        .json({ error: "Resend configuration missing (RESEND_API_KEY)." });
    }

    let successCount = 0;
    let failCount = 0;

    for (const sub of subscribers) {
      const recipient = resolveRecipient(sub.email);

      try {
        const subscriberHtml = SubscriberEmail({
          name: "Valued Subscriber",
          messageBody: campaign.body,
          unsubscribeUrl: `https://yuhumstudio.com/unsubscribe?email=${encodeURIComponent(sub.email)}`,
        });

        await resend.emails.send({
          from: FROM_EMAIL,
          to: [recipient],
          subject: campaign.subject,
          html: subscriberHtml,
        });

        await pool.query(
          "INSERT INTO campaign_logs (campaign_id, subscriber_id, status) VALUES ($1, $2, 'sent')",
          [campaignId, sub.id],
        );
        successCount++;
      } catch (mailError) {
        console.error(`❌ Failed to send to ${sub.email}:`, mailError.message);
        await pool.query(
          "INSERT INTO campaign_logs (campaign_id, subscriber_id, status) VALUES ($1, $2, 'failed')",
          [campaignId, sub.id],
        );
        failCount++;
      }
    }

    return res.status(200).json({
      success: true,
      message: "Resend process completed.",
      stats: {
        totalTargeted: subscribers.length,
        sentSuccessfully: successCount,
        failed: failCount,
      },
    });
  } catch (error) {
    console.error("❌ Resend campaign error:", error);
    return res
      .status(500)
      .json({ error: "Internal server error during resend process." });
  }
});

/* ================= SUBSCRIBERS ROUTE ================= */
app.post("/api/subscribers", async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes("@")) {
    return res
      .status(400)
      .json({ error: "Please enter a valid email address." });
  }

  try {
    const queryText = `
      INSERT INTO subscribers (email) 
      VALUES ($1) 
      ON CONFLICT (email) DO NOTHING
      RETURNING *;
    `;

    const cleanEmail = email.toLowerCase().trim();
    const result = await pool.query(queryText, [cleanEmail]);

    if (result.rows.length === 0) {
      return res.status(200).json({ message: "You are already subscribed!" });
    }

    // FIX: this route never sent anything through Resend — SubscriberEmail
    // was imported but unused. Send a welcome email now, same pattern as the
    // other routes (best-effort: subscription still succeeds if mail fails).
    let welcomeEmailSent = false;
    try {
      if (resend) {
        const recipient = resolveRecipient(cleanEmail);

        const subscriberHtml = SubscriberEmail({
          name: "Valued Subscriber",
          messageBody:
            "Thanks for subscribing to Yuhum Studio! We'll keep you posted on new sessions, promos, and updates.",
          unsubscribeUrl: `https://yuhumstudio.com/unsubscribe?email=${encodeURIComponent(cleanEmail)}`,
        });

        await resend.emails.send({
          from: FROM_EMAIL,
          to: [recipient],
          subject: "Welcome to Yuhum Studio!",
          html: subscriberHtml,
        });

        welcomeEmailSent = true;
      }
    } catch (welcomeEmailErr) {
      console.error(
        "⚠️ Subscriber saved, but welcome email failed:",
        welcomeEmailErr.message || welcomeEmailErr,
      );
    }

    return res.status(201).json({
      message: welcomeEmailSent
        ? "Thank you for subscribing! A welcome email is on its way."
        : "Thank you for subscribing!",
    });
  } catch (err) {
    console.error("Database error (subscribers):", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

/* ================= SERVER LISTEN ================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running and listening on port ${PORT}`);
});
