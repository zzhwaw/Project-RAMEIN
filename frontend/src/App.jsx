import LandingPage from './components/LandingPage';

export default function App() {
  const handleStart = () => {
    alert('Tombol MAIN diklik! Siap lanjut ke menu buat/join room.');
  };

  return (
    <div>
      <LandingPage onStart={handleStart} />
    </div>
  );
}