import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { SocketReconnectionManager } from '../utils/socketReconnection';

interface OnlinePlayer {
  userId: number;
  username: string;
  displayName: string;
  rating: number;
  status: 'online' | 'in-game' | 'in-queue';
}

interface GameInvite {
  from: OnlinePlayer;
  gameId: string;
  timeControl: number;
}

interface OnlineGame {
  gameId: string;
  opponent: {
    name: string;
    rating: number;
  };
  yourColor: 'white' | 'black';
  gameState: any;
  timeControl: number;
  yourTime: number;
  opponentTime: number;
  lastChecksum?: string;
  lastSyncTime?: number;
  syncErrors?: number;
}

interface MatchmakingStatus {
  inQueue: boolean;
  queuePosition?: number;
  estimatedWait?: number;
  status: 'idle' | 'searching' | 'found' | 'error';
}

interface MultiplayerState {
  // Connection
  socket: Socket | null;
  isConnected: boolean;
  connectionError: string | null;
  reconnectionManager: SocketReconnectionManager | null;
  reconnectAttempts: number;
  
  // Player data
  currentPlayer: OnlinePlayer | null;
  onlinePlayers: OnlinePlayer[];
  
  // Matchmaking
  matchmaking: MatchmakingStatus;
  
  // Current game
  currentGame: OnlineGame | null;
  
  // Server stats
  serverStats: {
    onlinePlayers: number;
    activeGames: number;
    serverTime: string;
  } | null;

  // Actions
  connect: (playerData: { userId: number; username: string; displayName: string; rating: number }) => void;
  disconnect: () => void;
  setCurrentGame: (game: OnlineGame | null) => void;
  joinMatchmaking: (timeControl?: number) => void;
  leaveMatchmaking: () => void;
  makeMove: (gameId: string, move: any) => void;
  resignGame: (gameId: string) => void;
  fetchServerStats: () => Promise<void>;
  
  // Event handlers
  onGameMatched: (callback: (game: OnlineGame) => void) => void;
  onGameMove: (callback: (move: any) => void) => void;
  onGameEnded: (callback: (result: any) => void) => void;
  onMatchmakingUpdate: (callback: (status: MatchmakingStatus) => void) => void;
}

