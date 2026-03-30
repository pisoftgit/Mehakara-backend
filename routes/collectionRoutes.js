const express = require("express");
const router = express.Router();

const { protect ,restrictTo} = require("../middlewares/authMiddleware");
const uploadCollection = require("../middlewares/uploadCollection");
const collectionController = require("../controllers/collectionController");

// Public routes
router.get("/", collectionController.getCollections);
router.get("/all-collections",protect, restrictTo("admin"), collectionController.getAllCollectionsAdmin);
router.get("/:id", collectionController.getCollectionById);

// Protected routes (Artist/Admin only)
router.get("/artist/my-collections", protect, collectionController.getMyCollections);
router.post("/", protect, uploadCollection.single("coverImage"), collectionController.createCollection);
router.put("/:id", protect, uploadCollection.single("coverImage"), collectionController.updateCollection);
router.delete("/:id", protect, collectionController.deleteCollection);

module.exports = router;
