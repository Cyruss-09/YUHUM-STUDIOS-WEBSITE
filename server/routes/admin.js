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

module.exports = router;