const { supabase } = require('../config/supabase');
const { getResend, FROM_EMAIL, resolveRecipient } = require('../config/mailer');
const { ReviewEmail } = require('../emails/ReviewEmail');

// Get all customer reviews
const getReviews = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('reviews')
            .select('id, overall_rating, equipment_ease, room_privacy, props_selection, favorite_backdrop, comments, recommend, created_at')
            .order('created_at', { ascending: false });

        if (error) return res.status(400).json({ success: false, message: error.message });
        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching reviews' });
    }
};

// Add new review
const createReview = async (req, res) => {
    const {
        user_email,
        overall_rating,
        equipment_ease,
        room_privacy,
        props_selection,
        favorite_backdrop,
        comments,
        recommend,
    } = req.body;

    // Validate each required rating: whole number 0-5
    const ratingFields = { overall_rating, equipment_ease, room_privacy, props_selection };
    for (const [field, value] of Object.entries(ratingFields)) {
        const num = Number(value);
        if (!Number.isInteger(num) || num < 0 || num > 5) {
            return res.status(400).json({
                success: false,
                message: `${field.replace('_', ' ')} must be a whole number between 0 and 5.`,
            });
        }
    }

    // user_email is nullable in the schema, but validate format if provided
    let cleanEmail = null;
    if (user_email) {
        cleanEmail = String(user_email).trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
        }
    }

    try {
        const { data, error } = await supabase
            .from('reviews')
            .insert([{
                user_email: cleanEmail,
                overall_rating: Number(overall_rating),
                equipment_ease: Number(equipment_ease),
                room_privacy: Number(room_privacy),
                props_selection: Number(props_selection),
                favorite_backdrop: favorite_backdrop || null,
                comments: comments || null,
                recommend: typeof recommend === 'boolean' ? recommend : null,
            }])
            .select();

        if (error) return res.status(400).json({ success: false, message: error.message });

        const newReview = data[0];

        // Send thank-you email to the reviewer — only possible if they gave an email
        if (cleanEmail) {
            const resend = getResend();
            if (resend) {
                try {
                    await resend.emails.send({
                        from: FROM_EMAIL,
                        to: resolveRecipient(cleanEmail),
                        subject: 'Thank you for your review • Yuhum Studios',
                        html: ReviewEmail({
                            overallRating: newReview.overall_rating,
                            equipmentEase: newReview.equipment_ease,
                            roomPrivacy: newReview.room_privacy,
                            propsSelection: newReview.props_selection,
                            favoriteBackdrop: newReview.favorite_backdrop,
                            comments: newReview.comments,
                            userEmail: newReview.user_email,
                        }),
                    });
                } catch (mailErr) {
                    console.error('Review thank-you email error:', mailErr.message || mailErr);
                }
            }
        }

        res.status(201).json({ success: true, data: newReview });
    } catch (err) {
        console.error('Create review error:', err);
        res.status(500).json({ success: false, message: 'Error submitting review' });
    }
};

module.exports = { getReviews, createReview };