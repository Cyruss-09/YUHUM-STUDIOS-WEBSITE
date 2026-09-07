const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { supabase } = require("../config/supabase");

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
        // Make sure column names match your database schema (password_hash or password)
        const { data: newUser, error: insertError } = await supabase
            .from("users")
            .insert([
                {
                    username: username.trim(),
                    email: cleanEmail,
                    password_hash: passwordHash, // Change to 'password' if your column is named 'password'
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

module.exports = {
    register,
};