import BlobAvatar from './BlobAvatars';
import './PlayerReactions.css';

const REACTIONS = ['👏', '😂', '🔥', '💖', '😱', '🎉'];

export function ReactionFeed({ reactions = [] }) {
  return (
    <div className="reaction-feed" aria-live="polite" aria-label="Reaksi pemain">
      {reactions.map((reaction) => (
        <div className="reaction-toast" key={reaction.id}>
          <BlobAvatar avatarId={reaction.avatarId || 1} size={42} />
          <span className="reaction-toast-message">
            <strong>{reaction.playerName}</strong>
            <span>{reaction.emoji}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

export default function PlayerReactions({ onReact, error }) {
  return (
    <div className="player-reactions">
      <span className="player-reactions-label">Kirim reaksi</span>
      <div className="player-reactions-buttons">
        {REACTIONS.map((emoji) => (
          <button
            className="player-reaction-button"
            key={emoji}
            type="button"
            onClick={() => onReact?.(emoji)}
            aria-label={`Kirim reaksi ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
      {error && <span className="player-reactions-error" role="status">{error}</span>}
    </div>
  );
}
