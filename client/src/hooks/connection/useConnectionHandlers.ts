import { useCallback  from 'react';
import { Socket  from 'socket.io-client';
import { getDeviceId  from '../../utils/localStorage';

interface UseConnectionHandlersProps {
socket: Socket | null;
username: string;
setHasConnected: (connected: boolean) => void;
clickEnabledTimeRef: React.RefObject<number | null>;


export const useConnectionHandlers = ({
socket,
username,
setHasConnected,
clickEnabledTimeRef
: UseConnectionHandlersProps) => {

const handleConnect = useCallback(() => {
if (username.trim() === '') return;
if (socket?.connected) {
// typed username
const userTypedUsername = username.trim();
const deviceId = getDeviceId();

// sends username and device ID to server for validation
socket.emit('setName', { 
name: userTypedUsername,
deviceId: deviceId
);


, [socket, username, setHasConnected, clickEnabledTimeRef]);

return {
handleConnect
;
; 