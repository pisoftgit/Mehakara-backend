const mongoose = require('mongoose');

// Define credential schema templates for different payment methods
const credentialTemplates = {
  razorpay: {
    secretKey: { type: String, required: true },
    publishableKey: { type: String, required: true },
    mode: { type: String, enum: ['test', 'live'], default: 'test' }
  },
  paypal: {
    clientId: { type: String, required: true },
    clientSecret: { type: String, required: true },
    mode: { type: String, enum: ['sandbox', 'live'], default: 'sandbox' }
  },
  stripe: {
    secretKey: { type: String, required: true },
    publishableKey: { type: String, required: true },
    mode: { type: String, enum: ['test', 'live'], default: 'test' }
  },
  paystack: {
    secretKey: { type: String, required: true },
    publicKey: { type: String, required: true },
    mode: { type: String, enum: ['test', 'live'], default: 'test' }
  },
  flutterwave: {
    secretKey: { type: String, required: true },
    publicKey: { type: String, required: true },
    encryptionKey: { type: String },
    mode: { type: String, enum: ['test', 'live'], default: 'test' }
  }
};

const paymentCredentialSchema = new mongoose.Schema(
  {
    paymentModeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PaymentMode',
      required: true
    },

    paymentMethodCode: {
      type: String,
      required: true,
      enum: ['RAZORPAY', 'PAYPAL', 'STRIPE', 'PAYSTACK', 'FLUTTERWAVE', 'OTHER'],
      uppercase: true
    },

    credentialName: {
      type: String,
      required: true,
      trim: true,
      description: 'e.g., "Live Account", "Test Account", "Backup Keys"'
    },

    credentials: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      description: 'Dynamic object storing payment method-specific fields'
    },

    description: {
      type: String,
      trim: true,
      default: ''
    },

    isActive: {
      type: Boolean,
      default: false
    },

    isTestMode: {
      type: Boolean,
      default: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    lastUsed: {
      type: Date,
      default: null
    },

    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient queries
paymentCredentialSchema.index({ paymentModeId: 1, isActive: 1 });
paymentCredentialSchema.index({ paymentMethodCode: 1, isActive: 1 });

module.exports = {
  PaymentCredential: mongoose.model('PaymentCredential', paymentCredentialSchema),
  credentialTemplates
};
