const Offer = require('../models/offerModel');
const Notification = require('../models/notificationModel');
const Artwork = require('../models/artworkModel');

// Create a new offer
exports.createOffer = async (req, res) => {
  try {
    const { artworkId, proposedPrice, proposedCurrency, notes, shippingAddress } = req.body;
    const buyerId = req.user._id;

    // Validate required fields
    if (!proposedPrice || !proposedCurrency) {
      return res.status(400).json({
        success: false,
        message: 'Proposed price and currency are required'
      });
    }

    const artwork = await Artwork.findById(artworkId);
    if (!artwork) {
      return res.status(404).json({ success: false, message: 'Artwork not found' });
    }

    // Prevent artists from placing offers on their own artworks
    if (artwork.artist.toString() === buyerId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You cannot place an offer on your own artwork'
      });
    }

    // Check for existing accepted offer
    const existingAccepted = await Offer.findOne({
      buyerId,
      artworkId,
      status: 'accepted'
    });
    if (existingAccepted) {
      return res.status(400).json({
        success: false,
        message: 'You already have an accepted offer for this artwork. Please proceed to checkout.'
      });
    }

    // Get currency information for conversion
    const Currency = require('../models/currencyModel');
    const buyerCurrency = await Currency.findOne({ code: proposedCurrency.toUpperCase(), isActive: true });
    const artworkCurrency = await Currency.findOne({ code: artwork.currency.toUpperCase(), isActive: true });

    if (!buyerCurrency || !artworkCurrency) {
      return res.status(400).json({
        success: false,
        message: 'Invalid currency'
      });
    }

    // Convert proposed price to artwork's currency
    const convertedAmount = (proposedPrice / buyerCurrency.exchangeRate) * artworkCurrency.exchangeRate;

    const offer = await Offer.create({
      artworkId,
      buyerId,
      artistId: artwork.artist,
      proposedPrice: {
        amount: Number(proposedPrice),
        currency: proposedCurrency.toUpperCase()
      },
      convertedPrice: {
        amount: Number(convertedAmount.toFixed(2)),
        currency: artwork.currency
      },
      originalPrice: {
        amount: artwork.price,
        currency: artwork.currency
      },
      notes,
      shippingAddress
    });

    // Create notification for artist
    await Notification.create({
      recipientId: artwork.artist,
      type: 'offer_received',
      title: 'New Offer Received',
      message: `You received a ${buyerCurrency.symbol}${proposedPrice} (${artworkCurrency.symbol}${convertedAmount.toFixed(2)}) offer for "${artwork.title}"`,
      artworkId: artwork._id,
      relatedUserId: buyerId,
      actionUrl: `/offers` // Dedicated offers page in admin panel
    });

    res.status(201).json({ success: true, data: offer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get offers for artists
exports.getArtistOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ artistId: req.user._id })
      .populate('artworkId', 'title images price')
      .populate('buyerId', 'name email')
      .sort('-createdAt');

    res.status(200).json({ success: true, data: offers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update offer status (Artist)
exports.updateOfferStatus = async (req, res) => {
  try {
    const { status, declineReason } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const offer = await Offer.findById(req.params.id).populate('artworkId');
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    // Security check: only the artist can update the status
    if (offer.artistId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    offer.status = status;
    if (status === 'rejected' && declineReason) {
      offer.declineReason = declineReason;
    }
    await offer.save();

    // Build buyer notification message
    const rejectedMsg = declineReason
      ? `Your offer for "${offer.artworkId.title}" was declined. Reason: ${declineReason}`
      : `Your offer for "${offer.artworkId.title}" was declined by the artist.`;

    // Notify buyer
    await Notification.create({
      recipientId: offer.buyerId,
      type: status === 'accepted' ? 'offer_accepted' : 'offer_rejected',
      title: status === 'accepted' ? 'Offer Accepted!' : 'Offer Declined',
      message: status === 'accepted' 
        ? `Great news! Your offer for "${offer.artworkId.title}" was accepted. You can now proceed to checkout.`
        : rejectedMsg,
      artworkId: offer.artworkId._id,
      relatedUserId: req.user._id,
      actionUrl: status === 'accepted' ? '/my-orders' : '/explore-artwork'
    });

    res.status(200).json({ success: true, data: offer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get offers for buyers
exports.getUserOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ buyerId: req.user._id })
      .populate('artworkId', 'title images price')
      .sort('-createdAt');

    res.status(200).json({ success: true, data: offers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
