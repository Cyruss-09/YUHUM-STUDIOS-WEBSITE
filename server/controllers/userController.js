const { supabase } = require('../config/supabase');
const bcrypt = require('bcrypt');

// Get all users
const getUsers = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, username, email, role, created_at');

        if (error) return res.status(400).json({ success: false, message: error.message });
        res.status(200).json({ success: true, users: data });
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
            .insert([{ username, email, password_hash, role: role || 'user' }])
            .select('id, username, email, role, created_at');

        if (error) return res.status(400).json({ success: false, message: error.message });
        res.status(201).json({ success: true, user: data[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error creating user' });
    }
};

// Update user role
const updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
        return res.status(400).json({ success: false, message: 'Role is required.' });
    }

    try {
        const { data, error } = await supabase
            .from('users')
            .update({ role })
            .eq('id', id)
            .select('id, username, email, role, created_at')
            .maybeSingle();

        if (error) return res.status(400).json({ success: false, message: error.message });

        if (!data) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        res.status(200).json({ success: true, user: data });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error updating user role' });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const { data, error } = await supabase
            .from('users')
            .delete()
            .eq('id', id)
            .select('id')
            .maybeSingle();

        if (error) return res.status(400).json({ success: false, message: error.message });

        if (!data) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        res.status(200).json({ success: true, message: 'User deleted successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error deleting user' });
    }
};

module.exports = { getUsers, createUser, updateUserRole, deleteUser };