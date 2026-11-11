import { useMemo, useState } from 'react';
import questions from './gameQuestions.json';
import { GamePanel, QuestionProgress, QuestionsComplete } from './MiniGameUI';
import { seededShuffle } from './gameUtils';
import useQuestionProgress from './useQuestionProgress';

export default function SusunTataSurya({ onAnswer, randomSeed = 1, difficulty = 'medium' }) {
  const [nextPlanetIndex, setNextPlanetIndex] = useState(0);
  const { questionIndex, answerQuestion, isComplete, correctAnswers } = useQuestionProgress(
    questions.susunTataSurya.questions.length,
    onAnswer,
  );
  const currentQuestion = questions.susunTataSurya.questions[questionIndex];
  const planetCount = difficulty === 'easy' ? 2 : difficulty === 'hard' ? 4 : 3;
  const planets = useMemo(
    () => seededShuffle(
      [...currentQuestion.planets].sort((first, second) => first.distance - second.distance).slice(0, planetCount),
      randomSeed + questionIndex,
    ),
    [currentQuestion, planetCount, questionIndex, randomSeed],
  );

  const selectPlanet = (planet) => {
    const expectedPlanet = [...planets].sort((first, second) => first.distance - second.distance)[nextPlanetIndex];
    if (planet.name !== expectedPlanet.name) {
      answerQuestion(false);
      setNextPlanetIndex(0);
      return;
    }

    if (nextPlanetIndex + 1 === planets.length) {
      answerQuestion(true);
      setNextPlanetIndex(0);
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
      {isComplete ? (
        <QuestionsComplete correctAnswers={correctAnswers} total={questions.susunTataSurya.questions.length} />
      ) : (
        <>
          <QuestionProgress current={questionIndex + 1} total={questions.susunTataSurya.questions.length} />
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
        </>
      )}
    </GamePanel>
  );
}
