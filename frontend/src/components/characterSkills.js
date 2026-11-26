export const CHARACTER_SKILLS = {
  1: {
    name: 'Ledakan Panik',
    description: 'Kurangi 8 detik dari waktu bermain lawan.',
    icon: '⏱️',
  },
  2: {
    name: 'Kabut Bingung',
    description: 'Kurangi 60 poin lawan.',
    icon: '🌫️',
  },
  3: {
    name: 'Curi Poin',
    description: 'Ambil hingga 50 poin dari lawan dan tambahkan ke skormu.',
    icon: '🪙',
  },
  4: {
    name: 'Jebakan Lendir',
    description: 'Hapus hingga 50 poin bonus kecepatan lawan; jika tidak punya bonus, kurangi 50 poin.',
    icon: '🫧',
  },
  5: {
    name: 'Teriakan Keras',
    description: 'Kurangi 5 detik dan 25 poin lawan.',
    icon: '📣',
  },
  6: {
    name: 'Tatapan Sinis',
    description: 'Hapus hingga 100 bonus kecepatan lawan; jika tidak punya bonus, kurangi 60 poin.',
    icon: '😒',
  },
  7: {
    name: 'Panik Memanjang',
    description: 'Curi 25% skor lawan (maksimal 60 poin) dan kurangi 4 detik.',
    icon: '🟣',
  },
  8: {
    name: 'Kacaukan Fokus',
    description: 'Hilangkan bonus kecepatan untuk 3 jawaban lawan berikutnya; Draw & Guess: kurangi 45 poin.',
    icon: '💫',
  },
};

export function getCharacterSkill(avatarId) {
  return CHARACTER_SKILLS[avatarId] || CHARACTER_SKILLS[1];
}
