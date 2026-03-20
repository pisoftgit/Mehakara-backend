const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, offerController.createOffer);
router.get('/artist', protect, offerController.getArtistOffers);
router.get('/my-offers', protect, offerController.getUserOffers);
router.patch('/:id/status', protect, offerController.updateOfferStatus);

router.patch('/:id/withdraw', protect, offerController.withdrawOffer);

module.exports = router;
