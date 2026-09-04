require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const { BookingEmail } = require("./emails/BookingEmail");
const { ReviewEmail } = require("./emails/ReviewEmail");
const { SubscriberEmail } = require("./emails/SubscriberEmail");
const { AdminReviewAlertEmail } = require("./emails/AdminReviewAlertEmail");

const pool = require("./config/db");
const { verifyToken, requireAdmin } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const {
  getResend,
  FROM_EMAIL,
  ADMIN_EMAIL,
  SANDBOX_MODE,
  resolveRecipient,
} = require("./config/mailer");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/public", express.static(path.join(__dirname, "public")));

// Test DB connection and verify auth schema on startup
const initAuthAndCmsTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        reset_token VARCHAR(255),
        reset_token_expiry TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user';`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;`);
    await pool.query(`ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'local';`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_id VARCHAR(255);`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        reset_token VARCHAR(255),
        reset_token_expiry TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await pool.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);`);
    await pool.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;`);

    console.log("✅ Successfully connected to PostgreSQL Database & verified Auth Schema!");
  } catch (err) {
    console.error("⚠️ Database connection / verification note:", err.message);
  }
};

initAuthAndCmsTables();

// --- AUTH + ADMIN ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

const DEFAULT_SETTINGS = {
  general: {
    studioName: "Yuhum Studios",
    contactEmail: "yuhumstudios22@gmail.com",
    phone: "+63 912 345 6789",
    address: "Iloilo City, Philippines",
    googleMapsUrl: "https://maps.google.com",
  },
  schedule: {
    openTime: "10:00 AM",
    closeTime: "06:00 PM",
    slotDurationMinutes: 30,
    bufferMinutes: 15,
    studioAActive: true,
    studioBActive: true,
    blackoutDates: [],
  },
  packages: {
    kadlawPrice: 649,
    gugmaPrice: 1499,
    addOns: [
      { key: "add_head", label: "+1 adult", price: 250 },
      { key: "add_pet", label: "+1 pet", price: 100 },
      { key: "add_4r_print", label: "+1 4R Print", price: 50 },
      { key: "add_grid_strips", label: "+1 2x Photo Grid Strips", price: 50 },
      { key: "raw_photos", label: "All Raw Photos", price: 400 },
      { key: "hair_makeup", label: "Hair & Makeup Service", price: 2500 },
      { key: "studio_rental", label: "Rental Studio (Rate is per hour)", price: 1000 },
    ],
  },
  payments: {
    gcashName: "YUHUM STUDIOS",
    gcashNumber: "0912 345 6789",
    mayaName: "YUHUM STUDIOS",
    mayaNumber: "0912 345 6789",
    bankName: "BPI",
    bankAccountName: "Yuhum Studios Inc.",
    bankAccountNumber: "1234-5678-90",
    downpaymentType: "full",
    paymentInstructions:
      "Please send proof of payment / screenshot to yuhumstudios22@gmail.com or via Instagram DM @yuhumstudios.",
  },
  cms: {
    bannerEnabled: false,
    bannerText: "✨ Welcome to Yuhum Studios! Book your self-shoot session today.",
    bannerTheme: "dark",
    maintenanceMode: false,
    maintenanceMessage:
      "Our booking system is currently undergoing scheduled maintenance. We will be back shortly!",
  },
};

app.get("/api/public/settings", async (req, res) => {
  try {
    const result = await pool.query("SELECT setting_key, setting_value FROM studio_settings");
    const settingsMap = { ...DEFAULT_SETTINGS };
    result.rows.forEach((row) => {
      settingsMap[row.setting_key] = row.setting_value;
    });
    res.json({ success: true, settings: settingsMap });
  } catch (err) {
    res.json({ success: true, settings: DEFAULT_SETTINGS });
  }
});

const isValidEmail = (value) =>
  typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

/* ================= BOOKINGS ROUTE ================= */
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

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (couponCode) {
      const normalizedCode = couponCode.trim().toUpperCase();

      const promoResult = await client.query(
        `SELECT id, max_uses, used_count, is_active, expires_at
         FROM promo_codes
         WHERE code = $1
         FOR UPDATE`,
        [normalizedCode],
      );

      if (promoResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ success: false, error: "Invalid promo code." });
      }

      const promo = promoResult.rows[0];

      if (!promo.is_active) {
        await client.query("ROLLBACK");
        return res.status(400).json({ success: false, error: "This promo code is no longer active." });
      }

      if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
        await client.query("ROLLBACK");
        return res.status(400).json({ success: false, error: "This promo code has expired." });
      }

      if (promo.max_uses !== null && promo.used_count >= promo.max_uses) {
        await client.query("ROLLBACK");
        return res.status(400).json({ success: false, error: "This promo code has reached its usage limit." });
      }

      await client.query(
        `UPDATE promo_codes SET used_count = used_count + 1 WHERE id = $1`,
        [promo.id],
      );
    }

    const addOnsArray = Array.isArray(addOns) ? addOns : [];
    const safePackageTitle = packageTitle || "Studio Session";
    const safeBasePrice = basePrice || "₱0";
    const safeStudio = studio || "Standard Studio";
    const resolvedFindUs = findUs || null;
    const resolvedPaymentMode = paymentMode || null;
    const resolvedTerms =
      termsAccepted === true || termsAccepted === "true" || termsAccepted === 1;

    const queryText = `
      INSERT INTO bookings (
        package_id, package_title, base_price, studio, booking_date, day_of_week,
        booking_time, add_ons, "firstName", "lastName", phone, email,
        "termsAccepted", "findUs", "paymentMode", "couponCode", user_id
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
      req.user.id,
    ];

    const dbResult = await client.query(queryText, values);

    await client.query("COMMIT");

    const formattedAddOns = addOnsArray.length > 0 ? addOnsArray.join(", ") : "None";
    let emailSent = false;

    try {
      const resend = getResend();
      if (resend) {
        const recipient = resolveRecipient(email);
        const bookingHtml = BookingEmail({
          packageTitle: safePackageTitle,
          basePrice: safeBasePrice,
          studio: safeStudio,
          date: dayOfWeek && date ? `${dayOfWeek}, ${date}` : date || "Scheduled Date",
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
      console.error("⚠️ Booking saved, but Resend email dispatch failed:", emailErr.message || emailErr);
    }

    return res.status(201).json({
      success: true,
      message: emailSent ? "Booking saved and confirmation email sent!" : "Booking saved successfully!",
      data: dbResult.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Database query error (bookings):", error);
    return res.status(500).json({
      success: false,
      error: "Failed to complete booking processing.",
    });
  } finally {
    client.release();
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
    const resend = getResend();

    if (SANDBOX_MODE) {
      console.log(
        "📦 [Sandbox] Skipping admin notification — customer thank-you is already routed to ADMIN_EMAIL."
      );
    } else {
      try {
        if (resend) {
          const adminAlertHtml = AdminReviewAlertEmail({
            userEmail,
            overallRating,
            equipmentEase,
            roomPrivacy,
            propsSelection,
            favoriteBackdrop,
            comments,
            recommend: safeRecommend,
          });

          await resend.emails.send({
            from: FROM_EMAIL,
            to: [ADMIN_EMAIL],
            subject: `New Review Submitted (${overallRating || "N/A"} ⭐) - Yuhum Studios`,
            html: adminAlertHtml,
          });
          adminEmailSent = true;
        }
      } catch (adminEmailErr) {
        console.error(
          "⚠️ Review saved, but admin notification email failed:",
          adminEmailErr.message || adminEmailErr,
        );
      }
    }

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
          : customerEmailSent
            ? "Review submitted! Thank-you email sent."
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

    const resend = getResend();
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

    let welcomeEmailSent = false;
    try {
      const resend = getResend();
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

/* ================= CLIENT: MY BOOKINGS ROUTE ================= */
app.get("/api/bookings/my", verifyToken, async (req, res) => {
  try {
    const queryText = `
      SELECT id, package_title, base_price, studio, booking_date, day_of_week,
             booking_time, add_ons, "firstName", "lastName", email, phone,
             "paymentMode", "couponCode", status, created_at
      FROM bookings
      WHERE user_id = $1
      ORDER BY created_at DESC;
    `;
    const dbResult = await pool.query(queryText, [req.user.id]);
    return res.status(200).json({ success: true, bookings: dbResult.rows });
  } catch (error) {
    console.error("❌ Error fetching user bookings:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch your bookings." });
  }
});

/* ================= CLIENT: CANCEL BOOKING ROUTE ================= */
app.patch("/api/bookings/:id/cancel", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the booking and verify ownership
    const fetchResult = await pool.query(
      "SELECT id, user_id, status FROM bookings WHERE id = $1",
      [id]
    );

    if (fetchResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Booking not found." });
    }

    const booking = fetchResult.rows[0];

    // Ownership check
    if (booking.user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: "You are not authorized to cancel this booking." });
    }

    // Only Pending or Confirmed bookings can be cancelled
    const cancellableStatuses = ["Pending", "Confirmed"];
    if (!cancellableStatuses.includes(booking.status)) {
      return res.status(400).json({
        success: false,
        error: `This booking cannot be cancelled because its status is "${booking.status}".`,
      });
    }

    const updateResult = await pool.query(
      "UPDATE bookings SET status = 'Cancelled' WHERE id = $1 RETURNING *",
      [id]
    );

    return res.status(200).json({ success: true, booking: updateResult.rows[0] });
  } catch (error) {
    console.error("❌ Error cancelling booking:", error);
    return res.status(500).json({ success: false, error: "Failed to cancel booking." });
  }
});

/* ================= ADMIN BOOKINGS ROUTE ================= */
app.get("/api/admin/bookings", verifyToken, async (req, res) => {
  try {
    const queryText = `
      SELECT * FROM bookings 
      ORDER BY created_at DESC;
    `;

    const dbResult = await pool.query(queryText);

    return res.status(200).json({
      success: true,
      bookings: dbResult.rows,
    });
  } catch (error) {
    console.error("❌ Database query error (fetching admin bookings):", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch bookings.",
    });
  }
});

/* ================= ADMIN BOOKING STATUS UPDATE ================= */
app.patch(
  "/api/admin/bookings/:id/status",
  verifyToken,
  requireAdmin,
  async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const ALLOWED_STATUSES = [
      "Pending",
      "Confirmed",
      "Completed",
      "Cancelled",
      "No-show",
    ];
    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(", ")}`,
      });
    }

    try {
      const queryText = `
      UPDATE bookings
      SET status = $1
      WHERE id = $2
      RETURNING *;
    `;
      const dbResult = await pool.query(queryText, [status, id]);

      if (dbResult.rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: "Booking not found." });
      }

      return res.status(200).json({
        success: true,
        booking: dbResult.rows[0],
      });
    } catch (error) {
      console.error(
        "❌ Database query error (updating booking status):",
        error,
      );
      return res.status(500).json({
        success: false,
        error: "Failed to update booking status.",
      });
    }
  },
);

/* ================= SERVER LISTEN ================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running and listening on port ${PORT}`);
});