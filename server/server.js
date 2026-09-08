require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");

// Modular Route Imports
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const bookingRoutes = require("./routes/bookingRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const subscriberRoutes = require("./routes/subscriberRoutes");
const publicRoutes = require("./routes/publicRoutes");
const campaignRoutes = require("./routes/campaignRoutes"); // If separate; otherwise mounted in admin
const adminSettingsRoutes = require("./routes/adminSettingsRoutes");
const promoRoutes = require("./routes/promoRoutes"); // 1. Added Promo Routes

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/public", express.static(path.join(__dirname, "public")));

// Route Mounts
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/subscribers", subscriberRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/resend-campaign", campaignRoutes);
app.use("/api/admin", adminSettingsRoutes);
app.use("/api/promos", promoRoutes); // 2. Mounted Promo Routes


// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err.stack || err);
  res.status(500).json({ error: "Internal server error" });
});

/* ================= SERVER LISTEN ================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running and listening on port ${PORT}`);
});

module.exports = app;