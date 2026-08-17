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
    const result = await pool.query("SELECT * FROM admins WHERE email = $1", [
      email,
    ]);
    const admin = result.rows[0];

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

// GET /api/admin/users - Fetch all users
router.get("/users", verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC"
    );
    res.json({ success: true, users: result.rows });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ success: false, message: "Server error fetching users" });
  }
});

// PATCH /api/admin/users/:id/role - Update user role
router.patch("/users/:id/role", verifyToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  try {
    const result = await pool.query(
      "UPDATE users SET role = $1 WHERE id = $2 RETURNING id, username, email, role",
      [role, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "User not found" });
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating user role" });
  }
});

module.exports = router;