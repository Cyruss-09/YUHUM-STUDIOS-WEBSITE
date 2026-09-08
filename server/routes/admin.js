const express = require("express");
const router = express.Router();
const { supabase } = require("../config/supabase");
const { verifyToken, requireAdmin } = require("../middleware/auth");
const {
  getUsers,
  createUser,
  updateUserRole,
  deleteUser,
} = require("../controllers/userController");

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

/* ================= ADMIN REVIEWS ================= */
router.get("/reviews", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("❌ Supabase query error (fetching admin reviews):", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch reviews.",
    });
  }
});

/* ================= ADMIN REVIEW DELETE ================= */
router.delete("/reviews/:id", verifyToken, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const { data: deleted, error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }

    return res.status(200).json({
      success: true,
      review: deleted,
    });
  } catch (error) {
    console.error("❌ Supabase query error (deleting admin review):", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete review.",
    });
  }
});

/* ================= ADMIN SUBSCRIBERS ================= */
router.get("/subscribers", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { data: subscribers, error } = await supabase
      .from("subscribers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      subscribers,
    });
  } catch (error) {
    console.error("❌ Supabase query error (fetching admin subscribers):", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subscribers.",
    });
  }
});

/* ================= ADMIN SUBSCRIBER CREATE ================= */
router.post("/subscribers", verifyToken, requireAdmin, async (req, res) => {
  const { email } = req.body;
  const cleanEmail = String(email || "").trim().toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address.",
    });
  }

  try {
    const { data: subscriber, error } = await supabase
      .from("subscribers")
      .insert([{ email: cleanEmail }])
      .select()
      .single();

    if (error) {
      // Postgres unique_violation — email already subscribed
      if (error.code === "23505") {
        return res.status(400).json({
          success: false,
          message: "This email is already subscribed.",
        });
      }
      throw error;
    }

    return res.status(201).json({
      success: true,
      subscriber,
    });
  } catch (error) {
    console.error("❌ Supabase query error (adding admin subscriber):", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add subscriber.",
    });
  }
});

/* ================= ADMIN SUBSCRIBER STATUS UPDATE ================= */
router.patch("/subscribers/:id/status", verifyToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const ALLOWED_STATUSES = ["active", "unsubscribed"];
  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(", ")}`,
    });
  }

  try {
    const { data: subscriber, error } = await supabase
      .from("subscribers")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error || !subscriber) {
      return res.status(404).json({ success: false, message: "Subscriber not found." });
    }

    return res.status(200).json({
      success: true,
      subscriber,
    });
  } catch (error) {
    console.error("❌ Supabase query error (updating subscriber status):", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update subscriber status.",
    });
  }
});

/* ================= ADMIN SUBSCRIBER DELETE ================= */
router.delete("/subscribers/:id", verifyToken, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const { data: deleted, error } = await supabase
      .from("subscribers")
      .delete()
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Subscriber not found." });
    }

    return res.status(200).json({
      success: true,
      subscriber: deleted,
    });
  } catch (error) {
    console.error("❌ Supabase query error (deleting admin subscriber):", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete subscriber.",
    });
  }
});

/* ================= ADMIN USERS ================= */
router.get("/users", verifyToken, requireAdmin, getUsers);
router.post("/users", verifyToken, requireAdmin, createUser);
router.patch("/users/:id/role", verifyToken, requireAdmin, updateUserRole);
router.delete("/users/:id", verifyToken, requireAdmin, deleteUser);

module.exports = router;