import './BlobAvatars.css';

export function BlobAvatarScene({ avatarIds = [1, 4, 6], className = '' }) {
  return (
    <div className={`blob-avatar-scene ${className}`} aria-hidden="true">
      {avatarIds.map((avatarId) => (
        <span className="blob-avatar-scene-character" key={avatarId}>
          <BlobAvatar avatarId={avatarId} size={132} />
        </span>
      ))}
    </div>
  );
}

export default function BlobAvatar({ avatarId = 1, size = 120 }) {
  const strokeColor = "#2A2A2A";
  const strokeWidth = "5";

  switch (avatarId) {
    // 1. Kaget Nengok Kanan (Pink Ramein)
    case 1:
      return (
        <svg width={size} height={size} viewBox="0 0 140 140" fill="none">
          <path
            d="M45 35 C45 15, 85 15, 92 45 C95 58, 95 65, 82 70 L98 78 C102 90, 95 102, 105 112 C110 118, 95 125, 85 120 C75 125, 65 122, 55 118 C42 124, 25 120, 28 110 C32 102, 42 95, 45 35 Z"
            fill="#F794E1"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          {/* Mata Menonjol */}
          <ellipse cx="62" cy="30" rx="14" ry="17" fill="#FFFFFF" stroke={strokeColor} strokeWidth={strokeWidth} />
          <ellipse cx="65" cy="30" rx="6" ry="9" fill={strokeColor} />
          <ellipse cx="83" cy="32" rx="11" ry="15" fill="#FFFFFF" stroke={strokeColor} strokeWidth={strokeWidth} />
          <ellipse cx="86" cy="32" rx="5" ry="7" fill={strokeColor} />
        </svg>
      );

    // 2. Melongo Mulut Mencucu (Biru Ramein)
    case 2:
      return (
        <svg width={size} height={size} viewBox="0 0 140 140" fill="none">
          <path
            d="M35 55 C35 30, 105 30, 105 55 C105 78, 122 88, 118 100 C115 108, 108 105, 110 115 C112 124, 85 124, 70 120 C55 124, 28 124, 30 115 C32 105, 25 108, 22 100 C18 88, 35 78, 35 55 Z"
            fill="#1CA3FF"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          {/* Mata Besar */}
          <circle cx="48" cy="45" r="17" fill="#FFFFFF" stroke={strokeColor} strokeWidth={strokeWidth} />
          <circle cx="48" cy="45" r="7" fill={strokeColor} />
          <circle cx="92" cy="45" r="17" fill="#FFFFFF" stroke={strokeColor} strokeWidth={strokeWidth} />
          <circle cx="92" cy="45" r="7" fill={strokeColor} />
          {/* Mulut Y */}
          <path d="M67 66 L71 71 L67 76 M71 71 L78 71" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    // 3. Marah Besar Meleber (Merah Ramein)
    case 3:
      return (
        <svg width={size} height={size} viewBox="0 0 140 140" fill="none">
          <path
            d="M32 72 C32 45, 108 45, 108 72 C112 88, 128 92, 126 105 C124 114, 112 110, 105 116 C92 122, 82 114, 70 120 C58 114, 48 122, 35 116 C28 110, 16 114, 14 105 C12 92, 28 88, 32 72 Z"
            fill="#EF2D2D"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          {/* Mata Sipit Marah */}
          <ellipse cx="48" cy="58" rx="16" ry="11" fill="#FFFFFF" stroke={strokeColor} strokeWidth={strokeWidth} />
          <circle cx="51" cy="58" r="5" fill={strokeColor} />
          <ellipse cx="92" cy="58" rx="16" ry="11" fill="#FFFFFF" stroke={strokeColor} strokeWidth={strokeWidth} />
          <circle cx="89" cy="58" r="5" fill={strokeColor} />
          {/* Alis Tebal */}
          <rect x="30" y="36" width="34" height="9" rx="3" transform="rotate(16 30 36)" fill="#FFC700" stroke={strokeColor} strokeWidth="4" />
          <rect x="76" y="45" width="34" height="9" rx="3" transform="rotate(-16 76 45)" fill="#FFC700" stroke={strokeColor} strokeWidth="4" />
          {/* Mulut Menggeram */}
          <path d="M55 88 C55 75, 85 75, 85 88 C85 98, 75 98, 70 90 C65 98, 55 98, 55 88 Z" fill="#2A2A2A" />
        </svg>
      );

    // 4. Melayang Ceria (Hijau Ramein)
    case 4:
      return (
        <svg width={size} height={size} viewBox="0 0 140 140" fill="none">
          <path
            d="M42 48 C45 25, 95 22, 102 45 C115 48, 118 65, 108 75 C115 88, 102 102, 88 98 C75 108, 55 105, 45 92 C35 82, 38 65, 42 48 Z"
            fill="#55E13C"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          {/* Mata Bulat */}
          <circle cx="45" cy="58" r="14" fill="#FFFFFF" stroke={strokeColor} strokeWidth={strokeWidth} />
          <circle cx="45" cy="58" r="6" fill={strokeColor} />
          <circle cx="75" cy="60" r="16" fill="#FFFFFF" stroke={strokeColor} strokeWidth={strokeWidth} />
          <circle cx="75" cy="60" r="7" fill={strokeColor} />
          {/* Mulut Tertawa */}
          <path d="M52 80 Q65 80 68 88 Q56 96 52 80 Z" fill="#EF2D2D" stroke={strokeColor} strokeWidth="4" strokeLinejoin="round" />
        </svg>
      );

    // 5. Berteriak Miring (Oranye Ramein)
    case 5:
      return (
        <svg width={size} height={size} viewBox="0 0 140 140" fill="none">
          <path
            d="M25 65 C15 40, 65 25, 82 50 C95 70, 105 90, 118 102 C125 110, 110 120, 98 116 C85 124, 72 122, 62 115 C48 118, 40 112, 52 105 C38 95, 30 80, 25 65 Z"
            fill="#FFB326"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          {/* Mata & Alis Marah */}
          <ellipse cx="32" cy="55" rx="14" ry="11" fill="#FFFFFF" stroke={strokeColor} strokeWidth={strokeWidth} />
          <circle cx="34" cy="55" r="5" fill={strokeColor} />
          <ellipse cx="66" cy="45" rx="15" ry="12" fill="#FFFFFF" stroke={strokeColor} strokeWidth={strokeWidth} />
          <circle cx="64" cy="45" r="5" fill={strokeColor} />
          <path d="M18 38 L48 44 L72 28" stroke={strokeColor} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          {/* Mulut Teriak Lebar */}
          <ellipse cx="62" cy="84" rx="18" ry="24" transform="rotate(-25 62 84)" fill="#EF2D2D" stroke={strokeColor} strokeWidth={strokeWidth} />
          <path d="M62 88 Q75 84 78 96 Q66 102 62 88 Z" fill="#F794E1" stroke={strokeColor} strokeWidth="3" />
        </svg>
      );

    // 6. Tatapan Datar / Sinis (Kuning Ramein)
    case 6:
      return (
        <svg width={size} height={size} viewBox="0 0 140 140" fill="none">
          <path
            d="M35 62 C35 32, 105 32, 105 62 C105 85, 108 100, 115 106 C120 112, 108 120, 95 116 C82 122, 58 122, 45 116 C32 120, 20 112, 25 106 C32 100, 35 85, 35 62 Z"
            fill="#FFDE00"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          {/* Mata Sipit Datar */}
          <rect x="42" y="58" width="24" height="10" rx="5" fill="#FFFFFF" stroke={strokeColor} strokeWidth="4" />
          <circle cx="54" cy="63" r="3" fill={strokeColor} />
          <rect x="76" y="58" width="24" height="10" rx="5" fill="#FFFFFF" stroke={strokeColor} strokeWidth="4" />
          <circle cx="88" cy="63" r="3" fill={strokeColor} />
          {/* Kerutan & Mulut Datar */}
          <path d="M68 50 L68 56 M73 48 L73 56" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
          <line x1="58" y1="78" x2="86" y2="78" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" />
        </svg>
      );

    // 7. Panjang Panik (Ungu Ramein)
    case 7:
      return (
        <svg width={size} height={size} viewBox="0 0 140 140" fill="none">
          <path
            d="M52 35 C52 20, 88 20, 88 35 L92 102 C98 110, 92 118, 82 115 C75 120, 65 120, 58 115 C48 118, 42 110, 48 102 L52 35 Z"
            fill="#A370DB"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          {/* Mata Menonjol di Atas */}
          <circle cx="55" cy="28" r="12" fill="#FFFFFF" stroke={strokeColor} strokeWidth={strokeWidth} />
          <circle cx="55" cy="28" r="5" fill={strokeColor} />
          <circle cx="85" cy="28" r="12" fill="#FFFFFF" stroke={strokeColor} strokeWidth={strokeWidth} />
          <circle cx="85" cy="28" r="5" fill={strokeColor} />
          {/* Mulut Kaget Lonjong */}
          <ellipse cx="70" cy="62" rx="9" ry="15" fill="#EF2D2D" stroke={strokeColor} strokeWidth="4" />
        </svg>
      );

    // 8. Menoleh Bingung (Cyan Ramein)
    case 8:
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 140 140" fill="none">
          <path
            d="M42 52 C42 22, 102 22, 105 55 C108 78, 112 95, 118 104 C122 112, 108 118, 95 112 C82 120, 65 118, 52 112 C38 118, 22 112, 26 102 C32 90, 42 75, 42 52 Z"
            fill="#00B2FF"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          {/* Mata Samping Besar */}
          <ellipse cx="76" cy="54" rx="15" ry="18" fill="#FFFFFF" stroke={strokeColor} strokeWidth={strokeWidth} />
          <ellipse cx="79" cy="54" rx="7" ry="9" fill={strokeColor} />
          <ellipse cx="100" cy="54" rx="9" ry="15" fill="#FFFFFF" stroke={strokeColor} strokeWidth={strokeWidth} />
          <ellipse cx="103" cy="54" rx="4" ry="7" fill={strokeColor} />
          {/* Mulut Zigzag Bingung */}
          <path d="M90 86 L98 78 L104 88" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}