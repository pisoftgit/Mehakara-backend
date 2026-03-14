const Offer = require('../models/offerModel');
const Notification = require('../models/notificationModel');
const Artwork = require('../models/artworkModel');

// Create a new offer
exports.createOffer = async (req, res) => {
  try {
    const { artworkId, proposedPrice, notes, shippingAddress } = req.body;
    const buyerId = req.user._id;

    const artwork = await Artwork.findById(artworkId);
    if (!artwork) {
      return res.status(404).json({ success: false, message: 'Artwork not found' });
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

    const offer = await Offer.create({
      artworkId,
      buyerId,
      artistId: artwork.artist,
      proposedPrice,
      originalPrice: artwork.price,
      notes,
      shippingAddress
    });

    // Create notification for artist
    await Notification.create({
      recipientId: artwork.artist,
      type: 'offer_received',
      title: 'New Offer Received',
      message: `You received a $${proposedPrice} offer for "${artwork.title}"`,
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
    const { status } = req.body;
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
    await offer.save();

    // Notify buyer
    await Notification.create({
      recipientId: offer.buyerId,
      type: status === 'accepted' ? 'offer_accepted' : 'offer_rejected',
      title: status === 'accepted' ? 'Offer Accepted!' : 'Offer Declined',
      message: status === 'accepted' 
        ? `Great news! Your offer for "${offer.artworkId.title}" was accepted. You can now proceed to checkout.`
        : `Your offer for "${offer.artworkId.title}" was declined by the artist.`,
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
