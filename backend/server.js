require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const { Resend } = require("resend");
const { BookingEmail } = require("./BookingEmail");
const { ReviewEmail } = require("./ReviewEmail");
const { SubscriberEmail } = require("./SubscriberEmail");

const app = express();
app.use(cors());
app.use(express.json());

// --- POSTGRESQL POOL CONFIGURATION ---
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "Yuhum.Studio.db",
  password: String(process.env.DB_PASSWORD || "").trim(),
  port: parseInt(process.env.DB_PORT || "5432", 10),
});

// Test DB connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Database Connection Failed:", err.message);
  } else {
    console.log("✅ Successfully connected to PostgreSQL Database!");
    release();
  }
});

// --- RESEND INITIALIZATION & DIAGNOSTICS ---
const rawKey = (process.env.RESEND_API_KEY || "").trim();
const resend = rawKey ? new Resend(rawKey) : null;

console.log("--- Resend Env Diagnostics ---");
console.log("Resend API Key Loaded:", rawKey ? "✅ Yes" : "❌ Missing");
if (rawKey) {
  console.log("Key Preview:", `${rawKey.substring(0, 6)}...`);
}
console.log("------------------------------");

/* ================= BOOKINGS ROUTE ================= */
app.post("/api/bookings", async (req, res) => {
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
    termsAccepted, // Fallback if frontend sends underscore version
    paymentMode,
    payment_mode, // Fallback if frontend sends underscore version
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
    const resolvedFindUs = findUs || find_us || null;
    const resolvedPaymentMode = paymentMode || payment_mode || null;
    const resolvedTerms =
      termsAccepted === true || termsAccepted === "true" || termsAccepted === 1;

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
        "couponCode"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
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
    ];

    const dbResult = await pool.query(queryText, values);

    const formattedAddOns =
      addOnsArray.length > 0 ? addOnsArray.join(", ") : "None";

    let emailSent = false;

    try {
      if (resend) {
        const FROM_EMAIL =
          process.env.FROM_EMAIL || "Yuhum Studio <onboarding@resend.dev>";

        const recipient =
          process.env.NODE_ENV === "production" && email
            ? email
            : process.env.STUDIO_RECEIVER_EMAIL || "yuhumstudios22@gmail.com";

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
          userEmail: email || "Valued Customer",
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

/* ================= REVIEWS ROUTE (WITH EMAIL RESENDER) ================= */
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

    const values = [
      overallRating || 0,
      equipmentEase || 0,
      roomPrivacy || 0,
      propsSelection || 0,
      favoriteBackdrop || null,
      comments || null,
      recommend,
      userEmail || null,
    ];

    const result = await pool.query(queryText, values);

    let emailSent = false;

    try {
      if (resend) {
        const FROM_EMAIL =
          process.env.FROM_EMAIL || "Yuhum Studio <onboarding@resend.dev>";

        const adminRecipient =
          process.env.STUDIO_RECEIVER_EMAIL || "yuhumstudios22@gmail.com";

        // 1. Internal Studio Admin Notification
        await resend.emails.send({
          from: FROM_EMAIL,
          to: [adminRecipient],
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
                <li><strong>Recommends Us:</strong> ${
                  recommend === true
                    ? "Yes"
                    : recommend === false
                      ? "No"
                      : "N/A"
                }</li>
              </ul>
              
              <p><strong>Comments:</strong></p>
              <blockquote style="background: #f9f9f9; padding: 12px; border-left: 4px solid #2D1B18; margin: 0;">
                ${comments || "No additional comments"}
              </blockquote>
            </div>
          `,
        });

        // 2. Customer Thank-You Confirmation Email (using ReviewEmail component)
        const customerRecipient =
          process.env.NODE_ENV === "production" && userEmail
            ? userEmail.trim()
            : adminRecipient;

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

        emailSent = true;
      } else {
        console.warn("⚠️ Resend configuration missing (RESEND_API_KEY)");
      }
    } catch (emailErr) {
      console.error(
        "⚠️ Review saved, but email notification failed:",
        emailErr.message || emailErr,
      );
    }

    return res.status(201).json({
      success: true,
      message: emailSent
        ? "Review submitted and thank-you email sent!"
        : "Review submitted successfully!",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Database error (reviews):", err);
    return res.status(500).json({
      success: false,
      error: "Failed to submit review.",
    });
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

    const FROM_EMAIL =
      process.env.FROM_EMAIL || "Yuhum Studio <onboarding@resend.dev>";
    let successCount = 0;
    let failCount = 0;

    for (const sub of subscribers) {
      const recipient =
        process.env.NODE_ENV === "production" && sub.email
          ? sub.email.trim()
          : process.env.STUDIO_RECEIVER_EMAIL || "yuhumstudios22@gmail.com";

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

    return res.status(201).json({ message: "Thank you for subscribing!" });
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
