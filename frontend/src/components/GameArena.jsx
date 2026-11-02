import { useCallback, useEffect, useRef, useState } from 'react';
import './GameArena.css';
import TebakPeta from './games/TebakPeta';
import FaktaMitos from './games/FaktaMitos';
import SusunTataSurya from './games/SusunTataSurya';
import {
  AnatomiTubuh,
  EksperimenKimia,
  RantaiMakanan,
  TebakBendera,
  TebakLandmark,
  TebakPenemu,
  WujudZat,
} from './games/AdditionalMiniGames';

const GAME_COMPONENTS = {
  1: TebakPeta,
  2: FaktaMitos,
  3: SusunTataSurya,
  4: TebakPenemu,
  5: RantaiMakanan,
  6: AnatomiTubuh,
  7: TebakBendera,
  8: EksperimenKimia,
  9: WujudZat,
  10: TebakLandmark,
};

const GAME_NAMES = {
  1: 'Tebak Peta',
  2: 'Fakta atau Mitos',
  3: 'Susun Tata Surya',
  4: 'Tebak Penemu',
  5: 'Rantai Makanan',
  6: 'Anatomi Tubuh',
  7: 'Tebak Bendera',
  8: 'Eksperimen Kimia',
  9: 'Wujud Zat',
  10: 'Tebak Landmark',
};

export default function GameArena({ gameId, roundId, timeLeft, onAnswer, roundDuration = 30 }) {
  const [result, setResult] = useState(null);
  const submission = useRef({ gameId, submitted: false });
  const GameComponent = GAME_COMPONENTS[gameId];
  const displayedTime = Number.isFinite(timeLeft) ? Math.max(0, Math.ceil(timeLeft)) : '--';
  const visibleResult = result?.gameId === gameId ? result : null;

  const submitAnswer = useCallback((isCorrect) => {
    if (submission.current.gameId !== gameId) {
      submission.current = { gameId, submitted: false };
    }
    if (submission.current.submitted) return;

    submission.current.submitted = true;
    const remaining = Number.isFinite(timeLeft) ? Math.max(0, timeLeft) : 0;
    const speedRatio = roundDuration > 0 ? Math.min(1, remaining / roundDuration) : 0;
    const score = isCorrect && remaining > 0
      ? 1000 + Math.round(500 * speedRatio)
      : 0;

    setResult({ gameId, isCorrect: Boolean(isCorrect && remaining > 0), score });
    onAnswer(score);
  }, [gameId, onAnswer, roundDuration, timeLeft]);

  useEffect(() => {
    if (Number.isFinite(timeLeft) && timeLeft <= 0) {
      submitAnswer(false);
    }
  }, [submitAnswer, timeLeft]);

  if (!GameComponent) {
    return (
      <main className="game-arena">
        <section className="game-arena-card">
          <h1>Game tidak ditemukan</h1>
          <p>Pilih game dengan ID antara 1 sampai 10.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="game-arena">
      <div className="game-arena-topbar">
        <div className="game-arena-brand">RAMEIN</div>
        <div className="game-arena-timer" aria-live="off">
          <span aria-hidden="true">⏱</span>
          <strong>{displayedTime}</strong>
          <small>detik</small>
        </div>
      </div>

      <div className="game-arena-body">
        <div className="game-arena-round">MINI GAME {gameId} / 10</div>
        <GameComponent
          key={gameId}
          onAnswer={submitAnswer}
          randomSeed={Array.from(roundId || String(gameId)).reduce(
            (seed, character) => (seed * 31 + character.charCodeAt(0)) >>> 0,
            gameId >>> 0,
          )}
        />
        {visibleResult && (
          <div className={`game-result ${visibleResult.isCorrect ? 'game-result-correct' : 'game-result-incorrect'}`} role="status">
            <strong>{visibleResult.isCorrect ? 'Mantap, benar!' : 'Belum tepat!'}</strong>
            <span>Skor ronde: {visibleResult.score}</span>
          </div>
        )}
      </div>
      <p className="game-arena-caption">{GAME_NAMES[gameId]} • Ilmu Pengetahuan & Pengetahuan Umum</p>
    </main>
  );
}
