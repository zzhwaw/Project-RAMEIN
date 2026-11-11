import { useState } from 'react';

const cardColors = ['card-pink', 'card-blue', 'card-yellow', 'card-red', 'card-green', 'card-black'];
const gameModes = [
  { value: 'random', label: 'Acak setiap game' },
  { value: 'gambar', label: 'Tebak Gambar' },
  { value: 'pengetahuan', label: 'Tebak Pengetahuan' },
  { value: 'hitung', label: 'Menghitung Cepat' },
  { value: 'gambar-tebak', label: 'Gambar & Tebak' },
];

export default function LobbyPage({
  room,
  roomCode,
  players = [],
  currentPlayerId,
  onBack,
  onLeave,
  onSetReady,
  onStartGame,
  onUpdateSettings,
  className = '',
}) {
  const [message, setMessage] = useState('');
  const [isUpdatingReady, setIsUpdatingReady] = useState(false);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const [modeSelection, setModeSelection] = useState(room?.modeSelection || 'random');
  const [difficulty, setDifficulty] = useState(room?.difficulty || 'medium');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const roomPlayers = room?.players || players;
  const minimumPlayers = room?.minPlayers || 3;
  const displayedRoomCode = room?.id || roomCode || '------';
  const difficultyLabels = { easy: 'EASY', medium: 'MEDIUM', hard: 'HARD' };
  const modeLabel = gameModes.find((mode) => mode.value === (room?.modeSelection || 'random'))?.label;
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

  const handleUpdateSettings = async (event) => {
    event.preventDefault();
    if (!isHost || !onUpdateSettings) return;
    setMessage('');
    setIsSavingSettings(true);
    const result = await onUpdateSettings({ modeSelection, difficulty });
    if (result?.error) setMessage(result.error);
    else setMessage('Mode dan level diperbarui. Semua pemain perlu siap kembali.');
    setIsSavingSettings(false);
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
          <div className="lobby-room-settings-summary">
            <span className="lobby-mode-badge">MODE {modeLabel?.toUpperCase() || 'ACAK'}</span>
            <span className="lobby-difficulty-badge">
              LEVEL {difficultyLabels[room?.difficulty] || 'MEDIUM'}
            </span>
          </div>
          {copyMessage && <span className="copy-room-id-status" role="status">{copyMessage}</span>}
        </div>
        <button className="btn-lobby-back" onClick={leaveLobby} aria-label="Keluar dari lobby">
          &#10094;
        </button>
      </header>

      {isHost && room?.phase !== 'playing' && (
        <form className="lobby-settings-form" onSubmit={handleUpdateSettings}>
          <div className="lobby-settings-heading">
            <strong>ATUR MODE & LEVEL</strong>
            <span>Hanya host yang bisa mengubah pengaturan.</span>
          </div>
          <label>
            <span>Mode permainan</span>
            <select value={modeSelection} onChange={(event) => setModeSelection(event.target.value)}>
              {gameModes.map((mode) => (
                <option key={mode.value} value={mode.value}>{mode.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Tingkat kesulitan</span>
            <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
          <button
            className="lobby-settings-save"
            type="submit"
            disabled={isSavingSettings || (
              modeSelection === (room?.modeSelection || 'random')
              && difficulty === (room?.difficulty || 'medium')
            )}
          >
            {isSavingSettings ? 'MENYIMPAN...' : 'SIMPAN PENGATURAN'}
          </button>
        </form>
      )}

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