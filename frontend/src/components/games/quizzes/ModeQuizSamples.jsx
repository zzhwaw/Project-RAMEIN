import { useMemo } from 'react';
import { ChoiceGrid, GamePanel, QuestionProgress, QuestionsComplete } from './MiniGameUI';
import useQuestionProgress from './useQuestionProgress';
import { seededShuffle } from './gameUtils';
import { getQuizName } from './quizCatalog';

const TOTAL_QUESTIONS = 20;

const PICTURE_QUESTIONS = [
  { clue: '🏝️ 🗺️', prompt: 'Pulau terbesar di Indonesia bagian timur adalah...', answer: 'Papua', choices: ['Papua', 'Bali', 'Madura', 'Lombok'] },
  { clue: '🗼 🇫🇷', prompt: 'Landmark ikonik di Paris ini bernama...', answer: 'Menara Eiffel', choices: ['Colosseum', 'Menara Eiffel', 'Big Ben', 'Taj Mahal'] },
  { clue: '🐅 🌿', prompt: 'Hewan bercorak loreng ini adalah...', answer: 'Harimau', choices: ['Zebra', 'Harimau', 'Jerapah', 'Panda'] },
  { clue: '🍌 🟡', prompt: 'Buah kuning melengkung ini adalah...', answer: 'Pisang', choices: ['Mangga', 'Lemon', 'Pisang', 'Nanas'] },
  { clue: '🪐 💍', prompt: 'Planet yang terkenal dengan cincinnya adalah...', answer: 'Saturnus', choices: ['Mars', 'Venus', 'Saturnus', 'Merkurius'] },
  { clue: '🦷 🪥', prompt: 'Benda pada gambar digunakan untuk membersihkan...', answer: 'Gigi', choices: ['Rambut', 'Gigi', 'Sepatu', 'Kacamata'] },
  { clue: '🩺 👩‍⚕️', prompt: 'Profesi dengan peralatan ini adalah...', answer: 'Dokter', choices: ['Koki', 'Pilot', 'Dokter', 'Petani'] },
  { clue: '🌻 ☀️', prompt: 'Bunga yang dikenal menghadap ke arah matahari adalah...', answer: 'Bunga matahari', choices: ['Mawar', 'Melati', 'Anggrek', 'Bunga matahari'] },
  { clue: '🏛️ 🇮🇹', prompt: 'Bangunan bersejarah berbentuk arena di Roma adalah...', answer: 'Colosseum', choices: ['Parthenon', 'Colosseum', 'Acropolis', 'Stonehenge'] },
  { clue: '🔴 ⚪', prompt: 'Kombinasi warna bendera Indonesia adalah...', answer: 'Merah dan putih', choices: ['Merah dan putih', 'Biru dan putih', 'Merah dan kuning', 'Hijau dan putih'] },
  { clue: '🇯🇵 🔴', prompt: 'Bendera dengan lingkaran merah di tengah berlatar putih adalah...', answer: 'Jepang', choices: ['Jepang', 'Kanada', 'Turki', 'Denmark'] },
  { clue: '🗽 🇺🇸', prompt: 'Patung terkenal yang menyambut pendatang di New York adalah...', answer: 'Patung Liberty', choices: ['Patung Liberty', 'Big Ben', 'Christ the Redeemer', 'Moai'] },
  { clue: '🐘 🌳', prompt: 'Hewan besar dengan belalai panjang ini adalah...', answer: 'Gajah', choices: ['Badak', 'Gajah', 'Kuda nil', 'Tapir'] },
  { clue: '🍍 🌴', prompt: 'Buah tropis berkulit kasar dan bermahkota daun adalah...', answer: 'Nanas', choices: ['Nanas', 'Durian', 'Pepaya', 'Melon'] },
  { clue: '🛕 🇮🇩', prompt: 'Candi Buddha terbesar yang berada di Magelang adalah...', answer: 'Borobudur', choices: ['Borobudur', 'Prambanan', 'Mendut', 'Penataran'] },
  { clue: '🐼 🎋', prompt: 'Hewan hitam putih yang suka makan bambu adalah...', answer: 'Panda', choices: ['Panda', 'Koala', 'Lemur', 'Beruang kutub'] },
  { clue: '🌉 🇬🇧', prompt: 'Menara jam terkenal di London dikenal sebagai...', answer: 'Big Ben', choices: ['Big Ben', 'Menara Eiffel', 'Menara Pisa', 'Space Needle'] },
  { clue: '🍓 ❤️', prompt: 'Buah merah kecil dengan biji di bagian luar adalah...', answer: 'Stroberi', choices: ['Ceri', 'Stroberi', 'Raspberry', 'Apel'] },
  { clue: '🔺 🐫', prompt: 'Bangunan segitiga kuno di Mesir ini adalah...', answer: 'Piramida Giza', choices: ['Piramida Giza', 'Colosseum', 'Taj Mahal', 'Petra'] },
  { clue: '🦒 🌳', prompt: 'Hewan dengan leher sangat panjang ini adalah...', answer: 'Jerapah', choices: ['Jerapah', 'Zebra', 'Unta', 'Rusa'] },
];

