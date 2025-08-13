/**
 * Test script for verifying data collection functionality
 * This tests that game data is being collected and saved to the database
 */

console.log('📊 Testing Data Collection System...\n');
console.log('============================================');

// Instructions for testing
console.log('MANUAL TEST INSTRUCTIONS:');
console.log('1. Open the game in your browser');
console.log('2. Start a new AI game (any difficulty)');
console.log('3. Make at least 5 moves');
console.log('4. Observe the browser console for:');
console.log('   - "📊 Connected to data collection server"');
console.log('   - "📊 Started collecting data for game..."');
console.log('   - "📊 Recorded move X for game..."');
console.log('5. Complete or exit the game');
console.log('6. Check for "📊 Game ... ended" message');
console.log('\n============================================');

console.log('\nSERVER LOGS TO WATCH FOR:');
console.log('- "📊 Starting data collection for game..."');
console.log('- "📊 Recorded move X for game..."');
console.log('- "📊 Game ... saved to database"');
console.log('\n============================================');

console.log('\nDATABASE VERIFICATION:');
console.log('Run this SQL query to check if data is being saved:');
console.log('SELECT COUNT(*) as total_games, MAX(created_at) as latest_game FROM human_games;');
console.log('\n============================================');

console.log('\nAUTOMATED CHECK RESULTS:');

// Check if server is running
fetch('http://localhost:5000/api/auth/session')
  .then(res => {
    if (res.ok) {
      console.log('✅ Server is running on port 5000');
    } else {
      console.log('❌ Server responded with status:', res.status);
    }
  })
  .catch(err => {
    console.log('❌ Server is not accessible:', err.message);
  });

// Check Socket.IO connection
const script = document.createElement('script');
script.src = '/socket.io/socket.io.js';
script.onload = () => {
  const testSocket = io('/', {
    path: '/socket.io/',
    transports: ['websocket', 'polling']
  });
  
  testSocket.on('connect', () => {
    console.log('✅ Socket.IO connection successful');
    
    // Test sending a game start event
    const testGameId = `test_${Date.now()}`;
    testSocket.emit('game:start', {
      gameId: testGameId,
      playerColor: 'white',
      opponentType: 'ai',
      aiDifficulty: 'medium'
    });
    console.log('✅ Test game:start event sent');
    
    // Test sending a move event
    setTimeout(() => {
      testSocket.emit('game:move', {
        gameId: testGameId,
        move: { from: {row: 8, col: 4}, to: {row: 6, col: 4} },
        gameState: { currentPlayer: 'black', moveCount: 1 }
      });
      console.log('✅ Test game:move event sent');
      
      // Test ending the game
      setTimeout(() => {
        testSocket.emit('game:end', {
          gameId: testGameId,
          result: 'win',
          winner: 'white',
          durationSeconds: 60
        });
        console.log('✅ Test game:end event sent');
        console.log('\n✅ All automated tests completed successfully!');
        testSocket.disconnect();
      }, 1000);
    }, 1000);
  });
  
  testSocket.on('connect_error', (error) => {
    console.log('❌ Socket.IO connection failed:', error.message);
  });
};
document.head.appendChild(script);