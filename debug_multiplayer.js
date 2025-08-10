// Debug Multiplayer System - Quick Socket Test
import { io } from 'socket.io-client';

async function debugSocketConnection() {
  console.log('🔧 Debugging Socket.IO Connection...');
  
  const socket = io('http://localhost:5000', {
    transports: ['polling'], // Start with polling to avoid websocket issues
    timeout: 5000
  });
  
  socket.on('connect', () => {
    console.log('✅ Socket connected successfully:', socket.id);
    
    // Test player join
    socket.emit('player:join', {
      userId: 1001,
      username: 'DebugPlayer',
      displayName: 'Debug Player',
      rating: 1200
    });
  });
  
  socket.on('player:joined', (response) => {
    console.log('✅ Player joined response:', response);
    
    // Test matchmaking
    socket.emit('matchmaking:join', { timeControl: 600 });
  });
  
  socket.on('matchmaking:joined', (data) => {
    console.log('✅ Matchmaking joined:', data);
    socket.disconnect();
  });
  
  socket.on('connect_error', (error) => {
    console.error('❌ Connection error:', error.message);
  });
  
  socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
  });
  
  setTimeout(() => {
    console.log('⏰ Test timeout - disconnecting');
    socket.disconnect();
    process.exit(0);
  }, 10000);
}

debugSocketConnection();