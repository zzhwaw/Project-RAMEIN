import { useMemo, useState } from 'react';
import questions from './gameQuestions.json';
import { ChoiceGrid, GamePanel, QuestionProgress, QuestionsComplete } from './MiniGameUI';
import { seededShuffle } from './gameUtils';
import useQuestionProgress from './useQuestionProgress';

export function TebakPenemu({ onAnswer }) {
  const { questionIndex, answerQuestion, isComplete, correctAnswers } = useQuestionProgress(
    questions.tebakPenemu.length,
    onAnswer,
  );
  const question = questions.tebakPenemu[questionIndex];

  return (
    <GamePanel eyebrow="SEJARAH SAINS • 04" title="Tebak Penemu" prompt={question?.prompt || 'Pilih jawaban yang benar.'}>
      {isComplete ? (
        <QuestionsComplete correctAnswers={correctAnswers} total={questions.tebakPenemu.length} />
      ) : (
        <>
          <QuestionProgress current={questionIndex + 1} total={questions.tebakPenemu.length} />
          <div className="invention-icon" role="img" aria-label="Ikon penemuan">{question.icon}</div>
          <ChoiceGrid choices={question.choices} onChoose={(choice) => answerQuestion(choice === question.answer)} />
        </>
      )}
    </GamePanel>
  );
}

