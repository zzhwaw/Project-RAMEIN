const http = require('node:http');
const { randomInt } = require('node:crypto');
const express = require('express');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN
      ? process.env.CLIENT_ORIGIN.split(',')
      : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  },
});

const rooms = new Map();
const MIN_PLAYERS = 3;
const MAX_PLAYERS = 6;

function cleanText(value, maxLength) {
  return typeof value === 'string'
    ? value.trim().replace(/[\u0000-\u001f\u007f]/g, '').slice(0, maxLength)
    : '';
}

function createRoomId() {
  let roomId;
  do {
    roomId = randomInt(0, 36 ** 6).toString(36).toUpperCase().padStart(6, '0');
  } while (rooms.has(roomId));
  return roomId;
}

function getRoomSnapshot(room) {
  return {
    id: room.id,
    name: room.name,
    hostId: room.hostId,
    capacity: room.capacity,
    players: Array.from(room.players.values()),
    minPlayers: MIN_PLAYERS,
    maxPlayers: MAX_PLAYERS,
  };
}

function broadcastRoom(room) {
  io.to(room.id).emit('room:updated', getRoomSnapshot(room));
}

function removePlayer(socket) {
  const roomId = socket.data.roomId;
  const room = rooms.get(roomId);
  if (!room) {
    delete socket.data.roomId;
    return;
  }

  room.players.delete(socket.id);
  socket.leave(room.id);
  delete socket.data.roomId;

  if (room.players.size === 0) {
    rooms.delete(room.id);
    return;
  }

  if (room.hostId === socket.id) {
    const nextHost = room.players.values().next().value;
    nextHost.isHost = true;
    room.hostId = nextHost.id;
  }
  broadcastRoom(room);
}

io.on('connection', (socket) => {
  socket.on('room:create', (payload = {}, callback = () => {}) => {
    const playerName = cleanText(payload.playerName, 24);
    const roomName = cleanText(payload.roomName, 30);
    const capacity = Number(payload.capacity);

    if (!playerName || !roomName) {
      callback({ error: 'Nama pemain dan nama room harus diisi.' });
      return;
    }
    if (!Number.isInteger(capacity) || capacity < MIN_PLAYERS || capacity > MAX_PLAYERS) {
      callback({ error: `Kapasitas room harus ${MIN_PLAYERS}-${MAX_PLAYERS} pemain.` });
      return;
    }

    removePlayer(socket);
    const roomId = createRoomId();
    const player = { id: socket.id, name: playerName, isHost: true };
    const room = {
      id: roomId,
      name: roomName,
      hostId: socket.id,
      capacity,
      players: new Map([[socket.id, player]]),
    };

    rooms.set(roomId, room);
    socket.data.roomId = roomId;
    socket.join(roomId);
    callback({ room: getRoomSnapshot(room) });
  });

  socket.on('room:join', (payload = {}, callback = () => {}) => {
    const playerName = cleanText(payload.playerName, 24);
    const roomId = cleanText(payload.roomId, 6).toUpperCase();
    const room = rooms.get(roomId);

    if (!playerName || !/^[A-Z0-9]{6}$/.test(roomId)) {
      callback({ error: 'Nama pemain dan kode room 6 karakter harus diisi.' });
      return;
    }
    if (!room) {
      callback({ error: 'Room tidak ditemukan atau host sudah keluar.' });
      return;
    }
    if (socket.data.roomId === room.id) {
      callback({ room: getRoomSnapshot(room) });
      return;
    }
    if (!room.players.has(socket.id) && room.players.size >= room.capacity) {
      callback({ error: 'Room sudah penuh.' });
      return;
    }

    removePlayer(socket);
    const player = { id: socket.id, name: playerName, isHost: false };
    room.players.set(socket.id, player);
    socket.data.roomId = room.id;
    socket.join(room.id);

    const snapshot = getRoomSnapshot(room);
    broadcastRoom(room);
    callback({ room: snapshot });
  });

  socket.on('room:leave', (callback = () => {}) => {
    removePlayer(socket);
    callback({ ok: true });
  });

  socket.on('disconnect', () => removePlayer(socket));
});

const port = Number(process.env.PORT) || 3001;
server.listen(port, () => {
  console.log(`Room server listening on port ${port}`);
});
