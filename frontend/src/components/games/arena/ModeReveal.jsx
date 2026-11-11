import { useEffect, useRef, useState } from 'react';
import './ModeReveal.css';

const REVEAL_DURATION_MS = 3000;
const RESULT_HOLD_MS = 2000;
const HIGHLIGHT_INTERVAL_MS = 110;

const MODES = [
  { id: 'gambar', title: 'Tebak Gambar', icon: '🖼️', color: 'blue' },
  { id: 'pengetahuan', title: 'Tebak Pengetahuan', icon: '🧠', color: 'pink' },
  { id: 'hitung', title: 'Menghitung Cepat', icon: '🔢', color: 'yellow' },
  { id: 'gambar-tebak', title: 'Gambar & Tebak', icon: '🎨', color: 'green' },
];

function getRandomMode(excludedMode) {
  const availableModes = MODES.filter((mode) => mode.id !== excludedMode);
  return availableModes[Math.floor(Math.random() * availableModes.length)].id;
}

export default function ModeReveal({ selectedMode, onComplete }) {
  const [finalMode] = useState(() => (
    MODES.some((mode) => mode.id === selectedMode)
      ? selectedMode
      : MODES[Math.floor(Math.random() * MODES.length)].id
  ));
  const [highlightedMode, setHighlightedMode] = useState(MODES[0].id);
  const [isRevealed, setIsRevealed] = useState(false);
  const intervalRef = useRef(null);
  const revealTimeoutRef = useRef(null);
  const completeTimeoutRef = useRef(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      setHighlightedMode((currentMode) => getRandomMode(currentMode));
    }, HIGHLIGHT_INTERVAL_MS);

    revealTimeoutRef.current = window.setTimeout(() => {
      window.clearInterval(intervalRef.current);
      setHighlightedMode(finalMode);
      setIsRevealed(true);
      completeTimeoutRef.current = window.setTimeout(() => {
        onCompleteRef.current?.(finalMode);
      }, RESULT_HOLD_MS);
    }, REVEAL_DURATION_MS);

    return () => {
      window.clearInterval(intervalRef.current);
      window.clearTimeout(revealTimeoutRef.current);
      window.clearTimeout(completeTimeoutRef.current);
    };
  }, [finalMode]);

  const selectedModeDetails = MODES.find((mode) => mode.id === finalMode);

  return (
    <main className="mode-reveal-page" aria-live="polite">
      <div className="mode-reveal-spark mode-reveal-spark-one" aria-hidden="true">✦</div>
      <div className="mode-reveal-spark mode-reveal-spark-two" aria-hidden="true">✸</div>
      <p className="mode-reveal-eyebrow">RAMEIN • BABAK BERIKUTNYA</p>
      <h1 className="mode-reveal-title">{isRevealed ? 'MODE TERPILIH!' : 'MODE APA YANG KELUAR?'}</h1>

      <section className="mode-reveal-cards" aria-label="Mode permainan yang diundi">
        {MODES.map((mode) => {
          const isWinner = isRevealed && mode.id === finalMode;
          const isActive = !isRevealed && mode.id === highlightedMode;

          return (
            <article
              className={[
                'mode-reveal-card',
                `mode-reveal-card-${mode.color}`,
                isActive ? 'mode-reveal-card-active' : '',
                isWinner ? 'mode-reveal-card-winner' : '',
                isRevealed && !isWinner ? 'mode-reveal-card-dimmed' : '',
              ].filter(Boolean).join(' ')}
              key={mode.id}
              aria-current={isWinner ? 'true' : undefined}
            >
              <span className="mode-reveal-card-icon" aria-hidden="true">{mode.icon}</span>
              <strong>{mode.title}</strong>
              {isWinner && <span className="mode-reveal-card-badge">TERPILIH!</span>}
            </article>
          );
        })}
      </section>

      <p className={`mode-reveal-result${isRevealed ? ' mode-reveal-result-visible' : ''}`} role="status">
        {isRevealed
          ? `MODE TERPILIH: ${selectedModeDetails.title.toUpperCase()}!`
          : 'Sedang mengundi mode...'}
      </p>
    </main>
  );
}
