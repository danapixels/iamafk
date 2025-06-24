import { useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { 
  initializeUserData, 
  getSavedCursorType, 
  saveUsername,
  getUserData
} from '../../utils/localStorage';

interface UseConnectionHandlersProps {
  socket: Socket | null;
  username: string;
  setHasConnected: (connected: boolean) => void;
  setUserStats: (stats: any) => void;
  clickEnabledTimeRef: React.RefObject<number | null>;
}

export const useConnectionHandlers = ({
  socket,
  username,
  setHasConnected,
  setUserStats,
  clickEnabledTimeRef
}: UseConnectionHandlersProps) => {
  
  const handleConnect = useCallback(() => {
    if (username.trim() === '') return;
    if (socket?.connected) {
      // Get the unique username from user data for server connection
      const userData = getUserData();
      const uniqueUsername = userData?.stats?.username || username.trim();
      
      socket.emit('setName', { name: uniqueUsername });
      
      const savedCursorType = getSavedCursorType();
      if (savedCursorType) {
        socket.emit('changeCursor', { type: savedCursorType });
      }
      
      setHasConnected(true);
      clickEnabledTimeRef.current = Date.now() + 300;
      
      const newUserData = initializeUserData(username.trim());
      setUserStats(newUserData.stats);
      saveUsername(username.trim());
    }
  }, [socket, username, setHasConnected, setUserStats, clickEnabledTimeRef]);

  return {
    handleConnect
  };
}; 