const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
type: {
type: String,
required: true,
enum: ['allTime', 'jackpot'],
unique: true
,
name: {
type: String,
required: true
,
value: {
type: Number,
required: true
,
deviceId: {
type: String
,
lastWinner: {
type: String
,
lastUpdated: {
type: Date,
default: Date.now

, {
timestamps: true
);

module.exports = mongoose.model('Record', recordSchema); 