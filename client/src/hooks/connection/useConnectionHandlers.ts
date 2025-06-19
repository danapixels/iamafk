import { useCallback  from 'react';
import { Socket  from 'socket.io-client';
import { 
initializeUserData, 
getSavedCursorType, 
saveUsername 
 from '../../utils/localStorage';
import { 
updateAFKTime, 
getUserStats, 
recordFurniturePlacement 
 from '../../utils/localStorage';

interface UseConnectionHandlersProps {
socket: Socket | null;
username: string;
setHasConnected: (connected: boolean) => void;
setUserStats: (stats: any) => void;
clickEnabledTimeRef: React.RefObject<number | null>;


export const useConnectionHandlers = ({
socket,
username,
setHasConnected,
setUserStats,
clickEnabledTimeRef
: UseConnectionHandlersProps) => {

const handleConnect = useCallback(() => {
if (username.trim() === '') return;
if (socket?.connected) {
socket.emit('setName', { name: username.trim() );

const savedCursorType = getSavedCursorType();
if (savedCursorType) {
socket.emit('changeCursor', { type: savedCursorType );


setHasConnected(true);
clickEnabledTimeRef.current = Date.now() + 300;

const userData = initializeUserData(username.trim());
setUserStats(userData.stats);
saveUsername(username.trim());

, [socket, username, setHasConnected, setUserStats, clickEnabledTimeRef]);

return {
handleConnect
;
; 