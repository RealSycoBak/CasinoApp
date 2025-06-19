const { Server } = require('socket.io');
const { lobbyManager } = require('./lobbies/lobbyManager');

function setupSocket(server) {
  const io = new Server(server, {
    cors: { origin: 'http://localhost:5173', credentials: true }
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('joinGame', ({ gameType, displayName, userId }) => {
  socket.request.user = { displayName, userId };
      let lobby = lobbyManager.getAvailableLobby(gameType);
      if (!lobby) lobby = lobbyManager.createLobby(gameType);

      const ok = lobby.addPlayer(socket, io);
      if (!ok) socket.emit('error', { message: 'Table is full' });
      else    socket.emit('lobbyJoined', { lobbyId: lobby.id });
    });

    socket.on('hit', ({ lobbyId }) => {
  console.log('[SERVER] Received hit from', socket.id, 'in lobby', lobbyId);
  const room = lobbyManager.getLobby(lobbyId);
  if (room && room.gameInstance) room.gameInstance.playerHit(socket);
});

socket.on('stand', ({ lobbyId }) => {
  console.log('[SERVER] Received stand from', socket.id, 'in lobby', lobbyId);
  const room = lobbyManager.getLobby(lobbyId);
  if (room && room.gameInstance) room.gameInstance.playerStand(socket);
});
    
  socket.on('placeBet', ({ lobbyId, amount }) => {
    console.log('[SERVER] placeBet from', socket.id, 'lobby:', lobbyId, 'amount:', amount);
    const room = lobbyManager.getLobby(lobbyId);
if (room && room.status === 'betting') {
  room.placeBet(socket.id, amount, io);
}
  });



    socket.on('leaveGame', ({ lobbyId }) => {
      const room = lobbyManager.getLobby(lobbyId);
      if (room) {
        room.removePlayer(socket.id, io);
        socket.leave(lobbyId);
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnect:', socket.id);
      lobbyManager.removePlayer(socket.id, io);
    });
  });

  return io;
}

module.exports = { setupSocket };
