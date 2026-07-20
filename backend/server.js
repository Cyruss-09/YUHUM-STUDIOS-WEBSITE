const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json()); // Essential to parse JSON payloads

// Configure your PostgreSQL connection parameters
const pool = new Pool({
  user: "postgres",
  host: "localhost", // Keep as localhost if PostgreSQL is on the exact same machine as this server script
  database: "Yuhum.Studio.db",
  password: "Cyruss110903",
  port: 5432,
});

{
  /*BOOKINGS ROUTE*/
}
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
  } = req.body;

  try {
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
      addOns,
    ];
    const result = await pool.query(queryText, values);

    res.status(201).json({
      success: true,
      message: "Booking saved successfully!",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// FIX: Explicitly pass '0.0.0.0' to let the server handle cross-network connections
app.listen(5000, "0.0.0.0", () => {
  console.log("Server running and listening globally on port 5000");
});

{
  /*REVIEWS ROUTE*/
}
app.post("/api/reviews", async (req, res) => {
  const {
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
  INSERT INTO reviews (overall_rating, equipment_ease, room_privacy, props_selection, favorite_backdrop, comments, recommend)
  VALUES ($1, $2, $3, $4, $5, $6, $7)
  RETURNING *;
`;

    const values = [
      overallRating,
      equipmentEase,
      roomPrivacy,
      propsSelection,
      favoriteBackdrop,
      comments,
      recommend,
    ];
    const result = await pool.query(queryText, values);

    res.status(201).json({
      success: true,
      message: "Review submitted successfully!",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Database error (reviews):", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// FIX: Explicitly pass '0.0.0.0' to let the server handle cross-network connections
app.listen(5000, "0.0.0.0", () => {
  console.log("Server running and listening globally on port 5000");
});

{
  /*SUBSCRIBERS ROUTE*/
}

app.post('/api/subscribers', async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  try {
    const queryText = `
      INSERT INTO subscribers (email) 
      VALUES ($1) 
      ON CONFLICT (email) DO NOTHING
      RETURNING *;
    `;
    const result = await pool.query(queryText, [email.toLowerCase().trim()]);

    // If result.rows length is 0, it means the email was already subscribed
    if (result.rows.length === 0) {
      return res.status(200).json({ message: 'You are already subscribed!' });
    }

    res.status(201).json({ message: 'Thank you for subscribing!' });
  } catch (err) {
    console.error('Database error (subscribers):', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});