import { useEffect, useRef  from 'react';
import { Socket  from 'socket.io-client';
import { ANIMATION_CONSTANTS  from '../../constants';
import { screenToCanvas  from '../../utils/canvas';

interface KeyboardInteractionsProps {
socketRef: React.RefObject<Socket | null>;
hasConnected: boolean;
cursors: { [key: string]: any ;
selectedFurnitureId: string | null;
setSelectedFurnitureId: (id: string | null) => void;
isCursorFrozen: boolean;
frozenCursorPosition: { x: number; y: number  | null;
viewportOffset: { x: number; y: number ;
mouseStateRef: React.MutableRefObject<{
isDraggingViewport: boolean;
isDraggingFurniture: boolean;
lastX: number;
lastY: number;
lastEvent: MouseEvent | null;
>;


export const useKeyboardInteractions = ({
socketRef,
hasConnected,
cursors,
selectedFurnitureId,
setSelectedFurnitureId,
isCursorFrozen,
frozenCursorPosition,
viewportOffset,
mouseStateRef
: KeyboardInteractionsProps) => {
const emojiCounterRef = useRef(0);
const lastEmoteTimeRef = useRef<{ [key: string]: number >({);
const pressedKeysRef = useRef<{ [key: string]: boolean >({);
const EMOTE_COOLDOWN_MS = 500; // 500ms cooldown between emotes

// Helper function to convert screen coordinates to canvas coordinates
const convertScreenToCanvas = (screenX: number, screenY: number) => {
return screenToCanvas(screenX, screenY, viewportOffset);
;

// Handle keyboard interactions (emotes and backspace)
useEffect(() => {
const handleKeyDown = (e: KeyboardEvent) => {
if (socketRef.current?.connected && hasConnected && socketRef.current.id) {
// Handle backspace for deleting selected furniture
if (e.key === 'Backspace' && selectedFurnitureId) {
e.preventDefault();
e.stopPropagation();

// Delete the selected furniture
if (socketRef.current) {
socketRef.current.emit('deleteFurniture', selectedFurnitureId);
setSelectedFurnitureId(null);

return;


const emoteMap: { [key: string]: string  = {
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

const emoteType = emoteMap[e.key];
if (emoteType) {
// Check if key is already pressed (prevent spam)
if (pressedKeysRef.current[e.key]) {
return;


// Check cooldown for this specific emote
const now = Date.now();
const lastEmoteTime = lastEmoteTimeRef.current[e.key] || 0;
if (now - lastEmoteTime < EMOTE_COOLDOWN_MS) {
return;


// Mark key as pressed
pressedKeysRef.current[e.key] = true;

// Update last emote time
lastEmoteTimeRef.current[e.key] = now;

const cursorX = isCursorFrozen && frozenCursorPosition ? frozenCursorPosition.x : cursors[socketRef.current.id]?.x || 0;
const cursorY = isCursorFrozen && frozenCursorPosition ? frozenCursorPosition.y : cursors[socketRef.current.id]?.y || 0;

let finalCursorX = cursorX;
let finalCursorY = cursorY;

if (cursorX === 0 && cursorY === 0 && mouseStateRef.current.lastEvent) {
const canvasCoords = convertScreenToCanvas(mouseStateRef.current.lastX, mouseStateRef.current.lastY);
finalCursorX = canvasCoords.x;
finalCursorY = canvasCoords.y;


const emoteX = finalCursorX - ANIMATION_CONSTANTS.Emote_OFFSET_X;
const emoteY = finalCursorY;

const emoteId = `${socketRef.current.id-${now-${++emojiCounterRef.current`;

socketRef.current.emit('resetStillTime');

socketRef.current.emit('spawnEmote', {
x: emoteX,
y: emoteY,
id: emoteId,
type: emoteType
);


;

const handleKeyUp = (e: KeyboardEvent) => {
// Mark key as released
pressedKeysRef.current[e.key] = false;
;

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

return () => {
window.removeEventListener('keydown', handleKeyDown);
window.removeEventListener('keyup', handleKeyUp);
;
, [hasConnected, isCursorFrozen, frozenCursorPosition, cursors, socketRef, viewportOffset, selectedFurnitureId, setSelectedFurnitureId, mouseStateRef]);
; 