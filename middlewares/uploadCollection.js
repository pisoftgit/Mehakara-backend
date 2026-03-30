const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const artistId = req.user?.id || "temp";
    return {
      folder: `collections/${artistId}`,
      format: file.mimetype.split("/")[1],
      public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
    };
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Only images allowed"), false);
  }
};

const uploadCollection = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024, // 1MB
  },
});

module.exports = uploadCollection;

