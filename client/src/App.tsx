import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import './App.css';

interface CursorData {
  x: number;
  y: number;
  name?: string;
  stillTime: number;
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

function App() {
  const [cursors, setCursors] = useState<CursorsMap>({});
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const heartCounterRef = useRef(0);
  const circleCounterRef = useRef(0);

  const [username, setUsername] = useState('');
  const usernameRef = useRef(username);
  const [hasConnected, setHasConnected] = useState(false);
  const clickEnabledTimeRef = useRef<number | null>(null); // 👈 Add this

  const HEART_DURATION = 800;
  const CIRCLE_DURATION = 600;

  useEffect(() => {
    usernameRef.current = username;
  }, [username]);

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
      setHearts((prev) => [
        ...prev,
        { ...heartData, timestamp: Date.now() }
      ]);
    });

    socket.on('circleSpawned', (circleData) => {
      setCircles((prev) => [
        ...prev,
        { ...circleData, timestamp: Date.now() }
      ]);
    });

    socket.on('clientDisconnected', (id: string) => {
      setCursors((prev) => {
        const newCursors = { ...prev };
        delete newCursors[id];
        return newCursors;
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
    };
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const now = Date.now();

      // 👇 Delay click responsiveness briefly after connect
      if (
        !socketRef.current?.connected ||
        !hasConnected ||
        (clickEnabledTimeRef.current !== null &&
          now < clickEnabledTimeRef.current)
      ) {
        return;
      }

      const circleId = `${socketRef.current.id}-${now}-${++circleCounterRef.current}`;
      socketRef.current.emit('spawnCircle', {
        x: e.clientX,
        y: e.clientY,
        id: circleId,
      });
    }

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [hasConnected]);

  useEffect(() => {
    function handleDoubleClick(e: MouseEvent) {
      const now = Date.now();
      if (!socketRef.current?.connected || !hasConnected) return;

      const heartId = `${socketRef.current.id}-${now}-${++heartCounterRef.current}`;
      socketRef.current.emit('spawnHeart', {
        x: e.clientX,
        y: e.clientY,
        id: heartId,
      });
    }

    window.addEventListener('dblclick', handleDoubleClick);
    return () => window.removeEventListener('dblclick', handleDoubleClick);
  }, [hasConnected]);

  const handleConnect = () => {
    if (username.trim() === '') return;
    if (socketRef.current?.connected) {
      socketRef.current.emit('setName', { name: username.trim() });
      setHasConnected(true);

      // 👇 Set delay timer to ignore initial click from "Connect"
      clickEnabledTimeRef.current = Date.now() + 300;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div id="app-root" style={{ userSelect: 'none' }}>
      <div id="logo-container">
        <img src="./UI/logo.png" alt="Logo" id="logo" />
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

        let opacity;
        if (progress < 0.2) {
          opacity = progress / 0.2; 
        } else {
          opacity = 1 - (progress - 0.2) / 0.8; 
        }

        const scale = 0.2 + progress * 0.8;

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
              transition: 'none',
              pointerEvents: 'none',
              zIndex: 9999,
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
              left: heart.x - 12,
              top: heart.y - 40 - rise,
              width: 48,
              height: 48,
              opacity,
              pointerEvents: 'none',
              zIndex: 1000,
            }}
          />
        );
      })}

      {Object.entries(cursors).map(([id, cursor]) => {
        if (!hasConnected && id === socketRef.current?.id) return null;
        if (!cursor.name || cursor.name === 'Anonymous') return null;

        const isMe = id === socketRef.current?.id;

        return (
          <div
            key={id}
            className="cursor-wrapper"
            style={{
              left: cursor.x,
              top: cursor.y,
              fontWeight: isMe ? 'bold' : 'normal',
            }}
          >
            {cursor.stillTime >= 30 && (
              <div className="cursor-timer">AFK {formatTime(cursor.stillTime)}</div>
            )}
            <div className="cursor-id-label">{cursor.name}</div>
            <div className="cursor-circle" />
          </div>
        );
      })}
    </div>
  );
}

export default App;