const GENERAL_KNOWLEDGE_QUESTIONS = [
  { prompt: 'Planet tempat kita tinggal adalah...', answer: 'Bumi', choices: ['Mars', 'Bumi', 'Venus', 'Jupiter'] },
  { prompt: 'Gas yang paling banyak terdapat di atmosfer Bumi adalah...', answer: 'Nitrogen', choices: ['Oksigen', 'Karbon dioksida', 'Nitrogen', 'Hidrogen'] },
  { prompt: 'Proses tumbuhan membuat makanan dengan bantuan cahaya disebut...', answer: 'Fotosintesis', choices: ['Fermentasi', 'Fotosintesis', 'Evaporasi', 'Respirasi'] },
  { prompt: 'Samudra terbesar di dunia adalah...', answer: 'Pasifik', choices: ['Atlantik', 'Hindia', 'Arktik', 'Pasifik'] },
  { prompt: 'Organ yang memompa darah ke seluruh tubuh adalah...', answer: 'Jantung', choices: ['Paru-paru', 'Jantung', 'Lambung', 'Ginjal'] },
  { prompt: 'Air membeku pada suhu berapa Celsius?', answer: '0°C', choices: ['0°C', '10°C', '32°C', '100°C'] },
  { prompt: 'Siapa yang dikenal merumuskan hukum gravitasi klasik?', answer: 'Isaac Newton', choices: ['Albert Einstein', 'Isaac Newton', 'Galileo Galilei', 'Nikola Tesla'] },
  { prompt: 'Hewan yang mengalami metamorfosis dari ulat adalah...', answer: 'Kupu-kupu', choices: ['Kupu-kupu', 'Kucing', 'Elang', 'Ikan'] },
  { prompt: 'Candi Borobudur berada di provinsi...', answer: 'Jawa Tengah', choices: ['Jawa Barat', 'Jawa Timur', 'Jawa Tengah', 'Bali'] },
  { prompt: 'Satuan dasar untuk mengukur kuat arus listrik adalah...', answer: 'Ampere', choices: ['Watt', 'Volt', 'Ohm', 'Ampere'] },
];

const HISTORY_QUESTIONS = [
  { prompt: 'Kapan Indonesia memproklamasikan kemerdekaan?', answer: '17 Agustus 1945', choices: ['17 Agustus 1945', '20 Mei 1908', '10 November 1945', '1 Juni 1945'] },
  { prompt: 'Siapa presiden pertama Republik Indonesia?', answer: 'Soekarno', choices: ['Mohammad Hatta', 'Soekarno', 'Soeharto', 'B.J. Habibie'] },
  { prompt: 'Siapa yang membacakan teks proklamasi kemerdekaan Indonesia?', answer: 'Soekarno', choices: ['Soekarno', 'Ki Hajar Dewantara', 'Sutan Sjahrir', 'Jenderal Sudirman'] },
  { prompt: 'Kerajaan maritim besar yang berpusat di Sumatra adalah...', answer: 'Sriwijaya', choices: ['Majapahit', 'Sriwijaya', 'Mataram Kuno', 'Singasari'] },
  { prompt: 'Tokoh yang dikenal sebagai pelopor emansipasi perempuan Indonesia adalah...', answer: 'R.A. Kartini', choices: ['Dewi Sartika', 'Cut Nyak Dien', 'R.A. Kartini', 'Martha Christina Tiahahu'] },
  { prompt: 'Peristiwa Sumpah Pemuda berlangsung pada tahun...', answer: '1928', choices: ['1908', '1928', '1942', '1945'] },
  { prompt: 'Candi Borobudur dibangun pada masa wangsa...', answer: 'Syailendra', choices: ['Syailendra', 'Isyana', 'Rajasa', 'Warmadewa'] },
  { prompt: 'Siapa wakil presiden pertama Indonesia?', answer: 'Mohammad Hatta', choices: ['Mohammad Hatta', 'Adam Malik', 'Sutan Sjahrir', 'Tan Malaka'] },
  { prompt: 'Hari Pahlawan Indonesia diperingati setiap tanggal...', answer: '10 November', choices: ['1 Juni', '17 Agustus', '10 November', '28 Oktober'] },
  { prompt: 'Naskah proklamasi dirumuskan di rumah milik...', answer: 'Laksamana Maeda', choices: ['Jenderal Sudirman', 'Laksamana Maeda', 'Mohammad Yamin', 'Ki Hajar Dewantara'] },
];

