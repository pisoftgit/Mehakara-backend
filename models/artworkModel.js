// const mongoose = require("mongoose");

// const artworkSchema = new mongoose.Schema({

//   artist: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true
//   },

//   title: {
//     type: String,
//     required: true
//   },

//   description: {
//     type: String
//   },

//   price: {
//     type: Number,
//     required: true
//   },

//   category: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Category",
//     required: true
//   },

//   subCategory: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "SubCategory",
//     required: true
//   },

//   nestedSubCategory: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "NestedSubCategory"
//   },

//   size: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Size"
//   },

//   orientation: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Orientation"
//   },

//   medium: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Medium"
//   },

//   material: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Material"
//   },

//   theme: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Theme"
//   },

//   images: [
//     {
//       type: String
//     }
//   ],

//   status: {
//     type: String,
//     enum: ["pending", "approved", "rejected"],
//     default: "pending"
//   },

//   isAvailable: {
//     type: Boolean,
//     default: true
//   }

// }, { timestamps: true });

// module.exports = mongoose.model("Artwork", artworkSchema);



const mongoose = require("mongoose");

const artworkSchema = new mongoose.Schema({

  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  title: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    trim: true
  },

  price: {
    type: Number,
    required: true,
    min: 0
  },

  // 🔹 Future currency support
  currency: {
    type: String,
    default: "USD",
    uppercase: true,
    trim: true
  },

  // 🔹 used later for global filtering
  basePriceUSD: {
    type: Number
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },

  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubCategory",
    required: true
  },

  artworkCode: {
  type: String,
  unique: true,
  required: true
},

  nestedSubCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NestedSubCategory"
  },

  size: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Size"
  },

  orientation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Orientation"
  },

  medium: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medium"
  },

  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Material"
  },

  theme: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Theme"
  },

  images: [
    {
      type: String
    }
  ],

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "approved",
    index: true
  },

  isAvailable: {
    type: Boolean,
    default: true
  },

  // --- Bidding Support ---
  isAuction: {
    type: Boolean,
    default: false
  },

  auctionEnd: {
    type: Date
  },

  reservePrice: {
    type: Number,
    min: 0
  },

  highestBid: {
    amount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: "USD"
    },
    bidId: {
       type: mongoose.Schema.Types.ObjectId,
       ref: "Bid"
    }
  },

  highestBidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  bidCount: {
    type: Number,
    default: 0
  },

  isBidAccepted: {
    type: Boolean,
    default: false
  },

  // --- Sale History ---
  isSold: {
    type: Boolean,
    default: false
  },

  soldTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  soldPrice: {
    amount: Number,
    currency: String
  },

  soldAt: {
    type: Date
  }

}, { timestamps: true });

module.exports = mongoose.model("Artwork", artworkSchema);