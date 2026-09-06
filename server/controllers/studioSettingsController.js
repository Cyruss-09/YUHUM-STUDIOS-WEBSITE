const { supabase } = require('../config/supabase');

// Get studio settings (operating hours, studio rates, rules)
// Returns a keyed object, e.g. { cms: { maintenanceMode: true }, rates: {...} }
// instead of a raw array of rows, so the frontend can read settings.cms.maintenanceMode directly.
const getStudioSettings = async (req, res) => {
    try {
        const { data, error } = await supabase.from('studio_settings').select('*');
        if (error) return res.status(400).json({ success: false, message: error.message });

        const settings = {};
        for (const row of data) {
            settings[row.setting_key] = row.setting_value;
        }

        res.status(200).json({ success: true, data: settings });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching settings' });
    }
};

// Update setting key-value pair
const updateStudioSetting = async (req, res) => {
    const { setting_key, setting_value } = req.body;

    if (!setting_key || typeof setting_key !== 'string') {
        return res.status(400).json({ success: false, message: 'setting_key is required.' });
    }

    if (setting_value === undefined) {
        return res.status(400).json({ success: false, message: 'setting_value is required.' });
    }

    try {
        const { data, error } = await supabase
            .from('studio_settings')
            .upsert([{ setting_key, setting_value }], { onConflict: 'setting_key' })
            .select();

        if (error) return res.status(400).json({ success: false, message: error.message });
        res.status(200).json({ success: true, data: data[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error updating setting' });
    }
};

module.exports = { getStudioSettings, updateStudioSetting };