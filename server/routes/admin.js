const express = require("express");
const router = express.Router();
const { supabase } = require("../config/supabase");
const { verifyToken, requireAdmin } = require("../middleware/auth");

/* ================= ADMIN BOOKINGS ================= */
router.get("/bookings", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("❌ Supabase query error (fetching admin bookings):", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch bookings.",
    });
  }
});

/* ================= ADMIN BOOKING STATUS UPDATE ================= */
router.patch("/bookings/:id/status", verifyToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const ALLOWED_STATUSES = ["Pending", "Confirmed", "Completed", "Cancelled", "No-show"];
  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      error: `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(", ")}`,
    });
  }

  try {
    const { data: booking, error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error || !booking) {
      return res.status(404).json({ success: false, error: "Booking not found." });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("❌ Supabase query error (updating booking status):", error);
    return res.status(500).json({
      success: false,
      error: "Failed to update booking status.",
    });
  }
});

module.exports = router;