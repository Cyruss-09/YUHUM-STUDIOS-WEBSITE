const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { getResend, FROM_EMAIL, resolveRecipient } = require('../config/mailer');
console.log('DEBUG mailer import:', { getResend, FROM_EMAIL, resolveRecipient });
const { PasswordResetEmail } = require('../emails/PasswordResetEmail');

// POST /register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
      [username, email, password_hash, 'user']
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed.' });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(400).json({ message: 'Invalid credentials.' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ message: 'Invalid credentials.' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Login failed.' });
  }
});

// POST /admin/login
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let result = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
    let user = result.rows[0];

    if (!user) {
      result = await pool.query("SELECT * FROM users WHERE email = $1 AND role = 'admin'", [email]);
      user = result.rows[0];
    }

    if (!user) return res.status(400).json({ message: 'Invalid credentials.' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ message: 'Invalid credentials.' });

    const token = jwt.sign({ id: user.id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' });
    // Returned as 'admin' key to match loginAdmin() in AuthContext
    res.json({ token, admin: { id: user.id, email: user.email, role: 'admin' } });
  } catch (err) {
    res.status(500).json({ message: 'Login failed.' });
  }
});

// GET /me
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided.' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the user is an Admin
    if (decoded.role === 'admin') {
      let adminResult = await pool.query('SELECT id, email, \'admin\' as role FROM admins WHERE id = $1', [decoded.id]);
      let admin = adminResult.rows[0];

      if (!admin) {
        adminResult = await pool.query('SELECT id, username, email, role FROM users WHERE id = $1 AND role = \'admin\'', [decoded.id]);
        admin = adminResult.rows[0];
      }

      if (admin) {
        return res.json({ user: admin });
      }
    }

    // Standard User lookup
    const result = await pool.query('SELECT id, username, email, role FROM users WHERE id = $1', [decoded.id]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ message: 'User not found.' });

    res.json({ user });
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
});

// POST /forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required.' });

  try {
    // 1. Check users table
    let userResult = await pool.query('SELECT id, email FROM users WHERE email = $1', [email]);
    let user = userResult.rows[0];
    let isDbAdmin = false;

    // 2. Check admins table if not found in users
    if (!user) {
      userResult = await pool.query('SELECT id, email FROM admins WHERE email = $1', [email]);
      user = userResult.rows[0];
      if (user) isDbAdmin = true;
    }

    if (!user) {
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now

    // 3. Persist reset token
    const tableName = isDbAdmin ? 'admins' : 'users';
    await pool.query(
      `UPDATE ${tableName} SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3`,
      [token, expiry.toISOString(), user.id]
    );

    const resetLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${token}`;

    const resend = getResend();
    if (resend) {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: resolveRecipient(user.email),
        subject: 'Reset your password',
        html: PasswordResetEmail({ resetUrl: resetLink }),
      });
    }

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Error initiating password reset.' });
  }
});

// POST /reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: 'New password is required.' });
  }

  try {
    const cleanToken = decodeURIComponent(token).trim();

    // 1. Search in users table (checking expiry against current JS ISO timestamp)
    let userResult = await pool.query(
      'SELECT id, email FROM users WHERE reset_token = $1 AND reset_token_expiry > $2',
      [cleanToken, new Date().toISOString()]
    );
    let user = userResult.rows[0];
    let isDbAdmin = false;

    // 2. Search in admins table if not in users
    if (!user) {
      userResult = await pool.query(
        'SELECT id, email FROM admins WHERE reset_token = $1 AND reset_token_expiry > $2',
        [cleanToken, new Date().toISOString()]
      );
      user = userResult.rows[0];
      if (user) isDbAdmin = true;
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    // 3. Hash the new password and clear token fields
    const password_hash = await bcrypt.hash(password, 10);
    const tableName = isDbAdmin ? 'admins' : 'users';

    await pool.query(
      `UPDATE ${tableName} SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2`,
      [password_hash, user.id]
    );

    console.log(`Password successfully updated for ${user.email} in ${tableName} table.`);
    return res.json({ message: 'Password reset successful.' });
  } catch (err) {
    console.error('Reset password server error:', err);
    return res.status(500).json({ message: 'Password reset failed on server.' });
  }
});

module.exports = router;