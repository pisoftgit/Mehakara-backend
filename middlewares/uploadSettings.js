const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadPath = 'uploads/about-home';

// Ensure directory exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webm/;
  const isTypeValid = allowedTypes.test(path.extname(file.originalname).toLowerCase()) && 
                     allowedTypes.test(file.mimetype);

  if (isTypeValid) {
    cb(null, true);
  } else {
    cb(new Error('Only images (jpg, png, webp) are allowed!'), false);
  }
};

const uploadSettings = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { 
    fileSize: 300 * 1024 // Strict 300KB limit
  }
});

module.exports = uploadSettings;