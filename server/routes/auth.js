const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');
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
    const { data: existingEmail, error: emailCheckError } = await supabase
      .from('users')
      .select('id')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (emailCheckError) throw emailCheckError;
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Check if username already in use
    const { data: existingUsername, error: usernameCheckError } = await supabase
      .from('users')
      .select('id')
      .ilike('username', cleanUsername)
      .maybeSingle();

    if (usernameCheckError) throw usernameCheckError;
    if (existingUsername) {
      return res.status(400).json({ success: false, message: 'Username is already taken. Please choose another.' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{ username: cleanUsername, email: cleanEmail, password_hash, role: 'user' }])
      .select('id, username, email, role, created_at')
      .single();

    if (insertError) throw insertError;

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role, email: newUser.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        created_at: newUser.created_at
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
    const { data: foundUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .or(`email.ilike.${loginIdentifier},username.ilike.${loginIdentifier}`)
      .maybeSingle();

    if (userError) throw userError;

    let user = foundUser;
    let isAdminTable = false;

    // 2. Fallback to admins table if not found in users
    if (!user) {
      const { data: foundAdmin, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .ilike('email', loginIdentifier)
        .maybeSingle();

      if (adminError) throw adminError;
      if (foundAdmin) {
        user = foundAdmin;
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
    let { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .ilike('email', adminIdentifier)
      .maybeSingle();

    if (adminError) throw adminError;

    // 2. Fallback: check users table with admin role
    if (!admin) {
      const { data: adminAsUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .or(`email.ilike.${adminIdentifier},username.ilike.${adminIdentifier}`)
        .eq('role', 'admin')
        .maybeSingle();

      if (userError) throw userError;
      admin = adminAsUser;
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
 * Helper to find or create a user signed in via social authentication (Google or Facebook)
 */
async function findOrCreateSocialUser({ email, name, provider, providerId, avatarUrl }) {
  const cleanEmail = String(email).trim().toLowerCase();

  // 1. Check if user with this email already exists
  const { data: existingUser, error: findError } = await supabase
    .from('users')
    .select('*')
    .ilike('email', cleanEmail)
    .maybeSingle();

  if (findError) throw findError;

  if (existingUser) {
    // Update provider_id, auth_provider, avatar_url if needed
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        provider_id: providerId ?? existingUser.provider_id,
        auth_provider: existingUser.auth_provider ?? provider,
        avatar_url: avatarUrl ?? existingUser.avatar_url,
      })
      .eq('id', existingUser.id)
      .select('id, username, email, role, avatar_url, auth_provider, created_at')
      .single();

    if (updateError) throw updateError;
    return updatedUser || existingUser;
  }

  // 2. Generate a clean unique username
  let baseUsername = (name || cleanEmail.split('@')[0])
    .replace(/[^a-zA-Z0-9_]/g, '')
    .toLowerCase()
    .slice(0, 25);
  if (!baseUsername || baseUsername.length < 3) baseUsername = 'guest';

  let candidateUsername = baseUsername;
  let counter = 1;
  while (true) {
    const { data: usernameTaken, error: checkError } = await supabase
      .from('users')
      .select('id')
      .ilike('username', candidateUsername)
      .maybeSingle();

    if (checkError) throw checkError;
    if (!usernameTaken) break;
    candidateUsername = `${baseUsername}${counter++}`;
  }

  // 3. Insert new user
  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert([{
      username: candidateUsername,
      email: cleanEmail,
      role: 'user',
      auth_provider: provider,
      provider_id: providerId,
      avatar_url: avatarUrl,
    }])
    .select('id, username, email, role, avatar_url, auth_provider, created_at')
    .single();

  if (insertError) throw insertError;
  return newUser;
}

/**
 * POST /api/auth/google
 * Authenticate with Google (verifies Google token or demo profile)
 */
router.post('/google', async (req, res) => {
  const { credential, accessToken, email, name, picture, sub, mode } = req.body;

  try {
    let socialEmail = email;
    let socialName = name;
    let socialPicture = picture;
    let socialSub = sub;

    // If Google ID token credential was provided, verify with Google
    if (credential) {
      const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
      if (!verifyRes.ok) {
        return res.status(400).json({ success: false, message: 'Google authentication token could not be verified.' });
      }
      const payload = await verifyRes.json();
      socialEmail = payload.email;
      socialName = payload.name || payload.given_name;
      socialPicture = payload.picture;
      socialSub = payload.sub;
    } else if (accessToken) {
      // If Google OAuth2 access token was provided, fetch from userinfo
      const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!userinfoRes.ok) {
        return res.status(400).json({ success: false, message: 'Google access token could not be verified.' });
      }
      const payload = await userinfoRes.json();
      socialEmail = payload.email;
      socialName = payload.name || payload.given_name;
      socialPicture = payload.picture;
      socialSub = payload.sub;
    } else if (mode === 'demo' || mode === 'mock') {
      if (!socialEmail) {
        return res.status(400).json({ success: false, message: 'Email is required for demo authentication.' });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Google credential or access token is required.' });
    }

    if (!socialEmail) {
      return res.status(400).json({ success: false, message: 'No email associated with this Google account.' });
    }

    const user = await findOrCreateSocialUser({
      email: socialEmail,
      name: socialName,
      provider: 'google',
      providerId: socialSub,
      avatarUrl: socialPicture,
    });

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    return res.json({
      success: true,
      message: 'Successfully signed in with Google!',
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.username,
        email: user.email,
        role: user.role || 'user',
        avatar_url: user.avatar_url,
        auth_provider: user.auth_provider || 'google',
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error('Google auth error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during Google sign in.' });
  }
});

/**
 * POST /api/auth/facebook
 * Authenticate with Facebook (verifies Facebook access token or demo profile)
 */
router.post('/facebook', async (req, res) => {
  const { accessToken, email, name, picture, id, mode } = req.body;

  try {
    let socialEmail = email;
    let socialName = name;
    let socialPicture = picture;
    let socialId = id;

    if (accessToken) {
      const fbRes = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${encodeURIComponent(accessToken)}`
      );
      if (!fbRes.ok) {
        return res.status(400).json({ success: false, message: 'Facebook authentication token could not be verified.' });
      }
      const payload = await fbRes.json();
      socialId = payload.id;
      socialName = payload.name;
      socialEmail = payload.email || `${socialId}@facebook.yuhumstudio.com`;
      socialPicture = payload.picture?.data?.url;
    } else if (mode === 'demo' || mode === 'mock') {
      if (!socialEmail) {
        return res.status(400).json({ success: false, message: 'Email is required for demo authentication.' });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Facebook access token is required.' });
    }

    if (!socialEmail) {
      return res.status(400).json({ success: false, message: 'No email found for this Facebook account.' });
    }

    const user = await findOrCreateSocialUser({
      email: socialEmail,
      name: socialName,
      provider: 'facebook',
      providerId: socialId,
      avatarUrl: socialPicture,
    });

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    return res.json({
      success: true,
      message: 'Successfully signed in with Facebook!',
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.username,
        email: user.email,
        role: user.role || 'user',
        avatar_url: user.avatar_url,
        auth_provider: user.auth_provider || 'facebook',
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error('Facebook auth error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during Facebook sign in.' });
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
      let { data: admin, error: adminError } = await supabase
        .from('admins')
        .select('id, name, email, role')
        .eq('id', decoded.id)
        .maybeSingle();

      if (adminError) throw adminError;

      if (!admin) {
        const { data: adminAsUser, error: userError } = await supabase
          .from('users')
          .select('id, username, email, role')
          .eq('id', decoded.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (userError) throw userError;
        admin = adminAsUser;
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
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, username, email, role, avatar_url, auth_provider, created_at')
      .eq('id', decoded.id)
      .maybeSingle();

    if (findError) throw findError;

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
        avatar_url: user.avatar_url,
        auth_provider: user.auth_provider || 'local',
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
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, email, username')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (findError) throw findError;

    // Always respond with success message to prevent user enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If that email address is registered, a password reset link has been sent.'
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    const { error: updateError } = await supabase
      .from('users')
      .update({ reset_token: token, reset_token_expiry: expiry.toISOString() })
      .eq('id', user.id);

    if (updateError) throw updateError;

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
    let { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('id, email, name, role')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (adminError) throw adminError;

    let isAdminsTable = true;

    // 2. Search users table with role = 'admin'
    if (!admin) {
      const { data: adminAsUser, error: userError } = await supabase
        .from('users')
        .select('id, email, username, role')
        .ilike('email', cleanEmail)
        .eq('role', 'admin')
        .maybeSingle();

      if (userError) throw userError;
      if (adminAsUser) {
        admin = { ...adminAsUser, name: adminAsUser.username };
        isAdminsTable = false;
      }
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
    const { error: updateError } = await supabase
      .from(targetTable)
      .update({ reset_token: token, reset_token_expiry: expiry.toISOString() })
      .eq('id', admin.id);

    if (updateError) throw updateError;

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
    const nowIso = new Date().toISOString();

    // 1. Search in users table
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('reset_token', cleanToken)
      .gt('reset_token_expiry', nowIso)
      .maybeSingle();

    if (userError) throw userError;

    let isDbAdmin = false;

    // 2. Search in admins table
    if (!user) {
      const { data: adminUser, error: adminError } = await supabase
        .from('admins')
        .select('id, email')
        .eq('reset_token', cleanToken)
        .gt('reset_token_expiry', nowIso)
        .maybeSingle();

      if (adminError) throw adminError;
      if (adminUser) {
        user = adminUser;
        isDbAdmin = true;
      }
    }

    if (!user) {
      return res.status(400).json({ success: false, message: 'Password reset link is invalid or has expired.' });
    }

    // 3. Hash new password and clear token fields
    const password_hash = await bcrypt.hash(password, 10);
    const tableName = isDbAdmin ? 'admins' : 'users';

    const { error: updateError } = await supabase
      .from(tableName)
      .update({ password_hash, reset_token: null, reset_token_expiry: null })
      .eq('id', user.id);

    if (updateError) throw updateError;

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