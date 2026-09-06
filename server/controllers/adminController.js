const { supabase } = require('../config/supabase');
const bcrypt = require('bcrypt');

// Get admins list
const getAdmins = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('admins')
            .select('id, name, email, role, created_at, updated_at');

        if (error) return res.status(400).json({ success: false, message: error.message });
        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching admins' });
    }
};

// Create admin
const createAdmin = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    try {
        const password_hash = await bcrypt.hash(password, 10);

        const { data, error } = await supabase
            .from('admins')
            .insert([{ name, email, password_hash }])
            .select('id, name, email, role, created_at');

        if (error) return res.status(400).json({ success: false, message: error.message });
        res.status(201).json({ success: true, data: data[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error creating admin' });
    }
};

module.exports = { getAdmins, createAdmin };