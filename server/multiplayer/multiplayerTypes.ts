export interface Player {
  id: string;
  socketId: string;
  username: string;
  rating: number;
  isPremium: boolean;
  status: 'online' | 'in-game' | 'in-room' | 'away';
  joinedAt: Date;
  roomId?: string;
}

export interface GameRoom {
  id: string;
  hostPlayer: {
    id: string;
    username: string;
    rating: number;
    isPremium: boolean;
  };
  guestPlayer?: {
    id: string;
    username: string;
    rating: number;
    isPremium: boolean;
  };
  gameMode: 'casual' | 'ranked' | 'tournament';
  timeControl: '5+0' | '10+0' | '15+10' | '30+0';
  isPrivate: boolean;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: Date;
  gameState: any | null;
}

export interface MatchmakingQueue {
  playerId: string;
  rating: number;
  gameMode: string;
  timeControl: string;
  joinedAt: Date;
}

export interface GameMove {
  from: string;
  to: string;
  piece: string;
  captured?: string;
  promotion?: string;
  timestamp: Date;
}

export interface GameState {
  board: any[][];
  currentPlayer: 'white' | 'black';
  moveHistory: GameMove[];
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  timeLeft: {
    white: number;
    black: number;
  };
  lastMoveTime: Date;
}