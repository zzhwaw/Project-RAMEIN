import questions from './gameQuestions.json';
import { GamePanel, QuestionProgress, QuestionsComplete } from './MiniGameUI';
import useQuestionProgress from './useQuestionProgress';

export default function FaktaMitos({ onAnswer }) {
  const { questionIndex, answerQuestion, isComplete, correctAnswers } = useQuestionProgress(questions.faktaMitos.length, onAnswer);
  const question = questions.faktaMitos[questionIndex];

  return (
    <GamePanel
      eyebrow="SAINS UMUM • 02"
      title="Fakta atau Mitos?"
      prompt="Baca pernyataannya, lalu pilih jawabanmu."
    >
      {isComplete ? (
        <QuestionsComplete correctAnswers={correctAnswers} total={questions.faktaMitos.length} />
      ) : (
        <>
          <QuestionProgress current={questionIndex + 1} total={questions.faktaMitos.length} />
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
        </>
      )}
    </GamePanel>
  );
}
