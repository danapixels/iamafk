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

function App() {
  const [cursors, setCursors] = useState<CursorsMap>({});
  const socketRef = useRef<Socket | null>(null);

  const [username, setUsername] = useState('');
  const usernameRef = useRef(username);
  const [hasConnected, setHasConnected] = useState(false);

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
      console.log('❌ Disconnected from server');
      setHasConnected(false);
      setCursors({});
    });

    socket.on('cursors', (newCursors: CursorsMap) => {
      setCursors(newCursors);
    });

    // Listen for explicit disconnect events from other clients
    socket.on('clientDisconnected', (id: string) => {
      console.log('🛑 User disconnected:', id);
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

  const handleConnect = () => {
    if (username.trim() === '') return;
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('setName', { name: username.trim() });
      setHasConnected(true);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const days = Math.floor(totalSeconds / (24 * 3600));
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let result = '';
    if (days > 0) result += `${days}d `;
    result += `${minutes}m ${seconds}s`;
    return result.trim();
  };

  return (
    <div id="app-root">
      <div id="logo-container">
        <img src="./UI/logo.png" alt="Logo" id="logo" />
      </div>

      {!hasConnected && (
        <div id="modal-overlay">
          <div className="form-container">
            <label htmlFor="username">
              What should everyone know you as when you're away?
            </label>
            <input
              id="username"
              type="text"
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

      {Object.entries(cursors)
        .filter(([id, cursor]) => {
          if (!hasConnected && id === socketRef.current?.id) return false;
          return cursor.name && cursor.name.trim() !== '' && cursor.name !== 'Anonymous';
        })
        .map(([id, cursor]) => {
          const stillSeconds = cursor.stillTime || 0;
          const isMyCursor = socketRef.current?.id === id;

          return (
            <div
              key={id}
              className="cursor-wrapper"
              style={{
                left: cursor.x,
                top: cursor.y,
                fontWeight: isMyCursor ? 'bold' : 'normal',
              }}
            >
              {stillSeconds >= 30 && (
                <div className="cursor-timer">AFK {formatTime(stillSeconds)}</div>
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
