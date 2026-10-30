import { useState } from 'react';

const slimeColors = ['blue', 'green', 'yellow', 'pink', 'red', 'dark'];

export default function JoinRoomPage({ onBack }) {
  const [roomCode, setRoomCode] = useState('');
  const [submittedCode, setSubmittedCode] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmittedCode(roomCode.trim().toUpperCase());
  };

  const handleCodeChange = (event) => {
    setRoomCode(event.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase());
    setSubmittedCode('');
  };

  return (
    <main className="join-room-page">
      <button className="join-back-button" onClick={onBack} aria-label="Kembali ke pilihan room">
        &#10094;
      </button>

      <div className="join-room-content">
        <div className="join-slime-line" aria-hidden="true">
          {slimeColors.map((color, index) => (
            <div className={`slime slime-${color}`} key={color} style={{ '--slime-index': index }}>
              <span className="slime-eye slime-eye-left" />
              <span className="slime-eye slime-eye-right" />
              <span className="slime-mouth" />
            </div>
          ))}
        </div>

        <section className="join-room-card">
          <p className="join-room-eyebrow">TEMAN-TEMAN SUDAH MENUNGGU!</p>
          <h1>Gabung Room</h1>
          <p className="join-room-description">Masukkan kode room dari temanmu untuk ikut bermain.</p>

          <form
            className="join-room-form"
            onSubmit={handleSubmit}
          >
            <label htmlFor="join-room-code">Kode room</label>
            <input
              id="join-room-code"
              name="roomCode"
              type="text"
              placeholder="Contoh: ABC123"
              autoComplete="off"
              minLength={6}
              maxLength={6}
              value={roomCode}
              onChange={handleCodeChange}
              aria-describedby={submittedCode ? 'join-room-status' : undefined}
              required
            />
            <button className="join-room-submit" type="submit">GABUNG ROOM</button>
            {submittedCode && (
              <p className="join-room-status" id="join-room-status" role="status">
                Kode {submittedCode} siap digunakan. Koneksi room belum tersedia.
              </p>
            )}
          </form>
        </section>
      </div>
    </main>
  );
}
