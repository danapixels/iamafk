const mongoose = require('mongoose');

const furnitureSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true
  },
  x: {
    type: Number,
    required: true
  },
  y: {
    type: Number,
    required: true
  },
  zIndex: {
    type: Number,
    default: 0
  },
  isFlipped: {
    type: Boolean,
    default: false
  },
  isOn: {
    type: Boolean,
    default: false
  },
  placedBy: {
    type: String,
    required: true
  },
  placedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Index for expiration cleanup
furnitureSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('Furniture', furnitureSchema); 