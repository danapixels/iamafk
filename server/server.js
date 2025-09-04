const express = require('express');
const http = require('http');
const { Server  = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { validateUsername  = require('./usernameFilter');
const { connectDB  = require('./db/connection');
const User = require('./models/User');
const Furniture = require('./models/Furniture');
const Record = require('./models/Record');
const UserActivity = require('./models/UserActivity');

// load environment variables
require('dotenv').config();

// server configuration from environment variables
const SERVER_CONFIG = {
NODE_ENV: process.env.NODE_ENV || 'development',
PORT: parseInt(process.env.PORT) || 3001,
ANONYMOUS_NAME: process.env.ANONYMOUS_NAME || 'Anonymous',
DATA_DIR: process.env.DATA_DIR || '/app/data',
MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/iamafk',
// FURNITURE_EXPIRY_HOURS: parseInt(process.env.FURNITURE_EXPIRY_HOURS) || 168, // FURNITURE DESPAWNING DISABLED
DAILY_FURNITURE_LIMIT: parseInt(process.env.DAILY_FURNITURE_LIMIT) || 1000,
BATCH_INTERVAL: parseInt(process.env.BATCH_INTERVAL) || 5 * 60 * 1000,
PING_TIMEOUT: parseInt(process.env.PING_TIMEOUT) || 60000,
PING_INTERVAL: parseInt(process.env.PING_INTERVAL) || 25000,
LOG_LEVEL: process.env.LOG_LEVEL || 'info',
ENABLE_DEV_TOOLS: process.env.ENABLE_DEV_TOOLS === 'true'
;

// CORS configuration from environment
const allowedOrigins = process.env.CORS_ORIGIN 
? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
: ['http://localhost:3000', 'http://localhost:5173'];

const app = express();

// environment-based CORS configuration
app.use(cors({
origin: function (origin, callback) {
// allow requests with no origin (like mobile apps or curl requests)
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

// add CORS headers manually for Socket.IO
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
pingTimeout: SERVER_CONFIG.PING_TIMEOUT,
pingInterval: SERVER_CONFIG.PING_INTERVAL,
transports: ['websocket', 'polling'],
allowEIO3: true
);

// global state
let cursors = {;
let furniture = {;
let lastMoveTimestamps = {;
let pendingChanges = [];
let batchTimer = null;
let userActivity = {;
let userStats = {;
let allTimeRecord = { name: '', time: 0, lastUpdated: 0 ;
let jackpotRecord = { name: '', wins: 0, lastUpdated: 0, deviceId: '', lastWinner: '' ;

// gacha item pools
const GACHA_HATS = ['easteregg1', 'balloon', 'ffr', 'ghost', 'loading'];
const GACHA_FURNITURE = ['computer', 'tv', 'toilet', 'washingmachine', 'zuzu'];

// device ID to socket ID mapping for persistence
let deviceToSocketMap = {;
let socketToDeviceMap = {;

// load socket-to-device mapping from persistent storage
function loadSocketDeviceMapping() {

const mappingFile = path.join(SERVER_CONFIG.DATA_DIR, 'socket_device_mapping.json');
if (fs.existsSync(mappingFile)) {
const data = fs.readFileSync(mappingFile, 'utf8');
const parsed = JSON.parse(data);
socketToDeviceMap = parsed.socketToDeviceMap || {;
deviceToSocketMap = parsed.deviceToSocketMap || {;


// error handling for missing mapping file



// save socket-to-device mapping to persistent storage
function saveSocketDeviceMapping() {

const mappingFile = path.join(SERVER_CONFIG.DATA_DIR, 'socket_device_mapping.json');
const mappingData = {
socketToDeviceMap,
deviceToSocketMap,
lastUpdated: Date.now()
;
fs.writeFileSync(mappingFile, JSON.stringify(mappingData, null, 2));

console.error('Error saving socket-to-device mapping:', error);



// afk time tracking variables
let userAFKStartTimes = {; // when each user started being AFK
let lastAFKUpdateTimes = {; // last AFK time update for each user

// server afk time tracking
function updateUserAFKTime(socketId) {
const deviceId = socketToDeviceMap[socketId] || socketId;
const cursor = cursors[socketId];
const now = Date.now();

if (!cursor) return;

const isAFK = (cursor.stillTime >= 30 || cursor.isFrozen);
const wasAFK = userAFKStartTimes[deviceId] !== undefined;

// user just became AFK
if (isAFK && !wasAFK) {
userAFKStartTimes[deviceId] = now;
lastAFKUpdateTimes[deviceId] = now;


// user is no longer AFK
if (!isAFK && wasAFK) {
// only add the remaining time since the last update, not the entire duration
const timeSinceLastUpdate = now - lastAFKUpdateTimes[deviceId];
const remainingSeconds = Math.floor(timeSinceLastUpdate / 1000);
if (remainingSeconds > 0) {
addAFKTimeToUser(deviceId, remainingSeconds);

delete userAFKStartTimes[deviceId];
delete lastAFKUpdateTimes[deviceId];


// update AFK time every 60 seconds while AFK
if (isAFK && wasAFK) {
const timeSinceLastUpdate = now - lastAFKUpdateTimes[deviceId];
if (timeSinceLastUpdate >= 60000) { // 60 seconds
const incrementalTime = Math.floor(timeSinceLastUpdate / 1000);
addAFKTimeToUser(deviceId, incrementalTime);
lastAFKUpdateTimes[deviceId] = now;




// add AFK time to user stats
function addAFKTimeToUser(deviceId, seconds) {
const user = userStats[deviceId];
if (user) {
const oldTotal = user.totalAFKTime;
const oldBalance = user.afkBalance;

user.totalAFKTime += seconds;
user.afkBalance += seconds;
user.lastSeen = Date.now();

// add to batch for persistence
addToBatch('userStats', { socketId: deviceId, stats: user );

// check for new all-time record
if (user.username && user.username !== SERVER_CONFIG.ANONYMOUS_NAME) {
updateAllTimeRecord(deviceId, user.username, 0);

 else {
console.error(`❌ User not found for AFK time update: deviceId=${deviceId`);



// cache for badge calculations
let badgeCache = {;
let lastBadgeCalculation = 0;
const BADGE_CACHE_DURATION = 5000; // 5 seconds

// batch save system
const BATCH_INTERVAL = SERVER_CONFIG.BATCH_INTERVAL;

// furniture expiry configuration - disabled for now
// const FURNITURE_EXPIRY_HOURS = SERVER_CONFIG.FURNITURE_EXPIRY_HOURS;

// z-index management
let nextZIndex = 5000; // base z-index for furniture

// server-side user stats storage and validation
const DAILY_FURNITURE_LIMIT = SERVER_CONFIG.DAILY_FURNITURE_LIMIT;

// ensure data directory exists
if (SERVER_CONFIG.DATA_DIR !== '/app/data' || process.env.NODE_ENV === 'production') {
if (!fs.existsSync(SERVER_CONFIG.DATA_DIR)) {

fs.mkdirSync(SERVER_CONFIG.DATA_DIR, { recursive: true );

console.warn(`Could not create data directory ${SERVER_CONFIG.DATA_DIR:`, error.message);
// fallback to local directory for development
if (process.env.NODE_ENV === 'development') {
SERVER_CONFIG.DATA_DIR = './data';
if (!fs.existsSync(SERVER_CONFIG.DATA_DIR)) {
fs.mkdirSync(SERVER_CONFIG.DATA_DIR, { recursive: true );






function getNextZIndex() {
return nextZIndex++;


function updateZIndexFromFurniture() {
// find the highest z-index currently in use
let maxZIndex = 4999; // base z-index - 1
Object.values(furniture).forEach(item => {
if (item.zIndex && item.zIndex > maxZIndex) {
maxZIndex = item.zIndex;

);
nextZIndex = maxZIndex + 1;


async function loadPersistentData() {

// load furniture from MongoDB
const furnitureItems = await Furniture.find({);
furniture = {;
for (const item of furnitureItems) {
// convert MongoDB structure to client
furniture[item.id] = {
id: item.id,
type: item.type,
x: item.x,
y: item.y,
zIndex: item.zIndex,
isFlipped: item.isFlipped || false,
isOn: item.isOn || false,
timestamp: item.placedAt.getTime(),
ownerId: item.placedBy, 
ownerName: item.placedBy, 
placedBy: item.placedBy,
placedAt: item.placedAt.getTime(),
// expiresAt: item.expiresAt.getTime() // FURNITURE DESPAWNING DISABLED
;

console.log('Loaded furniture data from MongoDB:', Object.keys(furniture).length, 'items');
// update z-index counter from loaded furniture
updateZIndexFromFurniture();

console.error('Error loading furniture data from MongoDB:', error);



// load user activity from MongoDB
const activities = await UserActivity.find({);
userActivity = {;
for (const activity of activities) {
userActivity[activity.deviceId] = {
lastSeen: activity.lastActivity.getTime(),
username: activity.username,
socketId: activity.deviceId
;

console.log('Loaded user activity data from MongoDB:', Object.keys(userActivity).length, 'users');

console.error('Error loading user activity data from MongoDB:', error);



async function savePersistentData() {

// save furniture to MongoDB
for (const [id, item] of Object.entries(furniture)) {
// handle both old and new furniture structures
const placedBy = item.placedBy || item.ownerId || item.ownerName;
const placedAt = item.placedAt ? new Date(item.placedAt) : new Date(item.timestamp || Date.now());
// const expiresAt = item.expiresAt ? new Date(item.expiresAt) : new Date((item.timestamp || Date.now()) + 7 * 24 * 60 * 60 * 1000); // FURNITURE DESPAWNING DISABLED

await Furniture.findOneAndUpdate(
{ id ,
{
id,
type: item.type,
x: item.x,
y: item.y,
zIndex: item.zIndex,
isFlipped: item.isFlipped || false,
isOn: item.isOn || false,
placedBy: placedBy,
placedAt: placedAt,
// expiresAt: expiresAt // FURNITURE DESPAWNING DISABLED
,
{ upsert: true 
);


console.error('Error saving furniture data to MongoDB:', error);



// save user activity to MongoDB
for (const [deviceId, activity] of Object.entries(userActivity)) {
await UserActivity.findOneAndUpdate(
{ deviceId ,
{
deviceId,
username: activity.username,
lastActivity: new Date(activity.lastSeen)
,
{ upsert: true 
);


console.error('Error saving user activity data to MongoDB:', error);



function updateUserActivity(socketId, username) {
const now = Date.now();
userActivity[socketId] = {
lastSeen: now,
username: username || SERVER_CONFIG.ANONYMOUS_NAME,
socketId: socketId
;
addToBatch('userActivity', { socketId, username );


// function cleanupExpiredFurniture() {
// // FURNITURE DESPAWNING DISABLED
// // disabled to prevent furniture from despawning
// 

function getValidCursors() {
const filtered = {;
const now = Date.now();

// calculate daily badge once for all users
let dailyBest = { name: '', time: 0 ;
Object.values(cursors).forEach((c) => {
if (!c || !c.name || c.name === SERVER_CONFIG.ANONYMOUS_NAME) return;
const stillTime = c.stillTime || 0;
if (stillTime > dailyBest.time) {
dailyBest = { name: c.name, time: stillTime ;

);

// check if daily leader has changed (for cache invalidation)
const currentDailyLeader = badgeCache.dailyLeader || { name: '', time: 0 ;
const dailyLeaderChanged = dailyBest.name !== currentDailyLeader.name || dailyBest.time !== currentDailyLeader.time;

// only recalculate badges if cache is expired OR daily leader changed
const shouldRecalculateBadges = (now - lastBadgeCalculation) > BADGE_CACHE_DURATION || dailyLeaderChanged;

if (shouldRecalculateBadges) {
badgeCache = {;
lastBadgeCalculation = now;
badgeCache.dailyLeader = dailyBest; // store current daily leader for comparison

// cache badge calculations
Object.entries(cursors).forEach(([id, cursor]) => {
if (cursor.name && cursor.name.trim() !== '' && cursor.name !== SERVER_CONFIG.ANONYMOUS_NAME) {
const userBadges = {
dailyBadge: dailyBest.name === cursor.name && dailyBest.time > 0,
crownBadge: allTimeRecord.name === cursor.name,
gachaBadge: jackpotRecord.name === cursor.name
;
badgeCache[id] = userBadges;

);


Object.entries(cursors).forEach(([id, cursor]) => {
if (cursor.name && cursor.name.trim() !== '' && cursor.name !== SERVER_CONFIG.ANONYMOUS_NAME) {
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
const ONE_HOUR = 60 * 60 * 1000; // 1 hour
const FORTY_NINE_HOURS = 49 * 60 * 60 * 1000; // 49 hours

// remove entries older than 49 hours
for (const socketId in userActivity) {
if (now - userActivity[socketId].lastSeen > FORTY_NINE_HOURS) {
delete userActivity[socketId];


addToBatch('userActivity', null);


function cleanupOldUserStats() {
const now = Date.now();
const ONE_DAY = 24 * 60 * 60 * 1000; // 24 hours
const TWO_WEEKS = 14 * 24 * 60 * 60 * 1000; // 14 days

// clean up AFK tracking data older than 1 day
Object.keys(userAFKStartTimes).forEach(deviceId => {
const lastUpdate = lastAFKUpdateTimes[deviceId];
if (lastUpdate && (now - lastUpdate) > ONE_DAY) {
delete userAFKStartTimes[deviceId];
delete lastAFKUpdateTimes[deviceId];

);

// clean up deviceID mappings and user stats older than 2 weeks
const deviceIdsToRemove = [];

// check deviceID mappings for expiration
Object.entries(socketToDeviceMap).forEach(([socketId, deviceId]) => {
// if socket is not connected and device hasn't been seen in 2 weeks
if (!cursors[socketId] && userStats[deviceId]) {
const lastSeen = userStats[deviceId].lastSeen || 0;
if (now - lastSeen > TWO_WEEKS) {
deviceIdsToRemove.push(deviceId);
delete socketToDeviceMap[socketId];
delete deviceToSocketMap[deviceId];


);

// check user stats for expiration (deviceIDs not in mappings)
Object.keys(userStats).forEach(deviceId => {
const lastSeen = userStats[deviceId].lastSeen || 0;
if (now - lastSeen > TWO_WEEKS) {
deviceIdsToRemove.push(deviceId);
delete userStats[deviceId];

);

// remove duplicate deviceIDs
const uniqueDeviceIdsToRemove = [...new Set(deviceIdsToRemove)];

if (uniqueDeviceIdsToRemove.length > 0) {
console.log(`🧹 Cleaned up ${uniqueDeviceIdsToRemove.length expired deviceIDs and user stats after 2 weeks of inactivity`);
console.log(`📊 Removed deviceIDs: ${uniqueDeviceIdsToRemove.join(', ')`);

// save the updated mappings to persistent storage
saveSocketDeviceMapping();

// add to batch for user stats persistence
addToBatch('cleanup', { type: 'deviceIdCleanup', count: uniqueDeviceIdsToRemove.length );



// Manual cleanup function for testing/admin purposes
function manualCleanup() {
console.log('🧹 Manual cleanup triggered');
cleanupOldUserStats();
console.log('✅ Manual cleanup completed');


// gacha unlock helper functions
function unlockRandomGachaHat(deviceId) {
const user = userStats[deviceId];
if (!user) return null;

// start unlocked hats array if doesn't exist
if (!user.unlockedGachaHats) {
user.unlockedGachaHats = [];


// select random hat from pool
const randomHat = GACHA_HATS[Math.floor(Math.random() * GACHA_HATS.length)];

// add to unlocked hats (allows duplicates) with unlocker info
user.unlockedGachaHats.push({ item: randomHat, unlockedBy: user.username );
user.lastSeen = Date.now();

// add to batch for persistence
addToBatch('userStats', { socketId: deviceId, stats: user );

console.log(`Unlocked gacha hat for ${user.username: ${randomHat`);
return randomHat;


function unlockRandomGachaFurniture(deviceId) {
const user = userStats[deviceId];
if (!user) return null;

// start unlocked furniture array if doesn't exist
if (!user.unlockedGachaFurniture) {
user.unlockedGachaFurniture = [];


// select random furniture from pool
const randomFurniture = GACHA_FURNITURE[Math.floor(Math.random() * GACHA_FURNITURE.length)];

// add to unlocked furniture (allows duplicates) with unlocker info
user.unlockedGachaFurniture.push({ item: randomFurniture, unlockedBy: user.username );
user.lastSeen = Date.now();

// add to batch for persistence
addToBatch('userStats', { socketId: deviceId, stats: user );

console.log(`Unlocked gacha furniture for ${user.username: ${randomFurniture`);
return randomFurniture;


// unlock specific hat for all connected users
function unlockHatForAllUsers(hatType, unlockerName) {
console.log(`Unlocking hat '${hatType' for all connected users`);
// get all connected socket IDs
const connectedSocketIds = Object.keys(cursors);
connectedSocketIds.forEach(socketId => {
const deviceId = socketToDeviceMap[socketId] || socketId;
const user = userStats[deviceId];
if (user) {
// start unlocked hats array if doesn't exist
if (!user.unlockedGachaHats) {
user.unlockedGachaHats = [];

// only add if not already unlocked
const alreadyUnlocked = user.unlockedGachaHats.some(hat => {
if (typeof hat === 'string') return hat === hatType;
if (typeof hat === 'object' && hat.item) return hat.item === hatType;
return false;
);
if (!alreadyUnlocked) {
user.unlockedGachaHats.push({ item: hatType, unlockedBy: unlockerName );
user.lastSeen = Date.now();
// add to batch for persistence
addToBatch('userStats', { socketId: deviceId, stats: user );
console.log(`Unlocked hat '${hatType' for user ${user.username`);


);


// unlock specific furniture for all connected users
function unlockFurnitureForAllUsers(furnitureType, unlockerName) {
console.log(`Unlocking furniture '${furnitureType' for all connected users`);
// get all connected socket IDs
const connectedSocketIds = Object.keys(cursors);
connectedSocketIds.forEach(socketId => {
const deviceId = socketToDeviceMap[socketId] || socketId;
const user = userStats[deviceId];
if (user) {
if (!user.unlockedGachaFurniture) {
user.unlockedGachaFurniture = [];

const alreadyUnlocked = user.unlockedGachaFurniture.some(furniture => {
if (typeof furniture === 'string') return furniture === furnitureType;
if (typeof furniture === 'object' && furniture.item) return furniture.item === furnitureType;
return false;
);
if (!alreadyUnlocked) {
user.unlockedGachaFurniture.push({ item: furnitureType, unlockedBy: unlockerName );
user.lastSeen = Date.now();
// add to batch for persistence
addToBatch('userStats', { socketId: deviceId, stats: user );
console.log(`Unlocked furniture '${furnitureType' for user ${user.username`);


);


// start server with MongoDB connection
async function initializeServer() {

// connect to MongoDB
await connectDB();
console.log('✅ Connected to MongoDB');

// load data from MongoDB
await loadPersistentData();
await loadUserStats();
await loadAllTimeRecord();
await loadJackpotRecord();
loadSocketDeviceMapping();

// run initial cleanup to remove any expired data on startup
cleanupOldUserStats();

// recalculate jackpot record to ensure it's correct after loading user stats
recalculateJackpotRecord();

// start batch timer
startBatchTimer();

// clean up expired furniture every hour - DISABLED
// setInterval(cleanupExpiredFurniture, 60 * 60 * 1000);

// initial cleanup on startup - DISABLED
// cleanupExpiredFurniture();

// run cleanup every 1 hr
setInterval(cleanupOldUserActivity, 60 * 60 * 1000);

// run user stats cleanup every 24 hours
setInterval(cleanupOldUserStats, 24 * 60 * 60 * 1000);

console.log('✅ Server initialization completed');

console.error('❌ Server initialization failed:', error);
process.exit(1);



// initialize server
initializeServer();

// add change to batch instead of immediate save
function addToBatch(changeType, data) {
pendingChanges.push({ 
type: changeType, 
data, 
timestamp: Date.now() 
);


// save batch immediately
async function saveBatch() {
if (pendingChanges.length > 0) {
console.log(`Saving batch of ${pendingChanges.length changes`);

// process each change
pendingChanges.forEach(change => {
switch (change.type) {
case 'userActivity':
if (change.data) {
const { socketId, username  = change.data;
userActivity[socketId] = {
lastSeen: change.timestamp,
username: username || SERVER_CONFIG.ANONYMOUS_NAME,
socketId: socketId
;

break;
case 'furniture':
break;
case 'cleanup':
break;
case 'userStats':
const { socketId, stats  = change.data;
userStats[socketId] = stats;
break;
case 'allTimeRecord':
break;
case 'jackpotRecord':
break;

);

// save to MongoDB
await savePersistentData();
await saveUserStats();
await saveAllTimeRecord();
await saveJackpotRecord();
saveSocketDeviceMapping();

// clear batch
pendingChanges.length = 0;



// start batch timer
function startBatchTimer() {
if (batchTimer) {
clearInterval(batchTimer);

batchTimer = setInterval(saveBatch, BATCH_INTERVAL);


// stop batch timer and save immediately
async function stopBatchTimer() {
if (batchTimer) {
clearInterval(batchTimer);
batchTimer = null;

await saveBatch(); // save any pending changes


io.on('connection', (socket) => {
console.log(`🔌 New socket connection: ${socket.id`);

// initialize cursor for new user
cursors[socket.id] = { x: 0, y: 0, username: '', cursorType: 'default' ;
lastMoveTimestamps[socket.id] = Date.now();

// update user activity on connection
updateUserActivity(socket.id, SERVER_CONFIG.ANONYMOUS_NAME);

// send current state to new user
socket.emit('initialState', {
cursors: getValidCursors(),
furniture: furniture,
);

// notify other users about new connection
socket.broadcast.emit('clientConnected', { 
socketId: socket.id, 
cursor: cursors[socket.id] 
);

socket.on('setName', async ({ name ) => {
console.log(`👤 setName received for socket ${socket.id: "${name"`);

if (cursors[socket.id]) {
// validate username before setting it
const validation = await validateUsername(name);

if (!validation.isAppropriate) {
console.log(`❌ Username validation failed for "${name": ${validation.reason`);
// send error message to client
socket.emit('usernameError', { 
message: validation.reason || 'Username is not allowed' 
);
return;


const username = name?.trim() || SERVER_CONFIG.ANONYMOUS_NAME;
cursors[socket.id].name = username;

// update username in user stats for persistence
const deviceId = socketToDeviceMap[socket.id] || socket.id;
if (userStats[deviceId]) {
userStats[deviceId].username = username;
userStats[deviceId].lastSeen = Date.now();
addToBatch('userStats', { socketId: deviceId, stats: userStats[deviceId] );


// update user activity with the username
updateUserActivity(socket.id, username);

// send success response to client
socket.emit('usernameAccepted', { username );

console.log(`✅ Username accepted for socket ${socket.id: "${username"`);

// broadcast updated cursors to all clients
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

// all-time record is now checked when AFK time is updated, not here


if (name && name.trim() !== '') {
cursors[socket.id].name = name.trim();
// update user activity on movement
addToBatch('userActivity', { socketId: socket.id, username: name.trim() );



io.emit('cursors', getValidCursors());
);

// reset stillTime on client request (click/dblclick)
socket.on('resetStillTime', () => {
if (cursors[socket.id]) {
cursors[socket.id].stillTime = 0;
lastMoveTimestamps[socket.id] = Date.now();
// update user activity on interaction
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

const furnitureId = `${socket.id-${Date.now()`;
const now = Date.now();

// create furniture with timestamp for persistence and z-index
furniture[furnitureId] = {
id: furnitureId,
type: data.type,
x: data.x || 0,
y: data.y || 0,
isFlipped: false,
timestamp: now,
ownerId: socket.id,
ownerName: cursors[socket.id]?.name || SERVER_CONFIG.ANONYMOUS_NAME,
zIndex: getNextZIndex() // Assign z-index from server
;

// save to persistent storage
addToBatch('furniture', furniture[furnitureId]);

// broadcast to all clients including sender
io.emit('furnitureSpawned', furniture[furnitureId]);
);

socket.on('updateFurniturePosition', (data) => {
const { furnitureId, x, y, isFlipped  = data;
if (furniture[furnitureId]) {
furniture[furnitureId].x = x;
furniture[furnitureId].y = y;
if (typeof isFlipped === 'boolean') {
furniture[furnitureId].isFlipped = isFlipped;

// update timestamp when furniture is moved
furniture[furnitureId].timestamp = Date.now();
// save to persistent storage
addToBatch('furniture', furniture[furnitureId]);
// broadcast to all clients including sender
const broadcastData = { 
id: furnitureId, 
x, 
y,
isFlipped: furniture[furnitureId].isFlipped 
;
io.emit('furnitureMoved', broadcastData);

);

socket.on('flipFurniture', (data) => {
const { furnitureId  = data;
if (furniture[furnitureId]) {
// toggle the flipped state
furniture[furnitureId].isFlipped = !furniture[furnitureId].isFlipped;

// update timestamp when furniture is flipped
furniture[furnitureId].timestamp = Date.now();

// save to persistent storage
addToBatch('furniture', furniture[furnitureId]);

// broadcast to all clients including sender
io.emit('furnitureFlipped', { 
id: furnitureId, 
isFlipped: furniture[furnitureId].isFlipped 
);

);

socket.on('toggleFurnitureState', (data) => {
const { furnitureId  = data;
if (furniture[furnitureId]) {
// toggle the on/off state
furniture[furnitureId].isOn = !furniture[furnitureId].isOn;

// update timestamp when furniture state is toggled
furniture[furnitureId].timestamp = Date.now();

// save to persistent storage
addToBatch('furniture', furniture[furnitureId]);

// broadcast to all clients including sender
io.emit('furnitureStateToggled', { 
id: furnitureId, 
isOn: furniture[furnitureId].isOn 
);

);

socket.on('updateFurnitureZIndex', (data) => {
const { furnitureId, zIndex  = data;
if (furniture[furnitureId]) {
furniture[furnitureId].zIndex = zIndex;

// update timestamp when furniture z-index is changed
furniture[furnitureId].timestamp = Date.now();

// save to persistent storage
addToBatch('furniture', furniture[furnitureId]);

// broadcast to all clients including sender
io.emit('furnitureZIndexChanged', { 
id: furnitureId, 
zIndex: furniture[furnitureId].zIndex 
);

);

socket.on('moveFurnitureUp', (data) => {
const { furnitureId  = data;
if (furniture[furnitureId]) {
// find the furniture with the next higher z-index
const currentZIndex = furniture[furnitureId].zIndex || 100;
let targetFurniture = null;
let minHigherZIndex = Infinity;

Object.values(furniture).forEach(item => {
if (item.zIndex > currentZIndex && item.zIndex < minHigherZIndex) {
minHigherZIndex = item.zIndex;
targetFurniture = item;

);

if (targetFurniture) {
// swap z-indices
const tempZIndex = furniture[furnitureId].zIndex;
furniture[furnitureId].zIndex = targetFurniture.zIndex;
targetFurniture.zIndex = tempZIndex;

// update timestamps
furniture[furnitureId].timestamp = Date.now();
targetFurniture.timestamp = Date.now();

// save to persistent storage
addToBatch('furniture', furniture[furnitureId]);
addToBatch('furniture', targetFurniture);

// broadcast to ALL clients
io.emit('furnitureZIndexChanged', [
{ id: furnitureId, zIndex: furniture[furnitureId].zIndex ,
{ id: targetFurniture.id, zIndex: targetFurniture.zIndex 
]);


);

socket.on('moveFurnitureDown', (data) => {
const { furnitureId  = data;
if (furniture[furnitureId]) {
// find the furniture with the next lower z-index
const currentZIndex = furniture[furnitureId].zIndex || 100;
let targetFurniture = null;
let maxLowerZIndex = -Infinity;

Object.values(furniture).forEach(item => {
if (item.zIndex < currentZIndex && item.zIndex > maxLowerZIndex) {
maxLowerZIndex = item.zIndex;
targetFurniture = item;

);

if (targetFurniture) {
// swap z-indices
const tempZIndex = furniture[furnitureId].zIndex;
furniture[furnitureId].zIndex = targetFurniture.zIndex;
targetFurniture.zIndex = tempZIndex;

// update timestamps
furniture[furnitureId].timestamp = Date.now();
targetFurniture.timestamp = Date.now();

// save to persistent storage
addToBatch('furniture', furniture[furnitureId]);
addToBatch('furniture', targetFurniture);

// broadcast to all clients
io.emit('furnitureZIndexChanged', [
{ id: furnitureId, zIndex: furniture[furnitureId].zIndex ,
{ id: targetFurniture.id, zIndex: targetFurniture.zIndex 
]);


);

socket.on('deleteFurniture', (furnitureId) => {
if (furniture[furnitureId]) {
delete furniture[furnitureId];
// save to persistent storage
addToBatch('furniture', null);
io.emit('furnitureDeleted', { id: furnitureId );

);

socket.on('cursorFreeze', ({ isFrozen, x, y, sleepingOnBed ) => {
if (cursors[socket.id]) {
// update the cursor's frozen state
cursors[socket.id].isFrozen = isFrozen;
cursors[socket.id].sleepingOnBed = sleepingOnBed;

if (isFrozen) {
// store the frozen position when freezing
cursors[socket.id].frozenPosition = { x, y ;
 else {
// remove frozen position when unfreezing
delete cursors[socket.id].frozenPosition;
delete cursors[socket.id].sleepingOnBed;


// broadcast to all clients that this cursor is frozen/unfrozen
io.emit('cursorFrozen', { 
id: socket.id, 
isFrozen,
frozenPosition: cursors[socket.id].frozenPosition,
sleepingOnBed: cursors[socket.id].sleepingOnBed
);

// update the cursors state for all clients
io.emit('cursors', getValidCursors());

);

socket.on('changeCursor', ({ type ) => {
if (cursors[socket.id]) {
// update the cursor type
cursors[socket.id].cursorType = type;
// broadcast the cursor change to all clients
io.emit('cursorChanged', { id: socket.id, type );
// update the cursors state for all clients
io.emit('cursors', getValidCursors());

);

socket.on('gachaponWin', ({ winnerId, winnerName ) => {
console.log('Server received gachaponWin (hat):', { winnerId, winnerName );

// get device ID for the winner
const deviceId = socketToDeviceMap[winnerId] || winnerId;

// update user stats with gachapon win using device ID
if (userStats[deviceId]) {
userStats[deviceId].gachaponWins = (userStats[deviceId].gachaponWins || 0) + 1;
userStats[deviceId].lastSeen = Date.now();
addToBatch('userStats', { socketId: deviceId, stats: userStats[deviceId] );


// unlock random gacha hat for winner first
const unlockedHat = unlockRandomGachaHat(deviceId);

// unlock the same hat for ALL connected users
if (unlockedHat) {
unlockHatForAllUsers(unlockedHat, winnerName);


// update jackpot record using device ID
updateJackpotRecord(winnerId, winnerName);

// store the last winner in the jackpot record
jackpotRecord.lastWinner = winnerName;
addToBatch('jackpotRecord', jackpotRecord);

// broadcast to all currently online clients
io.emit('gachaponWin', { winnerId, winnerName, unlockedItem: unlockedHat, type: 'hat' );
io.emit('showDialogBanner', { winnerName, unlockedItem: unlockedHat, type: 'hat' );
console.log('Server broadcasted gachaponWin (hat) to all clients');
);

socket.on('furnitureGachaponWin', ({ winnerId, winnerName ) => {
console.log('Server received furnitureGachaponWin:', { winnerId, winnerName );

// get device ID for the winner
const deviceId = socketToDeviceMap[winnerId] || winnerId;

// update user stats with furniture gachapon win using device ID
if (userStats[deviceId]) {
userStats[deviceId].furnitureGachaponWins = (userStats[deviceId].furnitureGachaponWins || 0) + 1;
userStats[deviceId].lastSeen = Date.now();
addToBatch('userStats', { socketId: deviceId, stats: userStats[deviceId] );


// unlock random gacha furniture for winner first
const unlockedFurniture = unlockRandomGachaFurniture(deviceId);

// unlock the same furniture for ALL connected users
if (unlockedFurniture) {
unlockFurnitureForAllUsers(unlockedFurniture, winnerName);


// broadcast to all currently online clients
io.emit('furnitureGachaponWin', { winnerId, winnerName, unlockedItem: unlockedFurniture, type: 'furniture' );
io.emit('showDialogBanner', { winnerName, unlockedItem: unlockedFurniture, type: 'furniture' );
console.log('Server broadcasted furnitureGachaponWin to all clients');
);

socket.on('gachaponAnimation', ({ userId, hasEnoughTime ) => {
// broadcast the animation event to all clients except the sender
socket.broadcast.emit('gachaponAnimation', { userId, hasEnoughTime );
);

socket.on('furnitureGachaponAnimation', ({ userId, hasEnoughTime ) => {
// broadcast the furniture animation event to all clients except the sender
socket.broadcast.emit('furnitureGachaponAnimation', { userId, hasEnoughTime );
);

// server-side user stats handlers
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

socket.on('deductAFKBalance', ({ seconds , callback) => {
const result = deductAFKBalanceOnServer(socket.id, seconds);
callback(result);
);

socket.on('addAFKTime', ({ seconds , callback) => {
const result = addAFKTimeOnServer(socket.id, seconds);
callback(result);
);

socket.on('recordFurniturePlacement', ({ type , callback) => {
const result = recordFurniturePlacementOnServer(socket.id, type);
callback(result);
);

// admin function for manual cleanup
socket.on('triggerCleanup', () => {
console.log(`🧹 Manual cleanup triggered by socket ${socket.id`);
manualCleanup();
socket.emit('cleanupCompleted', { message: 'Manual cleanup completed' );
);

socket.on('furnitureSelected', (data) => {
// handled by the client-side FurniturePresetPanel
);

socket.on('saveFurniturePreset', ({ slotIndex, preset ) => {

const deviceId = socketToDeviceMap[socket.id] || socket.id;
const user = userStats[deviceId];

if (user) {
// initialize furniturePresets array if it doesn't exist
if (!user.furniturePresets) {
user.furniturePresets = [];


// update or add preset to the specified slot - only 1 for now
preset.id = `slot_${slotIndex_${Date.now()`;
user.furniturePresets[slotIndex] = preset;
user.lastSeen = Date.now();

// add to batch for persistence
addToBatch('userStats', { socketId: deviceId, stats: user );

console.log(`💾 Saved furniture preset for ${user.username in slot ${slotIndex + 1`);
socket.emit('furniturePresetSaved', { slotIndex, preset );


console.error('Error saving furniture preset:', error);
socket.emit('error', { message: 'Failed to save furniture preset' );

);

socket.on('deleteFurniturePreset', ({ slotIndex ) => {

const deviceId = socketToDeviceMap[socket.id] || socket.id;
const user = userStats[deviceId];

if (user && user.furniturePresets) {
delete user.furniturePresets[slotIndex];
// Note: daily preset usage is not reset when preset is deleted - it resets daily
user.lastSeen = Date.now();
// add to batch for persistence
addToBatch('userStats', { socketId: deviceId, stats: user );

console.log(`🗑️ Deleted furniture preset for ${user.username from slot ${slotIndex + 1 and reset usage count`);
socket.emit('furniturePresetDeleted', { slotIndex );


console.error('Error deleting furniture preset:', error);
socket.emit('error', { message: 'Failed to delete furniture preset' );

);

socket.on('placeFurniturePreset', ({ preset, x, y ) => {

const deviceId = socketToDeviceMap[socket.id] || socket.id;
const user = getUserStatsFromServer(socket.id);

// Check preset usage limit (daily reset)
const today = new Date().toISOString().split('T')[0];
const dailyPresetUsage = user.dailyPresetUsage?.[today] || 0;
const PRESET_USAGE_LIMIT = 10;

if (dailyPresetUsage >= PRESET_USAGE_LIMIT) {
console.log(`🚫 Daily preset usage limit reached for ${user.username (${dailyPresetUsage/${PRESET_USAGE_LIMIT)`);
socket.emit('presetUsageLimitReached', { 
message: `Sorry, you put down too many presets, try again tomorrow o-o`,
currentCount: dailyPresetUsage,
limit: PRESET_USAGE_LIMIT
);
return;


console.log(`🏠 Placing furniture preset at (${x, ${y) for ${user.username (${dailyPresetUsage + 1/${PRESET_USAGE_LIMIT)`);

// place each furniture item from the preset
preset.furniture.forEach((item, index) => {
const furnitureId = `preset_${socket.id_${Date.now()_${Math.random().toString(36).substr(2, 9)_${index`;
const adjustedX = x + item.x;
const adjustedY = y + item.y;

// add furniture to the global furniture state
furniture[furnitureId] = {
id: furnitureId,
type: item.type,
x: adjustedX,
y: adjustedY,
zIndex: item.zIndex || getNextZIndex(),
isFlipped: item.isFlipped || false,
isOn: item.isOn || false,
placedBy: socketToDeviceMap[socket.id] || socket.id,
timestamp: Date.now()
;

// record furniture placement for the user
recordFurniturePlacementOnServer(socket.id, item.type);
);

// increment daily preset usage count
if (!user.dailyPresetUsage) {
user.dailyPresetUsage = {;

user.dailyPresetUsage[today] = dailyPresetUsage + 1;
user.lastSeen = Date.now();

// save to persistent storage
addToBatch('userStats', { socketId: deviceId, stats: user );

// broadcast the new furniture to all clients
io.emit('furniture', furniture);

// notify the user of successful placement
socket.emit('presetPlaced', { 
message: `Preset placed! (${user.dailyPresetUsage[today]/${PRESET_USAGE_LIMIT uses)`,
currentCount: user.dailyPresetUsage[today],
limit: PRESET_USAGE_LIMIT
);

console.log(`✅ Placed furniture preset with ${preset.furniture.length items for ${user.username`);

console.error('Error placing furniture preset:', error);
socket.emit('error', { message: 'Failed to place furniture preset' );

);

socket.on('disconnect', () => {
// save any pending changes immediately when user disconnects
saveBatch();

// clean up user stats
cleanupOldUserStats();

// remove cursor
delete cursors[socket.id];
delete lastMoveTimestamps[socket.id];

// notify other clients
io.emit('clientDisconnected', socket.id);
);

// handle device ID setup immediately on connection
socket.on('setDeviceId', ({ deviceId ) => {
if (deviceId) {
deviceToSocketMap[deviceId] = socket.id;
socketToDeviceMap[socket.id] = deviceId;

// save the mapping to persistent storage
saveSocketDeviceMapping();

console.log('Device ID mapped:', deviceId, '->', socket.id);

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


// update AFK time for this user
updateUserAFKTime(id);

);

if (updated) {
io.emit('cursors', getValidCursors());

, 1000);

// shutdown handlers
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

const PORT = SERVER_CONFIG.PORT;
server.listen(PORT, '0.0.0.0', () => {
console.log(`Server running on port ${PORT`);
);

// get user stats from server storage
function getUserStatsFromServer(socketId) {
const deviceId = socketToDeviceMap[socketId] || socketId;
const user = userStats[deviceId];
if (!user) {
// initialize new user stats
const newUser = {
username: cursors[socketId]?.name || SERVER_CONFIG.ANONYMOUS_NAME,
totalAFKTime: 0,
afkBalance: 0,
furniturePlaced: 0,
furnitureByType: {,
lastSeen: Date.now(),
firstSeen: Date.now(),
sessions: 1,
dailyFurniturePlacements: {,
unlockedGachaHats: [],
unlockedGachaFurniture: [],
furniturePresets: [], // array of furniture presets
dailyPresetUsage: { // daily preset usage tracking
;
userStats[deviceId] = newUser;
return newUser;

// new fields for existing users
if (!user.unlockedGachaHats) {
user.unlockedGachaHats = [];

if (!user.unlockedGachaFurniture) {
user.unlockedGachaFurniture = [];

return user;


// deduct AFK balance on server 
function deductAFKBalanceOnServer(socketId, seconds) {

const deviceId = socketToDeviceMap[socketId] || socketId;
const user = userStats[deviceId];

if (user && user.afkBalance >= seconds) {
user.afkBalance -= seconds;
user.lastSeen = Date.now();

// add to batch for persistence
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



// add AFK time on server (for testing)
function addAFKTimeOnServer(socketId, seconds) {

const deviceId = socketToDeviceMap[socketId] || socketId;
const user = userStats[deviceId];

if (user) {
user.totalAFKTime += seconds;
user.afkBalance += seconds;
user.lastSeen = Date.now();

// add to batch for persistence
addToBatch('userStats', { socketId: deviceId, stats: user );

console.log(`Added AFK time for ${user.username: +${secondss (Total: ${user.totalAFKTimes, Balance: ${user.afkBalances)`);
return { success: true ;
 else {
console.error('User not found for AFK time addition:', socketId);
return { success: false, error: 'User not found' ;


console.error('Error adding AFK time:', error);
return { success: false, error: 'Server error' ;



// clean up user stats when user disconnects
function cleanupUserStats(socketId) {
// only remove from memory if user fully disconnected
if (!cursors[socketId]) {
const deviceId = socketToDeviceMap[socketId];
if (deviceId) {
delete socketToDeviceMap[socketId];
delete deviceToSocketMap[deviceId];
delete userAFKStartTimes[deviceId];
delete lastAFKUpdateTimes[deviceId];

saveSocketDeviceMapping();




// record furniture placement on server
function recordFurniturePlacementOnServer(socketId, type) {
if (typeof type !== 'string' || !type.trim()) {
return { success: false, error: 'Invalid furniture type' ;


const deviceId = socketToDeviceMap[socketId] || socketId;
const user = getUserStatsFromServer(socketId);
const today = new Date().toISOString().split('T')[0];
const dailyPlacements = user.dailyFurniturePlacements[today] || 0;

// check daily limit
if (dailyPlacements >= DAILY_FURNITURE_LIMIT) {
return { success: false, error: 'Daily furniture placement limit reached' ;


// ipdate stats
user.dailyFurniturePlacements[today] = dailyPlacements + 1;
user.furniturePlaced += 1;
user.furnitureByType[type] = (user.furnitureByType[type] || 0) + 1;
user.lastSeen = Date.now();

// save to persistent storage
addToBatch('userStats', { socketId: deviceId, stats: user );

return { success: true ;


async function loadUserStats() {

const users = await User.find({);
userStats = {;
for (const user of users) {
// helper function to safely convert MongoDB Map to regular object
const convertMapToObject = (mapField) => {
if (!mapField) return {;
if (mapField instanceof Map) {
return Object.fromEntries(mapField);

if (typeof mapField === 'object' && mapField !== null) {
return mapField;

return {;
;

userStats[user.deviceId] = {
username: user.username,
totalAFKTime: user.totalAFKTime,
afkBalance: user.afkBalance,
furniturePlaced: user.furniturePlaced || 0,
furnitureByType: convertMapToObject(user.furnitureByType),
lastSeen: user.lastSeen.getTime(),
firstSeen: user.firstSeen ? user.firstSeen.getTime() : Date.now(),
sessions: user.sessions || 1,
dailyFurniturePlacements: convertMapToObject(user.dailyFurniturePlacements),
unlockedHats: user.unlockedHats || [],
unlockedFurniture: user.unlockedFurniture || [],
gachaHats: user.gachaHats || [],
gachaFurniture: user.gachaFurniture || [],
unlockedGachaHats: user.unlockedGachaHats || [],
unlockedGachaFurniture: user.unlockedGachaFurniture || [],
furniturePresets: user.furniturePresets || [],
dailyPresetUsage: convertMapToObject(user.dailyPresetUsage),
dailyFurnitureCount: user.dailyFurnitureCount || 0,
lastDailyReset: user.lastDailyReset ? user.lastDailyReset.getTime() : Date.now()
;

console.log('Loaded user stats data from MongoDB:', Object.keys(userStats).length, 'users');

console.error('Error loading user stats data from MongoDB:', error);
console.log('Starting with fresh user stats');



async function saveUserStats() {

for (const [deviceId, stats] of Object.entries(userStats)) {
// helper function to safely convert regular object to MongoDB Map
const convertObjectToMap = (obj) => {
if (!obj || typeof obj !== 'object') return new Map();
const map = new Map();
Object.entries(obj).forEach(([key, value]) => {
map.set(key, value);
);
return map;
;

await User.findOneAndUpdate(
{ deviceId ,
{
deviceId,
username: stats.username,
totalAFKTime: stats.totalAFKTime,
afkBalance: stats.afkBalance,
furniturePlaced: stats.furniturePlaced || 0,
furnitureByType: convertObjectToMap(stats.furnitureByType),
lastSeen: new Date(stats.lastSeen),
firstSeen: new Date(stats.firstSeen || stats.lastSeen),
sessions: stats.sessions || 1,
dailyFurniturePlacements: convertObjectToMap(stats.dailyFurniturePlacements),
unlockedHats: stats.unlockedHats || [],
unlockedFurniture: stats.unlockedFurniture || [],
gachaHats: stats.gachaHats || [],
gachaFurniture: stats.gachaFurniture || [],
unlockedGachaHats: stats.unlockedGachaHats || [],
unlockedGachaFurniture: stats.unlockedGachaFurniture || [],
furniturePresets: stats.furniturePresets || [],
dailyPresetUsage: convertObjectToMap(stats.dailyPresetUsage),
dailyFurnitureCount: stats.dailyFurnitureCount || 0,
lastDailyReset: new Date(stats.lastDailyReset || Date.now())
,
{ upsert: true 
);


console.error('Error saving user stats data to MongoDB:', error);



// load user stats on startup
loadUserStats();

// save user stats periodically
setInterval(saveUserStats, 60000); // save every minute

async function loadAllTimeRecord() {

const record = await Record.findOne({ type: 'allTime' );
if (record) {
allTimeRecord.name = record.name;
allTimeRecord.time = record.value;
allTimeRecord.lastUpdated = record.lastUpdated.getTime();
console.log('Loaded all-time record from MongoDB:', allTimeRecord.name, 'with', allTimeRecord.time, 'seconds');


console.error('Error loading all-time record from MongoDB:', error);



async function saveAllTimeRecord() {

await Record.findOneAndUpdate(
{ type: 'allTime' ,
{
type: 'allTime',
name: allTimeRecord.name,
value: allTimeRecord.time,
lastUpdated: new Date(allTimeRecord.lastUpdated)
,
{ upsert: true 
);

console.error('Error saving all-time record to MongoDB:', error);



function updateAllTimeRecord(socketId, username, stillTime) {
// get device ID for this socket, fallback to socket ID if no device ID
const deviceId = socketToDeviceMap[socketId] || socketId;

// get user's total AFK time instead of current session stillTime
const userTotalAFKTime = userStats[deviceId]?.totalAFKTime || 0;

if (userTotalAFKTime > allTimeRecord.time) {
allTimeRecord.name = username;
allTimeRecord.time = userTotalAFKTime;
allTimeRecord.lastUpdated = Date.now();

// add to batch instead of immediate save
addToBatch('allTimeRecord', allTimeRecord);

// broadcast to all clients
io.emit('allTimeRecordUpdated', allTimeRecord);

console.log('New all-time record set by', username, 'with', userTotalAFKTime, 'seconds (total AFK time)');
return true;

return false;


async function loadJackpotRecord() {

const record = await Record.findOne({ type: 'jackpot' );
if (record) {
jackpotRecord.name = record.name;
jackpotRecord.wins = record.value;
jackpotRecord.deviceId = record.deviceId;
jackpotRecord.lastWinner = record.lastWinner;
jackpotRecord.lastUpdated = record.lastUpdated.getTime();
console.log('Loaded jackpot record from MongoDB:', jackpotRecord.name, 'with', jackpotRecord.wins, 'wins');


console.error('Error loading jackpot record from MongoDB:', error);



async function saveJackpotRecord() {

await Record.findOneAndUpdate(
{ type: 'jackpot' ,
{
type: 'jackpot',
name: jackpotRecord.name,
value: jackpotRecord.wins,
deviceId: jackpotRecord.deviceId,
lastWinner: jackpotRecord.lastWinner,
lastUpdated: new Date(jackpotRecord.lastUpdated)
,
{ upsert: true 
);

console.error('Error saving jackpot record to MongoDB:', error);



function updateJackpotRecord(socketId, username) {
// get device ID for this socket, fallback to socket ID if no device ID
const deviceId = socketToDeviceMap[socketId] || socketId;

// get current user wins (the win has already been recorded)
const currentUserWins = userStats[deviceId]?.gachaponWins || 0;

// check if this device already has the record
if (jackpotRecord.deviceId === deviceId) {
// update existing record
jackpotRecord.wins = currentUserWins;
jackpotRecord.name = username; // update username in case it changed
 else {
// check if this device has more wins than current record
if (currentUserWins > jackpotRecord.wins) {
jackpotRecord.deviceId = deviceId;
jackpotRecord.name = username;
jackpotRecord.wins = currentUserWins;



jackpotRecord.lastUpdated = Date.now();

// add to batch instead of immediate save
addToBatch('jackpotRecord', jackpotRecord);

// broadcast to all clients
io.emit('jackpotRecordUpdated', jackpotRecord);

console.log('Jackpot record updated:', jackpotRecord.name, 'now has', jackpotRecord.wins, 'wins');
return true;


function recalculateJackpotRecord() {
// find the device with the most gachapon wins
let maxWins = 0;
let topDevice = null;
let topUsername = '';

Object.entries(userStats).forEach(([deviceId, stats]) => {
const wins = stats.gachaponWins || 0;
if (wins > maxWins) {
maxWins = wins;
topDevice = deviceId;
topUsername = stats.username || SERVER_CONFIG.ANONYMOUS_NAME;

);

if (topDevice && maxWins > 0) {
jackpotRecord.deviceId = topDevice;
jackpotRecord.name = topUsername;
jackpotRecord.wins = maxWins;
jackpotRecord.lastUpdated = Date.now();

// save to batch for persistence
addToBatch('jackpotRecord', jackpotRecord);

// broadcast to all clients
io.emit('jackpotRecordUpdated', jackpotRecord);

console.log('Recalculated jackpot record:', topUsername, 'with', maxWins, 'wins');


