const express = require('express');
const router = express.Router();
const bidController = require('../controllers/bidController');
const { protect } = require('../middlewares/authMiddleware');

// Get all bids for an artwork (PUBLIC)
router.get('/artwork/:artworkId', bidController.getArtworkBids);

// Place a bid (PROTECTED)
router.post('/', protect, bidController.placeBid);

// Get my bids (PROTECTED)
router.get('/my-bids', protect, bidController.getUserBids);

// Withdraw a bid (PROTECTED)
router.patch('/:bidId/withdraw', protect, bidController.withdrawBid);

module.exports = router;
