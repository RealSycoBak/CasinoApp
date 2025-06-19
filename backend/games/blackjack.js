const EventEmitter = require('events');
const User         = require('../models/User');  // Mongoose model

const suits  = ['hearts','diamonds','clubs','spades'];
const values = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];

  class BlackjackEngine extends EventEmitter {
  constructor(players, io, roomId) {
    super();
    this.players      = players;
    this.io           = io;
    this.roomId       = roomId;
    this.decks        = [];
    for (let d = 0; d < 4; d++) this.decks.push(...this._createDeck());
    this._shuffle(this.decks);
    
    this.hands        = new Map();
    this.dealerHand   = [];
    this.currentIndex = 0;
    this.donePlayers  = new Set();
    this.bets         = new Map();
  }


  _createDeck() {
    const deck = [];
    for (const s of suits) for (const v of values)
      deck.push({ suit: s, value: v });
    return deck;
  }

  _shuffle(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }

  start() {
    // initial deal
    this.players.forEach(sock => {
      const c1 = this.decks.pop(), c2 = this.decks.pop();
      this.hands.set(sock.id, [c1, c2]);
      sock.emit('blackjackStart', { hand: [c1, c2] });
    });
    this.dealerHand.push(this.decks.pop());
    this._nextTurn();
  }

  _nextTurn() {
    // skip done players
    while (this.donePlayers.has(this.players[this.currentIndex].id)) {
      this.currentIndex = (this.currentIndex + 1) % this.players.length;
    }
    const current = this.players[this.currentIndex];
    this.io.to(this.roomId).emit('turnStart', {
      playerId: current.id,
      name: current.request?.user?.displayName || 'Player'
    });
    current.emit('yourTurn');
  }

  playerHit(socket) {
    const hand = this.hands.get(socket.id);
    const card = this.decks.pop();
    hand.push(card);
    socket.emit('cardDealt', { card });

    if (this._calcValue(hand) > 21) {
      this.donePlayers.add(socket.id);
      socket.emit('bust');
      this._advanceOrDealer();
    } else {
      socket.emit('yourTurn');
    }
  }

  playerStand(socket) {
    this.donePlayers.add(socket.id);
    socket.emit('standAck');
    this._advanceOrDealer();
  }

  _advanceOrDealer() {
    if (this.donePlayers.size === this.players.length) {
      this._dealerPlay();
    } else {
      this.currentIndex = (this.currentIndex + 1) % this.players.length;
      this._nextTurn();
    }
  }

  _dealerPlay() {
    while (this._calcValue(this.dealerHand) < 17) {
      this.dealerHand.push(this.decks.pop());
    }
    this._endGame();
  }

     async _endGame() {
  const dealerVal = this._calcValue(this.dealerHand);

  await Promise.all(this.players.map(async sock => {
    const pid  = sock.id;
    const hand = this.hands.get(pid) || [];
    const pv   = this._calcValue(hand);
    const bet  = this.bets.get(pid) || 0;

    // Compute net delta relative to pre‐bet balance
    let result = 'lose';
    let delta  = -bet;   // default: you lose your stake

    if (pv > 21) {
      result = 'lose'; // delta stays -bet
    } else if (dealerVal > 21 || pv > dealerVal) {
      result = 'win';
      delta  = +bet;    // net +bet = win
    } else if (pv === dealerVal) {
      result = 'push';
      delta  = 0;       // push = no change
    }

    // Apply the SINGLE currency update here
    const userId = sock.request?.user?.userId;
    const user   = await User.findByIdAndUpdate(
      userId,
      { $inc: { currency: delta } },
      { new: true }
    );

    // Notify client
    sock.emit('gameOver',    { result, yourHand: hand, dealerHand: this.dealerHand });
    sock.emit('currencyUpdate', { currency: user.currency });
  }));

  this.emit('roundEnd');
}


  _calcValue(cards) {
    let val = 0, aces = 0;
    cards.forEach(c => {
      if (c.value === 'A') aces++;
      else if (['K','Q','J'].includes(c.value)) val += 10;
      else val += parseInt(c.value, 10);
    });
    for (let i = 0; i < aces; i++) {
      val += (val + 11 <= 21 ? 11 : 1);
    }
    return val;
  }
}

module.exports = { BlackjackEngine };
