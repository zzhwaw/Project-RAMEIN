export default function LandingPage({ onStart }) {
  return (
    <div className="homepage-container">
      {/* Background Blobs Berwarna */}
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="blob blob-4"></div>
        <div className="blob blob-5"></div>
        <div className="blob blob-6"></div>
        <div className="blob blob-7"></div>
        <div className="blob blob-8"></div>
        <div className="blob blob-9"></div>
        <div className="blob blob-10"></div>
        <div className="blob blob-11"></div>
        <div className="blob blob-12"></div>
        <div className="blob blob-13"></div>
        <div className="blob blob-14"></div>
        <div className="blob blob-15"></div>
      </div>

      {/* Konten Utama (Logo & Tombol) */}
      <div className="main-content">
        <h1 className="logo-title">
          <span className="char-r">R</span>
          <span className="char-a">A</span>
          <span className="char-m">M</span>
          <span className="char-e">E</span>
          <span className="char-i">I</span>
          <span className="char-n">N</span>
        </h1>
        
        <button className="btn-main" onClick={onStart}>
          MAIN
        </button>
      </div>
    </div>
  );
}