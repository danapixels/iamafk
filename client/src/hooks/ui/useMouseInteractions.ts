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
isFurnitureSelectionMode: boolean;
selectionBox: {
startX: number;
startY: number;
endX: number;
endY: number;
isActive: boolean;
 | null;
setSelectionBox: React.Dispatch<React.SetStateAction<{
startX: number;
startY: number;
endX: number;
endY: number;
isActive: boolean;
 | null>>;
tempFurniture?: Array<{ id: string; type: string; x: number; y: number; zIndex?: number; isFlipped?: boolean; isOn?: boolean; isTemp?: boolean; presetId?: string >;
setTempFurniture?: React.Dispatch<React.SetStateAction<Array<{ id: string; type: string; x: number; y: number; zIndex?: number; isFlipped?: boolean; isOn?: boolean; isTemp?: boolean; presetId?: string >>>;
selectedFurnitureDuringSelection?: Set<string>;
setSelectedFurnitureDuringSelection?: React.Dispatch<React.SetStateAction<Set<string>>>;


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
afkStartTimeRef,
isFurnitureSelectionMode,
selectionBox,
setSelectionBox,
tempFurniture,
setTempFurniture,
setSelectedFurnitureDuringSelection
: MouseInteractionsProps) => {
const heartCounterRef = useRef(0);
const circleCounterRef = useRef(0);
const dragStartPos = useRef<{ x: number; y: number  | null>(null);
const draggedFurnitureId = useRef<string | null>(null);
const viewportDragStart = useRef<{ x: number; y: number  | null>(null);
const tempFurnitureDragStart = useRef<{ [key: string]: { x: number; y: number   | null>(null);
const clickEnabledTimeRef = useRef<number | null>(null);
const confettiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const lastDoubleClickTimeRef = useRef(0);
const lastSentPositionRef = useRef<{ x: number; y: number  | null>(null);
const lastSentCursorRef = useRef<{ x: number; y: number  | null>(null);
const lastSentViewportRef = useRef<{ x: number; y: number  | null>(null);
const lastEchoAnimationTimeRef = useRef(0);
const ECHO_ANIMATION_COOLDOWN_MS = 500; // 500ms cooldown between animations
const DRAG_THRESHOLD_PX = 5; // minimum pixels to move before starting drag
const pendingFurnitureId = useRef<string | null>(null);

// mouse state ref for optimized handling
const mouseStateRef = useRef({
isDraggingViewport: false,
isDraggingFurniture: false,
lastX: 0,
lastY: 0,
lastEvent: null as MouseEvent | null,
);

// throttle emits for furniture dragging
let lastEmitTime = 0;
const DRAG_THROTTLE_MS = 16;

// helper function to convert screen coordinates to canvas coordinates
const convertScreenToCanvas = (screenX: number, screenY: number) => {
return screenToCanvas(screenX, screenY, viewportOffset);
;

// helper function to check if furniture is within selection box
const isFurnitureInSelectionBox = (furnitureX: number, furnitureY: number) => {
if (!selectionBox || !selectionBox.isActive) return false;

const left = Math.min(selectionBox.startX, selectionBox.endX);
const right = Math.max(selectionBox.startX, selectionBox.endX);
const top = Math.min(selectionBox.startY, selectionBox.endY);
const bottom = Math.max(selectionBox.startY, selectionBox.endY);

return furnitureX >= left && furnitureX <= right && furnitureY >= top && furnitureY <= bottom;
;

// helper function to handle AFK detection
const handleAFKDetection = () => {
if (hasConnected && afkStartTimeRef.current) {
const myCursor = cursors[socketRef.current?.id || ''];
if (myCursor) {
// updates AFK time if user was AFK (stillTime >= 30)
if (myCursor.stillTime >= 30) {
// calculates only the incremental time since last update
const now = Date.now();
const incrementalTime = Math.floor((now - afkStartTimeRef.current) / 1000);
if (incrementalTime > 0) {
// uses context API for AFK time updates


afkStartTimeRef.current = null;


;

// main mouse interaction handler
useEffect(() => {
let lastFrame = 0;
let isPageVisible = !document.hidden;
let lastMouseUpdate = 0;
const MOUSE_THROTTLE_MS = 16; // 60fps when visible

// animation loop for smooth updates
function animationLoop() {
// runs animation loop if page is visible
if (!isPageVisible) {
lastFrame = requestAnimationFrame(animationLoop);
return;


if (mouseStateRef.current.isDraggingFurniture && draggedFurnitureId.current && mouseStateRef.current.lastEvent) {
// gets the cursor's canvas coordinates
const canvasCoords = convertScreenToCanvas(mouseStateRef.current.lastX, mouseStateRef.current.lastY);
const clampedCoords = clampToCanvas(canvasCoords.x, canvasCoords.y);

// checks dragging temporary furniture
const isDraggingTempFurniture = tempFurniture?.some(item => item.id === draggedFurnitureId.current);

if (isDraggingTempFurniture && setTempFurniture && tempFurnitureDragStart.current) {
// finds the dragged item to get its preset ID
const draggedItem = tempFurniture?.find(item => item.id === draggedFurnitureId.current);
if (draggedItem && draggedItem.presetId) {
// calculates the offset from the original position when drag started
const originalPos = tempFurnitureDragStart.current[draggedItem.id];
if (originalPos) {
const offsetX = clampedCoords.x - originalPos.x;
const offsetY = clampedCoords.y - originalPos.y;

// moves all items in the same preset group by the same offset from their original positions
setTempFurniture(prev => prev.map(item => 
item.presetId === draggedItem.presetId
? { 
...item, 
x: tempFurnitureDragStart.current![item.id].x + offsetX, 
y: tempFurnitureDragStart.current![item.id].y + offsetY 

: item
));


 else {
// updates regular furniture position
// only updates if position changed
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

// throttled emit for furniture position updates
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




if (mouseStateRef.current.isDraggingViewport && viewportDragStart.current && mouseStateRef.current.lastEvent && !isFurnitureSelectionMode) {
const dx = mouseStateRef.current.lastX - viewportDragStart.current.x;
const dy = mouseStateRef.current.lastY - viewportDragStart.current.y;

// updates if mouse actually moved
if (dx !== 0 || dy !== 0) {
setViewportOffset(prev => {
const newX = prev.x - dx;
const newY = prev.y - dy;
const maxOffsetX = Math.max(0, CANVAS_SIZE - window.innerWidth);
const maxOffsetY = Math.max(0, CANVAS_SIZE - window.innerHeight);
const clampedX = Math.max(0, Math.min(maxOffsetX, newX));
const clampedY = Math.max(0, Math.min(maxOffsetY, newY));

// updates if viewport position actually changed
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

// throttles cursor updates based on page visibility
const now = Date.now();
const throttleMs = isPageVisible ? MOUSE_THROTTLE_MS : 100; // slower updates when hidden

if (now - lastMouseUpdate > throttleMs) {
// emits if cursor position changed
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

lastMouseUpdate = now;



lastFrame = requestAnimationFrame(animationLoop);


// handles page visibility changes
const handleVisibilityChange = () => {
isPageVisible = !document.hidden;
// resets mouse update timer when visibility changes
lastMouseUpdate = 0;
;

document.addEventListener('visibilitychange', handleVisibilityChange);

// mouse event handlers
function onMouseMove(e: MouseEvent) {
mouseStateRef.current.lastX = e.clientX;
mouseStateRef.current.lastY = e.clientY;
mouseStateRef.current.lastEvent = e;

// updates selection box if active
if (selectionBox && selectionBox.isActive) {
const canvasCoords = convertScreenToCanvas(e.clientX, e.clientY);
setSelectionBox(prev => prev ? {
...prev,
endX: canvasCoords.x,
endY: canvasCoords.y
 : null);

// updates which furniture items are being selected during selection
if (setSelectedFurnitureDuringSelection) {
const selectedItems = new Set<string>();
Object.entries(furniture).forEach(([furnitureId, item]) => {
if (isFurnitureInSelectionBox(item.x, item.y)) {
selectedItems.add(furnitureId);

);
setSelectedFurnitureDuringSelection(selectedItems);



// checks dragging furniture based on movement distance
if (pendingFurnitureId.current && dragStartPos.current && !mouseStateRef.current.isDraggingFurniture && !isFurnitureSelectionMode) {
const dx = e.clientX - dragStartPos.current.x;
const dy = e.clientY - dragStartPos.current.y;
const distance = Math.sqrt(dx * dx + dy * dy);

if (distance > DRAG_THRESHOLD_PX) {
// starts dragging
mouseStateRef.current.isDraggingFurniture = true;
draggedFurnitureId.current = pendingFurnitureId.current;
lastSentPositionRef.current = null;




function onMouseDown(e: MouseEvent) {
const target = e.target as HTMLElement;

// checks clicking on furniture
const furnitureElement = target.closest('[data-furniture-id]');
if (furnitureElement) {
const furnitureId = furnitureElement.getAttribute('data-furniture-id');
const isTempFurniture = furnitureElement.hasAttribute('data-temp-furniture');

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


// handles furniture selection mode - client-side only
if (isFurnitureSelectionMode) {
return;


// handles temporary furniture dragging
if (isTempFurniture) {
// stores the furniture ID and start position for potential dragging
dragStartPos.current = { x: e.clientX, y: e.clientY ;
pendingFurnitureId.current = furnitureId;

// stores original positions of all items in the same preset group
const draggedItem = tempFurniture?.find(item => item.id === furnitureId);
if (draggedItem && draggedItem.presetId) {
tempFurnitureDragStart.current = {;
tempFurniture?.forEach(item => {
if (item.presetId === draggedItem.presetId) {
tempFurnitureDragStart.current![item.id] = { x: item.x, y: item.y ;

);

return;


// handles normal furniture selection if NOT in selection mode
if (!isFurnitureSelectionMode) {
// immediately handles furniture selection
if (selectedFurnitureId === furnitureId) {
setSelectedFurnitureId(null);
 else {
setSelectedFurnitureId(furnitureId);
// furniture select interaction
const furnitureItem = furniture[furnitureId];
if (furnitureItem) {
'select', furnitureId, furnitureItem.type);



// stores the furniture ID and start position for potential dragging
dragStartPos.current = { x: e.clientX, y: e.clientY ;
pendingFurnitureId.current = furnitureId;


return;



if (target.id === 'app-root' || target.closest('#app-root') === target) {
setSelectedFurnitureId(null);
mouseStateRef.current.isDraggingFurniture = false;
draggedFurnitureId.current = null;
dragStartPos.current = null;
pendingFurnitureId.current = null;


// handles selection box creation in selection mode
if (e.button === 0 && isFurnitureSelectionMode && (target.id === 'app-root' || target.classList.contains('canvas-container'))) {
const canvasCoords = convertScreenToCanvas(e.clientX, e.clientY);
setSelectionBox({
startX: canvasCoords.x,
startY: canvasCoords.y,
endX: canvasCoords.x,
endY: canvasCoords.y,
isActive: true
);
return;


if (e.button === 0 && (target.id === 'app-root' || target.classList.contains('canvas-container')) && !isFurnitureSelectionMode) {
mouseStateRef.current.isDraggingViewport = true;
viewportDragStart.current = { x: e.clientX, y: e.clientY ;
lastSentCursorRef.current = null; // resets to ensure first cursor update happens



function onMouseUp() {
// handles selection box completion
if (selectionBox && selectionBox.isActive && isFurnitureSelectionMode) {
// selects all furniture within the selection box
const selectedItems: Array<{ id: string; type: string; x: number; y: number; zIndex?: number; isFlipped?: boolean; isOn?: boolean > = [];
Object.entries(furniture).forEach(([furnitureId, item]) => {
if (isFurnitureInSelectionBox(item.x, item.y)) {
selectedItems.push({
id: furnitureId,
type: item.type,
x: item.x,
y: item.y,
zIndex: item.zIndex,
isFlipped: item.isFlipped,
isOn: item.isOn
);

);

// updates the selected furniture state in the FurniturePresetPanel
if (selectedItems.length > 0) {
const event = new CustomEvent('furnitureSelectionBoxComplete', {
detail: { selectedItems 
);
window.dispatchEvent(event);


// clears the selection box
setSelectionBox(null);
// doesn't clear the selected furniture during selection - persists until preset saved


if (mouseStateRef.current.isDraggingViewport) {
mouseStateRef.current.isDraggingViewport = false;
viewportDragStart.current = null;
lastSentCursorRef.current = null; // resets when viewport dragging ends

if (mouseStateRef.current.isDraggingFurniture) {
mouseStateRef.current.isDraggingFurniture = false;
draggedFurnitureId.current = null;
dragStartPos.current = null;
lastSentPositionRef.current = null;
tempFurnitureDragStart.current = null;

// clears pending furniture drag
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
isControlButton ||
isFurnitureSelectionMode // stops circle spawning when in selection mode
) {
return;


socketRef.current.emit('resetStillTime');
handleAFKDetection();

// checks click animation cooldown to reduce visual lag
if (now - lastEchoAnimationTimeRef.current >= ECHO_ANIMATION_COOLDOWN_MS) {
const canvasCoords = convertScreenToCanvas(e.clientX, e.clientY);
const clampedCoords = clampToCanvas(canvasCoords.x, canvasCoords.y);

const circleId = `${socketRef.current.id-${now-${++circleCounterRef.current`;
socketRef.current.emit('spawnCircle', {
x: clampedCoords.x,
y: clampedCoords.y,
id: circleId,
);

// updates last click animation time
lastEchoAnimationTimeRef.current = now;



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
document.removeEventListener('visibilitychange', handleVisibilityChange);
;
, [furniture, isCursorFrozen, hasConnected, viewportOffset, socketRef, cursors, username, setFurniture, setSelectedFurnitureId, selectedFurnitureId, setIsCursorFrozen, setFrozenCursorPosition, setViewportOffset, recordFurniturePlacement, afkStartTimeRef, isFurnitureSelectionMode, selectionBox]);

// double-click handler
useEffect(() => {
const onDblClick = (e: MouseEvent) => {
const target = e.target as HTMLElement;
const furnitureElement = target.closest('[data-furniture-id]');
if (furnitureElement) {
const furnitureId = furnitureElement.getAttribute('data-furniture-id');
if (furnitureId) {
e.preventDefault();
e.stopPropagation();

// cancels any pending furniture drag
pendingFurnitureId.current = null;
dragStartPos.current = null;

const item = furniture[furnitureId];
// checks for furniture that can freeze the cursor
if (item && (item.type === 'bed' || item.type === 'chair' || item.type === 'toilet')) {
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


// checks for furniture that can be toggled (computer, tv, washingmachine)
if (item && (item.type === 'computer' || item.type === 'tv' || item.type === 'washingmachine')) {
// lets the furniture's own double-click handler handle the toggle
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

const now = Date.now();

socketRef.current.emit('resetStillTime');
const canvasCoords = convertScreenToCanvas(e.clientX, e.clientY);
const clampedCoords = clampToCanvas(canvasCoords.x, canvasCoords.y);

// double click with Datadog
clampedCoords.x, clampedCoords.y);

// updates last double-click time
lastDoubleClickTimeRef.current = now;

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