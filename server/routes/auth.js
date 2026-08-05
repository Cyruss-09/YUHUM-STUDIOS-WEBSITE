const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SALT_ROUNDS = 10;

// Same pattern as routes/admin.js — shares the app's existing pg Pool
// instead of opening a new connection.
module.exports = (pool) => {
  const router = express.Router();

  router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "Username, email, and password are required." });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters." });
    }

    try {
      const existing = await pool.query(
        "SELECT id FROM users WHERE email = $1 OR username = $2",
        [email.toLowerCase().trim(), username.trim()],
      );
      if (existing.rows.length > 0) {
        return res
          .status(409)
          .json({ error: "Username or email is already taken." });
      }

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      const result = await pool.query(
        `INSERT INTO users (username, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, username, email, role, created_at`,
        [username.trim(), email.toLowerCase().trim(), passwordHash],
      );

      return res.status(201).json({ success: true, user: result.rows[0] });
    } catch (err) {
      console.error("❌ Register error:", err);
      return res.status(500).json({ error: "Could not create account." });
    }
  });

  router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    try {
      const result = await pool.query("SELECT * FROM users WHERE email = $1", [
        email.toLowerCase().trim(),
      ]);
      const user = result.rows[0];
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      );

      return res.status(200).json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      console.error("❌ Login error:", err);
      return res.status(500).json({ error: "Could not log in." });
    }
  });

  return router;
};