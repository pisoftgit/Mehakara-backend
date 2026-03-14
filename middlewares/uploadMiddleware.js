const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Create storage engine for a specific folder
 * @param {string} folderName - folder inside uploads
 */
const createStorage = (folderName) => {
  const uploadPath = path.join(__dirname, '..', 'uploads', folderName);

  // Make sure folder exists
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  });
};

/**
 * Upload middleware
 * @param {string} folderName
 * @param {number} maxFiles
 */
const uploadFiles = (folderName, maxFiles = 1) => {
  const storage = createStorage(folderName);
  return multer({ storage }).array('files', maxFiles); // frontend should send 'files' field
};

module.exports = { uploadFiles };