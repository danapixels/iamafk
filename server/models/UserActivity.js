const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
deviceId: {
type: String,
required: true,
index: true
,
username: {
type: String,
required: true
,
lastActivity: {
type: Date,
default: Date.now

, {
timestamps: true
);

// Index for cleanup operations
userActivitySchema.index({ lastActivity: 1 );

module.exports = mongoose.model('UserActivity', userActivitySchema); 