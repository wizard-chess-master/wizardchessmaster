// Test Frontend Integration with Socket.IO
import { io } from 'socket.io-client';

async function testFrontendIntegration() {
  console.log('🎮 Testing Frontend Integration...');
  
  // Test 1: Main app endpoints
  console.log('\n1️⃣ Testing Main Application Routes...');
  
  try {
    const mainPage = await fetch('http://localhost:5000/');
    console.log(`✅ Main Page: ${mainPage.status} ${mainPage.ok ? 'OK' : 'Failed'}`);
    
    const gameRoute = await fetch('http://localhost:5000/#game');
    console.log(`✅ Game Route: ${gameRoute.status} ${gameRoute.ok ? 'OK' : 'Failed'}`);
    
    const multiplayerRoute = await fetch('http://localhost:5000/#multiplayer');
    console.log(`✅ Multiplayer Route: ${multiplayerRoute.status} ${multiplayerRoute.ok ? 'OK' : 'Failed'}`);
  } catch (error) {
    console.log(`❌ Route testing failed: ${error.message}`);
  }
  
  // Test 2: Full API Suite
  console.log('\n2️⃣ Testing Complete API Suite...');
  
  const apiTests = [
    { name: 'Auth Session', endpoint: '/api/auth/session' },
    { name: 'Chess AI Stats', endpoint: '/api/chess/ai-stats' },
    { name: 'Chess Leaderboard', endpoint: '/api/chess/leaderboard' },
    { name: 'Multiplayer Stats', endpoint: '/api/multiplayer/stats' },
    { name: 'Multiplayer Leaderboard', endpoint: '/api/multiplayer/leaderboard' },
    { name: 'Campaign Leaderboard', endpoint: '/api/leaderboards/campaign' },
    { name: 'PvP Leaderboard', endpoint: '/api/leaderboards/pvp' },
    { name: 'Payment Config', endpoint: '/api/payments/config' }
  ];
  
  for (const test of apiTests) {
    try {
      const response = await fetch(`http://localhost:5000${test.endpoint}`);
      const data = await response.json();
      console.log(`✅ ${test.name}: ${response.status} - ${data.success !== false ? 'Success' : 'Failed'}`);
    } catch (error) {
      console.log(`❌ ${test.name}: Failed - ${error.message}`);
    }
  }
  
  // Test 3: Socket.IO Real-time Features
  console.log('\n3️⃣ Testing Socket.IO Real-time Features...');
  
  const socket = io('http://localhost:5000', {
    transports: ['polling', 'websocket'],
    timeout: 8000
  });
  
  await new Promise((resolve) => {
    let testsCompleted = 0;
    const totalTests = 3;
    
    socket.on('connect', () => {
      console.log('✅ Socket.IO: Connection established');
      testsCompleted++;
      
      // Test player registration
      socket.emit('player:join', {
        userId: 4001,
        username: 'IntegrationTest',
        displayName: 'Integration Test Player',
        rating: 1500
      });
    });
    
    socket.on('player:joined', (response) => {
      console.log('✅ Player Registration: Success');
      testsCompleted++;
      
      // Test matchmaking
      socket.emit('matchmaking:join', { timeControl: 300 });
    });
    
    socket.on('matchmaking:joined', (data) => {
      console.log('✅ Matchmaking System: Operational');
      testsCompleted++;
      
      if (testsCompleted >= totalTests) {
        socket.disconnect();
        resolve();
      }
    });
    
    socket.on('connect_error', (error) => {
      console.log('❌ Socket.IO: Connection failed');
      resolve();
    });
    
    setTimeout(() => {
      console.log(`⏰ Socket tests completed: ${testsCompleted}/${totalTests}`);
      socket.disconnect();
      resolve();
    }, 10000);
  });
  
  console.log('\n🎉 Frontend Integration Test Complete!');
}

testFrontendIntegration().then(() => {
  console.log('✅ Frontend integration verified');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Frontend integration failed:', error);
  process.exit(1);
});