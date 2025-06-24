import { useEffect, useRef  from 'react';
import { Socket  from 'socket.io-client';
import { CANVAS_SIZE  from '../../constants';
import { screenToCanvas, clampToCanvas  from '../../utils/canvas';
import { updateAFKTime, getUserStats  from '../../utils/localStorage';

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
setUserStats: (stats: any) => void;
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
setUserStats,
afkStartTimeRef
: MouseInteractionsProps) => {
const heartCounterRef = useRef(0);
const circleCounterRef = useRef(0);
const dragStartPos = useRef<{ x: number; y: number  | null>(null);
const draggedFurnitureId = useRef<string | null>(null);
const viewportDragStart = useRef<{ x: number; y: number  | null>(null);
const clickEnabledTimeRef = useRef<number | null>(null);
const confettiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

// Mouse state ref for optimized handling
const mouseStateRef = useRef({
isDraggingViewport: false,
isDraggingFurniture: false,
lastX: 0,
lastY: 0,
lastEvent: null as MouseEvent | null,
);

// Helper function to convert screen coordinates to canvas coordinates
const convertScreenToCanvas = (screenX: number, screenY: number) => {
return screenToCanvas(screenX, screenY, viewportOffset);
;

// Helper function to handle AFK detection
const handleAFKDetection = () => {
if (hasConnected && afkStartTimeRef.current) {
const myCursor = cursors[socketRef.current?.id || ''];
if (myCursor) {
const afkDuration = Math.floor((Date.now() - afkStartTimeRef.current) / 1000);
updateAFKTime(afkDuration);
const updatedStats = getUserStats();
setUserStats(updatedStats);
afkStartTimeRef.current = null;


;

// Main mouse interaction handler
useEffect(() => {
const dragStart = dragStartPos;
const viewportDrag = viewportDragStart;
let lastFrame = 0;

// Animation loop for smooth updates
function animationLoop() {
if (mouseStateRef.current.isDraggingFurniture && draggedFurnitureId.current && dragStart.current && mouseStateRef.current.lastEvent) {
const dx = mouseStateRef.current.lastX - dragStart.current.x;
const dy = mouseStateRef.current.lastY - dragStart.current.y;
const item = furniture[draggedFurnitureId.current];
if (item) {
const newCanvasX = item.x + dx;
const newCanvasY = item.y + dy;
const clampedCoords = clampToCanvas(newCanvasX, newCanvasY);

setFurniture(prev => ({
...prev,
[draggedFurnitureId.current!]: {
...prev[draggedFurnitureId.current!],
x: clampedCoords.x,
y: clampedCoords.y

));

if (socketRef.current) {
socketRef.current.emit('updateFurniturePosition', {
furnitureId: draggedFurnitureId.current,
x: clampedCoords.x,
y: clampedCoords.y
);


dragStart.current = { x: mouseStateRef.current.lastX, y: mouseStateRef.current.lastY ;


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


if (socketRef.current?.connected && !isCursorFrozen && hasConnected && mouseStateRef.current.lastEvent && !mouseStateRef.current.isDraggingViewport) {
const canvasCoords = convertScreenToCanvas(mouseStateRef.current.lastX, mouseStateRef.current.lastY);
const clampedCoords = clampToCanvas(canvasCoords.x, canvasCoords.y);
socketRef.current.emit('cursorMove', {
x: clampedCoords.x,
y: clampedCoords.y,
name: username,
);


lastFrame = requestAnimationFrame(animationLoop);


// Mouse event handlers
function onMouseMove(e: MouseEvent) {
mouseStateRef.current.lastX = e.clientX;
mouseStateRef.current.lastY = e.clientY;
mouseStateRef.current.lastEvent = e;

handleAFKDetection();


function onMouseDown(e: MouseEvent) {
const target = e.target as HTMLElement;

handleAFKDetection();

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


mouseStateRef.current.isDraggingFurniture = true;
draggedFurnitureId.current = furnitureId;
dragStart.current = { x: e.clientX, y: e.clientY ;

if (selectedFurnitureId === furnitureId) {
setSelectedFurnitureId(null);
 else {
setSelectedFurnitureId(furnitureId);


return;



if (target.id === 'app-root' || target.closest('#app-root') === target) {
setSelectedFurnitureId(null);
mouseStateRef.current.isDraggingFurniture = false;
draggedFurnitureId.current = null;
dragStart.current = null;


if (e.button === 0 && (target.id === 'app-root' || target.classList.contains('canvas-container'))) {
mouseStateRef.current.isDraggingViewport = true;
viewportDrag.current = { x: e.clientX, y: e.clientY ;



function onMouseUp() {
if (mouseStateRef.current.isDraggingViewport) {
mouseStateRef.current.isDraggingViewport = false;
viewportDrag.current = null;

if (mouseStateRef.current.isDraggingFurniture) {
mouseStateRef.current.isDraggingFurniture = false;
draggedFurnitureId.current = null;
dragStart.current = null;



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
, [furniture, isCursorFrozen, hasConnected, viewportOffset, socketRef, cursors, username, setFurniture, setSelectedFurnitureId, selectedFurnitureId, setIsCursorFrozen, setFrozenCursorPosition, setViewportOffset, setUserStats, afkStartTimeRef]);

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