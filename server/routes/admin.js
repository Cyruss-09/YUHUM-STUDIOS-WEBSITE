const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const router = express.Router();

// CHANGED: was "/admin/login" — now just "/login" since the mount point
// already provides the "/api/admin" prefix.
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    let result = await pool.query("SELECT * FROM admins WHERE email = $1", [
      email,
    ]);
    let admin = result.rows[0];

    // Fallback: check users table if promoted
    if (!admin) {
      const userRes = await pool.query(
        "SELECT * FROM users WHERE email = $1 AND role = 'admin'",
        [email]
      );
      if (userRes.rows.length > 0) {
        const u = userRes.rows[0];
        admin = {
          id: u.id,
          name: u.username,
          email: u.email,
          password_hash: u.password_hash,
          role: "admin",
        };
      }
    }

    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    res.json({
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

const { verifyToken, requireAdmin } = require("../middleware/auth");

// GET /api/admin/users - Fetch all users (with auto-sync for existing promoted admins)
router.get("/users", verifyToken, requireAdmin, async (req, res) => {
  try {
    // Backfill: automatically copy any users with role = 'admin' into the admins table if missing
    await pool.query(`
      INSERT INTO admins (name, email, password_hash, role)
      SELECT u.username, u.email, u.password_hash, 'admin'
      FROM users u
      LEFT JOIN admins a ON u.email = a.email
      WHERE u.role = 'admin' AND a.id IS NULL;
    `);

    const result = await pool.query(
      "SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC"
    );
    res.json({ success: true, users: result.rows });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ success: false, message: "Server error fetching users" });
  }
});

// POST /api/admin/users - Create a new user or admin account directly
router.post("/users", verifyToken, requireAdmin, async (req, res) => {
  const { username, email, password, role = "user" } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: "Username, email, and password are required." });
  }

  const cleanUsername = String(username).trim();
  const cleanEmail = String(email).trim().toLowerCase();
  const targetRole = role === "admin" ? "admin" : "user";

  try {
    const existingEmail = await pool.query(
      "SELECT id FROM users WHERE LOWER(email) = LOWER($1)",
      [cleanEmail]
    );
    if (existingEmail.rows.length > 0) {
      return res.status(400).json({ success: false, message: "Email is already registered." });
    }

    const existingUsername = await pool.query(
      "SELECT id FROM users WHERE LOWER(username) = LOWER($1)",
      [cleanUsername]
    );
    if (existingUsername.rows.length > 0) {
      return res.status(400).json({ success: false, message: "Username is already taken." });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at",
      [cleanUsername, cleanEmail, password_hash, targetRole]
    );

    const newUser = result.rows[0];

    // If created as admin, also sync to admins table
    if (targetRole === "admin") {
      await pool.query(
        "INSERT INTO admins (name, email, password_hash, role) VALUES ($1, $2, $3, 'admin') ON CONFLICT (email) DO UPDATE SET password_hash = $3",
        [cleanUsername, cleanEmail, password_hash]
      );
    }

    res.status(201).json({
      success: true,
      message: `Account for "${cleanUsername}" created successfully as ${targetRole}.`,
      user: newUser,
    });
  } catch (err) {
    console.error("Error creating user account:", err);
    res.status(500).json({ success: false, message: "Server error creating user account" });
  }
});

// PATCH /api/admin/users/:id/role - Update user role & sync with admins table
router.patch("/users/:id/role", verifyToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    // 1. Fetch the user details including their password_hash
    const userResult = await pool.query(
      "SELECT id, username, email, password_hash, role FROM users WHERE id = $1",
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const targetUser = userResult.rows[0];

    // 2. Update role in users table
    const updatedUserRes = await pool.query(
      "UPDATE users SET role = $1 WHERE id = $2 RETURNING id, username, email, role",
      [role, id]
    );

    // 3. Sync with admins table
    if (role === "admin") {
      console.log(`Syncing promoted user to admins table: ${targetUser.email}`);
      const existingAdmin = await pool.query(
        "SELECT id FROM admins WHERE email = $1",
        [targetUser.email]
      );

      if (existingAdmin.rows.length > 0) {
        await pool.query(
          "UPDATE admins SET name = $1, password_hash = $2, role = 'admin' WHERE email = $3",
          [targetUser.username, targetUser.password_hash, targetUser.email]
        );
        console.log(`✅ Updated existing admin in admins table: ${targetUser.email}`);
      } else {
        await pool.query(
          "INSERT INTO admins (name, email, password_hash, role) VALUES ($1, $2, $3, 'admin')",
          [targetUser.username, targetUser.email, targetUser.password_hash]
        );
        console.log(`✅ Inserted new admin into admins table: ${targetUser.email}`);
      }
    } else {
      console.log(`Removing demoted user from admins table: ${targetUser.email}`);
      await pool.query("DELETE FROM admins WHERE email = $1", [targetUser.email]);
      console.log(`✅ Removed from admins table: ${targetUser.email}`);
    }

    res.json({ success: true, user: updatedUserRes.rows[0] });
  } catch (err) {
    console.error("❌ Error updating user role & syncing admins:", err.message || err);
    res.status(500).json({ success: false, message: err.message || "Error updating user role" });
  }
});

