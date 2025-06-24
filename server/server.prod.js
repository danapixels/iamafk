const express = require('express');
const http = require('http');
const { Server  = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

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

socket.on('setName', ({ name ) => {
if (cursors[socket.id]) {
const username = name?.trim() || 'Anonymous';
cursors[socket.id].name = username;
// Update user activity with the username
updateUserActivity(socket.id, username);
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

socket.on('disconnect', () => {
// Save any pending changes immediately when user disconnects
saveBatch();

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