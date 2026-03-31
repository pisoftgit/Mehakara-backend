const express = require('express');
const router = express.Router();
const bidController = require('../controllers/bidController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

// Get all bids for an artwork (PUBLIC)
router.get('/artwork/:artworkId', bidController.getArtworkBids);

// Place a bid (PROTECTED)
router.post('/', protect, bidController.placeBid);

// Get my bids (PROTECTED)
router.get('/my-bids', protect, bidController.getUserBids);

// Get bids on my artworks (ARTIST)
router.get('/artist/my-artworks', protect, bidController.getArtistBids);


// Withdraw a bid (PROTECTED)
router.patch('/:bidId/withdraw', protect, bidController.withdrawBid);

// Accept a bid (ARTIST)
router.patch('/:bidId/accept', protect, bidController.acceptBid);

// Get all bids (ADMIN)
router.get('/admin/all', protect, restrictTo('admin', 'superadmin'), bidController.getAllBidsAdmin);

module.exports = router;