// DELETE /api/admin/users/:id - Delete a user account and clean up associated records
router.delete("/users/:id", verifyToken, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const userResult = await pool.query(
      "SELECT id, username, email, role FROM users WHERE id = $1",
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const targetUser = userResult.rows[0];

    // Prevent deleting the currently authenticated admin's own account
    if (
      (req.user?.id && (req.user.id === targetUser.id || req.user.id === parseInt(id, 10))) ||
      (req.user?.email && req.user.email.toLowerCase() === targetUser.email.toLowerCase())
    ) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own active administrator account.",
      });
    }

    // Remove from admins table if synced
    if (targetUser.email) {
      await pool.query("DELETE FROM admins WHERE email = $1", [targetUser.email]);
    }

    // Delete user from users table
    await pool.query("DELETE FROM users WHERE id = $1", [id]);

    console.log(`✅ Deleted user: ${targetUser.username} (${targetUser.email})`);
    res.json({
      success: true,
      message: `User "${targetUser.username || targetUser.email}" was successfully deleted.`,
    });
  } catch (err) {
    console.error("❌ Error deleting user:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to delete user.",
    });
  }
});

/* ================= AUTO-INITIALIZE SETTINGS & PROMO TABLES ================= */
const initSettingsTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS studio_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS promo_codes (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage',
        discount_value NUMERIC NOT NULL,
        min_spend NUMERIC DEFAULT 0,
        max_uses INTEGER DEFAULT NULL,
        used_count INTEGER DEFAULT 0,
        expires_at TIMESTAMP DEFAULT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await pool.query(`
      ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
    `);
    await pool.query(`
      ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        overall_rating INTEGER NOT NULL,
        equipment_ease INTEGER NOT NULL,
        room_privacy INTEGER NOT NULL,
        props_selection INTEGER NOT NULL,
        favorite_backdrop VARCHAR(50),
        comments TEXT,
        recommend BOOLEAN,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        user_email VARCHAR(255)
      );
    `);
    await pool.query(`
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);
    `);
    await pool.query(`
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    `);
  } catch (err) {
    console.error("Error initializing settings/promo/subscriber/review tables:", err.message);
  }
};
initSettingsTables();

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
    paymentInstructions: "Please send proof of payment / screenshot to yuhumstudios22@gmail.com or via Instagram DM @yuhumstudios.",
  },
  cms: {
    bannerEnabled: false,
    bannerText: "✨ Welcome to Yuhum Studios! Book your self-shoot session today.",
    bannerTheme: "dark",
    maintenanceMode: false,
    maintenanceMessage: "Our booking system is currently undergoing scheduled maintenance. We will be back shortly!",
  },
};

/* ================= SETTINGS API ROUTES ================= */

// GET /api/admin/settings - Retrieve current settings
router.get("/settings", verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT setting_key, setting_value FROM studio_settings");
    const settingsMap = { ...DEFAULT_SETTINGS };

    result.rows.forEach((row) => {
      settingsMap[row.setting_key] = row.setting_value;
    });

    res.json({ success: true, settings: settingsMap });
  } catch (err) {
    console.error("Error fetching studio settings:", err);
    res.status(500).json({ success: false, message: "Error fetching settings", settings: DEFAULT_SETTINGS });
  }
});

// PUT /api/admin/settings - Update settings
router.put("/settings", verifyToken, requireAdmin, async (req, res) => {
  const { settings } = req.body;
  if (!settings || typeof settings !== "object") {
    return res.status(400).json({ success: false, message: "Invalid settings payload" });
  }

  try {
    for (const [key, value] of Object.entries(settings)) {
      await pool.query(
        `INSERT INTO studio_settings (setting_key, setting_value, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (setting_key)
         DO UPDATE SET setting_value = $2, updated_at = NOW()`,
        [key, JSON.stringify(value)]
      );
    }

    res.json({ success: true, message: "Settings saved successfully", settings });
  } catch (err) {
    console.error("Error saving studio settings:", err);
    res.status(500).json({ success: false, message: "Failed to save settings" });
  }
});

