const path = require("path");
// Explicitly resolve the path to .env in the current directory
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const emailjs = require("@emailjs/nodejs");

const app = express();
app.use(cors());
app.use(express.json());

// --- POSTGRESQL POOL CONFIGURATION ---
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "Yuhum.Studio.db",
  // Ensures password is NEVER undefined/null/object
  password: String(process.env.DB_PASSWORD || "").trim(),
  port: parseInt(process.env.DB_PORT || "5432", 10),
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Database Connection Failed:", err.message);
  } else {
    console.log("✅ Successfully connected to PostgreSQL Database!");
    release();
  }
});

// --- EMAILJS CONFIGURATION ---
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID; // Booking Template
const EMAILJS_FEEDBACK_TEMPLATE_ID = process.env.EMAILJS_FEEDBACK_TEMPLATE_ID; // Review Template
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

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
    userEmail,
  } = req.body;

  try {
    // 1. Format addOns safely for PostgreSQL array column
    const addOnsArray = Array.isArray(addOns) ? addOns : [];

    // 2. Insert booking into PostgreSQL Database
    const queryText = `
      INSERT INTO bookings (package_id, package_title, base_price, studio, booking_date, day_of_week, booking_time, add_ons)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    const values = [
      packageId,
      packageTitle,
      basePrice,
      studio,
      date,
      dayOfWeek,
      time,
      addOnsArray,
    ];

    const dbResult = await pool.query(queryText, values);

    // 3. Prepare Template Parameters for EmailJS
    const formattedAddOns =
      addOnsArray.length > 0 ? addOnsArray.join(", ") : "None";

    const templateParams = {
      to_email: userEmail || "yourstudioemail@gmail.com",
      package_title: packageTitle,
      base_price: basePrice,
      studio: studio,
      booking_date: `${dayOfWeek}, ${date}`,
      booking_time: time,
      add_ons: formattedAddOns,
    };

    // 4. Send Email safely
    let emailSent = false;
    try {
      if (EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID) {
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          templateParams,
          {
            publicKey: EMAILJS_PUBLIC_KEY,
            privateKey: EMAILJS_PRIVATE_KEY,
          }
        );
        emailSent = true;
      }
    } catch (emailErr) {
      console.error(
        "⚠️ Booking saved, but email dispatch failed:",
        emailErr.text || emailErr
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
    // 1. Insert review into PostgreSQL
    // (Note: Add user_email column to DB query if you have created that column)
    const queryText = `
      INSERT INTO reviews (overall_rating, equipment_ease, room_privacy, props_selection, favorite_backdrop, comments, recommend)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
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
    ];

    const result = await pool.query(queryText, values);

    // 2. Prepare Template Parameters for Review Template
    // Keys match exact {{variables}} used in your EmailJS HTML template
    const reviewParams = {
      userEmail: userEmail || "Not provided",
      to_email: userEmail || process.env.STUDIO_RECEIVER_EMAIL || "yourstudioemail@gmail.com",
      overallRating: overallRating || "N/A",
      equipmentEase: equipmentEase || "N/A",
      roomPrivacy: roomPrivacy || "N/A",
      propsSelection: propsSelection || "N/A",
      favoriteBackdrop: favoriteBackdrop || "None selected",
      comments: comments || "No additional comments",
      recommend: recommend === true ? "Yes, absolutely" : recommend === false ? "Maybe next time" : "N/A",
    };

    // 3. Trigger EmailJS Review Notification
    let emailSent = false;
    try {
      if (EMAILJS_SERVICE_ID && EMAILJS_FEEDBACK_TEMPLATE_ID) {
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_FEEDBACK_TEMPLATE_ID,
          reviewParams,
          {
            publicKey: EMAILJS_PUBLIC_KEY,
            privateKey: EMAILJS_PRIVATE_KEY,
          }
        );
        emailSent = true;
      } else {
        console.warn("⚠️ EmailJS configuration missing (SERVICE_ID or FEEBACK_TEMPLATE_ID)");
      }
    } catch (emailErr) {
      console.error(
        "⚠️ Review saved, but email notification failed:",
        emailErr.text || emailErr
      );
    }

    return res.status(201).json({
      success: true,
      message: emailSent
        ? "Review submitted and alert email sent!"
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