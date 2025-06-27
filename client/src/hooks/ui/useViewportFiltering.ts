import { useMemo } from 'react';
import { Socket } from 'socket.io-client';
import type { Circle, Heart, Emote, Furniture, CursorsMap } from '../../types';

interface ViewportFilteringProps {
  viewportOffset: { x: number; y: number };
  circles: Circle[];
  hearts: Heart[];
  emotes: Emote[];
  furniture: { [key: string]: Furniture };
  cursors: CursorsMap;
  socketRef: React.RefObject<Socket | null>;
  hasConnected: boolean;
}

export const useViewportFiltering = ({
  viewportOffset,
  circles,
  hearts,
  emotes,
  furniture,
  cursors,
  socketRef,
  hasConnected
}: ViewportFilteringProps) => {
  
  // Progressive quality system based on user count
  const qualitySettings = useMemo(() => {
    const userCount = Object.keys(cursors).length;
    
    if (userCount > 50) {
      // Very crowded - reduce quality significantly
      return {
        cursorUpdateInterval: 2000, // 2 seconds
        animationLimit: 5, // Only 5 animations visible
        furnitureRenderDistance: 300, // Only nearby furniture
        cursorRenderDistance: 400, // Only nearby cursors
        quality: 'low'
      };
    } else if (userCount > 20) {
      // Crowded - moderate quality reduction
      return {
        cursorUpdateInterval: 1500, // 1.5 seconds
        animationLimit: 10, // 10 animations visible
        furnitureRenderDistance: 500, // Medium distance furniture
        cursorRenderDistance: 600, // Medium distance cursors
        quality: 'medium'
      };
    } else {
      // Normal - full quality
      return {
        cursorUpdateInterval: 1000, // 1 second
        animationLimit: 20, // All animations visible
        furnitureRenderDistance: 1000, // All furniture visible
        cursorRenderDistance: 1200, // All cursors visible
        quality: 'high'
      };
    }
  }, [cursors]);

  const visibleCircles = useMemo(() => {
    if (!hasConnected) return [];
    
    const { animationLimit } = qualitySettings;
    const now = Date.now();
    const filtered = circles
      .filter(circle => {
        const circleX = circle.x - viewportOffset.x;
        const circleY = circle.y - viewportOffset.y;
        return circleX >= -100 && circleX <= window.innerWidth + 100 &&
               circleY >= -100 && circleY <= window.innerHeight + 100 &&
               now - circle.timestamp < 8000;
      })
      .slice(-animationLimit); // Limit based on quality settings
    
    return filtered;
  }, [circles, viewportOffset, hasConnected, qualitySettings]);

  const visibleHearts = useMemo(() => {
    if (!hasConnected) return [];
    
    const { animationLimit } = qualitySettings;
    const now = Date.now();
    const filtered = hearts
      .filter(heart => {
        const heartX = heart.x - viewportOffset.x;
        const heartY = heart.y - viewportOffset.y;
        return heartX >= -100 && heartX <= window.innerWidth + 100 &&
               heartY >= -100 && heartY <= window.innerHeight + 100 &&
               now - heart.timestamp < 10000;
      })
      .slice(-animationLimit); // Limit based on quality settings
    
    return filtered;
  }, [hearts, viewportOffset, hasConnected, qualitySettings]);

  const visibleEmotes = useMemo(() => {
    if (!hasConnected) return [];
    
    const { animationLimit } = qualitySettings;
    const now = Date.now();
    const filtered = emotes
      .filter(emote => {
        const emoteX = emote.x - viewportOffset.x;
        const emoteY = emote.y - viewportOffset.y;
        return emoteX >= -100 && emoteX <= window.innerWidth + 100 &&
               emoteY >= -100 && emoteY <= window.innerHeight + 100 &&
               now - emote.timestamp < 6000;
      })
      .slice(-animationLimit); // Limit based on quality settings
    
    return filtered;
  }, [emotes, viewportOffset, hasConnected, qualitySettings]);

  const visibleFurniture = useMemo(() => {
    if (!hasConnected) return [];
    
    const { furnitureRenderDistance } = qualitySettings;
    const filtered: Furniture[] = [];
    
    Object.entries(furniture).forEach(([, item]) => {
      const furnitureX = item.x - viewportOffset.x;
      const furnitureY = item.y - viewportOffset.y;
      const distance = Math.sqrt(furnitureX * furnitureX + furnitureY * furnitureY);
      
      // Only render furniture within the quality-based distance
      if (distance <= furnitureRenderDistance) {
        filtered.push(item);
      }
    });
    
    return filtered;
  }, [furniture, viewportOffset, hasConnected, qualitySettings]);

  const visibleCursors = useMemo(() => {
    if (!hasConnected) return [];
    
    const { cursorRenderDistance } = qualitySettings;
    const myCursor = cursors[socketRef.current?.id || ''];
    const filtered: [string, any][] = [];
    
    Object.entries(cursors).forEach(([id, cursor]) => {
      if (!cursor || !cursor.name) return;
      
      // Always show my own cursor
      if (id === socketRef.current?.id) {
        filtered.push([id, cursor]);
        return;
      }
      
      // Calculate distance from my cursor
      if (myCursor) {
        const distance = Math.sqrt(
          Math.pow(cursor.x - myCursor.x, 2) + 
          Math.pow(cursor.y - myCursor.y, 2)
        );
        
        // Only show cursors within quality-based distance
        if (distance <= cursorRenderDistance) {
          filtered.push([id, cursor]);
        }
      } else {
        // If no my cursor, show all cursors (fallback)
        filtered.push([id, cursor]);
      }
    });

    return filtered;
  }, [cursors, socketRef, hasConnected, qualitySettings]);

  return {
    visibleCircles,
    visibleHearts,
    visibleEmotes,
    visibleFurniture,
    visibleCursors,
    qualitySettings // Export for debugging/monitoring
  };
}; 