const GEOGRAPHY_QUESTIONS = [
  { prompt: 'Ibu kota Jepang adalah...', answer: 'Tokyo', choices: ['Seoul', 'Tokyo', 'Beijing', 'Bangkok'] },
  { prompt: 'Gurun Sahara terletak di benua...', answer: 'Afrika', choices: ['Asia', 'Afrika', 'Australia', 'Amerika Selatan'] },
  { prompt: 'Gunung tertinggi di dunia adalah...', answer: 'Everest', choices: ['Kilimanjaro', 'Everest', 'Denali', 'Elbrus'] },
  { prompt: 'Negara dengan wilayah terluas di dunia adalah...', answer: 'Rusia', choices: ['Kanada', 'China', 'Rusia', 'Amerika Serikat'] },
  { prompt: 'Ibu kota Australia adalah...', answer: 'Canberra', choices: ['Sydney', 'Melbourne', 'Canberra', 'Perth'] },
  { prompt: 'Sungai Nil sebagian besar mengalir di benua...', answer: 'Afrika', choices: ['Eropa', 'Asia', 'Afrika', 'Amerika Utara'] },
  { prompt: 'Negara kepulauan terbesar di dunia adalah...', answer: 'Indonesia', choices: ['Jepang', 'Indonesia', 'Filipina', 'Selandia Baru'] },
  { prompt: 'Kota yang dikenal sebagai ibu kota Prancis adalah...', answer: 'Paris', choices: ['Roma', 'Madrid', 'Paris', 'Lisbon'] },
  { prompt: 'Samudra yang berada di antara Afrika dan Australia adalah...', answer: 'Hindia', choices: ['Pasifik', 'Atlantik', 'Hindia', 'Arktik'] },
  { prompt: 'Danau Toba berada di provinsi...', answer: 'Sumatera Utara', choices: ['Sumatera Barat', 'Sumatera Utara', 'Riau', 'Aceh'] },
];

const KNOWLEDGE_QUESTIONS = [
  ...GENERAL_KNOWLEDGE_QUESTIONS,
  ...HISTORY_QUESTIONS,
  ...GEOGRAPHY_QUESTIONS,
];

function getDifficultyChoices(choices, answer, difficulty, seed = 0) {
  const choiceCount = difficulty === 'easy' ? 2 : difficulty === 'hard' ? 4 : 3;
  const shuffledChoices = seededShuffle(choices.filter((choice) => choice !== answer), seed);
  return seededShuffle([answer, ...shuffledChoices.slice(0, choiceCount - 1)], seed + 1);
}

function createMathQuestion(quizId, index, seed, difficulty) {
  const levelScale = difficulty === 'easy' ? 0.5 : difficulty === 'hard' ? 2 : 1;
  const first = Math.max(2, Math.round((2 + ((seed + index * 7) % 18)) * levelScale));
  const second = Math.max(2, Math.round((2 + ((seed * 3 + index * 5) % 12)) * levelScale));
  const number = Math.max(3, Math.round((3 + ((seed + index * 4) % 15)) * levelScale));
  const missing = Math.max(2, Math.round((2 + ((seed * 2 + index * 3) % 10)) * levelScale));
  const firstComparison = first * 2;
  const secondComparison = second * 3 === firstComparison ? firstComparison + 1 : second * 3;
  const questionTypes = [
    () => ({ prompt: `${first} + ${second} = ...`, answer: String(first + second) }),
    () => ({ prompt: `${first} × ${second} = ...`, answer: String(first * second) }),
    () => ({ prompt: `${first * second} ÷ ${second} = ...`, answer: String(first) }),
    () => ({ prompt: `Lanjutkan deret: ${number}, ${number + 3}, ${number + 6}, ...`, answer: String(number + 9) }),
    () => ({ prompt: `${first} + ___ = ${first + second}`, answer: String(second) }),
    () => ({ prompt: `Mana yang lebih besar: ${firstComparison} atau ${secondComparison}?`, answer: String(Math.max(firstComparison, secondComparison)) }),
    () => ({ prompt: `25% dari ${first * 4} adalah...`, answer: String(first) }),
    () => ({ prompt: `Persegi dengan sisi ${number} cm memiliki keliling...`, answer: String(number * 4) }),
    () => ({ prompt: `Berapa hasil ${missing}/4 + ${missing * 3}/4?`, answer: String(missing) }),
    () => ({ prompt: `Angka berikutnya: ${missing}, ${missing * 2}, ${missing * 4}, ...`, answer: String(missing * 8) }),
  ];
  const question = questionTypes[quizId - 1]();
  const answer = Number(question.answer);
  const offset = difficulty === 'hard' ? 1 : difficulty === 'easy' ? 3 : 2;
  const offsets = [answer + offset, Math.max(0, answer - offset), answer + offset * 2];
  const choices = [...new Set([question.answer, ...offsets.map(String)])];
  while (choices.length < 4) choices.push(String(answer + choices.length + 5));
  const shift = (seed + index) % choices.length;

  return {
    ...question,
    choices: getDifficultyChoices([...choices.slice(shift), ...choices.slice(0, shift)], question.answer, difficulty, seed + index),
  };
}

