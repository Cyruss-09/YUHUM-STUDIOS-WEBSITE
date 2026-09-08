const { supabase } = require("../config/supabase");
const {
    getResend,
    FROM_EMAIL,
    ADMIN_EMAIL,
    SANDBOX_MODE,
    resolveRecipient,
} = require("../config/mailer");
const { ReviewEmail } = require("../emails/ReviewEmail");
const { AdminReviewAlertEmail } = require("../emails/AdminReviewAlertEmail");

// GET /api/reviews
const getReviews = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("reviews")
            .select(
                "id, user_email, overall_rating, equipment_ease, room_privacy, props_selection, favorite_backdrop, comments, recommend, created_at"
            )
            .order("created_at", { ascending: false });

        if (error) throw error;

        return res.status(200).json({ success: true, data });
    } catch (err) {
        console.error("❌ Error fetching reviews:", err);
        return res
            .status(500)
            .json({ success: false, error: "Failed to fetch reviews." });
    }
};

const createReview = async (req, res) => {
    const {
        userEmail,
        overallRating,
        equipmentEase,
        roomPrivacy,
        propsSelection,
        favoriteBackdrop,
        comments,
        recommend,
    } = req.body;

    try {
        const safeRecommend =
            recommend === true || recommend === "true" || recommend === 1
                ? true
                : recommend === false || recommend === "false" || recommend === 0
                    ? false
                    : null;

        // 1. Insert review into Supabase
        const { data: review, error } = await supabase
            .from("reviews")
            .insert([
                {
                    overall_rating: overallRating || 0,
                    equipment_ease: equipmentEase || 0,
                    room_privacy: roomPrivacy || 0,
                    props_selection: propsSelection || 0,
                    favorite_backdrop: favoriteBackdrop || null,
                    comments: comments || null,
                    recommend: safeRecommend,
                    user_email: userEmail || null,
                },
            ])
            .select()
            .single();

        if (error) throw error;

        // 2. Dual-email notification handling
        let adminEmailSent = false;
        let customerEmailSent = false;
        const resend = getResend();

        // Admin Alert Email
        if (SANDBOX_MODE) {
            console.log(
                "📦 [Sandbox] Skipping admin notification — customer thank-you is already routed to ADMIN_EMAIL."
            );
        } else if (resend) {
            try {
                const adminAlertHtml = AdminReviewAlertEmail({
                    userEmail,
                    overallRating,
                    equipmentEase,
                    roomPrivacy,
                    propsSelection,
                    favoriteBackdrop,
                    comments,
                    recommend: safeRecommend,
                });

                await resend.emails.send({
                    from: FROM_EMAIL,
                    to: [ADMIN_EMAIL],
                    subject: `New Review Submitted (${overallRating || "N/A"} ⭐) - Yuhum Studios`,
                    html: adminAlertHtml,
                });
                adminEmailSent = true;
            } catch (adminEmailErr) {
                console.error(
                    "⚠️ Review saved, but admin notification email failed:",
                    adminEmailErr.message || adminEmailErr
                );
            }
        }

        // Customer Thank-You Email
        if (resend) {
            try {
                const customerRecipient = resolveRecipient(userEmail);
                const reviewHtml = ReviewEmail({
                    overallRating,
                    equipmentEase,
                    roomPrivacy,
                    propsSelection,
                    favoriteBackdrop,
                    comments,
                    userEmail,
                });

                await resend.emails.send({
                    from: FROM_EMAIL,
                    to: [customerRecipient],
                    subject: "Thank you for your review! - Yuhum Studio",
                    html: reviewHtml,
                });
                customerEmailSent = true;
            } catch (customerEmailErr) {
                console.error(
                    "⚠️ Review saved, but customer thank-you email failed:",
                    customerEmailErr.message || customerEmailErr
                );
            }
        }

        return res.status(201).json({
            success: true,
            message:
                adminEmailSent && customerEmailSent
                    ? "Review submitted! Admin notified and thank-you email sent."
                    : customerEmailSent
                        ? "Review submitted! Thank-you email sent."
                        : "Review submitted successfully!",
            data: review,
        });
    } catch (err) {
        console.error("❌ Supabase error (reviews):", err);
        return res
            .status(500)
            .json({ success: false, error: "Failed to submit review." });
    }
};

module.exports = {
    getReviews,
    createReview,
};