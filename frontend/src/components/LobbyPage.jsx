const slimeColors = ['red', 'blue', 'green', 'yellow', 'pink', 'dark'];

export default function LobbyPage({ room, onLeave }) {
  const players = room.players || [];
  const capacity = room.capacity || room.maxPlayers;
  const hasMinimumPlayers = players.length >= room.minPlayers;

  return (
    <main className="lobby-page">
      <header className="lobby-header">
        <div className="lobby-brand">RAMEIN</div>
        <button className="lobby-leave-button" onClick={onLeave}>KELUAR ROOM</button>
      </header>

      <div className="lobby-content">
        <div className="lobby-slimes" aria-hidden="true">
          {slimeColors.map((color, index) => (
            <div className={`slime slime-${color}`} key={color} style={{ '--slime-index': index }}>
              <span className="slime-eye slime-eye-left" />
              <span className="slime-eye slime-eye-right" />
              <span className="slime-mouth" />
            </div>
          ))}
        </div>

        <section className="lobby-card">
          <p className="lobby-eyebrow">LOBBY ROOM</p>
          <h1>{room.name}</h1>
          <p className="lobby-subtitle">Ajak temanmu masuk dan bersiap untuk main!</p>

          <div className="lobby-room-code">
            <span>ID ROOM</span>
            <strong>{room.id}</strong>
            <small>Bagikan ID ini kepada temanmu</small>
          </div>

          <div className="lobby-player-heading">
            <h2>Pemain</h2>
            <span>{players.length}/{capacity}</span>
          </div>

          <div className="lobby-player-list">
            {players.map((player) => (
              <div className="lobby-player" key={player.id}>
                <span className={`lobby-player-avatar slime-${slimeColors[players.indexOf(player)]}`}>
                  {player.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="lobby-player-name">{player.name}</span>
                {player.isHost && <span className="lobby-host-badge">HOST</span>}
              </div>
            ))}
            {Array.from({ length: capacity - players.length }, (_, index) => (
              <div className="lobby-player lobby-player-empty" key={`empty-${index}`}>
                <span className="lobby-empty-avatar">+</span>
                <span>Menunggu pemain...</span>
              </div>
            ))}
          </div>

          <div className={`lobby-status ${hasMinimumPlayers ? 'lobby-status-ready' : ''}`} role="status">
            {hasMinimumPlayers
              ? 'Pemain cukup! Room siap untuk dimulai.'
              : `Menunggu pemain — minimal ${room.minPlayers} orang untuk mulai (${players.length}/${room.minPlayers}).`}
          </div>
          <div className={`lobby-ready-indicator ${hasMinimumPlayers ? 'lobby-ready-indicator-active' : ''}`}>
            {hasMinimumPlayers ? 'ROOM SIAP DIMULAI' : `MENUNGGU PEMAIN (${players.length}/${room.minPlayers})`}
          </div>
        </section>
      </div>
    </main>
  );
}
