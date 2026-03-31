const express = require("express");
const router = express.Router();

const { protect ,restrictTo } = require("../middlewares/authMiddleware");
const uploadArtwork = require("../middlewares/uploadArtwork");

const artworkController = require("../controllers/artworkController");


router.post(
  "/",
  protect,
  uploadArtwork.array("images", 5),
  artworkController.createArtwork
);

router.get("/admin/all", protect, restrictTo("admin","superadmin"), artworkController.getAllArtworksAdmin);
router.get("/", artworkController.getArtworks); 

router.get(
  "/my-artworks",
  protect,
  artworkController.getMyArtworks
);

router.get("/:id", artworkController.getArtworkById);

router.patch(
  "/:id/toggle-availability",
  protect,
  // restrictTo("admin","superadmin"),
  artworkController.toggleAvailability
);

router.put(
  "/:id",
  protect,
  uploadArtwork.array("images", 5),
  artworkController.updateArtwork
);

router.delete(
  "/:id",
  protect,
  artworkController.deleteArtwork
);

module.exports = router;