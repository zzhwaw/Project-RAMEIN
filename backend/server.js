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
const MODE_REVEAL_DURATION_MS = 5_000;
const TOTAL_QUESTIONS = 20;
const DRAW_MODE = 'gambar-tebak';
const DRAW_GAME_DURATION_MS = 10 * 60_000;
const DRAW_TURN_DURATION_MS = 60_000;
const DRAW_TOTAL_TURNS = 10;
const DRAW_MAX_SEGMENTS = 5_000;
const DRAW_BRUSH_SIZES = [4, 8, 14];
const DRAW_COLORS = ['#292536', '#ef476f', '#ff9f1c', '#ffd166', '#06a77d', '#168aad', '#4361ee', '#9b5de5'];
const GAME_DURATION_MS = { easy: 120_000, medium: 90_000, hard: 60_000 };
const GAME_MODES = ['gambar', 'pengetahuan', 'hitung', DRAW_MODE];
const GAME_DIFFICULTIES = ['easy', 'medium', 'hard'];
const QUESTION_BASE_POINTS = 100;
const MAX_SPEED_BONUS = 50;
const SPEED_BONUS_WINDOW_MS = 5_000;
const DRAW_WORDS = [
  'Sapi', 'Sepeda', 'Pohon', 'Pesawat', 'Pelangi', 'Kucing', 'Bintang', 'Es krim',
  'Pisang', 'Gitar', 'Payung', 'Kapal', 'Kacamata', 'Kupu-kupu', 'Gunung', 'Roket',
  'Bola basket', 'Jam tangan', 'Kaktus', 'Kereta api', 'Kelinci', 'Bulan', 'Kue ulang tahun',
  'Pantai', 'Gajah', 'Sepatu', 'Kamera', 'Matahari', 'Rumah', 'Kapal selam',
];

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

function getDrawTurn(room) {
  const drawGame = room.drawGame;
  if (!drawGame?.drawerId) return null;
  return {
    roundId: drawGame.roundId,
    turnNumber: drawGame.turnNumber,
    totalTurns: DRAW_TOTAL_TURNS,
    drawerId: drawGame.drawerId,
    drawerName: room.players.get(drawGame.drawerId)?.name || 'Pemain',
    startsAt: drawGame.turnStartsAt,
    endsAt: drawGame.turnEndsAt,
    serverNow: Date.now(),
    solved: drawGame.solved,
  };
}

function beginDrawTurn(room) {
  const drawGame = room.drawGame;
  if (room.phase !== 'playing' || room.game?.activeMode !== DRAW_MODE || !drawGame) return;
  clearTimeout(drawGame.turnTimeout);
  if (drawGame.turnNumber >= DRAW_TOTAL_TURNS || Date.now() >= room.game.endsAt) {
    finishGame(room, 'time-up');
    return;
  }

  const orderLength = drawGame.drawOrder.length;
  let drawerId = null;
  for (let offset = 0; offset < orderLength; offset += 1) {
    const orderIndex = (drawGame.startingIndex + drawGame.turnNumber + offset) % orderLength;
    const candidateId = drawGame.drawOrder[orderIndex];
    if (room.players.has(candidateId)) {
      drawerId = candidateId;
      break;
    }
  }
  if (!drawerId) {
    finishGame(room, 'all-players-left');
    return;
  }

  const now = Date.now();
  drawGame.turnNumber += 1;
  drawGame.drawerId = drawerId;
  drawGame.currentWord = DRAW_WORDS[randomInt(0, DRAW_WORDS.length)];
  drawGame.solved = false;
  drawGame.segments = [];
  drawGame.turnStartsAt = now;
  drawGame.turnEndsAt = Math.min(now + DRAW_TURN_DURATION_MS, room.game.endsAt);
  const turn = getDrawTurn(room);
  io.to(room.id).emit('draw:turn', turn);
  io.to(drawerId).emit('draw:word', {
    roundId: drawGame.roundId,
    turnNumber: drawGame.turnNumber,
    word: drawGame.currentWord,
  });
  drawGame.turnTimeout = setTimeout(() => beginDrawTurn(room), drawGame.turnEndsAt - now);
}

function isValidQuestionProgress(payload, totalQuestions = TOTAL_QUESTIONS) {
  return payload.totalQuestions === totalQuestions
    && Number.isInteger(payload.correctAnswers)
    && Number.isInteger(payload.answeredQuestions)
    && payload.answeredQuestions >= 0
    && payload.answeredQuestions <= totalQuestions
    && payload.correctAnswers >= 0
    && payload.correctAnswers <= payload.answeredQuestions;
}

