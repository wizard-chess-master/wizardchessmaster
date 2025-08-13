// Direct Socket.IO test for data collection
const io = require('socket.io-client');

console.log('📊 Testing Direct Socket.IO Data Collection...\n');

const socket = io('http://localhost:5000', {
  path: '/socket.io/',
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('✅ Connected to server');
  
  const gameId = `direct_test_${Date.now()}`;
  
  // Emit game start
  socket.emit('game:start', {
    gameId: gameId,
    playerColor: 'white',
    opponentType: 'ai',
    aiDifficulty: 'hard'
  });
  console.log(`📤 Sent game:start for ${gameId}`);
  
  // Emit a few moves
  setTimeout(() => {
    socket.emit('game:move', {
      gameId: gameId,
      move: { from: {row: 8, col: 4}, to: {row: 6, col: 4} },
      gameState: { moveCount: 1 }
    });
    console.log('📤 Sent move 1');
  }, 500);
  
  setTimeout(() => {
    socket.emit('game:move', {
      gameId: gameId,
      move: { from: {row: 1, col: 4}, to: {row: 3, col: 4} },
      gameState: { moveCount: 2 }
    });
    console.log('📤 Sent move 2');
  }, 1000);
  
  // End game
  setTimeout(() => {
    socket.emit('game:end', {
      gameId: gameId,
      result: 'win',
      winner: 'white',
      durationSeconds: 60
    });
    console.log('📤 Sent game:end');
    
    setTimeout(() => {
      console.log('✅ Test complete, disconnecting...');
      socket.disconnect();
      process.exit(0);
    }, 1000);
  }, 1500);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
  process.exit(1);
});

socket.on('error', (error) => {
  console.error('❌ Socket error:', error);
});