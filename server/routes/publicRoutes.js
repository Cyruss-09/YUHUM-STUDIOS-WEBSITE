const express = require('express');
const router = express.Router();
const { getPublicSettings } = require('../controllers/studioSettingsController');

router.get('/settings', getPublicSettings);

module.exports = router;