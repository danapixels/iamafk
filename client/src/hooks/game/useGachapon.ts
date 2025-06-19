import { useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { getUserStats } from '../../utils/localStorage';

interface UseGachaponProps {
  socket: Socket | null;
  setUserStats: (stats: any) => void;
  setFrozenCursorPosition: (position: { x: number; y: number } | null) => void;
  setIsCursorFrozen: (frozen: boolean) => void;
}

export const useGachapon = ({
  socket,
  setUserStats,
  setFrozenCursorPosition,
  setIsCursorFrozen
}: UseGachaponProps) => {
  
  const handleGachaponUse = useCallback(() => {
    const updatedStats = getUserStats();
    setUserStats(updatedStats);
  }, [setUserStats]);

  const handleGachaponUnfreeze = useCallback(() => {
    setFrozenCursorPosition(null);
    setIsCursorFrozen(false);
    if (socket) {
      socket.emit('cursorFreeze', { 
        isFrozen: false,
        x: 0,
        y: 0
      });
    }
  }, [socket, setFrozenCursorPosition, setIsCursorFrozen]);

  return {
    handleGachaponUse,
    handleGachaponUnfreeze
  };
}; 