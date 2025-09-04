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
  const [lastUnlockedItem, setLastUnlockedItem] = useState<string>('');
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {

    
    const socket = io(SERVER_CONFIG.SOCKET_URL, {
      timeout: 60000, // 60 second timeout
      transports: ['websocket', 'polling'],
      path: '/socket.io/', 
      forceNew: true
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Connected to server successfully');
      
      // sends device ID for user stats
      const deviceId = getDeviceId();
      socket.emit('setDeviceId', { deviceId });
      console.log('📱 Device ID sent:', deviceId);
      
      // requests user stats 
      // gacha unlocks
      setTimeout(() => {
        socket.emit('requestUserStats');
        console.log('📊 Requested user stats after device ID setup');
      }, 100); // small delay for device ID
      
      // requests jackpot record to get the last winner
      socket.emit('requestJackpotRecord');
      
      // waits for user to enter name
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

    socket.on('showDialogBanner', (data: { winnerName: string; unlockedItem: string; type: string }) => {
      setLastWinner(data.winnerName);
      setLastUnlockedItem(data.unlockedItem);
      setShowDialogBanner(true);
      setTimeout(() => setShowDialogBanner(false), 60000); // 1 minute
    });

    socket.on('jackpotRecord', (data: { name: string; wins: number; lastWinner?: string }) => {
      // updates last winner if provided
      if (data.lastWinner) {
        setLastWinner(data.lastWinner);
      }
    });

    // refresh user stats to show unlocked items
    socket.on('gachaponWin', (data: { winnerId: string; winnerName: string; unlockedItem: string; type: string }) => {
      console.log('Gachapon win received:', data);
      // updated user stats to refresh hats unlocked
      socket.emit('requestUserStats');
    });

    socket.on('furnitureGachaponWin', (data: { winnerId: string; winnerName: string; unlockedItem: string; type: string }) => {
      console.log('Furniture gachapon win received:', data);
      // updated user stats to refresh furnitures unlocked
      socket.emit('requestUserStats');
    });

    socket.on('usernameError', () => {
      // error if bad name
      alert("nooo.. that's not a good name, try another..");
    });

    socket.on('usernameAccepted', (data: { username: string }) => {
      // username accepted
      setHasConnected(true);
      
      // sets up cursor and user data
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
      socket.off('gachaponWin');
      socket.off('furnitureGachaponWin');
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
      setLastWinner,
      lastUnlockedItem,
      setLastUnlockedItem
    };
}; 