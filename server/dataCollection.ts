/**
 * Data Collection Module for Human Gameplay
 * Collects game data for AI training
 */

import { Server as SocketIOServer } from 'socket.io';
import { getDB } from './storage';
import { sql } from 'drizzle-orm';

export interface GameData {
  gameId: string;
  playerColor: 'white' | 'black';
  opponentType: 'ai' | 'human';
  gameState: any;
  moves: any[];
  result?: 'win' | 'loss' | 'draw';
  winner?: 'white' | 'black';
  totalMoves?: number;
  durationSeconds?: number;
  aiDifficulty?: string;
  playerRating?: number;
  analysisData?: any;
}

export class DataCollectionManager {
  private io: SocketIOServer;
  private activeGames: Map<string, GameData>;
  private db: any;

  constructor(io: SocketIOServer) {
    this.io = io;
    this.activeGames = new Map();
    try {
      this.db = getDB();
      this.setupSocketHandlers();
      console.log('📊 Data Collection Manager initialized');
    } catch (error) {
      console.log('⚠️ Data Collection Manager: Database not available, data collection disabled');
    }
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`📊 Data collector connected: ${socket.id}`);
      
      // Respond to heartbeat to avoid disconnection
      socket.on('ping', () => {
        socket.emit('pong');
      });
      
      // Game start event
      socket.on('game:start', (data: {
        gameId: string;
        playerColor: 'white' | 'black';
        opponentType: 'ai' | 'human';
        aiDifficulty?: string;
      }) => {
        console.log(`📊 Starting data collection for game ${data.gameId}`);
        this.activeGames.set(data.gameId, {
          gameId: data.gameId,
          playerColor: data.playerColor,
          opponentType: data.opponentType,
          aiDifficulty: data.aiDifficulty,
          gameState: {},
          moves: [],
        });
      });

      // Move event
      socket.on('game:move', (data: {
        gameId: string;
        move: any;
        gameState: any;
      }) => {
        const game = this.activeGames.get(data.gameId);
        if (game) {
          game.moves.push(data.move);
          game.gameState = data.gameState;
          console.log(`📊 Recorded move ${game.moves.length} for game ${data.gameId}`);
        }
      });

      // Game end event
      socket.on('game:end', async (data: {
        gameId: string;
        result: 'win' | 'loss' | 'draw';
        winner?: 'white' | 'black';
        durationSeconds?: number;
      }) => {
        const game = this.activeGames.get(data.gameId);
        if (game) {
          game.result = data.result;
          game.winner = data.winner;
          game.totalMoves = game.moves.length;
          game.durationSeconds = data.durationSeconds;

          // Save to database
          await this.saveGameData(game);
          
          // Clean up
          this.activeGames.delete(data.gameId);
          console.log(`📊 Game ${data.gameId} saved to database`);
        }
      });

      // Cleanup on disconnect
      socket.on('disconnect', () => {
        // Handle any cleanup needed
      });
    });
  }

  private async saveGameData(game: GameData) {
    if (!this.db) {
      console.log('⚠️ Database not available, skipping game save');
      return;
    }
    try {
      const result = await this.db.execute(sql`
        INSERT INTO human_games (
          game_id,
          player_color,
          opponent_type,
          game_state,
          moves,
          result,
          winner,
          total_moves,
          duration_seconds,
          ai_difficulty,
          player_rating,
          analysis_data,
          completed_at
        ) VALUES (
          ${game.gameId},
          ${game.playerColor},
          ${game.opponentType},
          ${JSON.stringify(game.gameState)}::jsonb,
          ${JSON.stringify(game.moves)}::jsonb,
          ${game.result || null},
          ${game.winner || null},
          ${game.totalMoves || 0},
          ${game.durationSeconds || 0},
          ${game.aiDifficulty || null},
          ${game.playerRating || null},
          ${game.analysisData ? JSON.stringify(game.analysisData) : null}::jsonb,
          NOW()
        )
      `);
      
      console.log(`✅ Game data saved: ${game.gameId}`);
      return result;
    } catch (error) {
      console.error('❌ Failed to save game data:', error);
      throw error;
    }
  }

  // Utility method to get game statistics
  async getGameStatistics() {
    if (!this.db) return null;
    try {
      const stats = await this.db.execute(sql`
        SELECT 
          COUNT(*) as total_games,
          COUNT(CASE WHEN result = 'win' THEN 1 END) as wins,
          COUNT(CASE WHEN result = 'loss' THEN 1 END) as losses,
          COUNT(CASE WHEN result = 'draw' THEN 1 END) as draws,
          AVG(total_moves) as avg_moves,
          AVG(duration_seconds) as avg_duration
        FROM human_games
        WHERE completed_at IS NOT NULL
      `);
      
      return stats.rows[0];
    } catch (error) {
      console.error('❌ Failed to get game statistics:', error);
      return null;
    }
  }

  // Export games for training
  async exportGamesForTraining(limit: number = 1000) {
    if (!this.db) return [];
    try {
      const games = await this.db.execute(sql`
        SELECT * FROM human_games
        WHERE result IS NOT NULL
        ORDER BY created_at DESC
        LIMIT ${limit}
      `);
      
      console.log(`📊 Exported ${games.rows.length} games for training`);
      return games.rows;
    } catch (error) {
      console.error('❌ Failed to export games:', error);
      return [];
    }
  }
}

export default DataCollectionManager;