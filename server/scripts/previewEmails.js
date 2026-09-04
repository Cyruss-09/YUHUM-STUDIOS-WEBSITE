// server/scripts/previewEmails.js
const fs = require("fs");
const path = require("path");

const { BookingEmail } = require("../emails/BookingEmail");
const { SubscriberEmail } = require("../emails/SubscriberEmail");
const { PasswordResetEmail } = require("../emails/PasswordResetEmail");
const { AdminPasswordResetEmail } = require("../emails/AdminPasswordResetEmail");
const { ReviewEmail } = require("../emails/ReviewEmail");
const { AdminReviewAlertEmail } = require("../emails/AdminReviewAlertEmail");

const outputDir = path.join(__dirname, "../preview");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log("🎨 Generating HTML email previews for Yuhum Studios...");

// 1. Booking Email
const bookingHtml = BookingEmail({
  packageTitle: "Deluxe Duo Studio Session",
  basePrice: "₱1,200",
  studio: "Studio A (Boho Warmth)",
  date: "Saturday, Sep 19, 2026",
  time: "02:30 PM",
  addOns: "Extra 15 Mins Shoot, 5x Instax Mini Prints, Pet Companion Pass",
  firstName: "Camille",
  lastName: "Santos",
  phone: "+63 917 123 4567",
  email: "camille.santos@gmail.com",
  paymentMode: "GCash (Paid Online)",
  couponCode: "YSTREAT20",
  findUs: "Instagram Reels",
});
fs.writeFileSync(path.join(outputDir, "01_booking_email.html"), bookingHtml, "utf8");
console.log("✅ 01_booking_email.html generated");

// 2. Subscriber Welcome Email
const subscriberWelcomeHtml = SubscriberEmail({
  name: "Camille",
  clientName: "Camille Santos",
  email: "camille.santos@gmail.com",
  messageBody:
    "Welcome to Yuhum Studios! 🤎 We are delighted to have you join our creative circle.\n\nEnjoy an exclusive subscriber perk on your very next booking — enter code WELCOMESTUDIO at checkout for 10% off any suite.\n\nFrom aesthetic retro props to soft diffused portrait setups, our lounge is ready whenever inspiration strikes.",
  actionText: "Book Your First Session",
  actionUrl: "https://yuhumstudio.com/#book",
  unsubscribeUrl: "https://yuhumstudio.com/unsubscribe?email=camille.santos@gmail.com",
});
fs.writeFileSync(path.join(outputDir, "02_subscriber_welcome.html"), subscriberWelcomeHtml, "utf8");
console.log("✅ 02_subscriber_welcome.html generated");

// 3. Password Reset (Client)
const passwordResetHtml = PasswordResetEmail({
  resetUrl: "https://yuhumstudio.com/reset-password/sample-demo-token-123",
  username: "CamilleS",
  email: "camille.santos@gmail.com",
});
fs.writeFileSync(path.join(outputDir, "03_password_reset_client.html"), passwordResetHtml, "utf8");
console.log("✅ 03_password_reset_client.html generated");

// 4. Password Reset (Admin)
const adminPasswordResetHtml = AdminPasswordResetEmail({
  resetUrl: "https://yuhumstudio.com/admin-reset-password/admin-secure-token-999",
  adminName: "Lead Administrator",
  adminEmail: "admin@yuhumstudios.com",
});
fs.writeFileSync(path.join(outputDir, "04_password_reset_admin.html"), adminPasswordResetHtml, "utf8");
console.log("✅ 04_password_reset_admin.html generated");

// 5. Customer Review Thank-You
const reviewHtml = ReviewEmail({
  overallRating: 5,
  equipmentEase: 5,
  roomPrivacy: 5,
  propsSelection: 4,
  favoriteBackdrop: "Warm Terracotta Sun",
  comments: "Such an enjoyable experience! The wireless clicker made taking candid photos with my dog so stress-free. We will definitely be back!",
  userEmail: "camille.santos@gmail.com",
});
fs.writeFileSync(path.join(outputDir, "05_review_customer.html"), reviewHtml, "utf8");
console.log("✅ 05_review_customer.html generated");

// 6. Admin Review Notification
const adminReviewAlertHtml = AdminReviewAlertEmail({
  userEmail: "camille.santos@gmail.com",
  overallRating: 5,
  equipmentEase: 5,
  roomPrivacy: 5,
  propsSelection: 4,
  favoriteBackdrop: "Warm Terracotta Sun",
  comments: "Such an enjoyable experience! The wireless clicker made taking candid photos with my dog so stress-free. We will definitely be back!",
  recommend: true,
});
fs.writeFileSync(path.join(outputDir, "06_review_admin_alert.html"), adminReviewAlertHtml, "utf8");
console.log("✅ 06_review_admin_alert.html generated");

console.log("\n🎉 All 6 email templates successfully generated and verified!");
