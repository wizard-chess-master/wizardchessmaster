import { Router } from 'express';
import { storage } from '../storage.js';

const router = Router();

// Get founder program status
router.get('/status', async (req, res) => {
  try {
    const eligibility = await storage.checkFounderEligibility();
    const totalUsers = await storage.getTotalUserCount();
    
    res.json({
      success: true,
      currentCount: totalUsers,
      spotsRemaining: Math.max(0, 1000 - totalUsers),
      isEligible: eligibility.eligible,
      nextFounderNumber: eligibility.founderNumber
    });
  } catch (error) {
    console.error('Error fetching founder status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch founder status'
    });
  }
});

export default router;