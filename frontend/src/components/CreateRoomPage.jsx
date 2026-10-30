import { useState } from 'react';

const slimeColors = ['red', 'blue', 'green', 'yellow', 'pink', 'dark'];

export default function CreateRoomPage({ onBack, onCreateRoom }) {
  const [roomName, setRoomName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [capacity, setCapacity] = useState('6');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    const result = await onCreateRoom({
      roomName,
      playerName,
      capacity: Number(capacity),
    });
    if (result.error) setError(result.error);
    setIsSubmitting(false);
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

            <label htmlFor="player-name">Nama pemain</label>
            <input
              id="player-name"
              name="playerName"
              type="text"
              placeholder="Nama kamu"
              maxLength={24}
              value={playerName}
              onChange={(event) => setPlayerName(event.target.value)}
              required
            />

            <label htmlFor="player-count">Kapasitas pemain</label>
            <select
              id="player-count"
              name="capacity"
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
            >
              <option value="3">3 pemain</option>
              <option value="4">4 pemain</option>
              <option value="5">5 pemain</option>
              <option value="6">6 pemain</option>
            </select>

            {error && <p className="room-form-error" role="alert">{error}</p>}
            <button className="create-room-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'MEMBUAT ROOM...' : 'BUAT ROOM & MASUK LOBBY'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
