import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// Get campaign progress for current user
router.get('/progress', async (req, res) => {
  try {
    const userId = (req.session as any)?.userId;
    
    if (!userId) {
      // Return default campaign state for non-logged in users
      const defaultLevels = [
        {
          id: 'level1',
          name: 'Apprentice\'s First Steps',
          difficulty: 'easy',
          unlocked: true,
          completed: false,
          stars: 0
        },
        {
          id: 'level2', 
          name: 'Tower Defense',
          difficulty: 'easy',
          unlocked: false,
          completed: false,
          stars: 0
        }
      ];
      
      return res.json({
        success: true,
        campaignLevels: defaultLevels,
        playerStats: {
          totalGames: 0,
          totalWins: 0,
          currentLevel: 1,
          campaignProgress: 0
        }
      });
    }
    
    // Get user's campaign progress from database
    const user = await storage.getUserById(userId);
    const campaignData = user?.campaignProgress || {
      currentLevel: 1,
      completedLevels: [],
      totalStars: 0
    };
    
    res.json({
      success: true,
      campaignLevels: generateCampaignLevels(campaignData),
      playerStats: {
        totalGames: user?.totalGames || 0,
        totalWins: user?.totalWins || 0,
        currentLevel: campaignData.currentLevel,
        campaignProgress: calculateProgress(campaignData)
      }
    });
    
  } catch (error) {
    console.error('Campaign progress error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch campaign progress' 
    });
  }
});

// Get available campaign levels
router.get('/levels', async (req, res) => {
  try {
    const userId = (req.session as any)?.userId;
    const user = userId ? await storage.getUserById(userId) : null;
    
    const campaignData = user?.campaignProgress || {
      currentLevel: 1,
      completedLevels: [],
      totalStars: 0
    };
    
    const levels = generateCampaignLevels(campaignData);
    
    res.json({
      success: true,
      levels,
      totalLevels: levels.length
    });
    
  } catch (error) {
    console.error('Campaign levels error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch campaign levels' 
    });
  }
});

// Start a campaign level
router.post('/start', async (req, res) => {
  try {
    const { levelId } = req.body;
    const userId = (req.session as any)?.userId;
    
    if (!levelId) {
      return res.status(400).json({
        success: false,
        error: 'Level ID is required'
      });
    }
    
    // Validate level exists and is unlocked
    const user = userId ? await storage.getUserById(userId) : null;
    const campaignData = user?.campaignProgress || { currentLevel: 1, completedLevels: [] };
    const levels = generateCampaignLevels(campaignData);
    const level = levels.find(l => l.id === levelId);
    
    if (!level) {
      return res.status(404).json({
        success: false,
        error: 'Level not found'
      });
    }
    
    if (!level.unlocked) {
      return res.status(403).json({
        success: false,
        error: 'Level is locked'
      });
    }
    
    res.json({
      success: true,
      level: {
        id: level.id,
        name: level.name,
        difficulty: level.difficulty,
        aiStrength: level.aiStrength || 1,
        boardVariant: level.boardVariant || 'classic'
      }
    });
    
  } catch (error) {
    console.error('Campaign start error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to start campaign level' 
    });
  }
});

// Complete a campaign level
router.post('/complete', async (req, res) => {
  try {
    const { levelId, won, moveCount, gameTime, stars } = req.body;
    const userId = (req.session as any)?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    if (!levelId) {
      return res.status(400).json({
        success: false,
        error: 'Level ID is required'
      });
    }
    
    // Update user's campaign progress
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const campaignData = user.campaignProgress || {
      currentLevel: 1,
      completedLevels: [],
      totalStars: 0
    };
    
    // Add to completed levels if won
    if (won && !campaignData.completedLevels.includes(levelId)) {
      campaignData.completedLevels.push(levelId);
      campaignData.currentLevel = Math.max(campaignData.currentLevel, parseInt(levelId.replace('level', '')) + 1);
    }
    
    // Update stars
    if (stars) {
      campaignData.totalStars = (campaignData.totalStars || 0) + stars;
    }
    
    // Save updated progress
    await storage.updateUser(userId, {
      campaignProgress: campaignData,
      totalGames: (user.totalGames || 0) + 1,
      totalWins: (user.totalWins || 0) + (won ? 1 : 0)
    });
    
    res.json({
      success: true,
      updatedProgress: campaignData,
      experienceGained: won ? 100 : 25
    });
    
  } catch (error) {
    console.error('Campaign complete error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to complete campaign level' 
    });
  }
});

function generateCampaignLevels(campaignData: any) {
  const baseLevels = [
    {
      id: 'level1',
      name: 'Apprentice\'s First Steps',
      difficulty: 'easy',
      aiStrength: 1,
      description: 'Master the basics against a gentle AI tutor.',
      boardVariant: 'classic'
    },
    {
      id: 'level2',
      name: 'Tower Defense',  
      difficulty: 'easy',
      aiStrength: 2,
      description: 'Protect your pieces while learning basic tactics.',
      boardVariant: 'forest'
    },
    {
      id: 'level3',
      name: 'Wizard\'s Gambit',
      difficulty: 'easy', 
      aiStrength: 2,
      description: 'Learn to use wizard teleportation effectively.',
      boardVariant: 'castle'
    },
    {
      id: 'level4',
      name: 'Mountain Pass',
      difficulty: 'medium',
      aiStrength: 3,
      description: 'Navigate treacherous terrain with strategic play.',
      boardVariant: 'mountain'
    },
    {
      id: 'level5',
      name: 'Desert Mirage',
      difficulty: 'medium',
      aiStrength: 4,
      description: 'Survive the harsh desert conditions.',
      boardVariant: 'desert'
    }
  ];
  
  return baseLevels.map((level, index) => ({
    ...level,
    unlocked: index === 0 || campaignData.completedLevels.includes(`level${index}`),
    completed: campaignData.completedLevels.includes(level.id),
    stars: 0 // TODO: Implement individual level stars
  }));
}

function calculateProgress(campaignData: any): number {
  const totalLevels = 12; // Total campaign levels
  const completedCount = campaignData.completedLevels?.length || 0;
  return Math.round((completedCount / totalLevels) * 100);
}

export default router;