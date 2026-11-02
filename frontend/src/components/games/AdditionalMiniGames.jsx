import { useMemo, useState } from 'react';
import questions from './gameQuestions.json';
import { ChoiceGrid, GamePanel } from './MiniGameUI';
import { seededShuffle } from './gameUtils';

export function TebakPenemu({ onAnswer }) {
  const question = questions.tebakPenemu[0];
  return (
    <GamePanel eyebrow="SEJARAH SAINS • 04" title="Tebak Penemu" prompt={question.prompt}>
      <div className="invention-icon" role="img" aria-label="Lampu menyala">{question.icon}</div>
      <ChoiceGrid choices={question.choices} onChoose={(choice) => onAnswer(choice === question.answer)} />
    </GamePanel>
  );
}

export function RantaiMakanan({ onAnswer, randomSeed = 1 }) {
  const question = questions.rantaiMakanan;
  const [step, setStep] = useState(0);
  const shuffledItems = useMemo(() => {
    const items = question.chain.map((name, index) => ({ name, emoji: question.emoji[index] }));
    return seededShuffle(items, randomSeed);
  }, [question, randomSeed]);

  const selectFood = (food) => {
    if (food.name !== question.chain[step]) {
      onAnswer(false);
      return;
    }
    if (step + 1 === question.chain.length) {
      onAnswer(true);
      return;
    }
    setStep((currentStep) => currentStep + 1);
  };

  return (
    <GamePanel eyebrow="EKOLOGI • 05" title="Rantai Makanan" prompt={question.prompt}>
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
    </GamePanel>
  );
}

export function AnatomiTubuh({ onAnswer }) {
  const question = questions.anatomiTubuh[0];
  return (
    <GamePanel eyebrow="BIOLOGI • 06" title="Anatomi Tubuh" prompt={question.prompt}>
      <div className="mini-game-choices anatomy-grid">
        {question.choices.map((organ) => (
          <button
            className="mini-game-choice anatomy-choice"
            key={organ.name}
            type="button"
            onClick={() => onAnswer(organ.name === question.answer)}
          >
            <span className="anatomy-emoji" aria-hidden="true">{organ.emoji}</span>
            <span>{organ.name}</span>
          </button>
        ))}
      </div>
    </GamePanel>
  );
}

export function TebakBendera({ onAnswer }) {
  const question = questions.tebakBendera[0];
  return (
    <GamePanel eyebrow="GEOGRAFI • 07" title="Tebak Bendera" prompt="Bendera negara manakah ini?">
      <div className="flag-question" role="img" aria-label={`Bendera ${question.answer}`}>
        {question.prompt}
      </div>
      <ChoiceGrid choices={question.choices} onChoose={(choice) => onAnswer(choice === question.answer)} />
    </GamePanel>
  );
}

export function EksperimenKimia({ onAnswer, randomSeed = 1 }) {
  const question = questions.eksperimenKimia;
  const [selectedAtoms, setSelectedAtoms] = useState([]);
  const atomOrder = useMemo(() => seededShuffle(
    question.elements.map((symbol, index) => ({ symbol, id: `${symbol}-${index}` })),
    randomSeed,
  ), [question.elements, randomSeed]);

  const selectAtom = (atom) => {
    const expectedSymbol = question.answer[selectedAtoms.length];
    if (atom.symbol !== expectedSymbol) {
      onAnswer(false);
      return;
    }

    const nextAtoms = [...selectedAtoms, atom.id];
    if (nextAtoms.length === question.answer.length) {
      onAnswer(true);
      return;
    }
    setSelectedAtoms(nextAtoms);
  };

  return (
    <GamePanel eyebrow="KIMIA • 08" title="Eksperimen Kimia Cepat" prompt={question.prompt}>
      <div className="molecule-progress" aria-live="polite">
        {question.answer.map((symbol, index) => (
          <span className="molecule-slot" key={index}>
            {selectedAtoms[index] ? symbol : '?'}
            {index === 0 && <sub>2</sub>}
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
    </GamePanel>
  );
}

export function WujudZat({ onAnswer }) {
  const question = questions.wujudZat;
  const [itemIndex, setItemIndex] = useState(0);
  const item = question.items[itemIndex];

  const selectState = (state) => {
    if (state !== item.answer) {
      onAnswer(false);
      return;
    }
    if (itemIndex + 1 === question.items.length) {
      onAnswer(true);
      return;
    }
    setItemIndex((index) => index + 1);
  };

  return (
    <GamePanel eyebrow="FISIKA • 09" title="Wujud Zat" prompt="Pilih wujud zat dari benda berikut.">
      <div className="matter-item" aria-live="polite">
        <span aria-hidden="true">{item.emoji}</span>
        <strong>{item.name}</strong>
        <small>{itemIndex + 1} / {question.items.length}</small>
      </div>
      <div className="matter-actions">
        {question.choices.map((state) => (
          <button className="matter-choice" key={state} type="button" onClick={() => selectState(state)}>
            {state}
          </button>
        ))}
      </div>
    </GamePanel>
  );
}

export function TebakLandmark({ onAnswer }) {
  const question = questions.tebakLandmark[0];
  return (
    <GamePanel eyebrow="SEJARAH & GEOGRAFI • 10" title="Tebak Landmark" prompt={question.question}>
      <div className="landmark-question" role="img" aria-label={`Siluet ${question.answer}`}>
        <svg viewBox="0 0 220 150" aria-hidden="true">
          <path d="M22 126h176v12H22zM38 118h144v8H38zM51 108h118v10H51zM63 98h94v10H63zM73 87h74v11H73zM81 75h58v12H81zM89 62h42v13H89zM96 48h28v14H96zM101 35h18v13h-18zM105 20h10v15h-10zM33 106h18v20H33zM169 106h18v20h-18z" />
        </svg>
      </div>
      <ChoiceGrid choices={question.choices} onChoose={(choice) => onAnswer(choice === question.answer)} />
    </GamePanel>
  );
}
