import { useCallback  from 'react';
import { Socket  from 'socket.io-client';
import { saveCursorType  from '../../utils/localStorage';

interface UseCursorHandlersProps {
socket: Socket | null;
setCursorType: (type: string) => void;


export const useCursorHandlers = ({
socket,
setCursorType
: UseCursorHandlersProps) => {

const handleCursorChange = useCallback((cursor: { type: string ) => {
if (socket) {
setCursorType(cursor.type);
// Save cursor type to localStorage for persistence
saveCursorType(cursor.type);
socket.emit('changeCursor', cursor);

, [socket, setCursorType]);

return {
handleCursorChange
;
; 