import { useEffect, useRef  from 'react';
import { Socket  from 'socket.io-client';
import { CANVAS_SIZE  from '../../constants';
import { screenToCanvas, clampToCanvas  from '../../utils/canvas';

interface MouseInteractionsProps {
socketRef: React.RefObject<Socket | null>;
hasConnected: boolean;
cursors: { [key: string]: any ;
furniture: { [key: string]: any ;
setFurniture: React.Dispatch<React.SetStateAction<{ [key: string]: any >>;
setSelectedFurnitureId: (id: string | null) => void;
selectedFurnitureId: string | null;
isCursorFrozen: boolean;
setIsCursorFrozen: (frozen: boolean) => void;
setFrozenCursorPosition: (pos: { x: number; y: number  | null) => void;
viewportOffset: { x: number; y: number ;
setViewportOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number >>;
username: string;
recordFurniturePlacement: (type: string) => Promise<boolean>;
afkStartTimeRef: React.RefObject<number | null>;


export const useMouseInteractions = ({
socketRef,
hasConnected,
cursors,
furniture,
setFurniture,
setSelectedFurnitureId,
selectedFurnitureId,
isCursorFrozen,
setIsCursorFrozen,
setFrozenCursorPosition,
viewportOffset,
setViewportOffset,
username,
recordFurniturePlacement,
afkStartTimeRef
: MouseInteractionsProps) => {
const heartCounterRef = useRef(0);
const circleCounterRef = useRef(0);
const dragStartPos = useRef<{ x: number; y: number  | null>(null);
const draggedFurnitureId = useRef<string | null>(null);
const viewportDragStart = useRef<{ x: number; y: number  | null>(null);
const clickEnabledTimeRef = useRef<number | null>(null);
const confettiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const lastDoubleClickTimeRef = useRef(0);
const lastSentPositionRef = useRef<{ x: number; y: number  | null>(null);
const lastSentCursorRef = useRef<{ x: number; y: number  | null>(null);
const lastSentViewportRef = useRef<{ x: number; y: number  | null>(null);
const DOUBLE_CLICK_COOLDOWN_MS = 1000; // 1 second cooldown between double-clicks
const DRAG_THRESHOLD_PX = 5; // Minimum pixels to move before starting drag
const pendingFurnitureId = useRef<string | null>(null);

// Mouse state ref for optimized handling
const mouseStateRef = useRef({
isDraggingViewport: false,
isDraggingFurniture: false,
lastX: 0,
lastY: 0,
lastEvent: null as MouseEvent | null,
);

// Throttle emits for furniture dragging
let lastEmitTime = 0;
const DRAG_THROTTLE_MS = 16; // Reduced from 50ms to 16ms (60fps) for smoother dragging

// Helper function to convert screen coordinates to canvas coordinates
const convertScreenToCanvas = (screenX: number, screenY: number) => {
return screenToCanvas(screenX, screenY, viewportOffset);
;

// Helper function to handle AFK detection
const handleAFKDetection = () => {
if (hasConnected && afkStartTimeRef.current) {
const myCursor = cursors[socketRef.current?.id || ''];
if (myCursor) {
// Only update AFK time if user was actually AFK (stillTime >= 30)
if (myCursor.stillTime >= 30) {
// Calculate only the incremental time since last update
const now = Date.now();
const incrementalTime = Math.floor((now - afkStartTimeRef.current) / 1000);
if (incrementalTime > 0) {
// Use context API for AFK time updates


afkStartTimeRef.current = null;


;

// Main mouse interaction handler
useEffect(() => {
let lastFrame = 0;

// Animation loop for smooth updates
function animationLoop() {
if (mouseStateRef.current.isDraggingFurniture && draggedFurnitureId.current && mouseStateRef.current.lastEvent) {
// Get the cursor's canvas coordinates
const canvasCoords = convertScreenToCanvas(mouseStateRef.current.lastX, mouseStateRef.current.lastY);
const clampedCoords = clampToCanvas(canvasCoords.x, canvasCoords.y);

// Only update if position changed
if (
!lastSentPositionRef.current ||
lastSentPositionRef.current.x !== clampedCoords.x ||
lastSentPositionRef.current.y !== clampedCoords.y
) {
setFurniture(prev => ({
...prev,
[draggedFurnitureId.current!]: {
...prev[draggedFurnitureId.current!],
x: clampedCoords.x,
y: clampedCoords.y

));

// Throttled emit for furniture position updates
if (socketRef.current) {
const now = Date.now();
if (now - lastEmitTime > DRAG_THROTTLE_MS) {
socketRef.current.emit('updateFurniturePosition', {
furnitureId: draggedFurnitureId.current,
x: clampedCoords.x,
y: clampedCoords.y
);
lastEmitTime = now;



lastSentPositionRef.current = { x: clampedCoords.x, y: clampedCoords.y ;



if (mouseStateRef.current.isDraggingViewport && viewportDragStart.current && mouseStateRef.current.lastEvent) {
const dx = mouseStateRef.current.lastX - viewportDragStart.current.x;
const dy = mouseStateRef.current.lastY - viewportDragStart.current.y;

// Only update if mouse actually moved
if (dx !== 0 || dy !== 0) {
setViewportOffset(prev => {
const newX = prev.x - dx;
const newY = prev.y - dy;
const maxOffsetX = Math.max(0, CANVAS_SIZE - window.innerWidth);
const maxOffsetY = Math.max(0, CANVAS_SIZE - window.innerHeight);
const clampedX = Math.max(0, Math.min(maxOffsetX, newX));
const clampedY = Math.max(0, Math.min(maxOffsetY, newY));

// Only update if viewport position actually changed
if (
!lastSentViewportRef.current ||
lastSentViewportRef.current.x !== clampedX ||
lastSentViewportRef.current.y !== clampedY
) {
lastSentViewportRef.current = { x: clampedX, y: clampedY ;
return { x: clampedX, y: clampedY ;

return prev;
);
viewportDragStart.current = { x: mouseStateRef.current.lastX, y: mouseStateRef.current.lastY ;



if (socketRef.current?.connected && !isCursorFrozen && hasConnected && mouseStateRef.current.lastEvent && !mouseStateRef.current.isDraggingViewport) {
const canvasCoords = convertScreenToCanvas(mouseStateRef.current.lastX, mouseStateRef.current.lastY);
const clampedCoords = clampToCanvas(canvasCoords.x, canvasCoords.y);

// Only emit if cursor position changed
if (
!lastSentCursorRef.current ||
lastSentCursorRef.current.x !== clampedCoords.x ||
lastSentCursorRef.current.y !== clampedCoords.y
) {
socketRef.current.emit('cursorMove', {
x: clampedCoords.x,
y: clampedCoords.y,
name: username,
);
lastSentCursorRef.current = { x: clampedCoords.x, y: clampedCoords.y ;



lastFrame = requestAnimationFrame(animationLoop);


// Mouse event handlers
function onMouseMove(e: MouseEvent) {
mouseStateRef.current.lastX = e.clientX;
mouseStateRef.current.lastY = e.clientY;
mouseStateRef.current.lastEvent = e;

// Check if we should start dragging furniture based on movement distance
if (pendingFurnitureId.current && dragStartPos.current && !mouseStateRef.current.isDraggingFurniture) {
const dx = e.clientX - dragStartPos.current.x;
const dy = e.clientY - dragStartPos.current.y;
const distance = Math.sqrt(dx * dx + dy * dy);

if (distance > DRAG_THRESHOLD_PX) {
// Start dragging
mouseStateRef.current.isDraggingFurniture = true;
draggedFurnitureId.current = pendingFurnitureId.current;
lastSentPositionRef.current = null;




function onMouseDown(e: MouseEvent) {
const target = e.target as HTMLElement;

// Check if clicking on furniture
const furnitureElement = target.closest('[data-furniture-id]');
if (furnitureElement) {
const furnitureId = furnitureElement.getAttribute('data-furniture-id');
if (furnitureId) {
e.preventDefault();
e.stopPropagation();

if (isCursorFrozen && socketRef.current) {
setFrozenCursorPosition(null);
setIsCursorFrozen(false);
socketRef.current.emit('cursorFreeze', { 
isFrozen: false,
x: e.clientX,
y: e.clientY
);


// Immediately handle furniture selection
if (selectedFurnitureId === furnitureId) {
setSelectedFurnitureId(null);
 else {
setSelectedFurnitureId(furnitureId);


// Store the furniture ID and start position for potential dragging
dragStartPos.current = { x: e.clientX, y: e.clientY ;
pendingFurnitureId.current = furnitureId;

return;



if (target.id === 'app-root' || target.closest('#app-root') === target) {
setSelectedFurnitureId(null);
mouseStateRef.current.isDraggingFurniture = false;
draggedFurnitureId.current = null;
dragStartPos.current = null;
pendingFurnitureId.current = null;


if (e.button === 0 && (target.id === 'app-root' || target.classList.contains('canvas-container'))) {
mouseStateRef.current.isDraggingViewport = true;
viewportDragStart.current = { x: e.clientX, y: e.clientY ;
lastSentCursorRef.current = null; // Reset to ensure first cursor update happens



function onMouseUp() {
if (mouseStateRef.current.isDraggingViewport) {
mouseStateRef.current.isDraggingViewport = false;
viewportDragStart.current = null;
lastSentCursorRef.current = null; // Reset when viewport dragging ends

if (mouseStateRef.current.isDraggingFurniture) {
mouseStateRef.current.isDraggingFurniture = false;
draggedFurnitureId.current = null;
dragStartPos.current = null;
lastSentPositionRef.current = null;

// Clear pending furniture drag
pendingFurnitureId.current = null;
dragStartPos.current = null;


function onClick(e: MouseEvent) {
const now = Date.now();

const target = e.target as HTMLElement;
const isControlButton = target.closest('[data-furniture-control="true"]') || 
target.closest('button') || 
target.closest('.furniture-control-button') ||
target.closest('#logo-container') ||
target.closest('#modal-overlay') ||
target.closest('.form-container');

if (
!socketRef.current?.connected ||
!hasConnected ||
(clickEnabledTimeRef.current !== null && now < clickEnabledTimeRef.current) ||
mouseStateRef.current.isDraggingViewport ||
isControlButton
) {
return;


socketRef.current.emit('resetStillTime');
handleAFKDetection();

const canvasCoords = convertScreenToCanvas(e.clientX, e.clientY);
const clampedCoords = clampToCanvas(canvasCoords.x, canvasCoords.y);

const circleId = `${socketRef.current.id-${now-${++circleCounterRef.current`;
socketRef.current.emit('spawnCircle', {
x: clampedCoords.x,
y: clampedCoords.y,
id: circleId,
);


window.addEventListener('mousemove', onMouseMove);
window.addEventListener('mousedown', onMouseDown);
window.addEventListener('mouseup', onMouseUp);
window.addEventListener('click', onClick);
lastFrame = requestAnimationFrame(animationLoop);

return () => {
window.removeEventListener('mousemove', onMouseMove);
window.removeEventListener('mousedown', onMouseDown);
window.removeEventListener('mouseup', onMouseUp);
window.removeEventListener('click', onClick);
cancelAnimationFrame(lastFrame);
;
, [furniture, isCursorFrozen, hasConnected, viewportOffset, socketRef, cursors, username, setFurniture, setSelectedFurnitureId, selectedFurnitureId, setIsCursorFrozen, setFrozenCursorPosition, setViewportOffset, recordFurniturePlacement, afkStartTimeRef]);

// Double-click handler
useEffect(() => {
const onDblClick = (e: MouseEvent) => {
const target = e.target as HTMLElement;
const furnitureElement = target.closest('[data-furniture-id]');
if (furnitureElement) {
const furnitureId = furnitureElement.getAttribute('data-furniture-id');
if (furnitureId) {
e.preventDefault();
e.stopPropagation();

// Cancel any pending furniture drag
pendingFurnitureId.current = null;
dragStartPos.current = null;

const item = furniture[furnitureId];
if (item && (item.type === 'bed' || item.type === 'chair')) {
setSelectedFurnitureId(null);
const canvasCoords = convertScreenToCanvas(e.clientX, e.clientY);
if (!isCursorFrozen) {
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


if (!socketRef.current?.connected || !hasConnected) return;

// Check double-click cooldown to prevent spam
const now = Date.now();
if (now - lastDoubleClickTimeRef.current < DOUBLE_CLICK_COOLDOWN_MS) {
return;


// Update last double-click time
lastDoubleClickTimeRef.current = now;

socketRef.current.emit('resetStillTime');
const canvasCoords = convertScreenToCanvas(e.clientX, e.clientY);
const clampedCoords = clampToCanvas(canvasCoords.x, canvasCoords.y);
const heartId = `${socketRef.current.id-${Date.now()-${++heartCounterRef.current`;
socketRef.current.emit('spawnHeart', {
x: clampedCoords.x,
y: clampedCoords.y,
id: heartId,
);
;

window.addEventListener('dblclick', onDblClick);
return () => {
window.removeEventListener('dblclick', onDblClick);
;
, [furniture, isCursorFrozen, hasConnected, viewportOffset, socketRef, setSelectedFurnitureId, setIsCursorFrozen, setFrozenCursorPosition]);

return {
clickEnabledTimeRef,
confettiTimeoutRef,
mouseStateRef,
draggedFurnitureId,
;
; 