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
isFrozen?: boolean;
frozenPosition?: { x: number; y: number ;
sleepingOnBed?: boolean;


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


interface Emoji {
id: string;
x: number;
y: number;
timestamp: number;
type: string;


interface ThumbsUp {
id: string;
x: number;
y: number;
timestamp: number;


interface Furniture {
id: string;
type: string;
x: number;
y: number;
zIndex?: number;
isFlipped?: boolean;


interface PanelProps {
socket: Socket | null;
onCursorChange: (type: string) => void;
isDeleteMode: boolean;
onDeleteModeChange: (isDeleteMode: boolean) => void;
isDeleteButtonHovered: boolean;
isDraggingOverTrash: boolean;
cursorPosition?: CursorData;
viewportOffset: { x: number; y: number ;
style?: React.CSSProperties;


// Canvas configuration
const CANVAS_SIZE = 4000;

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

const FURNITURE_DIMENSIONS: { [key: string]: { width: number; height: number   = {
'bed': { width: 120, height: 80 ,
'chair': { width: 60, height: 60 ,
'lamp': { width: 40, height: 80 ,
'plant1': { width: 50, height: 70 ,
'plant2': { width: 50, height: 70 ,
'blackcat': { width: 60, height: 40 ,
'whitecat': { width: 60, height: 40 ,
'walls1': { width: 120, height: 120 ,
'walls2': { width: 120, height: 120 
;

function App() {
const [cursors, setCursors] = useState<CursorsMap>({);
const [hearts, setHearts] = useState<Heart[]>([]);
const [circles, setCircles] = useState<Circle[]>([]);
const [emojis, setEmojis] = useState<Emoji[]>([]);
const [furniture, setFurniture] = useState<{ [key: string]: Furniture >({);
const [isDeleteMode, setIsDeleteMode] = useState(false);
const socketRef = useRef<Socket | null>(null);
const heartCounterRef = useRef(0);
const circleCounterRef = useRef(0);
const emojiCounterRef = useRef(0);
const dragStartPos = useRef<{ x: number; y: number  | null>(null);
const draggedFurnitureId = useRef<string | null>(null);

const [username, setUsername] = useState('');
const usernameRef = useRef(username);
const [hasConnected, setHasConnected] = useState(false);
const clickEnabledTimeRef = useRef<number | null>(null);
const [cursorType, setCursorType] = useState<string>('default');
const [isDeleteButtonHovered, setIsDeleteButtonHovered] = useState(false);
const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null);
const furnitureRefs = useRef<{ [key: string]: HTMLImageElement | null >({);
const [isCursorFrozen, setIsCursorFrozen] = useState(false);
const [frozenCursorPosition, setFrozenCursorPosition] = useState<{ x: number; y: number  | null>(null);

// Canvas viewport state
const [viewportOffset, setViewportOffset] = useState({ x: 0, y: 0 );
const [isDraggingViewport, setIsDraggingViewport] = useState(false);
const viewportDragStart = useRef<{ x: number; y: number  | null>(null);

// Performance optimization refs
const animationFrameRef = useRef<number | null>(null);
const lastMousePosition = useRef<{ x: number; y: number >({ x: 0, y: 0 );
const isMouseMoving = useRef(false);

// Mouse state ref for optimized handling
const mouseStateRef = useRef({
isDraggingFurniture: false,
isDraggingViewport: false,
lastX: 0,
lastY: 0,
lastEvent: null as MouseEvent | null,
);

const HEART_DURATION = 800;
const CIRCLE_DURATION = 600;
const THUMBSUP_DURATION = 1000;

// Add constants for z-index layers
const Z_INDEX_LAYERS = {
CURSORS: 9997,
PANEL: 9996,
LOGO: 9995,
FURNITURE: 100, // Base z-index for furniture
MIN_FURNITURE: 100, // Minimum z-index for furniture
MAX_FURNITURE: 9994// Maximum z-index for furniture (below cursors and panel)
;

// Helper function to convert screen coordinates to canvas coordinates
const screenToCanvas = (screenX: number, screenY: number) => {
return {
x: screenX + viewportOffset.x,
y: screenY + viewportOffset.y
;
;

// Helper function to convert canvas coordinates to screen coordinates
const canvasToScreen = (canvasX: number, canvasY: number) => {
return {
x: canvasX - viewportOffset.x,
y: canvasY - viewportOffset.y
;
;

// Helper function to clamp coordinates within canvas bounds
const clampToCanvas = (x: number, y: number) => {
return {
x: Math.max(0, Math.min(CANVAS_SIZE, x)),
y: Math.max(0, Math.min(CANVAS_SIZE, y))
;
;

// Helper function to check if an element is visible in the current viewport
const isElementVisible = (x: number, y: number, buffer: number = 100) => {
const visibleBounds = {
left: viewportOffset.x - buffer,
right: viewportOffset.x + window.innerWidth + buffer,
top: viewportOffset.y - buffer,
bottom: viewportOffset.y + window.innerHeight + buffer
;

return x >= visibleBounds.left && 
 x <= visibleBounds.right && 
 y >= visibleBounds.top && 
 y <= visibleBounds.bottom;
;

// Filter elements to only those visible in the current viewport
const visibleCircles = circles.filter(circle => 
isElementVisible(circle.x, circle.y, 50) // Smaller buffer for circles
);

const visibleHearts = hearts.filter(heart => 
isElementVisible(heart.x, heart.y, 50) // Smaller buffer for hearts
);

const visibleEmojis = emojis.filter(emoji => 
isElementVisible(emoji.x, emoji.y, 50) // Smaller buffer for emojis
);

const visibleFurniture = Object.values(furniture).filter(item => 
isElementVisible(item.x, item.y, 200) // Larger buffer for furniture
);

const visibleCursors = Object.entries(cursors).filter(([id, cursor]) => {
if (!cursor) return false; // Guard against undefined
if (!hasConnected && id === socketRef.current?.id) return false;
if (!cursor.name || cursor.name === 'Anonymous') return false;

const cursorX = id === socketRef.current?.id
? (isCursorFrozen && frozenCursorPosition ? frozenCursorPosition.x : cursor.x)
: (cursor.isFrozen && cursor.frozenPosition ? cursor.frozenPosition.x : cursor.x);
const cursorY = id === socketRef.current?.id
? (isCursorFrozen && frozenCursorPosition ? frozenCursorPosition.y : cursor.y)
: (cursor.isFrozen && cursor.frozenPosition ? cursor.frozenPosition.y : cursor.y);

const shouldShowCursor = !(id === socketRef.current?.id) || hasConnected;
if (!shouldShowCursor) return false;
if (!(id === socketRef.current?.id) && cursor.isFrozen && !cursor.frozenPosition) return false;

return isElementVisible(cursorX, cursorY, 100); // Medium buffer for cursors
);

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
setEmojis([]);
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

socket.on('emojiSpawned', (emojiData) => {
setEmojis((prev) => [...prev, { ...emojiData, timestamp: Date.now() ]);
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

socket.on('initialState', (data: any) => {
setCursors(data && data.cursors ? data.cursors : {);
setHearts(data && data.hearts ? data.hearts : []);
setCircles(data && data.circles ? data.circles : []);
setEmojis(data && data.emojis ? data.emojis : []);
setFurniture(data && data.furniture ? data.furniture : {);
);

socket.on('clientConnected', (data: any) => {
if (data && data.socketId && data.cursor) {
setCursors(prev => ({ ...prev, [data.socketId]: data.cursor ));

);

socket.on('furnitureSpawned', (data: any) => {
if (data && data.id) {
setFurniture(prev => ({ ...prev, [data.id]: data ));

);

socket.on('furnitureMoved', (data: any) => {
if (data && data.id) {
setFurniture(prev => ({
...prev,
[data.id]: {
...prev[data.id],
x: data.x,
y: data.y,
isFlipped: data.isFlipped

));

);

socket.on('furnitureDeleted', (data: any) => {
if (data && data.furnitureId) {
setFurniture(prev => {
const newFurniture = { ...prev ;
delete newFurniture[data.furnitureId];
return newFurniture;
);

);

socket.on('furnitureZIndexChanged', (data: { id: string, zIndex: number  | { id: string, zIndex: number []) => {
if (Array.isArray(data)) {
// Handle multiple z-index changes (for move up/down operations)
setFurniture(prev => {
const newFurniture = { ...prev ;
data.forEach(change => {
if (newFurniture[change.id]) {
newFurniture[change.id] = {
...newFurniture[change.id],
zIndex: change.zIndex
;

);
return newFurniture;
);
 else {
// Handle single z-index change
setFurniture(prev => ({
...prev,
[data.id]: {
...prev[data.id],
zIndex: data.zIndex

));

);

socket.on('furnitureFlipped', (data: { id: string, isFlipped: boolean ) => {
setFurniture(prev => ({
...prev,
[data.id]: {
...prev[data.id],
isFlipped: data.isFlipped

));
);

socket.on('furnitureCleanup', (data: { cleanedCount: number ) => {
console.log(`Server cleaned up ${data.cleanedCount expired furniture items`);
// Optionally show a notification to users about cleanup
if (data.cleanedCount > 0) {
// You could add a toast notification here if desired
console.log(`Cleaned up ${data.cleanedCount furniture items that were inactive for 24+ hours`);

);

return () => {
socket.disconnect();
socket.off('initialState');
socket.off('clientConnected');
socket.off('furnitureSpawned');
socket.off('furnitureMoved');
socket.off('furnitureDeleted');
;
, []);

useEffect(() => {
const handleKeyPress = (e: KeyboardEvent) => {
if (socketRef.current?.connected && hasConnected && socketRef.current.id) {
// Get current cursor position in canvas coordinates
const cursorX = isCursorFrozen && frozenCursorPosition ? frozenCursorPosition.x : cursors[socketRef.current.id]?.x || 0;
const cursorY = isCursorFrozen && frozenCursorPosition ? frozenCursorPosition.y : cursors[socketRef.current.id]?.y || 0;

// Position emoji to the left of the cursor in canvas coordinates
const emojiX = cursorX - 30; // 30px to the left
const emojiY = cursorY;

const now = Date.now();
const emojiId = `${socketRef.current.id-${now-${++emojiCounterRef.current`;

// Map keys to emoji types
const emojiMap: { [key: string]: string  = {
'1': 'thumbsup',
'2': 'thumbsdown',
'3': 'happyt',
'4': 'sad',
'5': 'angry',
'6': 'surprised',
'7': 'blank',
'8': 'exclamationpoint',
'9': 'pointleft',
'0': 'pointright'
;

const emojiType = emojiMap[e.key];
if (emojiType) {
// Reset AFK timer when pressing number keys
socketRef.current.emit('resetStillTime');

socketRef.current.emit('spawnEmoji', {
x: emojiX,
y: emojiY,
id: emojiId,
type: emojiType
);


;

window.addEventListener('keydown', handleKeyPress);
return () => window.removeEventListener('keydown', handleKeyPress);
, [hasConnected, isCursorFrozen, frozenCursorPosition, cursors]);

// Add socket listener for cursor freeze updates
useEffect(() => {
if (socketRef.current) {
socketRef.current.on('cursorFrozen', (data: { 
id: string, 
isFrozen: boolean,
frozenPosition?: { x: number; y: number ,
sleepingOnBed?: boolean
) => {
if (data.id === socketRef.current?.id) {
setIsCursorFrozen(data.isFrozen);
if (data.isFrozen && data.frozenPosition) {
setFrozenCursorPosition(data.frozenPosition);
 else {
setFrozenCursorPosition(null);


// Update the cursors state with the frozen position and sleeping state
setCursors(prev => {
const newCursors = { ...prev ;
if (newCursors[data.id]) {
newCursors[data.id].isFrozen = data.isFrozen;
newCursors[data.id].sleepingOnBed = data.sleepingOnBed;
if (data.isFrozen && data.frozenPosition) {
newCursors[data.id].frozenPosition = data.frozenPosition;
 else {
delete newCursors[data.id].frozenPosition;
delete newCursors[data.id].sleepingOnBed;


return newCursors;
);
);

, []);

// Add click handler to unfreeze cursor
useEffect(() => {
const handleClick = (e: MouseEvent) => {
// Don't unfreeze if clicking on furniture controls
const target = e.target as HTMLElement;
if (target.closest('[data-furniture-control="true"]')) {
return;


// Unfreeze if clicking anywhere in the app (including panel)
if (isCursorFrozen && socketRef.current) {
// Unfreeze the cursor
setFrozenCursorPosition(null);
setIsCursorFrozen(false);
socketRef.current.emit('cursorFreeze', { 
isFrozen: false,
x: e.clientX,
y: e.clientY
);

;

window.addEventListener('click', handleClick);
return () => window.removeEventListener('click', handleClick);
, [isCursorFrozen]);

// Replace the multiple mouse event useEffects with a single optimized one:
useEffect(() => {
// Refs for drag state
const draggingFurnitureId = draggedFurnitureId;
const dragStart = dragStartPos;
const viewportDrag = viewportDragStart;
let lastFrame = 0;

// Animation loop for smooth updates
function animationLoop(ts: number) {
if (mouseStateRef.current.isDraggingFurniture && draggedFurnitureId.current && dragStart.current && mouseStateRef.current.lastEvent) {
// Calculate delta
const dx = mouseStateRef.current.lastX - dragStart.current.x;
const dy = mouseStateRef.current.lastY - dragStart.current.y;
const item = furniture[draggedFurnitureId.current];
if (item) {
const newCanvasX = item.x + dx;
const newCanvasY = item.y + dy;
const clampedCoords = clampToCanvas(newCanvasX, newCanvasY);
// Only update local state on drag end, but you can update a ref here for visual feedback if needed
// Emit position update to server
socketRef.current?.emit('updateFurniturePosition', {
furnitureId: draggedFurnitureId.current,
x: clampedCoords.x,
y: clampedCoords.y
);

// Update local state for visual feedback during dragging
setFurniture(prev => ({
...prev,
[draggedFurnitureId.current!]: {
...prev[draggedFurnitureId.current!],
x: clampedCoords.x,
y: clampedCoords.y

));

// Update drag start for next frame
dragStart.current = { x: mouseStateRef.current.lastX, y: mouseStateRef.current.lastY ;

// Check if dragging over trash can button
const trashButton = document.querySelector('img[alt="Delete Furniture"]');
if (trashButton) {
const trashRect = trashButton.getBoundingClientRect();
const mouseX = mouseStateRef.current.lastX;
const mouseY = mouseStateRef.current.lastY;

const isOverTrash = mouseX >= trashRect.left && mouseX <= trashRect.right &&
 mouseY >= trashRect.top && mouseY <= trashRect.bottom;

setIsDeleteButtonHovered(isOverTrash);


if (mouseStateRef.current.isDraggingViewport && viewportDrag.current && mouseStateRef.current.lastEvent) {
const dx = mouseStateRef.current.lastX - viewportDrag.current.x;
const dy = mouseStateRef.current.lastY - viewportDrag.current.y;
setViewportOffset(prev => {
const newX = prev.x - dx;
const newY = prev.y - dy;
const maxOffsetX = Math.max(0, CANVAS_SIZE - window.innerWidth);
const maxOffsetY = Math.max(0, CANVAS_SIZE - window.innerHeight);
return {
x: Math.max(0, Math.min(maxOffsetX, newX)),
y: Math.max(0, Math.min(maxOffsetY, newY))
;
);
viewportDrag.current = { x: mouseStateRef.current.lastX, y: mouseStateRef.current.lastY ;

// Always update cursor position for server (but not during viewport dragging)
if (socketRef.current?.connected && !isCursorFrozen && hasConnected && mouseStateRef.current.lastEvent && !mouseStateRef.current.isDraggingViewport) {
const canvasCoords = screenToCanvas(mouseStateRef.current.lastX, mouseStateRef.current.lastY);
const clampedCoords = clampToCanvas(canvasCoords.x, canvasCoords.y);
socketRef.current.emit('cursorMove', {
x: clampedCoords.x,
y: clampedCoords.y,
name: usernameRef.current.trim(),
);

lastFrame = requestAnimationFrame(animationLoop);


// Mouse event handlers
function onMouseMove(e: MouseEvent) {
mouseStateRef.current.lastX = e.clientX;
mouseStateRef.current.lastY = e.clientY;
mouseStateRef.current.lastEvent = e;

// Check if furniture is being dragged over the trash can button
if (mouseStateRef.current.isDraggingFurniture) {
const target = e.target as HTMLElement;
const trashButton = target.closest('img[alt="Delete Furniture"]');
setIsDeleteButtonHovered(!!trashButton);


function onMouseDown(e: MouseEvent) {
const target = e.target as HTMLElement;

// Check if clicking on furniture
const furnitureElement = target.closest('[data-furniture-id]');
if (furnitureElement) {
const furnitureId = furnitureElement.getAttribute('data-furniture-id');
if (furnitureId) {
e.preventDefault();
e.stopPropagation();

// Unfreeze cursor if it's frozen
if (isCursorFrozen && socketRef.current) {
setFrozenCursorPosition(null);
setIsCursorFrozen(false);
socketRef.current.emit('cursorFreeze', { 
isFrozen: false,
x: e.clientX,
y: e.clientY
);


// Handle delete mode
if (isDeleteMode) {
if (socketRef.current) {
socketRef.current.emit('deleteFurniture', furnitureId);
setFurniture(prev => {
const newFurniture = { ...prev ;
delete newFurniture[furnitureId];
return newFurniture;
);

return;


// Always start dragging when clicking on furniture
mouseStateRef.current.isDraggingFurniture = true;
draggedFurnitureId.current = furnitureId;
dragStart.current = { x: e.clientX, y: e.clientY ;

// Toggle selection: if already selected, deselect; otherwise select
if (selectedFurnitureId === furnitureId) {
setSelectedFurnitureId(null);
 else {
setSelectedFurnitureId(furnitureId);


return;



// Deselect furniture when clicking on background
if (target.id === 'app-root' || target.closest('#app-root') === target) {
setSelectedFurnitureId(null);
// Reset dragging state when deselecting
mouseStateRef.current.isDraggingFurniture = false;
draggedFurnitureId.current = null;
dragStart.current = null;


// Start viewport dragging on left mouse button on empty space
if (e.button === 0 && (target.id === 'app-root' || target.classList.contains('canvas-container'))) {
mouseStateRef.current.isDraggingViewport = true;
viewportDrag.current = { x: e.clientX, y: e.clientY ;


function onMouseUp(e: MouseEvent) {
if (mouseStateRef.current.isDraggingViewport) {
mouseStateRef.current.isDraggingViewport = false;
viewportDrag.current = null;

if (mouseStateRef.current.isDraggingFurniture) {
// Check if furniture was dropped over the trash can button
const target = e.target as HTMLElement;
const trashButton = target.closest('img[alt="Delete Furniture"]');

if (trashButton && draggedFurnitureId.current) {
// Delete the furniture if dropped over the trash can button
if (socketRef.current) {
socketRef.current.emit('deleteFurniture', draggedFurnitureId.current);
setFurniture(prev => {
const newFurniture = { ...prev ;
delete newFurniture[draggedFurnitureId.current!];
return newFurniture;
);



mouseStateRef.current.isDraggingFurniture = false;
draggedFurnitureId.current = null;
dragStart.current = null;
setIsDeleteButtonHovered(false);
// Update React state for furniture position here if needed


function onClick(e: MouseEvent) {
const now = Date.now();

// Don't spawn circles if clicking on furniture controls or UI elements
const target = e.target as HTMLElement;
const isControlButton = target.closest('[data-furniture-control="true"]') || 
target.closest('button') || 
target.closest('img[alt]') ||
target.closest('#logo-container') ||
target.closest('#modal-overlay') ||
target.closest('.form-container');

if (
!socketRef.current?.connected ||
!hasConnected ||
(clickEnabledTimeRef.current !== null && now < clickEnabledTimeRef.current) ||
mouseStateRef.current.isDraggingViewport || // Don't spawn circles if we're dragging the viewport
isControlButton // Don't spawn circles if clicking on control buttons
) {
return;


socketRef.current.emit('resetStillTime');

// Convert screen coordinates to canvas coordinates
const canvasCoords = screenToCanvas(e.clientX, e.clientY);
const clampedCoords = clampToCanvas(canvasCoords.x, canvasCoords.y);

const circleId = `${socketRef.current.id-${now-${++circleCounterRef.current`;
socketRef.current.emit('spawnCircle', {
x: clampedCoords.x,
y: clampedCoords.y,
id: circleId,
);

function onDblClick(e: MouseEvent) {
const now = Date.now();

// Check if double-clicking on furniture
const target = e.target as HTMLElement;
const furnitureElement = target.closest('[data-furniture-id]');
if (furnitureElement) {
const furnitureId = furnitureElement.getAttribute('data-furniture-id');
if (furnitureId) {
e.preventDefault();
e.stopPropagation();

const item = furniture[furnitureId];
if (item && (item.type === 'bed' || item.type === 'chair')) {
// Clear selection state when double-clicking bed or chair
setSelectedFurnitureId(null);

// Convert screen coordinates to canvas coordinates
const canvasCoords = screenToCanvas(e.clientX, e.clientY);

if (!isCursorFrozen) {
// When freezing, store the current cursor position in canvas coordinates
const frozenPos = { x: canvasCoords.x, y: canvasCoords.y ;
setFrozenCursorPosition(frozenPos);
if (socketRef.current) {
socketRef.current.emit('cursorFreeze', { 
isFrozen: true,
x: frozenPos.x,
y: frozenPos.y,
sleepingOnBed: item.type === 'bed'
);

 else {
// When unfreezing via double-click on furniture, clear the frozen position
setFrozenCursorPosition(null);
if (socketRef.current) {
socketRef.current.emit('cursorFreeze', { 
isFrozen: false,
x: canvasCoords.x,
y: canvasCoords.y,
sleepingOnBed: false
);


setIsCursorFrozen(!isCursorFrozen);
return;




// Check if double-clicking on UI elements (buttons, controls, etc.)
const isUIElement = target.closest('button') || 
 target.closest('input') || 
 target.closest('img[alt]') || 
 target.closest('.furniture-control-button') ||
 target.closest('[data-furniture-control]') ||
 target.closest('#logo-container') ||
 target.closest('#modal-overlay') ||
 target.closest('.form-container');

if (isUIElement) {
e.preventDefault();
e.stopPropagation();
return;


// Handle regular double-click for hearts
if (!socketRef.current?.connected || !hasConnected) return;

socketRef.current.emit('resetStillTime');

// Convert screen coordinates to canvas coordinates
const canvasCoords = screenToCanvas(e.clientX, e.clientY);
const clampedCoords = clampToCanvas(canvasCoords.x, canvasCoords.y);

const heartId = `${socketRef.current.id-${now-${++heartCounterRef.current`;
socketRef.current.emit('spawnHeart', {
x: clampedCoords.x,
y: clampedCoords.y,
id: heartId,
);


window.addEventListener('mousemove', onMouseMove);
window.addEventListener('mousedown', onMouseDown);
window.addEventListener('mouseup', onMouseUp);
window.addEventListener('click', onClick);
window.addEventListener('dblclick', onDblClick);
lastFrame = requestAnimationFrame(animationLoop);

return () => {
window.removeEventListener('mousemove', onMouseMove);
window.removeEventListener('mousedown', onMouseDown);
window.removeEventListener('mouseup', onMouseUp);
window.removeEventListener('click', onClick);
window.removeEventListener('dblclick', onDblClick);
cancelAnimationFrame(lastFrame);
;
, [furniture, isDeleteButtonHovered, isDraggingViewport, hasConnected, isCursorFrozen, viewportOffset]);

useEffect(() => {
const interval = setInterval(() => {
const now = Date.now();
setHearts((prev) => prev.filter((heart) => now - heart.timestamp < HEART_DURATION));
setCircles((prev) => prev.filter((circle) => now - circle.timestamp < CIRCLE_DURATION));
setEmojis((prev) => prev.filter((emoji) => now - emoji.timestamp < THUMBSUP_DURATION));
, 16);

const handleVisibilityChange = () => {
if (!document.hidden) {
const now = Date.now();
setHearts((prev) => prev.filter((heart) => now - heart.timestamp < HEART_DURATION));
setCircles((prev) => prev.filter((circle) => now - circle.timestamp < CIRCLE_DURATION));
setEmojis((prev) => prev.filter((emoji) => now - emoji.timestamp < THUMBSUP_DURATION));

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
setCursorType(cursor.type);
socketRef.current.emit('changeCursor', cursor);

;

const getHighestAFKPlayer = () => {
let highestAFK = { name: '', time: 0 ;
Object.entries(cursors).forEach(([_, cursor]) => {
if (!cursor) return; // Guard against undefined
if (cursor.stillTime > highestAFK.time && cursor.name && cursor.name !== 'Anonymous') {
highestAFK = { name: cursor.name, time: cursor.stillTime ;

);
return highestAFK;
;

const handleFurnitureMouseDown = (e: React.MouseEvent, furnitureId: string) => {
e.preventDefault();
e.stopPropagation();

if (isDeleteMode) {
if (socketRef.current) {
socketRef.current.emit('deleteFurniture', furnitureId);
setFurniture(prev => {
const newFurniture = { ...prev ;
delete newFurniture[furnitureId];
return newFurniture;
);

return;


// Convert screen coordinates to canvas coordinates for drag start
const canvasCoords = screenToCanvas(e.clientX, e.clientY);
dragStartPos.current = { x: e.clientX, y: e.clientY ;
draggedFurnitureId.current = furnitureId;
setSelectedFurnitureId(furnitureId);

// Set the mouse state for the optimized system
mouseStateRef.current.isDraggingFurniture = true;
mouseStateRef.current.lastX = e.clientX;
mouseStateRef.current.lastY = e.clientY;
mouseStateRef.current.lastEvent = e.nativeEvent;
;

const handleMoveUp = (furnitureId: string) => {
if (socketRef.current) {
socketRef.current.emit('moveFurnitureUp', { furnitureId );

;

const handleMoveDown = (furnitureId: string) => {
if (socketRef.current) {
socketRef.current.emit('moveFurnitureDown', { furnitureId );

;

// Add function to get container position
const getContainerPosition = (item: Furniture) => {
// Use estimated dimensions based on furniture type instead of getBoundingClientRect
// This ensures control buttons stay positioned relative to canvas coordinates
const FURNITURE_DIMENSIONS: { [key: string]: { width: number; height: number   = {
'bed': { width: 120, height: 80 ,
'chair': { width: 60, height: 60 ,
'lamp': { width: 40, height: 80 ,
'plant1': { width: 50, height: 70 ,
'plant2': { width: 50, height: 70 ,
'sprout': { width: 40, height: 60 ,
'slime': { width: 60, height: 40 ,
'bunny': { width: 50, height: 50 ,
'blackcat': { width: 60, height: 40 ,
'whitecat': { width: 60, height: 40 ,
'astronaut': { width: 50, height: 60 ,
'beanie': { width: 50, height: 50 ,
'cap': { width: 50, height: 50 ,
'cathat': { width: 50, height: 50 ,
'headphones': { width: 50, height: 50 ,
'walls1': { width: 100, height: 60 ,
'walls2': { width: 100, height: 60 
;

const dimensions = FURNITURE_DIMENSIONS[item.type] || { width: 50, height: 50 ;
const halfWidth = dimensions.width / 2;
const halfHeight = dimensions.height / 2;

return {
// For the right button: item's right edge (x + halfWidth) + 4px
right: item.x + halfWidth + 4,
// For the top button: item's top edge (y - halfHeight) - 4px
top: item.y - halfHeight - 4,
// For the bottom button: item's bottom edge (y + halfHeight) + 4px
bottom: item.y + halfHeight + 4
;
;

const handleMoveLeft = (furnitureId: string) => {
if (socketRef.current) {
const item = furniture[furnitureId];
if (item) {
const newFlipped = !item.isFlipped;

// Emit to server
socketRef.current.emit('updateFurniturePosition', {
furnitureId,
x: item.x,
y: item.y,
isFlipped: newFlipped
);


;

const handleMoveRight = (furnitureId: string) => {
if (socketRef.current) {
const item = furniture[furnitureId];
if (item) {
const newFlipped = !item.isFlipped;

// Emit to server
socketRef.current.emit('updateFurniturePosition', {
furnitureId,
x: item.x,
y: item.y,
isFlipped: newFlipped
);


;

const handleFurnitureDoubleClick = (e: React.MouseEvent, furnitureId: string) => {
e.preventDefault();
e.stopPropagation();

const item = furniture[furnitureId];
if (item && (item.type === 'bed' || item.type === 'chair')) {
// Clear selection state when double-clicking bed or chair
setSelectedFurnitureId(null);

// Convert screen coordinates to canvas coordinates
const canvasCoords = screenToCanvas(e.clientX, e.clientY);

if (!isCursorFrozen) {
// When freezing, store the current cursor position in canvas coordinates
const frozenPos = { x: canvasCoords.x, y: canvasCoords.y ;
setFrozenCursorPosition(frozenPos);
if (socketRef.current) {
socketRef.current.emit('cursorFreeze', { 
isFrozen: true,
x: frozenPos.x,
y: frozenPos.y,
sleepingOnBed: item.type === 'bed'
);

 else {
// When unfreezing via double-click on furniture, clear the frozen position
setFrozenCursorPosition(null);
if (socketRef.current) {
socketRef.current.emit('cursorFreeze', { 
isFrozen: false,
x: canvasCoords.x,
y: canvasCoords.y,
sleepingOnBed: false
);


setIsCursorFrozen(!isCursorFrozen);

;

return (
<div 
id="app-root" 
className={hasConnected ? (isCursorFrozen ? '' : 'cursor-hidden') : '' 
style={{ 
userSelect: 'none',
cursor: hasConnected ? (isCursorFrozen ? 'default' : 'none') : 'default',
position: 'relative',
overflow: 'hidden'

>
{/* Canvas container with viewport offset */
<div 
className="canvas-container"
style={{
position: 'absolute',
left: -viewportOffset.x,
top: -viewportOffset.y,
width: CANVAS_SIZE,
height: CANVAS_SIZE,
pointerEvents: 'none'

>
{/* Circles */
{visibleCircles.map((circle) => {
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

{/* Hearts */
{visibleHearts.map((heart) => {
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

{/* Emojis */
{visibleEmojis.map((emoji) => {
const age = Date.now() - emoji.timestamp;
if (age >= THUMBSUP_DURATION) return null;

const progress = age / THUMBSUP_DURATION;
// Fade in for first 20%, stay visible for 60%, fade out for last 20%
let opacity;
if (progress < 0.2) {
opacity = progress / 0.2; // Fade in
 else if (progress < 0.8) {
opacity = 1; // Stay visible
 else {
opacity = 1 - ((progress - 0.8) / 0.2); // Fade out


// Move to the left over time
const moveLeft = progress * 30; // Move 30px to the left over the duration

return (
<img
key={emoji.id
src={`./UI/${emoji.type.png`
alt={emoji.type
style={{
position: 'absolute',
left: emoji.x - moveLeft,
top: emoji.y - 24, // Center vertically
opacity,
pointerEvents: 'none',
zIndex: 9996,

/>
);
)

{/* Furniture */
{visibleFurniture.map((item) => (
<React.Fragment key={`${item.id-${item.x-${item.y`>
<img
key={item.id
ref={(el) => {
furnitureRefs.current[item.id] = el;

src={FURNITURE_IMAGES[item.type]
alt={item.type
data-furniture-id={item.id
style={{
position: 'absolute',
left: item.x,
top: item.y,
transform: 'translate(-50%, -50%)',
zIndex: item.zIndex || Z_INDEX_LAYERS.FURNITURE,
pointerEvents: 'all',
userSelect: 'none',
willChange: 'transform',
backfaceVisibility: 'hidden',
WebkitBackfaceVisibility: 'hidden',
WebkitTransform: `translate(-50%, -50%) ${item.isFlipped ? 'scaleX(-1)' : ''`,
transformStyle: 'preserve-3d',
border: selectedFurnitureId === item.id ? '1px dashed #fff' : 'none',
borderRadius: selectedFurnitureId === item.id ? '6px' : '0',
boxSizing: 'border-box',
WebkitTouchCallout: 'none',
WebkitTapHighlightColor: 'transparent'

draggable={false
/>
{selectedFurnitureId === item.id && (
<>
{/* Top button - positioned directly above */
<div
style={{
position: 'absolute',
left: item.x - 24, // Half of button width (48/2)
top: item.y - (FURNITURE_DIMENSIONS[item.type]?.height || 50)/2 - 48, // Button height
display: 'flex',
flexDirection: 'column',
gap: '0',
zIndex: 9996,
pointerEvents: 'all',

>
<div 
style={{ 
position: 'relative', 
width: '48px', 
height: '48px', 
display: 'flex', 
alignItems: 'center', 
justifyContent: 'center',
cursor: 'pointer'

onClick={() => handleMoveUp(item.id)
className="furniture-control-button"
data-furniture-control="true"
>
<img
src="./UI/up.png"
alt="Move Up"
onMouseOver={(e) => e.currentTarget.src = './UI/uphover.png'
onMouseOut={(e) => e.currentTarget.src = './UI/up.png'
style={{ position: 'absolute' 
/>
</div>
</div>
{/* Bottom button - positioned directly below */
<div
style={{
position: 'absolute',
left: item.x - 24, // Half of button width (48/2)
top: item.y + (FURNITURE_DIMENSIONS[item.type]?.height || 50)/2, // No gap
display: 'flex',
flexDirection: 'column',
gap: '0',
zIndex: 9996,
pointerEvents: 'all',

>
<div 
style={{ 
position: 'relative', 
width: '48px', 
height: '48px', 
display: 'flex', 
alignItems: 'center', 
justifyContent: 'center',
cursor: 'pointer'

onClick={() => handleMoveDown(item.id)
className="furniture-control-button"
data-furniture-control="true"
>
<img
src="./UI/down.png"
alt="Move Down"
onMouseOver={(e) => e.currentTarget.src = './UI/downhover.png'
onMouseOut={(e) => e.currentTarget.src = './UI/down.png'
style={{ position: 'absolute' 
/>
</div>
</div>
{/* Right button - positioned directly to the right */
<div
style={{
position: 'absolute',
left: item.x + (FURNITURE_DIMENSIONS[item.type]?.width || 50)/2, // No gap
top: item.y - 24, // Half of button height (48/2)
display: 'flex',
flexDirection: 'column',
gap: '0',
zIndex: 9996,
pointerEvents: 'all',

>
<div 
style={{ 
position: 'relative', 
width: '48px', 
height: '48px', 
display: 'flex', 
alignItems: 'center', 
justifyContent: 'center',
cursor: 'pointer'

onClick={() => {
if (socketRef.current) {
socketRef.current.emit('flipFurniture', { furnitureId: item.id );


className="furniture-control-button"
data-furniture-control="true"
>
<img
src="./UI/flip.png"
alt="Flip"
onMouseOver={(e) => e.currentTarget.src = './UI/fliphover.png'
onMouseOut={(e) => e.currentTarget.src = './UI/flip.png'
style={{ position: 'absolute' 
/>
</div>
</div>
</>
)
</React.Fragment>
))

{/* Cursors */
{visibleCursors.map(([id, cursor]) => {
const isMe = id === socketRef.current?.id;
const cursorClass = isMe 
? `cursor-${cursorType`
: (cursor.cursorType ? `cursor-${cursor.cursorType` : 'cursor-default');

const cursorX = isMe 
? (isCursorFrozen && frozenCursorPosition ? frozenCursorPosition.x : cursor.x)
: (cursor.isFrozen && cursor.frozenPosition ? cursor.frozenPosition.x : cursor.x);
const cursorY = isMe
? (isCursorFrozen && frozenCursorPosition ? frozenCursorPosition.y : cursor.y)
: (cursor.isFrozen && cursor.frozenPosition ? cursor.frozenPosition.y : cursor.y);

return (
<React.Fragment key={id>
<div
className="cursor-wrapper"
style={{
left: cursorX,
top: cursorY,
fontWeight: isMe ? 'bold' : 'normal',
zIndex: Z_INDEX_LAYERS.CURSORS

>
<div className={`cursor-circle ${cursorClass` />
<div className="cursor-labels">
{cursor.stillTime >= 30 && (
<div className="cursor-timer">AFK {formatTime(cursor.stillTime)</div>
)
<div className="cursor-id-label" style={{ position: 'relative' >
{cursor.name
{cursor.isFrozen && cursor.sleepingOnBed && (
<img
src="./UI/sleeping.gif"
alt="Sleeping"
style={{
position: 'absolute',
left: '100%', // Position to the right of the label
top: '50%',
transform: 'translateY(-50%)',
marginLeft: '6px', // Spacing between label and gif
paddingBottom: '4px', // Increased bottom padding
zIndex: Z_INDEX_LAYERS.CURSORS,
pointerEvents: 'none'

/>
)
</div>
</div>
</div>
</React.Fragment>
);
)
</div>

{/* UI Elements (Panel, Logo, etc.) - positioned relative to viewport */
<Panel 
socket={socketRef.current 
onCursorChange={handleCursorChange 
isDeleteMode={isDeleteMode
onDeleteModeChange={setIsDeleteMode
isDeleteButtonHovered={isDeleteButtonHovered
cursorPosition={socketRef.current?.id ? cursors[socketRef.current.id] : undefined
viewportOffset={viewportOffset
style={{ zIndex: Z_INDEX_LAYERS.PANEL 
/>
<div id="logo-container" style={{ zIndex: Z_INDEX_LAYERS.LOGO >
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
</div>
);


export default App;