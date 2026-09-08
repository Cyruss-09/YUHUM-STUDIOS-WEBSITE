const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { supabase } = require("../config/supabase");

/**
 * User Registration
 */
const register = async (req, res) => {
    const { username, email, password } = req.body;

    // 1. Basic validation
    if (!username || !email || !password) {
        return res
            .status(400)
            .json({ success: false, error: "Please fill in all required fields." });
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
                    .json({ success: false, error: "Email address is already registered." });
            }
            return res
                .status(400)
                .json({ success: false, error: "Username is already taken." });
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
                error: insertError.message || "Failed to create user account.",
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
            error: "Internal server error during registration.",
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

        // 1. Query user from Supabase using password_hash
        const { data: admin, error: fetchErr } = await supabase
            .from("users")
            .select("id, username, email, password_hash, role")
            .eq("email", cleanEmail)
            .maybeSingle();

        if (fetchErr) {
            console.error("❌ Supabase admin query error:", fetchErr);
            return res
                .status(500)
                .json({ success: false, message: "Database query error." });
        }

        // 2. Validate user existence and role
        if (!admin || admin.role !== "admin") {
            console.log(`❌ Login rejected: User not found or not an admin (${cleanEmail})`);
            return res.status(401).json({
                success: false,
                message: "Invalid administrator credentials.",
            });
        }

        // 3. Compare input password against stored bcrypt hash
        const isMatch = await bcrypt.compare(password, admin.password_hash);

        if (!isMatch) {
            console.log(`❌ Login rejected: Password mismatch for (${cleanEmail})`);
            return res.status(401).json({
                success: false,
                message: "Invalid administrator credentials.",
            });
        }

        // 4. Generate JWT Token
        const token = jwt.sign(
            { id: admin.id, email: admin.email, role: admin.role },
            process.env.JWT_SECRET || "fallback-secret",
            { expiresIn: process.env.JWT_EXPIRY || "1d" }
        );

        // Omit password hash from response payload
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

module.exports = {
    register,
    adminLogin,
};