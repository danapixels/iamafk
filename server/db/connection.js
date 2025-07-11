const mongoose = require('mongoose');

const connectDB = async () => {

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/iamafk';

await mongoose.connect(mongoURI, {
useNewUrlParser: true,
useUnifiedTopology: true,
);

console.log('✅ MongoDB connected successfully');

console.error('❌ MongoDB connection error:', error);
process.exit(1);

;

const disconnectDB = async () => {

await mongoose.disconnect();
console.log('✅ MongoDB disconnected successfully');

console.error('❌ MongoDB disconnection error:', error);

;

module.exports = { connectDB, disconnectDB ; 