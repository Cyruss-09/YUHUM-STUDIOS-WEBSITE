const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const crypto = require("crypto");
const { resend, FROM_EMAIL, resolveRecipient } = require("../config/mailer");
const { PasswordResetEmail } = require("../emails/PasswordResetEmail");
const router = express.Router();

/* ================= REGISTER ================= */
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);

    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email`,
      [username, email, passwordHash],
    );

    const user = result.rows[0];

    const token = jwt.sign(
      { id: user.id, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    res.status(201).json({ token, user });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role || "user" },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role || "user",
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/* ================= FORGOT PASSWORD ================= */
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const result = await pool.query("SELECT id, email FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.json({ message: "If that email exists, a reset link has been sent." });
    }

    const user = result.rows[0];
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query(
      "UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3",
      [hashedToken, expires, user.id],
    );

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

    if (resend) {
      const recipient = resolveRecipient(user.email);

      // Capture and log the response from Resend
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [recipient],
        subject: "Reset your Yuhum Studio password",
        html: PasswordResetEmail({ resetUrl }),
      });

      if (error) {
        console.error("❌ Resend API Error:", error);
        return res.status(500).json({ message: "Failed to send email.", details: error });
      }

      console.log("✅ Email sent successfully:", data);
    } else {
      console.warn("⚠️ Resend instance is not initialized. Check your RESEND_API_KEY.");
    }

    return res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    console.error("❌ Forgot-password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= RESET PASSWORD ================= */
router.post("/reset-password", async (req, res) => {
  const { email, token, newPassword } = req.body;

  if (!email || !token || !newPassword) {
    return res.status(400).json({ message: "Email, token, and new password are required." });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters." });
  }

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const result = await pool.query(
      `SELECT id FROM users
       WHERE email = $1 AND reset_password_token = $2 AND reset_password_expires > NOW()`,
      [email, hashedToken],
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired reset link." });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await pool.query(
      `UPDATE users
       SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL
       WHERE id = $2`,
      [passwordHash, result.rows[0].id],
    );

    return res.json({ message: "Password reset successful." });
  } catch (err) {
    console.error("❌ Reset-password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= ADMIN LOGIN ================= */
router.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    let result = await pool.query("SELECT * FROM admins WHERE email = $1", [
      email,
    ]);
    let admin = result.rows[0];

    // Fallback: check users table if user is an admin
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

/* ================= GET CURRENT USER (ME) ================= */
router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if it's an admin or regular user based on token role
    let account = null;
    let isAdminRole = decoded.role === "admin";

    if (isAdminRole) {
      const adminResult = await pool.query("SELECT * FROM admins WHERE id = $1", [decoded.id]);
      if (adminResult.rows.length > 0) {
        account = adminResult.rows[0];
      } else {
        const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [decoded.id]);
        if (userResult.rows.length > 0) {
          account = userResult.rows[0];
          account.name = account.username;
          account.role = "admin";
        }
      }
    } else {
      const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [decoded.id]);
      account = userResult.rows[0];
    }

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Return user or admin object matching what your frontend expects
    if (isAdminRole) {
      res.json({
        user: {
          id: account.id,
          name: account.name || account.username,
          email: account.email,
          role: account.role || "admin",
        }
      });
    } else {
      res.json({
        user: {
          id: account.id,
          username: account.username,
          email: account.email,
          role: account.role || "user",
        }
      });
    }
  } catch (err) {
    console.error("❌ Token verification error:", err.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
});

module.exports = router;
