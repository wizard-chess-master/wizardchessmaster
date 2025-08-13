/**
 * Training data API endpoints
 */

import { Router, Request, Response } from 'express';
import { getDB } from '../storage';

const router = Router();

// Get human game data for training
router.get('/human-games', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    
    // Query human games with valid player ratings
    const query = `
      SELECT 
        game_id,
        player_color,
        opponent_type,
        game_state,
        moves,
        result,
        winner,
        total_moves,
        duration_seconds,
        player_rating,
        ai_difficulty
      FROM human_games
      WHERE moves IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 100
    `;
    
    const result = await db.execute(query);
    
    // Process and format the data
    const games = result.rows.map((row: any) => ({
      game_id: row.game_id,
      player_color: row.player_color,
      opponent_type: row.opponent_type,
      game_state: row.game_state,
      moves: row.moves,
      result: row.result,
      winner: row.winner,
      total_moves: row.total_moves,
      duration_seconds: row.duration_seconds,
      player_rating: row.player_rating || 1200, // Default rating if not set
      ai_difficulty: row.ai_difficulty
    }));
    
    console.log(`📊 Fetched ${games.length} human games for training`);
    res.json(games);
    
  } catch (error) {
    console.error('Failed to fetch human games:', error);
    // Return empty array if database is not available
    res.json([]);
  }
});

// Get aggregated statistics for training insights
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    
    const query = `
      SELECT 
        COUNT(*) as total_games,
        AVG(total_moves) as avg_moves,
        AVG(duration_seconds) as avg_duration,
        AVG(player_rating) as avg_rating
      FROM human_games
    `;
    
    const result = await db.execute(query);
    
    res.json({
      total_games: result.rows[0].total_games || 0,
      avg_moves: result.rows[0].avg_moves || 0,
      avg_duration: result.rows[0].avg_duration || 0,
      avg_rating: result.rows[0].avg_rating || 1200
    });
    
  } catch (error) {
    console.error('Failed to fetch training stats:', error);
    res.json({
      total_games: 0,
      avg_moves: 0,
      avg_duration: 0,
      avg_rating: 1200
    });
  }
});

export default router;