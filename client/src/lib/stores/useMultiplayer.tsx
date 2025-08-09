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

// MULTIPLAYER TEMPORARILY DISABLED - Store functionality commented out
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

  // MULTIPLAYER DISABLED - Connection functionality disabled
  connect: (playerData) => {
    console.log('🚫 Multiplayer temporarily disabled');
    return;
  },

  // MULTIPLAYER DISABLED - All functions disabled
  disconnect: () => {
    console.log('🚫 Multiplayer temporarily disabled');
  },
  
  joinMatchmaking: (timeControl = 600) => {
    console.log('🚫 Multiplayer temporarily disabled');
  },
  
  leaveMatchmaking: () => {
    console.log('🚫 Multiplayer temporarily disabled');
  },
  
  makeMove: (gameId, move) => {
    console.log('🚫 Multiplayer temporarily disabled');
  },
  
  resignGame: (gameId) => {
    console.log('🚫 Multiplayer temporarily disabled');
  },
  
  fetchServerStats: async () => {
    console.log('🚫 Multiplayer temporarily disabled');
  },

  // Event handlers disabled  
  onGameMatched: (callback) => {
    console.log('🚫 Multiplayer temporarily disabled');
  },

  onGameMove: (callback) => {
    console.log('🚫 Multiplayer temporarily disabled');
  },

  onGameEnded: (callback) => {
    console.log('🚫 Multiplayer temporarily disabled');
  },

  onMatchmakingUpdate: (callback) => {
    console.log('🚫 Multiplayer temporarily disabled');
  }
}));