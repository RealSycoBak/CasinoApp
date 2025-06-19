import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

import HomePage from './pages/Home/HomePage';
import CasinoPage from './pages/Casino/CasinoPage';
import BlackjackPage from './pages/Casino/BlackJackPage';

export interface User {
  displayName: string;
  email: string;
  currency: number;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get<User>('http://localhost:3000/api/me', { withCredentials: true })
      .then(r => setUser(r.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading…</p>;

  return (
    <HashRouter>
    <Routes>
    <Route path="/" element={<HomePage user={user} setUser={setUser} />} />
    <Route
      path="/casino"
      element={
        user && user.displayName
          ? <CasinoPage user={user} setUser={setUser} />
          : <Navigate to="/" replace />
      }
    />
    <Route
  path="/blackjack"
  element={
    user && user.displayName
      ? <BlackjackPage />
      : <Navigate to="/" replace />
  }
/>
  </Routes>
</HashRouter>
  );
}
