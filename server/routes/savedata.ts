import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { requireAuth } from './auth';
import { insertUserSaveDataSchema } from '@shared/schema';

const router = Router();

// Extend Express Request to include session
interface SaveDataRequest extends Request {
  session: {
    userId?: number;
    [key: string]: any;
  };
}

// Get user's cloud save data (premium feature)
router.get('/sync', requireAuth, async (req: SaveDataRequest, res: Response) => {
  try {
    const userId = req.session.userId!;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    // Check if user has premium access for cloud saves
    if (!user.isPremium) {
      return res.status(403).json({ 
        success: false, 
        error: 'Premium subscription required for cloud saves',
        requiresPremium: true
      });
    }

    const saveData = await storage.getUserSaveData(userId);
    
    if (!saveData) {
      return res.json({ 
        success: true, 
        saveData: null,
        message: 'No cloud save data found' 
      });
    }

    console.log(`☁️ Cloud save retrieved for user: ${user.username}`);
    
    res.json({ 
      success: true, 
      saveData,
      lastSyncedAt: saveData.lastSyncedAt 
    });
  } catch (error) {
    console.error('❌ Cloud save retrieval error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve cloud save data' 
    });
  }
});

// Save user's progress to cloud (premium feature)
router.post('/sync', requireAuth, async (req: SaveDataRequest, res: Response) => {
  try {
    const userId = req.session.userId!;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    // Check if user has premium access for cloud saves
    if (!user.isPremium) {
      return res.status(403).json({ 
        success: false, 
        error: 'Premium subscription required for cloud saves',
        requiresPremium: true
      });
    }

    const saveDataInput = insertUserSaveDataSchema.parse({
      userId, // Will be omitted by the schema
      ...req.body
    });

    const savedData = await storage.createOrUpdateSaveData(userId, saveDataInput);

    console.log(`☁️ Cloud save updated for user: ${user.username}`);
    
    res.json({ 
      success: true, 
      saveData: savedData,
      message: 'Progress saved to cloud successfully!',
      lastSyncedAt: savedData.lastSyncedAt
    });
  } catch (error) {
    console.error('❌ Cloud save error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save progress to cloud' 
    });
  }
});

// Get local backup data (always available)
router.get('/local-backup', requireAuth, async (req: SaveDataRequest, res: Response) => {
  try {
    const userId = req.session.userId!;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    // Local backup is available to all logged-in users
    const saveData = await storage.getUserSaveData(userId);
    
    console.log(`💾 Local backup retrieved for user: ${user.username}`);
    
    res.json({ 
      success: true, 
      saveData: saveData || null,
      message: 'Local backup data retrieved' 
    });
  } catch (error) {
    console.error('❌ Local backup retrieval error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve local backup' 
    });
  }
});

// Create local backup (always available)
router.post('/local-backup', requireAuth, async (req: SaveDataRequest, res: Response) => {
  try {
    const userId = req.session.userId!;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    const saveDataInput = insertUserSaveDataSchema.parse({
      userId, // Will be omitted by the schema
      ...req.body
    });

    const savedData = await storage.createOrUpdateSaveData(userId, saveDataInput);

    console.log(`💾 Local backup created for user: ${user.username}`);
    
    res.json({ 
      success: true, 
      saveData: savedData,
      message: 'Local backup created successfully!',
      lastSyncedAt: savedData.lastSyncedAt
    });
  } catch (error) {
    console.error('❌ Local backup error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create local backup' 
    });
  }
});

export default router;