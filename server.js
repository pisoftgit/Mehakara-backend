const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

/* ---------------------- MIDDLEWARE ---------------------- */

// JSON parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Debug logger
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  next();
});




/* ---------------------- ROUTES ---------------------- */

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const subCategoryRoutes = require('./routes/subCategoryRoutes');
const nestedSubCategoryRoutes = require('./routes/nestedSubCategoryRoutes');
const buyerProfileRoutes = require('./routes/buyerProfileRoutes');
const artistProfileRoutes = require('./routes/artistProfileRoutes');
const sizeRoutes = require('./routes/sizeRoutes');
const unitRoutes =require("./routes/unitRoutes")
const orientationRoutes = require('./routes/orientationRoutes');
const mediumRoutes = require('./routes/mediumRoutes');
const materialRoutes = require('./routes/materialRoutes');
const styleRoutes = require('./routes/styleRoutes');
const themeRoutes = require('./routes/themeRoutes');
const artworkRoutes = require('./routes/artworkRoutes');
const orderRoutes = require('./routes/orderRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const offerRoutes = require('./routes/offerRoutes');
const currencyRoutes = require('./routes/currencyRoutes');







app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subCategoryRoutes);
app.use('/api/nested-subcategories', nestedSubCategoryRoutes);
app.use('/api/buyer-profile', buyerProfileRoutes);
app.use('/api/artist-profile', artistProfileRoutes);
app.use('/api/sizes', sizeRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/orientations', orientationRoutes);
app.use('/api/mediums', mediumRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/styles', styleRoutes);
app.use('/api/theme', themeRoutes);
app.use('/api/artworks', artworkRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/currencies', currencyRoutes);










// Health route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Art Marketplace API Running"
  });
});


/* ---------------------- DATABASE ---------------------- */

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log("MongoDB Connected Successfully"))
.catch((err) => {
  console.error("MongoDB Connection Error:", err.message);
  process.exit(1);
});

/* ---------------------- ERROR HANDLER ---------------------- */

app.use((err, req, res, next) => {
  console.error("Global Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

/* ---------------------- SERVER ---------------------- */

const PORT = process.env.PORT || 8000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ API available at http://localhost:${PORT}/api`);
});