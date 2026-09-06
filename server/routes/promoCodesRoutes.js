const express = require('express');
const router = express.Router();
const { getPromoCodes, validatePromoCode, applyPromoCode } = require('../controllers/promoCodeController');

router.get('/', getPromoCodes);
router.get('/:code', validatePromoCode);
router.post('/:code/apply', applyPromoCode);

module.exports = router;