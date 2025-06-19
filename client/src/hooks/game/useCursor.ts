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

const interval = setInterval(() => {
const socket = socketRef.current;
const myCursor = cursors[socket?.id || ''];
if (socket && myCursor) {
// Send current position to server for stillTime calculation
socket.emit('cursorMove', {
x: myCursor.x,
y: myCursor.y,
name: username
);

, 1000); // Send update every second

return () => clearInterval(interval);
, [hasConnected, cursors, username, socketRef]);
; 