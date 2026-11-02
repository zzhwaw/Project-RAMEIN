import { useState } from 'react';

const cardColors = ['card-pink', 'card-blue', 'card-yellow', 'card-red', 'card-green', 'card-black'];

export default function LobbyPage({
  room,
  roomCode,
  players = [],
  currentPlayerId,
  onBack,
  onLeave,
  onSetReady,
  onStartGame,
  className = '',
}) {
  const [message, setMessage] = useState('');
  const [isUpdatingReady, setIsUpdatingReady] = useState(false);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const roomPlayers = room?.players || players;
  const minimumPlayers = room?.minPlayers || 3;
  const displayedRoomCode = room?.id || roomCode || '------';
  const currentPlayer = roomPlayers.find((player) => player.id === currentPlayerId);
  const isHost = currentPlayer?.isHost || room?.hostId === currentPlayerId;
  const readyPlayersCount = roomPlayers.filter((player) => player.ready).length;
  const allPlayersReady = roomPlayers.length >= minimumPlayers
    && roomPlayers.every((player) => player.ready);
  const leaveLobby = onLeave || onBack;

  const handleSetReady = async () => {
    setMessage('');
    setIsUpdatingReady(true);
    const result = await onSetReady?.(!currentPlayer?.ready);
    if (result?.error) setMessage(result.error);
    setIsUpdatingReady(false);
  };

  const handleStartGame = async () => {
    if (!isHost || !allPlayersReady) return;
    setMessage('');
    setIsStartingGame(true);
    const result = await onStartGame?.();
    if (result?.error) setMessage(result.error);
    setIsStartingGame(false);
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
                {player && <span className={`player-ready-badge ${player.ready ? 'player-ready-badge-active' : ''}`}>
                  {player.ready ? 'SIAP' : 'BELUM SIAP'}
                </span>}
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
          {allPlayersReady
            ? `Semua ${roomPlayers.length} pemain siap`
            : `${readyPlayersCount}/${roomPlayers.length} pemain siap • minimal ${minimumPlayers} pemain`}
        </p>
        {message && <p className="lobby-message" role="alert">{message}</p>}
        <button
          className={`lobby-ready-button ${currentPlayer?.ready ? 'lobby-ready-active' : ''}`}
          onClick={handleSetReady}
          disabled={isUpdatingReady || room?.phase === 'playing'}
        >
          {isUpdatingReady ? 'MENYIMPAN...' : currentPlayer?.ready ? 'SIAP!' : 'SAYA SIAP'}
        </button>
        {isHost && (
          <button
            className="btn-lobby-main"
            onClick={handleStartGame}
            disabled={!allPlayersReady || isStartingGame}
            title={!allPlayersReady ? 'Pastikan minimal 3 pemain dan semua pemain sudah siap' : 'Mulai game'}
          >
            {isStartingGame ? 'MEMULAI...' : allPlayersReady ? 'MULAI GAME' : 'MENUNGGU PEMAIN'}
          </button>
        )}
      </footer>
    </main>
  );
}