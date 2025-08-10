import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// Get user statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.session?.userId;
    
    if (!userId) {
      // Return default stats for non-logged in users
      return res.json({
        success: true,
        stats: {
          totalGames: 0,
          totalWins: 0,
          totalLosses: 0,
          winRate: 0,
          currentRating: 1200,
          campaignProgress: 0,
          achievementsUnlocked: 0,
          totalPlayTime: 0
        }
      });
    }
    
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const stats = {
      totalGames: user.totalGames || 0,
      totalWins: user.totalWins || 0,
      totalLosses: (user.totalGames || 0) - (user.totalWins || 0),
      winRate: user.totalGames ? Math.round((user.totalWins / user.totalGames) * 100) : 0,
      currentRating: user.rating || 1200,
      campaignProgress: calculateCampaignProgress(user.campaignProgress),
      achievementsUnlocked: user.achievements?.length || 0,
      totalPlayTime: user.totalPlayTime || 0
    };
    
    res.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user statistics' 
    });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Return safe user profile data (excluding sensitive info)
    const profile = {
      id: user.id,
      username: user.username,
      email: user.email,
      isPremium: user.isPremium || false,
      joinedAt: user.createdAt,
      rating: user.rating || 1200,
      totalGames: user.totalGames || 0,
      totalWins: user.totalWins || 0
    };
    
    res.json({
      success: true,
      profile
    });
    
  } catch (error) {
    console.error('User profile error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user profile' 
    });
  }
});

function calculateCampaignProgress(campaignData: any): number {
  if (!campaignData || !campaignData.completedLevels) {
    return 0;
  }
  const totalLevels = 12; // Total campaign levels
  const completedCount = campaignData.completedLevels.length;
  return Math.round((completedCount / totalLevels) * 100);
}

export default router;