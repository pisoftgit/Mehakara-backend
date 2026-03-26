const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Helper to ensure the base directory exists
 * We do this once at the start, but subdirectories are handled in storage
 */
const baseUploadPath = path.join(__dirname, '../uploads/artists');
if (!fs.existsSync(baseUploadPath)) {
    fs.mkdirSync(baseUploadPath, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // 1. Get artistId from the 'protect' middleware (req.user)
        // Note: Make sure the 'protect' middleware is called BEFORE uploadArtist in your routes
        const artistId = req.user && req.user._id ? req.user._id.toString() : 'temp';
        
        // 2. Define the specific path for this artist
        const userPath = path.join(baseUploadPath, artistId);

        // 3. Create the directory if it doesn't exist
        try {
            if (!fs.existsSync(userPath)) {
                fs.mkdirSync(userPath, { recursive: true });
            }
            cb(null, userPath);
        } catch (err) {
            cb(err, null);
        }
    },
    filename: function (req, file, cb) {
        // 4. Create a clean filename with timestamp to avoid duplicates
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext).replace(/\s+/g, '_');
        
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    },
});

/**
 * File Filter to ensure only images are uploaded
 */
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'), false);
    }
};

/**
 * Export configured multer instance
 * Limits: 5MB file size limit per image
 */
const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter,
    limits: {
        fileSize: 300 * 1024 // 300KB
    }
});

module.exports = upload;