import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

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
export const useMultiplayer = create<MultiplayerState>((set, get) => ({
  // Initial state
  socket: null,
  isConnected: false,
  connectionError: null,
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
    const { socket } = get();
    if (socket?.connected) {
      console.log('🔌 Already connected to multiplayer server');
      return;
    }

    console.log('🔌 Connecting to multiplayer server...');
    
    const newSocket = io('/', {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      forceNew: true,
      autoConnect: true,
      auth: {
        userId: playerData.userId,
        username: playerData.username,
        displayName: playerData.displayName,
        rating: playerData.rating
      }
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('🎮 Connected to multiplayer server');
      set({ socket: newSocket, isConnected: true, connectionError: null });
      
      // Join as player
      console.log('👤 Joining as player:', playerData);
      newSocket.emit('player:join', playerData);
    });

    newSocket.on('connection:confirmed', (data) => {
      console.log('✅ Connection confirmed by server:', data);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from multiplayer server');
      set({ isConnected: false });
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
    const { socket } = get();
    if (socket) {
      console.log('🔌 Disconnecting from multiplayer server');
      socket.disconnect();
      set({ 
        socket: null, 
        isConnected: false, 
        currentPlayer: null,
        currentGame: null,
        matchmaking: { inQueue: false, status: 'idle' }
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