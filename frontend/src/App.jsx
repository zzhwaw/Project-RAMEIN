import { useEffect, useRef, useState } from 'react';
import LandingPage from './components/LandingPage';
import RoomSelectPage from './components/RoomSelectPage';
import CreateRoomPage from './components/CreateRoomPage';

export default function App() {
  const [page, setPage] = useState('landing');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const createRoomTimeout = useRef(null);

  useEffect(() => () => window.clearTimeout(createRoomTimeout.current), []);

  const handleCreateRoom = () => {
    if (isCreatingRoom) return;

    setIsCreatingRoom(true);
    createRoomTimeout.current = window.setTimeout(() => {
      setPage('create');
      setIsCreatingRoom(false);
    }, 700);
  };

  return (
    <div className="app-shell">
      {page !== 'create' && (
        <LandingPage onStart={() => setPage('select')} />
      )}
      {(page !== 'create' || isCreatingRoom) && (
        <RoomSelectPage
          isOpen={page === 'select' || isCreatingRoom}
          isCreating={isCreatingRoom}
          onBack={() => setPage('landing')}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={() => alert('Fitur gabung room akan segera hadir!')}
        />
      )}
      {(page === 'create' || isCreatingRoom) && (
        <CreateRoomPage onBack={() => setPage('select')} />
      )}
    </div>
  );
}