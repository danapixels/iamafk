import React, { useEffect, useRef, useState  from 'react';
import { io, Socket  from 'socket.io-client';
import './App.css';
import Panel from './Panel';

interface CursorData {
x: number;
y: number;
name?: string;
stillTime: number;
cursorType?: string;


interface CursorsMap {
[socketId: string]: CursorData;


interface Heart {
id: string;
x: number;
y: number;
timestamp: number;


interface Circle {
id: string;
x: number;
y: number;
timestamp: number;


interface Chair {
id: string;
x: number;
y: number;


interface Furniture {
id: string;
type: string;
x: number;
y: number;
zIndex?: number;


interface PanelProps {
socket: Socket | null;
onCursorChange: (type: string) => void;
isDeleteMode: boolean;
onDeleteModeChange: (isDeleteMode: boolean) => void;
isDeleteButtonHovered: boolean;


const FURNITURE_IMAGES: { [key: string]: string  = {
chair: './UI/chair.png',
lamp: './UI/lamp.png',
bed: './UI/bed.png',
walls: './UI/walls1.png',
plant1: './UI/plant1.png',
plant2: './UI/plant2.png',
blackcat: './UI/blackcat.png',
whitecat: './UI/whitecat.png'
;

function App() {
const [cursors, setCursors] = useState<CursorsMap>({);
const [hearts, setHearts] = useState<Heart[]>([]);
const [circles, setCircles] = useState<Circle[]>([]);
const [chairs, setChairs] = useState<{ [key: string]: Chair >({);
const [furniture, setFurniture] = useState<{ [key: string]: Furniture >({);
const [isDeleteMode, setIsDeleteMode] = useState(false);
const socketRef = useRef<Socket | null>(null);
const heartCounterRef = useRef(0);
const circleCounterRef = useRef(0);
const dragStartPos = useRef<{ x: number; y: number  | null>(null);
const draggedChairId = useRef<string | null>(null);
const draggedFurnitureId = useRef<string | null>(null);

const [username, setUsername] = useState('');
const usernameRef = useRef(username);
const [hasConnected, setHasConnected] = useState(false);
const clickEnabledTimeRef = useRef<number | null>(null);
const [cursorType, setCursorType] = useState<string>('default');
const [isDeleteButtonHovered, setIsDeleteButtonHovered] = useState(false);
const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null);
const [furnitureZIndices, setFurnitureZIndices] = useState<{ [key: string]: number >({);
const furnitureRefs = useRef<{ [key: string]: HTMLImageElement | null >({);

const HEART_DURATION = 800;
const CIRCLE_DURATION = 600;

useEffect(() => {
usernameRef.current = username;
, [username]);

useEffect(() => {
const socket = io('http://localhost:3001');
socketRef.current = socket;

socket.on('connect', () => {
console.log('✅ Connected with id:', socket.id);
);

socket.on('disconnect', () => {
console.log('❌ Disconnected');
setHasConnected(false);
setCursors({);
setHearts([]);
setCircles([]);
);

socket.on('cursors', (newCursors: CursorsMap) => {
setCursors(newCursors);
);

socket.on('heartSpawned', (heartData) => {
setHearts((prev) => [...prev, { ...heartData, timestamp: Date.now() ]);
);

socket.on('circleSpawned', (circleData) => {
setCircles((prev) => [...prev, { ...circleData, timestamp: Date.now() ]);
);

socket.on('clientDisconnected', (id: string) => {
setCursors((prev) => {
const newCursors = { ...prev ;
delete newCursors[id];
return newCursors;
);
);

socket.on('cursorChanged', (data: { id: string; type: string ) => {
console.log('Cursor changed:', data.id, 'to type:', data.type);
setCursors((prev) => {
const newCursors = {
...prev,
[data.id]: {
...prev[data.id],
cursorType: data.type,
,
;
console.log('Updated cursors:', newCursors);
return newCursors;
);
if (data.id === socket.id) {
console.log('Updating local cursor type to:', data.type);
setCursorType(data.type);

);

socket.on('initialState', (data: { cursors: CursorsMap, chairs: { [key: string]: Chair , furniture: { [key: string]: Furniture  ) => {
console.log('Received initial state');
setCursors(data.cursors);
setChairs(data.chairs);
setFurniture(data.furniture);
);

socket.on('clientConnected', (data: { id: string, cursors: CursorsMap ) => {
console.log('Client connected:', data.id);
setCursors(data.cursors);
);

socket.on('chairSpawned', (chair: Chair) => {
console.log('Chair spawned');
const initialChair = {
...chair,
x: window.innerWidth / 2,
y: window.innerHeight / 2
;

setChairs(prev => ({
...prev,
[chair.id]: initialChair
));

if (socketRef.current) {
socketRef.current.emit('updateChairPosition', {
chairId: chair.id,
x: initialChair.x,
y: initialChair.y
);

);

socket.on('chairMoved', (data: { id: string, x: number, y: number ) => {
setChairs(prev => ({
...prev,
[data.id]: { ...prev[data.id], x: data.x, y: data.y 
));
);

socket.on('chairDeleted', (data: { id: string ) => {
setChairs(prev => {
const newChairs = { ...prev ;
delete newChairs[data.id];
return newChairs;
);
);

socket.on('syncChairs', (chairs: { [key: string]: Chair ) => {
console.log('Received initial chair sync:', chairs);
setChairs(chairs);
);

socket.on('furnitureSpawned', (furniture: Furniture) => {
console.log('Furniture spawned:', furniture.type);
// Set initial position to center of viewport for the spawning user
const initialFurniture = {
...furniture,
x: window.innerWidth / 2,
y: window.innerHeight / 2
;

// Update local state
setFurniture(prev => ({
...prev,
[furniture.id]: initialFurniture
));

// Send initial position to server
if (socketRef.current) {
socketRef.current.emit('updateFurniturePosition', {
furnitureId: furniture.id,
x: initialFurniture.x,
y: initialFurniture.y
);

);

socket.on('furnitureMoved', (data: { id: string, x: number, y: number ) => {
setFurniture(prev => ({
...prev,
[data.id]: { ...prev[data.id], x: data.x, y: data.y 
));
);

socket.on('furnitureDeleted', (data: { id: string ) => {
setFurniture(prev => {
const newFurniture = { ...prev ;
delete newFurniture[data.id];
return newFurniture;
);
);

const handleMouseMove = (e: MouseEvent) => {
if (!socket.connected) return;
socket.emit('cursorMove', {
x: e.clientX,
y: e.clientY,
name: usernameRef.current.trim(),
);
;

window.addEventListener('mousemove', handleMouseMove);

return () => {
window.removeEventListener('mousemove', handleMouseMove);
socket.disconnect();
socket.off('initialState');
socket.off('clientConnected');
socket.off('chairSpawned');
socket.off('chairMoved');
socket.off('chairDeleted');
;
, []);

useEffect(() => {
const handleClick = (e: MouseEvent) => {
const now = Date.now();
if (
!socketRef.current?.connected ||
!hasConnected ||
(clickEnabledTimeRef.current !== null && now < clickEnabledTimeRef.current)
) {
return;


socketRef.current.emit('resetStillTime');

const circleId = `${socketRef.current.id-${now-${++circleCounterRef.current`;
socketRef.current.emit('spawnCircle', {
x: e.clientX,
y: e.clientY,
id: circleId,
);
;

window.addEventListener('click', handleClick);
return () => window.removeEventListener('click', handleClick);
, [hasConnected]);

useEffect(() => {
const handleDoubleClick = (e: MouseEvent) => {
const now = Date.now();
if (!socketRef.current?.connected || !hasConnected) return;

socketRef.current.emit('resetStillTime');

const heartId = `${socketRef.current.id-${now-${++heartCounterRef.current`;
socketRef.current.emit('spawnHeart', {
x: e.clientX,
y: e.clientY,
id: heartId,
);
;

window.addEventListener('dblclick', handleDoubleClick);
return () => window.removeEventListener('dblclick', handleDoubleClick);
, [hasConnected]);

useEffect(() => {
const handleMouseMove = (e: MouseEvent) => {
if (draggedChairId.current && dragStartPos.current) {
const dx = e.clientX - dragStartPos.current.x;
const dy = e.clientY - dragStartPos.current.y;

// Check if chair is over delete button
const deleteButton = document.querySelector('.button[src*="deletefurniturebutton.png"], .button[src*="furnitureselectedbutton.png"], .button[src*="furniturehoverbutton.png"]');
if (deleteButton) {
const rect = deleteButton.getBoundingClientRect();
const chair = chairs[draggedChairId.current];
if (chair && 
e.clientX >= rect.left && 
e.clientX <= rect.right && 
e.clientY >= rect.top && 
e.clientY <= rect.bottom) {
setIsDeleteButtonHovered(true);
 else {
setIsDeleteButtonHovered(false);



// Update chair position
if (draggedChairId.current && socketRef.current) {
const chair = chairs[draggedChairId.current];
if (chair) {
const newX = chair.x + dx;
const newY = chair.y + dy;

// Update local state immediately for smooth dragging
setChairs(prev => ({
...prev,
[draggedChairId.current!]: { ...chair, x: newX, y: newY 
));

// Emit position update to server
socketRef.current.emit('updateChairPosition', {
chairId: draggedChairId.current,
x: newX,
y: newY
);



dragStartPos.current = { x: e.clientX, y: e.clientY ;

;

const handleMouseUp = (e: MouseEvent) => {
if (draggedChairId.current) {
if (isDeleteButtonHovered && socketRef.current) {
// Delete the chair
socketRef.current.emit('deleteChair', draggedChairId.current);

setIsDeleteButtonHovered(false);
draggedChairId.current = null;
dragStartPos.current = null;

;

window.addEventListener('mousemove', handleMouseMove);
window.addEventListener('mouseup', handleMouseUp);

return () => {
window.removeEventListener('mousemove', handleMouseMove);
window.removeEventListener('mouseup', handleMouseUp);
;
, [chairs, isDeleteButtonHovered]);

useEffect(() => {
const handleMouseMove = (e: MouseEvent) => {
if (draggedFurnitureId.current && dragStartPos.current) {
const dx = e.clientX - dragStartPos.current.x;
const dy = e.clientY - dragStartPos.current.y;

// Check if furniture is over delete button
const deleteButton = document.querySelector('.button[src*="deletefurniturebutton.png"], .button[src*="furnitureselectedbutton.png"], .button[src*="furniturehoverbutton.png"]');
if (deleteButton) {
const rect = deleteButton.getBoundingClientRect();
const item = furniture[draggedFurnitureId.current];
if (item && 
e.clientX >= rect.left && 
e.clientX <= rect.right && 
e.clientY >= rect.top && 
e.clientY <= rect.bottom) {
setIsDeleteButtonHovered(true);
 else {
setIsDeleteButtonHovered(false);



// Update furniture position
if (draggedFurnitureId.current && socketRef.current) {
const item = furniture[draggedFurnitureId.current];
if (item) {
const newX = item.x + dx;
const newY = item.y + dy;

// Create a new furniture object to force re-render
const updatedFurniture = {
...furniture,
[draggedFurnitureId.current]: {
...item,
x: newX,
y: newY

;

// Update state with new object
setFurniture(updatedFurniture);

// Emit position update to server
socketRef.current.emit('updateFurniturePosition', {
furnitureId: draggedFurnitureId.current,
x: newX,
y: newY
);



dragStartPos.current = { x: e.clientX, y: e.clientY ;

;

const handleMouseUp = (e: MouseEvent) => {
if (draggedFurnitureId.current) {
if (isDeleteButtonHovered && socketRef.current) {
// Delete the furniture
socketRef.current.emit('deleteFurniture', draggedFurnitureId.current);
// Immediately remove from local state
setFurniture(prev => {
const newFurniture = { ...prev ;
delete newFurniture[draggedFurnitureId.current!];
return newFurniture;
);

setIsDeleteButtonHovered(false);
draggedFurnitureId.current = null;
dragStartPos.current = null;

;

window.addEventListener('mousemove', handleMouseMove);
window.addEventListener('mouseup', handleMouseUp);

return () => {
window.removeEventListener('mousemove', handleMouseMove);
window.removeEventListener('mouseup', handleMouseUp);
;
, [furniture, isDeleteButtonHovered]);

useEffect(() => {
const interval = setInterval(() => {
const now = Date.now();
setHearts((prev) => prev.filter((heart) => now - heart.timestamp < HEART_DURATION));
setCircles((prev) => prev.filter((circle) => now - circle.timestamp < CIRCLE_DURATION));
, 16);

const handleVisibilityChange = () => {
if (!document.hidden) {
const now = Date.now();
setHearts((prev) => prev.filter((heart) => now - heart.timestamp < HEART_DURATION));
setCircles((prev) => prev.filter((circle) => now - circle.timestamp < CIRCLE_DURATION));

;

document.addEventListener('visibilitychange', handleVisibilityChange);
window.addEventListener('focus', handleVisibilityChange);

return () => {
clearInterval(interval);
document.removeEventListener('visibilitychange', handleVisibilityChange);
window.removeEventListener('focus', handleVisibilityChange);
;
, []);

const handleConnect = () => {
if (username.trim() === '') return;
if (socketRef.current?.connected) {
socketRef.current.emit('setName', { name: username.trim() );
setHasConnected(true);
clickEnabledTimeRef.current = Date.now() + 300;

;

const formatTime = (seconds: number) => {
const mins = Math.floor(seconds / 60);
const secs = seconds % 60;
return `${minsm ${secss`;
;

const handleCursorChange = (cursor: { type: string ) => {
if (socketRef.current) {
socketRef.current.emit('changeCursor', cursor);

;

const getHighestAFKPlayer = () => {
let highestAFK = { name: '', time: 0 ;
Object.entries(cursors).forEach(([_, cursor]) => {
if (cursor.stillTime > highestAFK.time && cursor.name && cursor.name !== 'Anonymous') {
highestAFK = { name: cursor.name, time: cursor.stillTime ;

);
return highestAFK;
;

const handleChairMouseDown = (e: React.MouseEvent, chairId: string) => {
e.preventDefault();
e.stopPropagation();

// Allow any user to drag any chair
draggedChairId.current = chairId;
dragStartPos.current = { x: e.clientX, y: e.clientY ;
;

const handleFurnitureMouseDown = (e: React.MouseEvent, furnitureId: string) => {
e.preventDefault();
e.stopPropagation();
setSelectedFurnitureId(furnitureId);
// Allow any user to drag any furniture
draggedFurnitureId.current = furnitureId;
dragStartPos.current = { x: e.clientX, y: e.clientY ;
;

const handleMoveUp = (furnitureId: string) => {
if (socketRef.current) {
const currentZIndex = furnitureZIndices[furnitureId] || 0;
const newZIndex = currentZIndex + 1;
setFurnitureZIndices(prev => ({
...prev,
[furnitureId]: newZIndex
));
socketRef.current.emit('updateFurnitureZIndex', { furnitureId, zIndex: newZIndex );

;

const handleMoveDown = (furnitureId: string) => {
if (socketRef.current) {
const currentZIndex = furnitureZIndices[furnitureId] || 0;
const newZIndex = Math.max(0, currentZIndex - 1);
setFurnitureZIndices(prev => ({
...prev,
[furnitureId]: newZIndex
));
socketRef.current.emit('updateFurnitureZIndex', { furnitureId, zIndex: newZIndex );

;

// Deselect furniture when clicking on the background
useEffect(() => {
const handleDeselect = (e: MouseEvent) => {
// Only deselect if the click is not on a furniture image
if (!(e.target instanceof HTMLImageElement && e.target.dataset.furniture === 'true')) {
setSelectedFurnitureId(null);

;
window.addEventListener('mousedown', handleDeselect);
return () => window.removeEventListener('mousedown', handleDeselect);
, []);

// Add function to get container position
const getContainerPosition = (item: Furniture) => {
const imgElement = furnitureRefs.current[item.id];
if (!imgElement) return { left: item.x + 50, top: item.y ;

const rect = imgElement.getBoundingClientRect();
const borderWidth = selectedFurnitureId === item.id ? 1 : 0; // Account for selection border
const containerOffset = 4; // Space between furniture and container

return {
left: rect.right + containerOffset,
top: rect.top + (rect.height / 2),
bottom: rect.bottom + containerOffset
;
;

const handleMoveLeft = (furnitureId: string) => {
if (socketRef.current) {
const item = furniture[furnitureId];
if (item) {
const newX = item.x - 10; // Move 10 pixels left
socketRef.current.emit('updateFurniturePosition', {
furnitureId,
x: newX,
y: item.y
);


;

const handleMoveRight = (furnitureId: string) => {
if (socketRef.current) {
const item = furniture[furnitureId];
if (item) {
const newX = item.x + 10; // Move 10 pixels right
socketRef.current.emit('updateFurniturePosition', {
furnitureId,
x: newX,
y: item.y
);


;

return (
<div 
id="app-root" 
className={hasConnected ? 'cursor-hidden' : '' 
style={{ 
userSelect: 'none',
cursor: hasConnected ? 'none' : 'default',
position: 'relative',
overflow: 'hidden'

>
<Panel 
socket={socketRef.current 
onCursorChange={handleCursorChange 
isDeleteMode={isDeleteMode
onDeleteModeChange={setIsDeleteMode
isDeleteButtonHovered={isDeleteButtonHovered
/>
<div id="logo-container">
<div className="logo-row">
<img src="./UI/logo.png" alt="Logo" id="logo" />
<a 
href="https://github.com/danafk/iamafk" 
target="_blank" 
rel="noopener noreferrer"
style={{ pointerEvents: 'all' 
>
<img src="./UI/github.png" alt="GitHub" id="github-logo" />
</a>
</div>
<div style={{ position: 'relative', margin: 0, padding: 0 >
<img src="./UI/leaderboard.png" alt="Leaderboard" id="leaderboard" />
<div style={{ 
position: 'absolute', 
top: 'calc(50% + 12px)', 
left: 'calc(50% + 38px)', 
transform: 'translate(-50%, -50%)',
fontFamily: '"Press Start 2P", cursive',
fontSize: '0.5rem',
color: 'white',
textShadow: '2px 2px 0 #000',
textAlign: 'left',
width: '100%',
pointerEvents: 'none',
maxWidth: '200px',
whiteSpace: 'nowrap',
overflow: 'hidden',
textOverflow: 'ellipsis'
>
{getHighestAFKPlayer().name.length > 8 
? `${getHighestAFKPlayer().name.slice(0, 8)⋯`
: getHighestAFKPlayer().name
</div>
</div>
</div>

{!hasConnected && (
<div id="modal-overlay">
<div className="form-container">
<label htmlFor="username">What should everyone know you as when you're away?</label>
<input
id="username"
className="input-global"
value={username
onChange={(e) => setUsername(e.target.value)
placeholder="Type a name.."
/>
<button onClick={handleConnect disabled={username.trim() === ''>
Connect
</button>
</div>
</div>
)

{circles.map((circle) => {
const age = Date.now() - circle.timestamp;
if (age >= CIRCLE_DURATION) return null;

const progress = age / CIRCLE_DURATION;
let opacity = progress < 0.2 ? progress / 0.2 : 1 - (progress - 0.2) / 0.8;
const scale = 0.5 + progress * 0.5;
const size = 40 * scale;

return (
<img
key={circle.id
src="./UI/echo.png"
alt="Circle"
style={{
position: 'absolute',
left: circle.x - size / 2,
top: circle.y - size / 2,
width: size,
height: size,
opacity,
pointerEvents: 'none',
zIndex: 9995,

/>
);
)

{hearts.map((heart) => {
const age = Date.now() - heart.timestamp;
if (age >= HEART_DURATION) return null;

const progress = age / HEART_DURATION;
const opacity = 1 - progress;
const rise = (1 - Math.pow(1 - progress, 3)) * 20;

return (
<img
key={heart.id
src="./UI/smile.gif"
alt="Heart"
style={{
position: 'absolute',
left: heart.x - 40,
top: heart.y - 80 - rise,
width: 48,
height: 48,
opacity,
pointerEvents: 'none',
zIndex: 9996,

/>
);
)

{Object.values(chairs).map((chair) => (
<img
key={chair.id
src="./UI/chair.png"
alt="Chair"
style={{
position: 'fixed',
left: chair.x,
top: chair.y,
transform: 'translate(-50%, -50%)',
pointerEvents: 'all',
cursor: hasConnected ? 'none' : 'grab',
zIndex: 9993,
touchAction: 'none',
userSelect: 'none',
WebkitUserSelect: 'none',

onMouseDown={(e) => handleChairMouseDown(e, chair.id)
draggable={false
/>
))

{Object.values(furniture).map((item) => (
<React.Fragment key={`${item.id-${item.x-${item.y`>
<img
ref={(el) => {
furnitureRefs.current[item.id] = el;

src={FURNITURE_IMAGES[item.type]
alt={item.type
data-furniture="true"
style={{
position: 'fixed',
left: item.x,
top: item.y,
transform: 'translate(-50%, -50%)',
pointerEvents: 'all',
cursor: hasConnected ? 'none' : 'grab',
zIndex: 9993 + (furnitureZIndices[item.id] || 0),
touchAction: 'none',
userSelect: 'none',
WebkitUserSelect: 'none',
width: 'auto',
height: 'auto',
willChange: 'transform',
backfaceVisibility: 'hidden',
WebkitBackfaceVisibility: 'hidden',
WebkitTransform: 'translate(-50%, -50%)',
transformStyle: 'preserve-3d',
border: selectedFurnitureId === item.id ? '1px dashed #fff' : 'none',
borderRadius: selectedFurnitureId === item.id ? '6px' : '0',
boxSizing: 'border-box',

onMouseDown={(e) => handleFurnitureMouseDown(e, item.id)
draggable={false
/>
{selectedFurnitureId === item.id && (
<>
<div
style={{
position: 'fixed',
left: getContainerPosition(item).left,
top: getContainerPosition(item).top,
transform: 'translateY(-50%)',
display: 'flex',
flexDirection: 'column',
gap: '4px',
zIndex: 9996,
pointerEvents: 'all',

>
<img
src="./UI/up.png"
alt="Move Up"
className="furniture-control-button"
onMouseOver={(e) => e.currentTarget.src = './UI/uphover.png'
onMouseOut={(e) => e.currentTarget.src = './UI/up.png'
onClick={() => handleMoveUp(item.id)
style={{ cursor: 'pointer' 
/>
<img
src="./UI/down.png"
alt="Move Down"
className="furniture-control-button"
onMouseOver={(e) => e.currentTarget.src = './UI/downhover.png'
onMouseOut={(e) => e.currentTarget.src = './UI/down.png'
onClick={() => handleMoveDown(item.id)
style={{ cursor: 'pointer' 
/>
</div>
<div
style={{
position: 'fixed',
left: item.x,
top: getContainerPosition(item).bottom,
transform: 'translateX(-50%)',
display: 'flex',
flexDirection: 'row',
gap: '4px',
zIndex: 9996,
pointerEvents: 'all',

>
<img
src="./UI/left.png"
alt="Move Left"
className="furniture-control-button"
onMouseOver={(e) => e.currentTarget.src = './UI/lefthover.png'
onMouseOut={(e) => e.currentTarget.src = './UI/left.png'
onClick={() => handleMoveLeft(item.id)
style={{ cursor: 'pointer' 
/>
<img
src="./UI/right.png"
alt="Move Right"
className="furniture-control-button"
onMouseOver={(e) => e.currentTarget.src = './UI/righthover.png'
onMouseOut={(e) => e.currentTarget.src = './UI/right.png'
onClick={() => handleMoveRight(item.id)
style={{ cursor: 'pointer' 
/>
</div>
</>
)
</React.Fragment>
))

{Object.entries(cursors).map(([id, cursor]) => {
if (!hasConnected && id === socketRef.current?.id) return null;
if (!cursor.name || cursor.name === 'Anonymous') return null;

const isMe = id === socketRef.current?.id;
const cursorClass = isMe 
? `cursor-${cursorType`
: (cursor.cursorType ? `cursor-${cursor.cursorType` : 'cursor-default');

return (
<div
key={id
className="cursor-wrapper"
style={{
left: cursor.x,
top: cursor.y,
fontWeight: isMe ? 'bold' : 'normal',
zIndex: 9997,

>
<div className={`cursor-circle ${cursorClass` />
<div className="cursor-labels">
{cursor.stillTime >= 30 && (
<div className="cursor-timer">AFK {formatTime(cursor.stillTime)</div>
)
<div className="cursor-id-label">{cursor.name</div>
</div>
</div>
);
)
</div>
);


export default App;