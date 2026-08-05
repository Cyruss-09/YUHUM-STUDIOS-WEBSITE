const express = require("express");

// Same pattern as before — this module is a function of `pool`, sharing
// the app's existing pg Pool.
//
// NOTE: this router assumes verifyToken + requireAdmin are applied where
// it's mounted in server.js (see the app.use(...) example there) — none of
// these routes check auth themselves.
module.exports = (pool) => {
  const router = express.Router();

  /* ---------- Bookings ---------- */
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

  router.patch("/bookings/:id", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'pending' | 'confirmed' | 'cancelled'

    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    try {
      const result = await pool.query(
        `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *`,
        [status, id],
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Booking not found." });
      }
      return res.status(200).json({ booking: result.rows[0] });
    } catch (err) {
      console.error("❌ Admin booking status update error:", err);
      return res.status(500).json({ error: "Failed to update booking." });
    }
  });

  /* ---------- Reviews ---------- */
  router.get("/reviews", async (req, res) => {
    try {
      const result = await pool.query(`SELECT * FROM reviews ORDER BY id DESC`);
      return res.status(200).json({ reviews: result.rows });
    } catch (err) {
      console.error("❌ Admin reviews fetch error:", err);
      return res.status(500).json({ error: "Failed to fetch reviews." });
    }
  });

  router.delete("/reviews/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        `DELETE FROM reviews WHERE id = $1 RETURNING id`,
        [id],
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Review not found." });
      }
      return res.status(204).end();
    } catch (err) {
      console.error("❌ Admin review delete error:", err);
      return res.status(500).json({ error: "Failed to delete review." });
    }
  });

  /* ---------- Reschedule requests ---------- */
  router.get("/reschedule", async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT * FROM reschedule_requests ORDER BY created_at DESC`,
      );
      return res.status(200).json({ requests: result.rows });
    } catch (err) {
      console.error("❌ Admin reschedule fetch error:", err);
      return res.status(500).json({ error: "Failed to fetch reschedule requests." });
    }
  });

  router.patch("/reschedule/:id", async (req, res) => {
    const { id } = req.params;
    const { decision } = req.body; // 'approved' | 'rejected'

    if (!["approved", "rejected"].includes(decision)) {
      return res.status(400).json({ error: "Invalid decision value." });
    }

    try {
      const result = await pool.query(
        `UPDATE reschedule_requests SET status = $1 WHERE id = $2 RETURNING *`,
        [decision, id],
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Request not found." });
      }

      // If approved, push the new date onto the actual booking.
      if (decision === "approved") {
        await pool.query(
          `UPDATE bookings SET booking_date = $1 WHERE id = $2`,
          [result.rows[0].requested_date, result.rows[0].booking_id],
        );
      }

      return res.status(200).json({ request: result.rows[0] });
    } catch (err) {
      console.error("❌ Admin reschedule decision error:", err);
      return res.status(500).json({ error: "Failed to resolve request." });
    }
  });

  /* ---------- Subscribers ---------- */
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