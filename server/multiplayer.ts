import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { getDB } from './storage';
import { onlineGames, matchmakingQueue, users } from '../shared/schema';
import { eq, and, or } from 'drizzle-orm';

interface PlayerData {
  userId: number;
  username: string;
  displayName: string;
  rating: number;
  socketId: string;
}

interface GameData {
  gameId: string;
  player1: PlayerData;
  player2: PlayerData;
  gameState: any;
  currentTurn: 'white' | 'black';
  timeControl?: number;
  player1Time?: number;
  player2Time?: number;
}

class MultiplayerManager {
  private io: SocketServer;
  private connectedPlayers: Map<string, PlayerData> = new Map();
  private activeGames: Map<string, GameData> = new Map();
  private matchmakingQueue: PlayerData[] = [];

  constructor(io: SocketServer) {
    this.io = io;
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);
      
      // Send immediate confirmation
      socket.emit('connection:confirmed', { socketId: socket.id, timestamp: Date.now() });

      socket.on('player:join', async (data: { userId: number; username: string; displayName: string; rating: number }) => {
        try {
          const playerData: PlayerData = {
            ...data,
            socketId: socket.id
          };
          
          this.connectedPlayers.set(socket.id, playerData);
          
          // Join personal room for direct messages
          socket.join(`user:${data.userId}`);
          
          console.log(`👤 Player joined: ${data.displayName} (Rating: ${data.rating})`);
          
          socket.emit('player:joined', { success: true });
          
          // Send current stats
          this.broadcastServerStats();
        } catch (error) {
          console.error('Error handling player join:', error);
          socket.emit('player:joined', { success: false, error: 'Failed to join' });
        }
      });

      socket.on('matchmaking:find-opponent', async (data: { gameMode?: string; timeControl?: string; ratingRange?: number }) => {
        console.log('🎯 Matchmaking request received:', data);
        const player = this.connectedPlayers.get(socket.id);
        if (!player) {
          socket.emit('matchmaking:error', { message: 'Player not authenticated' });
          return;
        }

        try {
          // Add to database queue (if available)
          try {
            const db = getDB();
            await db.insert(matchmakingQueue).values({
              userId: player.userId,
              username: player.username,
              displayName: player.displayName,
              rating: player.rating,
              timeControl: parseInt(data.timeControl?.split('+')[0] || '10') * 60, // Convert "10+0" to 600 seconds
              status: 'waiting'
            });
          } catch (dbError) {
            console.log('⚠️ Skipping database queue entry - database not available');
          }

          // Add to local queue
          this.matchmakingQueue.push(player);
          
          console.log(`🎯 Player ${player.displayName} joined matchmaking queue`);
          
          socket.emit('matchmaking:joined', { 
            queuePosition: this.matchmakingQueue.length,
            estimatedWait: this.estimateWaitTime()
          });

          // Try to find a match
          this.attemptMatch(player);
          
        } catch (error) {
          console.error('Error joining matchmaking:', error);
          socket.emit('matchmaking:error', { message: 'Failed to join queue' });
        }
      });

      socket.on('matchmaking:leave', async () => {
        const player = this.connectedPlayers.get(socket.id);
        if (!player) return;

        try {
          // Remove from database queue (if available)
          try {
            const db = getDB();
            await db.delete(matchmakingQueue).where(eq(matchmakingQueue.userId, player.userId));
          } catch (dbError) {
            console.log('⚠️ Skipping database queue removal - database not available');
          }
          
          // Remove from local queue
          this.matchmakingQueue = this.matchmakingQueue.filter(p => p.socketId !== socket.id);
          
          socket.emit('matchmaking:left', { success: true });
          
        } catch (error) {
          console.error('Error leaving matchmaking:', error);
        }
      });

      socket.on('game:move', async (data: { gameId: string; move: any }) => {
        const player = this.connectedPlayers.get(socket.id);
        if (!player) return;

        const game = this.activeGames.get(data.gameId);
        if (!game) {
          socket.emit('game:error', { message: 'Game not found' });
          return;
        }

        // Validate it's the player's turn
        const isPlayer1 = game.player1.userId === player.userId;
        const isPlayer2 = game.player2.userId === player.userId;
        
        if (!isPlayer1 && !isPlayer2) {
          socket.emit('game:error', { message: 'You are not in this game' });
          return;
        }

        const playerColor = isPlayer1 ? 'white' : 'black';
        if (game.currentTurn !== playerColor) {
          socket.emit('game:error', { message: 'Not your turn' });
          return;
        }

        try {
          // Update game state
          game.gameState = data.move.gameState;
          game.currentTurn = game.currentTurn === 'white' ? 'black' : 'white';
          
          // Update database (if available)
          try {
            const db = getDB();
            await db.update(onlineGames)
              .set({
                gameState: game.gameState,
                currentTurn: game.currentTurn,
                moveHistory: data.move.moveHistory || []
              })
              .where(eq(onlineGames.gameId, data.gameId));
          } catch (dbError) {
            console.log('⚠️ Skipping database game state update - database not available');
          }

          // Broadcast move to both players
          this.io.to(`game:${data.gameId}`).emit('game:move', {
            move: data.move,
            gameState: game.gameState,
            currentTurn: game.currentTurn
          });

        } catch (error) {
          console.error('Error handling game move:', error);
          socket.emit('game:error', { message: 'Failed to process move' });
        }
      });

