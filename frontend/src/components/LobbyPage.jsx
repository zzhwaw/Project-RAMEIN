import { useState } from 'react';

const cardColors = ['card-pink', 'card-blue', 'card-yellow', 'card-red', 'card-green', 'card-black'];

export default function LobbyPage({ room, roomCode, players = [], onBack, onLeave, className = '' }) {
  const [message, setMessage] = useState('');
  const [copyMessage, setCopyMessage] = useState('');
  const roomPlayers = room?.players || players;
  const minimumPlayers = room?.minPlayers || 3;
  const displayedRoomCode = room?.id || roomCode || '------';
  const isReady = roomPlayers.length >= minimumPlayers;
  const leaveLobby = onLeave || onBack;

  const handleStartGame = () => {
    if (!isReady) return;
    setMessage('Lobby siap! Fitur permainan akan segera hadir.');
  };

  const handleCopyRoomCode = async () => {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Fitur salin tidak tersedia di browser ini.');
      }
      await navigator.clipboard.writeText(displayedRoomCode);
      setCopyMessage('ID room berhasil disalin!');
    } catch (error) {
      setCopyMessage(error.message || 'ID room gagal disalin. Silakan salin secara manual.');
    }
  };

  return (
    <main className={`lobby-container ${className}`}>
      <header className="lobby-header">
        <div className="lobby-room-details">
          <div className="lobby-room-name">{room?.name || 'Lobby Room'}</div>
          <div className="room-id-badge" aria-label={`ID room ${displayedRoomCode}`}>
            <span>ID ROOM</span>
            <strong>{displayedRoomCode}</strong>
            <button
              className="copy-room-id-button"
              type="button"
              onClick={handleCopyRoomCode}
              aria-label="Salin ID room"
              title="Salin ID room"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="8" y="8" width="12" height="13" rx="2" />
                <path d="M16 8V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2" />
              </svg>
            </button>
          </div>
          {copyMessage && <span className="copy-room-id-status" role="status">{copyMessage}</span>}
        </div>
        <button className="btn-lobby-back" onClick={leaveLobby} aria-label="Keluar dari lobby">
          &#10094;
        </button>
      </header>

      <section className="players-grid" aria-label="Daftar pemain">
        {cardColors.map((colorClass, index) => {
          const player = roomPlayers[index];
          return (
            <div key={player?.id || colorClass} className={`player-card-wrapper ${player ? 'player-card-filled' : 'player-card-empty'}`}>
              <div className={`player-card ${colorClass}`} aria-hidden="true">
                {player && <span>{player.name?.slice(0, 1).toUpperCase() || '?'}</span>}
                {player?.isHost && <span className="player-host-badge">HOST</span>}
              </div>
              <div className="player-name-badge" title={player?.name || 'Menunggu pemain'}>
                {player?.name || 'Menunggu...'}
              </div>
            </div>
          );
        })}
      </section>

      <footer className="lobby-footer">
        <p className="lobby-player-count" role="status">
          {isReady
            ? `${roomPlayers.length} pemain siap bermain`
            : `Menunggu pemain (${roomPlayers.length}/${minimumPlayers} minimum)`}
        </p>
        {message && <p className="lobby-message" role="status">{message}</p>}
        <button className="btn-lobby-main" onClick={handleStartGame} disabled={!isReady}>
          {isReady ? 'MAIN' : 'MENUNGGU PEMAIN'}
        </button>
      </footer>
    </main>
  );
}