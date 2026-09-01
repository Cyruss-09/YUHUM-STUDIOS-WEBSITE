const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { getResend, FROM_EMAIL, resolveRecipient } = require('../config/mailer');
const { PasswordResetEmail } = require('../emails/PasswordResetEmail');
const { AdminPasswordResetEmail } = require('../emails/AdminPasswordResetEmail');

const JWT_SECRET = process.env.JWT_SECRET || 'yuhum-secret-token-key-change-in-env';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

/**
 * POST /api/auth/register
 * Register a new user account
 */
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: 'Username, email, and password are required.' });
  }

  const cleanUsername = String(username).trim();
  const cleanEmail = String(email).trim().toLowerCase();

  if (cleanUsername.length < 3) {
    return res.status(400).json({ success: false, message: 'Username must be at least 3 characters.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }

  if (String(password).length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
  }

  try {
    // Check if email already in use
    const existingEmail = await pool.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [cleanEmail]
    );
    if (existingEmail.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Check if username already in use
    const existingUsername = await pool.query(
      'SELECT id FROM users WHERE LOWER(username) = LOWER($1)',
      [cleanUsername]
    );
    if (existingUsername.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Username is already taken. Please choose another.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at',
      [cleanUsername, cleanEmail, password_hash, 'user']
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, message: 'Registration failed due to a server error.' });
  }
});

/**
 * POST /api/auth/login
 * User login supporting email or username
 */
router.post('/login', async (req, res) => {
  const { identifier, email, username, password } = req.body;
  const loginIdentifier = String(identifier || email || username || '').trim();

  if (!loginIdentifier || !password) {
    return res.status(400).json({ success: false, message: 'Email/Username and password are required.' });
  }

  try {
    // 1. Search in users table by email or username
    let result = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1)',
      [loginIdentifier]
    );
    let user = result.rows[0];

    // 2. Fallback to admins table if not found in users
    let isAdminTable = false;
    if (!user) {
      const adminResult = await pool.query(
        'SELECT * FROM admins WHERE LOWER(email) = LOWER($1)',
        [loginIdentifier]
      );
      if (adminResult.rows.length > 0) {
        user = adminResult.rows[0];
        isAdminTable = true;
      }
    }

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email/username or password.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(400).json({ success: false, message: 'Invalid email/username or password.' });
    }

    const role = user.role || (isAdminTable ? 'admin' : 'user');
    const token = jwt.sign(
      { id: user.id, role, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    const userProfile = {
      id: user.id,
      username: user.username || user.name,
      name: user.name || user.username,
      email: user.email,
      role
    };

    return res.json({
      success: true,
      token,
      user: userProfile,
      // Provide admin key if role is admin for legacy consumers
      ...(role === 'admin' ? { admin: userProfile } : {})
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Login failed due to a server error.' });
  }
});

/**
 * POST /api/auth/admin/login
 * Dedicated Administrator Login
 */
router.post('/admin/login', async (req, res) => {
  const { email, username, password } = req.body;
  const adminIdentifier = String(email || username || '').trim();

  if (!adminIdentifier || !password) {
    return res.status(400).json({ success: false, message: 'Admin email and password are required.' });
  }

  try {
    // 1. Check admins table
    let result = await pool.query(
      'SELECT * FROM admins WHERE LOWER(email) = LOWER($1)',
      [adminIdentifier]
    );
    let admin = result.rows[0];

    // 2. Fallback: check users table with admin role
    if (!admin) {
      result = await pool.query(
        "SELECT * FROM users WHERE (LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1)) AND role = 'admin'",
        [adminIdentifier]
      );
      admin = result.rows[0];
    }

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid administrator credentials.' });
    }

    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid administrator credentials.' });
    }

    const token = jwt.sign(
      { id: admin.id, role: 'admin', email: admin.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    const adminProfile = {
      id: admin.id,
      name: admin.name || admin.username || 'Admin',
      username: admin.username || admin.name || 'Admin',
      email: admin.email,
      role: 'admin'
    };

    return res.json({
      success: true,
      token,
      admin: adminProfile,
      user: adminProfile
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ success: false, message: 'Admin login failed due to a server error.' });
  }
});

/**
 * GET /api/auth/me
 * Validate current session and retrieve profile
 */
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, message: 'No token provided.' });

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check admin role
    if (decoded.role === 'admin') {
      let adminResult = await pool.query(
        'SELECT id, name, email, role FROM admins WHERE id = $1',
        [decoded.id]
      );
      let admin = adminResult.rows[0];

      if (!admin) {
        adminResult = await pool.query(
          "SELECT id, username, email, role FROM users WHERE id = $1 AND role = 'admin'",
          [decoded.id]
        );
        admin = adminResult.rows[0];
      }

      if (admin) {
        const profile = {
          id: admin.id,
          username: admin.username || admin.name || 'Admin',
          name: admin.name || admin.username || 'Admin',
          email: admin.email,
          role: 'admin'
        };
        return res.json({ success: true, user: profile, admin: profile });
      }
    }

    // Standard User lookup
    const result = await pool.query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = $1',
      [decoded.id]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.username,
        email: user.email,
        role: user.role || 'user',
        created_at: user.created_at
      }
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
});

