const { supabase } = require('../config/supabase');

// Get active promo codes
const getPromoCodes = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('promo_codes')
            .select('id, code, discount_type, discount_value, min_spend, max_uses, used_count, expires_at, is_active, created_at');

        if (error) return res.status(400).json({ success: false, message: error.message });
        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching promo codes' });
    }
};

// Validate promo code (read-only check — does NOT increment used_count)
const validatePromoCode = async (req, res) => {
    const { code } = req.params;
    const orderTotal = req.query.orderTotal ? Number(req.query.orderTotal) : null;

    try {
        const { data: promo, error } = await supabase
            .from('promo_codes')
            .select('*')
            .eq('code', code)
            .maybeSingle();

        if (error) throw error;

        if (!promo) {
            return res.status(404).json({ success: false, message: 'Invalid promo code.' });
        }

        if (!promo.is_active) {
            return res.status(400).json({ success: false, message: 'This promo code is no longer active.' });
        }

        if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
            return res.status(400).json({ success: false, message: 'This promo code has expired.' });
        }

        if (promo.max_uses !== null && promo.used_count >= promo.max_uses) {
            return res.status(400).json({ success: false, message: 'This promo code has reached its usage limit.' });
        }

        if (promo.min_spend && orderTotal !== null && orderTotal < promo.min_spend) {
            return res.status(400).json({
                success: false,
                message: `This promo code requires a minimum spend of ${promo.min_spend}.`
            });
        }

        return res.status(200).json({ success: true, data: promo });
    } catch (err) {
        console.error('Promo code validation error:', err);
        res.status(500).json({ success: false, message: 'Error validating promo code' });
    }
};

// Apply promo code — call this ONLY when a booking/order is actually confirmed,
// not on every validation check. Increments used_count.
const applyPromoCode = async (req, res) => {
    const { code } = req.params;

    try {
        const { data: promo, error: fetchError } = await supabase
            .from('promo_codes')
            .select('id, used_count, max_uses, is_active, expires_at')
            .eq('code', code)
            .maybeSingle();

        if (fetchError) throw fetchError;

        if (!promo) {
            return res.status(404).json({ success: false, message: 'Invalid promo code.' });
        }

        if (!promo.is_active) {
            return res.status(400).json({ success: false, message: 'This promo code is no longer active.' });
        }

        if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
            return res.status(400).json({ success: false, message: 'This promo code has expired.' });
        }

        if (promo.max_uses !== null && promo.used_count >= promo.max_uses) {
            return res.status(400).json({ success: false, message: 'This promo code has reached its usage limit.' });
        }

        // Conditional update: only increments if used_count still matches what we just read,
        // and (if capped) still under max_uses. This narrows — though doesn't fully eliminate —
        // the race window if two requests apply the same code at the same instant.
        let updateQuery = supabase
            .from('promo_codes')
            .update({ used_count: promo.used_count + 1 })
            .eq('id', promo.id)
            .eq('used_count', promo.used_count);

        if (promo.max_uses !== null) {
            updateQuery = updateQuery.lt('used_count', promo.max_uses);
        }

        const { data: updated, error: updateError } = await updateQuery
            .select('id, code, used_count, max_uses')
            .maybeSingle();

        if (updateError) throw updateError;

        if (!updated) {
            // Someone else applied/used it in the meantime
            return res.status(409).json({ success: false, message: 'This promo code was just used up. Please try again.' });
        }

        return res.status(200).json({ success: true, data: updated });
    } catch (err) {
        console.error('Promo code apply error:', err);
        res.status(500).json({ success: false, message: 'Error applying promo code' });
    }
};

module.exports = { getPromoCodes, validatePromoCode, applyPromoCode };