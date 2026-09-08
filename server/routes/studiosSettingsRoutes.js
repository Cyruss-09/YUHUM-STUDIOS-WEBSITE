const express = require('express');
const router = express.Router();

// Match the exact function names exported from studioSettingsController.js
const { getPublicSettings, updateStudioSetting } = require('../controllers/studioSettingsController');

router.get('/', getPublicSettings);
router.put('/', updateStudioSetting);

module.exports = router;