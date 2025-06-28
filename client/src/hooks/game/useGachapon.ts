import { useCallback  from 'react';
import { Socket  from 'socket.io-client';

interface UseGachaponProps {
socket: Socket | null;
deductAFKBalance: (seconds: number) => Promise<boolean>;
setFrozenCursorPosition: (position: { x: number; y: number  | null) => void;
setIsCursorFrozen: (frozen: boolean) => void;


export const useGachapon = ({
socket,
deductAFKBalance,
setFrozenCursorPosition,
setIsCursorFrozen
: UseGachaponProps) => {

const handleGachaponUse = useCallback(async () => {
// Deduct 30 seconds from AFK balance for gachapon use
const success = await deductAFKBalance(30);
if (!success) {
console.warn('Insufficient AFK balance for gachapon use');

, [deductAFKBalance]);

const handleGachaponUnfreeze = useCallback(() => {
setFrozenCursorPosition(null);
setIsCursorFrozen(false);
if (socket) {
socket.emit('cursorFreeze', { 
isFrozen: false,
x: 0,
y: 0
);

, [socket, setFrozenCursorPosition, setIsCursorFrozen]);

return {
handleGachaponUse,
handleGachaponUnfreeze
;
; 