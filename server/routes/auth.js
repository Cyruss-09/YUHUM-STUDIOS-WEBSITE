const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { getResend, FROM_EMAIL, resolveRecipient } = require('../config/mailer');
console.log('DEBUG mailer import:', { getResend, FROM_EMAIL, resolveRecipient });
const PasswordResetEmail = require('../emails/PasswordResetEmail');



// POST /register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered.' });
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
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(400).json({ error: 'Invalid credentials.' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ error: 'Invalid credentials.' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.' });
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

    if (!user) return res.status(400).json({ error: 'Invalid credentials.' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ error: 'Invalid credentials.' });

    const token = jwt.sign({ id: user.id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: user.id, email: user.email, role: 'admin' } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.' });
  }
});

// GET /me
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided.' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query('SELECT id, username, email, role FROM users WHERE id = $1', [decoded.id]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
});

// POST /forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = userResult.rows[0];

  if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });

  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 1000 * 60 * 30);

  await pool.query(
    'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
    [token, expiry, user.id]
  );

  const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

  const resend = getResend();
  if (resend) {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: resolveRecipient(user.email),
      subject: 'Reset your password',
      html: PasswordResetEmail({ resetLink }),
    });
  }

  res.json({ message: 'If that email exists, a reset link has been sent.' });
});

// POST /reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const userResult = await pool.query(
    'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
    [token]
  );
  const user = userResult.rows[0];
  if (!user) return res.status(400).json({ error: 'Invalid or expired reset link.' });

  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
    [hash, user.id]
  );

  res.json({ message: 'Password reset successful.' });
});

module.exports = router;