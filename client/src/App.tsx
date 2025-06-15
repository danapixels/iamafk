import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import './App.css';
import Panel from './Panel';

interface CursorData {
  x: number;
  y: number;
  name?: string;
  stillTime: number;
  cursorType?: string;
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
  const clickEnabledTimeRef = useRef<number | null>(null);
  const [cursorType, setCursorType] = useState<string>('default');

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
      setCursors((prev) => ({
        ...prev,
        [data.id]: {
          ...prev[data.id],
          cursorType: data.type,
        },
      }));
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

  const handleCursorChange = (type: string) => {
    setCursorType(type);
  };

  return (
    <div id="app-root" style={{ userSelect: 'none' }}>
      <Panel socket={socketRef.current} onCursorChange={handleCursorChange} />
      <div id="logo-container">
        <img src="./UI/logo.png" alt="Logo" id="logo" />
        <img src="./UI/leaderboard.png" alt="Leaderboard" id="leaderboard" style={{ marginTop: 0 }} />
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

      {Object.entries(cursors).map(([id, cursor]) => {
        if (!hasConnected && id === socketRef.current?.id) return null;
        if (!cursor.name || cursor.name === 'Anonymous') return null;

        const isMe = id === socketRef.current?.id;
        const cursorClass = cursor.cursorType ? `cursor-${cursor.cursorType}` : 'cursor-default';

        return (
          <div
            key={id}
            className="cursor-wrapper"
            style={{
              left: cursor.x,
              top: cursor.y,
              fontWeight: isMe ? 'bold' : 'normal',
              zIndex: 9997,
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
