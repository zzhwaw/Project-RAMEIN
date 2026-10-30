import { useEffect, useRef, useState } from 'react';
import LandingPage from './components/LandingPage';
import RoomSelectPage from './components/RoomSelectPage';
import CreateRoomPage from './components/CreateRoomPage';
import JoinRoomPage from './components/JoinRoomPage';

export default function App() {
  const [page, setPage] = useState('landing');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const createRoomTimeout = useRef(null);
  const joinRoomTimeout = useRef(null);

  useEffect(() => () => {
    window.clearTimeout(createRoomTimeout.current);
    window.clearTimeout(joinRoomTimeout.current);
  }, []);

  const handleCreateRoom = () => {
    if (isCreatingRoom) return;

    setIsCreatingRoom(true);
    createRoomTimeout.current = window.setTimeout(() => {
      setPage('create');
      setIsCreatingRoom(false);
    }, 700);
  };

  const handleJoinRoom = () => {
    if (isJoiningRoom) return;

    setIsJoiningRoom(true);
    joinRoomTimeout.current = window.setTimeout(() => {
      setPage('join');
      setIsJoiningRoom(false);
    }, 700);
  };

  return (
    <div className="app-shell">
      {page !== 'create' && page !== 'join' && (
        <LandingPage onStart={() => setPage('select')} />
      )}
      {(page === 'landing' || page === 'select' || isCreatingRoom || isJoiningRoom) && (
        <RoomSelectPage
          isOpen={page === 'select' || isCreatingRoom || isJoiningRoom}
          isCreating={isCreatingRoom}
          isJoining={isJoiningRoom}
          onBack={() => setPage('landing')}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
        />
      )}
      {(page === 'create' || isCreatingRoom) && (
        <CreateRoomPage onBack={() => setPage('select')} />
      )}
      {(page === 'join' || isJoiningRoom) && (
        <JoinRoomPage onBack={() => setPage('select')} />
      )}
    </div>
  );
}