const express = require("express");

// This module is a function of `pool`, same pattern as routes/auth.js, so it
// shares your existing pg Pool instead of opening a new connection.
//
// NOTE: this router assumes verifyToken + requireAdmin are applied where it's
// mounted in server.js (see the app.use(...) example below) — none of these
// routes check auth themselves.
module.exports = (pool) => {
  const router = express.Router();

  router.get("/bookings", async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT * FROM bookings ORDER BY booking_date DESC NULLS LAST, id DESC`,
      );
      return res.status(200).json({ bookings: result.rows });
    } catch (err) {
      console.error("❌ Admin bookings fetch error:", err);
      return res.status(500).json({ error: "Failed to fetch bookings." });
    }
  });

  router.get("/reviews", async (req, res) => {
    try {
      const result = await pool.query(`SELECT * FROM reviews ORDER BY id DESC`);
      return res.status(200).json({ reviews: result.rows });
    } catch (err) {
      console.error("❌ Admin reviews fetch error:", err);
      return res.status(500).json({ error: "Failed to fetch reviews." });
    }
  });

  router.get("/subscribers", async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT * FROM subscribers ORDER BY id DESC`,
      );
      return res.status(200).json({ subscribers: result.rows });
    } catch (err) {
      console.error("❌ Admin subscribers fetch error:", err);
      return res.status(500).json({ error: "Failed to fetch subscribers." });
    }
  });

  return router;
};
