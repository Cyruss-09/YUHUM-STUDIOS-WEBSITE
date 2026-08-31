const express = require("express");
const router = express.Router();
const { adminForgotPassword } = require("../controllers/authController");

// Route for admin forgot password
router.post("/admin/forgot-password", adminForgotPassword);

module.exports = router;