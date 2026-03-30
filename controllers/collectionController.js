const Collection = require("../models/collectionModel");
const Artwork = require("../models/artworkModel");

/* CREATE COLLECTION */
exports.createCollection = async (req, res) => {
  try {
    const { title, description, artworks } = req.body;
    const coverImage = req.file ? req.file.path.replace(/\\/g, "/") : null;

    const collection = await Collection.create({
      title,
      description,
      artist: req.user.id,
      artworks: Array.isArray(artworks) ? artworks : JSON.parse(artworks || "[]"),
      coverImage
    });

    res.status(201).json({
      success: true,
      message: "Collection created successfully",
      collection
    });
  } catch (error) {
    console.error("CREATE COLLECTION ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* GET ALL ACTIVE COLLECTIONS (Public) */
exports.getCollections = async (req, res) => {
  try {
    const User = require("../models/userModel");
    const activeArtists = await User.find({ role: 'artist', isActive: true }).select('_id');
    const activeArtistIds = activeArtists.map(a => a._id);

    const collections = await Collection.find({
      isActive: true,
      artist: { $in: activeArtistIds }
    })
      .populate("artist", "name email avatar")
      .populate({
        path: "artworks",
        select: "title price images currency isAvailable isSold"
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: collections.length,
      collections
    });
  } catch (error) {
    console.error("GET COLLECTIONS ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.getAllCollectionsAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === "true";
    }

    if (req.query.artist) {
      filter.artist = req.query.artist;
    }

    if (req.query.search) {
      filter.title = { $regex: req.query.search, $options: "i" };
    }

    const total = await Collection.countDocuments(filter);

    const collections = await Collection.find(filter)
      .populate("artist", "name email profileImage")
      .populate({
        path: "artworks",
        select: "title price images currency isAvailable isSold"
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      count: collections.length,
      collections
    });

  } catch (error) {
    console.error("ADMIN GET COLLECTIONS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/* GET MY COLLECTIONS (Artist) */
exports.getMyCollections = async (req, res) => {
  try {
    const collections = await Collection.find({ artist: req.user.id })
      .populate({
        path: "artworks",
        select: "title price images currency status"
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: collections.length,
      collections
    });
  } catch (error) {
    console.error("GET MY COLLECTIONS ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* GET SINGLE COLLECTION */
exports.getCollectionById = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id)
      .populate("artist", "name email biography profileImage")
      .populate({
        path: "artworks",
        populate: { path: "category", select: "name" }
      });

    if (!collection) {
      return res.status(404).json({ success: false, message: "Collection not found" });
    }

    res.status(200).json({
      success: true,
      collection
    });
  } catch (error) {
    console.error("GET COLLECTION ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* UPDATE COLLECTION */
exports.updateCollection = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({ success: false, message: "Collection not found" });
    }

    if (collection.artist.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const { title, description, artworks, isActive } = req.body;

    if (title) collection.title = title;
    if (description) collection.description = description;
    if (artworks) collection.artworks = Array.isArray(artworks) ? artworks : JSON.parse(artworks || "[]");
    if (isActive !== undefined) collection.isActive = isActive;

    if (req.file) {
      collection.coverImage = req.file.path.replace(/\\/g, "/");
    }

    await collection.save();

    res.status(200).json({
      success: true,
      message: "Collection updated successfully",
      collection
    });
  } catch (error) {
    console.error("UPDATE COLLECTION ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* DELETE COLLECTION */
exports.deleteCollection = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({ success: false, message: "Collection not found" });
    }

    if (collection.artist.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await collection.deleteOne();

    res.status(200).json({
      success: true,
      message: "Collection deleted successfully"
    });
  } catch (error) {
    console.error("DELETE COLLECTION ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
