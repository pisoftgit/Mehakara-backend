const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({

  destination: function (req, file, cb) {

    const artistId = req.user.id;

    const uploadPath = `uploads/artworks/${artistId}`;

    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {

    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, uniqueName + path.extname(file.originalname));
  }

});

const fileFilter = (req, file, cb) => {

  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Only images allowed"), false);
  }

};

const uploadArtwork = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 300 * 1024
  }
});

module.exports = uploadArtwork;