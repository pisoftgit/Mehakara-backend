const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },

  password: {
    type: String,
    required: true
  },

    role: {
      type: String,
      enum: ['user', 'admin', 'artist'],
      default: 'user'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    avatar: {
      type: String,
      default: null
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    resetOTP: String,
    resetOTPExpires: Date
},
{
  timestamps: true
}
);

module.exports = mongoose.model('User', userSchema);