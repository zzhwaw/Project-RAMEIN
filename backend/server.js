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
const GAME_DURATION_MS = { easy: 60_000, medium: 45_000, hard: 30_000 };
const GAME_MODES = ['gambar', 'pengetahuan', 'hitung'];
const GAME_DIFFICULTIES = ['easy', 'medium', 'hard'];
const QUESTION_BASE_POINTS = 100;
const MAX_SPEED_BONUS = 50;
const SPEED_BONUS_WINDOW_MS = 5_000;

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
    difficulty: room.difficulty,
    phase: room.phase,
    game: room.game,
    players: Array.from(room.players.values()),
    minPlayers: MIN_PLAYERS,
    maxPlayers: MAX_PLAYERS,
  };
}

function broadcastRoom(room) {
  io.to(room.id).emit('room:updated', getRoomSnapshot(room));
}

function calculateSpeedBonus(answerTimeMs) {
  const speedRatio = Math.max(0, 1 - Math.max(0, answerTimeMs) / SPEED_BONUS_WINDOW_MS);
  return Math.round(MAX_SPEED_BONUS * speedRatio);
}

function isValidQuestionProgress(payload) {
  return payload.totalQuestions === 10
    && Number.isInteger(payload.correctAnswers)
    && Number.isInteger(payload.answeredQuestions)
    && payload.answeredQuestions >= 0
    && payload.answeredQuestions <= 10
    && payload.correctAnswers >= 0
    && payload.correctAnswers <= payload.answeredQuestions;
}

function finishGame(room, reason) {
  if (room.phase !== 'playing') return;

  clearTimeout(room.gameTimeout);
  room.gameTimeout = null;
  room.phase = 'lobby';
  room.game = null;
  room.players.forEach((player) => {
    player.ready = false;
    player.answered = false;
  });
  const snapshot = getRoomSnapshot(room);
  io.to(room.id).emit('game:ended', { room: snapshot, reason });
  broadcastRoom(room);
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
    clearTimeout(room.gameTimeout);
    rooms.delete(room.id);
    return;
  }

  if (room.hostId === socket.id) {
    const nextHost = room.players.values().next().value;
    nextHost.isHost = true;
    room.hostId = nextHost.id;
  }
  if (room.phase === 'playing' && [...room.players.values()].every((player) => player.answered)) {
    finishGame(room, 'all-answered');
    return;
  }
  broadcastRoom(room);
}

