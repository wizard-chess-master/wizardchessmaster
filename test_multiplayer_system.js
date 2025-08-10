// Comprehensive Multiplayer System Test
import { io } from 'socket.io-client';

console.log('🧪 Starting Wizard Chess Multiplayer System Test');

async function testMultiplayerSystem() {
  try {
    // Test 1: API Endpoints
    console.log('\n📡 Testing API Endpoints...');
    
    const statsResponse = await fetch('http://localhost:5000/api/multiplayer/stats');
    const stats = await statsResponse.json();
    console.log('✅ Server stats:', stats);
    
    const leaderboardResponse = await fetch('http://localhost:5000/api/multiplayer/leaderboard');
    const leaderboard = await leaderboardResponse.json();
    console.log('✅ Leaderboard:', leaderboard);
    
    // Test 2: Socket.IO Connection
    console.log('\n🔌 Testing Socket.IO Connection...');
    
    const socket1 = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      timeout: 5000
    });
    
    const socket2 = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      timeout: 5000
    });
    
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Connection timeout')), 10000);
      
      let connectedCount = 0;
      
      socket1.on('connect', () => {
        console.log('✅ Socket 1 connected');
        connectedCount++;
        if (connectedCount === 2) {
          clearTimeout(timeout);
          resolve();
        }
      });
      
      socket2.on('connect', () => {
        console.log('✅ Socket 2 connected');
        connectedCount++;
        if (connectedCount === 2) {
          clearTimeout(timeout);
          resolve();
        }
      });
      
      socket1.on('connect_error', (error) => {
        console.error('❌ Socket 1 connection error:', error);
        clearTimeout(timeout);
        reject(error);
      });
      
      socket2.on('connect_error', (error) => {
        console.error('❌ Socket 2 connection error:', error);
        clearTimeout(timeout);
        reject(error);
      });
    });
    
    // Test 3: Player Registration
    console.log('\n👥 Testing Player Registration...');
    
    const player1Data = {
      userId: 1001,
      username: 'TestPlayer1',
      displayName: 'Test Player One',
      rating: 1200
    };
    
    const player2Data = {
      userId: 1002,
      username: 'TestPlayer2', 
      displayName: 'Test Player Two',
      rating: 1250
    };
    
    socket1.emit('player:join', player1Data);
    socket2.emit('player:join', player2Data);
    
    await new Promise((resolve) => {
      let joinedCount = 0;
      
      socket1.on('player:joined', (response) => {
        console.log('✅ Player 1 joined:', response);
        joinedCount++;
        if (joinedCount === 2) resolve();
      });
      
      socket2.on('player:joined', (response) => {
        console.log('✅ Player 2 joined:', response);
        joinedCount++;
        if (joinedCount === 2) resolve();
      });
    });
    
    // Test 4: Matchmaking
    console.log('\n🎯 Testing Matchmaking System...');
    
    socket1.emit('matchmaking:join', { timeControl: 600 });
    socket2.emit('matchmaking:join', { timeControl: 600 });
    
    await new Promise((resolve) => {
      let matchedCount = 0;
      
      socket1.on('game:matched', (gameData) => {
        console.log('✅ Player 1 matched:', gameData);
        matchedCount++;
        if (matchedCount === 2) resolve();
      });
      
      socket2.on('game:matched', (gameData) => {
        console.log('✅ Player 2 matched:', gameData);
        matchedCount++;
        if (matchedCount === 2) resolve();
      });
    });
    
    console.log('\n🎉 All multiplayer tests passed successfully!');
    
    // Cleanup
    socket1.disconnect();
    socket2.disconnect();
    
  } catch (error) {
    console.error('❌ Multiplayer test failed:', error);
    process.exit(1);
  }
}

// Run tests
testMultiplayerSystem().then(() => {
  console.log('✅ Test suite completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test suite failed:', error);
  process.exit(1);
});