const express = require('express');
const router = express.Router();
const { submitInquiry, getAllInquiries } = require('../controllers/inquiryController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.post('/', submitInquiry);

router.get('/', protect, admin, getAllInquiries);

module.exports = router;