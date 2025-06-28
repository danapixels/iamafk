import { useEffect  from 'react';
import { Socket  from 'socket.io-client';

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


export const useCursor = (
socketRef: React.RefObject<Socket | null>,
hasConnected: boolean,
cursors: CursorsMap,
username: string,
isCursorFrozen: boolean,
setIsCursorFrozen: (frozen: boolean) => void,
setFrozenCursorPosition: (pos: { x: number; y: number  | null) => void
) => {
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
, [isCursorFrozen, socketRef, setFrozenCursorPosition, setIsCursorFrozen]);

// Send periodic cursor updates to track AFK time
useEffect(() => {
if (!hasConnected || !socketRef.current) return;

let isPageVisible = !document.hidden;
let interval: ReturnType<typeof setInterval> | null = null;

const startInterval = () => {
if (interval) clearInterval(interval);

interval = setInterval(() => {
// Only send updates if page is visible
if (!isPageVisible) return;

const socket = socketRef.current;
const myCursor = cursors[socket?.id || ''];
if (socket && myCursor) {
// Send current position to server for stillTime calculation
socket.emit('cursorMove', {
x: myCursor.x,
y: myCursor.y,
name: username
);

, 2000); // Increased from 1000ms to 2000ms to reduce server load
;

const handleVisibilityChange = () => {
isPageVisible = !document.hidden;

if (isPageVisible) {
// Resume interval when page becomes visible
startInterval();
 else {
// Clear interval when page becomes hidden
if (interval) {
clearInterval(interval);
interval = null;


;

document.addEventListener('visibilitychange', handleVisibilityChange);

// Start the interval initially
startInterval();

return () => {
if (interval) clearInterval(interval);
document.removeEventListener('visibilitychange', handleVisibilityChange);
;
, [hasConnected, cursors, username, socketRef]);
; 