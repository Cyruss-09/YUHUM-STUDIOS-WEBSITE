const express = require('express');
const router = express.Router();
const { getStudioSettings, updateStudioSetting } = require('../controllers/studioSettingsController');

router.get('/', getStudioSettings);
router.put('/', updateStudioSetting);

module.exports = router;