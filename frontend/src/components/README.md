# Struktur Komponen

Komponen dikelompokkan berdasarkan tanggung jawab supaya alur aplikasi mudah ditelusuri.

```text
components/
├── AvatarPicker.jsx       # Pilihan karakter slime sebelum masuk room
├── BlobAvatars.jsx        # Ilustrasi karakter slime yang dapat dipakai ulang
├── CharacterSkill.jsx     # Skill karakter, target lawan, dan status pemakaian
├── CharacterSkill.css     # Tampilan kartu skill dan notifikasi efek
├── PlayerReactions.jsx    # Tombol reaksi dan notifikasi reaksi real-time
├── PlayerReactions.css    # Gaya untuk reaksi pemain
├── blobAvatarUtils.js     # Helper pemilihan avatar fallback
├── characterSkills.js     # Nama dan deskripsi skill untuk tiap slime
├── pages/                 # Halaman room, lobby, landing, dan scoreboard
└── games/
    ├── arena/             # Arena game, draw-and-guess, dan reveal mode
    └── quizzes/           # Mini-game kuis, bank soal, dan helper kuis
```

## Lokasi utama

- `App.jsx` mengatur navigasi halaman, koneksi Socket.IO, dan memilih layar game aktif.
- `pages/` berisi layar yang ditampilkan pada alur utama website.
- Komponen di akar `components/` berisi UI bersama, termasuk avatar dan reaksi pemain.
- `CharacterSkill.jsx` menampilkan skill yang ditentukan `avatarId`; validasi dan penerapan efek dilakukan oleh server di `backend/server.js`.
- `games/arena/` berisi komponen game tingkat atas serta stylesheet khususnya.
- `games/quizzes/` berisi mini-game kuis, katalog mode, data soal, dan helper bersama.
- `src/index.css` berisi gaya global dan stylesheet halaman yang dipakai bersama.

Saat menambahkan fitur, simpan komponen pada kelompok tanggung jawabnya dan letakkan CSS khusus berdampingan dengan komponen tersebut.
