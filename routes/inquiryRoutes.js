const express = require('express');
const router = express.Router();
const { submitInquiry, getAllInquiries } = require('../controllers/inquiryController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', submitInquiry);

router.get('/', protect, admin, getAllInquiries);

module.exports = router;