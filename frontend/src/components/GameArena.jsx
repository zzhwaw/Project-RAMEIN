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

const TOTAL_QUESTIONS = 10;

function calculateScore(correctAnswers, timeLeft, roundDuration) {
  if (correctAnswers <= 0) return 0;
  const speedRatio = roundDuration > 0 ? Math.max(0, Math.min(1, timeLeft / roundDuration)) : 0;
  return Math.round((correctAnswers / TOTAL_QUESTIONS) * (1000 + 500 * speedRatio));
}

export default function GameArena({
  gameId,
  roundId,
  timeLeft,
  onAnswer,
  onProgress,
  roundDuration = 30,
}) {
  const [result, setResult] = useState(null);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const submission = useRef({ roundId, submitted: false, correctAnswers: 0, answeredQuestions: 0 });
  const GameComponent = GAME_COMPONENTS[gameId];
  const displayedTime = Number.isFinite(timeLeft) ? Math.max(0, Math.ceil(timeLeft)) : '--';
  const visibleResult = result?.roundId === roundId ? result : null;

  const finishRound = useCallback((correctAnswers = submission.current.correctAnswers) => {
    if (submission.current.submitted) return;

    submission.current.submitted = true;
    const remaining = Number.isFinite(timeLeft) ? Math.max(0, timeLeft) : 0;
    const score = calculateScore(correctAnswers, remaining, roundDuration);

    setResult({ roundId, correctAnswers, isCorrect: correctAnswers > 0, score });
    onAnswer(score, {
      correctAnswers,
      answeredQuestions: submission.current.answeredQuestions,
      totalQuestions: TOTAL_QUESTIONS,
    });
  }, [onAnswer, roundDuration, roundId, timeLeft]);

  const submitQuestionAnswer = useCallback((isCorrect, questionIndex) => {
    if (submission.current.submitted || questionIndex !== submission.current.answeredQuestions) return;

    const nextAnsweredQuestions = submission.current.answeredQuestions + 1;
    const nextCorrectAnswers = submission.current.correctAnswers + Number(isCorrect);
    submission.current.answeredQuestions = nextAnsweredQuestions;
    submission.current.correctAnswers = nextCorrectAnswers;
    setAnsweredQuestions(nextAnsweredQuestions);
    onProgress?.({
      correctAnswers: nextCorrectAnswers,
      answeredQuestions: nextAnsweredQuestions,
      totalQuestions: TOTAL_QUESTIONS,
    });

    if (nextAnsweredQuestions === TOTAL_QUESTIONS) {
      finishRound(nextCorrectAnswers);
    }
  }, [finishRound, onProgress]);

  useEffect(() => {
    if (Number.isFinite(timeLeft) && timeLeft <= 0) {
      finishRound();
    }
  }, [finishRound, timeLeft]);

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
        {!visibleResult && (
          <GameComponent
            key={roundId}
            onAnswer={submitQuestionAnswer}
            randomSeed={Array.from(roundId || String(gameId)).reduce(
              (seed, character) => (seed * 31 + character.charCodeAt(0)) >>> 0,
              gameId >>> 0,
            )}
          />
        )}
        {visibleResult && (
          <div className={`game-result ${visibleResult.isCorrect ? 'game-result-correct' : 'game-result-incorrect'}`} role="status">
            <strong>Ronde selesai!</strong>
            <span>Jawaban benar: {visibleResult.correctAnswers}/{TOTAL_QUESTIONS}</span>
            <span>Skor ronde: {visibleResult.score}</span>
          </div>
        )}
        {!visibleResult && (
          <p className="game-question-count" aria-live="polite">
            Soal terjawab: {answeredQuestions}/{TOTAL_QUESTIONS}
          </p>
        )}
      </div>
      <p className="game-arena-caption">{GAME_NAMES[gameId]} • Ilmu Pengetahuan & Pengetahuan Umum</p>
    </main>
  );
}
