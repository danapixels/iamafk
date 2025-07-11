const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
deviceId: {
type: String,
required: true,
unique: true,
index: true
,
username: {
type: String,
default: 'Anonymous'
,
totalAFKTime: {
type: Number,
default: 0
,
afkBalance: {
type: Number,
default: 0
,
furniturePlaced: {
type: Number,
default: 0
,
furnitureByType: {
type: Map,
of: Number,
default: {
,
lastSeen: {
type: Date,
default: Date.now
,
firstSeen: {
type: Date,
default: Date.now
,
sessions: {
type: Number,
default: 1
,
dailyFurniturePlacements: {
type: Map,
of: Number,
default: {
,
unlockedHats: [{
type: String
],
unlockedFurniture: [{
type: String
],
gachaHats: [{
type: String
],
gachaFurniture: [{
type: String
],
// New fields for gacha items with unlocker information
unlockedGachaHats: [{
item: {
type: String,
required: true
,
unlockedBy: {
type: String,
required: true

],
unlockedGachaFurniture: [{
item: {
type: String,
required: true
,
unlockedBy: {
type: String,
required: true

],
furniturePresets: [{
type: mongoose.Schema.Types.Mixed
],
dailyPresetUsage: {
type: Map,
of: Number,
default: {
,
dailyFurnitureCount: {
type: Number,
default: 0
,
lastDailyReset: {
type: Date,
default: Date.now

, {
timestamps: true
);

module.exports = mongoose.model('User', userSchema); 