function finishGame(room, reason) {
  if (room.phase !== 'playing') return;

  const endedGame = room.game;
  clearTimeout(room.gameTimeout);
  room.gameTimeout = null;
  if (room.drawGame) {
    clearTimeout(room.drawGame.startTimeout);
    clearTimeout(room.drawGame.turnTimeout);
    room.drawGame = null;
  }
  room.phase = 'lobby';
  room.game = null;
  room.players.forEach((player) => {
    player.ready = false;
    player.answered = false;
  });
  const snapshot = getRoomSnapshot(room);
  io.to(room.id).emit('game:ended', { room: snapshot, reason, game: endedGame });
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
    if (room.drawGame) {
      clearTimeout(room.drawGame.startTimeout);
      clearTimeout(room.drawGame.turnTimeout);
    }
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
      drawGame: null,
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
    const activeMode = GAME_MODES[randomInt(0, GAME_MODES.length)];
    const durationMs = activeMode === DRAW_MODE ? DRAW_GAME_DURATION_MS : GAME_DURATION_MS[room.difficulty];
    const quizId = randomInt(1, 11);
    room.phase = 'playing';
    room.game = {
      activeMode,
      quizId,
      difficulty: room.difficulty,
      totalQuestions: TOTAL_QUESTIONS,
      id: quizId,
      roundId: `${room.id}-${now}`,
      startedAt: now + MODE_REVEAL_DURATION_MS,
      playStartsAt: now + MODE_REVEAL_DURATION_MS,
      serverNow: now,
      endsAt: now + MODE_REVEAL_DURATION_MS + durationMs,
      duration: durationMs / 1000,
    };
    if (activeMode === DRAW_MODE) {
      const drawOrder = Array.from(room.players.keys());
      room.drawGame = {
        roundId: room.game.roundId,
        drawOrder,
        startingIndex: randomInt(0, drawOrder.length),
        turnNumber: 0,
        drawerId: null,
        currentWord: null,
        solved: false,
        segments: [],
        messages: [],
        lastChatAt: new Map(),
        startTimeout: null,
        turnTimeout: null,
      };
    }
    room.players.forEach((player) => {
      player.score = 0;
      player.baseScore = 0;
      player.speedBonus = 0;
      player.answered = false;
      player.correctAnswers = 0;
      player.answeredQuestions = 0;
      player.lastAnswerAt = room.game.playStartsAt;
    });

    const game = { ...room.game };
    io.to(room.id).emit('game:started', game);
    broadcastRoom(room);
    room.gameTimeout = setTimeout(
      () => finishGame(room, 'time-up'),
      MODE_REVEAL_DURATION_MS + durationMs,
    );
    if (activeMode === DRAW_MODE) {
      room.drawGame.startTimeout = setTimeout(
        () => beginDrawTurn(room),
        MODE_REVEAL_DURATION_MS,
      );
    }
    callback({ game });
  });

  socket.on('draw:sync-request', (payload = {}, callback = () => {}) => {
    const room = rooms.get(socket.data.roomId);
    const player = room?.players.get(socket.id);
    const drawGame = room?.drawGame;
    if (!room || !player || room.phase !== 'playing' || !drawGame
      || payload.roundId !== drawGame.roundId) {
      callback({ error: 'Tidak ada permainan gambar yang aktif.' });
      return;
    }

    const response = {
      turn: getDrawTurn(room),
      segments: drawGame.segments,
      messages: drawGame.messages,
      solved: drawGame.solved,
    };
    if (drawGame.drawerId === socket.id && drawGame.currentWord) {
      response.word = drawGame.currentWord;
    }
    callback(response);
  });

  socket.on('draw:stroke', (payload = {}, callback = () => {}) => {
    const room = rooms.get(socket.data.roomId);
    const drawGame = room?.drawGame;
    const segment = payload.segment;
    const coordinates = [segment?.x0, segment?.y0, segment?.x1, segment?.y1];
    if (!room || room.phase !== 'playing' || !drawGame || drawGame.drawerId !== socket.id
      || payload.roundId !== drawGame.roundId
      || payload.turnNumber !== drawGame.turnNumber
      || Date.now() >= drawGame.turnEndsAt
      || drawGame.solved) {
      callback({ error: 'Garis tidak sesuai dengan giliran aktif.' });
      return;
    }
    if (!coordinates.every((value) => Number.isFinite(value) && value >= 0 && value <= 1)
      || !DRAW_BRUSH_SIZES.includes(segment.width)
      || !DRAW_COLORS.includes(segment.color)
      || typeof segment.erase !== 'boolean') {
      callback({ error: 'Data garis tidak valid.' });
      return;
    }
    if (drawGame.segments.length >= DRAW_MAX_SEGMENTS) {
      callback({ error: 'Batas garis untuk giliran ini sudah tercapai.' });
      return;
    }

    const safeSegment = {
      x0: segment.x0,
      y0: segment.y0,
      x1: segment.x1,
      y1: segment.y1,
      width: segment.width,
      color: segment.color,
      erase: segment.erase,
    };
    drawGame.segments.push(safeSegment);
    socket.to(room.id).emit('draw:stroke', {
      roundId: drawGame.roundId,
      turnNumber: drawGame.turnNumber,
      segment: safeSegment,
    });
    callback({ ok: true });
  });

  socket.on('draw:clear', (payload = {}, callback = () => {}) => {
    const room = rooms.get(socket.data.roomId);
    const drawGame = room?.drawGame;
    if (!room || room.phase !== 'playing' || !drawGame || drawGame.drawerId !== socket.id
      || payload.roundId !== drawGame.roundId
      || payload.turnNumber !== drawGame.turnNumber
      || Date.now() >= drawGame.turnEndsAt
      || drawGame.solved) {
      callback({ error: 'Canvas hanya dapat dibersihkan oleh penggambar aktif.' });
      return;
    }
    drawGame.segments = [];
    io.to(room.id).emit('draw:clear', {
      roundId: drawGame.roundId,
      turnNumber: drawGame.turnNumber,
    });
    callback({ ok: true });
  });

  socket.on('draw:guess', (payload = {}, callback = () => {}) => {
    const room = rooms.get(socket.data.roomId);
    const player = room?.players.get(socket.id);
    const drawGame = room?.drawGame;
    if (!room || !player || room.phase !== 'playing' || !drawGame
      || payload.roundId !== drawGame.roundId
      || payload.turnNumber !== drawGame.turnNumber
      || Date.now() >= drawGame.turnEndsAt) {
      callback({ error: 'Giliran menebak ini sudah berakhir.' });
      return;
    }
    if (drawGame.drawerId === socket.id) {
      callback({ error: 'Penggambar tidak dapat mengirim tebakan.' });
      return;
    }
    if (drawGame.solved) {
      callback({ error: 'Kata untuk giliran ini sudah berhasil ditebak.' });
      return;
    }

    const text = cleanText(payload.text, 60);
    if (!text) {
      callback({ error: 'Tulis tebakan terlebih dahulu.' });
      return;
    }
    const now = Date.now();
    const lastChatAt = drawGame.lastChatAt.get(socket.id) || 0;
    if (now - lastChatAt < 400) {
      callback({ error: 'Tunggu sebentar sebelum mengirim tebakan lagi.' });
      return;
    }
    drawGame.lastChatAt.set(socket.id, now);
    const normalizeGuess = (value) => value
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLocaleLowerCase('id')
      .replace(/[^\p{L}\p{N}]/gu, '');
    const isCorrect = normalizeGuess(text) === normalizeGuess(drawGame.currentWord);
    const message = {
      id: `${now}-${socket.id}`,
      roundId: drawGame.roundId,
      playerId: socket.id,
      playerName: player.name,
      text,
      isCorrect,
      createdAt: now,
    };
    drawGame.messages = [...drawGame.messages, message].slice(-50);
    io.to(room.id).emit('draw:chat', message);

    if (isCorrect) {
      drawGame.solved = true;
      player.score += 100;
      player.baseScore += 100;
      const drawer = room.players.get(drawGame.drawerId);
      if (drawer) {
        drawer.score += 50;
        drawer.baseScore += 50;
      }
      broadcastRoom(room);
      io.to(room.id).emit('draw:solved', {
        roundId: drawGame.roundId,
        turnNumber: drawGame.turnNumber,
        word: drawGame.currentWord,
        guesserId: player.id,
        guesserName: player.name,
        guesserPoints: 100,
        drawerPoints: drawer ? 50 : 0,
      });
    }
    callback({ ok: true, isCorrect });
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
    if (Date.now() < room.game.playStartsAt) {
      callback({ error: 'Tunggu sampai pengundian mode selesai.' });
      return;
    }
    if (payload.roundId !== room.game.roundId || player.answered) {
      callback({ error: 'Progress ini bukan untuk ronde aktif.' });
      return;
    }
    if (!isValidQuestionProgress(payload, room.game.totalQuestions)
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
    if (Date.now() < room.game.playStartsAt) {
      callback({ error: 'Tunggu sampai pengundian mode selesai.' });
      return;
    }

    if (!isValidQuestionProgress(payload, room.game.totalQuestions)
      || payload.answeredQuestions !== player.answeredQuestions
      || payload.correctAnswers !== player.correctAnswers) {
      callback({ error: 'Progress jawaban tidak valid.' });
      return;
    }
    if (Date.now() < room.game.endsAt && payload.answeredQuestions !== room.game.totalQuestions) {
      callback({ error: `Selesaikan semua ${room.game.totalQuestions} soal sebelum mengirim skor akhir.` });
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
