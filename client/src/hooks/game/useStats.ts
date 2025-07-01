import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';

console.log("👀 useStats hook loaded");

export const useStats = (
  socketRef: React.RefObject<Socket | null>,
  hasConnected: boolean
) => {
  const afkStartTimeRef = useRef<number | null>(null);

  // Simplified: Just request stats periodically from server
  useEffect(() => {
    if (!hasConnected || !socketRef.current) {
      return;
    }

    // Request initial stats
    socketRef.current.emit('requestUserStats');

    // Request stats every 10 seconds to keep them updated (more frequent for AFK time)
    const interval = setInterval(() => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('requestUserStats');
      }
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [hasConnected, socketRef]);

  return {
    afkStartTimeRef
  };
}; 