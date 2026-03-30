const Artwork = require('../models/artworkModel')
const User = require('../models/userModel');

/* GENERATE RANDOM ARTWORK CODE */
const generateArtworkCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

/* CREATE ARTWORK */

exports.createArtwork = async (req, res) => {
  try {
    if (req.user.role !== 'artist') {
      return res.status(403).json({
        success: false,
        message: 'Only artists can upload artworks'
      })
    }
    const user = await User.findById(req.user.id);
    if (!user || !user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated'
      });
    }

    const imagePaths = req.files
      ? req.files.map(file => file.path.replace(/\\/g, '/'))
      : []

    const price = Number(req.body.price)

    if (isNaN(price) || price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid price'
      })
    }

    const currency = req.body.currency || 'USD'

    // Calculate base price in USD for consistent storage
    let basePriceUSD = price
    if (currency !== 'USD') {
      const Currency = require('../models/currencyModel')
      const artworkCurrency = await Currency.findOne({
        code: currency.toUpperCase(),
        isActive: true
      })
      if (artworkCurrency) {
        basePriceUSD = price / artworkCurrency.exchangeRate
      }
    }

    /* GENERATE UNIQUE ARTWORK CODE */

    let artworkCode
    let exists = true

    while (exists) {
      artworkCode = generateArtworkCode()
      const existing = await Artwork.findOne({ artworkCode })
      if (!existing) exists = false
    }

    const artwork = await Artwork.create({
      artworkCode,
      artist: req.user.id,
      title: req.body.title,
      description: req.body.description,
      price,
      currency,
      basePriceUSD: Number(basePriceUSD.toFixed(2)),
      category: req.body.categoryId || req.body.category,
      subCategory: req.body.subCategoryId || req.body.subCategory,
      nestedSubCategory:
        req.body.nestedSubCategoryId || req.body.nestedSubCategory,
      size: req.body.sizeId || req.body.size,
      orientation: req.body.orientationId || req.body.orientation,
      medium: req.body.mediumId || req.body.medium,
      material: req.body.materialId || req.body.material,
      theme: req.body.themeId || req.body.theme,
      images: imagePaths
    })

    res.status(201).json({
      success: true,
      message: 'Artwork uploaded successfully',
      artwork
    })
  } catch (error) {
    console.error('CREATE ARTWORK ERROR:', error)

    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
}

/* GET ALL ARTWORKS */
exports.getArtworks = async (req, res) => {
  try {
    const {
      category,
      subCategory,
      nestedSubCategory,
      medium,
      material,
      orientation,
      theme,
      priceMin,
      priceMax,
      search,
      page = 1,
      limit = 12,
      sort = 'newest'
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const activeArtists = await User.find({
      role: 'artist',
      isActive: true
    }).select('_id');

    const activeArtistIds = activeArtists.map(a => a._id);

    let query = {
      status: 'approved',
      isAvailable: true,
      artist: { $in: activeArtistIds }
    };

    // 1. Standard Filters
    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;
    if (nestedSubCategory) query.nestedSubCategory = nestedSubCategory;
    if (medium) query.medium = medium;
    if (material) query.material = material;
    if (orientation) query.orientation = orientation;
    if (theme) query.theme = theme;

    // 2. Price Range Filter
    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = Number(priceMin);
      if (priceMax) query.price.$lte = Number(priceMax);
    }

    // 3. SEARCH 
    if (search) {
      const matchingArtists = await User.find({
        name: { $regex: search, $options: 'i' },
        role: 'artist',
        isActive: true
      }).select('_id');

      const artistIds = matchingArtists.map(artist => artist._id);

      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { artworkCode: { $regex: search, $options: 'i' } },
        { artist: { $in: artistIds } }
      ];
    }

    // 4. Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'priceLow') sortOption = { price: 1 };
    if (sort === 'priceHigh') sortOption = { price: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };

    const skip = (pageNumber - 1) * limitNumber;

    // 5. Fetch Data
    const artworks = await Artwork.find(query)
      .populate('artist', 'name email') // safe now (already filtered)
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .populate('nestedSubCategory', 'name')
      .populate('size', 'name')
      .populate('orientation', 'name')
      .populate('medium', 'name')
      .populate('material', 'name')
      .populate('theme', 'name')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNumber);

    const total = await Artwork.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      artworks
    });

  } catch (error) {
    console.error('GET ARTWORKS ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};


/* GET SINGLE ARTWORK */

exports.getArtworkById = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id)
      .populate({
        path: 'artist',
        select: 'name email isActive',
        match: { isActive: true } // KEY
      })
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .populate('nestedSubCategory', 'name')
      .populate('size', 'name')
      .populate('orientation', 'name')
      .populate('medium', 'name')
      .populate('material', 'name')
      .populate('theme', 'name')

    //  If artist inactive OR artwork missing
    if (!artwork || !artwork.artist) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found'
      })
    }

    res.status(200).json({
      success: true,
      artwork
    })
  } catch (error) {
    console.error('GET ARTWORK ERROR:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
}

/* UPDATE ARTWORK */

exports.updateArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id)

    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found'
      })
    }
    const user = await User.findById(req.user.id);
    if (!user || !user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account deactivated'
      });
    }
    if (
      req.user.role !== 'admin' &&
      artwork.artist.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      })
    }

    // Handle image updates
    let updatedImages = artwork.images;
    
    // If specifically provided which existing images to keep
    if (req.body.existingImages) {
      try {
        updatedImages = typeof req.body.existingImages === 'string' 
          ? JSON.parse(req.body.existingImages) 
          : req.body.existingImages;
      } catch (e) {
        console.error("Error parsing existingImages:", e);
      }
    }

    const newImagePaths = req.files
      ? req.files.map(file => file.path.replace(/\\/g, '/'))
      : []

    artwork.images = [...updatedImages, ...newImagePaths];

    delete req.body.basePriceUSD
    delete req.body.artworkCode

    if (req.body.categoryId) req.body.category = req.body.categoryId
    if (req.body.subCategoryId) req.body.subCategory = req.body.subCategoryId
    if (req.body.nestedSubCategoryId)
      req.body.nestedSubCategory = req.body.nestedSubCategoryId
    if (req.body.sizeId) req.body.size = req.body.sizeId
    if (req.body.orientationId) req.body.orientation = req.body.orientationId
    if (req.body.mediumId) req.body.medium = req.body.mediumId
    if (req.body.materialId) req.body.material = req.body.materialId
    if (req.body.themeId) req.body.theme = req.body.themeId

    Object.assign(artwork, req.body)

    await artwork.save()

    res.status(200).json({
      success: true,
      message: 'Artwork updated',
      artwork
    })
  } catch (error) {
    console.error('UPDATE ARTWORK ERROR:', error)

    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
}

