export function GamePanel({ eyebrow, title, prompt, children }) {
  return (
    <section className="mini-game-panel">
      <div className="mini-game-heading">
        <p className="mini-game-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p className="mini-game-prompt">{prompt}</p>
      </div>
      {children}
    </section>
  );
}

export function QuestionProgress({ current, total }) {
  return (
    <div className="question-progress" aria-label={`Soal ${current} dari ${total}`}>
      <div className="question-progress-track">
        <span style={{ width: `${(current / total) * 100}%` }} />
      </div>
      <strong>SOAL {current} / {total}</strong>
    </div>
  );
}

export function QuestionsComplete({ correctAnswers, total }) {
  return (
    <div className="questions-complete" role="status">
      <span aria-hidden="true">🎉</span>
      <strong>Semua soal selesai!</strong>
      <p>Jawaban benar: {correctAnswers} dari {total}</p>
    </div>
  );
}

export function ChoiceGrid({ choices, onChoose, className = '', correctChoice, difficulty = 'medium' }) {
  const choiceCount = difficulty === 'easy' ? 2 : difficulty === 'hard' ? choices.length : 3;
  const visibleChoices = correctChoice === undefined
    ? choices.slice(0, choiceCount)
    : [correctChoice, ...choices.filter((choice) => choice !== correctChoice)].slice(0, choiceCount);

  return (
    <div className={`mini-game-choices ${className}`}>
      {visibleChoices.map((choice, index) => (
        <button
          className="mini-game-choice"
          key={typeof choice === 'string' ? choice : choice.name}
          type="button"
          onClick={() => onChoose(choice)}
        >
          <span className="mini-game-choice-index">{index + 1}</span>
          <span>{typeof choice === 'string' ? choice : choice.name}</span>
        </button>
      ))}
    </div>
  );
}
