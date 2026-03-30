const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const userId = req.user._id.toString();

    return {
      folder: `buyers/${userId}`,
      format: file.mimetype.split("/")[1],
      public_id: `avatar_${userId}`,
    };
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files allowed!"), false);
  }
};

const uploadBuyerAvatar = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 300 * 1024,
  },
});

module.exports = uploadBuyerAvatar;