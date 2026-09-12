const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { supabase } = require("../config/supabase");
const { sendPasswordChangedEmail } = require("../config/mailer"); // ⬅ NEW — added to mailer.js below

/**
 * User Registration
 */
const register = async (req, res) => {
    const { username, email, password } = req.body;

    // 1. Basic validation
    if (!username || !email || !password) {
        return res
            .status(400)
            .json({ success: false, message: "Please fill in all required fields." });
    }

    try {
        const cleanEmail = email.toLowerCase().trim();

        // 2. Check if email or username already exists
        const { data: existingUser, error: fetchErr } = await supabase
            .from("users")
            .select("id, email, username")
            .or(`email.eq.${cleanEmail},username.eq.${username}`)
            .maybeSingle();

        if (fetchErr) {
            console.error("❌ Supabase fetch error:", fetchErr);
        }

        if (existingUser) {
            if (existingUser.email === cleanEmail) {
                return res
                    .status(400)
                    .json({ success: false, message: "Email address is already registered." });
            }
            return res
                .status(400)
                .json({ success: false, message: "Username is already taken." });
        }

        // 3. Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 4. Insert user into Supabase
        const { data: newUser, error: insertError } = await supabase
            .from("users")
            .insert([
                {
                    username: username.trim(),
                    email: cleanEmail,
                    password_hash: passwordHash,
                    role: "user",
                },
            ])
            .select("id, username, email, role")
            .single();

        if (insertError) {
            console.error("❌ Supabase insert error details:", insertError);
            return res.status(500).json({
                success: false,
                message: insertError.message || "Failed to create user account.",
            });
        }

        // 5. Generate JWT Token
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, role: newUser.role },
            process.env.JWT_SECRET || "fallback-secret",
            { expiresIn: process.env.JWT_EXPIRY || "7d" }
        );

        return res.status(201).json({
            success: true,
            message: "Account created successfully!",
            token,
            user: newUser,
        });
    } catch (err) {
        console.error("❌ Unhandled registration server error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error during registration.",
        });
    }
};

/**
 * Client User Login Handler
 */
const login = async (req, res) => {
    const { identifier, email, password } = req.body;
    const userIdentifier = (identifier || email || "").toLowerCase().trim();

    if (!userIdentifier || !password) {
        return res.status(400).json({
            success: false,
            message: "Username/Email and password are required.",
        });
    }

    try {
        // Query by email OR username
        const { data: user, error: fetchErr } = await supabase
            .from("users")
            .select("id, username, email, password_hash, role")
            .or(`email.eq.${userIdentifier},username.eq.${userIdentifier}`)
            .maybeSingle();

        if (fetchErr || !user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials.",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials.",
            });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || "fallback-secret",
            { expiresIn: process.env.JWT_EXPIRY || "7d" }
        );

        const { password_hash, ...userData } = user;

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            token,
            user: userData,
        });
    } catch (err) {
        console.error("❌ Login server error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error during login.",
        });
    }
};

/**
 * Admin Login Handler
 */
const adminLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required.",
        });
    }

    try {
        const cleanEmail = email.toLowerCase().trim();

        const { data: admin, error: fetchErr } = await supabase
            .from("users")
            .select("id, username, email, password_hash, role")
            .eq("email", cleanEmail)
            .maybeSingle();

        if (fetchErr || !admin || admin.role !== "admin") {
            return res.status(401).json({
                success: false,
                message: "Invalid administrator credentials.",
            });
        }

        const isMatch = await bcrypt.compare(password, admin.password_hash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid administrator credentials.",
            });
        }

        const token = jwt.sign(
            { id: admin.id, email: admin.email, role: admin.role },
            process.env.JWT_SECRET || "fallback-secret",
            { expiresIn: process.env.JWT_EXPIRY || "1d" }
        );

        const { password_hash, ...adminData } = admin;

        return res.status(200).json({
            success: true,
            message: "Admin authenticated successfully.",
            token,
            admin: adminData,
        });
    } catch (err) {
        console.error("❌ Admin login server error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error during admin login.",
        });
    }
};

/**
 * Rehydrate Client Session (/api/auth/me)
 * CALLED ON PAGE RELOAD BY AUTHCONTEXT
 */
const getMe = async (req, res) => {
    try {
        const userId = req.user.id || req.user.userId;

        const { data: user, error } = await supabase
            .from("users")
            .select("id, username, email, role")
            .eq("id", userId)
            .single();

        if (error || !user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // MUST return { user: ... } format to match AuthContext
        return res.status(200).json({
            success: true,
            user,
        });
    } catch (err) {
        console.error("❌ getMe error:", err);
        return res.status(500).json({ success: false, message: "Server error fetching user session." });
    }
};

/**
 * Rehydrate Admin Session (/api/admin/me)
 * CALLED ON PAGE RELOAD BY AUTHCONTEXT
 */
const getAdminMe = async (req, res) => {
    try {
        const adminId = req.user.id || req.user.userId;

        const { data: admin, error } = await supabase
            .from("users")
            .select("id, username, email, role")
            .eq("id", adminId)
            .single();

        if (error || !admin || admin.role !== "admin") {
            return res.status(403).json({ success: false, message: "Unauthorized admin session." });
        }

        // MUST return { admin: ... } format to match AuthContext
        return res.status(200).json({
            success: true,
            admin,
        });
    } catch (err) {
        console.error("❌ getAdminMe error:", err);
        return res.status(500).json({ success: false, message: "Server error fetching admin session." });
    }
};

/**
 * Change Password (client, self-service)
 * PATCH /api/auth/change-password — requires verifyToken
 */
const changePassword = async (req, res) => {
    try {
        const userId = req.user.id || req.user.userId;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current and new password are required.",
            });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 8 characters.",
            });
        }

        const { data: user, error: fetchErr } = await supabase
            .from("users")
            .select("id, email, username, password_hash")
            .eq("id", userId)
            .single();

        if (fetchErr || !user) {
            return res.status(404).json({ success: false, message: "Account not found." });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect.",
            });
        }

        const isSame = await bcrypt.compare(newPassword, user.password_hash);
        if (isSame) {
            return res.status(400).json({
                success: false,
                message: "New password must be different from your current password.",
            });
        }

        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(newPassword, salt);

        const { error: updateErr } = await supabase
            .from("users")
            .update({ password_hash: newHash })
            .eq("id", userId);

        if (updateErr) {
            console.error("❌ changePassword update error:", updateErr);
            return res.status(500).json({
                success: false,
                message: "Failed to update password. Please try again.",
            });
        }

        // Fire-and-forget confirmation email — don't block the response on delivery
        sendPasswordChangedEmail({ to: user.email, username: user.username }).catch((err) => {
            console.error("❌ Failed to send password-changed email:", err);
        });

        return res.status(200).json({
            success: true,
            message: "Your password has been updated successfully. A confirmation email has been sent to your inbox.",
        });
    } catch (err) {
        console.error("❌ changePassword server error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error while changing password.",
        });
    }
};

module.exports = {
    register,
    login,
    adminLogin,
    getMe,
    getAdminMe,
    changePassword, // ⬅ NEW
};