import { useEffect, useState } from 'react';
import BlobAvatar from './BlobAvatars';
import { getCharacterSkill } from './characterSkills';
import './CharacterSkill.css';

export default function CharacterSkill({
  player,
  players = [],
  roundId,
  onUseSkill,
  error,
  disabled = false,
}) {
  const [targetId, setTargetId] = useState('');
  const [isUsing, setIsUsing] = useState(false);
  const [message, setMessage] = useState('');
  const [now, setNow] = useState(0);
  useEffect(() => {
    const timerId = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timerId);
  }, []);
  const skill = getCharacterSkill(player?.avatarId);
  const targets = players.filter((candidate) => (
    candidate.id !== player?.id
    && !candidate.answered
    && (!candidate.timeEndsAt || candidate.timeEndsAt > now)
  ));
  const selectedTargetId = targets.some((candidate) => candidate.id === targetId)
    ? targetId
    : targets[0]?.id || '';
  const used = Boolean(player?.skillUsed);

  const useSkill = async () => {
    if (!selectedTargetId || used || disabled || isUsing) return;
    setMessage('');
    setIsUsing(true);
    const result = await onUseSkill?.(selectedTargetId, roundId);
    if (result?.error) setMessage(result.error);
    setIsUsing(false);
  };

  return (
    <section className={`character-skill${used ? ' character-skill-used' : ''}`} aria-label="Skill karakter">
      <div className="character-skill-profile">
        <span className="character-skill-avatar" aria-hidden="true">
          <BlobAvatar avatarId={player?.avatarId || 1} size={62} />
        </span>
        <span className="character-skill-copy">
          <strong>{skill.icon} {skill.name}</strong>
          <span>{skill.description}</span>
        </span>
        <span className="character-skill-count">{used ? 'TERPAKAI' : '1× / GAME'}</span>
      </div>
      <div className="character-skill-actions">
        <label>
          <span className="character-skill-sr-only">Pilih lawan untuk skill</span>
          <select
            value={selectedTargetId}
            onChange={(event) => setTargetId(event.target.value)}
            disabled={used || disabled || isUsing || targets.length === 0}
          >
            {targets.length === 0 && <option value="">Tidak ada lawan yang tersedia</option>}
            {targets.map((target) => (
              <option value={target.id} key={target.id}>{target.name}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={useSkill}
          disabled={used || disabled || isUsing || !selectedTargetId}
        >
          {used ? 'SKILL SUDAH DIPAKAI' : isUsing ? 'MENGAKTIFKAN...' : 'PAKAI SKILL'}
        </button>
      </div>
      {(error || message) && <p className="character-skill-error" role="alert">{error || message}</p>}
    </section>
  );
}
