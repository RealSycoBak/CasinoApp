const { v4: uuidv4 } = require('uuid');
const { BlackjackEngine } = require('../games/blackjack');

class GameRoom {
    constructor(gameType, maxPlayers = 8, minPlayers = 1) {
    this.id           = uuidv4();
    this.gameType     = gameType;
    this.maxPlayers   = maxPlayers;
    this.minPlayers   = minPlayers;
    this.players      = [];    // sockets in current round
    this.joinQueue    = [];    // sockets queued for next round
    this.status       = 'waiting';
    this.gameInstance = null;
    this._roundTimer  = null;
    this.bets         = new Map();    // ← initialize here
    this.donePlayers  = new Set();    // ← initialize here
  }

  addPlayer(socket, io) {
    socket.join(this.id);
    if (this.status === 'waiting') {
      this.players.push(socket);
    } else {
      this.joinQueue.push(socket);
    }

    io.to(this.id).emit('lobbyUpdate', {
      players: this.players.length,
      queued:  this.joinQueue.length,
      status:  this.status,
      names: [
        ...this.players,
        ...this.joinQueue
      ].map(s => ({ id: s.id, name: s.request?.user?.displayName || 'Player' }))
    });

    if (this.status === 'waiting' && this.players.length >= this.minPlayers) {
      this._startGame(io);
    }
    return true;
  }

  placeBet(socketId, amount, io) {
    if (!this.bets) return;
    this.bets.set(socketId, amount);

    // Broadcast bet update if desired:
    io.to(this.id).emit('betPlaced', {
      playerId: socketId,
      amount
    });

    // If everyone has bet, start dealing:
    if (this.bets.size === this.players.length) {
      this.beginRound(io);
    }
  }


 removePlayer(socketId, io) {
  // Check if the leaving socket was part of the active round
  const wasActive = this.players.some(s => s.id === socketId);

  // If they were active mid‐round, mark them done and advance turn
  if (this.gameInstance && wasActive) {
    this.gameInstance.donePlayers.add(socketId);
    this.gameInstance._advanceOrDealer();
  }

  // Remove them from active players and from the joinQueue
  this.players = this.players.filter(s => s.id !== socketId);
  this.joinQueue = this.joinQueue.filter(s => s.id !== socketId);

  // Broadcast updated lobby state (active + queued)
  io.to(this.id).emit('lobbyUpdate', {
    players: this.players.length,
    queued:  this.joinQueue.length,
    status:  this.status,
    names: [
      ...this.players,
      ...this.joinQueue
    ].map(s => ({
      id:   s.id,
      name: s.request?.user?.displayName || 'Player'
    }))
  });

  // If table is now empty, clear any pending timers
  if (!this.players.length && !this.joinQueue.length) {
    clearTimeout(this._roundTimer);
  }
}

   _startGame(io) {
    // 1) Enter the **betting phase**:
    this.status = 'betting';
    this.bets   = new Map();

    io.to(this.id).emit('lobbyUpdate', {
      players: this.players.length,
      queued:  this.joinQueue.length,
      status:  this.status,
      names:   this.players.map(s => ({ id: s.id, name: s.request.user.displayName }))
    });

    // Ask clients to place bets:
    io.to(this.id).emit('betStart', {
      min: 1,
      max: this.players.map(s => s.request.user.currency)  // optionally send each player's max
    });
  }

 beginRound(io) {
    // 2) All bets in—now deal cards:
    this.status = 'playing';
    io.to(this.id).emit('lobbyUpdate', {
      players: this.players.length,
      queued:  this.joinQueue.length,
      status:  this.status,
      names:   this.players.map(s => ({ id: s.id, name: s.request.user.displayName }))
    });

    // Initialize engine with bets
    this.gameInstance      = new BlackjackEngine(this.players, io, this.id);
    this.gameInstance.bets = this.bets;
    this.gameInstance.on('roundEnd', this._onRoundEnd.bind(this, io));

    this.gameInstance.start();
  }

  _onRoundEnd(io) {
    io.to(this.id).emit('roundOver');
    clearTimeout(this._roundTimer);
    this._roundTimer = setTimeout(() => {
      // Move queued players into next round:
      this.players   = this.players.concat(this.joinQueue);
      this.joinQueue = [];
      this.status    = this.players.length >= this.minPlayers ? 'betting' : 'waiting';

      io.to(this.id).emit('lobbyUpdate', {
        players: this.players.length,
        queued:  this.joinQueue.length,
        status:  this.status,
        names:   this.players.map(s => ({ id: s.id, name: s.request.user.displayName }))
      });

      if (this.status === 'betting') {
        this.bets = new Map();
        io.to(this.id).emit('betStart', { min: 1 });
      }
    }, 5000);
  }

}

module.exports = { GameRoom };
