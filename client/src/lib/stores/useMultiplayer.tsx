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

  // Connect to multiplayer server
  connect: (playerData) => {
    const state = get();
    if (state.socket?.connected) {
      console.log('Already connected to multiplayer server');
      return;
    }

    try {
      const socket = io({
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      socket.on('connect', () => {
        console.log('🔌 Connected to multiplayer server');
        set({ 
          isConnected: true, 
          connectionError: null,
          currentPlayer: { ...playerData, status: 'online' }
        });
        
        // Join as player
        socket.emit('player:join', playerData);
      });

      socket.on('disconnect', () => {
        console.log('🔌 Disconnected from multiplayer server');
        set({ 
          isConnected: false,
          matchmaking: { inQueue: false, status: 'idle' },
          currentGame: null
        });
      });

      socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        set({ 
          connectionError: error.message,
          isConnected: false 
        });
      });

      socket.on('player:joined', (response) => {
        if (response.success) {
          console.log('✅ Successfully joined multiplayer server');
        } else {
          console.error('❌ Failed to join:', response.error);
          set({ connectionError: response.error });
        }
      });

      socket.on('matchmaking:joined', (data) => {
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

      socket.on('matchmaking:left', () => {
        console.log('🎯 Left matchmaking queue');
        set({
          matchmaking: { inQueue: false, status: 'idle' }
        });
      });

      socket.on('matchmaking:error', (data) => {
        console.error('❌ Matchmaking error:', data.message);
        set({
          matchmaking: { inQueue: false, status: 'error' },
          connectionError: data.message
        });
      });

      socket.on('game:matched', (gameData) => {
        console.log('🎮 Game matched!', gameData);
        set({
          currentGame: gameData,
          matchmaking: { inQueue: false, status: 'idle' }
        });
      });

      socket.on('game:move', (data) => {
        const state = get();
        if (state.currentGame) {
          set({
            currentGame: {
              ...state.currentGame,
              gameState: data.gameState
            }
          });
        }
      });

      socket.on('game:ended', (data) => {
        console.log('🏁 Game ended:', data);
        set({ currentGame: null });
      });

      socket.on('game:error', (data) => {
        console.error('❌ Game error:', data.message);
        set({ connectionError: data.message });
      });

      set({ socket });
      
    } catch (error) {
      console.error('Failed to connect to multiplayer server:', error);
      set({ connectionError: 'Failed to connect to server' });
    }
  },

  // Disconnect from server
  disconnect: () => {
    const state = get();
    if (state.socket) {
      state.socket.disconnect();
      set({ 
        socket: null, 
        isConnected: false,
        currentPlayer: null,
        currentGame: null,
        matchmaking: { inQueue: false, status: 'idle' }
      });
    }
  },

  // Join matchmaking queue
  joinMatchmaking: (timeControl = 600) => {
    const state = get();
    if (!state.socket?.connected) {
      set({ connectionError: 'Not connected to server' });
      return;
    }

    state.socket.emit('matchmaking:join', { timeControl });
  },

  // Leave matchmaking queue
  leaveMatchmaking: () => {
    const state = get();
    if (state.socket?.connected) {
      state.socket.emit('matchmaking:leave');
    }
  },

  // Make a move in the current game
  makeMove: (gameId, move) => {
    const state = get();
    if (state.socket?.connected) {
      state.socket.emit('game:move', { gameId, move });
    }
  },

  // Resign the current game
  resignGame: (gameId) => {
    const state = get();
    if (state.socket?.connected) {
      state.socket.emit('game:resign', { gameId });
    }
  },

  // Fetch server statistics
  fetchServerStats: async () => {
    try {
      const response = await fetch('/api/server-stats');
      if (response.ok) {
        const stats = await response.json();
        set({ serverStats: stats });
      }
    } catch (error) {
      console.error('Failed to fetch server stats:', error);
    }
  },

  // Event handler setup methods
  onGameMatched: (callback) => {
    const state = get();
    if (state.socket) {
      state.socket.on('game:matched', callback);
    }
  },

  onGameMove: (callback) => {
    const state = get();
    if (state.socket) {
      state.socket.on('game:move', callback);
    }
  },

  onGameEnded: (callback) => {
    const state = get();
    if (state.socket) {
      state.socket.on('game:ended', callback);
    }
  },

  onMatchmakingUpdate: (callback) => {
    const state = get();
    if (state.socket) {
      state.socket.on('matchmaking:joined', (data) => {
        callback({
          inQueue: true,
          status: 'searching',
          queuePosition: data.queuePosition,
          estimatedWait: data.estimatedWait
        });
      });
    }
  }
}));