/**
 * POST /api/auth/forgot-password
 * Initiate Client Password Reset Email
 */
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email address is required.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();

  try {
    const userResult = await pool.query(
      'SELECT id, email, username FROM users WHERE LOWER(email) = LOWER($1)',
      [cleanEmail]
    );
    const user = userResult.rows[0];

    // Always respond with success message to prevent user enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If that email address is registered, a password reset link has been sent.'
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
      [token, expiry.toISOString(), user.id]
    );

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetLink = `${clientUrl}/reset-password/${token}`;

    const resend = getResend();
    if (resend) {
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: resolveRecipient(user.email),
          subject: 'Reset your Yuhum Studios password',
          html: PasswordResetEmail({ resetUrl: resetLink, username: user.username, email: user.email }),
        });
      } catch (mailErr) {
        console.error('Client reset email error:', mailErr.message || mailErr);
      }
    } else {
      console.log(`\n🔑 [Client Password Reset Link for ${user.email}]: ${resetLink}\n`);
    }

    return res.json({
      success: true,
      message: 'If that email address is registered, a password reset link has been sent.'
    });
  } catch (err) {
    console.error('Client forgot password error:', err);
    return res.status(500).json({ success: false, message: 'Error initiating password reset.' });
  }
});

/**
 * POST /api/auth/admin/forgot-password
 * Initiate Admin Security Password Reset Email
 */
router.post('/admin/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Admin email address is required.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();

  try {
    // 1. Search admins table
    let adminResult = await pool.query(
      'SELECT id, email, name, role FROM admins WHERE LOWER(email) = LOWER($1)',
      [cleanEmail]
    );
    let admin = adminResult.rows[0];
    let isAdminsTable = true;

    // 2. Search users table with role = 'admin'
    if (!admin) {
      adminResult = await pool.query(
        "SELECT id, email, username as name, role FROM users WHERE LOWER(email) = LOWER($1) AND role = 'admin'",
        [cleanEmail]
      );
      admin = adminResult.rows[0];
      if (admin) isAdminsTable = false;
    }

    // Always respond with generic message to prevent account enumeration
    if (!admin) {
      return res.json({
        success: true,
        message: 'If that administrator email exists, a secure reset link has been sent.'
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    const targetTable = isAdminsTable ? 'admins' : 'users';
    await pool.query(
      `UPDATE ${targetTable} SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3`,
      [token, expiry.toISOString(), admin.id]
    );

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetLink = `${clientUrl}/admin-reset-password/${token}`;

    const resend = getResend();
    if (resend) {
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: resolveRecipient(admin.email),
          subject: '🔒 Security Alert: Admin Password Reset Request - Yuhum Studios',
          html: AdminPasswordResetEmail({
            resetUrl: resetLink,
            adminName: admin.name || 'Administrator',
            adminEmail: admin.email
          }),
        });
      } catch (mailErr) {
        console.error('Admin reset email error:', mailErr.message || mailErr);
      }
    } else {
      console.log(`\n🛡️ [Admin Security Password Reset Link for ${admin.email}]: ${resetLink}\n`);
    }

    return res.json({
      success: true,
      message: 'If that administrator email exists, a secure reset link has been sent.'
    });
  } catch (err) {
    console.error('Admin forgot password error:', err);
    return res.status(500).json({ success: false, message: 'Error initiating admin password reset.' });
  }
});

/**
 * POST /api/auth/reset-password/:token & POST /api/auth/admin/reset-password
 * Complete password reset with token
 */
const handleResetPassword = async (req, res) => {
  const token = req.params.token || req.body.token;
  const password = req.body.password || req.body.newPassword;

  if (!token) {
    return res.status(400).json({ success: false, message: 'Reset token is required.' });
  }

  if (!password || String(password).length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
  }

  try {
    const cleanToken = decodeURIComponent(String(token)).trim();

    // 1. Search in users table
    let userResult = await pool.query(
      'SELECT id, email FROM users WHERE reset_token = $1 AND reset_token_expiry > $2',
      [cleanToken, new Date().toISOString()]
    );
    let user = userResult.rows[0];
    let isDbAdmin = false;

    // 2. Search in admins table
    if (!user) {
      userResult = await pool.query(
        'SELECT id, email FROM admins WHERE reset_token = $1 AND reset_token_expiry > $2',
        [cleanToken, new Date().toISOString()]
      );
      user = userResult.rows[0];
      if (user) isDbAdmin = true;
    }

    if (!user) {
      return res.status(400).json({ success: false, message: 'Password reset link is invalid or has expired.' });
    }

    // 3. Hash new password and clear token fields
    const password_hash = await bcrypt.hash(password, 10);
    const tableName = isDbAdmin ? 'admins' : 'users';

    await pool.query(
      `UPDATE ${tableName} SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2`,
      [password_hash, user.id]
    );

    console.log(`✅ Password successfully reset for ${user.email} in ${tableName} table.`);
    return res.json({ success: true, message: 'Your password has been successfully reset! You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ success: false, message: 'Password reset failed on the server.' });
  }
};

router.post('/reset-password/:token', handleResetPassword);
router.post('/reset-password', handleResetPassword);
router.post('/admin/reset-password', handleResetPassword);

module.exports = router;