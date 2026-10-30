import { useState } from 'react';

const slimeColors = ['red', 'blue', 'green', 'yellow', 'pink', 'dark'];

export default function CreateRoomPage({ onBack }) {
  const [roomName, setRoomName] = useState('');
  const [playerCount, setPlayerCount] = useState('4');
  const [roomCode, setRoomCode] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    setRoomCode(code);
  };

  return (
    <main className="create-room-page">
      <button className="create-back-button" onClick={onBack} aria-label="Kembali ke pilihan room">
        &#10094;
      </button>

      <div className="create-room-content">
        <div className="slime-line" aria-hidden="true">
          {slimeColors.map((color, index) => (
            <div className={`slime slime-${color}`} key={color} style={{ '--slime-index': index }}>
              <span className="slime-eye slime-eye-left" />
              <span className="slime-eye slime-eye-right" />
              <span className="slime-mouth" />
            </div>
          ))}
        </div>

        <section className="create-room-card">
          <p className="create-room-eyebrow">RAMEIN BARENG TEMAN!</p>
          <h1>Buat Room</h1>
          <p className="create-room-description">Siapkan room serumu dan ajak teman-teman main.</p>

          {roomCode ? (
            <div className="room-created" role="status">
              <span>Room kamu siap!</span>
              <strong>{roomCode}</strong>
              <p>Bagikan kode ini ke teman-temanmu.</p>
              <button className="create-room-submit" onClick={onBack}>SELESAI</button>
            </div>
          ) : (
            <form className="create-room-form" onSubmit={handleSubmit}>
              <label htmlFor="room-name">Nama room</label>
              <input
                id="room-name"
                name="roomName"
                type="text"
                placeholder="Contoh: Geng paling rame"
                maxLength={30}
                value={roomName}
                onChange={(event) => setRoomName(event.target.value)}
                required
              />

              <label htmlFor="player-count">Jumlah pemain</label>
              <select
                id="player-count"
                name="playerCount"
                value={playerCount}
                onChange={(event) => setPlayerCount(event.target.value)}
              >
                <option value="2">2 pemain</option>
                <option value="4">4 pemain</option>
                <option value="6">6 pemain</option>
                <option value="8">8 pemain</option>
              </select>

              <button className="create-room-submit" type="submit">BUAT ROOM</button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
