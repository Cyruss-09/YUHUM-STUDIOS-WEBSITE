const { supabase } = require('../config/supabase');
const bcrypt = require('bcrypt');

// Get all users
const getUsers = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, username, email, role, created_at');

        if (error) return res.status(400).json({ success: false, message: error.message });
        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching users' });
    }
};

// Create user
const createUser = async (req, res) => {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: 'Username, email, and password are required.' });
    }

    try {
        const password_hash = await bcrypt.hash(password, 10);

        const { data, error } = await supabase
            .from('users')
            .insert([{ username, email, password_hash, role: role || 'customer' }])
            .select('id, username, email, role, created_at');

        if (error) return res.status(400).json({ success: false, message: error.message });
        res.status(201).json({ success: true, data: data[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error creating user' });
    }
};

module.exports = { getUsers, createUser };