const express = require('express');
const router = express.Router();
const { getAdmins, createAdmin } = require('../controllers/adminController');

router.get('/', getAdmins);
router.post('/', createAdmin);

module.exports = router;