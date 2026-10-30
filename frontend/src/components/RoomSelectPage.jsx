export default function RoomSelectPage({ isOpen, isCreating, onBack, onCreateRoom, onJoinRoom }) {
  return (
    <div className={`room-select-container ${isOpen ? 'active' : ''} ${isCreating ? 'creating' : ''}`}>
      {/* Panel Kiri - PINK (BUAT ROOM) */}
      <div className="panel panel-pink">
        <div className="bg-blobs">
          <div className="blob blob-pink-1"></div>
          <div className="blob blob-pink-2"></div>
          <div className="blob blob-pink-3"></div>
          <div className="blob blob-pink-4"></div>
          <div className="blob blob-pink-5"></div>
          <div className="blob blob-pink-6"></div>
          <div className="blob blob-pink-7"></div>
        </div>

        <button className="btn-room" onClick={onCreateRoom}>
          BUAT ROOM
        </button>

        {/* Tombol Back (<) */}
        <button className="btn-back" onClick={onBack}>
          &#10094;
        </button>
      </div>

      {/* Panel Kanan - BIRU (GABUNG ROOM) */}
      <div className="panel panel-blue">
        <div className="bg-blobs">
          <div className="blob blob-blue-1"></div>
          <div className="blob blob-blue-2"></div>
          <div className="blob blob-blue-3"></div>
          <div className="blob blob-blue-4"></div>
          <div className="blob blob-blue-5"></div>
          <div className="blob blob-blue-6"></div>
          <div className="blob blob-blue-7"></div>
        </div>

        <button className="btn-room" onClick={onJoinRoom}>
          GABUNG
        </button>
      </div>
    </div>
  );
}