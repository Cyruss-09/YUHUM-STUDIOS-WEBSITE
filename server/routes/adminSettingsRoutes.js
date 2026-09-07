const express = require("express");
const router = express.Router();
const { supabase } = require("../config/supabase");

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

module.exports = router;