const express = require('express');
const router = express.Router();
const { getSubscribers, addSubscriber } = require('../controllers/subscriberController');

router.get('/', getSubscribers);
router.post('/', addSubscriber);

module.exports = router;