      socket.on('game:resign', async (data: { gameId: string }) => {
        await this.handleGameEnd(data.gameId, socket.id, 'resign');
      });

      socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
        
        const player = this.connectedPlayers.get(socket.id);
        if (player) {
          // Remove from matchmaking queue
          this.matchmakingQueue = this.matchmakingQueue.filter(p => p.socketId !== socket.id);
          
          // Clean up database queue entry only if database is available
          try {
            const db = getDB();
            db.delete(matchmakingQueue).where(eq(matchmakingQueue.userId, player.userId)).catch(console.error);
          } catch (error) {
            // Database not available, skip database cleanup
            console.log('⚠️ Skipping database cleanup - database not available');
          }
          
          this.connectedPlayers.delete(socket.id);
          console.log(`👤 Player left: ${player.displayName}`);
          
          // Broadcast updated stats
          this.broadcastServerStats();
        }
      });
    });
  }

  private broadcastServerStats() {
    const stats = {
      onlinePlayers: this.connectedPlayers.size,
      activeGames: this.activeGames.size,
      queuedPlayers: this.matchmakingQueue.length,
      serverTime: new Date().toISOString()
    };
    
    this.io.emit('server:stats', stats);
  }

  private async attemptMatch(newPlayer: PlayerData) {
    // Find suitable opponent (within 200 rating points)
    const ratingRange = 200;
    const opponent = this.matchmakingQueue.find(p => 
      p.socketId !== newPlayer.socketId &&
      Math.abs(p.rating - newPlayer.rating) <= ratingRange
    );

    if (!opponent) {
      console.log(`🔍 No suitable opponent found for ${newPlayer.displayName}`);
      return;
    }

    // Remove both players from queue
    this.matchmakingQueue = this.matchmakingQueue.filter(p => 
      p.socketId !== newPlayer.socketId && p.socketId !== opponent.socketId
    );

    // Create game
    const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Randomly assign colors
    const isNewPlayerWhite = Math.random() < 0.5;
    const player1 = isNewPlayerWhite ? newPlayer : opponent;
    const player2 = isNewPlayerWhite ? opponent : newPlayer;

    const gameData: GameData = {
      gameId,
      player1,
      player2,
      gameState: this.getInitialGameState(),
      currentTurn: 'white',
      timeControl: 600, // 10 minutes
      player1Time: 600,
      player2Time: 600
    };

    this.activeGames.set(gameId, gameData);

    try {
      // Save to database (if available)
      try {
        const db = getDB();
        await db.insert(onlineGames).values({
          gameId,
          player1Id: player1.userId,
          player2Id: player2.userId,
          player1Name: player1.displayName,
          player2Name: player2.displayName,
          gameState: gameData.gameState,
          currentTurn: 'white',
          status: 'active',
          moveHistory: [],
          timeControl: 600,
          player1Time: 600,
          player2Time: 600,
          startedAt: new Date()
        });

        // Remove from matchmaking queue in database
        await db.delete(matchmakingQueue).where(
          or(
            eq(matchmakingQueue.userId, player1.userId),
            eq(matchmakingQueue.userId, player2.userId)
          )
        );
      } catch (dbError) {
        console.log('⚠️ Skipping database game creation - database not available');
      }

      // Join both players to game room
      this.io.sockets.sockets.get(player1.socketId)?.join(`game:${gameId}`);
      this.io.sockets.sockets.get(player2.socketId)?.join(`game:${gameId}`);

      // Notify both players
      this.io.to(player1.socketId).emit('game:matched', {
        gameId,
        opponent: { name: player2.displayName, rating: player2.rating },
        yourColor: 'white',
        gameState: gameData.gameState
      });

      this.io.to(player2.socketId).emit('game:matched', {
        gameId,
        opponent: { name: player1.displayName, rating: player1.rating },
        yourColor: 'black',
        gameState: gameData.gameState
      });

      console.log(`🎮 Game created: ${player1.displayName} vs ${player2.displayName}`);

    } catch (error) {
      console.error('Error creating game:', error);
      
      // Notify players of error
      this.io.to(player1.socketId).emit('matchmaking:error', { message: 'Failed to create game' });
      this.io.to(player2.socketId).emit('matchmaking:error', { message: 'Failed to create game' });
    }
  }

  private async handleGameEnd(gameId: string, resigner?: string, reason?: string) {
    const game = this.activeGames.get(gameId);
    if (!game) return;

    let winner: 'white' | 'black' | 'draw' | null = null;
    
    if (reason === 'resign' && resigner) {
      const resigningPlayer = this.connectedPlayers.get(resigner);
      if (resigningPlayer) {
        winner = game.player1.userId === resigningPlayer.userId ? 'black' : 'white';
      }
    }

    try {
      // Update database (if available)
      try {
        const db = getDB();
        await db.update(onlineGames)
          .set({
            status: 'completed',
            winner,
            completedAt: new Date()
          })
          .where(eq(onlineGames.gameId, gameId));
      } catch (dbError) {
        console.log('⚠️ Skipping database game end update - database not available');
      }

      // Notify players
      this.io.to(`game:${gameId}`).emit('game:ended', {
        winner,
        reason: reason || 'game_over'
      });

      // Clean up
      this.activeGames.delete(gameId);

    } catch (error) {
      console.error('Error ending game:', error);
    }
  }

  private getInitialGameState() {
    // Return initial 10x10 wizard chess board state
    return {
      board: this.createInitialBoard(),
      currentPlayer: 'white',
      gameStatus: 'active',
      moveHistory: []
    };
  }

  private createInitialBoard() {
    // Create 10x10 board with wizard chess pieces
    const board = Array(10).fill(null).map(() => Array(10).fill(null));
    
    // Set up pieces (simplified version)
    const pieces = {
      pawn: 'pawn', rook: 'rook', knight: 'knight', 
      bishop: 'bishop', queen: 'queen', king: 'king', wizard: 'wizard'
    };

    // White pieces (bottom)
    for (let col = 0; col < 10; col++) {
      board[8][col] = { type: pieces.pawn, color: 'white' };
    }
    
    // Back rank
    board[9][0] = { type: pieces.rook, color: 'white' };
    board[9][1] = { type: pieces.knight, color: 'white' };
    board[9][2] = { type: pieces.bishop, color: 'white' };
    board[9][3] = { type: pieces.queen, color: 'white' };
    board[9][4] = { type: pieces.king, color: 'white' };
    board[9][5] = { type: pieces.wizard, color: 'white' };
    board[9][6] = { type: pieces.bishop, color: 'white' };
    board[9][7] = { type: pieces.knight, color: 'white' };
    board[9][8] = { type: pieces.rook, color: 'white' };
    board[9][9] = { type: pieces.wizard, color: 'white' };

    // Black pieces (top)
    for (let col = 0; col < 10; col++) {
      board[1][col] = { type: pieces.pawn, color: 'black' };
    }
    
    // Back rank
    board[0][0] = { type: pieces.rook, color: 'black' };
    board[0][1] = { type: pieces.knight, color: 'black' };
    board[0][2] = { type: pieces.bishop, color: 'black' };
    board[0][3] = { type: pieces.queen, color: 'black' };
    board[0][4] = { type: pieces.king, color: 'black' };
    board[0][5] = { type: pieces.wizard, color: 'black' };
    board[0][6] = { type: pieces.bishop, color: 'black' };
    board[0][7] = { type: pieces.knight, color: 'black' };
    board[0][8] = { type: pieces.rook, color: 'black' };
    board[0][9] = { type: pieces.wizard, color: 'black' };

    return board;
  }

  private estimateWaitTime(): number {
    // Simple estimation based on queue length
    return Math.max(5, this.matchmakingQueue.length * 10);
  }

  // Public methods for HTTP endpoints
  public async getOnlineLeaderboards() {
    try {
      const db = getDB();
      const { campaignLeaderboard, pvpLeaderboard } = await import('../shared/schema');
      const [campaignData, pvpData] = await Promise.all([
        db.select().from(campaignLeaderboard).orderBy(campaignLeaderboard.campaignScore).limit(100),
        db.select().from(pvpLeaderboard).orderBy(pvpLeaderboard.rating).limit(100)
      ]);

      return {
        campaign: campaignData,
        pvp: pvpData
      };
    } catch (error) {
      console.log('⚠️ Database not available for leaderboards - returning empty data');
      return { campaign: [], pvp: [] };
    }
  }

  public getActiveGamesCount(): number {
    return this.activeGames.size;
  }

  public getOnlinePlayersCount(): number {
    return this.connectedPlayers.size;
  }
}

export { MultiplayerManager };