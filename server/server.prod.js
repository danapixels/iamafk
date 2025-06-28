const express = require('express');
const http = require('http');
const { Server  = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { validateUsername  = require('./usernameFilter');

// Server configuration constants
const SERVER_CONFIG = {
ANONYMOUS_NAME: 'Anonymous'
;

const app = express();

// Environment-based CORS configuration
const allowedOrigins = process.env.CORS_ORIGIN 
? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
: ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
origin: function (origin, callback) {
// Allow requests with no origin (like mobile apps or curl requests)
if (!origin) return callback(null, true);

if (allowedOrigins.indexOf(origin) !== -1) {
callback(null, true);
 else {
callback(new Error('Not allowed by CORS'));

,
methods: ['GET', 'POST', 'OPTIONS'],
allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
credentials: false
));

// Add CORS headers manually for Socket.IO
app.use((req, res, next) => {
const origin = req.headers.origin;
if (allowedOrigins.includes(origin)) {
res.header('Access-Control-Allow-Origin', origin);

res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
if (req.method === 'OPTIONS') {
res.sendStatus(200);
 else {
next();

);

const server = http.createServer(app);
const io = new Server(server, {
cors: {
origin: allowedOrigins,
methods: ['GET', 'POST', 'OPTIONS'],
allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
credentials: false
,
pingTimeout: 60000, // 60 seconds
pingInterval: 25000, // 25 seconds
transports: ['websocket', 'polling'],
allowEIO3: true
);

// Global variables
const cursors = {;
const lastMoveTimestamps = {;
let furniture = {;
const hearts = [];
const circles = [];
const emotes = [];
let userActivity = {;
let userStats = {;
let userAFKTracking = {;
const allTimeRecord = { name: 'Anonymous', time: 0, lastUpdated: Date.now() ;
const jackpotRecord = { name: 'Anonymous', wins: 0, lastUpdated: Date.now() ;
let pendingChanges = [];
let batchTimer = null;
const BATCH_INTERVAL = 5000; // 5 seconds

// Device ID to socket ID mapping for persistence
const deviceToSocketMap = {;
const socketToDeviceMap = {;

// Persistent furniture storage with expiration
const FURNITURE_FILE = path.join(__dirname, 'data', 'furniture.json');
const FURNITURE_EXPIRY_HOURS = 48;
const USER_ACTIVITY_FILE = path.join(__dirname, 'data', 'user_activity.json');

// Record files
const ALL_TIME_RECORD_FILE = path.join(__dirname, 'data', 'all_time_record.json');
const JACKPOT_RECORD_FILE = path.join(__dirname, 'data', 'jackpot_record.json');

// Z-index management
let nextZIndex = 5000; // Base z-index for furniture

// Server-side user stats storage and validation
const DAILY_FURNITURE_LIMIT = 1000;

// Cache for badge calculations to reduce computational overhead
let badgeCache = {;
let lastBadgeCalculation = 0;
const BADGE_CACHE_DURATION = 5000; // 5 seconds

function getNextZIndex() {
return nextZIndex++;


function updateZIndexFromFurniture() {
// Find the highest z-index currently in use
let maxZIndex = 4999; // Base z-index - 1
Object.values(furniture).forEach(item => {
if (item.zIndex && item.zIndex > maxZIndex) {
maxZIndex = item.zIndex;

);
nextZIndex = maxZIndex + 1;


function loadPersistentData() {

if (fs.existsSync(FURNITURE_FILE)) {
const furnitureData = JSON.parse(fs.readFileSync(FURNITURE_FILE, 'utf8'));
furniture = furnitureData.furniture || {;
console.log('Loaded furniture data:', Object.keys(furniture).length, 'items');
// Update z-index counter from loaded furniture
updateZIndexFromFurniture();


console.error('Error loading furniture data:', error);



if (fs.existsSync(USER_ACTIVITY_FILE)) {
const activityData = JSON.parse(fs.readFileSync(USER_ACTIVITY_FILE, 'utf8'));
userActivity = activityData || {;
console.log('Loaded user activity data:', Object.keys(userActivity).length, 'users');


console.error('Error loading user activity data:', error);



function savePersistentData() {

fs.writeFileSync(FURNITURE_FILE, JSON.stringify({ furniture , null, 2));

console.error('Error saving furniture data:', error);



fs.writeFileSync(USER_ACTIVITY_FILE, JSON.stringify(userActivity, null, 2));

console.error('Error saving user activity data:', error);



function updateUserActivity(socketId, username) {
const now = Date.now();
userActivity[socketId] = {
lastSeen: now,
username: username || 'Anonymous',
socketId: socketId
;
addToBatch('userActivity', { socketId, username );


function cleanupExpiredFurniture() {
const now = Date.now();
const expiryTime = FURNITURE_EXPIRY_HOURS * 60 * 60 * 1000; // 48 hours in milliseconds
let cleanedCount = 0;

Object.keys(furniture).forEach(furnitureId => {
const item = furniture[furnitureId];
if (item.timestamp && (now - item.timestamp) > expiryTime) {
// Check if the user who placed this furniture has been inactive for 48 hours
const userId = furnitureId.split('-')[0];
const userLastSeen = userActivity[userId]?.lastSeen || 0;

if ((now - userLastSeen) > expiryTime) {
delete furniture[furnitureId];
cleanedCount++;
console.log('Cleaned up expired furniture:', furnitureId);


);

if (cleanedCount > 0) {
console.log(`Cleaned up ${cleanedCount expired furniture items`);
addToBatch('cleanup', { cleanedCount );
// Notify all clients about the cleanup
io.emit('furnitureCleanup', { cleanedCount );



function getValidCursors() {
const filtered = {;
const now = Date.now();

// Only recalculate badges if cache is expired
const shouldRecalculateBadges = (now - lastBadgeCalculation) > BADGE_CACHE_DURATION;

if (shouldRecalculateBadges) {
badgeCache = {;
lastBadgeCalculation = now;

// Calculate daily badge once for all users
let dailyBest = { name: '', time: 0 ;
Object.values(cursors).forEach((c) => {
if (!c || !c.name || c.name === 'Anonymous') return;
const stillTime = c.stillTime || 0;
if (stillTime > dailyBest.time) {
dailyBest = { name: c.name, time: stillTime ;

);

// Cache badge calculations
Object.entries(cursors).forEach(([id, cursor]) => {
if (cursor.name && cursor.name.trim() !== '' && cursor.name !== 'Anonymous') {
const userBadges = {
dailyBadge: dailyBest.name === cursor.name && dailyBest.time > 0,
crownBadge: allTimeRecord.name === cursor.name,
gachaBadge: jackpotRecord.name === cursor.name
;
badgeCache[id] = userBadges;

);


Object.entries(cursors).forEach(([id, cursor]) => {
if (cursor.name && cursor.name.trim() !== '' && cursor.name !== 'Anonymous') {
filtered[id] = {
...cursor,
badges: badgeCache[id] || {
dailyBadge: false,
crownBadge: false,
gachaBadge: false

;

);
return filtered;


function cleanupOldUserActivity() {
const now = Date.now();
const ONE_HOUR = 60 * 60 * 1000; // 1 hour in milliseconds
const FORTY_NINE_HOURS = 49 * 60 * 60 * 1000; // 49 hours in milliseconds

// Remove entries older than 49 hours
for (const socketId in userActivity) {
if (now - userActivity[socketId].lastSeen > FORTY_NINE_HOURS) {
delete userActivity[socketId];


addToBatch('userActivity', null);


function cleanupOldUserStats() {
const now = Date.now();
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
let cleanedCount = 0;

// Only remove user stats older than 7 days AND not currently connected
// This preserves AFK users' data for a reasonable time
for (const socketId in userStats) {
const lastSeen = userStats[socketId]?.lastSeen || 0;
const isCurrentlyConnected = cursors[socketId] !== undefined;

if (now - lastSeen > SEVEN_DAYS && !isCurrentlyConnected) {
delete userStats[socketId];
cleanedCount++;



// Clean up AFK tracking only for users who are completely disconnected
for (const socketId in userAFKTracking) {
if (!cursors[socketId]) {
delete userAFKTracking[socketId];



if (cleanedCount > 0) {
console.log(`Cleaned up ${cleanedCount old user stats entries (7+ days inactive)`);
addToBatch('cleanup', { cleanedCount, type: 'userStats' );



// Load data on startup
loadPersistentData();
loadUserStats();
loadAllTimeRecord();
loadJackpotRecord();

// Server-side validation functions
function getUserStatsFromServer(socketId) {
// Get device ID for this socket, fallback to socket ID if no device ID
const deviceId = socketToDeviceMap[socketId] || socketId;

const user = userStats[deviceId];
if (!user) {
// Initialize new user stats
const newUser = {
username: cursors[socketId]?.name || 'Anonymous',
totalAFKTime: 0,
afkBalance: 0,
furniturePlaced: 0,
furnitureByType: {,
lastSeen: Date.now(),
firstSeen: Date.now(),
sessions: 1,
dailyFurniturePlacements: {,
gachaponWins: 0
;
userStats[deviceId] = newUser;
return newUser;

return user;


// Start AFK tracking for a user
function startAFKTracking(deviceId) {
if (!userAFKTracking[deviceId]) {
userAFKTracking[deviceId] = {
startTime: null,
lastUpdate: Date.now()
;



// Update AFK time on server (validated)
function updateAFKTimeOnServer(socketId, seconds) {

const deviceId = socketToDeviceMap[socketId] || socketId;
const user = userStats[deviceId];

if (user) {
user.totalAFKTime += seconds;
user.afkBalance += seconds;
user.lastSeen = Date.now();

// Add to batch for persistence
addToBatch('userStats', { socketId: deviceId, stats: user );

console.log(`Updated AFK time for ${user.username: +${secondss (Total: ${user.totalAFKTimes, Balance: ${user.afkBalances)`);
return { success: true ;
 else {
console.error('User not found for AFK time update:', socketId);
return { success: false, error: 'User not found' ;


console.error('Error updating AFK time:', error);
return { success: false, error: 'Server error' ;



// Deduct AFK balance on server (validated)
function deductAFKBalanceOnServer(socketId, seconds) {

const deviceId = socketToDeviceMap[socketId] || socketId;
const user = userStats[deviceId];

if (user && user.afkBalance >= seconds) {
user.afkBalance -= seconds;
user.lastSeen = Date.now();

// Add to batch for persistence
addToBatch('userStats', { socketId: deviceId, stats: user );

console.log(`Deducted AFK balance for ${user.username: -${secondss (Remaining: ${user.afkBalances)`);
return { success: true ;
 else if (user) {
console.log(`Insufficient AFK balance for ${user.username: ${user.afkBalances < ${secondss`);
return { success: false, error: 'Insufficient AFK balance' ;
 else {
console.error('User not found for AFK balance deduction:', socketId);
return { success: false, error: 'User not found' ;


console.error('Error deducting AFK balance:', error);
return { success: false, error: 'Server error' ;



// Record furniture placement on server (validated)
function recordFurniturePlacementOnServer(socketId, type) {

const deviceId = socketToDeviceMap[socketId] || socketId;
const user = userStats[deviceId];

if (!user) {
return { success: false, error: 'User not found' ;


const today = new Date().toISOString().split('T')[0];
const dailyCount = user.dailyFurniturePlacements[today] || 0;

if (dailyCount >= DAILY_FURNITURE_LIMIT) {
return { success: false, error: 'Daily furniture placement limit reached' ;


// Update user stats
user.furniturePlaced += 1;
user.furnitureByType[type] = (user.furnitureByType[type] || 0) + 1;
user.dailyFurniturePlacements[today] = dailyCount + 1;
user.lastSeen = Date.now();

// Add to batch for persistence
addToBatch('userStats', { socketId: deviceId, stats: user );

console.log(`Recorded furniture placement for ${user.username: ${type (Daily: ${dailyCount + 1/${DAILY_FURNITURE_LIMIT, Total: ${user.furniturePlaced)`);
return { success: true ;

console.error('Error recording furniture placement:', error);
return { success: false, error: 'Server error' ;



// AFK time for users
function updateAFKTracking(socketId, isAFK) {
const deviceId = socketToDeviceMap[socketId] || socketId;
const tracking = userAFKTracking[deviceId];

if (tracking) {
if (isAFK && !tracking.startTime) {
tracking.startTime = Date.now();
tracking.lastUpdate = Date.now();
 else if (!isAFK && tracking.startTime) {
// Calculate AFK time and update user stats
const afkTime = Math.floor((Date.now() - tracking.lastUpdate) / 1000);
if (afkTime > 0) {
updateAFKTimeOnServer(socketId, afkTime);

tracking.startTime = null;
tracking.lastUpdate = null;
 else if (isAFK && tracking.startTime) {
// Update AFK time periodically (every 30 seconds)
const timeSinceLastUpdate = Date.now() - tracking.lastUpdate;
if (timeSinceLastUpdate >= 30000) {
const afkDuration = Math.floor(timeSinceLastUpdate / 1000);
if (afkDuration > 0) {
const result = updateAFKTimeOnServer(socketId, afkDuration);
if (!result.success) {
console.warn('Failed to update AFK time:', result.error);


tracking.lastUpdate = Date.now();





// Clean up user stats when user disconnects
function cleanupUserStats(socketId) {
// Only remove from memory if user is not in cursors (completely disconnected)
if (!cursors[socketId]) {
const deviceId = socketToDeviceMap[socketId];
if (deviceId) {
delete userAFKTracking[deviceId];
delete socketToDeviceMap[socketId];
delete deviceToSocketMap[deviceId];

// Don't delete userStats - keep them persistent by device ID



function loadUserStats() {

const userStatsFile = path.join(__dirname, 'data', 'user_stats.json');
if (fs.existsSync(userStatsFile)) {
const data = JSON.parse(fs.readFileSync(userStatsFile, 'utf8'));
Object.assign(userStats, data);
console.log('Loaded user stats data:', Object.keys(userStats).length, 'users');


console.error('Error loading user stats data:', error);



function saveUserStats() {

const userStatsFile = path.join(__dirname, 'data', 'user_stats.json');
fs.writeFileSync(userStatsFile, JSON.stringify(userStats, null, 2));

console.error('Error saving user stats data:', error);



function loadAllTimeRecord() {

if (fs.existsSync(ALL_TIME_RECORD_FILE)) {
const data = JSON.parse(fs.readFileSync(ALL_TIME_RECORD_FILE, 'utf8'));
Object.assign(allTimeRecord, data);
console.log('Loaded all-time record:', allTimeRecord.name, 'with', allTimeRecord.time, 'seconds');


console.error('Error loading all-time record:', error);



function saveAllTimeRecord() {

fs.writeFileSync(ALL_TIME_RECORD_FILE, JSON.stringify(allTimeRecord, null, 2));

console.error('Error saving all-time record:', error);



function updateAllTimeRecord(socketId, username, stillTime) {
if (stillTime > allTimeRecord.time) {
allTimeRecord.name = username;
allTimeRecord.time = stillTime;
allTimeRecord.lastUpdated = Date.now();

// Add to batch instead of immediate save
addToBatch('allTimeRecord', allTimeRecord);

// Broadcast to all clients
io.emit('allTimeRecordUpdated', allTimeRecord);

console.log('New all-time record set by', username, 'with', stillTime, 'seconds');
return true;

return false;


function loadJackpotRecord() {

if (fs.existsSync(JACKPOT_RECORD_FILE)) {
const data = JSON.parse(fs.readFileSync(JACKPOT_RECORD_FILE, 'utf8'));
Object.assign(jackpotRecord, data);
console.log('Loaded jackpot record:', jackpotRecord.name, 'with', jackpotRecord.wins, 'wins');


console.error('Error loading jackpot record:', error);



function saveJackpotRecord() {

fs.writeFileSync(JACKPOT_RECORD_FILE, JSON.stringify(jackpotRecord, null, 2));

console.error('Error saving jackpot record:', error);



function updateJackpotRecord(socketId, username) {
// Get device ID for this socket, fallback to socket ID if no device ID
const deviceId = socketToDeviceMap[socketId] || socketId;

// Get current user wins (including this new win)
const currentUserWins = (userStats[deviceId]?.gachaponWins || 0) + 1;

// Check if this user already has the record
if (jackpotRecord.name === username) {
// Increment existing record
jackpotRecord.wins = currentUserWins;
 else {
// Check if this user has more wins than current record
if (currentUserWins > jackpotRecord.wins) {
jackpotRecord.name = username;
jackpotRecord.wins = currentUserWins;



jackpotRecord.lastUpdated = Date.now();

// Add to batch instead of immediate save
addToBatch('jackpotRecord', jackpotRecord);

// Broadcast to all clients
io.emit('jackpotRecordUpdated', jackpotRecord);

console.log('Jackpot record updated:', jackpotRecord.name, 'now has', jackpotRecord.wins, 'wins');
return true;


// Start batch timer
startBatchTimer();

// Clean up expired furniture every hour
setInterval(cleanupExpiredFurniture, 60 * 60 * 1000);

// Initial cleanup on startup
cleanupExpiredFurniture();

// Run cleanup every 1 hr
setInterval(cleanupOldUserActivity, 60 * 60 * 1000);

// Run user stats cleanup every 24 hours
setInterval(cleanupOldUserStats, 24 * 60 * 60 * 1000);

// Add change to batch instead of immediate save
function addToBatch(changeType, data) {
pendingChanges.push({ 
type: changeType, 
data, 
timestamp: Date.now() 
);


// Save batch immediately
function saveBatch() {
if (pendingChanges.length > 0) {
console.log(`Saving batch of ${pendingChanges.length changes`);

// Apply all pending changes to memory
pendingChanges.forEach(change => {
switch (change.type) {
case 'userActivity':
if (change.data) {
const { socketId, username  = change.data;
userActivity[socketId] = {
lastSeen: change.timestamp,
username: username || 'Anonymous',
socketId: socketId
;

break;
case 'furniture':
// Furniture changes are already applied to memory
break;
case 'cleanup':
// Cleanup changes are already applied to memory
break;
case 'userStats':
const { socketId, stats  = change.data;
userStats[socketId] = stats;
break;
case 'allTimeRecord':
// All-time record changes are already applied to memory
break;
case 'jackpotRecord':
// Jackpot record changes are already applied to memory
break;

);

// Save to files
savePersistentData();
saveUserStats();
saveAllTimeRecord();
saveJackpotRecord();

// Clear batch
pendingChanges.length = 0;



// Start batch timer
function startBatchTimer() {
if (batchTimer) {
clearInterval(batchTimer);

batchTimer = setInterval(saveBatch, BATCH_INTERVAL);


// Stop batch timer and save immediately
function stopBatchTimer() {
if (batchTimer) {
clearInterval(batchTimer);
batchTimer = null;

saveBatch(); // Save any pending changes


io.on('connection', (socket) => {
// Initialize cursor for new user
cursors[socket.id] = { x: 0, y: 0, username: '', cursorType: 'default' ;
lastMoveTimestamps[socket.id] = Date.now();

// Update user activity on connection
updateUserActivity(socket.id, 'Anonymous');

// Send current state to new user
socket.emit('initialState', {
cursors: getValidCursors(),
furniture: furniture,
);

// Notify other users about new connection
socket.broadcast.emit('clientConnected', { 
socketId: socket.id, 
cursor: cursors[socket.id] 
);

socket.on('setName', async ({ name, deviceId ) => {
if (cursors[socket.id]) {
// Validate username before setting it
const validation = await validateUsername(name);

if (!validation.isAppropriate) {
// Send error message to client
socket.emit('usernameError', { 
message: validation.reason || 'Username is not allowed' 
);
return;


const username = name?.trim() || 'Anonymous';
cursors[socket.id].name = username;

// Set up device ID mapping for persistence
if (deviceId) {
deviceToSocketMap[deviceId] = socket.id;
socketToDeviceMap[socket.id] = deviceId;


// Update user activity with the username
updateUserActivity(socket.id, username);

// Initialize user stats for server-side validation
startAFKTracking(deviceId || socket.id);

// Send success response to client
socket.emit('usernameAccepted', { username );

// Broadcast updated cursors to all clients
io.emit('cursors', getValidCursors());

);

// Server-side validation handlers
socket.on('requestUserStats', () => {
const userStats = getUserStatsFromServer(socket.id);
socket.emit('userStats', userStats);
);

socket.on('requestAllTimeRecord', () => {
socket.emit('allTimeRecord', allTimeRecord);
);

socket.on('requestJackpotRecord', () => {
socket.emit('jackpotRecord', jackpotRecord);
);

socket.on('updateAFKTime', ({ seconds , callback) => {
const result = updateAFKTimeOnServer(socket.id, seconds);
callback(result);
);

socket.on('deductAFKBalance', ({ seconds , callback) => {
const result = deductAFKBalanceOnServer(socket.id, seconds);
callback(result);
);

socket.on('recordFurniturePlacement', ({ type , callback) => {
const result = recordFurniturePlacementOnServer(socket.id, type);
callback(result);
);

socket.on('cursorMove', ({ x, y, name ) => {
const now = Date.now();

if (!cursors[socket.id]) {
cursors[socket.id] = {
name: name?.trim() || '',
x,
y,
stillTime: 0,
;
lastMoveTimestamps[socket.id] = now;
 else {
const prev = cursors[socket.id];
if (prev.x !== x || prev.y !== y) {
cursors[socket.id].x = x;
cursors[socket.id].y = y;
cursors[socket.id].stillTime = 0;
lastMoveTimestamps[socket.id] = now;
 else {
const diffSeconds = Math.floor((now - lastMoveTimestamps[socket.id]) / 1000);
cursors[socket.id].stillTime = diffSeconds;

// Check for new all-time record
if (cursors[socket.id].name && cursors[socket.id].name !== SERVER_CONFIG.ANONYMOUS_NAME) {
updateAllTimeRecord(socket.id, cursors[socket.id].name, diffSeconds);



if (name && name.trim() !== '') {
cursors[socket.id].name = name.trim();
// Update user activity on movement
addToBatch('userActivity', { socketId: socket.id, username: name.trim() );



io.emit('cursors', getValidCursors());
);

// NEW: Reset stillTime on client request (click/dblclick)
socket.on('resetStillTime', () => {
if (cursors[socket.id]) {
cursors[socket.id].stillTime = 0;
lastMoveTimestamps[socket.id] = Date.now();
// Update user activity on interaction
addToBatch('userActivity', { socketId: socket.id, username: cursors[socket.id].name );
io.emit('cursors', getValidCursors());

);

socket.on('spawnHeart', (heartData) => {
io.emit('heartSpawned', heartData);
);

socket.on('spawnCircle', (circleData) => {
io.emit('circleSpawned', circleData);
);

socket.on('spawnThumbsUp', (thumbsUpData) => {
io.emit('thumbsUpSpawned', thumbsUpData);
);

socket.on('spawnEmote', (EmoteData) => {
io.emit('EmoteSpawned', EmoteData);
);

socket.on('spawnFurniture', (data) => {
console.log('Server received spawnFurniture:', data);

// Server-side validation: Record furniture placement
const placementResult = recordFurniturePlacementOnServer(socket.id, data.type);
if (!placementResult.success) {
console.log('Furniture placement rejected:', placementResult.error);
return;


const furnitureId = `${socket.id-${Date.now()`;
const now = Date.now();

// Create furniture with timestamp for persistence and z-index
furniture[furnitureId] = {
id: furnitureId,
type: data.type,
x: data.x || 0,
y: data.y || 0,
isFlipped: false,
timestamp: now,
ownerId: socket.id,
ownerName: cursors[socket.id]?.name || 'Anonymous',
zIndex: getNextZIndex() // Assign z-index from server
;

// Save to persistent storage
addToBatch('furniture', furniture[furnitureId]);

// Broadcast to all clients including sender
console.log('Server broadcasting furnitureSpawned:', furniture[furnitureId]);
io.emit('furnitureSpawned', furniture[furnitureId]);
);

socket.on('updateFurniturePosition', (data) => {
console.log('Server received updateFurniturePosition:', data);
const { furnitureId, x, y, isFlipped  = data;
if (furniture[furnitureId]) {
furniture[furnitureId].x = x;
furniture[furnitureId].y = y;
if (typeof isFlipped === 'boolean') {
furniture[furnitureId].isFlipped = isFlipped;


// Update timestamp when furniture is moved
furniture[furnitureId].timestamp = Date.now();

// Save to persistent storage
addToBatch('furniture', furniture[furnitureId]);

// Broadcast to ALL clients including sender
const broadcastData = { 
id: furnitureId, 
x, 
y,
isFlipped: furniture[furnitureId].isFlipped 
;
console.log('Server broadcasting furnitureMoved:', broadcastData);
io.emit('furnitureMoved', broadcastData);

);

socket.on('flipFurniture', (data) => {
const { furnitureId  = data;
if (furniture[furnitureId]) {
// Toggle the flipped state
furniture[furnitureId].isFlipped = !furniture[furnitureId].isFlipped;

// Update timestamp when furniture is flipped
furniture[furnitureId].timestamp = Date.now();

// Save to persistent storage
addToBatch('furniture', furniture[furnitureId]);

// Broadcast to ALL clients including sender
io.emit('furnitureFlipped', { 
id: furnitureId, 
isFlipped: furniture[furnitureId].isFlipped 
);

);

socket.on('updateFurnitureZIndex', (data) => {
const { furnitureId, zIndex  = data;
if (furniture[furnitureId]) {
furniture[furnitureId].zIndex = zIndex;

// Update timestamp when furniture z-index is changed
furniture[furnitureId].timestamp = Date.now();

// Save to persistent storage
addToBatch('furniture', furniture[furnitureId]);

// Broadcast to ALL clients including sender
io.emit('furnitureZIndexChanged', { 
id: furnitureId, 
zIndex: furniture[furnitureId].zIndex 
);

);

socket.on('moveFurnitureUp', (data) => {
const { furnitureId  = data;
if (furniture[furnitureId]) {
// Find the furniture with the next higher z-index
const currentZIndex = furniture[furnitureId].zIndex || 100;
let targetFurniture = null;
let minHigherZIndex = Infinity;

Object.values(furniture).forEach(item => {
if (item.zIndex > currentZIndex && item.zIndex < minHigherZIndex) {
minHigherZIndex = item.zIndex;
targetFurniture = item;

);

if (targetFurniture) {
// Swap z-indices
const tempZIndex = furniture[furnitureId].zIndex;
furniture[furnitureId].zIndex = targetFurniture.zIndex;
targetFurniture.zIndex = tempZIndex;

// Update timestamps
furniture[furnitureId].timestamp = Date.now();
targetFurniture.timestamp = Date.now();

// Save to persistent storage
addToBatch('furniture', furniture[furnitureId]);
addToBatch('furniture', targetFurniture);

// Broadcast to ALL clients
io.emit('furnitureZIndexChanged', [
{ id: furnitureId, zIndex: furniture[furnitureId].zIndex ,
{ id: targetFurniture.id, zIndex: targetFurniture.zIndex 
]);


);

socket.on('moveFurnitureDown', (data) => {
const { furnitureId  = data;
if (furniture[furnitureId]) {
// Find the furniture with the next lower z-index
const currentZIndex = furniture[furnitureId].zIndex || 100;
let targetFurniture = null;
let maxLowerZIndex = -Infinity;

Object.values(furniture).forEach(item => {
if (item.zIndex < currentZIndex && item.zIndex > maxLowerZIndex) {
maxLowerZIndex = item.zIndex;
targetFurniture = item;

);

if (targetFurniture) {
// Swap z-indices
const tempZIndex = furniture[furnitureId].zIndex;
furniture[furnitureId].zIndex = targetFurniture.zIndex;
targetFurniture.zIndex = tempZIndex;

// Update timestamps
furniture[furnitureId].timestamp = Date.now();
targetFurniture.timestamp = Date.now();

// Save to persistent storage
addToBatch('furniture', furniture[furnitureId]);
addToBatch('furniture', targetFurniture);

// Broadcast to ALL clients
io.emit('furnitureZIndexChanged', [
{ id: furnitureId, zIndex: furniture[furnitureId].zIndex ,
{ id: targetFurniture.id, zIndex: targetFurniture.zIndex 
]);


);

socket.on('deleteFurniture', (furnitureId) => {
if (furniture[furnitureId]) {
delete furniture[furnitureId];
// Save to persistent storage
addToBatch('furniture', null);
io.emit('furnitureDeleted', { id: furnitureId );

);

socket.on('cursorFreeze', ({ isFrozen, x, y, sleepingOnBed ) => {
if (cursors[socket.id]) {
// Update the cursor's frozen state
cursors[socket.id].isFrozen = isFrozen;
cursors[socket.id].sleepingOnBed = sleepingOnBed;

if (isFrozen) {
// Store the frozen position when freezing
cursors[socket.id].frozenPosition = { x, y ;
 else {
// Remove frozen position when unfreezing
delete cursors[socket.id].frozenPosition;
delete cursors[socket.id].sleepingOnBed;


// Broadcast to all clients that this cursor is frozen/unfrozen
io.emit('cursorFrozen', { 
id: socket.id, 
isFrozen,
frozenPosition: cursors[socket.id].frozenPosition,
sleepingOnBed: cursors[socket.id].sleepingOnBed
);

// Update the cursors state for all clients
io.emit('cursors', getValidCursors());

);

socket.on('changeCursor', ({ type ) => {
if (cursors[socket.id]) {
// Update the cursor type
cursors[socket.id].cursorType = type;
// Broadcast the cursor change to all clients
io.emit('cursorChanged', { id: socket.id, type );
// Update the cursors state for all clients
io.emit('cursors', getValidCursors());

);

socket.on('gachaponWin', ({ winnerId, winnerName ) => {
console.log('Server received gachaponWin:', { winnerId, winnerName );

// Update user stats with gachapon win
if (userStats[winnerId]) {
userStats[winnerId].gachaponWins = (userStats[winnerId].gachaponWins || 0) + 1;
userStats[winnerId].lastSeen = Date.now();
addToBatch('userStats', { socketId: winnerId, stats: userStats[winnerId] );


// Update jackpot record
updateJackpotRecord(winnerId, winnerName);

// Broadcast to ALL currently online clients
io.emit('gachaponWin', { winnerId, winnerName );
io.emit('showDialogBanner');
console.log('Server broadcasted gachaponWin to all clients');
);

socket.on('gachaponAnimation', ({ userId, hasEnoughTime ) => {
// Broadcast the animation event to all clients except the sender
socket.broadcast.emit('gachaponAnimation', { userId, hasEnoughTime );
);

socket.on('disconnect', () => {
// Save any pending changes immediately when user disconnects
saveBatch();

// Clean up user stats (but preserve persistent data)
cleanupUserStats(socket.id);

// Remove cursor
delete cursors[socket.id];
delete lastMoveTimestamps[socket.id];

// Notify other clients
io.emit('clientDisconnected', socket.id);
);
);

setInterval(() => {
const now = Date.now();
let updated = false;

Object.keys(cursors).forEach((id) => {
const cursor = cursors[id];
const lastMove = lastMoveTimestamps[id];
if (cursor && lastMove) {
const diffSeconds = Math.floor((now - lastMove) / 1000);
if (cursor.stillTime !== diffSeconds) {
cursor.stillTime = diffSeconds;
updated = true;


);

if (updated) {
io.emit('cursors', getValidCursors());

, 2000);

// AFK time for all users
setInterval(() => {
Object.keys(cursors).forEach(socketId => {
const cursor = cursors[socketId];
if (cursor) {
const isAFK = cursor.stillTime >= 30 || cursor.isFrozen;
updateAFKTracking(socketId, isAFK);

);
, 1000); // Check every second

// Graceful shutdown handlers
process.on('SIGINT', () => {
console.log('Shutting down server...');
stopBatchTimer();
process.exit(0);
);

process.on('SIGTERM', () => {
console.log('Shutting down server...');
stopBatchTimer();
process.exit(0);
);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
console.log(`Server running on port ${PORT`);
); 