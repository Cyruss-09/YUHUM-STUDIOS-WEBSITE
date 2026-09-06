const { supabase } = require('../config/supabase');
const { getResend, FROM_EMAIL, resolveRecipient } = require('../config/mailer');
const { SubscriberEmail } = require('../emails/SubscriberEmail');

// Get email subscriber list
const getSubscribers = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('subscribers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) return res.status(400).json({ success: false, message: error.message });
        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching subscribers' });
    }
};

// Add newsletter email
const addSubscriber = async (req, res) => {
    const { email } = req.body;
    const cleanEmail = String(email || '').trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    try {
        const { data, error } = await supabase
            .from('subscribers')
            .insert([{ email: cleanEmail }])
            .select();

        if (error) {
            // Postgres unique_violation — email already subscribed
            if (error.code === '23505') {
                return res.status(400).json({ success: false, message: 'This email is already subscribed.' });
            }
            return res.status(400).json({ success: false, message: error.message });
        }

        const newSubscriber = data[0];

        // Send confirmation email (non-blocking — a mail failure shouldn't fail the subscription)
        const resend = getResend();
        if (resend) {
            try {
                await resend.emails.send({
                    from: FROM_EMAIL,
                    to: resolveRecipient(cleanEmail),
                    subject: "You're subscribed to Yuhum Studios!",
                    html: SubscriberEmail({ email: cleanEmail }),
                });
            } catch (mailErr) {
                console.error('Subscriber confirmation email error:', mailErr.message || mailErr);
            }
        }

        res.status(201).json({ success: true, data: newSubscriber });
    } catch (err) {
        console.error('Add subscriber error:', err);
        res.status(500).json({ success: false, message: 'Error adding subscriber' });
    }
};

module.exports = { getSubscribers, addSubscriber };