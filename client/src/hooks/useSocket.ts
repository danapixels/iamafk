import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { CursorsMap, Heart, Circle, Emoji, Furniture } from '../types';

interface UseSocketProps {
  username: string;
  hasConnected: boolean;
  setHasConnected: (connected: boolean) => void;
  setCursors: (cursors: CursorsMap) => void;
  setHearts: React.Dispatch<React.SetStateAction<Heart[]>>;
  setCircles: React.Dispatch<React.SetStateAction<Circle[]>>;
  setEmojis: React.Dispatch<React.SetStateAction<Emoji[]>>;
  setFurniture: React.Dispatch<React.SetStateAction<{ [key: string]: Furniture }>>;
  heartCounterRef: React.MutableRefObject<number>;
  circleCounterRef: React.MutableRefObject<number>;
  emojiCounterRef: React.MutableRefObject<number>;
}

export const useSocket = ({
  username,
  hasConnected,
  setHasConnected,
  setCursors,
  setHearts,
  setCircles,
  setEmojis,
  setFurniture,
  heartCounterRef,
  circleCounterRef,
  emojiCounterRef
}: UseSocketProps) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!hasConnected) return;

    const socket = io('http://localhost:3001');
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to server');
      socket.emit('setUsername', username);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setHasConnected(false);
    });

    socket.on('cursorsUpdate', (cursors: CursorsMap) => {
      setCursors(cursors);
    });

    socket.on('heartSpawned', (heart: Heart) => {
      setHearts(prev => [...prev, heart]);
    });

    socket.on('circleSpawned', (circle: Circle) => {
      setCircles(prev => [...prev, circle]);
    });

    socket.on('emojiSpawned', (emoji: Emoji) => {
      setEmojis(prev => [...prev, emoji]);
    });

    socket.on('furnitureSpawned', (furniture: Furniture) => {
      setFurniture(prev => ({ ...prev, [furniture.id]: furniture }));
    });

    socket.on('furnitureMoved', ({ id, x, y, isFlipped }: { id: string; x: number; y: number; isFlipped?: boolean }) => {
      setFurniture(prev => ({
        ...prev,
        [id]: { ...prev[id], x, y, ...(isFlipped !== undefined && { isFlipped }) }
      }));
    });

    socket.on('furnitureFlipped', ({ id, isFlipped }: { id: string; isFlipped: boolean }) => {
      setFurniture(prev => ({
        ...prev,
        [id]: { ...prev[id], isFlipped }
      }));
    });

    socket.on('furnitureDeleted', (furnitureId: string) => {
      setFurniture(prev => {
        const newFurniture = { ...prev };
        delete newFurniture[furnitureId];
        return newFurniture;
      });
    });

    socket.on('furnitureZIndexChanged', ({ id, zIndex }: { id: string; zIndex: number }) => {
      setFurniture(prev => ({
        ...prev,
        [id]: { ...prev[id], zIndex }
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [hasConnected, username, setHasConnected, setCursors, setHearts, setCircles, setEmojis, setFurniture, heartCounterRef, circleCounterRef, emojiCounterRef]);

  return socketRef;
}; 