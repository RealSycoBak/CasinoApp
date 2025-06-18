import  {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
} from 'react';

import type { ReactNode } from 'react';
import cyberbeat from '../assets/cyberbeat.mp3';

interface AudioContextType {
  isPlaying: boolean;
  togglePlay: () => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export const useAudio = () => {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useAudio must be inside AudioProvider');
  return ctx;
};

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.7;
      audio.loop = true;
      audio.play().catch(() => {
      });
    }
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.pause();
    else audio.play().catch(() => {});
    setIsPlaying(p => !p);
  };

  return (
    <AudioContext.Provider value={{ isPlaying, togglePlay }}>
      <audio ref={audioRef} src={cyberbeat} />
      {children}
    </AudioContext.Provider>
  );
}
