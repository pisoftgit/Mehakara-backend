const Bid = require('../models/bidModel');
const Offer = require('../models/offerModel');
const Artwork = require('../models/artworkModel');
const Notification = require('../models/notificationModel');
const Currency = require('../models/currencyModel');

// --- 1. PLACE A BID ---
exports.placeBid = async (req, res) => {
  try {
    const { artworkId, amount, currency } = req.body;
    const bidderId = req.user._id;

    if (!amount || !currency) {
      return res.status(400).json({ success: false, message: 'Amount and currency are required' });
    }

    const artwork = await Artwork.findById(artworkId);
    if (!artwork) {
      return res.status(404).json({ success: false, message: 'Artwork not found' });
    }

    if (!artwork.isAvailable || artwork.isSold) {
      return res.status(400).json({ success: false, message: 'Artwork is already sold or not available' });
    }

    // Artist cannot bid on their own artwork
    if (artwork.artist.toString() === bidderId.toString()) {
      return res.status(403).json({ success: false, message: 'You cannot bid on your own artwork' });
    }

    // --- Price Conversion for Comparison ---
    const bidderCurr = await Currency.findOne({ code: currency.toUpperCase(), isActive: true });
    const artworkCurr = await Currency.findOne({ code: artwork.currency.toUpperCase(), isActive: true });

    if (!bidderCurr || !artworkCurr) {
      return res.status(400).json({ success: false, message: 'Invalid currency' });
    }

    // Convert new bid amount to artwork's currency
    const convertedNewBid = (amount / bidderCurr.exchangeRate) * artworkCurr.exchangeRate;

    // Check if new bid is higher than current highest bid
    const currentHighestAmount = artwork.highestBid?.amount || artwork.price;
    if (convertedNewBid <= currentHighestAmount) {
      return res.status(400).json({ 
        success: false, 
        message: `Your bid must be higher than the current highest bid of ${artwork.currency} ${currentHighestAmount.toFixed(2)}` 
      });
    }

    // --- Create the Bid Record ---
    const newBid = await Bid.create({
      artworkId,
      bidderId,
      bidAmount: {
        amount: Number(amount),
        currency: currency.toUpperCase()
      },
      convertedAmount: {
        amount: Number(convertedNewBid.toFixed(2)),
        currency: artwork.currency
      }
    });

    // --- Update Artwork with New Highest Bid ---
    // Update previous highest bidder that they've been outbid (logic omitted for brevity, but could be added as notification)
    const previousBidder = artwork.highestBidder;

    artwork.highestBid = {
      amount: Number(convertedNewBid.toFixed(2)),
      currency: artwork.currency,
      bidId: newBid._id
    };
    artwork.highestBidder = bidderId;
    artwork.bidCount += 1;
    await artwork.save();

    // --- INTEGRATE WITH OFFER SYSTEM ---
    // Create/Update an Offer record for the artist to 'Accept'
    // This ensures the highest bid can be 'Accepted' and then 'Checked out'
    await Offer.findOneAndUpdate(
      { artworkId, buyerId: bidderId },
      {
        artistId: artwork.artist,
        proposedPrice: {
          amount: Number(amount),
          currency: currency.toUpperCase()
        },
        convertedPrice: {
          amount: Number(convertedNewBid.toFixed(2)),
          currency: artwork.currency
        },
        originalPrice: {
          amount: artwork.price,
          currency: artwork.currency
        },
        status: 'pending' // Reset to pending if it was rejected before
      },
      { upsert: true, new: true }
    );

    // --- Notifications ---
    // Notify Artist
    await Notification.create({
      recipientId: artwork.artist,
      type: 'bid_received',
      title: 'New Bid Received',
      message: `A new bid of ${currency.toUpperCase()} ${amount} was placed on "${artwork.title}"`,
      artworkId: artwork._id,
      relatedUserId: bidderId,
      actionUrl: `/artwork/${artwork._id}`
    });

    // Notify Overcome Bidder (OUTBID Notification)
    if (previousBidder && previousBidder.toString() !== bidderId.toString()) {
      await Notification.create({
        recipientId: previousBidder,
        type: 'outbid',
        title: 'Outbid!',
        message: `Your bid on "${artwork.title}" was surpassed by a new higher bid.`,
        artworkId: artwork._id,
        relatedUserId: bidderId,
        actionUrl: `/artwork/${artwork._id}`
      });
      
      // Mark previous bid as 'outbid'
      await Bid.updateMany({
        artworkId,
        bidderId: previousBidder,
        status: 'active'
      }, { status: 'outbid' });
    }

    res.status(201).json({
      success: true,
      message: 'Bid placed successfully',
      data: newBid,
      highestBid: artwork.highestBid
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 2. GET BIDS FOR AN ARTWORK ---
exports.getArtworkBids = async (req, res) => {
  try {
    const bids = await Bid.find({ artworkId: req.params.artworkId })
      .populate('bidderId', 'name email image')
      .sort('-convertedAmount.amount -createdAt');

    // Also get the status of the artwork (sold to whom)
    const artwork = await Artwork.findById(req.params.artworkId).populate('soldTo', 'name');

    res.status(200).json({ 
      success: true, 
      data: bids,
      artworkInfo: {
        isSold: artwork.isSold,
        soldTo: artwork.soldTo?.name,
        soldPrice: artwork.soldPrice,
        soldAt: artwork.soldAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 3. GET USER'S BIDDING ACTIVITY ---
exports.getUserBids = async (req, res) => {
  try {
    const bids = await Bid.find({ bidderId: req.user._id })
      .populate('artworkId', 'title images price artist')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: bids });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 3.1 GET BIDS FOR ARTIST'S ARTWORKS (FOR ARTIST PANEL) ---
exports.getArtistBids = async (req, res) => {
  try {
    const artworks = await Artwork.find({ artist: req.user._id }).select('_id');
    const artworkIds = artworks.map(a => a._id);

    const bids = await Bid.find({ artworkId: { $in: artworkIds } })
      .populate('artworkId', 'title images price')
      .populate('bidderId', 'name email')
      .sort('-createdAt');

    res.status(200).json({ success: true, data: bids });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// --- 4. WITHDRAW A BID ---
exports.withdrawBid = async (req, res) => {
  try {
    const { bidId } = req.params;
    const userId = req.user._id;

    const bid = await Bid.findById(bidId);
    if (!bid) {
      return res.status(404).json({ success: false, message: 'Bid not found' });
    }

    if (bid.bidderId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'You can only withdraw your own bids' });
    }

    if (bid.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Bid is already withdrawn' });
    }

    const artwork = await Artwork.findById(bid.artworkId);
    
    // Mark bid as cancelled
    bid.status = 'cancelled';
    await bid.save();

    // If this was the highest bid, we need to find the new highest bid
    if (artwork.highestBid && artwork.highestBid.bidId && artwork.highestBid.bidId.toString() === bidId) {
      // Find the next best active bid
      const nextBestBid = await Bid.findOne({ 
        artworkId: artwork._id, 
        status: { $ne: 'cancelled' } 
      }).sort('-convertedAmount.amount -createdAt');

      if (nextBestBid) {
        artwork.highestBid = {
          amount: nextBestBid.convertedAmount.amount,
          currency: nextBestBid.convertedAmount.currency,
          bidId: nextBestBid._id
        };
        artwork.highestBidder = nextBestBid.bidderId;
        
        // Mark the new highest bid as 'active' if it was previously 'outbid'
        nextBestBid.status = 'active';
        await nextBestBid.save();
      } else {
        // No more bids
        artwork.highestBid = { amount: 0, currency: artwork.currency };
        artwork.highestBidder = null;
      }
      
      artwork.bidCount = Math.max(0, artwork.bidCount - 1);
      await artwork.save();
    }

    res.status(200).json({ 
      success: true, 
      message: 'Bid withdrawn successfully',
      highestBid: artwork.highestBid 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// --- 5. GET ALL BIDS (ADMIN) ---
exports.getAllBidsAdmin = async (req, res) => {
  try {
    const bids = await Bid.find()
      .populate('artworkId', 'title images price artist')
      .populate('bidderId', 'name email')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: bids });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 6. ACCEPT A BID (FOR ARTIST) ---
exports.acceptBid = async (req, res) => {
  try {
    const { bidId } = req.params;
    const artistId = req.user._id;

    const bid = await Bid.findById(bidId).populate('artworkId bidderId');
    if (!bid) {
      return res.status(404).json({ success: false, message: 'Bid not found' });
    }

    const artwork = await Artwork.findById(bid.artworkId._id);
    if (!artwork) {
      return res.status(404).json({ success: false, message: 'Artwork not found' });
    }

    if (artwork.artist.toString() !== artistId.toString()) {
      return res.status(403).json({ success: false, message: 'You can only accept bids on your own artworks' });
    }

    if (artwork.isSold) {
      return res.status(400).json({ success: false, message: 'Artwork is already sold' });
    }

    // Mark this bid as 'won'
    bid.status = 'won';
    await bid.save();

    // Mark other active/outbid bids as 'lost'
    await Bid.updateMany(
      { artworkId: artwork._id, _id: { $ne: bid._id }, status: { $in: ['active', 'outbid'] } },
      { status: 'lost' }
    );

    // Update Offer status to 'accepted' so user can checkout
    await Offer.findOneAndUpdate(
      { artworkId: artwork._id, buyerId: bid.bidderId._id },
      { status: 'accepted' }
    );

    // Notify Bidder
    await Notification.create({
      recipientId: bid.bidderId._id,
      type: 'bid_accepted',
      title: 'Bid Accepted!',
      message: `Your bid on "${artwork.title}" has been accepted by the artist. You can now proceed to checkout.`,
      artworkId: artwork._id,
      actionUrl: `/offers` // User can see accepted offers here to checkout
    });

    res.status(200).json({ success: true, message: 'Bid accepted successfully', data: bid });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
