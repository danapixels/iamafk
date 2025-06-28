import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';

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
  updateAFKTime: (seconds: number) => Promise<boolean>
) => {
  const afkStartTimeRef = useRef<number | null>(null);
  const lastStillTimeRef = useRef(0);
  const lastAFKUpdateRef = useRef(0);

  // Track AFK time and update server
  useEffect(() => {
    if (!hasConnected || !userStats) {
      return;
    }

    let isPageVisible = !document.hidden;
    let interval: ReturnType<typeof setInterval> | null = null;

    // Immediate check when connecting
    const myCursor = cursors[socketRef.current?.id || ''];
    if (myCursor) {
      const currentStillTime = myCursor.stillTime;
      const isFrozen = myCursor.isFrozen || false;
      
      // Start tracking if user is already inactive for 30+ seconds
      if (currentStillTime >= 30 && !isFrozen && !afkStartTimeRef.current) {
        // Don't count the existing stillTime as AFK time - start fresh
        afkStartTimeRef.current = Date.now();
        lastAFKUpdateRef.current = Date.now();
      }
    }

    const startInterval = () => {
      if (interval) clearInterval(interval);
      
      interval = setInterval(async () => {
        // Only process AFK tracking if page is visible
        if (!isPageVisible) return;
        
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
              afkStartTimeRef.current = now;
              lastAFKUpdateRef.current = now;
            }
          }
          
          // Check if user is no longer AFK (stillTime < 30 AND not frozen)
          if (currentStillTime < 30 && !isFrozen && lastStillTime >= 30) {
            if (afkStartTimeRef.current) {
              // Calculate only the incremental time since last update
              const incrementalTime = Math.floor((now - lastAFKUpdateRef.current) / 1000);
              if (incrementalTime > 0) {
                await updateAFKTime(incrementalTime);
              }
              afkStartTimeRef.current = null;
              lastAFKUpdateRef.current = 0;
            }
          }
          
          // Update AFK time every 60 seconds while AFK (increased from 30 to reduce frequency)
          if ((currentStillTime >= 30 || isFrozen) && afkStartTimeRef.current) {
            const timeSinceLastUpdate = now - lastAFKUpdateRef.current;
            if (timeSinceLastUpdate >= 60000) { // 60 seconds (increased from 30)
              // Calculate only the incremental time since last update
              const incrementalTime = Math.floor(timeSinceLastUpdate / 1000);
              await updateAFKTime(incrementalTime);
              lastAFKUpdateRef.current = now;
            }
          }
          
          lastStillTimeRef.current = currentStillTime;
        }
      }, 2000); // Increased from 1000ms to 2000ms to reduce client load
    };

    const handleVisibilityChange = () => {
      isPageVisible = !document.hidden;
      
      if (isPageVisible) {
        // Resume interval when page becomes visible
        startInterval();
      } else {
        // Clear interval when page becomes hidden
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Start the interval initially
    startInterval();

    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasConnected, userStats, cursors, socketRef, updateAFKTime]);

  return { afkStartTimeRef };
}; 