const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith("video");
    const folder = req.params.folder || "general";

    return {
      folder: `uploads/${folder}`,
      resource_type: isVideo ? "video" : "image",
      format: file.mimetype.split("/")[1],
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    };
  },
});

const uploadFiles = (folderName, maxFiles = 1) => {
  return multer({ storage }).array('files', maxFiles);
};

module.exports = { uploadFiles };