// ✅ MULTIPLAYER FULLY ENABLED - Complete Socket.IO integration
// Make store globally accessible for other modules
const multiplayerStore = create<MultiplayerState>((set, get) => ({
  // Initial state
  socket: null,
  isConnected: false,
  connectionError: null,
  reconnectionManager: null,
  reconnectAttempts: 0,
  currentPlayer: null,
  onlinePlayers: [],
  matchmaking: {
    inQueue: false,
    status: 'idle'
  },
  currentGame: null,
  serverStats: null,

  // 🔌 Connection management
  connect: (playerData) => {
    const { socket, reconnectionManager } = get();
    if (socket?.connected) {
      console.log('🔌 Already connected to multiplayer server');
      return;
    }

    // Clean up old reconnection manager if exists
    if (reconnectionManager) {
      reconnectionManager.destroy();
    }

    console.log('🔌 Connecting to multiplayer server...');
    
    const newSocket = io('/', {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      forceNew: true,
      autoConnect: true,
      reconnection: false, // We handle reconnection manually
      auth: {
        userId: playerData.userId,
        username: playerData.username,
        displayName: playerData.displayName,
        rating: playerData.rating
      }
    });

    // Create reconnection manager
    const manager = new SocketReconnectionManager(newSocket, {
      maxRetries: 10,
      initialDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 1.5,
      onReconnecting: (attempt) => {
        console.log(`🔄 Reconnecting... Attempt ${attempt}/10`);
        set({ 
          connectionError: `Reconnecting... Attempt ${attempt}/10`,
          reconnectAttempts: attempt 
        });
      },
      onReconnected: () => {
        console.log('✅ Successfully reconnected!');
        set({ isConnected: true, connectionError: null, reconnectAttempts: 0 });
        
        // Send reconnect event with current game state and checksum
        const currentGame = get().currentGame;
        newSocket.emit('player:reconnect', {
          ...playerData,
          lastGameId: currentGame?.gameId,
          lastChecksum: currentGame?.lastChecksum
        });
      },
      onReconnectFailed: () => {
        console.error('❌ Failed to reconnect after max attempts');
        set({ 
          connectionError: 'Failed to reconnect. Please refresh the page.',
          isConnected: false 
        });
      }
    });

    set({ reconnectionManager: manager });

    // Connection events
    newSocket.on('connect', () => {
      console.log('🎮 Connected to multiplayer server');
      set({ socket: newSocket, isConnected: true, connectionError: null });
      
      // Check if this is a reconnection
      const attempts = get().reconnectAttempts;
      if (attempts > 0) {
        // This is a reconnection
        const currentGame = get().currentGame;
        newSocket.emit('player:reconnect', {
          ...playerData,
          lastGameId: currentGame?.gameId,
          lastChecksum: currentGame?.lastChecksum
        });
      } else {
        // Initial connection
        console.log('👤 Joining as player:', playerData);
        newSocket.emit('player:join', playerData);
      }
    });

    newSocket.on('connection:confirmed', (data) => {
      console.log('✅ Connection confirmed by server:', data);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from multiplayer server:', reason);
      set({ isConnected: false });
      
      // Reconnection manager will handle reconnection
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      set({ connectionError: error.message, isConnected: false });
    });

    // Player events
    newSocket.on('player:joined', (response) => {
      if (response.success) {
        console.log('✅ Player joined successfully');
        set({ currentPlayer: { ...playerData, status: 'online' } });
      } else {
        console.error('❌ Failed to join:', response.error);
        set({ connectionError: response.error });
      }
    });

    // Reconnection events
    newSocket.on('player:reconnected', (response) => {
      if (response.success) {
        console.log('✅ Player reconnected successfully');
        set({ currentPlayer: { ...playerData, status: 'online' } });
      }
    });

    newSocket.on('game:restored', (gameData) => {
      console.log('🎮 Game state restored after reconnection:', gameData);
      // Update current game state with restored data
      const currentGame = get().currentGame;
      if (currentGame && currentGame.gameId === gameData.gameId) {
        set({
          currentGame: {
            ...currentGame,
            gameState: gameData.gameState,
            yourTime: gameData.player1Time,
            opponentTime: gameData.player2Time
          }
        });
      }
    });

    // Enhanced state recovery handlers
    newSocket.on('game:state-recovered', (data: {
      gameId: string;
      gameState: any;
      checksum: string;
      currentTurn: 'white' | 'black';
      player1Time: number;
      player2Time: number;
    }) => {
      console.log('🔄 Game state recovered with checksum:', data.checksum);
      const currentGame = get().currentGame;
      if (currentGame && currentGame.gameId === data.gameId) {
        set({
          currentGame: {
            ...currentGame,
            gameState: data.gameState,
            lastChecksum: data.checksum,
            lastSyncTime: Date.now(),
            syncErrors: 0,
            yourTime: currentGame.yourColor === 'white' ? data.player1Time : data.player2Time,
            opponentTime: currentGame.yourColor === 'white' ? data.player2Time : data.player1Time
          }
        });
      }
    });

    // Handle state sync requirements
    newSocket.on('game:state-sync-required', (data: {
      serverChecksum: string;
      clientChecksum: string;
    }) => {
      console.warn('⚠️ State desync detected', { server: data.serverChecksum, client: data.clientChecksum });
      const currentGame = get().currentGame;
      if (currentGame) {
        // Increment sync error counter
        set({
          currentGame: {
            ...currentGame,
            syncErrors: (currentGame.syncErrors || 0) + 1
          }
        });
        
        // Request full state sync from server
        newSocket.emit('game:request-full-sync', {
          gameId: currentGame.gameId
        });
      }
    });

    // Handle reconnection success
    newSocket.on('reconnection:success', (data: {
      message: string;
      timestamp: number;
    }) => {
      console.log('✅ Reconnection confirmed:', data.message);
      set({ 
        connectionError: null,
        reconnectAttempts: 0
      });
    });

    // Matchmaking events
    newSocket.on('matchmaking:joined', (data) => {
      console.log('🎯 Joined matchmaking queue:', data);
      set({ 
        matchmaking: { 
          inQueue: true, 
          status: 'searching',
          queuePosition: data.queuePosition,
          estimatedWait: data.estimatedWait
        }
      });
    });

    newSocket.on('matchmaking:error', (data) => {
      console.error('❌ Matchmaking error:', data.message);
      set({ 
        matchmaking: { inQueue: false, status: 'error' },
        connectionError: data.message
      });
    });

    // Game events
    newSocket.on('game:matched', (gameData) => {
      console.log('🎮 Game matched!', gameData);
      set({ 
        currentGame: {
          gameId: gameData.gameId,
          opponent: gameData.opponent,
          yourColor: gameData.yourColor,
          gameState: gameData.gameState,
          timeControl: gameData.timeControl || 600,
          yourTime: gameData.yourColor === 'white' ? gameData.player1Time || 600 : gameData.player2Time || 600,
          opponentTime: gameData.yourColor === 'white' ? gameData.player2Time || 600 : gameData.player1Time || 600
        },
        matchmaking: { inQueue: false, status: 'found' }
      });
    });

    newSocket.on('game:move', (data) => {
      console.log('🔄 Game move received:', data);
      const { currentGame } = get();
      if (currentGame && currentGame.gameId === data.gameId) {
        set({
          currentGame: {
            ...currentGame,
            gameState: data.gameState
          }
        });
      }
    });

    newSocket.on('game:error', (data) => {
      console.error('❌ Game error:', data.message);
      set({ connectionError: data.message });
    });

    set({ socket: newSocket });
  },

  disconnect: () => {
    const { socket, reconnectionManager } = get();
    if (socket) {
      console.log('🔌 Disconnecting from multiplayer server');
      
      // Clean up reconnection manager
      if (reconnectionManager) {
        reconnectionManager.destroy();
      }
      
      socket.disconnect();
      set({ 
        socket: null, 
        isConnected: false, 
        currentPlayer: null,
        currentGame: null,
        matchmaking: { inQueue: false, status: 'idle' },
        reconnectionManager: null,
        reconnectAttempts: 0
      });
    }
  },

  setCurrentGame: (game) => {
    console.log('🎮 Setting current game:', game);
    set({ currentGame: game });
  },
  
  joinMatchmaking: (timeControl = 600) => {
    const { socket, isConnected } = get();
    if (!socket || !isConnected) {
      console.error('❌ Not connected to server');
      return;
    }

    console.log('🎯 Joining matchmaking queue...');
    socket.emit('matchmaking:join', { timeControl });
    set({ 
      matchmaking: { inQueue: true, status: 'searching' }
    });
  },
  
  leaveMatchmaking: () => {
    const { socket, isConnected } = get();
    if (!socket || !isConnected) return;

    console.log('🚪 Leaving matchmaking queue...');
    socket.emit('matchmaking:leave');
    set({ 
      matchmaking: { inQueue: false, status: 'idle' }
    });
  },
  
  makeMove: (gameId, move) => {
    const { socket, isConnected } = get();
    if (!socket || !isConnected) {
      console.error('❌ Not connected to server');
      return;
    }

    console.log('♟️ Making move:', move);
    socket.emit('game:move', { gameId, move });
  },
  
  resignGame: (gameId) => {
    const { socket, isConnected } = get();
    if (!socket || !isConnected) return;

    console.log('🏳️ Resigning game');
    socket.emit('game:resign', { gameId });
    set({ currentGame: null });
  },
  
  fetchServerStats: async () => {
    try {
      // Fetch server stats from API
      const response = await fetch('/api/multiplayer/stats');
      const stats = await response.json();
      set({ serverStats: stats });
    } catch (error) {
      console.error('❌ Failed to fetch server stats:', error);
    }
  },

  // Event handlers for components
  onGameMatched: (callback) => {
    const { socket } = get();
    if (socket) {
      socket.on('game:matched', callback);
      return () => socket.off('game:matched', callback);
    }
  },

  onGameMove: (callback) => {
    const { socket } = get();
    if (socket) {
      socket.on('game:move', callback);
      return () => socket.off('game:move', callback);
    }
  },

  onGameEnded: (callback) => {
    const { socket } = get();
    if (socket) {
      socket.on('game:ended', callback);
      return () => socket.off('game:ended', callback);
    }
  },

  onMatchmakingUpdate: (callback) => {
    const { socket } = get();
    if (socket) {
      socket.on('matchmaking:update', callback);
      return () => socket.off('matchmaking:update', callback);
    }
  }
}));

// Export the store
export const useMultiplayer = multiplayerStore;

// Make it globally accessible for other modules
if (typeof window !== 'undefined') {
  (window as any).multiplayerStore = multiplayerStore;
}