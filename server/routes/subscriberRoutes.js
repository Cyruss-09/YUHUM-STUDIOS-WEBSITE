const express = require("express");
const router = express.Router();
const { supabase } = require("../config/supabase");
const {
    getResend,
    FROM_EMAIL,
    resolveRecipient,
} = require("../config/mailer");
const { SubscriberEmail } = require("../emails/SubscriberEmail");

router.post("/", async (req, res) => {
    const { email } = req.body;

    if (!email || !email.includes("@")) {
        return res
            .status(400)
            .json({ error: "Please enter a valid email address." });
    }

    try {
        const cleanEmail = email.toLowerCase().trim();

        // Check if already subscribed
        const { data: existing } = await supabase
            .from("subscribers")
            .select("id")
            .eq("email", cleanEmail)
            .maybeSingle();

        if (existing) {
            return res.status(200).json({ message: "You are already subscribed!" });
        }

        // Insert new subscriber
        const { error: insertError } = await supabase
            .from("subscribers")
            .insert([{ email: cleanEmail }]);

        if (insertError) throw insertError;

        let welcomeEmailSent = false;
        try {
            const resend = getResend();
            if (resend) {
                const recipient = resolveRecipient(cleanEmail);
                const subscriberHtml = SubscriberEmail({
                    name: "Valued Subscriber",
                    messageBody:
                        "Thanks for subscribing to Yuhum Studio! We'll keep you posted on new sessions, promos, and updates.",
                    unsubscribeUrl: `https://yuhumstudio.com/unsubscribe?email=${encodeURIComponent(cleanEmail)}`,
                });

                await resend.emails.send({
                    from: FROM_EMAIL,
                    to: [recipient],
                    subject: "Welcome to Yuhum Studio!",
                    html: subscriberHtml,
                });

                welcomeEmailSent = true;
            }
        } catch (welcomeEmailErr) {
            console.error(
                "⚠️ Subscriber saved, but welcome email failed:",
                welcomeEmailErr.message || welcomeEmailErr
            );
        }

        return res.status(201).json({
            message: welcomeEmailSent
                ? "Thank you for subscribing! A welcome email is on its way."
                : "Thank you for subscribing!",
        });
    } catch (err) {
        console.error("Supabase error (subscribers):", err);
        return res.status(500).json({ error: "Internal server error." });
    }
});

module.exports = router;