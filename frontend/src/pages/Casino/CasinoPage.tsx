import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../../App';
import ParticlesBg from '../../components/ParticlesBg/ParticlesBg';
import { useAudio } from '../../contexts/AudioContexts';
import './CasinoPage.css';
import { io } from 'socket.io-client';

const GAMES = [
  { id: 1, name: 'Roulette', bgClass: 'roulette-bg' },
  { id: 2, name: 'Slots',    bgClass: 'slots-bg'    },
  { id: 3, name: 'Blackjack',bgClass: 'blackjack-bg'},
  { id: 4, name: 'Poker',    bgClass: 'poker-bg'    },
];

interface Props {
  user: User;
  setUser: (u: User | null) => void;
}

export default function CasinoPage({ user, setUser }: Props) {
  useEffect(() => {
  const socket = io('http://localhost:3000', { withCredentials: true });
  socket.on('currencyUpdate', ({ currency }) => {
    if (user) {
      setUser({
        displayName: user.displayName,
        email:       user.email,
        currency
      });
    }
  });
  return () => { socket.disconnect(); };
}, [user, setUser]);

  const navigate = useNavigate();
  const { isPlaying, togglePlay } = useAudio();
  const [showSettings, setShowSettings] = useState(false);

  const goBack = () => navigate('/');
  const openSettings  = () => setShowSettings(true);
  const closeSettings = () => setShowSettings(false);
  const handleLogout  = () => {
    fetch('/auth/logout', { method: 'POST', credentials: 'include' })
      .then(() => setUser(null))
      .then(() => navigate('/'));
  };

  return (
    <div className="casino-page">
      <ParticlesBg />
      <header className="casino-header">
        <button className="back-btn" onClick={goBack}>← Home</button>
        <h1 className="neon-title">Casino Neon Lobby</h1>
        <div className="header-user">
          <span className="neon-text">{user.displayName}</span>
          <span className="neon-text">💰 {user.currency}</span>
          {/* Only settings icon in header now */}
          <button className="settings-btn" onClick={openSettings}>⚙️</button>
        </div>
      </header>

      <div className="games-container">
        <div className="games-grid">
          {GAMES.map(game => (
  <div key={game.id} className={`game-card ${game.bgClass}`}>
    <h2 className="game-name neon-text">{game.name}</h2>
    <button
      className="play-btn"
      onClick={() =>
        game.name === 'Blackjack'
          ? navigate('/blackjack')
          : alert(`Coming soon: ${game.name}`)
      }
    >
      Play
    </button>
  </div>
))}
        </div>
      </div>

      {showSettings && (
        <div className="settings-modal-backdrop" onClick={closeSettings}>
          <div className="settings-modal" onClick={e => e.stopPropagation()}>
            <h2 className="neon-text">Settings</h2>

            <div className="settings-item">
              <label className="neon-text">Volume:</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                defaultValue="0.7"
                onChange={e => {
                  const audio = document.querySelector('audio');
                  if (audio) audio.volume = Number(e.target.value);
                }}
              />
            </div>

            <div className="settings-item">
              <label className="neon-text">Music:</label>
              <button className="toggle-btn" onClick={togglePlay}>
                {isPlaying ? 'Pause' : 'Play'}
              </button>
            </div>

            <div className="settings-item">
              <label className="neon-text">Account:</label>
              <button className="logout-btn" onClick={handleLogout}>
                Log out
              </button>
            </div>

            <button className="close-btn" onClick={closeSettings}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
