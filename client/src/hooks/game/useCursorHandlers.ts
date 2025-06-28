import { useCallback  from 'react';
import { Socket  from 'socket.io-client';

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
socket.emit('changeCursor', cursor);

, [socket, setCursorType]);

return {
handleCursorChange
;
; 