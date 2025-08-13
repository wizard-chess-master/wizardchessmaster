import { io } from 'socket.io-client';

console.log('📊 Testing Data Collection System...\n');

const socket = io('http://localhost:5000', {
  path: '/socket.io/',
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('✅ Connected to server');
  
  const gameId = `node_test_${Date.now()}`;
  
  // Start game
  socket.emit('game:start', {
    gameId: gameId,
    playerColor: 'white',
    opponentType: 'ai',
    aiDifficulty: 'hard'
  });
  console.log(`📤 Sent game:start for ${gameId}`);
  
  // Send 2 moves
  setTimeout(() => {
    socket.emit('game:move', {
      gameId: gameId,
      move: { from: {row: 8, col: 4}, to: {row: 6, col: 4} },
      gameState: { currentPlayer: 'black', moveCount: 1 }
    });
    console.log('📤 Sent move 1: e2-e4');
  }, 500);
  
  setTimeout(() => {
    socket.emit('game:move', {
      gameId: gameId,
      move: { from: {row: 1, col: 4}, to: {row: 3, col: 4} },
      gameState: { currentPlayer: 'white', moveCount: 2 }
    });
    console.log('📤 Sent move 2: e7-e5');
  }, 1000);
  
  // End game
  setTimeout(() => {
    socket.emit('game:end', {
      gameId: gameId,
      result: 'win',
      winner: 'white',
      durationSeconds: 30
    });
    console.log('📤 Sent game:end (White wins)');
    console.log('✅ Test complete!');
    
    setTimeout(() => {
      socket.disconnect();
      process.exit(0);
    }, 500);
  }, 1500);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
  process.exit(1);
});

socket.on('ping', () => {
  socket.emit('pong');
});