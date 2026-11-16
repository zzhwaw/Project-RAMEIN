export function getBlobAvatarId(value, fallback = 1) {
  if (!value) return fallback;
  const hash = Array.from(String(value)).reduce(
    (result, character) => (result * 31 + character.charCodeAt(0)) >>> 0,
    0,
  );
  return (hash % 8) + 1;
}
