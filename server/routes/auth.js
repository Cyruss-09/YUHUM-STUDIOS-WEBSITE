const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');
const { getResend, FROM_EMAIL, resolveRecipient } = require('../config/mailer');
const { PasswordResetEmail } = require('../emails/PasswordResetEmail');
const { AdminPasswordResetEmail } = require('../emails/AdminPasswordResetEmail');

// Delegate registration and admin login to controller handlers
const { register, adminLogin } = require('../controllers/authController');

const JWT_SECRET = process.env.JWT_SECRET || 'yuhum-secret-token-key-change-in-env';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
const IS_PROD = process.env.NODE_ENV === 'production';

/**
 * POST /api/auth/register
 * Register a new user account via Auth Controller
 */
router.post('/register', register);

/**
 * POST /api/auth/admin/login
 * Dedicated Administrator Login via Auth Controller
 */
router.post('/admin/login', adminLogin);

/**
 * POST /api/auth/login
 * User login supporting email or username
 */
router.post('/login', async (req, res) => {
  const { identifier, email, username, password } = req.body;
  const rawIdentifier = String(identifier || email || username || '').trim();

  if (!rawIdentifier || !password) {
    return res.status(400).json({ success: false, message: 'Email/Username and password are required.' });
  }

  try {
    // 1. Try matching by email first
    let { data: foundUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .ilike('email', rawIdentifier)
      .maybeSingle();

    if (userError) throw userError;

    // 2. Fall back to matching by username if no email match
    if (!foundUser) {
      const { data: byUsername, error: usernameError } = await supabase
        .from('users')
        .select('*')
        .ilike('username', rawIdentifier)
        .maybeSingle();

      if (usernameError) throw usernameError;
      foundUser = byUsername;
    }

    let user = foundUser;
    let isAdminTable = false;

    // 3. Fallback to admins table if not found in users
    if (!user) {
      const { data: foundAdmin, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .ilike('email', rawIdentifier)
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
      ...(role === 'admin' ? { admin: userProfile } : {})
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Login failed due to a server error.' });
  }
});

/**
 * Helper to generate a unique username safely
 */
async function generateUniqueUsername(base) {
  let cleanBase = String(base || 'user')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .toLowerCase()
    .slice(0, 18);

  if (!cleanBase || cleanBase.length < 3) cleanBase = 'user';

  // Try pure base first
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .ilike('username', cleanBase)
    .maybeSingle();

  if (!existing) return cleanBase;

  // Append a random 4-hex string to guarantee uniqueness & avoid query loops/race conditions
  const suffix = crypto.randomBytes(2).toString('hex');
  return `${cleanBase}_${suffix}`;
}

/**
 * Helper to find or create a user signed in via social authentication (Google or Facebook)
 */
async function findOrCreateSocialUser({ email, name, provider, providerId, avatarUrl }) {
  const cleanEmail = String(email).trim().toLowerCase();

  const { data: existingUser, error: findError } = await supabase
    .from('users')
    .select('*')
    .ilike('email', cleanEmail)
    .maybeSingle();

  if (findError) throw findError;

  if (existingUser) {
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

  const candidateUsername = await generateUniqueUsername(name || cleanEmail.split('@')[0]);

  try {
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
  } catch (err) {
    // Retry once with an absolute unique fallback in case of exact simultaneous insert collision
    const fallbackUsername = `user_${crypto.randomBytes(4).toString('hex')}`;
    const { data: fallbackUser, error: fallbackError } = await supabase
      .from('users')
      .insert([{
        username: fallbackUsername,
        email: cleanEmail,
        role: 'user',
        auth_provider: provider,
        provider_id: providerId,
        avatar_url: avatarUrl,
      }])
      .select('id, username, email, role, avatar_url, auth_provider, created_at')
      .single();

    if (fallbackError) throw fallbackError;
    return fallbackUser;
  }
}

/**
 * POST /api/auth/google
 */
router.post('/google', async (req, res) => {
  const { credential, accessToken, email, name, picture, sub, mode } = req.body;

  try {
    let socialEmail = email;
    let socialName = name;
    let socialPicture = picture;
    let socialSub = sub;

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
    } else if (!IS_PROD && (mode === 'demo' || mode === 'mock')) {
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
    } else if (!IS_PROD && (mode === 'demo' || mode === 'mock')) {
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
 */
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, message: 'No token provided.' });

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

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

    if (!user) {
      return res.json({
        success: true,
        message: 'If that email address is registered, a password reset link has been sent.'
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 30 * 60 * 1000);

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
 */
router.post('/admin/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Admin email address is required.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();

  try {
    let { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('id, email, name, role')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (adminError) throw adminError;

    let isAdminsTable = true;

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

    if (!admin) {
      return res.json({
        success: true,
        message: 'If that administrator email exists, a secure reset link has been sent.'
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 30 * 60 * 1000);

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

    let { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('reset_token', cleanToken)
      .gt('reset_token_expiry', nowIso)
      .maybeSingle();

    if (userError) throw userError;

    let isDbAdmin = false;

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

    const password_hash = await bcrypt.hash(password, 10);
    const tableName = isDbAdmin ? 'admins' : 'users';

    const { error: updateError } = await supabase
      .from(tableName)
      .update({ password_hash, reset_token: null, reset_token_expiry: null })
      .eq('id', user.id);

    if (updateError) throw updateError;

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