const mongoose = require('mongoose');

const deviceMappingSchema = new mongoose.Schema({
  socketId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient lookups
deviceMappingSchema.index({ socketId: 1 });
deviceMappingSchema.index({ deviceId: 1 });

module.exports = mongoose.model('DeviceMapping', deviceMappingSchema); 