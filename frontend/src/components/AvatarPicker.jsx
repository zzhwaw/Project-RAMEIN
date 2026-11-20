import BlobAvatar from './BlobAvatars';

const AVATAR_IDS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function AvatarPicker({ value, onChange }) {
  return (
    <fieldset className="avatar-picker">
      <legend>Pilih slime kamu</legend>
      <div className="avatar-picker-options">
        {AVATAR_IDS.map((avatarId) => (
          <button
            className={`avatar-picker-option${value === avatarId ? ' avatar-picker-option-selected' : ''}`}
            key={avatarId}
            type="button"
            onClick={() => onChange(avatarId)}
            aria-label={`Pilih slime ${avatarId}`}
            aria-pressed={value === avatarId}
          >
            <BlobAvatar avatarId={avatarId} size={52} />
          </button>
        ))}
      </div>
    </fieldset>
  );
}
