const express = require('express');
const http = require('http');
const { Server  = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { validateUsername  = require('./usernameFilter');

const app = express();

// More explicit CORS configuration
app.use(cors({
origin: true, // Allow all origins
methods: ['GET', 'POST', 'OPTIONS'],
allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
credentials: false
));

// Add CORS headers manually for Socket.IO
app.use((req, res, next) => {
res.header('Access-Control-Allow-Origin', '*');
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
origin: true,
methods: ['GET', 'POST', 'OPTIONS'],
allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
credentials: false
,
pingTimeout: 60000, // 60 seconds
pingInterval: 25000, // 25 seconds
transports: ['websocket', 'polling'],
allowEIO3: true
);

let cursors = {;
let hearts = [];
let circles = [];
let Emotes = [];
let furniture = {;
let lastMoveTimestamps = {;
let userActivity = {;

// Batch save system
let pendingChanges = [];
const BATCH_INTERVAL = 5 * 60 * 1000; // 5 minutes
let batchTimer = null;

// Persistent furniture storage with expiration
const FURNITURE_FILE = path.join(__dirname, 'data', 'furniture.json');
const FURNITURE_EXPIRY_HOURS = 48;
const USER_ACTIVITY_FILE = path.join(__dirname, 'data', 'user_activity.json');

// Z-index management
let nextZIndex = 5000; // Base z-index for furniture

// Server-side user stats storage and validation
const userStats = {; // In-memory storage for user stats
const userAFKTracking = {; // AFK time for each user
const DAILY_FURNITURE_LIMIT = 1000;

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
Object.entries(cursors).forEach(([id, cursor]) => {
if (cursor.name && cursor.name.trim() !== '' && cursor.name !== 'Anonymous') {
filtered[id] = cursor;

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


// Load data on startup
loadPersistentData();

// Start batch timer
startBatchTimer();

// Clean up expired furniture every hour
setInterval(cleanupExpiredFurniture, 60 * 60 * 1000);

// Initial cleanup on startup
cleanupExpiredFurniture();

// Run cleanup every 1 hr
setInterval(cleanupOldUserActivity, 60 * 60 * 1000);

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

);

// Save to files
savePersistentData();

// Clear batch
pendingChanges = [];



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

socket.on('setName', async ({ name ) => {
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
// Update user activity with the username
updateUserActivity(socket.id, username);

// Send success response to client
socket.emit('usernameAccepted', { username );

// Broadcast updated cursors to all clients
io.emit('cursors', getValidCursors());

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
// Broadcast to ALL currently online clients
io.emit('gachaponWin', { winnerId, winnerName );
io.emit('showDialogBanner');
console.log('Server broadcasted gachaponWin to all clients');
);

socket.on('gachaponAnimation', ({ userId, hasEnoughTime ) => {
// Broadcast the animation event to all clients except the sender
socket.broadcast.emit('gachaponAnimation', { userId, hasEnoughTime );
);

// Server-side user stats validation handlers
socket.on('requestUserStats', () => {
const userStats = getUserStatsFromServer(socket.id);
socket.emit('userStats', userStats);
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

socket.on('disconnect', () => {
// Save any pending changes immediately when user disconnects
saveBatch();

// Clean up user stats
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

, 1000);

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

// Get user stats from server storage
function getUserStatsFromServer(socketId) {
const user = userStats[socketId];
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
dailyFurniturePlacements: {
;
userStats[socketId] = newUser;
return newUser;

return user;


// Update AFK time with server-side validation
function updateAFKTimeOnServer(socketId, seconds) {
// Validate input
if (typeof seconds !== 'number' || seconds <= 0 || seconds > 86400) {
return { success: false, error: 'Invalid AFK time value' ;


const user = getUserStatsFromServer(socketId);
user.totalAFKTime += seconds;
user.afkBalance += seconds;
user.lastSeen = Date.now();

// Save to persistent storage
addToBatch('userStats', { socketId, stats: user );

return { success: true ;


// Deduct AFK balance with server-side validation
function deductAFKBalanceOnServer(socketId, seconds) {
// Validate input
if (typeof seconds !== 'number' || seconds <= 0) {
return { success: false, error: 'Invalid deduction amount' ;


const user = getUserStatsFromServer(socketId);

// Check if user has enough balance
if (user.afkBalance < seconds) {
return { success: false, error: 'Insufficient AFK balance' ;


user.afkBalance -= seconds;
user.lastSeen = Date.now();

// Save to persistent storage
addToBatch('userStats', { socketId, stats: user );

return { success: true ;


// Record furniture placement with server-side validation
function recordFurniturePlacementOnServer(socketId, type) {
// Validate input
if (typeof type !== 'string' || !type.trim()) {
return { success: false, error: 'Invalid furniture type' ;


const user = getUserStatsFromServer(socketId);
const today = new Date().toISOString().split('T')[0];
const dailyPlacements = user.dailyFurniturePlacements[today] || 0;

// Check daily limit
if (dailyPlacements >= DAILY_FURNITURE_LIMIT) {
return { success: false, error: 'Daily furniture placement limit reached' ;


// Update stats
user.dailyFurniturePlacements[today] = dailyPlacements + 1;
user.furniturePlaced += 1;
user.furnitureByType[type] = (user.furnitureByType[type] || 0) + 1;
user.lastSeen = Date.now();

// Save to persistent storage
addToBatch('userStats', { socketId, stats: user );

return { success: true ;


// AFK time for users
function startAFKTracking(socketId) {
if (!userAFKTracking[socketId]) {
userAFKTracking[socketId] = {
startTime: null,
lastUpdate: null
;



function updateAFKTracking(socketId, isAFK) {
const tracking = userAFKTracking[socketId];
if (!tracking) return;

const now = Date.now();

if (isAFK && !tracking.startTime) {
// Start AFK tracking
tracking.startTime = now;
tracking.lastUpdate = now;
 else if (!isAFK && tracking.startTime) {
// End AFK tracking and add time
const afkDuration = Math.floor((now - tracking.lastUpdate) / 1000);
if (afkDuration > 0) {
const result = updateAFKTimeOnServer(socketId, afkDuration);
if (!result.success) {
console.warn('Failed to update AFK time:', result.error);


tracking.startTime = null;
tracking.lastUpdate = null;
 else if (isAFK && tracking.startTime) {
// Update AFK time periodically (every 30 seconds)
const timeSinceLastUpdate = now - tracking.lastUpdate;
if (timeSinceLastUpdate >= 30000) {
const afkDuration = Math.floor(timeSinceLastUpdate / 1000);
if (afkDuration > 0) {
const result = updateAFKTimeOnServer(socketId, afkDuration);
if (!result.success) {
console.warn('Failed to update AFK time:', result.error);


tracking.lastUpdate = now;




// Clean up user stats when user disconnects
function cleanupUserStats(socketId) {
delete userStats[socketId];
delete userAFKTracking[socketId];


// Load user stats from persistent storage
function loadUserStats() {

const data = fs.readFileSync('userStats.json', 'utf8');
const parsed = JSON.parse(data);
Object.assign(userStats, parsed);

console.log('No existing user stats found, starting fresh');



// Save user stats to persistent storage
function saveUserStats() {

fs.writeFileSync('userStats.json', JSON.stringify(userStats, null, 2));

console.error('Error saving user stats:', error);



// Load user stats on startup
loadUserStats();

// Save user stats periodically
setInterval(saveUserStats, 60000); // Save every minute

// AFK time for all users
setInterval(() => {
Object.keys(cursors).forEach(socketId => {
const cursor = cursors[socketId];
if (cursor) {
const isAFK = cursor.stillTime >= 30 || cursor.isFrozen;
updateAFKTracking(socketId, isAFK);

);
, 1000); // Check every second
