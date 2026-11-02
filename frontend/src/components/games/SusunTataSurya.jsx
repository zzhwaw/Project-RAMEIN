import { useMemo, useState } from 'react';
import questions from './gameQuestions.json';
import { GamePanel } from './MiniGameUI';
import { seededShuffle } from './gameUtils';

export default function SusunTataSurya({ onAnswer, randomSeed = 1 }) {
  const planets = useMemo(
    () => seededShuffle(questions.susunTataSurya.planets, randomSeed),
    [randomSeed],
  );
  const [nextPlanetIndex, setNextPlanetIndex] = useState(0);

  const selectPlanet = (planet) => {
    const expectedPlanet = [...planets].sort((first, second) => first.distance - second.distance)[nextPlanetIndex];
    if (planet.name !== expectedPlanet.name) {
      onAnswer(false);
      return;
    }

    if (nextPlanetIndex + 1 === planets.length) {
      onAnswer(true);
      return;
    }

    setNextPlanetIndex((index) => index + 1);
  };

  return (
    <GamePanel
      eyebrow="ASTRONOMI • 03"
      title="Susun Tata Surya"
      prompt={questions.susunTataSurya.prompt}
    >
      <div className="solar-progress" aria-live="polite">
        {Array.from({ length: planets.length }, (_, index) => (
          <span className={index < nextPlanetIndex ? 'solar-step solar-step-done' : 'solar-step'} key={index}>
            {index < nextPlanetIndex ? '✓' : index + 1}
          </span>
        ))}
      </div>
      <div className="planet-grid">
        {planets.map((planet) => (
          <button
            className="planet-choice"
            key={planet.name}
            type="button"
            onClick={() => selectPlanet(planet)}
            aria-label={planet.name}
          >
            <span aria-hidden="true">{planet.emoji}</span>
            <strong>{planet.name}</strong>
          </button>
        ))}
      </div>
    </GamePanel>
  );
}