export function RantaiMakanan({ onAnswer, randomSeed = 1 }) {
  const { questionIndex, answerQuestion, isComplete, correctAnswers } = useQuestionProgress(
    questions.rantaiMakanan.questions.length,
    onAnswer,
  );
  const question = questions.rantaiMakanan.questions[questionIndex];
  const [step, setStep] = useState(0);
  const shuffledItems = useMemo(() => {
    const items = question.chain.map((name, index) => ({ name, emoji: question.emoji[index] }));
    return seededShuffle(items, randomSeed + questionIndex);
  }, [question, questionIndex, randomSeed]);

  const selectFood = (food) => {
    if (food.name !== question.chain[step]) {
      answerQuestion(false);
      setStep(0);
      return;
    }
    if (step + 1 === question.chain.length) {
      answerQuestion(true);
      setStep(0);
      return;
    }
    setStep((currentStep) => currentStep + 1);
  };

  return (
    <GamePanel eyebrow="EKOLOGI • 05" title="Rantai Makanan" prompt={questions.rantaiMakanan.prompt}>
      {isComplete ? (
        <QuestionsComplete correctAnswers={correctAnswers} total={questions.rantaiMakanan.questions.length} />
      ) : (
        <>
          <QuestionProgress current={questionIndex + 1} total={questions.rantaiMakanan.questions.length} />
          <div className="food-chain-progress" aria-live="polite">
            {question.chain.map((name, index) => (
              <span className={index < step ? 'food-chain-step food-chain-step-done' : 'food-chain-step'} key={name}>
                {index < step ? `${question.emoji[index]} ${name}` : `? ${index + 1}`}
              </span>
            ))}
          </div>
          <div className="mini-game-choices">
            {shuffledItems.map((food) => (
              <button className="mini-game-choice food-choice" key={food.name} type="button" onClick={() => selectFood(food)}>
                <span className="food-emoji" aria-hidden="true">{food.emoji}</span>
                <span>{food.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </GamePanel>
  );
}

export function AnatomiTubuh({ onAnswer }) {
  const { questionIndex, answerQuestion, isComplete, correctAnswers } = useQuestionProgress(
    questions.anatomiTubuh.length,
    onAnswer,
  );
  const question = questions.anatomiTubuh[questionIndex];

  return (
    <GamePanel eyebrow="BIOLOGI • 06" title="Anatomi Tubuh" prompt={question?.prompt || 'Pilih organ yang tepat.'}>
      {isComplete ? (
        <QuestionsComplete correctAnswers={correctAnswers} total={questions.anatomiTubuh.length} />
      ) : (
        <>
          <QuestionProgress current={questionIndex + 1} total={questions.anatomiTubuh.length} />
          <div className="mini-game-choices anatomy-grid">
            {question.choices.map((organ) => (
              <button
                className="mini-game-choice anatomy-choice"
                key={organ.name}
                type="button"
                onClick={() => answerQuestion(organ.name === question.answer)}
              >
                <span className="anatomy-emoji" aria-hidden="true">{organ.emoji}</span>
                <span>{organ.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </GamePanel>
  );
}

export function TebakBendera({ onAnswer }) {
  const { questionIndex, answerQuestion, isComplete, correctAnswers } = useQuestionProgress(
    questions.tebakBendera.length,
    onAnswer,
  );
  const question = questions.tebakBendera[questionIndex];

  return (
    <GamePanel eyebrow="GEOGRAFI • 07" title="Tebak Bendera" prompt="Bendera negara manakah ini?">
      {isComplete ? (
        <QuestionsComplete correctAnswers={correctAnswers} total={questions.tebakBendera.length} />
      ) : (
        <>
          <QuestionProgress current={questionIndex + 1} total={questions.tebakBendera.length} />
          <div className="flag-question" role="img" aria-label={`Bendera ${question.answer}`}>
            {question.prompt}
          </div>
          <ChoiceGrid choices={question.choices} onChoose={(choice) => answerQuestion(choice === question.answer)} />
        </>
      )}
    </GamePanel>
  );
}

export function EksperimenKimia({ onAnswer, randomSeed = 1 }) {
  const { questionIndex, answerQuestion, isComplete, correctAnswers } = useQuestionProgress(
    questions.eksperimenKimia.questions.length,
    onAnswer,
  );
  const question = questions.eksperimenKimia.questions[questionIndex];
  const [selectedAtoms, setSelectedAtoms] = useState([]);
  const atomOrder = useMemo(() => seededShuffle(
    question.elements.map((symbol, index) => ({ symbol, id: `${question.id}-${index}` })),
    randomSeed + questionIndex,
  ), [question, questionIndex, randomSeed]);

  const selectAtom = (atom) => {
    const expectedSymbol = question.answer[selectedAtoms.length];
    if (atom.symbol !== expectedSymbol) {
      answerQuestion(false);
      setSelectedAtoms([]);
      return;
    }

    const nextAtoms = [...selectedAtoms, atom.id];
    if (nextAtoms.length === question.answer.length) {
      answerQuestion(true);
      setSelectedAtoms([]);
      return;
    }
    setSelectedAtoms(nextAtoms);
  };

  return (
    <GamePanel eyebrow="KIMIA • 08" title="Eksperimen Kimia Cepat" prompt={question?.prompt || 'Rangkai simbol unsur dengan benar.'}>
      {isComplete ? (
        <QuestionsComplete correctAnswers={correctAnswers} total={questions.eksperimenKimia.questions.length} />
      ) : (
        <>
          <QuestionProgress current={questionIndex + 1} total={questions.eksperimenKimia.questions.length} />
          <div className="molecule-progress" aria-live="polite">
            {question.answer.map((symbol, index) => (
              <span className="molecule-slot" key={`${question.id}-${index}`}>
                {selectedAtoms[index] ? symbol : '?'}
              </span>
            ))}
          </div>
          <div className="element-cloud">
            {atomOrder.map((atom, index) => (
              <button
                className="element-chip"
                key={atom.id}
                type="button"
                onClick={() => selectAtom(atom)}
                disabled={selectedAtoms.includes(atom.id)}
                style={{ '--element-index': index }}
              >
                {atom.symbol}
              </button>
            ))}
          </div>
        </>
      )}
    </GamePanel>
  );
}

export function WujudZat({ onAnswer }) {
  const { questionIndex, answerQuestion, isComplete, correctAnswers } = useQuestionProgress(
    questions.wujudZat.items.length,
    onAnswer,
  );
  const item = questions.wujudZat.items[questionIndex];

  return (
    <GamePanel eyebrow="FISIKA • 09" title="Wujud Zat" prompt="Pilih wujud zat dari benda berikut.">
      {isComplete ? (
        <QuestionsComplete correctAnswers={correctAnswers} total={questions.wujudZat.items.length} />
      ) : (
        <>
          <QuestionProgress current={questionIndex + 1} total={questions.wujudZat.items.length} />
          <div className="matter-item" aria-live="polite">
            <span aria-hidden="true">{item.emoji}</span>
            <strong>{item.name}</strong>
          </div>
          <div className="matter-actions">
            {questions.wujudZat.choices.map((state) => (
              <button className="matter-choice" key={state} type="button" onClick={() => answerQuestion(state === item.answer)}>
                {state}
              </button>
            ))}
          </div>
        </>
      )}
    </GamePanel>
  );
}

export function TebakLandmark({ onAnswer }) {
  const { questionIndex, answerQuestion, isComplete, correctAnswers } = useQuestionProgress(
    questions.tebakLandmark.length,
    onAnswer,
  );
  const question = questions.tebakLandmark[questionIndex];

  return (
    <GamePanel eyebrow="SEJARAH & GEOGRAFI • 10" title="Tebak Landmark" prompt={question?.question || 'Pilih landmark yang benar.'}>
      {isComplete ? (
        <QuestionsComplete correctAnswers={correctAnswers} total={questions.tebakLandmark.length} />
      ) : (
        <>
          <QuestionProgress current={questionIndex + 1} total={questions.tebakLandmark.length} />
          <div className="landmark-question" role="img" aria-label={`Ilustrasi landmark ${question.answer}`}>
            <span>{question.prompt}</span>
          </div>
          <ChoiceGrid choices={question.choices} onChoose={(choice) => answerQuestion(choice === question.answer)} />
        </>
      )}
    </GamePanel>
  );
}
