import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import './App.css';
import Panel from './Panel';

interface CursorData {
  x: number;
  y: number;
  name?: string;
  stillTime: number;
  cursorType?: string;
  isFrozen?: boolean;
  frozenPosition?: { x: number; y: number };
}

interface CursorsMap {
  [socketId: string]: CursorData;
}

interface Heart {
  id: string;
  x: number;
  y: number;
  timestamp: number;
}

interface Circle {
  id: string;
  x: number;
  y: number;
  timestamp: number;
}

interface Furniture {
  id: string;
  type: string;
  x: number;
  y: number;
  zIndex?: number;
  isFlipped?: boolean;
}

interface PanelProps {
  socket: Socket | null;
  onCursorChange: (type: string) => void;
  isDeleteMode: boolean;
  onDeleteModeChange: (isDeleteMode: boolean) => void;
  isDeleteButtonHovered: boolean;
  style?: React.CSSProperties;
}

const FURNITURE_IMAGES: { [key: string]: string } = {
  chair: './UI/chair.png',
  lamp: './UI/lamp.png',
  bed: './UI/bed.png',
  walls: './UI/walls1.png',
  plant1: './UI/plant1.png',
  plant2: './UI/plant2.png',
  blackcat: './UI/blackcat.png',
  whitecat: './UI/whitecat.png'
};

