import { useEffect, useRef, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import { SERVER_CONFIG } from '../../constants';
import { 
  getSavedCursorType, 
  saveUsername,
  getDeviceId
} from '../../utils/localStorage';

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

interface Emote {
  id: string;
  x: number;
  y: number;
  timestamp: number;
  type: string;
}

interface Furniture {
  id: string;
  type: string;
  x: number;
  y: number;
  zIndex?: number;
  isFlipped?: boolean;
}

export const useSocket = () => {
  const [hasConnected, setHasConnected] = useState(false);
  const [cursors, setCursors] = useState<CursorsMap>({});
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [emotes, setEmotes] = useState<Emote[]>([]);
  const [furniture, setFurniture] = useState<{ [key: string]: Furniture }>({});
  const [showDialogBanner, setShowDialogBanner] = useState(false);
  const [lastWinner, setLastWinner] = useState<string>('');
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    console.log('Attempting to connect to:', SERVER_CONFIG.SOCKET_URL);
    
    const socket = io(SERVER_CONFIG.SOCKET_URL, {
      timeout: 60000, // 60 second timeout
      transports: ['websocket', 'polling'], // Try WebSocket first, then polling
      path: '/socket.io/', // Explicit path for nginx proxy
      forceNew: true
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Connected to server successfully');
      
      // Send device ID immediately for user stats persistence
      const deviceId = getDeviceId();
      socket.emit('setDeviceId', { deviceId });
      console.log('📱 Device ID sent:', deviceId);
      
      // Request jackpot record to get the last winner
      socket.emit('requestJackpotRecord');
      
      // Don't set hasConnected to true here - wait for user to enter name
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected:', reason);
      setHasConnected(false);
      setCursors({});
      setHearts([]);
      setCircles([]);
      setEmotes([]);
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

    socket.on('EmoteSpawned', (emoteData) => {
      setEmotes((prev) => [...prev, { ...emoteData, timestamp: Date.now() }]);
    });

    socket.on('clientDisconnected', (id: string) => {
      setCursors((prev) => {
        const newCursors = { ...prev };
        delete newCursors[id];
        return newCursors;
      });
    });

    socket.on('cursorChanged', (data: { id: string; type: string }) => {
      setCursors((prev) => {
        const newCursors = {
          ...prev,
          [data.id]: {
            ...prev[data.id],
            cursorType: data.type,
          },
        };
        return newCursors;
      });
    });

    socket.on('initialState', (data: any) => {
      setCursors(data && data.cursors ? data.cursors : {});
      setHearts(data && data.hearts ? data.hearts : []);
      setCircles(data && data.circles ? data.circles : []);
      setEmotes(data && data.emotes ? data.emotes : []);
      setFurniture(data && data.furniture ? data.furniture : {});
    });

    socket.on('clientConnected', (data: any) => {
      if (data && data.socketId && data.cursor) {
        setCursors(prev => ({ ...prev, [data.socketId]: data.cursor }));
      }
    });

    socket.on('showDialogBanner', () => {
      setShowDialogBanner(true);
      setTimeout(() => setShowDialogBanner(false), 60000); // 1 minute
    });

    socket.on('jackpotRecord', (data: { name: string; wins: number; lastWinner?: string }) => {
      // Update last winner if provided
      if (data.lastWinner) {
        setLastWinner(data.lastWinner);
      }
    });

    socket.on('usernameError', () => {
      // Show a friendly error message to the user
      alert("nooo.. that's not a good name, try another..");
    });

    socket.on('usernameAccepted', (data: { username: string }) => {
      // Username was accepted, complete the connection
      setHasConnected(true);
      
      // Set up cursor and user data
      const savedCursorType = getSavedCursorType();
      if (savedCursorType) {
        socket.emit('changeCursor', { type: savedCursorType });
      }
      
      saveUsername(data.username);
      
      console.log('✅ Username accepted, connection completed');
    });

    return () => {
      socket.disconnect();
      socket.off('initialState');
      socket.off('clientConnected');
      socket.off('showDialogBanner');
      socket.off('EmoteSpawned');
      socket.off('heartSpawned');
      socket.off('circleSpawned');
      socket.off('cursors');
      socket.off('clientDisconnected');
      socket.off('cursorChanged');
    };
  }, []);

  return {
    socketRef,
    hasConnected,
    setHasConnected,
    cursors,
    setCursors,
    hearts,
    setHearts,
    circles,
    setCircles,
    emotes,
    setEmotes,
    furniture,
    setFurniture,
    showDialogBanner,
    setShowDialogBanner,
    lastWinner,
    setLastWinner
  };
}; 