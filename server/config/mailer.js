const { Resend } = require("resend");
let resendInstance = null;
let hasInitialized = false;

function getResend() {
  if (!hasInitialized) {
    hasInitialized = true;
    const rawKey = (process.env.RESEND_API_KEY || "").trim();
    console.log("--- Resend Env Diagnostics ---");
    console.log("Resend API Key Loaded:", rawKey ? "✅ Yes" : "❌ No");
    if (rawKey) console.log("Key Preview:", `${rawKey.substring(0, 6)}...`);
    console.log("------------------------------");
    resendInstance = rawKey ? new Resend(rawKey) : null;
    if (!resendInstance) {
      console.warn("⚠️ Resend instance is not initialized. Check your RESEND_API_KEY.");
    }
  }
  return resendInstance;
}

const FROM_EMAIL =
  process.env.FROM_EMAIL || "Yuhum Studio <onboarding@resend.dev>";
const ADMIN_EMAIL =
  process.env.STUDIO_RECEIVER_EMAIL || "yuhumstudios22@gmail.com";
const SANDBOX_MODE = process.env.DEV_EMAIL_SANDBOX === "true";

console.log(
  SANDBOX_MODE
    ? `📦 Email sandbox mode: ON — all emails will be sent to ${ADMIN_EMAIL}`
    : "📤 Email sandbox mode: OFF — emails will be sent to real recipients",
);

const isValidEmail = (value) =>
  typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

function resolveRecipient(candidateEmail) {
  if (SANDBOX_MODE || FROM_EMAIL.includes("resend.dev")) {
    return ADMIN_EMAIL;
  }
  return isValidEmail(candidateEmail) ? candidateEmail.trim() : ADMIN_EMAIL;
}

async function sendEmail(options) {
  const resend = getResend();
  if (!resend) {
    console.warn("⚠️ [Resend] Skipping email dispatch: Resend instance not initialized or RESEND_API_KEY missing.");
    return { success: false, error: "Resend not initialized" };
  }

  try {
    const result = await resend.emails.send(options);
    if (result && result.error) {
      if (result.error.statusCode === 401 || result.error.message?.includes("API key is invalid")) {
        console.warn(
          "⚠️ [Resend 401]: The RESEND_API_KEY in server/.env is invalid or revoked. Please get a fresh key from https://resend.com/api-keys and replace RESEND_API_KEY in server/.env."
        );
      } else {
        console.warn("⚠️ [Resend Error]:", result.error.message || result.error);
      }
      return { success: false, error: result.error };
    }
    return { success: true, data: result?.data };
  } catch (err) {
    console.warn("⚠️ [Resend] Unexpected dispatch exception:", err.message || err);
    return { success: false, error: err.message };
  }
}

module.exports = {
  getResend,
  sendEmail,
  FROM_EMAIL,
  ADMIN_EMAIL,
  SANDBOX_MODE,
  resolveRecipient,
  isValidEmail,
};