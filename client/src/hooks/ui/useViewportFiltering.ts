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
  circles,
  hearts,
  emotes,
  furniture,
  cursors,
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
        quality: 'low'
      };
    } else if (userCount > 20) {
      // Crowded - moderate quality reduction
      return {
        cursorUpdateInterval: 1500, // 1.5 seconds
        animationLimit: 10, // 10 animations visible
        quality: 'medium'
      };
    } else {
      // Normal - full quality
      return {
        cursorUpdateInterval: 1000, // 1 second
        animationLimit: 20, // All animations visible
        quality: 'high'
      };
    }
  }, [cursors]);

  const visibleCircles = useMemo(() => {
    const { animationLimit } = qualitySettings;
    const now = Date.now();
    
    const filtered = circles
      .filter(circle => {
        return now - circle.timestamp < 8000;
      })
      .slice(-animationLimit);
    
    return filtered;
  }, [circles, qualitySettings]);

  const visibleHearts = useMemo(() => {
    const { animationLimit } = qualitySettings;
    const now = Date.now();
    
    const filtered = hearts
      .filter(heart => {
        return now - heart.timestamp < 10000;
      })
      .slice(-animationLimit);
    
    return filtered;
  }, [hearts, qualitySettings]);

  const visibleEmotes = useMemo(() => {
    const { animationLimit } = qualitySettings;
    const now = Date.now();
    
    const filtered = emotes
      .filter(emote => {
        return now - emote.timestamp < 6000;
      })
      .slice(-animationLimit);
    
    return filtered;
  }, [emotes, qualitySettings]);

  const visibleFurniture = useMemo(() => {
    // Show all furniture - no filtering, even before connecting
    return Object.values(furniture);
  }, [furniture]);

  const visibleCursors = useMemo(() => {
    // Show all cursors - no filtering, even before connecting
    const filtered: [string, any][] = [];
    
    Object.entries(cursors).forEach(([id, cursor]) => {
      if (cursor && cursor.name) {
        filtered.push([id, cursor]);
      }
    });

    return filtered;
  }, [cursors]);

  return {
    visibleCircles,
    visibleHearts,
    visibleEmotes,
    visibleFurniture,
    visibleCursors,
    qualitySettings
  };
}; 