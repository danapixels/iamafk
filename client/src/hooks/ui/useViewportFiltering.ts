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
  
  // Get viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const viewportDiagonal = Math.sqrt(viewportWidth * viewportWidth + viewportHeight * viewportHeight);
  
  // Progressive quality system based on user count and viewport size
  const qualitySettings = useMemo(() => {
    const userCount = Object.keys(cursors).length;
    
    // Base distances on viewport size
    const baseFurnitureDistance = viewportDiagonal * 0.8; // 80% of viewport diagonal
    const baseCursorDistance = viewportDiagonal * 1.2; // 120% of viewport diagonal
    
    if (userCount > 50) {
      // Very crowded - reduce quality significantly
      return {
        cursorUpdateInterval: 2000, // 2 seconds
        animationLimit: 5, // Only 5 animations visible
        furnitureRenderDistance: baseFurnitureDistance * 0.3, // 30% of base distance
        cursorRenderDistance: baseCursorDistance * 0.4, // 40% of base distance
        quality: 'low'
      };
    } else if (userCount > 20) {
      // Crowded - moderate quality reduction
      return {
        cursorUpdateInterval: 1500, // 1.5 seconds
        animationLimit: 10, // 10 animations visible
        furnitureRenderDistance: baseFurnitureDistance * 0.5, // 50% of base distance
        cursorRenderDistance: baseCursorDistance * 0.6, // 60% of base distance
        quality: 'medium'
      };
    } else {
      // Normal - full quality
      return {
        cursorUpdateInterval: 1000, // 1 second
        animationLimit: 20, // All animations visible
        furnitureRenderDistance: baseFurnitureDistance, // Full base distance
        cursorRenderDistance: baseCursorDistance, // Full base distance
        quality: 'high'
      };
    }
  }, [cursors, viewportDiagonal]);

  const visibleCircles = useMemo(() => {
    if (!hasConnected) return [];
    
    const { animationLimit } = qualitySettings;
    const now = Date.now();
    const buffer = 100; // Small buffer around viewport edges
    
    const filtered = circles
      .filter(circle => {
        const circleX = circle.x - viewportOffset.x;
        const circleY = circle.y - viewportOffset.y;
        return circleX >= -buffer && circleX <= viewportWidth + buffer &&
               circleY >= -buffer && circleY <= viewportHeight + buffer &&
               now - circle.timestamp < 8000;
      })
      .slice(-animationLimit); // Limit based on quality settings
    
    return filtered;
  }, [circles, viewportOffset, viewportWidth, viewportHeight, hasConnected, qualitySettings]);

  const visibleHearts = useMemo(() => {
    if (!hasConnected) return [];
    
    const { animationLimit } = qualitySettings;
    const now = Date.now();
    const buffer = 100; // Small buffer around viewport edges
    
    const filtered = hearts
      .filter(heart => {
        const heartX = heart.x - viewportOffset.x;
        const heartY = heart.y - viewportOffset.y;
        return heartX >= -buffer && heartX <= viewportWidth + buffer &&
               heartY >= -buffer && heartY <= viewportHeight + buffer &&
               now - heart.timestamp < 10000;
      })
      .slice(-animationLimit); // Limit based on quality settings
    
    return filtered;
  }, [hearts, viewportOffset, viewportWidth, viewportHeight, hasConnected, qualitySettings]);

  const visibleEmotes = useMemo(() => {
    if (!hasConnected) return [];
    
    const { animationLimit } = qualitySettings;
    const now = Date.now();
    const buffer = 100; // Small buffer around viewport edges
    
    const filtered = emotes
      .filter(emote => {
        const emoteX = emote.x - viewportOffset.x;
        const emoteY = emote.y - viewportOffset.y;
        return emoteX >= -buffer && emoteX <= viewportWidth + buffer &&
               emoteY >= -buffer && emoteY <= viewportHeight + buffer &&
               now - emote.timestamp < 6000;
      })
      .slice(-animationLimit); // Limit based on quality settings
    
    return filtered;
  }, [emotes, viewportOffset, viewportWidth, viewportHeight, hasConnected, qualitySettings]);

  const visibleFurniture = useMemo(() => {
    if (!hasConnected) return [];
    
    const { furnitureRenderDistance } = qualitySettings;
    const filtered: Furniture[] = [];
    
    Object.entries(furniture).forEach(([, item]) => {
      const furnitureX = item.x - viewportOffset.x;
      const furnitureY = item.y - viewportOffset.y;
      const distance = Math.sqrt(furnitureX * furnitureX + furnitureY * furnitureY);
      
      // Only render furniture within the viewport-based distance
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
        
        // Only show cursors within viewport-based distance
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