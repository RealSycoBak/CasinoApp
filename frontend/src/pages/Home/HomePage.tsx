import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import ParticlesBg from '../../components/ParticlesBg/ParticlesBg';
import type { User } from '../../App';
import { useAudio } from '../../contexts/AudioContexts';

interface Props {
  user: User | null;
  setUser: (u: User | null) => void;
}

export default function HomePage({ user, setUser }: Props) {
  const navigate = useNavigate();
  const { isPlaying, togglePlay } = useAudio();

  const handleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/google';
  };

  const handleLogout = () => {
    fetch('http://localhost:3000/auth/logout', {
      method: 'POST',
      credentials: 'include'
    }).then(() => setUser(null));
  };

  const enterCasino = () => {
    navigate('/casino');
  };

  return (
    <div className="casino-wrapper">
      <ParticlesBg />
      <div className="casino-overlay">
        <div className="casino-glow-title">
          <h1>CASINO ∞ NEON</h1>
          <p className="tagline">Luck. Money. Gamble.</p>
        </div>

        {!(user && user.displayName) ? (
          <div className="button-group">
            <button className="info-button">Learn More</button>
            <button className="google-login" onClick={handleLogin}>
              Sign in with Google
            </button>
            <button className="music-toggle" onClick={togglePlay}>
              {isPlaying ? '🔊 Music On' : '🔇 Music Off'}
            </button>
          </div>
        ) : (
          <>
            <div className="user-info">
              <h2>Welcome, {user.displayName}!</h2>
              <p>Your Coins: <strong>{user.currency}</strong></p>
            </div>
            <div className="button-group">
              <button className="enter-button" onClick={enterCasino}>
                Enter Casino
              </button>
              <button className="info-button">Learn More</button>
              <button className="logout-button" onClick={handleLogout}>
                Log out
              </button>
              <button className="music-toggle" onClick={togglePlay}>
                {isPlaying ? '🔊 Music On' : '🔇 Music Off'}
              </button>
            </div>
          </>
        )}

        <footer className="footer">
          © 2025 Casino Neon. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