io.on('connection', (socket) => {
  socket.on('room:create', (payload = {}, callback = () => {}) => {
    const playerName = cleanText(payload.playerName, 24);
    const roomName = cleanText(payload.roomName, 30);
    const capacity = Number(payload.capacity);
    const difficulty = payload.difficulty ?? 'medium';

    if (!playerName || !roomName) {
      callback({ error: 'Nama pemain dan nama room harus diisi.' });
      return;
    }
    if (!Number.isInteger(capacity) || capacity < MIN_PLAYERS || capacity > MAX_PLAYERS) {
      callback({ error: `Kapasitas room harus ${MIN_PLAYERS}-${MAX_PLAYERS} pemain.` });
      return;
    }
    if (!GAME_DIFFICULTIES.includes(difficulty)) {
      callback({ error: 'Pilih tingkat kesulitan easy, medium, atau hard.' });
      return;
    }

    removePlayer(socket);
    const roomId = createRoomId();
    const player = {
      id: socket.id,
      name: playerName,
      isHost: true,
      ready: false,
      score: 0,
      baseScore: 0,
      speedBonus: 0,
      answered: false,
      correctAnswers: 0,
      answeredQuestions: 0,
    };
    const room = {
      id: roomId,
      name: roomName,
      hostId: socket.id,
      capacity,
      difficulty,
      phase: 'lobby',
      game: null,
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
    if (room.phase !== 'lobby') {
      callback({ error: 'Game sedang berlangsung. Coba gabung lagi setelah ronde selesai.' });
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
    const player = {
      id: socket.id,
      name: playerName,
      isHost: false,
      ready: false,
      score: 0,
      baseScore: 0,
      speedBonus: 0,
      answered: false,
      correctAnswers: 0,
      answeredQuestions: 0,
    };
    room.players.set(socket.id, player);
    socket.data.roomId = room.id;
    socket.join(room.id);

    const snapshot = getRoomSnapshot(room);
    broadcastRoom(room);
    callback({ room: snapshot });
  });

  socket.on('player:ready', (payload = {}, callback = () => {}) => {
    const room = rooms.get(socket.data.roomId);
    const player = room?.players.get(socket.id);
    if (!room || !player) {
      callback({ error: 'Kamu tidak berada di dalam room.' });
      return;
    }
    if (room.phase !== 'lobby') {
      callback({ error: 'Status siap tidak dapat diubah saat game berlangsung.' });
      return;
    }

    player.ready = Boolean(payload.ready);
    broadcastRoom(room);
    callback({ room: getRoomSnapshot(room) });
  });

  socket.on('game:start', (payload = {}, callback = () => {}) => {
    const room = rooms.get(socket.data.roomId);
    if (!room || !room.players.has(socket.id)) {
      callback({ error: 'Kamu tidak berada di dalam room.' });
      return;
    }
    if (room.hostId !== socket.id) {
      callback({ error: 'Hanya host yang dapat memulai game.' });
      return;
    }
    if (room.phase !== 'lobby') {
      callback({ error: 'Game sedang berlangsung.' });
      return;
    }
    if (room.players.size < MIN_PLAYERS) {
      callback({ error: `Minimal ${MIN_PLAYERS} pemain untuk memulai game.` });
      return;
    }
    if (![...room.players.values()].every((player) => player.ready)) {
      callback({ error: 'Semua pemain harus siap sebelum game dimulai.' });
      return;
    }

    const now = Date.now();
    const durationMs = GAME_DURATION_MS[room.difficulty];
    const activeMode = GAME_MODES[randomInt(0, GAME_MODES.length)];
    const quizId = randomInt(1, 11);
    room.phase = 'playing';
    room.game = {
      activeMode,
      quizId,
      difficulty: room.difficulty,
      id: quizId,
      roundId: `${room.id}-${now}`,
      startedAt: now,
      serverNow: now,
      endsAt: now + durationMs,
      duration: durationMs / 1000,
    };
    room.players.forEach((player) => {
      player.score = 0;
      player.baseScore = 0;
      player.speedBonus = 0;
      player.answered = false;
      player.correctAnswers = 0;
      player.answeredQuestions = 0;
      player.lastAnswerAt = now;
    });

    const game = { ...room.game };
    io.to(room.id).emit('game:started', game);
    broadcastRoom(room);
    room.gameTimeout = setTimeout(() => finishGame(room, 'time-up'), durationMs);
    callback({ game });
  });

  socket.on('game:progress', (payload = {}, callback = () => {}) => {
    const room = rooms.get(socket.data.roomId);
    const player = room?.players.get(socket.id);
    if (!room || !player || room.phase !== 'playing' || !room.game) {
      callback({ error: 'Tidak ada game aktif untuk diperbarui.' });
      return;
    }
    if (Date.now() >= room.game.endsAt) {
      finishGame(room, 'time-up');
      callback({ error: 'Waktu permainan sudah habis.' });
      return;
    }
    if (payload.roundId !== room.game.roundId || player.answered) {
      callback({ error: 'Progress ini bukan untuk ronde aktif.' });
      return;
    }
    if (!isValidQuestionProgress(payload)
      || payload.answeredQuestions !== player.answeredQuestions + 1
      || payload.correctAnswers < player.correctAnswers
      || payload.correctAnswers > player.correctAnswers + 1) {
      callback({ error: 'Progress soal tidak valid.' });
      return;
    }

    const now = Date.now();
    const correctAnswerDelta = payload.correctAnswers - player.correctAnswers;
    const questionSpeedBonus = correctAnswerDelta
      ? calculateSpeedBonus(now - player.lastAnswerAt)
      : 0;
    player.correctAnswers = payload.correctAnswers;
    player.answeredQuestions = payload.answeredQuestions;
    player.baseScore += correctAnswerDelta * QUESTION_BASE_POINTS;
    player.speedBonus += questionSpeedBonus;
    player.score = player.baseScore + player.speedBonus;
    player.lastAnswerAt = now;
    broadcastRoom(room);
    callback({
      ok: true,
      score: player.score,
      baseScore: player.baseScore,
      speedBonus: player.speedBonus,
      questionSpeedBonus,
    });
  });

  socket.on('game:answer', (payload = {}, callback = () => {}) => {
    const room = rooms.get(socket.data.roomId);
    const player = room?.players.get(socket.id);
    if (!room || !player || room.phase !== 'playing' || !room.game) {
      callback({ error: 'Tidak ada game aktif untuk dijawab.' });
      return;
    }
    if (payload.roundId !== room.game.roundId) {
      callback({ error: 'Jawaban ini bukan untuk ronde yang sedang berjalan.' });
      return;
    }
    if (player.answered) {
      callback({ error: 'Jawaban untuk ronde ini sudah diterima.' });
      return;
    }
    if (Date.now() >= room.game.endsAt) {
      finishGame(room, 'time-up');
      callback({ error: 'Waktu permainan sudah habis.' });
      return;
    }

    if (!isValidQuestionProgress(payload)
      || payload.answeredQuestions !== player.answeredQuestions
      || payload.correctAnswers !== player.correctAnswers) {
      callback({ error: 'Progress jawaban tidak valid.' });
      return;
    }
    if (Date.now() < room.game.endsAt && payload.answeredQuestions !== 10) {
      callback({ error: 'Selesaikan semua 10 soal sebelum mengirim skor akhir.' });
      return;
    }
    player.correctAnswers = payload.correctAnswers;
    player.answeredQuestions = payload.answeredQuestions;
    player.answered = true;
    broadcastRoom(room);
    callback({ ok: true, score: player.score });

    if ([...room.players.values()].every((roomPlayer) => roomPlayer.answered)) {
      finishGame(room, 'all-answered');
    }
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
