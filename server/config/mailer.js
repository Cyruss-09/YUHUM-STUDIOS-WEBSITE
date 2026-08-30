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

module.exports = {
  getResend,
  FROM_EMAIL,
  ADMIN_EMAIL,
  SANDBOX_MODE,
  resolveRecipient,
  isValidEmail,
};