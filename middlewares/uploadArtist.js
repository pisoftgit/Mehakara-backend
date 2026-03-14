const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.user._id.toString();
    const uploadPath = path.join(__dirname, `../uploads/artist/${userId}`);
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files allowed!'), false);
};

const uploadBuyerAvatar = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

module.exports = uploadBuyerAvatar;