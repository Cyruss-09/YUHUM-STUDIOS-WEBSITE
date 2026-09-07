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
    const { campaignId } = req.body;

    if (!campaignId) {
        return res.status(400).json({ error: "Campaign ID is required." });
    }

    try {
        // 1. Fetch Campaign from Supabase
        const { data: campaign, error: campaignError } = await supabase
            .from("campaigns")
            .select("*")
            .eq("id", campaignId)
            .single();

        if (campaignError || !campaign) {
            return res.status(404).json({ error: "Campaign not found." });
        }

        // 2. Fetch Active Subscribers without a log for this campaign
        const { data: logs } = await supabase
            .from("campaign_logs")
            .select("subscriber_id")
            .eq("campaign_id", campaignId);

        const loggedSubscriberIds = (logs || []).map((l) => l.subscriber_id);

        let query = supabase
            .from("subscribers")
            .select("id, email")
            .eq("status", "active");

        if (loggedSubscriberIds.length > 0) {
            query = query.not("id", "in", `(${loggedSubscriberIds.join(",")})`);
        }

        const { data: subscribers, error: subError } = await query;

        if (subError) throw subError;

        if (!subscribers || subscribers.length === 0) {
            return res.status(200).json({
                message: "No pending subscribers found for resending this campaign.",
            });
        }

        const resend = getResend();
        if (!resend) {
            return res
                .status(500)
                .json({ error: "Resend configuration missing (RESEND_API_KEY)." });
        }

        let successCount = 0;
        let failCount = 0;

        for (const sub of subscribers) {
            const recipient = resolveRecipient(sub.email);

            try {
                const subscriberHtml = SubscriberEmail({
                    name: "Valued Subscriber",
                    messageBody: campaign.body,
                    unsubscribeUrl: `https://yuhumstudio.com/unsubscribe?email=${encodeURIComponent(sub.email)}`,
                });

                await resend.emails.send({
                    from: FROM_EMAIL,
                    to: [recipient],
                    subject: campaign.subject,
                    html: subscriberHtml,
                });

                await supabase
                    .from("campaign_logs")
                    .insert([{ campaign_id: campaignId, subscriber_id: sub.id, status: "sent" }]);
                successCount++;
            } catch (mailError) {
                console.error(`❌ Failed to send to ${sub.email}:`, mailError.message);
                await supabase
                    .from("campaign_logs")
                    .insert([{ campaign_id: campaignId, subscriber_id: sub.id, status: "failed" }]);
                failCount++;
            }
        }

        return res.status(200).json({
            success: true,
            message: "Resend process completed.",
            stats: {
                totalTargeted: subscribers.length,
                sentSuccessfully: successCount,
                failed: failCount,
            },
        });
    } catch (error) {
        console.error("❌ Resend campaign error:", error);
        return res
            .status(500)
            .json({ error: "Internal server error during resend process." });
    }
});

module.exports = router;