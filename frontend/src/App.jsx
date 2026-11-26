import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import LandingPage from './components/pages/LandingPage';
import RoomSelectPage from './components/pages/RoomSelectPage';
import CreateRoomPage from './components/pages/CreateRoomPage';
import JoinRoomPage from './components/pages/JoinRoomPage';
import LobbyPage from './components/pages/LobbyPage';
import ScoreboardPage from './components/pages/ScoreboardPage';
import GameArena from './components/games/arena/GameArena';
import DrawAndGuess from './components/games/arena/DrawAndGuess';
import ModeReveal from './components/games/arena/ModeReveal';
import { ReactionFeed } from './components/PlayerReactions';
import { getCharacterSkill } from './components/characterSkills';

const PAGE_TRANSITION_MS = 700;

export default function App() {
  const [page, setPage] = useState('landing');
  const [navigation, setNavigation] = useState(null);
  const [room, setRoom] = useState(null);
  const [game, setGame] = useState(null);
  const [finalStandings, setFinalStandings] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [reactions, setReactions] = useState([]);
  const [skillNotices, setSkillNotices] = useState([]);
  const [reactionError, setReactionError] = useState('');
  const [lobbyOrigin, setLobbyOrigin] = useState('create');
  const [socket] = useState(() => io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001', {
    autoConnect: false,
  }));
  const navigationTimeout = useRef(null);
  const reactionTimeouts = useRef(new Map());
  const skillTimeouts = useRef(new Map());

  useEffect(() => {
    const reactionTimers = reactionTimeouts.current;
    const skillTimers = skillTimeouts.current;
    const handleRoomUpdate = (updatedRoom) => setRoom(updatedRoom);
    const handlePlayerReaction = (reaction) => {
      setReactions((current) => [...current, reaction].slice(-4));
      const timeoutId = window.setTimeout(() => {
        setReactions((current) => current.filter((entry) => entry.id !== reaction.id));
        reactionTimeouts.current.delete(reaction.id);
      }, 3500);
      reactionTimeouts.current.set(reaction.id, timeoutId);
    };
    const handlePlayerSkill = (notice) => {
      const effectDetails = [];
      if (notice.effect.timePenaltyMs) {
        effectDetails.push(`-${Math.ceil(notice.effect.timePenaltyMs / 1000)} dtk`);
      }
      if (notice.effect.speedBonusLost) {
        effectDetails.push(`-${notice.effect.speedBonusLost} bonus kecepatan`);
      }
      const directPointsLost = notice.effect.pointsLost - notice.effect.speedBonusLost;
      if (directPointsLost > 0) effectDetails.push(`-${directPointsLost} poin`);
      if (notice.effect.pointsStolen) effectDetails.push(`+${notice.effect.pointsStolen} poin dicuri`);
      if (notice.effect.speedBonusBlocked) {
        effectDetails.push(`bonus kecepatan diblokir ${notice.effect.speedBonusBlocked} soal`);
      }
      const isTarget = notice.targetId === socket.id;
      const isActor = notice.actorId === socket.id;
      const skill = getCharacterSkill(notice.avatarId);
      const message = isTarget
        ? `${notice.actorName} memakai ${skill.name} padamu!`
        : isActor
          ? `Skill ${skill.name} berhasil dipakai pada ${notice.targetName}.`
          : `${notice.actorName} memakai ${skill.name} pada ${notice.targetName}.`;
      const entry = {
        ...notice,
        message,
        details: effectDetails.join(' • ') || 'Efek skill diterapkan',
      };
      setSkillNotices((current) => [...current, entry].slice(-3));
      const timeoutId = window.setTimeout(() => {
        setSkillNotices((current) => current.filter((item) => item.id !== notice.id));
        skillTimers.delete(notice.id);
      }, 4500);
      skillTimers.set(notice.id, timeoutId);
    };
    const handleGameStarted = (startedGame) => {
      const synchronizedGame = {
        ...startedGame,
        clientClockOffset: startedGame.serverNow - Date.now(),
      };
      setGame(synchronizedGame);
      setFinalStandings(null);
      const clientNow = Date.now() + synchronizedGame.clientClockOffset;
      const playStartsAt = startedGame.playStartsAt || startedGame.startedAt;
      setTimeLeft(Math.max(0, (startedGame.endsAt - Math.max(clientNow, playStartsAt)) / 1000));
      setPage('modeReveal');
    };
    const handleGameEnded = ({ room: updatedRoom, reason, game: endedGame }) => {
      setRoom(updatedRoom);
      setGame(null);
      setFinalStandings({
        players: updatedRoom.players,
        reason,
        mode: endedGame?.activeMode,
      });
      setPage('scoreboard');
    };

    socket.on('room:updated', handleRoomUpdate);
    socket.on('player:reaction', handlePlayerReaction);
    socket.on('player:skill-used', handlePlayerSkill);
    socket.on('game:started', handleGameStarted);
    socket.on('game:ended', handleGameEnded);

    return () => {
      window.clearTimeout(navigationTimeout.current);
      reactionTimers.forEach((timeoutId) => window.clearTimeout(timeoutId));
      reactionTimers.clear();
      skillTimers.forEach((timeoutId) => window.clearTimeout(timeoutId));
      skillTimers.clear();
      socket.off('room:updated', handleRoomUpdate);
      socket.off('player:reaction', handlePlayerReaction);
      socket.off('player:skill-used', handlePlayerSkill);
      socket.off('game:started', handleGameStarted);
      socket.off('game:ended', handleGameEnded);
      socket.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    if (!game?.endsAt) return undefined;

    const updateTimeLeft = () => {
      const clientNow = Date.now() + game.clientClockOffset;
      const playStartsAt = game.playStartsAt || game.startedAt;
      const ownDeadline = room?.players.find((player) => player.id === socket.id)?.timeEndsAt;
      const deadline = Number.isFinite(ownDeadline) ? Math.min(game.endsAt, ownDeadline) : game.endsAt;
      setTimeLeft(Math.max(0, (deadline - Math.max(clientNow, playStartsAt)) / 1000));
    };
    updateTimeLeft();
    const timerId = window.setInterval(updateTimeLeft, 100);
    return () => window.clearInterval(timerId);
  }, [game, room, socket]);

  const requestRoom = (eventName, payload) => new Promise((resolve) => {
    let completed = false;
    const finish = (result) => {
      if (completed) return;
      completed = true;
      window.clearTimeout(timeout);
      socket.off('connect', emitRequest);
      socket.off('connect_error', handleConnectionError);
      resolve(result);
    };
    const emitRequest = () => socket.emit(eventName, payload, finish);
    const handleConnectionError = () => finish({
      error: 'Tidak dapat terhubung ke server room. Pastikan server backend sedang berjalan.',
    });
    const timeout = window.setTimeout(
      () => finish({ error: 'Server room tidak merespons. Coba lagi.' }),
      10000,
    );

    socket.on('connect_error', handleConnectionError);
    if (socket.connected) {
      emitRequest();
    } else {
      socket.once('connect', emitRequest);
      socket.connect();
    }
  });

  const handleCreateRoom = async (roomDetails) => {
    const result = await requestRoom('room:create', roomDetails);
    if (result.room) {
      setRoom(result.room);
      setLobbyOrigin('create');
      navigateWithSlide('lobby', 'create');
    }
    return result;
  };

  const handleJoinRoom = async (playerDetails) => {
    const result = await requestRoom('room:join', playerDetails);
    if (result.room) {
      setRoom(result.room);
      setLobbyOrigin('join');
      navigateWithSlide('lobby', 'join');
    }
    return result;
  };

  const handleLeaveRoom = () => {
    socket.emit('room:leave');
    navigateWithSlide(lobbyOrigin, 'lobby', () => setRoom(null));
  };

  const handleSetReady = (ready) => requestRoom('player:ready', { ready });
  const handleUpdateRoomSettings = (settings) => requestRoom('room:update-settings', settings);
  const handleStartGame = () => requestRoom('game:start', {});
  const handleUseCharacterSkill = (targetId, roundId) => requestRoom(
    'player:skill-use',
    { targetId, roundId },
  );
  const handleSendReaction = (emoji) => {
    setReactionError('');
    socket.timeout(4000).emit('player:reaction', { emoji }, (error, result) => {
      if (error) setReactionError('Reaksi gagal dikirim. Coba lagi.');
      else if (result?.error) setReactionError(result.error);
    });
  };
  const handleGameAnswer = (progress) => {
    if (!game) return;
    socket.emit('game:answer', { roundId: game.roundId, ...progress });
  };
  const handleGameProgress = (progress) => {
    if (!game) return;
    socket.emit('game:progress', { roundId: game.roundId, ...progress });
  };
  const handleModeRevealComplete = (selectedMode) => {
    if (game?.activeMode !== selectedMode) return;
    setPage('game');
  };

  const navigateWithSlide = (target, from = page, onComplete) => {
    if (navigation || from === target) return;

    const transitionDuration = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 0
      : PAGE_TRANSITION_MS;

    setNavigation({ from, to: target });
    navigationTimeout.current = window.setTimeout(() => {
      setPage(target);
      setNavigation(null);
      onComplete?.();
    }, transitionDuration);
  };

  const getSlideClass = (screen) => {
    if (!navigation) return '';

    const transitionClasses = {
      'select-create': { select: 'slide-out-to-left', create: 'slide-in-from-right' },
      'select-join': { select: 'slide-out-to-right', join: 'slide-in-from-left' },
      'create-select': { create: 'slide-out-to-left', select: 'slide-in-from-right' },
      'join-select': { join: 'slide-out-to-right', select: 'slide-in-from-left' },
      'create-lobby': { create: 'slide-out-to-left', lobby: 'slide-in-from-right' },
      'join-lobby': { join: 'slide-out-to-right', lobby: 'slide-in-from-left' },
      'lobby-create': { lobby: 'slide-out-to-right', create: 'slide-in-from-left' },
      'lobby-join': { lobby: 'slide-out-to-left', join: 'slide-in-from-right' },
    };

    return transitionClasses[`${navigation.from}-${navigation.to}`]?.[screen] || '';
  };

  const showRoomSelect = page === 'landing'
    || page === 'select'
    || (navigation && (navigation.from === 'select' || navigation.to === 'select'));
  const showCreateRoom = page === 'create'
    || (navigation && (navigation.from === 'create' || navigation.to === 'create'));
  const showJoinRoom = page === 'join'
    || (navigation && (navigation.from === 'join' || navigation.to === 'join'));
  const showLobby = page === 'lobby'
    || (navigation && (navigation.from === 'lobby' || navigation.to === 'lobby'));

  return (
    <div className="app-shell">
      {page === 'landing' && !navigation && (
        <LandingPage onStart={() => setPage('select')} />
      )}
      {showRoomSelect && (
        <RoomSelectPage
          className={getSlideClass('select')}
          isOpen={page === 'select' || Boolean(navigation)}
          isTransitioning={Boolean(navigation)}
          onBack={() => setPage('landing')}
          onCreateRoom={() => navigateWithSlide('create')}
          onJoinRoom={() => navigateWithSlide('join')}
        />
      )}
      {showCreateRoom && (
        <CreateRoomPage
          className={getSlideClass('create')}
          onBack={() => navigateWithSlide('select')}
          onCreateRoom={handleCreateRoom}
        />
      )}
      {showJoinRoom && (
        <JoinRoomPage
          className={getSlideClass('join')}
          onBack={() => navigateWithSlide('select')}
          onJoinRoom={handleJoinRoom}
        />
      )}
      {showLobby && room && (
        <LobbyPage
          className={getSlideClass('lobby')}
          room={room}
          currentPlayerId={socket.id}
          onLeave={handleLeaveRoom}
          onSetReady={handleSetReady}
          onStartGame={handleStartGame}
          onUpdateSettings={handleUpdateRoomSettings}
          onReact={handleSendReaction}
          reactionError={reactionError}
        />
      )}
      {page === 'modeReveal' && game && (
        <ModeReveal
          key={game.roundId}
          selectedMode={game.activeMode}
          onComplete={handleModeRevealComplete}
        />
      )}
      {page === 'game' && game && (
        game.activeMode === 'gambar-tebak' ? (
          <DrawAndGuess
            key={game.roundId}
            socket={socket}
            game={game}
            timeLeft={timeLeft}
            players={room?.players || []}
            currentPlayerId={socket.id}
            currentPlayer={room?.players.find((player) => player.id === socket.id)}
            roundId={game.roundId}
            onUseSkill={handleUseCharacterSkill}
            onReact={handleSendReaction}
            reactionError={reactionError}
          />
        ) : (
          <GameArena
            key={game.roundId}
            activeMode={game.activeMode}
            quizId={game.quizId}
            difficulty={game.difficulty || room?.difficulty || 'medium'}
            roundId={game.roundId}
            timeLeft={timeLeft}
            players={room?.players || []}
            currentPlayerId={socket.id}
            currentPlayer={room?.players.find((player) => player.id === socket.id)}
            score={room?.players.find((player) => player.id === socket.id)?.score || 0}
            onUseSkill={handleUseCharacterSkill}
            onReact={handleSendReaction}
            reactionError={reactionError}
            onAnswer={handleGameAnswer}
            onProgress={handleGameProgress}
          />
        )
      )}
      {page === 'scoreboard' && finalStandings && (
        <ScoreboardPage
          roomName={room?.name}
          players={finalStandings.players}
          reason={finalStandings.reason}
          mode={finalStandings.mode}
          onContinue={() => setPage('lobby')}
        />
      )}
      <ReactionFeed reactions={reactions} />
      {skillNotices.length > 0 && (
        <div className="character-skill-notices" aria-live="polite">
          {skillNotices.map((notice) => (
            <div className="character-skill-notice" key={notice.id}>
              <strong>{notice.message}</strong>
              <span>{notice.details}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}