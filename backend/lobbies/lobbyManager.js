const { GameRoom } = require('./gameRoom');

class LobbyManager {
  constructor() {
    this.lobbies = new Map(); // lobbyId → GameRoom
  }

  createLobby(gameType) {
    const room = new GameRoom(gameType);
    this.lobbies.set(room.id, room);
    return room;
  }

  getLobby(id) {
    return this.lobbies.get(id);
  }

  getAvailableLobby(gameType) {
    for (const room of this.lobbies.values()) {
      if (
        room.gameType === gameType &&
        room.players.length + room.joinQueue.length < room.maxPlayers
      ) {
        return room;
      }
    }
    return null;
  }

  removePlayer(socketId, io) {
    for (const [id, room] of this.lobbies.entries()) {
      room.removePlayer(socketId, io);
      if (!room.players.length && !room.joinQueue.length) {
        this.lobbies.delete(id);
      }
    }
  }
}

module.exports = { lobbyManager: new LobbyManager() };
