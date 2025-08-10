import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// Get campaign leaderboard
router.get('/campaign', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    
    // Mock data for campaign leaderboard
    const leaderboard = [
      { id: 1, playerName: "ChessMaster", score: 12450, level: 12, username: "master_player", achievedAt: new Date() },
      { id: 2, playerName: "WizardKing", score: 11800, level: 11, username: "wizard_king", achievedAt: new Date() },
      { id: 3, playerName: "QueenGambit", score: 10900, level: 10, username: "queen_gambit", achievedAt: new Date() }
    ];
    
    res.json({
      success: true,
      leaderboard: leaderboard.slice(0, limit),
      total: leaderboard.length
    });
  } catch (error) {
    console.error('Failed to fetch campaign leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch campaign leaderboard'
    });
  }
});

// Get PvP leaderboard
router.get('/pvp', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    
    // Mock data for PvP leaderboard
    const leaderboard = [
      { id: 1, username: "GrandMaster", rating: 2200, wins: 89, losses: 11, draws: 15, gamesPlayed: 115 },
      { id: 2, username: "ChessProdigy", rating: 2150, wins: 76, losses: 18, draws: 12, gamesPlayed: 106 },
      { id: 3, username: "TacticalGenius", rating: 2100, wins: 68, losses: 22, draws: 18, gamesPlayed: 108 }
    ];
    
    res.json({
      success: true,
      leaderboard: leaderboard.slice(0, limit),
      total: leaderboard.length
    });
  } catch (error) {
    console.error('Failed to fetch PvP leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch PvP leaderboard'
    });
  }
});

// Get combined leaderboards (existing endpoint compatibility)
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const [campaign, pvp] = await Promise.all([
      storage.getCampaignLeaderboard(limit),
      storage.getPvPLeaderboard(limit)
    ]);
    
    res.json({
      success: true,
      campaign,
      pvp
    });
  } catch (error) {
    console.error('Failed to fetch leaderboards:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboards'
    });
  }
});

// Get player's rank
router.get('/rank/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const userId = req.session?.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    if (type !== 'campaign' && type !== 'pvp') {
      return res.status(400).json({
        success: false,
        error: 'Invalid leaderboard type. Use "campaign" or "pvp"'
      });
    }

    const rank = await storage.getPlayerRank(userId, type as 'campaign' | 'pvp');
    
    res.json({
      success: true,
      rank,
      type
    });
  } catch (error) {
    console.error('Failed to fetch player rank:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch player rank'
    });
  }
});

// Update player stats (for game completion)
router.post('/stats', async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    const { gamesWon, gamesPlayed, totalGameTime, highestLevel } = req.body;

    // First ensure the user has save data
    let saveData = await storage.getUserSaveData(userId);
    if (!saveData) {
      // Create initial save data if none exists
      await storage.createOrUpdateSaveData(userId, {
        gameProgress: {
          currentLevel: 1,
          levelsCompleted: [],
          campaignProgress: {},
          achievements: {},
          playerStats: { gamesWon: 0, gamesPlayed: 0, totalGameTime: 0, highestLevel: 0 }
        },
        campaignProgress: {},
        settings: {},
        premiumFeatures: {}
      });
    }

    await storage.updatePlayerStats(userId, {
      gamesWon,
      gamesPlayed,
      totalGameTime,
      highestLevel
    });
    
    res.json({
      success: true,
      message: 'Player stats updated successfully'
    });
  } catch (error) {
    console.error('Failed to update player stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update player stats'
    });
  }
});

export default router;