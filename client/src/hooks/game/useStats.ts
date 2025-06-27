import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { updateAFKTime, getUserStats, recordFurniturePlacement } from '../../utils/localStorage';

interface CursorData {
  x: number;
  y: number;
  name?: string;
  stillTime: number;
  cursorType?: string;
  isFrozen?: boolean;
  frozenPosition?: { x: number; y: number };
  sleepingOnBed?: boolean;
}

interface CursorsMap {
  [socketId: string]: CursorData;
}

export const useStats = (
  socketRef: React.RefObject<Socket | null>,
  hasConnected: boolean,
  cursors: CursorsMap,
  userStats: any,
  setUserStats: (stats: any) => void
) => {
  const afkStartTimeRef = useRef<number | null>(null);
  const lastStillTimeRef = useRef(0);
  const lastAFKUpdateRef = useRef(0);

  // Track AFK time and update localStorage
  useEffect(() => {
    if (!hasConnected || !userStats) {
      return;
    }

    // Immediate check when connecting
    const myCursor = cursors[socketRef.current?.id || ''];
    if (myCursor) {
      const currentStillTime = myCursor.stillTime;
      const isFrozen = myCursor.isFrozen || false;
      
      // Start tracking if user is already inactive for 30+ seconds
      if (currentStillTime >= 30 && !isFrozen && !afkStartTimeRef.current) {
        const inactiveStartTime = Date.now() - (currentStillTime * 1000);
        afkStartTimeRef.current = inactiveStartTime;
      }
    }

    const interval = setInterval(() => {
      const myCursor = cursors[socketRef.current?.id || ''];
      
      if (myCursor) {
        const currentStillTime = myCursor.stillTime;
        const isFrozen = myCursor.isFrozen || false;
        const lastStillTime = lastStillTimeRef.current;
        const now = Date.now();
        
        // Check if user just became AFK (stillTime >= 30 OR is frozen)
        if ((currentStillTime >= 30 || isFrozen) && lastStillTime < 30) {
          // If we don't have an AFK start time yet, start it now
          if (!afkStartTimeRef.current) {
            // Calculate when the user actually became inactive
            // The server's stillTime is in seconds, so we subtract that from now
            const inactiveStartTime = Date.now() - (currentStillTime * 1000);
            afkStartTimeRef.current = inactiveStartTime;
            lastAFKUpdateRef.current = now;
          }
        }
        
        // Check if user is no longer AFK (stillTime < 30 AND not frozen)
        if (currentStillTime < 30 && !isFrozen && lastStillTime >= 30) {
          if (afkStartTimeRef.current) {
            const afkDuration = Math.floor((Date.now() - afkStartTimeRef.current) / 1000);
            updateAFKTime(afkDuration);
            const updatedStats = getUserStats();
            setUserStats(updatedStats);
            afkStartTimeRef.current = null;
            lastAFKUpdateRef.current = 0;
          }
        }
        
        // Update AFK time every 30 seconds while AFK (including when frozen/sitting)
        if ((currentStillTime >= 30 || isFrozen) && afkStartTimeRef.current) {
          const timeSinceLastUpdate = now - lastAFKUpdateRef.current;
          if (timeSinceLastUpdate >= 30000) { // 30 seconds
            const afkDuration = Math.floor((Date.now() - afkStartTimeRef.current) / 1000);
            updateAFKTime(afkDuration);
            const updatedStats = getUserStats();
            setUserStats(updatedStats);
            lastAFKUpdateRef.current = now;
          }
        }
        
        lastStillTimeRef.current = currentStillTime;
      }
    }, 1000); // Check every 1 second (more responsive)

    return () => {
      clearInterval(interval);
    };
  }, [hasConnected, userStats, cursors, socketRef, setUserStats]);

  // Track furniture placement
  useEffect(() => {
    if (!hasConnected || !userStats) return;

    const handleFurnitureSpawned = (furnitureData: any) => {
      if (furnitureData.ownerId === socketRef.current?.id) {
        recordFurniturePlacement(furnitureData.type);
        setUserStats(getUserStats());
      }
    };

    if (socketRef.current) {
      socketRef.current.on('furnitureSpawned', handleFurnitureSpawned);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off('furnitureSpawned', handleFurnitureSpawned);
      }
    };
  }, [hasConnected, userStats, socketRef, setUserStats]);

  // Refresh userStats periodically to update the display
  useEffect(() => {
    if (!hasConnected) return;

    const interval = setInterval(() => {
      const currentStats = getUserStats();
      if (currentStats) {
        setUserStats(currentStats);
      }
    }, 1000); // Update every 1 second (more responsive)

    return () => clearInterval(interval);
  }, [hasConnected, setUserStats]);

  return { afkStartTimeRef };
}; 