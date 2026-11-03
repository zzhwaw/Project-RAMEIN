import questions from './gameQuestions.json';
import { ChoiceGrid, GamePanel, QuestionProgress, QuestionsComplete } from './MiniGameUI';
import useQuestionProgress from './useQuestionProgress';

export default function TebakPeta({ onAnswer }) {
  const { questionIndex, answerQuestion, isComplete, correctAnswers } = useQuestionProgress(questions.tebakPeta.length, onAnswer);
  const question = questions.tebakPeta[questionIndex];

  return (
    <GamePanel
      eyebrow="GEOGRAFI • 01"
      title="Tebak Peta"
      prompt={question?.prompt || 'Tebak pulau dari petunjuknya.'}
    >
      {isComplete ? (
        <QuestionsComplete correctAnswers={correctAnswers} total={questions.tebakPeta.length} />
      ) : (
        <>
          <QuestionProgress current={questionIndex + 1} total={questions.tebakPeta.length} />
          <div className="map-question-art" role="img" aria-label={`Siluet pulau dengan petunjuk ${question.map}`}>
            <svg viewBox="0 0 220 220" aria-hidden="true">
              <path d="M111 16 132 27 139 44 159 50 165 69 190 82 183 101 196 119 177 132 174 154 157 166 149 190 128 181 111 200 93 183 72 188 68 167 49 156 53 135 35 121 45 102 37 83 56 70 61 49 83 45 91 27Z" />
            </svg>
            <span>{question.map}</span>
          </div>
          <ChoiceGrid
            choices={question.choices}
            onChoose={(choice) => answerQuestion(choice === question.answer)}
          />
        </>
      )}
    </GamePanel>
  );
}
