import { useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { getDeviceId } from '../../utils/localStorage';

interface UseConnectionHandlersProps {
  socket: Socket | null;
  username: string;
  setHasConnected: (connected: boolean) => void;
  clickEnabledTimeRef: React.RefObject<number | null>;
}

export const useConnectionHandlers = ({
  socket,
  username,
  setHasConnected,
  clickEnabledTimeRef
}: UseConnectionHandlersProps) => {
  
  const handleConnect = useCallback(() => {
    if (username.trim() === '') return;
    if (socket?.connected) {
      // Use the username the user typed, not the stored one
      const userTypedUsername = username.trim();
      const deviceId = getDeviceId();
      
      // Send username and device ID to server for validation
      // Don't set hasConnected yet - wait for server response
      socket.emit('setName', { 
        name: userTypedUsername,
        deviceId: deviceId
      });
      
      // The server will respond with either:
      // - 'usernameError' if validation fails (connectionModal will stay open)
      // - 'cursors' update if validation succeeds (connectionModal will close)
    }
  }, [socket, username, setHasConnected, clickEnabledTimeRef]);

  return {
    handleConnect
  };
}; 