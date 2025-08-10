import { Router } from 'express';
import type { Request, Response } from 'express';
import { getDB } from '../storage';
import { campaignLeaderboard } from '../../shared/schema';
import { desc } from 'drizzle-orm';

const router = Router();

// Get AI learning statistics
router.get('/ai-stats', async (req: Request, res: Response) => {
  try {
    // Mock AI stats for now - can be enhanced with real AI learning data
    const aiStats = {
      totalGamesAnalyzed: 50006,
      recentGames: 500,
      humanGames: 0,
      aiGames: 500,
      winRateVsHuman: 0,
      winRateVsAI: 55,
      movePatterns: 252,
      positionalPatterns: 168,
      preferredStrategies: ["Adaptive", "Balanced"],
      proficiencyLevel: "Master",
      learningProgress: 80,
      experiencePoints: 501320
    };

    res.json({
      success: true,
      data: aiStats
    });
  } catch (error) {
    console.error('Error fetching AI stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch AI statistics'
    });
  }
});

// Get chess campaign leaderboard
router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    // Mock chess leaderboard data
    const leaderboard = [
      { id: 1, playerName: "ChessMaster", level: 12, username: "master_player", achievedAt: new Date() },
      { id: 2, playerName: "WizardKing", level: 11, username: "wizard_king", achievedAt: new Date() },
      { id: 3, playerName: "QueenGambit", level: 10, username: "queen_gambit", achievedAt: new Date() }
    ];
    
    const limit = parseInt(req.query.limit as string) || 50;
    
    res.json({
      success: true,
      data: leaderboard.slice(0, limit)
    });
  } catch (error) {
    console.error('Error fetching chess leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chess leaderboard'
    });
  }
});

// Submit campaign score
router.post('/submit-score', async (req: Request, res: Response) => {
  try {
    const { playerName, score, level, username } = req.body;
    
    if (!playerName || !score || !level) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: playerName, score, level'
      });
    }

    const db = getDB();
    
    // Insert or update leaderboard entry
    await db.insert(campaignLeaderboard).values({
      playerName,
      score,
      level,
      username: username || playerName,
      achievedAt: new Date()
    });
    
    res.json({
      success: true,
      message: 'Score submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting score:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit score'
    });
  }
});

export default router;