import { useState } from 'react';
import questions from './gameQuestions.json';
import { GamePanel } from './MiniGameUI';

export default function FaktaMitos({ onAnswer }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const question = questions.faktaMitos[questionIndex % questions.faktaMitos.length];

  const answerQuestion = (answer) => {
    if (answer !== question.answer) {
      onAnswer(false);
      return;
    }

    if (questionIndex + 1 === questions.faktaMitos.length) {
      onAnswer(true);
      return;
    }

    setQuestionIndex((index) => index + 1);
  };

  return (
    <GamePanel
      eyebrow="SAINS UMUM • 02"
      title="Fakta atau Mitos?"
      prompt="Baca pernyataannya, lalu pilih jawabanmu."
    >
      <div className="science-statement">
        <span aria-hidden="true">🔬</span>
        <p>{question.statement}</p>
      </div>
      <div className="fact-myth-actions">
        <button className="answer-button answer-fact" type="button" onClick={() => answerQuestion(true)}>
          ✓ Fakta
        </button>
        <button className="answer-button answer-myth" type="button" onClick={() => answerQuestion(false)}>
          ✕ Mitos
        </button>
      </div>
      <p className="mini-game-progress">
        Pernyataan {questionIndex + 1} dari {questions.faktaMitos.length}
      </p>
    </GamePanel>
  );
}
