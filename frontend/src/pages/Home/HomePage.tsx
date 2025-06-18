import React, { useRef, useState } from 'react';
import './HomePage.css';
import ParticlesBg from '../../components/ParticlesBg/ParticlesBg';


function HomePage() {

 const audioRef = useRef<HTMLAudioElement>(null);
 const [isPlaying, setIsPlaying] = useState(false);

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

  return (
     <div className="casino-wrapper">
      <ParticlesBg />
      <audio ref={audioRef} src="/cyberbeat.mp3" loop />
      <div className="casino-overlay">
        <div className="casino-glow-title">
          <h1>CASINO ∞ NEON</h1>
          <p className="tagline">Luck. Money. Gamble.</p>
        </div>

        <div className="button-group">
          <button className="enter-button">Enter Casino</button>
          <button className="info-button">Learn More</button>
          <button className="music-toggle" onClick={toggleMusic}>
            {isPlaying ? '🔊 Music On' : '🔇 Music Off'}
          </button>
        </div>

        <footer className="footer">
          © 2025 Casino Neon. All rights reserved.
        </footer>
      </div>
    </div>
  )
}

export default HomePage
