const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

/**
 * Cloudinary storage
 */
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const artistId = req.user?._id?.toString() || "temp";

    // Decide folder based on field name
    let folder = `artists/${artistId}`;

    if (file.fieldname === "avatar") {
      folder = `artists/${artistId}/avatar`;
    } else if (file.fieldname === "portfolioImages") {
      folder = `artists/${artistId}/portfolio`;
    }

    return {
      folder,
      format: file.mimetype.split("/")[1],
      public_id: `${Date.now()}-${file.fieldname}`,
    };
  },
});

/**
 * File filter (same as before)
 */
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, WEBP allowed"), false);
  }
};

/**
 * Multer instance
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 300 * 1024, 
  },
});

module.exports = upload;