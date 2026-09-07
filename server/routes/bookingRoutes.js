const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, cancelBooking } = require('../controllers/bookingController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, createBooking);
router.get('/my', verifyToken, getMyBookings);
router.patch('/:id/cancel', verifyToken, cancelBooking);

module.exports = router;