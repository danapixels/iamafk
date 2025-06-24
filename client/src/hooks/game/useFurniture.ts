import { useEffect } from 'react';
import { Socket } from 'socket.io-client';

interface Furniture {
  id: string;
  type: string;
  x: number;
  y: number;
  zIndex?: number;
  isFlipped?: boolean;
}

export const useFurniture = (
  socketRef: React.RefObject<Socket | null>,
  setFurniture: React.Dispatch<React.SetStateAction<{ [key: string]: Furniture }>>,
  setSelectedFurnitureId: React.Dispatch<React.SetStateAction<string | null>>,
  hasConnected: boolean,
  draggedFurnitureId?: React.MutableRefObject<string | null>,
  mouseStateRef?: React.MutableRefObject<any>
) => {
  // Socket listeners for furniture events
  useEffect(() => {
    if (!socketRef.current || !hasConnected) {
      return;
    }

    const socket = socketRef.current;

    socket.on('furnitureSpawned', (data: any) => {
      if (data && data.id) {
        setFurniture(prev => ({ ...prev, [data.id]: data }));
      }
    });

    socket.on('furnitureMoved', (data: any) => {
      // Ignore server updates for furniture currently being dragged by this client
      if (
        draggedFurnitureId &&
        mouseStateRef &&
        mouseStateRef.current.isDraggingFurniture &&
        draggedFurnitureId.current === data.id
      ) {
        return;
      }
      if (data && data.id) {
        setFurniture(prev => ({
          ...prev,
          [data.id]: {
            ...prev[data.id],
            x: data.x,
            y: data.y,
            isFlipped: data.isFlipped
          }
        }));
      }
    });

    socket.on('furnitureDeleted', (data: any) => {
      if (data && data.id) {
        setFurniture(prev => {
          const newFurniture = { ...prev };
          delete newFurniture[data.id];
          return newFurniture;
        });
        // Clear selection if the deleted furniture was selected
        setSelectedFurnitureId(prev => prev === data.id ? null : prev);
      }
    });

    socket.on('furnitureZIndexChanged', (data: { id: string, zIndex: number } | { id: string, zIndex: number }[]) => {
      if (Array.isArray(data)) {
        // Handle multiple z-index changes (for move up/down operations)
        setFurniture(prev => {
          const newFurniture = { ...prev };
          data.forEach(change => {
            if (newFurniture[change.id]) {
              newFurniture[change.id] = {
                ...newFurniture[change.id],
                zIndex: change.zIndex
              };
            }
          });
          return newFurniture;
        });
      } else {
        // Handle single z-index change
        setFurniture(prev => ({
          ...prev,
          [data.id]: {
            ...prev[data.id],
            zIndex: data.zIndex
          }
        }));
      }
    });

    socket.on('furnitureFlipped', (data: { id: string, isFlipped: boolean }) => {
      setFurniture(prev => ({
        ...prev,
        [data.id]: {
          ...prev[data.id],
          isFlipped: data.isFlipped
        }
      }));
    });

    socket.on('furnitureCleanup', (data: { cleanedCount: number }) => {
      // Optionally show a notification to users about cleanup
      if (data.cleanedCount > 0) {
        // You could add a toast notification here if desired
      }
    });

    return () => {
      socket.off('furnitureSpawned');
      socket.off('furnitureMoved');
      socket.off('furnitureDeleted');
      socket.off('furnitureZIndexChanged');
      socket.off('furnitureFlipped');
      socket.off('furnitureCleanup');
    };
  }, [socketRef, setFurniture, setSelectedFurnitureId, hasConnected, draggedFurnitureId, mouseStateRef]);
}; 