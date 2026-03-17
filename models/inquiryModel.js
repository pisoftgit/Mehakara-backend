const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    lowercase: true,
    trim: true
  },
  vision: {
    type: String,
    required: [true, 'Please describe your vision'],
    minlength: [10, 'The vision must be at least 10 characters']
  },
  status: {
    type: String,
    enum: ['new', 'in-progress', 'archived'],
    default: 'new'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Inquiry', inquirySchema);