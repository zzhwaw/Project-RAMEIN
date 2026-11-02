import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import LandingPage from './components/LandingPage';
import RoomSelectPage from './components/RoomSelectPage';
import CreateRoomPage from './components/CreateRoomPage';
import JoinRoomPage from './components/JoinRoomPage';
import LobbyPage from './components/LobbyPage';

export default function App() {
  const [page, setPage] = useState('landing');
  const [navigation, setNavigation] = useState(null);
  const [room, setRoom] = useState(null);
  const [lobbyOrigin, setLobbyOrigin] = useState('create');
  const [socket] = useState(() => io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001', {
    autoConnect: false,
  }));
  const navigationTimeout = useRef(null);

  useEffect(() => {
    const handleRoomUpdate = (updatedRoom) => setRoom(updatedRoom);
    socket.on('room:updated', handleRoomUpdate);

    return () => {
      window.clearTimeout(navigationTimeout.current);
      socket.off('room:updated', handleRoomUpdate);
      socket.disconnect();
    };
  }, [socket]);

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

  const navigateWithSlide = (target, from = page, onComplete) => {
    if (navigation || from === target) return;

    setNavigation({ from, to: target });
    navigationTimeout.current = window.setTimeout(() => {
      setPage(target);
      setNavigation(null);
      onComplete?.();
    }, 620);
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
      {page !== 'create' && page !== 'join' && page !== 'lobby' && (
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
          onLeave={handleLeaveRoom}
        />
      )}
    </div>
  );
}