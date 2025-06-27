import { useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { 
  getUserStats, 
  recordFurniturePlacement, 
  canPlaceFurniture 
} from '../../utils/localStorage';
import { isGachaCollision } from '../../utils/gachapon';

interface UseFurnitureHandlersProps {
  socket: Socket | null;
  setUserStats: (stats: any) => void;
}

export const useFurnitureHandlers = ({
  socket,
  setUserStats
}: UseFurnitureHandlersProps) => {
  
  const handleMoveUp = useCallback((furnitureId: string) => {
    if (socket) {
      socket.emit('moveFurnitureUp', { furnitureId });
    }
  }, [socket]);

  const handleMoveDown = useCallback((furnitureId: string) => {
    if (socket) {
      socket.emit('moveFurnitureDown', { furnitureId });
    }
  }, [socket]);

  const handleFurnitureSpawn = useCallback((furnitureType: string, x: number, y: number) => {
    if (!canPlaceFurniture()) {
      console.log('Daily furniture placement limit reached (1000 items)');
      return;
    }
    
    // Check for collision with gacha machine
    if (isGachaCollision(furnitureType, x, y)) {
      console.log('Cannot place furniture on gacha machine');
      return;
    }
    
    if (socket) {
      socket.emit('spawnFurniture', {
        type: furnitureType,
        x,
        y
      });
      
      const success = recordFurniturePlacement(furnitureType);
      if (success) {
        setUserStats(getUserStats());
      }
    }
  }, [socket, setUserStats]);

  return {
    handleMoveUp,
    handleMoveDown,
    handleFurnitureSpawn
  };
}; 