function App() {
  const [cursors, setCursors] = useState<CursorsMap>({});
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [furniture, setFurniture] = useState<{ [key: string]: Furniture }>({});
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const heartCounterRef = useRef(0);
  const circleCounterRef = useRef(0);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const draggedFurnitureId = useRef<string | null>(null);

  const [username, setUsername] = useState('');
  const usernameRef = useRef(username);
  const [hasConnected, setHasConnected] = useState(false);
  const clickEnabledTimeRef = useRef<number | null>(null);
  const [cursorType, setCursorType] = useState<string>('default');
  const [isDeleteButtonHovered, setIsDeleteButtonHovered] = useState(false);
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null);
  const [furnitureZIndices, setFurnitureZIndices] = useState<{ [key: string]: number }>({});
  const furnitureRefs = useRef<{ [key: string]: HTMLImageElement | null }>({});
  const [furnitureFlipped, setFurnitureFlipped] = useState<{ [key: string]: boolean }>({});
  const [isCursorFrozen, setIsCursorFrozen] = useState(false);
  const [frozenCursorPosition, setFrozenCursorPosition] = useState<{ x: number; y: number } | null>(null);

  const HEART_DURATION = 800;
  const CIRCLE_DURATION = 600;

  // Add constants for z-index layers
  const Z_INDEX_LAYERS = {
    CURSORS: 9997,
    PANEL: 9996,
    LOGO: 9995,
    FURNITURE: 9993, // Base z-index for furniture
    MIN_FURNITURE: 9993, // Minimum z-index for furniture
    MAX_FURNITURE: 9994  // Maximum z-index for furniture (below cursors and panel)
  };

  useEffect(() => {
    usernameRef.current = username;
  }, [username]);

  useEffect(() => {
    const socket = io('http://localhost:3001');
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Connected with id:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected');
      setHasConnected(false);
      setCursors({});
      setHearts([]);
      setCircles([]);
    });

    socket.on('cursors', (newCursors: CursorsMap) => {
      setCursors(newCursors);
    });

    socket.on('heartSpawned', (heartData) => {
      setHearts((prev) => [...prev, { ...heartData, timestamp: Date.now() }]);
    });

    socket.on('circleSpawned', (circleData) => {
      setCircles((prev) => [...prev, { ...circleData, timestamp: Date.now() }]);
    });

    socket.on('clientDisconnected', (id: string) => {
      setCursors((prev) => {
        const newCursors = { ...prev };
        delete newCursors[id];
        return newCursors;
      });
    });

    socket.on('cursorChanged', (data: { id: string; type: string }) => {
      console.log('Cursor changed:', data.id, 'to type:', data.type);
      setCursors((prev) => {
        const newCursors = {
          ...prev,
          [data.id]: {
            ...prev[data.id],
            cursorType: data.type,
          },
        };
        console.log('Updated cursors:', newCursors);
        return newCursors;
      });
      if (data.id === socket.id) {
        console.log('Updating local cursor type to:', data.type);
        setCursorType(data.type);
      }
    });

    socket.on('initialState', (data: { cursors: CursorsMap, furniture: { [key: string]: Furniture } }) => {
      console.log('Received initial state');
      setCursors(data.cursors);
      setFurniture(data.furniture);
      // Initialize flipped state from furniture data
      const initialFlippedState: { [key: string]: boolean } = {};
      Object.entries(data.furniture).forEach(([id, item]) => {
        if (item.isFlipped === true || item.isFlipped === false) {
          initialFlippedState[id] = item.isFlipped;
        }
      });
      setFurnitureFlipped(initialFlippedState);
    });

    socket.on('clientConnected', (data: { id: string, cursors: CursorsMap }) => {
      console.log('Client connected:', data.id);
      setCursors(data.cursors);
    });

    socket.on('furnitureSpawned', (furniture: Furniture) => {
      console.log('Furniture spawned:', furniture.type);
      // Set initial position to center of viewport for the spawning user
      const initialFurniture = {
        ...furniture,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      };
      
      // Update local state
      setFurniture(prev => ({
        ...prev,
        [furniture.id]: initialFurniture
      }));

      // Deselect any currently selected furniture
      setSelectedFurnitureId(null);

      // Send initial position to server
      if (socketRef.current) {
        socketRef.current.emit('updateFurniturePosition', {
          furnitureId: furniture.id,
          x: initialFurniture.x,
          y: initialFurniture.y
        });
      }
    });

    socket.on('furnitureMoved', (data: { id: string, x: number, y: number, isFlipped?: boolean }) => {
      setFurniture(prev => ({
        ...prev,
        [data.id]: { 
          ...prev[data.id], 
          x: data.x, 
          y: data.y,
          isFlipped: data.isFlipped
        }
      }));
      if (data.isFlipped === true || data.isFlipped === false) {
        setFurnitureFlipped(prev => ({
          ...prev,
          [data.id]: data.isFlipped as boolean
        }));
      }
    });

    socket.on('furnitureDeleted', (data: { id: string }) => {
      setFurniture(prev => {
        const newFurniture = { ...prev };
        delete newFurniture[data.id];
        return newFurniture;
      });
    });

    const handleMouseMove = (e: MouseEvent) => {
      if (!socket.connected) return;
      socket.emit('cursorMove', {
        x: e.clientX,
        y: e.clientY,
        name: usernameRef.current.trim(),
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      socket.disconnect();
      socket.off('initialState');
      socket.off('clientConnected');
      socket.off('furnitureSpawned');
      socket.off('furnitureMoved');
      socket.off('furnitureDeleted');
    };
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const now = Date.now();
      if (
        !socketRef.current?.connected ||
        !hasConnected ||
        (clickEnabledTimeRef.current !== null && now < clickEnabledTimeRef.current)
      ) {
        return;
      }

      socketRef.current.emit('resetStillTime');

      const circleId = `${socketRef.current.id}-${now}-${++circleCounterRef.current}`;
      socketRef.current.emit('spawnCircle', {
        x: e.clientX,
        y: e.clientY,
        id: circleId,
      });
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [hasConnected]);

  useEffect(() => {
    const handleDoubleClick = (e: MouseEvent) => {
      const now = Date.now();
      if (!socketRef.current?.connected || !hasConnected) return;

      socketRef.current.emit('resetStillTime');

      const heartId = `${socketRef.current.id}-${now}-${++heartCounterRef.current}`;
      socketRef.current.emit('spawnHeart', {
        x: e.clientX,
        y: e.clientY,
        id: heartId,
      });
    };

    window.addEventListener('dblclick', handleDoubleClick);
    return () => window.removeEventListener('dblclick', handleDoubleClick);
  }, [hasConnected]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggedFurnitureId.current && dragStartPos.current) {
        const dx = e.clientX - dragStartPos.current.x;
        const dy = e.clientY - dragStartPos.current.y;
        
        // Check if furniture is over delete button
        const deleteButton = document.querySelector('.button[src*="deletefurniturebutton.png"], .button[src*="furnitureselectedbutton.png"], .button[src*="furniturehoverbutton.png"]');
        if (deleteButton) {
          const rect = deleteButton.getBoundingClientRect();
          const item = furniture[draggedFurnitureId.current];
          if (item && 
              e.clientX >= rect.left && 
              e.clientX <= rect.right && 
              e.clientY >= rect.top && 
              e.clientY <= rect.bottom) {
            setIsDeleteButtonHovered(true);
          } else {
            setIsDeleteButtonHovered(false);
          }
        }
        
        // Update furniture position
        if (draggedFurnitureId.current && socketRef.current) {
          const item = furniture[draggedFurnitureId.current];
          if (item) {
            const newX = item.x + dx;
            const newY = item.y + dy;
            
            // Create a new furniture object to force re-render
            const updatedFurniture = {
              ...furniture,
              [draggedFurnitureId.current]: {
                ...item,
                x: newX,
                y: newY
              }
            };
            
            // Update state with new object
            setFurniture(updatedFurniture);
            
            // Emit position update to server
            socketRef.current.emit('updateFurniturePosition', {
              furnitureId: draggedFurnitureId.current,
              x: newX,
              y: newY
            });
          }
        }

        dragStartPos.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (draggedFurnitureId.current) {
        if (isDeleteButtonHovered && socketRef.current) {
          // Delete the furniture
          socketRef.current.emit('deleteFurniture', draggedFurnitureId.current);
          // Immediately remove from local state
          setFurniture(prev => {
            const newFurniture = { ...prev };
            delete newFurniture[draggedFurnitureId.current!];
            return newFurniture;
          });
        }
        setIsDeleteButtonHovered(false);
        draggedFurnitureId.current = null;
        dragStartPos.current = null;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [furniture, isDeleteButtonHovered]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setHearts((prev) => prev.filter((heart) => now - heart.timestamp < HEART_DURATION));
      setCircles((prev) => prev.filter((circle) => now - circle.timestamp < CIRCLE_DURATION));
    }, 16);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const now = Date.now();
        setHearts((prev) => prev.filter((heart) => now - heart.timestamp < HEART_DURATION));
        setCircles((prev) => prev.filter((circle) => now - circle.timestamp < CIRCLE_DURATION));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, []);

  const handleConnect = () => {
    if (username.trim() === '') return;
    if (socketRef.current?.connected) {
      socketRef.current.emit('setName', { name: username.trim() });
      setHasConnected(true);
      clickEnabledTimeRef.current = Date.now() + 300;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleCursorChange = (cursor: { type: string }) => {
    if (socketRef.current) {
      setCursorType(cursor.type);
      socketRef.current.emit('changeCursor', cursor);
    }
  };

  const getHighestAFKPlayer = () => {
    let highestAFK = { name: '', time: 0 };
    Object.entries(cursors).forEach(([_, cursor]) => {
      if (cursor.stillTime > highestAFK.time && cursor.name && cursor.name !== 'Anonymous') {
        highestAFK = { name: cursor.name, time: cursor.stillTime };
      }
    });
    return highestAFK;
  };

  const handleFurnitureMouseDown = (e: React.MouseEvent, furnitureId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedFurnitureId(furnitureId);
    // Allow any user to drag any furniture
    draggedFurnitureId.current = furnitureId;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMoveUp = (furnitureId: string) => {
    if (socketRef.current) {
      const currentZIndex = furnitureZIndices[furnitureId] || 0;
      const newZIndex = Math.min(currentZIndex + 1, Z_INDEX_LAYERS.MAX_FURNITURE - Z_INDEX_LAYERS.FURNITURE);
      setFurnitureZIndices(prev => ({
        ...prev,
        [furnitureId]: newZIndex
      }));
      socketRef.current.emit('updateFurnitureZIndex', { furnitureId, zIndex: newZIndex });
    }
  };

  const handleMoveDown = (furnitureId: string) => {
    if (socketRef.current) {
      const currentZIndex = furnitureZIndices[furnitureId] || 0;
      const newZIndex = Math.max(0, currentZIndex - 1);
      setFurnitureZIndices(prev => ({
        ...prev,
        [furnitureId]: newZIndex
      }));
      socketRef.current.emit('updateFurnitureZIndex', { furnitureId, zIndex: newZIndex });
    }
  };

  // Deselect furniture when clicking on the background
  useEffect(() => {
    const handleDeselect = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Only deselect if clicking on the background (app-root)
      if (target.id === 'app-root' || target.closest('#app-root') === target) {
        setSelectedFurnitureId(null);
      }
    };
    window.addEventListener('mousedown', handleDeselect);
    return () => window.removeEventListener('mousedown', handleDeselect);
  }, []);

  // Add function to get container position
  const getContainerPosition = (item: Furniture) => {
    const imgElement = furnitureRefs.current[item.id];
    if (!imgElement) return { left: item.x + 50, top: item.y };

    const rect = imgElement.getBoundingClientRect();
    const borderWidth = selectedFurnitureId === item.id ? 1 : 0; // Account for selection border
    const containerOffset = 2; // Space between furniture and container

    return {
      left: rect.right + containerOffset,
      top: rect.top + (rect.height / 2),
      bottom: rect.bottom + containerOffset,
      topEdge: rect.top - containerOffset, // Add top edge position
      bottomEdge: rect.bottom + containerOffset // Add bottom edge position
    };
  };

  const handleMoveLeft = (furnitureId: string) => {
    if (socketRef.current) {
      const item = furniture[furnitureId];
      if (item) {
        const newFlipped = !furnitureFlipped[furnitureId];
        
        // Update local state
        setFurnitureFlipped(prev => ({
          ...prev,
          [furnitureId]: newFlipped
        }));

        // Emit to server
        socketRef.current.emit('updateFurniturePosition', {
          furnitureId,
          x: item.x,
          y: item.y,
          isFlipped: newFlipped
        });
      }
    }
  };

  const handleMoveRight = (furnitureId: string) => {
    if (socketRef.current) {
      const item = furniture[furnitureId];
      if (item) {
        const newFlipped = !furnitureFlipped[furnitureId];
        
        // Update local state
        setFurnitureFlipped(prev => ({
          ...prev,
          [furnitureId]: newFlipped
        }));

        // Emit to server
        socketRef.current.emit('updateFurniturePosition', {
          furnitureId,
          x: item.x,
          y: item.y,
          isFlipped: newFlipped
        });
      }
    }
  };

  // Add socket listener for furniture flip updates
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on('furnitureFlipped', (data: { id: string, isFlipped: boolean }) => {
        setFurnitureFlipped(prev => ({
          ...prev,
          [data.id]: data.isFlipped
        }));
      });
    }
  }, []);

  // Modify the cursor move handler to respect frozen state
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!socketRef.current?.connected || isCursorFrozen) return;
      socketRef.current.emit('cursorMove', {
        x: e.clientX,
        y: e.clientY,
        name: usernameRef.current.trim(),
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isCursorFrozen]);

  // Add socket listener for cursor freeze updates
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on('cursorFrozen', (data: { 
        id: string, 
        isFrozen: boolean,
        frozenPosition?: { x: number; y: number }
      }) => {
        if (data.id === socketRef.current?.id) {
          setIsCursorFrozen(data.isFrozen);
          if (data.isFrozen && data.frozenPosition) {
            setFrozenCursorPosition(data.frozenPosition);
          } else {
            setFrozenCursorPosition(null);
          }
        }
        // Update the cursors state with the frozen position
        setCursors(prev => {
          const newCursors = { ...prev };
          if (newCursors[data.id]) {
            newCursors[data.id].isFrozen = data.isFrozen;
            if (data.isFrozen && data.frozenPosition) {
              newCursors[data.id].frozenPosition = data.frozenPosition;
            } else {
              delete newCursors[data.id].frozenPosition;
            }
          }
          return newCursors;
        });
      });
    }
  }, []);

  // Add click handler to unfreeze cursor
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Don't unfreeze if clicking on furniture controls or panel
      const target = e.target as HTMLElement;
      if (target.closest('[data-furniture-control="true"]') || 
          target.closest('.panel-container')) {
        return;
      }

      // Only unfreeze if clicking on the main app area
      if (target.closest('#app-root') && isCursorFrozen && socketRef.current) {
        // Unfreeze the cursor
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
  }, [isCursorFrozen]);

  const handleFurnitureDoubleClick = (e: React.MouseEvent, furnitureId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const item = furniture[furnitureId];
    if (item && (item.type === 'bed' || item.type === 'chair')) {
      // Clear selection state when double-clicking bed or chair
      setSelectedFurnitureId(null);
      
      if (!isCursorFrozen) {
        // When freezing, store the current cursor position
        const frozenPos = { x: e.clientX, y: e.clientY };
        setFrozenCursorPosition(frozenPos);
        if (socketRef.current) {
          socketRef.current.emit('cursorFreeze', { 
            isFrozen: true,
            x: frozenPos.x,
            y: frozenPos.y
          });
        }
      } else {
        // When unfreezing via double-click on furniture, clear the frozen position
        setFrozenCursorPosition(null);
        if (socketRef.current) {
          socketRef.current.emit('cursorFreeze', { 
            isFrozen: false,
            x: e.clientX,
            y: e.clientY
          });
        }
      }
      setIsCursorFrozen(!isCursorFrozen);
    }
  };

  return (
    <div 
      id="app-root" 
      className={hasConnected ? (isCursorFrozen ? '' : 'cursor-hidden') : ''} 
      style={{ 
        userSelect: 'none',
        cursor: hasConnected ? (isCursorFrozen ? 'default' : 'none') : 'default',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Panel 
        socket={socketRef.current} 
        onCursorChange={handleCursorChange} 
        isDeleteMode={isDeleteMode}
        onDeleteModeChange={setIsDeleteMode}
        isDeleteButtonHovered={isDeleteButtonHovered}
        style={{ zIndex: Z_INDEX_LAYERS.PANEL }}
      />
      <div id="logo-container" style={{ zIndex: Z_INDEX_LAYERS.LOGO }}>
        <div className="logo-row">
        <img src="./UI/logo.png" alt="Logo" id="logo" />
          <a 
            href="https://github.com/danafk/iamafk" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ pointerEvents: 'all' }}
          >
            <img src="./UI/github.png" alt="GitHub" id="github-logo" />
          </a>
        </div>
        <div style={{ position: 'relative', margin: 0, padding: 0 }}>
          <img src="./UI/leaderboard.png" alt="Leaderboard" id="leaderboard" />
          <div style={{ 
            position: 'absolute', 
            top: 'calc(50% + 12px)', 
            left: 'calc(50% + 38px)', 
            transform: 'translate(-50%, -50%)',
            fontFamily: '"Press Start 2P", cursive',
            fontSize: '0.5rem',
            color: 'white',
            textShadow: '2px 2px 0 #000',
            textAlign: 'left',
            width: '100%',
            pointerEvents: 'none',
            maxWidth: '200px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {getHighestAFKPlayer().name.length > 8 
              ? `${getHighestAFKPlayer().name.slice(0, 8)}⋯`
              : getHighestAFKPlayer().name}
          </div>
        </div>
      </div>

      {!hasConnected && (
        <div id="modal-overlay">
          <div className="form-container">
            <label htmlFor="username">What should everyone know you as when you're away?</label>
            <input
              id="username"
              className="input-global"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Type a name.."
            />
            <button onClick={handleConnect} disabled={username.trim() === ''}>
              Connect
            </button>
          </div>
        </div>
      )}

      {circles.map((circle) => {
        const age = Date.now() - circle.timestamp;
        if (age >= CIRCLE_DURATION) return null;

        const progress = age / CIRCLE_DURATION;
        let opacity = progress < 0.2 ? progress / 0.2 : 1 - (progress - 0.2) / 0.8;
        const scale = 0.5 + progress * 0.5;
        const size = 40 * scale;

        return (
          <img
            key={circle.id}
            src="./UI/echo.png"
            alt="Circle"
            style={{
              position: 'absolute',
              left: circle.x - size / 2,
              top: circle.y - size / 2,
              width: size,
              height: size,
              opacity,
              pointerEvents: 'none',
              zIndex: 9995,
            }}
          />
        );
      })}

      {hearts.map((heart) => {
        const age = Date.now() - heart.timestamp;
        if (age >= HEART_DURATION) return null;

        const progress = age / HEART_DURATION;
        const opacity = 1 - progress;
        const rise = (1 - Math.pow(1 - progress, 3)) * 20;

        return (
          <img
            key={heart.id}
            src="./UI/smile.gif"
            alt="Heart"
            style={{
              position: 'absolute',
              left: heart.x - 40,
              top: heart.y - 80 - rise,
              width: 48,
              height: 48,
              opacity,
              pointerEvents: 'none',
              zIndex: 9996,
            }}
          />
        );
      })}

      {Object.values(furniture).map((item) => (
        <React.Fragment key={`${item.id}-${item.x}-${item.y}`}>
          <img
            ref={(el) => {
              furnitureRefs.current[item.id] = el;
            }}
            src={FURNITURE_IMAGES[item.type]}
            alt={item.type}
            data-furniture="true"
            style={{
              position: 'fixed',
              left: item.x,
              top: item.y,
              transform: `translate(-50%, -50%) ${furnitureFlipped[item.id] ? 'scaleX(-1)' : ''}`,
              pointerEvents: 'all',
              cursor: hasConnected ? (isCursorFrozen ? 'default' : 'none') : 'grab',
              zIndex: Z_INDEX_LAYERS.FURNITURE + (furnitureZIndices[item.id] || 0),
              touchAction: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
              width: 'auto',
              height: 'auto',
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              WebkitTransform: `translate(-50%, -50%) ${furnitureFlipped[item.id] ? 'scaleX(-1)' : ''}`,
              transformStyle: 'preserve-3d',
              border: selectedFurnitureId === item.id ? '1px dashed #fff' : 'none',
              borderRadius: selectedFurnitureId === item.id ? '6px' : '0',
              boxSizing: 'border-box',
              WebkitTouchCallout: 'none',
              WebkitTapHighlightColor: 'transparent'
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleFurnitureMouseDown(e, item.id);
            }}
            onDoubleClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleFurnitureDoubleClick(e, item.id);
            }}
            draggable={false}
          />
          {selectedFurnitureId === item.id && (
            <>
              <div
                style={{
                  position: 'fixed',
                  left: item.x,
                  top: getContainerPosition(item).topEdge,
                  transform: 'translate(-50%, -100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  zIndex: 9996,
                  pointerEvents: 'all',
                }}
              >
                <div 
                  style={{ 
                    position: 'relative', 
                    width: '48px', 
                    height: '48px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleMoveUp(item.id)}
                  className="furniture-control-button"
                  data-furniture-control="true"
                >
                  <img
                    src="./UI/up.png"
                    alt="Move Up"
                    onMouseOver={(e) => e.currentTarget.src = './UI/uphover.png'}
                    onMouseOut={(e) => e.currentTarget.src = './UI/up.png'}
                    style={{ position: 'absolute' }}
                  />
                </div>
              </div>
              <div
                style={{
                  position: 'fixed',
                  left: item.x,
                  top: getContainerPosition(item).bottomEdge,
                  transform: 'translate(-50%, 0)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  zIndex: 9996,
                  pointerEvents: 'all',
                }}
              >
                <div 
                  style={{ 
                    position: 'relative', 
                    width: '48px', 
                    height: '48px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleMoveDown(item.id)}
                  className="furniture-control-button"
                  data-furniture-control="true"
                >
                  <img
                    src="./UI/down.png"
                    alt="Move Down"
                    onMouseOver={(e) => e.currentTarget.src = './UI/downhover.png'}
                    onMouseOut={(e) => e.currentTarget.src = './UI/down.png'}
                    style={{ position: 'absolute' }}
                  />
                </div>
              </div>
              <div
                style={{
                  position: 'fixed',
                  left: getContainerPosition(item).left,
                  top: getContainerPosition(item).top,
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  zIndex: 9996,
                  pointerEvents: 'all',
                }}
              >
                <div 
                  style={{ 
                    position: 'relative', 
                    width: '48px', 
                    height: '48px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    const newFlipped = !furnitureFlipped[item.id];
                    setFurnitureFlipped(prev => ({
                      ...prev,
                      [item.id]: newFlipped
                    }));
                    if (socketRef.current) {
                      socketRef.current.emit('updateFurniturePosition', {
                        furnitureId: item.id,
                        x: item.x,
                        y: item.y,
                        isFlipped: newFlipped
                      });
                    }
                  }}
                  className="furniture-control-button"
                  data-furniture-control="true"
                >
                  <img
                    src="./UI/flip.png"
                    alt="Flip"
                    onMouseOver={(e) => e.currentTarget.src = './UI/fliphover.png'}
                    onMouseOut={(e) => e.currentTarget.src = './UI/flip.png'}
                    style={{ position: 'absolute' }}
                  />
                </div>
              </div>
            </>
          )}
        </React.Fragment>
      ))}

      {Object.entries(cursors).map(([id, cursor]) => {
        if (!hasConnected && id === socketRef.current?.id) return null;
        if (!cursor.name || cursor.name === 'Anonymous') return null;

        const isMe = id === socketRef.current?.id;
        const cursorClass = isMe 
          ? `cursor-${cursorType}`
          : (cursor.cursorType ? `cursor-${cursor.cursorType}` : 'cursor-default');

        // For my cursor:
        // - If frozen: use frozen position for everyone (including me)
        // - If not frozen: use current position
        // For other users' cursors:
        // - If frozen: ONLY use frozen position (ignore current position)
        // - If not frozen: use current position
        const cursorX = isMe 
          ? (isCursorFrozen && frozenCursorPosition ? frozenCursorPosition.x : cursor.x)
          : (cursor.isFrozen && cursor.frozenPosition ? cursor.frozenPosition.x : cursor.x);
        const cursorY = isMe
          ? (isCursorFrozen && frozenCursorPosition ? frozenCursorPosition.y : cursor.y)
          : (cursor.isFrozen && cursor.frozenPosition ? cursor.frozenPosition.y : cursor.y);

        // Show cursor if:
        // 1. It's someone else's cursor (always show)
        // 2. It's my cursor and I'm connected (show custom cursor)
        const shouldShowCursor = !isMe || hasConnected;

        if (!shouldShowCursor) return null;

        // For other users' cursors, only show if they have a valid position
        // (either frozen position when frozen, or current position when not frozen)
        if (!isMe && cursor.isFrozen && !cursor.frozenPosition) return null;

        return (
          <div
            key={id}
            className="cursor-wrapper"
            style={{
              left: cursorX,
              top: cursorY,
              fontWeight: isMe ? 'bold' : 'normal',
              zIndex: Z_INDEX_LAYERS.CURSORS
            }}
          >
            <div className={`cursor-circle ${cursorClass}`} />
            <div className="cursor-labels">
              {cursor.stillTime >= 30 && (
                <div className="cursor-timer">AFK {formatTime(cursor.stillTime)}</div>
              )}
              <div className="cursor-id-label">{cursor.name}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default App;