export function TebakGambarQuiz({ onAnswer, quizId = 1, difficulty = 'medium', randomSeed = 1 }) {
  const questions = useMemo(
    () => seededShuffle(PICTURE_QUESTIONS, randomSeed + quizId)
      .slice(0, TOTAL_QUESTIONS)
      .map((question, index) => ({
        ...question,
        choices: getDifficultyChoices(question.choices, question.answer, difficulty, randomSeed + index),
      })),
    [difficulty, quizId, randomSeed],
  );
  const { questionIndex, answerQuestion, isComplete, correctAnswers } = useQuestionProgress(questions.length, onAnswer);
  const question = questions[questionIndex];

  return (
    <GamePanel
      eyebrow={`MODE TEBAK GAMBAR • ${String(quizId).padStart(2, '0')}`}
      title="Tebak Gambar"
      prompt={question.prompt}
    >
      {isComplete ? (
        <QuestionsComplete correctAnswers={correctAnswers} total={questions.length} />
      ) : (
        <>
          <QuestionProgress current={questionIndex + 1} total={questions.length} />
          <div className="invention-icon" role="img" aria-label="Petunjuk gambar">{question.clue}</div>
          <ChoiceGrid
            choices={question.choices}
            correctChoice={question.answer}
            difficulty={difficulty}
            onChoose={(choice) => answerQuestion(choice === question.answer)}
          />
        </>
      )}
    </GamePanel>
  );
}

export function TebakPengetahuanQuiz({ onAnswer, quizId = 1, difficulty = 'medium', randomSeed = 1 }) {
  const questions = useMemo(
    () => seededShuffle(KNOWLEDGE_QUESTIONS, randomSeed + quizId)
      .slice(0, TOTAL_QUESTIONS)
      .map((question, index) => ({
        ...question,
        choices: getDifficultyChoices(question.choices, question.answer, difficulty, randomSeed + index),
      })),
    [difficulty, quizId, randomSeed],
  );
  const { questionIndex, answerQuestion, isComplete, correctAnswers } = useQuestionProgress(questions.length, onAnswer);
  const question = questions[questionIndex];

  return (
    <GamePanel
      eyebrow={`MODE PENGETAHUAN • ${String(quizId).padStart(2, '0')}`}
      title="Trivia Pengetahuan Umum"
      prompt={question.prompt}
    >
      {isComplete ? (
        <QuestionsComplete correctAnswers={correctAnswers} total={questions.length} />
      ) : (
        <>
          <QuestionProgress current={questionIndex + 1} total={questions.length} />
          <ChoiceGrid
            choices={question.choices}
            correctChoice={question.answer}
            difficulty={difficulty}
            onChoose={(choice) => answerQuestion(choice === question.answer)}
          />
        </>
      )}
    </GamePanel>
  );
}

export function MenghitungCepatQuiz({ onAnswer, quizId = 1, randomSeed = 1, difficulty = 'medium' }) {
  const questions = useMemo(
    () => seededShuffle(
      Array.from({ length: TOTAL_QUESTIONS }, (_, index) => createMathQuestion(quizId, index, randomSeed, difficulty)),
      randomSeed + quizId,
    ),
    [difficulty, quizId, randomSeed],
  );
  const { questionIndex, answerQuestion, isComplete, correctAnswers } = useQuestionProgress(questions.length, onAnswer);
  const question = questions[questionIndex];

  return (
    <GamePanel
      eyebrow={`MODE HITUNG CEPAT • ${String(quizId).padStart(2, '0')}`}
      title={getQuizName('hitung', quizId) || 'Menghitung Cepat'}
      prompt="Pilih hasil yang benar secepat mungkin."
    >
      {isComplete ? (
        <QuestionsComplete correctAnswers={correctAnswers} total={questions.length} />
      ) : (
        <>
          <QuestionProgress current={questionIndex + 1} total={questions.length} />
          <div className="science-statement">
            <span aria-hidden="true">🧠</span>
            <p>{question.prompt}</p>
          </div>
          <ChoiceGrid
            choices={question.choices}
            correctChoice={question.answer}
            difficulty={difficulty}
            onChoose={(choice) => answerQuestion(choice === question.answer)}
          />
        </>
      )}
    </GamePanel>
  );
}
