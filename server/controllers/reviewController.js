const { supabase } = require('../config/supabase');
const { getResend, FROM_EMAIL, resolveRecipient } = require('../config/mailer');
const { ReviewEmail } = require('../emails/ReviewEmail');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// Get all customer reviews
const getReviews = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) return res.status(400).json({ success: false, message: error.message });
        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching reviews' });
    }
};

// Add new review
const createReview = async (req, res) => {
    const { customer_name, rating, comment } = req.body;

    const cleanName = String(customer_name || '').trim();
    const numericRating = Number(rating);

    if (!cleanName) {
        return res.status(400).json({ success: false, message: 'Customer name is required.' });
    }

    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
        return res.status(400).json({ success: false, message: 'Rating must be a whole number between 1 and 5.' });
    }

    try {
        const { data, error } = await supabase
            .from('reviews')
            .insert([{ customer_name: cleanName, rating: numericRating, comment: comment || null }])
            .select();

        if (error) return res.status(400).json({ success: false, message: error.message });

        const newReview = data[0];

        // Notify admin of the new review (non-blocking — a mail failure shouldn't fail the request)
        const resend = getResend();
        if (resend && ADMIN_EMAIL) {
            try {
                await resend.emails.send({
                    from: FROM_EMAIL,
                    to: resolveRecipient(ADMIN_EMAIL),
                    subject: `New ${numericRating}-star review from ${cleanName}`,
                    html: ReviewEmail({
                        customerName: cleanName,
                        rating: numericRating,
                        comment: newReview.comment,
                    }),
                });
            } catch (mailErr) {
                console.error('Review notification email error:', mailErr.message || mailErr);
            }
        }

        res.status(201).json({ success: true, data: newReview });
    } catch (err) {
        console.error('Create review error:', err);
        res.status(500).json({ success: false, message: 'Error submitting review' });
    }
};

module.exports = { getReviews, createReview };