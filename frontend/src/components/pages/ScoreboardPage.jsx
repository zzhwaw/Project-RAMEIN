import BlobAvatar from '../BlobAvatars';
import { getBlobAvatarId } from '../blobAvatarUtils';

const TOTAL_QUESTIONS = 20;
const numberFormat = new Intl.NumberFormat('id-ID');

export default function ScoreboardPage({ roomName, players = [], reason, mode, onContinue }) {
  const isDrawMode = mode === 'gambar-tebak';
  const ranking = [...players].sort((first, second) => (
    (Number(second.score) || 0) - (Number(first.score) || 0)
    || (first.name || '').localeCompare(second.name || '')
  ));
  const winner = ranking[0];

  const resultMessages = {
    'time-up': 'Waktu habis! Ini hasil akhir ronde.',
    'all-answered': 'Semua pemain sudah menjawab. Ini hasil akhirnya!',
    'all-turns-complete': 'Semua giliran gambar sudah selesai! Ini hasil akhirnya.',
    'all-players-left': 'Permainan berakhir. Ini hasil skor terakhir.',
  };
  const resultMessage = resultMessages[reason] || 'Permainan berakhir. Ini hasil akhirnya!';
  const maxScore = Math.max(1, ...ranking.map((player) => Number(player.score) || 0));
  const accuracyAward = !isDrawMode
    ? ranking
      .filter((player) => Number(player.answeredQuestions) > 0)
      .sort((first, second) => (
        (Number(second.correctAnswers) / Number(second.answeredQuestions))
        - (Number(first.correctAnswers) / Number(first.answeredQuestions))
      ))[0]
    : null;
  const speedAward = !isDrawMode
    ? [...ranking].sort((first, second) => (
      (Number(second.speedBonus) || 0) - (Number(first.speedBonus) || 0)
    ))[0]
    : null;
  const awards = [
    winner && { player: winner, label: 'JUARA POIN', detail: 'Skor tertinggi', icon: '🏆' },
    accuracyAward && Number(accuracyAward.correctAnswers) > 0 && {
      player: accuracyAward,
      label: 'PALING AKURAT',
      detail: `${Math.round((Number(accuracyAward.correctAnswers) / Number(accuracyAward.answeredQuestions)) * 100)}% jawaban benar`,
      icon: '🎯',
    },
    speedAward && Number(speedAward.speedBonus) > 0 && {
      player: speedAward,
      label: 'PALING SIGAP',
      detail: `+${Number(speedAward.speedBonus) || 0} poin kecepatan`,
      icon: '⚡',
    },
  ].filter(Boolean);

  return (
    <main className="scoreboard-page">
      <div className="scoreboard-decoration scoreboard-decoration-pink" aria-hidden="true" />
      <div className="scoreboard-decoration scoreboard-decoration-blue" aria-hidden="true" />
      <div className="scoreboard-confetti" aria-hidden="true">
        {Array.from({ length: 18 }, (_, index) => (
          <span className="scoreboard-confetti-piece" key={index} />
        ))}
      </div>
      <span className="scoreboard-spark scoreboard-spark-one" aria-hidden="true">✦</span>
      <span className="scoreboard-spark scoreboard-spark-two" aria-hidden="true">✹</span>

      <header className="scoreboard-header">
        <span className="scoreboard-brand">RAMEIN</span>
        <span className="scoreboard-room-name">{roomName}</span>
      </header>

      <section className="scoreboard-content" aria-labelledby="scoreboard-title">
        <div className="scoreboard-trophy" aria-hidden="true">🏆</div>
        <p className="scoreboard-eyebrow">HASIL MINI GAME</p>
        <h1 id="scoreboard-title">Papan Juara</h1>
        <p className="scoreboard-description">{resultMessage}</p>

        {ranking.length > 0 && (
          <section className="scoreboard-chart" aria-labelledby="scoreboard-chart-title">
            <div className="scoreboard-chart-heading">
              <div>
                <h2 id="scoreboard-chart-title">Perbandingan skor</h2>
                <p>Batang lebih panjang berarti skor lebih tinggi.</p>
              </div>
              <span className="scoreboard-chart-max">Maks. {numberFormat.format(maxScore)} poin</span>
            </div>
            <ol className="scoreboard-chart-list">
              {ranking.map((player, index) => {
                const rank = index + 1;
                const score = Math.max(0, Number(player.score) || 0);
                const speedBonus = Math.max(0, Number(player.speedBonus) || 0);
                const baseScore = Math.max(0, Number(player.baseScore) || (score - speedBonus));
                const answeredQuestions = Math.max(0, Number(player.answeredQuestions) || 0);
                const correctAnswers = Math.max(0, Number(player.correctAnswers) || 0);

                return (
                  <li
                    className={`scoreboard-chart-row${rank === 1 ? ' scoreboard-chart-row-first' : ''}`}
                    key={player.id || `${player.name}-${rank}`}
                  >
                    <div className="scoreboard-chart-player">
                      <span className="scoreboard-chart-rank" aria-label={`Peringkat ${rank}`}>
                        {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank}
                      </span>
                      <span className="scoreboard-chart-avatar" aria-hidden="true">
                        <BlobAvatar
                          avatarId={player.avatarId || getBlobAvatarId(player.id || player.name)}
                          size={42}
                        />
                      </span>
                      <span className="scoreboard-chart-name">
                        <strong>{player.name || 'Pemain'}</strong>
                        <small>{rank === 1 ? 'JUARA 1' : `JUARA ${rank}`}{player.isHost ? ' · HOST' : ''}</small>
                      </span>
                      <strong className="scoreboard-chart-score">
                        {numberFormat.format(score)} <small>poin</small>
                      </strong>
                    </div>
                    <div
                      className="scoreboard-chart-track"
                      role="progressbar"
                      aria-label={`Skor ${player.name || 'Pemain'}`}
                      aria-valuemin={0}
                      aria-valuemax={maxScore}
                      aria-valuenow={score}
                      aria-valuetext={`${numberFormat.format(score)} dari ${numberFormat.format(maxScore)} poin`}
                    >
                      <span
                        className="scoreboard-chart-bar"
                        style={{ width: `${(score / maxScore) * 100}%` }}
                      />
                    </div>
                    <div className="scoreboard-chart-details">
                      {isDrawMode ? (
                        <span>Poin kontribusi gambar & tebakan: {numberFormat.format(baseScore)}</span>
                      ) : (
                        <>
                          <span>
                            {correctAnswers}/{TOTAL_QUESTIONS} benar
                            {answeredQuestions < TOTAL_QUESTIONS ? ` · ${answeredQuestions} dijawab` : ''}
                          </span>
                          <span>{numberFormat.format(baseScore)} poin dasar</span>
                          <span>+{numberFormat.format(speedBonus)} poin cepat</span>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
            <div className="scoreboard-chart-scale" aria-hidden="true">
              <span>0 poin</span>
              <span>{numberFormat.format(maxScore)} poin</span>
            </div>
          </section>
        )}

        {awards.length > 0 && (
          <section className="scoreboard-awards" aria-label="Penghargaan pertandingan">
            {awards.map((award) => (
              <article className="scoreboard-award" key={`${award.label}-${award.player.id || award.player.name}`}>
                <span className="scoreboard-award-icon" aria-hidden="true">{award.icon}</span>
                <span className="scoreboard-award-info">
                  <strong>{award.label}</strong>
                  <span>{award.player.name || 'Pemain'} · {award.detail}</span>
                </span>
              </article>
            ))}
          </section>
        )}

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
