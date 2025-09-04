import { useEffect } from 'react';
import { Socket } from 'socket.io-client';

export const useCursor = (
  socketRef: React.RefObject<Socket | null>,
  isCursorFrozen: boolean,
  setIsCursorFrozen: (frozen: boolean) => void,
  setFrozenCursorPosition: (pos: { x: number; y: number } | null) => void
) => {
  // adds click handler to unfreeze cursor
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // doesn't unfreeze if clicking on furniture controls
      const target = e.target as HTMLElement;
      if (target.closest('[data-furniture-control="true"]')) {
        return;
      }

      // unfreeze if clicking anywhere in the app (including panel)
      if (isCursorFrozen && socketRef.current) {
        // unfreeze the cursor
        setFrozenCursorPosition(null);
        setIsCursorFrozen(false);
        socketRef.current.emit('cursorFreeze', { 
          isFrozen: false,
          x: e.clientX,
          y: e.clientY
        });
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [isCursorFrozen, socketRef, setFrozenCursorPosition, setIsCursorFrozen]);
}; 