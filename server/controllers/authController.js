const { supabase } = require("../config/supabase");
const { sendAdminResetEmail } = require("../utils/AdminPasswordResetEmail");
const crypto = require("crypto");

// Endpoint handler for Admin Forgot Password
const adminForgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        // 1. Check if email belongs to an Admin account
        const { data: admin, error: findError } = await supabase
            .from("admins")
            .select("id, email")
            .eq("email", email)
            .single();

        if (findError || !admin) {
            return res.status(404).json({ message: "Admin account not found." });
        }

        // 2. Generate a reset token & set expiration
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

        const { error: updateError } = await supabase
            .from("admins")
            .update({
                reset_token: resetToken,
                reset_token_expiry: resetTokenExpiry.toISOString(),
            })
            .eq("id", admin.id);

        if (updateError) {
            throw updateError;
        }

        // 3. Build the admin frontend URL with the token
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const resetLink = `${frontendUrl}/admin-reset-password/${resetToken}`;

        // 4. Trigger the email
        await sendAdminResetEmail(admin.email, resetLink);

        return res.status(200).json({ message: "Admin reset link sent to email." });
    } catch (error) {
        console.error("Admin reset email error:", error);
        return res.status(500).json({ message: "Server error sending email." });
    }
};

module.exports = { adminForgotPassword };