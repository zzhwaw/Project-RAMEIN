import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import LandingPage from './components/LandingPage';
import RoomSelectPage from './components/RoomSelectPage';
import CreateRoomPage from './components/CreateRoomPage';
import JoinRoomPage from './components/JoinRoomPage';
import LobbyPage from './components/LobbyPage';

export default function App() {
  const [page, setPage] = useState('landing');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [room, setRoom] = useState(null);
  const [socket] = useState(() => io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001', {
    autoConnect: false,
  }));
  const createRoomTimeout = useRef(null);
  const joinRoomTimeout = useRef(null);

  useEffect(() => {
    const handleRoomUpdate = (updatedRoom) => setRoom(updatedRoom);
    socket.on('room:updated', handleRoomUpdate);

    return () => {
      window.clearTimeout(createRoomTimeout.current);
      window.clearTimeout(joinRoomTimeout.current);
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
      setPage('lobby');
    }
    return result;
  };

  const handleJoinRoom = async (playerDetails) => {
    const result = await requestRoom('room:join', playerDetails);
    if (result.room) {
      setRoom(result.room);
      setPage('lobby');
    }
    return result;
  };

  const handleLeaveRoom = () => {
    socket.emit('room:leave');
    setRoom(null);
    setPage('select');
  };

  const startCreateRoomPage = () => {
    if (isCreatingRoom) return;

    setIsCreatingRoom(true);
    createRoomTimeout.current = window.setTimeout(() => {
      setPage('create');
      setIsCreatingRoom(false);
    }, 700);
  };

  const startJoinRoomPage = () => {
    if (isJoiningRoom) return;

    setIsJoiningRoom(true);
    joinRoomTimeout.current = window.setTimeout(() => {
      setPage('join');
      setIsJoiningRoom(false);
    }, 700);
  };

  return (
    <div className="app-shell">
      {page !== 'create' && page !== 'join' && page !== 'lobby' && (
        <LandingPage onStart={() => setPage('select')} />
      )}
      {(page === 'landing' || page === 'select' || isCreatingRoom || isJoiningRoom) && (
        <RoomSelectPage
          isOpen={page === 'select' || isCreatingRoom || isJoiningRoom}
          isCreating={isCreatingRoom}
          isJoining={isJoiningRoom}
          onBack={() => setPage('landing')}
          onCreateRoom={startCreateRoomPage}
          onJoinRoom={startJoinRoomPage}
        />
      )}
      {page === 'create' && (
        <CreateRoomPage onBack={() => setPage('select')} onCreateRoom={handleCreateRoom} />
      )}
      {page === 'join' && (
        <JoinRoomPage onBack={() => setPage('select')} onJoinRoom={handleJoinRoom} />
      )}
      {page === 'lobby' && room && (
        <LobbyPage room={room} onLeave={handleLeaveRoom} />
      )}
    </div>
  );
}