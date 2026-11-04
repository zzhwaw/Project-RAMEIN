const podiumStyles = {
  1: 'score-rank-first',
  2: 'score-rank-second',
  3: 'score-rank-third',
};

export default function ScoreboardPage({ roomName, players = [], reason, onContinue }) {
  const ranking = [...players].sort((first, second) => (
    (Number(second.score) || 0) - (Number(first.score) || 0)
    || (first.name || '').localeCompare(second.name || '')
  ));
  const winner = ranking[0];

  const resultMessage = reason === 'time-up'
    ? 'Waktu habis! Ini hasil akhir ronde.'
    : 'Semua pemain sudah menjawab. Ini hasil akhirnya!';

  return (
    <main className="scoreboard-page">
      <div className="scoreboard-decoration scoreboard-decoration-pink" aria-hidden="true" />
      <div className="scoreboard-decoration scoreboard-decoration-blue" aria-hidden="true" />

      <header className="scoreboard-header">
        <span className="scoreboard-brand">RAMEIN</span>
        <span className="scoreboard-room-name">{roomName}</span>
      </header>

      <section className="scoreboard-content" aria-labelledby="scoreboard-title">
        <div className="scoreboard-trophy" aria-hidden="true">🏆</div>
        <p className="scoreboard-eyebrow">HASIL MINI GAME</p>
        <h1 id="scoreboard-title">Papan Juara</h1>
        <p className="scoreboard-description">{resultMessage}</p>

        {winner && (
          <section className="scoreboard-winner" aria-label={`Juara satu: ${winner.name || 'Pemain'}`}>
            <span className="scoreboard-winner-crown" aria-hidden="true">👑</span>
            <span className="scoreboard-winner-avatar" aria-hidden="true">
              {winner.name?.slice(0, 1).toUpperCase() || '?'}
            </span>
            <span className="scoreboard-winner-label">JUARA 1</span>
            <strong className="scoreboard-winner-name">{winner.name || 'Pemain'}</strong>
            <span className="scoreboard-winner-score">{Number(winner.score) || 0} poin</span>
            <span className="scoreboard-winner-breakdown">
              {Number(winner.correctAnswers) || 0}/10 benar
              <span aria-hidden="true"> · </span>
              +{Number(winner.speedBonus) || 0} poin cepat
            </span>
          </section>
        )}

        <ol className="scoreboard-list" aria-label="Peringkat pemain">
          {ranking.map((player, index) => {
            const rank = index + 1;
            const rankClass = podiumStyles[rank] || 'score-rank-default';

            return (
              <li className={`scoreboard-player ${rankClass}`} key={player.id || `${player.name}-${rank}`}>
                <span className="scoreboard-rank" aria-label={`Juara ${rank}`}>
                  {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                </span>
                <span className="scoreboard-player-avatar" aria-hidden="true">
                  {player.name?.slice(0, 1).toUpperCase() || '?'}
                </span>
                <span className="scoreboard-player-info">
                  <strong>{player.name || 'Pemain'}</strong>
                  <small>{rank === 1 ? 'JUARA 1' : `JUARA ${rank}`}{player.isHost ? ' · HOST' : ''}</small>
                  <small className="scoreboard-player-bonus">
                    {Number(player.correctAnswers) || 0}/10 benar · +{Number(player.speedBonus) || 0} poin cepat
                  </small>
                </span>
                <span className="scoreboard-player-score">{Number(player.score) || 0}<small> POIN</small></span>
              </li>
            );
          })}
        </ol>

        {ranking.length === 0 && (
          <p className="scoreboard-empty">Belum ada data skor untuk ditampilkan.</p>
        )}

        <button className="scoreboard-continue" onClick={onContinue}>
          KEMBALI KE LOBBY
        </button>
      </section>
    </main>
  );
}
