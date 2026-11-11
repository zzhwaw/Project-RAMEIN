export const QUIZ_MODES = {
  gambar: {
    label: 'Tebak Gambar',
    quizzes: [
      'Tebak Peta Nusantara',
      'Tebak Bendera Dunia',
      'Tebak Landmark',
      'Tebak Hewan dari Siluet',
      'Tebak Buah dari Potongan',
      'Tebak Benda dari Zoom',
      'Tebak Profesi dari Peralatan',
      'Tebak Planet dari Ciri Visual',
      'Tebak Flora Nusantara',
      'Tebak Logo dan Simbol',
    ],
  },
  pengetahuan: {
    label: 'Tebak Pengetahuan',
    quizzes: [
      'Trivia Pengetahuan Umum',
      'Fakta atau Mitos',
      'Susun Tata Surya',
      'Tebak Penemu',
      'Rantai Makanan',
      'Anatomi Tubuh',
      'Eksperimen Kimia',
      'Wujud Zat',
      'Sejarah Indonesia',
      'Geografi Dunia',
    ],
  },
  hitung: {
    label: 'Menghitung Cepat',
    quizzes: [
      'Tambah dan Kurang Kilat',
      'Perkalian Cepat',
      'Pembagian Tepat',
      'Tebak Deret Angka',
      'Isi Angka yang Hilang',
      'Bandingkan Nilai',
      'Persentase Kilat',
      'Hitung Keliling',
      'Tantangan Pecahan',
      'Logika Angka',
    ],
  },
};

export function getQuizName(activeMode, quizId) {
  return QUIZ_MODES[activeMode]?.quizzes[quizId - 1] || null;
}
