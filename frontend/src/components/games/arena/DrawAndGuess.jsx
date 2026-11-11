import { useCallback, useEffect, useRef, useState } from 'react';
import './DrawAndGuess.css';

const COLORS = ['#292536', '#ef476f', '#ff9f1c', '#ffd166', '#06a77d', '#168aad', '#4361ee', '#9b5de5'];
const MIN_TOOL_SIZE = 1;
const MAX_TOOL_SIZE = 10;
const MAX_CHAT_MESSAGES = 50;

function formatTime(seconds) {
  const safeSeconds = Math.max(0, Math.ceil(seconds));
  return `${String(Math.floor(safeSeconds / 60)).padStart(2, '0')}:${String(safeSeconds % 60).padStart(2, '0')}`;
}

function paintSegment(context, segment, width, height) {
  context.save();
  context.globalCompositeOperation = segment.erase ? 'destination-out' : 'source-over';
  context.strokeStyle = segment.color;
  context.lineWidth = segment.width * 2;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.beginPath();
  context.moveTo(segment.x0 * width, segment.y0 * height);
  context.lineTo(segment.x1 * width, segment.y1 * height);
  context.stroke();
  context.restore();
}

export default function DrawAndGuess({ socket, game, timeLeft, players = [], currentPlayerId }) {
  const canvasRef = useRef(null);
  const lastPointRef = useRef(null);
  const isDrawingRef = useRef(false);
  const [cursor, setCursor] = useState(null);
  const [turn, setTurn] = useState(null);
  const [word, setWord] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(5);
  const [eraserSize, setEraserSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [guess, setGuess] = useState('');
  const [solved, setSolved] = useState(false);
  const [error, setError] = useState('');
  const [turnTimeLeft, setTurnTimeLeft] = useState(60);

  const drawSegment = useCallback((segment) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (context) paintSegment(context, segment, canvas.width, canvas.height);
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (context) context.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    if (!socket || !game?.roundId) return undefined;

    const handleTurn = (nextTurn) => {
      if (nextTurn.roundId !== game.roundId) return;
      setTurn(nextTurn);
      setWord('');
      setSolved(false);
      setError('');
      setCursor(null);
      clearCanvas();
    };
    const handleWord = (payload) => {
      if (payload.roundId === game.roundId) setWord(payload.word);
    };
    const handleStroke = (payload) => {
      if (payload.roundId === game.roundId && payload.turnNumber === turn?.turnNumber) {
        drawSegment(payload.segment);
      }
    };
    const handleClear = (payload) => {
      if (payload.roundId === game.roundId && payload.turnNumber === turn?.turnNumber) clearCanvas();
    };
    const handleChat = (message) => {
      if (message.roundId !== game.roundId) return;
      setChatMessages((current) => [...current, message].slice(-MAX_CHAT_MESSAGES));
    };
    const handleSolved = (payload) => {
      if (payload.roundId !== game.roundId) return;
      setSolved(true);
      setWord(payload.word);
    };

    socket.on('draw:turn', handleTurn);
    socket.on('draw:word', handleWord);
    socket.on('draw:stroke', handleStroke);
    socket.on('draw:clear', handleClear);
    socket.on('draw:chat', handleChat);
    socket.on('draw:solved', handleSolved);
    socket.emit('draw:sync-request', { roundId: game.roundId }, (response) => {
      if (response?.error) {
        setError(response.error);
        return;
      }
      if (response?.turn) {
        setTurn(response.turn);
        setSolved(Boolean(response.solved));
        setChatMessages(response.messages || []);
        response.segments?.forEach(drawSegment);
      }
      if (response?.word) setWord(response.word);
    });

    return () => {
      socket.off('draw:turn', handleTurn);
      socket.off('draw:word', handleWord);
      socket.off('draw:stroke', handleStroke);
      socket.off('draw:clear', handleClear);
      socket.off('draw:chat', handleChat);
      socket.off('draw:solved', handleSolved);
    };
  }, [clearCanvas, drawSegment, game?.roundId, socket, turn?.turnNumber]);

  useEffect(() => {
    if (!turn?.endsAt) return undefined;
    const updateTime = () => setTurnTimeLeft(
      Math.max(0, (turn.endsAt - (Date.now() + (game.clientClockOffset || 0))) / 1000),
    );
    updateTime();
    const intervalId = window.setInterval(updateTime, 200);
    return () => window.clearInterval(intervalId);
  }, [game.clientClockOffset, turn]);

  const isDrawer = turn?.drawerId === currentPlayerId;
  const toolSize = isEraser ? eraserSize : brushSize;
  const drawer = players.find((player) => player.id === turn?.drawerId);
  const maskedWord = word
    ? word.split('').map((letter) => (letter === ' ' ? '　' : '_')).join(' ')
    : 'Menunggu giliran...';

  const getCanvasPoint = (event) => {
    const canvas = canvasRef.current;
    const bounds = canvas.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width)),
      y: Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height)),
    };
  };

  const startDrawing = (event) => {
    if (!isDrawer || solved || !canvasRef.current) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    lastPointRef.current = getCanvasPoint(event);
    isDrawingRef.current = true;
  };

  const draw = (event) => {
    if (!isDrawingRef.current || !lastPointRef.current || !isDrawer || solved) return;
    const point = getCanvasPoint(event);
    const previousPoint = lastPointRef.current;
    const segment = {
      x0: previousPoint.x,
      y0: previousPoint.y,
      x1: point.x,
      y1: point.y,
      color,
      width: toolSize,
      erase: isEraser,
    };
    drawSegment(segment);
    socket.emit('draw:stroke', { roundId: game.roundId, turnNumber: turn.turnNumber, segment }, (response) => {
      if (response?.error) setError(response.error);
    });
    lastPointRef.current = point;
  };

  const handleCanvasPointerMove = (event) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const bounds = canvas.getBoundingClientRect();
      const diameter = toolSize * 2 * (bounds.width / canvas.width);
      setCursor({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
        diameter: Math.max(2, diameter),
      });
    }
    draw(event);
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  const handleClearCanvas = () => {
    if (!isDrawer || solved) return;
    clearCanvas();
    socket.emit('draw:clear', { roundId: game.roundId, turnNumber: turn.turnNumber }, (response) => {
      if (response?.error) setError(response.error);
    });
  };

  const submitGuess = (event) => {
    event.preventDefault();
    const text = guess.trim();
    if (!text || isDrawer || solved || !turn) return;
    setError('');
    socket.emit('draw:guess', {
      roundId: game.roundId,
      turnNumber: turn.turnNumber,
      text,
    }, (response) => {
      if (response?.error) setError(response.error);
      else setGuess('');
    });
  };

  return (
    <main className="draw-game">
      <header className="draw-topbar">
        <div className="draw-brand">RAMEIN <span>🎨</span></div>
        <div className="draw-turn-status">
          <span className="draw-turn-label">GILIRAN {turn?.turnNumber || 0} / 10</span>
          <strong>{isDrawer ? 'KAMU MENGGAMBAR!' : `GILIRAN ${drawer?.name || 'Pemain'}`}</strong>
        </div>
        <div className={`draw-timer${turnTimeLeft <= 10 ? ' draw-timer-urgent' : ''}`} aria-live="off">
          <span aria-hidden="true">⏱</span>
          <strong>{formatTime(turnTimeLeft)}</strong>
          <small>giliran</small>
        </div>
        <div className="draw-total-timer">
          <span>SISA GAME</span>
          <strong>{formatTime(timeLeft)}</strong>
        </div>
      </header>

      <section className="draw-word-card" aria-live="polite">
        <span>{isDrawer ? 'KATA RAHASIA' : 'TEBAK KATA INI'}</span>
        <strong>{isDrawer ? (word || 'Menyiapkan kata...') : (solved ? word : maskedWord)}</strong>
        <small>{isDrawer ? 'Gambarkan tanpa menulis huruf atau angka!' : 'Ketik jawabanmu di kolom chat.'}</small>
      </section>

      <div className="draw-layout">
        <section className="draw-board-card" aria-label="Papan gambar">
          <div className="draw-board-heading">
            <strong>{isDrawer ? 'PAPAN GAMBAR KAMU' : 'TEBAKAN TEMANMU'}</strong>
            <span>{solved ? 'TERTEBAK! 🎉' : isDrawer ? 'Saatnya menggambar' : 'Jawab sebelum waktu habis!'}</span>
          </div>
          <div className={`draw-canvas-wrap${isDrawer && !solved ? ' draw-canvas-active' : ''}`}>
            <canvas
              ref={canvasRef}
              className="draw-canvas"
              width="960"
              height="540"
              aria-label={isDrawer ? 'Canvas menggambar' : 'Canvas gambar yang disinkronkan'}
              onPointerDown={startDrawing}
              onPointerMove={handleCanvasPointerMove}
              onPointerLeave={() => setCursor(null)}
              onPointerUp={stopDrawing}
              onPointerCancel={stopDrawing}
              onLostPointerCapture={stopDrawing}
            />
            {isDrawer && !solved && cursor && (
              <span
                className={`draw-canvas-cursor${isEraser ? ' draw-canvas-cursor-eraser' : ''}`}
                style={{
                  left: cursor.x,
                  top: cursor.y,
                  width: cursor.diameter,
                  height: cursor.diameter,
                  '--cursor-color': color,
                }}
                aria-hidden="true"
              />
            )}
          </div>
          {isDrawer && (
            <div className="draw-toolbar" aria-label="Alat menggambar">
              <label className={`draw-size-control${!isEraser ? ' draw-size-control-active' : ''}`}>
                <span>✏️ Kuas <output>{brushSize}</output></span>
                <input
                  type="range"
                  min={MIN_TOOL_SIZE}
                  max={MAX_TOOL_SIZE}
                  step="1"
                  value={brushSize}
                  onFocus={() => setIsEraser(false)}
                  onChange={(event) => {
                    setBrushSize(Number(event.target.value));
                    setIsEraser(false);
                  }}
                  aria-label="Ukuran kuas, 1 sampai 10"
                />
              </label>
              <div className="draw-color-palette" role="group" aria-label="Warna kuas">
                {COLORS.map((value) => (
                  <button
                    className={`draw-color-button${color === value && !isEraser ? ' draw-color-selected' : ''}`}
                    key={value}
                    type="button"
                    style={{ '--draw-color': value }}
                    onClick={() => { setColor(value); setIsEraser(false); }}
                    aria-label={`Pilih warna ${value}`}
                    aria-pressed={color === value && !isEraser}
                  />
                ))}
              </div>
              <button
                className={`draw-eraser-button${isEraser ? ' draw-tool-selected' : ''}`}
                type="button"
                onClick={() => setIsEraser(true)}
                aria-pressed={isEraser}
              >
                🧽 Penghapus
              </button>
              <label className={`draw-size-control${isEraser ? ' draw-size-control-active' : ''}`}>
                <span>Penghapus <output>{eraserSize}</output></span>
                <input
                  type="range"
                  min={MIN_TOOL_SIZE}
                  max={MAX_TOOL_SIZE}
                  step="1"
                  value={eraserSize}
                  onFocus={() => setIsEraser(true)}
                  onChange={(event) => {
                    setEraserSize(Number(event.target.value));
                    setIsEraser(true);
                  }}
                  aria-label="Ukuran penghapus, 1 sampai 10"
                />
              </label>
              <button className="draw-clear-button" type="button" onClick={handleClearCanvas}>
                🗑 Bersihkan
              </button>
            </div>
          )}
        </section>

        <aside className="draw-chat-card" aria-label="Live chat tebakan">
          <div className="draw-chat-heading">
            <strong>TEBAK-TEBAKAN</strong>
            <span>💬 {chatMessages.length}</span>
          </div>
          <div className="draw-chat-list" role="log" aria-live="polite">
            {chatMessages.length === 0 && (
              <p className="draw-chat-empty">Chat dan tebakan pemain akan muncul di sini!</p>
            )}
            {chatMessages.map((message) => (
              <p className={`draw-chat-message${message.isCorrect ? ' draw-chat-correct' : ''}`} key={message.id}>
                <strong>{message.playerName}</strong>
                <span>{message.text}</span>
                {message.isCorrect && <b>✓ BENAR!</b>}
              </p>
            ))}
          </div>
          <form className="draw-guess-form" onSubmit={submitGuess}>
            <label className="draw-sr-only" htmlFor="draw-guess">Tulis tebakan</label>
            <input
              id="draw-guess"
              type="text"
              maxLength="60"
              value={guess}
              onChange={(event) => setGuess(event.target.value)}
              placeholder={isDrawer ? 'Kamu sedang menggambar...' : 'Tulis tebakanmu...'}
              disabled={isDrawer || solved || !turn}
            />
            <button type="submit" disabled={isDrawer || solved || !guess.trim() || !turn}>
              KIRIM
            </button>
          </form>
          {error && <p className="draw-error" role="alert">{error}</p>}
        </aside>
      </div>

      <footer className="draw-footer">
        <span>10 GILIRAN • 1 MENIT TIAP GILIRAN</span>
        <span>Skor diperbarui otomatis saat jawaban benar.</span>
      </footer>
    </main>
  );
}
