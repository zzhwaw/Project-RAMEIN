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

export function ChoiceGrid({ choices, onChoose, className = '' }) {
  return (
    <div className={`mini-game-choices ${className}`}>
      {choices.map((choice, index) => (
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