/* ================= PROMO CODES API ROUTES ================= */

// GET /api/admin/promo-codes - List all promo codes
router.get("/promo-codes", verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM promo_codes ORDER BY created_at DESC");
    res.json({ success: true, promoCodes: result.rows });
  } catch (err) {
    console.error("Error fetching promo codes:", err);
    res.status(500).json({ success: false, message: "Failed to fetch promo codes" });
  }
});

// POST /api/admin/promo-codes - Create promo code
router.post("/promo-codes", verifyToken, requireAdmin, async (req, res) => {
  const { code, discount_type, discount_value, min_spend, max_uses, expires_at } = req.body;

  if (!code || !discount_value) {
    return res.status(400).json({ success: false, message: "Code and discount value are required" });
  }

  const cleanCode = code.trim().toUpperCase();

  try {
    const result = await pool.query(
      `INSERT INTO promo_codes (code, discount_type, discount_value, min_spend, max_uses, expires_at)
   VALUES ($1, $2, $3, $4, $5, $6)
   RETURNING *`,
      [
        cleanCode,
        discount_type || "percentage",
        parseFloat(discount_value),
        min_spend ? parseFloat(min_spend) : 0,
        max_uses ? parseInt(max_uses, 10) : null,
        expires_at || null,
      ]
    );

    res.status(201).json({ success: true, promoCode: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ success: false, message: "Promo code already exists" });
    }
    console.error("Error creating promo code:", err);
    res.status(500).json({ success: false, message: "Failed to create promo code" });
  }
});

// PATCH /api/admin/promo-codes/:id/toggle - Toggle active status
router.patch("/promo-codes/:id/toggle", verifyToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "UPDATE promo_codes SET is_active = NOT is_active WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Promo code not found" });
    }
    res.json({ success: true, promoCode: result.rows[0] });
  } catch (err) {
    console.error("Error toggling promo code:", err);
    res.status(500).json({ success: false, message: "Failed to update promo code" });
  }
});

// DELETE /api/admin/promo-codes/:id - Delete promo code
router.delete("/promo-codes/:id", verifyToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM promo_codes WHERE id = $1 RETURNING id", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Promo code not found" });
    }
    res.json({ success: true, message: "Promo code deleted" });
  } catch (err) {
    console.error("Error deleting promo code:", err);
    res.status(500).json({ success: false, message: "Failed to delete promo code" });
  }
});

/* ================= ADMIN PROFILE & PASSWORD CHANGE ================= */

// POST /api/admin/change-password - Change current admin's password
router.post("/change-password", verifyToken, requireAdmin, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const adminId = req.user.id;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: "Current and new password are required" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
  }

  try {
    // 1. Look up admin in admins table or users table
    let adminRecord = null;
    let foundInTable = "admins";

    const adminRes = await pool.query("SELECT * FROM admins WHERE id = $1", [adminId]);
    if (adminRes.rows.length > 0) {
      adminRecord = adminRes.rows[0];
    } else {
      const userRes = await pool.query("SELECT * FROM users WHERE id = $1", [adminId]);
      if (userRes.rows.length > 0) {
        adminRecord = userRes.rows[0];
        foundInTable = "users";
      }
    }

    if (!adminRecord) {
      return res.status(404).json({ success: false, message: "Admin account not found" });
    }

    // 2. Validate current password
    const valid = await bcrypt.compare(currentPassword, adminRecord.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: "Incorrect current password" });
    }

    // 3. Hash new password
    const newHash = await bcrypt.hash(newPassword, 10);

    // 4. Update password in both admins and users table to keep synchronized
    if (adminRecord.email) {
      await pool.query("UPDATE admins SET password_hash = $1 WHERE email = $2", [newHash, adminRecord.email]);
      await pool.query("UPDATE users SET password_hash = $1 WHERE email = $2", [newHash, adminRecord.email]);
    } else {
      await pool.query(`UPDATE ${foundInTable} SET password_hash = $1 WHERE id = $2`, [newHash, adminId]);
    }

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Error changing admin password:", err);
    res.status(500).json({ success: false, message: "Server error changing password" });
  }
});

/* ================= REVIEWS MANAGEMENT ================= */

