import { useState, useEffect } from 'react';
import { io, Socket }     from 'socket.io-client';
import { useNavigate }    from 'react-router-dom';
import axios              from 'axios';
import './BlackjackPage.css';

const SOCKET_URL = 'http://localhost:3000';

type Card        = { value: string; suit: string };
type PlayerInfo  = { id: string; name: string };

export default function BlackjackPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState<{
  displayName: string;
  currency: number;
  userId: string;
} | null>(null);

  const [socket, setSocket]             = useState<Socket | null>(null);
  const [lobbyId, setLobbyId]           = useState('');
  const [players, setPlayers]           = useState<PlayerInfo[]>([]);
  const [playersCount, setPlayersCount] = useState(0);
  const [currentTurn, setCurrentTurn]   = useState('');
  const [status, setStatus]             = useState('Connecting...');

  const [hand, setHand]             = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [isYourTurn, setIsYourTurn] = useState(false);
  const [result, setResult]         = useState('');

  const [inBetPhase, setInBetPhase]     = useState(false);
  const [hasBetPlaced, setHasBetPlaced] = useState(false);
  const [betAmount, setBetAmount]       = useState(1);

  useEffect(() => {
  axios
    .get<{ displayName: string; currency: number; userId: string }>(
      'http://localhost:3000/api/me',
      { withCredentials: true }
    )
    .then(r => {
      setUser({
        displayName: r.data.displayName,
        currency:    r.data.currency,
        userId:      r.data.userId
      });
    })
    .catch(() => setUser(null));
}, []);

  useEffect(() => {
    if (!user) return;
    const s = io(SOCKET_URL, { withCredentials: true, forceNew: true });
    setSocket(s);

    s.on('connect', () => setStatus('Looking for table…'));
    s.emit('joinGame', {
    gameType:    'blackjack',
     displayName: user.displayName,
    userId:      user.userId
  });

    s.on('lobbyJoined', ({ lobbyId }) => {
      setLobbyId(lobbyId);
      setStatus('Waiting for players…');
    });

    s.on('lobbyUpdate', ({ players, queued, status: st, names }) => {
      setPlayersCount(players);
      setStatus(st === 'waiting' ? `Waiting ${players}/8` : 'Starting…');
      setPlayers(names);
    });

    s.on('betStart', () => {
      setInBetPhase(true);
      setHasBetPlaced(false);
      setStatus('Place your bet');
    });
    s.on('betPlaced', ({ playerId, amount }: any) => {
      if (playerId === s.id) {
        setHasBetPlaced(true);
        setStatus(`Bet placed: ${amount}`);
      }
    });
    s.on('currencyUpdate', ({ currency }: any) => {
      setUser(u => u ? { ...u, currency } : u);
    });

    // ↳ Game play events
    s.on('turnStart', ({ playerId, name }: any) => {
      setInBetPhase(false);
      setCurrentTurn(playerId);
      setStatus(`${name}'s turn`);
      setIsYourTurn(s.id === playerId);
    });
    s.on('blackjackStart', ({ hand }: any) => {
      setHand(hand);
      setDealerHand([]);
      setResult('');
    });
    s.on('yourTurn', () => { setIsYourTurn(true); setStatus('Your turn'); });
    s.on('cardDealt', ({ card }: any) => setHand(h => [...h, card]));
    s.on('bust', () => { setIsYourTurn(false); setStatus('Busted!'); });
    s.on('standAck', () => { setIsYourTurn(false); setStatus('Waiting…'); });
    s.on('gameOver', ({ result: res, yourHand, dealerHand }: any) => {
      setResult(res.charAt(0).toUpperCase() + res.slice(1));
      setHand(yourHand);
      setDealerHand(dealerHand);
      setStatus('Round over');
    });

    return () => { s.disconnect(); };
  }, [user]);

  // — Actions
  const handlePlaceBet = () => {
    if (
      socket && lobbyId &&
      betAmount > 0 && user && betAmount <= user.currency
    ) {
      socket.emit('placeBet', { lobbyId, amount: betAmount });
    }
  };
  const handleHit   = () => socket?.emit('hit',   { lobbyId });
  const handleStand = () => socket?.emit('stand', { lobbyId });
  const handleLeave = () => {
    if (socket) {
      socket.emit('leaveGame', { lobbyId });
      socket.disconnect();
    }
    navigate('/casino');
  };

  // — Card renderer
  const renderCard = (c: Card, i: number) => {
    const rank = c.value === '10' ? '0' : c.value;
    const suit = c.suit[0].toUpperCase();
    const code = `${rank}${suit}`;
    const url  = `https://deckofcardsapi.com/static/img/${code}.png`;
    return <div key={i} className="card" style={{ backgroundImage: `url(${url})` }} />;
  };

  return (
    <div className="blackjack-page">
      <button className="leave-btn" onClick={handleLeave}>Leave Game</button>

      {/* User & lobby header */}
      <div className="lobby-info">
        {user
          ? `${user.displayName} — Coins: ${user.currency}`
          : 'Loading account…'
        }
      </div>
      <div className="lobby-info">
        {lobbyId
          ? `Lobby: ${lobbyId} | Players: ${playersCount}/8`
          : status
        }
      </div>

      {/* Betting UI */}
      {inBetPhase && !hasBetPlaced && (
        <div className="bet-section">
          <input
            type="number"
            min={1}
            max={user?.currency || 1}
            value={betAmount}
            onChange={e => setBetAmount(Number(e.target.value))}
          />
          <button onClick={handlePlaceBet}>Place Bet</button>
        </div>
      )}

      {/* Game table */}
      <div className="table-container">
        <div className="seats-row">
          {Array.from({ length: 4 }).map((_, i) => {
            const p = players[i];
            return (
              <div
                key={i}
                className={`seat ${p ? 'occupied' : 'loading'} ${
                  currentTurn === p?.id ? 'turn' : ''
                }`}
              >
                {p && <span className="seat-name">{p.name}</span>}
              </div>
            );
          })}
        </div>

        <div className="hands-container">
          <div className="hand-section dealer-hand">
            <h3>Dealer</h3>
            <div className="cards-row">{dealerHand.map(renderCard)}</div>
          </div>
          <div className="hand-section player-hand">
            <h3>You</h3>
            <div className="cards-row">{hand.map(renderCard)}</div>
            <div className="actions">
              <button onClick={handleHit}   disabled={!isYourTurn} className="action-btn">Hit</button>
              <button onClick={handleStand} disabled={!isYourTurn} className="action-btn">Stand</button>
            </div>
          </div>
        </div>

        <div className="seats-row">
          {Array.from({ length: 4 }).map((_, i) => {
            const p = players[i + 4];
            return (
              <div
                key={i + 4}
                className={`seat ${p ? 'occupied' : 'loading'} ${
                  currentTurn === p?.id ? 'turn' : ''
                }`}
              >
                {p && <span className="seat-name">{p.name}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {result && (
        <div className={`result result-${result.toLowerCase()}`}>
          {result}
        </div>
      )}
    </div>
  );
}