/* DELETE ARTWORK */

exports.deleteArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id)

    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found'
      })
    }

    if (
      req.user.role !== 'admin' &&
      artwork.artist.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      })
    }

    const user = await User.findById(req.user.id);
    if (!user || !user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account deactivated'
      });
    }

    // 1. Already sold
    if (artwork.isSold) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete: artwork is already sold'
      })
    }

    // 2. Has bids
    if (artwork.bidCount > 0 || artwork.highestBid?.amount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete: artwork has active bids'
      })
    }

    // 3. Bid accepted
    if (artwork.isBidAccepted) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete: bid already accepted'
      })
    }

    await artwork.deleteOne()

    res.status(200).json({
      success: true,
      message: 'Artwork deleted successfully'
    })
  } catch (error) {
    console.error('DELETE ARTWORK ERROR:', error)

    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
}

/* GET ALL ARTWORKS FOR ADMIN */

exports.getAllArtworksAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    const artworks = await Artwork.find()
      .populate('artist', 'name email')
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .populate('nestedSubCategory', 'name')
      .populate('size', 'name')
      .populate('orientation', 'name')
      .populate('medium', 'name')
      .populate('material', 'name')
      .populate('theme', 'name')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: artworks.length,
      artworks
    })
  } catch (error) {
    console.error('GET ADMIN ARTWORKS ERROR:', error)

    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
}

/* GET ARTIST ARTWORKS */

exports.getMyArtworks = async (req, res) => {
  try {
    const artworks = await Artwork.find({ artist: req.user.id })
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .populate('nestedSubCategory', 'name')
      .populate('size', 'name')
      .populate('orientation', 'name')
      .populate('medium', 'name')
      .populate('material', 'name')
      .populate('theme', 'name')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: artworks.length,
      artworks
    })
  } catch (error) {
    console.error('GET MY ARTWORKS ERROR:', error)

    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
}

/* TOGGLE ARTWORK AVAILABILITY (Artist only) */
exports.toggleAvailability = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id)

    if (!artwork) {
      return res
        .status(404)
        .json({ success: false, message: 'Artwork not found' })
    }

    if (
      artwork.artist.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    artwork.isAvailable = !artwork.isAvailable
    await artwork.save()

    res.status(200).json({
      success: true,
      message: `Artwork marked as ${artwork.isAvailable ? 'available' : 'not available'
        }`,
      isAvailable: artwork.isAvailable
    })
  } catch (error) {
    console.error('TOGGLE AVAILABILITY ERROR:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}
