const express = require('express');
const router = express.Router();
const { submitInquiry, getAllInquiries } = require('../controllers/inquiryController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router.post('/', submitInquiry);

router.get('/', protect, restrictTo('admin'), getAllInquiries);

module.exports = router;