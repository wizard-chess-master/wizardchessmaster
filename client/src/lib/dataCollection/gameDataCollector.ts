/**
 * Game Data Collector for AI Training
 * Sends gameplay data to server for collection
 */

import { io, Socket } from 'socket.io-client';
import { GameState, ChessMove } from '../chess/types';

class GameDataCollector {
  private socket: Socket | null = null;
  private currentGameId: string | null = null;
  private gameStartTime: number = 0;
  private isCollecting: boolean = false;

  constructor() {
    this.initSocket();
  }

  private initSocket() {
    // Connect to the Socket.IO server
    this.socket = io('/', {
      path: '/socket.io/',
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('📊 Connected to data collection server');
    });
    
    // Handle heartbeat to prevent disconnection
    this.socket.on('ping', () => {
      this.socket.emit('pong');
    });

    this.socket.on('disconnect', () => {
      console.log('📊 Disconnected from data collection server');
    });
  }

  // Start collecting data for a new game
  startGameCollection(
    gameId: string,
    playerColor: 'white' | 'black',
    opponentType: 'ai' | 'human',
    aiDifficulty?: string
  ) {
    if (!this.socket) return;
    
    this.currentGameId = gameId;
    this.gameStartTime = Date.now();
    this.isCollecting = true;

    this.socket.emit('game:start', {
      gameId,
      playerColor,
      opponentType,
      aiDifficulty
    });

    console.log(`📊 Started collecting data for game ${gameId}`);
  }

  // Record a move
  recordMove(move: ChessMove, gameState: GameState) {
    if (!this.socket || !this.isCollecting || !this.currentGameId) return;

    this.socket.emit('game:move', {
      gameId: this.currentGameId,
      move: {
        from: move.from,
        to: move.to,
        piece: move.piece?.type,
        captured: move.captured?.type,
        promotion: move.promotion,
        timestamp: Date.now()
      },
      gameState: {
        board: gameState.board,
        currentPlayer: gameState.currentPlayer,
        isInCheck: gameState.isInCheck,
        moveCount: gameState.moveHistory.length
      }
    });

    console.log(`📊 Recorded move ${gameState.moveHistory.length} for game ${this.currentGameId}`);
  }

  // End game and save data
  endGameCollection(
    result: 'win' | 'loss' | 'draw',
    winner?: 'white' | 'black'
  ) {
    if (!this.socket || !this.isCollecting || !this.currentGameId) return;

    const durationSeconds = Math.floor((Date.now() - this.gameStartTime) / 1000);

    this.socket.emit('game:end', {
      gameId: this.currentGameId,
      result,
      winner,
      durationSeconds
    });

    console.log(`📊 Game ${this.currentGameId} ended: ${result} in ${durationSeconds}s`);

    // Reset state
    this.currentGameId = null;
    this.gameStartTime = 0;
    this.isCollecting = false;
  }

  // Check if currently collecting
  isCollectingData(): boolean {
    return this.isCollecting;
  }

  // Get connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Cleanup
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

// Create singleton instance
const gameDataCollector = new GameDataCollector();

export default gameDataCollector;