const express = require("express");
const router = express.Router();

// Adjust path to match your Supabase client export
const { supabase } = require("../config/supabase");

// Helper function: Maps input to schema-safe database values
const sanitizePromoPayload = (body) => {
    const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
    const discountType = body.discount_type === "fixed" ? "fixed" : "percentage";
    const discountValue = Number(body.discount_value) || 0;
    const maxUses = body.max_uses ? parseInt(body.max_uses, 10) : null;
    const expiresAt = body.expires_at || null;
    const isActive = body.is_active ?? true;

    return {
        code,
        discount_type: discountType,
        discount_value: discountValue,
        max_uses: maxUses,
        expires_at: expiresAt,
        is_active: isActive,
    };
};

/* ==========================================================================
   GET /api/promos - Fetch all promo codes
   ========================================================================== */
router.get("/", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("promo_codes")
            .select("id, code, discount_type, discount_value, max_uses, used_count, is_active, expires_at, created_at")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("❌ Supabase fetch error:", error.message);
            throw error;
        }

        return res.status(200).json(data || []);
    } catch (err) {
        console.error("❌ Error fetching promo codes:", err.message);
        return res.status(500).json({ error: "Failed to fetch promo codes." });
    }
});

/* ==========================================================================
   POST /api/promos - Create a new promo code
   ========================================================================== */
router.post("/", async (req, res) => {
    const payload = sanitizePromoPayload(req.body);

    if (!payload.code) {
        return res.status(400).json({ error: "Promo code is required." });
    }

    try {
        // 1. Pre-check for duplicate code
        const { data: existingCode } = await supabase
            .from("promo_codes")
            .select("id")
            .eq("code", payload.code)
            .maybeSingle();

        if (existingCode) {
            return res.status(400).json({
                error: `The promo code "${payload.code}" already exists.`,
            });
        }

        // 2. Insert sanitized record
        const { data, error } = await supabase
            .from("promo_codes")
            .insert([payload])
            .select();

        if (error) {
            // Postgres 23505 = Unique Constraint Violation
            if (error.code === "23505") {
                return res.status(400).json({
                    error: `The promo code "${payload.code}" already exists.`,
                });
            }
            // Postgres 42703 = Undefined Column (Schema Mismatch)
            if (error.code === "42703") {
                return res.status(500).json({
                    error: "Database schema mismatch. Please run the migration script in Supabase.",
                });
            }
            throw error;
        }

        return res.status(201).json(data[0]);
    } catch (err) {
        console.error("❌ Error creating promo code:", err.message);
        return res.status(500).json({ error: "Failed to create promo code." });
    }
});

/* ==========================================================================
   PATCH /api/promos/:id - Toggle or update promo code status
   ========================================================================== */
router.patch("/:id", async (req, res) => {
    const { id } = req.params;
    const updates = {};

    // White-list update fields to safeguard against payload injection
    if (req.body.is_active !== undefined) updates.is_active = Boolean(req.body.is_active);
    if (req.body.max_uses !== undefined) updates.max_uses = req.body.max_uses ? parseInt(req.body.max_uses, 10) : null;
    if (req.body.expires_at !== undefined) updates.expires_at = req.body.expires_at || null;

    try {
        const { data, error } = await supabase
            .from("promo_codes")
            .update(updates)
            .eq("id", id)
            .select();

        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(404).json({ error: "Promo code not found." });
        }

        return res.status(200).json(data[0]);
    } catch (err) {
        console.error("❌ Error updating promo code:", err.message);
        return res.status(500).json({ error: "Failed to update promo code." });
    }
});

/* ==========================================================================
   DELETE /api/promos/:id - Delete a promo code
   ========================================================================== */
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const { error } = await supabase
            .from("promo_codes")
            .delete()
            .eq("id", id);

        if (error) throw error;
        return res.status(200).json({ message: "Promo code deleted successfully." });
    } catch (err) {
        console.error("❌ Error deleting promo code:", err.message);
        return res.status(500).json({ error: "Failed to delete promo code." });
    }
});

module.exports = router;