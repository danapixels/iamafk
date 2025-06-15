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

// Track chairs globally like cursors
const chairs = {};

// Track furniture globally like cursors
const furniture = {};

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
  
  // Initialize cursor for new user
  cursors[socket.id] = { x: 0, y: 0, username: '', type: 'default' };
  lastMoveTimestamps[socket.id] = Date.now();
  
  // Send current state to new user
  socket.emit('initialState', {
    cursors: getValidCursors(),
    chairs: chairs,
    furniture: furniture
  });
  
  // Notify other users about new connection
  socket.broadcast.emit('clientConnected', { id: socket.id, cursors: getValidCursors() });

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

  // NEW: Reset stillTime on client request (click/dblclick)
  socket.on('resetStillTime', () => {
    if (cursors[socket.id]) {
      cursors[socket.id].stillTime = 0;
      lastMoveTimestamps[socket.id] = Date.now();
      io.emit('cursors', getValidCursors());
    }
  });

  socket.on('spawnHeart', (heartData) => {
    console.log('Heart spawned by:', socket.id, 'at:', heartData.x, heartData.y);
    io.emit('heartSpawned', heartData);
  });

  socket.on('spawnCircle', (circleData) => {
    console.log('Circle spawned by:', socket.id, 'at:', circleData.x, circleData.y);
    io.emit('circleSpawned', circleData);
  });

  socket.on('spawnChair', () => {
    console.log('User', socket.id, 'spawning chair');
    const chairId = `${socket.id}-${Date.now()}`;
    // Create chair without position - client will set it
    chairs[chairId] = {
      id: chairId
    };
    // Broadcast to all clients including sender
    io.emit('chairSpawned', chairs[chairId]);
  });

  socket.on('updateChairPosition', (data) => {
    const { chairId, x, y } = data;
    if (chairs[chairId]) {
      chairs[chairId].x = x;
      chairs[chairId].y = y;
      // Broadcast to ALL clients including sender
      io.emit('chairMoved', { id: chairId, x, y });
    }
  });

  socket.on('deleteChair', (chairId) => {
    if (chairs[chairId]) {
      delete chairs[chairId];
      io.emit('chairDeleted', { id: chairId });
    }
  });

  socket.on('changeCursor', ({ type }) => {
    console.log('User', socket.id, 'changing cursor to:', type);
    if (cursors[socket.id]) {
      cursors[socket.id].cursorType = type;
      console.log('Emitting cursorChanged to all clients:', { id: socket.id, type });
      io.emit('cursorChanged', { id: socket.id, type });
    }
  });

  socket.on('spawnFurniture', (data) => {
    console.log('User', socket.id, 'spawning furniture:', data.type);
    const furnitureId = `${socket.id}-${Date.now()}`;
    // Create furniture without position - client will set it
    furniture[furnitureId] = {
      id: furnitureId,
      type: data.type
    };
    // Broadcast to all clients including sender
    io.emit('furnitureSpawned', furniture[furnitureId]);
  });

  socket.on('updateFurniturePosition', (data) => {
    const { furnitureId, x, y } = data;
    if (furniture[furnitureId]) {
      furniture[furnitureId].x = x;
      furniture[furnitureId].y = y;
      // Broadcast to ALL clients including sender
      io.emit('furnitureMoved', { id: furnitureId, x, y });
    }
  });

  socket.on('deleteFurniture', (furnitureId) => {
    if (furniture[furnitureId]) {
      delete furniture[furnitureId];
      io.emit('furnitureDeleted', { id: furnitureId });
    }
  });

  socket.on('disconnect', () => {
    // Remove all chairs and furniture owned by this user
    Object.keys(chairs).forEach(chairId => {
      if (chairId.startsWith(socket.id)) {
        delete chairs[chairId];
        io.emit('chairDeleted', { id: chairId });
      }
    });
    Object.keys(furniture).forEach(furnitureId => {
      if (furnitureId.startsWith(socket.id)) {
        delete furniture[furnitureId];
        io.emit('furnitureDeleted', { id: furnitureId });
      }
    });
    console.log('User disconnected:', socket.id);
    delete cursors[socket.id];
    delete lastMoveTimestamps[socket.id];
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
