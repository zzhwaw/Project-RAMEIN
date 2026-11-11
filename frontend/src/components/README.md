# Struktur Komponen

Komponen dikelompokkan berdasarkan tanggung jawab supaya alur aplikasi mudah ditelusuri.

```text
components/
├── pages/                 # Halaman room, lobby, landing, dan scoreboard
└── games/
    ├── arena/             # Arena game, draw-and-guess, dan reveal mode
    └── quizzes/           # Mini-game kuis, bank soal, dan helper kuis
```

## Lokasi utama

- `App.jsx` mengatur navigasi halaman, koneksi Socket.IO, dan memilih layar game aktif.
- `pages/` berisi layar yang ditampilkan pada alur utama website.
- `games/arena/` berisi komponen game tingkat atas serta stylesheet khususnya.
- `games/quizzes/` berisi mini-game kuis, katalog mode, data soal, dan helper bersama.
- `src/index.css` berisi gaya global dan stylesheet halaman yang dipakai bersama.

Saat menambahkan fitur, simpan komponen pada kelompok tanggung jawabnya dan letakkan CSS khusus berdampingan dengan komponen tersebut.
