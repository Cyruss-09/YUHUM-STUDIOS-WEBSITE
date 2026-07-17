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

// POST route to receive frontend selection data
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
