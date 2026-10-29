import { useState } from 'react';
import LandingPage from './components/LandingPage';
import RoomSelectPage from './components/RoomSelectPage';

export default function App() {
  const [isRoomSelectOpen, setIsRoomSelectOpen] = useState(false);

  // Fungsi saat tombol MAIN di klik (Tirai Menutup Ke Tengah)
  const handleStart = () => {
    setIsRoomSelectOpen(true);
  };

  // Fungsi saat tombol Back (<) di klik (Tirai Terbuka Kembali)
  const handleBackToHome = () => {
    setIsRoomSelectOpen(false);
  };

  const handleCreateRoom = () => {
    alert('Aksi: Buat Room dipilih!');
  };

  const handleJoinRoom = () => {
    alert('Aksi: Gabung Room dipilih!');
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Layer 1: Homepage */}
      <LandingPage onStart={handleStart} />

      {/* Layer 2: Room Selection (Animasi Tirai Pink & Biru) */}
      <RoomSelectPage 
        isOpen={isRoomSelectOpen} 
        onBack={handleBackToHome}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
      />
    </div>
  );
}