import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import './HomePage.css';
import ParticlesBg from '../../components/ParticlesBg/ParticlesBg';

interface User {
  displayName: string;
  email: string;
  currency: number;
}

function HomePage() {

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  axios.get<User>('http://localhost:3000/api/me', {
  withCredentials: true
})
  .then(({ data }) => setUser(data))
  .catch(() => setUser(null))
  .finally(() => setLoading(false));
}, []);

const handleLogin = () => {
  window.location.href = 'http://localhost:3000/auth/google';
};

  const handleLogout = () => {
  axios
    .post('http://localhost:3000/auth/logout', {}, { withCredentials: true })
    .then(() => setUser(null));
};
 const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (loading) {
    return <div className="casino-wrapper"><p className="loading">Loading…</p></div>;
  }

  return (
     <div className="casino-wrapper">
      <ParticlesBg />
      <audio ref={audioRef} src="/cyberbeat.mp3" loop />
      <div className="casino-overlay">
        <div className="casino-glow-title">
          <h1>CASINO ∞ NEON</h1>
          <p className="tagline">Luck. Money. Gamble.</p>
        </div>
         {!user ? (
          <>
            <div className="button-group">
              <button className="info-button">Learn More</button>
              <button className="google-login" onClick={handleLogin}>
              Sign in with Google
            </button>
            <button className="music-toggle" onClick={toggleMusic}>
          {isPlaying ? '🔊 Music On' : '🔇 Music Off'}
        </button>
            </div>
          </>
        ) :(
          <>
            <div className="user-info">
              <h2>Welcome, {user.displayName}!</h2>
              <p>Your Coins: <strong>{user.currency}</strong></p>
            </div>
            <div className="button-group">
              <button className="enter-button">Enter Casino</button>
              <button className="info-button">Learn More</button>
              <button className="logout-button" onClick={handleLogout}>
                Log out
              </button>
              <button className="music-toggle" onClick={toggleMusic}>
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
  )
}

export default HomePage