// GET /api/admin/reviews - Fetch all reviews
router.get("/reviews", verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, overall_rating, equipment_ease, room_privacy, props_selection,
              favorite_backdrop, comments, recommend, user_email, created_at
       FROM reviews
       ORDER BY created_at DESC, id DESC`
    );
    res.json({ success: true, reviews: result.rows });
  } catch (err) {
    console.error("Error fetching reviews:", err.message || err);
    res.status(500).json({ success: false, message: err.message || "Failed to fetch reviews" });
  }
});

// DELETE /api/admin/reviews/:id - Delete a review
router.delete("/reviews/:id", verifyToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM reviews WHERE id = $1 RETURNING id", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }
    res.json({ success: true, message: "Review deleted successfully" });
  } catch (err) {
    console.error("Error deleting review:", err.message || err);
    res.status(500).json({ success: false, message: err.message || "Failed to delete review" });
  }
});

/* ================= SUBSCRIBERS MANAGEMENT ================= */

// GET /api/admin/subscribers - Fetch all subscribers
router.get("/subscribers", verifyToken, requireAdmin, async (req, res) => {
  try {
    // Ensure table & columns exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW()
      );
      ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
      ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
    `);

    const result = await pool.query(
      `SELECT id, email, COALESCE(status, 'active') as status, created_at
       FROM subscribers
       ORDER BY created_at DESC, id DESC`
    );
    res.json({ success: true, subscribers: result.rows });
  } catch (err) {
    console.error("Error fetching subscribers:", err.message || err);
    res.status(500).json({ success: false, message: err.message || "Failed to fetch subscribers" });
  }
});

// POST /api/admin/subscribers - Manually add a subscriber
router.post("/subscribers", verifyToken, requireAdmin, async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ success: false, message: "Valid email address is required" });
  }
  const cleanEmail = email.toLowerCase().trim();
  try {
    const result = await pool.query(
      `INSERT INTO subscribers (email, status, created_at)
       VALUES ($1, 'active', NOW())
       ON CONFLICT (email) DO UPDATE SET status = 'active'
       RETURNING id, email, status, created_at`,
      [cleanEmail]
    );
    res.status(201).json({ success: true, subscriber: result.rows[0] });
  } catch (err) {
    console.error("Error adding subscriber:", err);
    res.status(500).json({ success: false, message: "Failed to add subscriber" });
  }
});

// PATCH /api/admin/subscribers/:id/status - Update subscriber status (active/unsubscribed)
router.patch("/subscribers/:id/status", verifyToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const newStatus = status === "unsubscribed" ? "unsubscribed" : "active";
    const result = await pool.query(
      "UPDATE subscribers SET status = $1 WHERE id = $2 RETURNING id, email, status, created_at",
      [newStatus, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Subscriber not found" });
    }
    res.json({ success: true, subscriber: result.rows[0] });
  } catch (err) {
    console.error("Error updating subscriber status:", err);
    res.status(500).json({ success: false, message: "Failed to update subscriber status" });
  }
});

// DELETE /api/admin/subscribers/:id - Delete a subscriber
router.delete("/subscribers/:id", verifyToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM subscribers WHERE id = $1 RETURNING id", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Subscriber not found" });
    }
    res.json({ success: true, message: "Subscriber removed successfully" });
  } catch (err) {
    console.error("Error deleting subscriber:", err);
    res.status(500).json({ success: false, message: "Failed to delete subscriber" });
  }
});

/* ================= DATA EXPORT ================= */

// GET /api/admin/export/bookings - Export bookings in JSON / CSV format
router.get("/export/bookings", verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, package_id, package_title, base_price, studio, booking_date, day_of_week, booking_time,
              "firstName", "lastName", email, phone, "paymentMode", "couponCode", created_at
       FROM bookings ORDER BY created_at DESC`
    );
    res.json({ success: true, bookings: result.rows });
  } catch (err) {
    console.error("Error exporting bookings:", err);
    res.status(500).json({ success: false, message: "Failed to export bookings" });
  }
});

// GET /api/admin/export/subscribers - Export subscribers in JSON
router.get("/export/subscribers", verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, COALESCE(status, 'active') as status, created_at FROM subscribers ORDER BY created_at DESC"
    );
    res.json({ success: true, subscribers: result.rows });
  } catch (err) {
    console.error("Error exporting subscribers:", err);
    res.status(500).json({ success: false, message: "Failed to export subscribers" });
  }
});

// GET /api/admin/export/reviews - Export reviews in JSON
router.get("/export/reviews", verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, overall_rating, equipment_ease, room_privacy, props_selection,
              favorite_backdrop, comments, recommend, user_email, created_at
       FROM reviews ORDER BY created_at DESC`
    );
    res.json({ success: true, reviews: result.rows });
  } catch (err) {
    console.error("Error exporting reviews:", err);
    res.status(500).json({ success: false, message: "Failed to export reviews" });
  }
});

module.exports = router;