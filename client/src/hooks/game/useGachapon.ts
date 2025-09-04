import { useCallback } from 'react';
import { Socket } from 'socket.io-client';

interface UseGachaponProps {
  socket: Socket | null;
  setFrozenCursorPosition: (position: { x: number; y: number } | null) => void;
  setIsCursorFrozen: (frozen: boolean) => void;
}

export const useGachapon = ({
  socket,
  setFrozenCursorPosition,
  setIsCursorFrozen
}: UseGachaponProps) => {
  
  const handleGachaponUse = useCallback(() => {
    // after AFK balance removed by the gacha machine
  }, []);

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