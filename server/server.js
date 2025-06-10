const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

let cursors = {};
let lastMoveTimestamps = {};

// Helper to filter cursors by valid name
function getValidCursors() {
  const filtered = {};
  Object.entries(cursors).forEach(([id, cursor]) => {
    if (cursor.name && cursor.name.trim() !== '' && cursor.name !== 'Anonymous') {
      filtered[id] = cursor;
    }
  });
  return filtered;
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  cursors[socket.id] = {
    x: 0,
    y: 0,
    name: '',
    stillTime: 0,
  };
  lastMoveTimestamps[socket.id] = Date.now();

  socket.on('setName', ({ name }) => {
    if (cursors[socket.id]) {
      cursors[socket.id].name = name?.trim() || 'Anonymous';
      io.emit('cursors', getValidCursors());
    }
  });

  socket.on('cursorMove', ({ x, y, name }) => {
    const now = Date.now();

    if (!cursors[socket.id]) {
      cursors[socket.id] = {
        name: name?.trim() || '',
        x,
        y,
        stillTime: 0,
      };
      lastMoveTimestamps[socket.id] = now;
    } else {
      const prev = cursors[socket.id];
      if (prev.x !== x || prev.y !== y) {
        cursors[socket.id].x = x;
        cursors[socket.id].y = y;
        cursors[socket.id].stillTime = 0;
        lastMoveTimestamps[socket.id] = now;
      } else {
        const diffSeconds = Math.floor((now - lastMoveTimestamps[socket.id]) / 1000);
        cursors[socket.id].stillTime = diffSeconds;
      }

      if (name && name.trim() !== '') {
        cursors[socket.id].name = name.trim();
      }
    }

    io.emit('cursors', getValidCursors());
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    delete cursors[socket.id];
    delete lastMoveTimestamps[socket.id];
    io.emit('cursors', getValidCursors());

    // Emit explicit disconnect event so clients can handle it immediately
    io.emit('clientDisconnected', socket.id);
  });
});

setInterval(() => {
  const now = Date.now();
  let updated = false;

  Object.keys(cursors).forEach((id) => {
    const cursor = cursors[id];
    const lastMove = lastMoveTimestamps[id];
    if (cursor && lastMove) {
      const diffSeconds = Math.floor((now - lastMove) / 1000);
      if (cursor.stillTime !== diffSeconds) {
        cursor.stillTime = diffSeconds;
        updated = true;
      }
    }
  });

  if (updated) {
    io.emit('cursors', getValidCursors());
  }
}, 1000);

server.listen(3001, () => {
  console.log('Socket server running on http://localhost:3001');
});
