const express = require("express");
const router = express.Router();
const { supabase } = require("../config/supabase");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "yuhum-secret-token-key-change-in-env";

// GET /api/admin/settings
router.get("/settings", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("studio_settings")
            .select("*")
            .single();

        if (error && error.code !== "PGRST116") {
            throw error;
        }

        return res.status(200).json(data || {});
    } catch (err) {
        console.error("❌ Error fetching settings:", err.message);
        return res.status(500).json({ error: "Failed to fetch studio settings." });
    }
});

// PUT /api/admin/settings
router.put("/settings", async (req, res) => {
    try {
        const settingsData = req.body;

        const { data, error } = await supabase
            .from("studio_settings")
            .upsert({ id: 1, ...settingsData })
            .select()
            .single();

        if (error) throw error;

        return res.status(200).json({ success: true, data });
    } catch (err) {
        console.error("❌ Error updating settings:", err.message);
        return res.status(500).json({ error: "Failed to update studio settings." });
    }
});

// GET /api/admin/promo-codes
router.get("/promo-codes", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("promo_codes")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        // Ensure we always return an array
        return res.status(200).json(Array.isArray(data) ? data : []);
    } catch (err) {
        console.error("❌ Error fetching promo codes:", err.message);
        return res.status(500).json([]);
    }
});

// POST /api/admin/promo-codes
router.post("/promo-codes", async (req, res) => {
    try {
        const { code, discount_percent, discount, valid_until } = req.body;

        // Use discount_percent or fallback to discount/default 10
        const finalDiscount = Number(discount_percent || discount || 10);

        const { data, error } = await supabase
            .from("promo_codes")
            .insert([
                {
                    code: code ? code.toUpperCase().trim() : "PROMO10",
                    discount_percent: finalDiscount,
                    valid_until: valid_until || null
                }
            ])
            .select()
            .single();

        if (error) throw error;

        return res.status(201).json({ success: true, data });
    } catch (err) {
        console.error("❌ Error creating promo code:", err.message);
        return res.status(500).json({ error: err.message || "Failed to create promo code." });
    }
});

// POST /api/admin/change-password
router.post("/change-password", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "No token provided." });
    }

    const token = authHeader.slice(7).trim();
    let decoded;
    try {
        decoded = jwt.verify(token, JWT_SECRET);
    } catch {
        return res.status(401).json({ success: false, message: "Invalid or expired token." });
    }

    if (decoded.role !== "admin") {
        return res.status(403).json({ success: false, message: "Admin access only." });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: "Current password and new password are required." });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: "New password must be at least 6 characters." });
    }

    try {
        const adminId = decoded.id;

        // Try users table first (admins stored as role=admin in users)
        let { data: adminUser, error: userErr } = await supabase
            .from("users")
            .select("id, password_hash, role")
            .eq("id", adminId)
            .maybeSingle();

        if (userErr) throw userErr;

        let targetTable = "users";
        let record = adminUser;

        // Fallback to dedicated admins table
        if (!record || record.role !== "admin") {
            const { data: adminRecord, error: adminErr } = await supabase
                .from("admins")
                .select("id, password_hash")
                .eq("id", adminId)
                .maybeSingle();

            if (adminErr) throw adminErr;
            if (adminRecord) {
                record = adminRecord;
                targetTable = "admins";
            }
        }

        if (!record) {
            return res.status(404).json({ success: false, message: "Admin account not found." });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, record.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Current password is incorrect." });
        }

        // Hash and save new password
        const newHash = await bcrypt.hash(newPassword, 10);
        const { error: updateErr } = await supabase
            .from(targetTable)
            .update({ password_hash: newHash })
            .eq("id", adminId);

        if (updateErr) throw updateErr;

        return res.status(200).json({ success: true, message: "Password updated successfully." });
    } catch (err) {
        console.error("❌ Error changing admin password:", err.message);
        return res.status(500).json({ success: false, message: "Failed to update password." });
    }
});

module.exports = router;
