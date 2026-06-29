const express = require('express');
const { getMyCourses, recordPurchase } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/my-courses', protect, getMyCourses);
router.post('/record', protect, recordPurchase);

module.exports = router;
