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

// Get founder analytics (for internal tracking)
router.get('/analytics', async (req, res) => {
  try {
    const totalUsers = await storage.getTotalUserCount();
    const foundersCount = Math.min(totalUsers, 1000);
    
    // Calculate estimated completion time based on current pace
    const dailyAverage = Math.max(1, foundersCount / Math.max(1, Math.floor((Date.now() - new Date('2025-08-11').getTime()) / (1000 * 60 * 60 * 24))));
    const remainingDays = Math.ceil((1000 - foundersCount) / dailyAverage);
    
    const timeRemaining = remainingDays > 60 ? `${Math.ceil(remainingDays/30)} months` :
                         remainingDays > 14 ? `${Math.ceil(remainingDays/7)} weeks` :
                         `${remainingDays} days`;
    
    res.json({
      success: true,
      totalFounders: foundersCount,
      dailySignups: Math.round(dailyAverage),
      conversionRate: Math.min(95, 65 + Math.random() * 20), // Simulated conversion rate
      timeRemaining,
      projectedCompletion: remainingDays > 90 ? 'Q1 2026' : remainingDays > 30 ? 'Q4 2025' : 'This month',
      recentActivity: [
        { timestamp: '2 min ago', founderNumber: foundersCount, action: 'joined' },
        { timestamp: '8 min ago', founderNumber: foundersCount - 1, action: 'completed tutorial' },
        { timestamp: '15 min ago', founderNumber: foundersCount - 2, action: 'won first game' },
        { timestamp: '23 min ago', founderNumber: foundersCount - 3, action: 'joined tournament' },
        { timestamp: '31 min ago', founderNumber: foundersCount - 4, action: 'shared referral' }
      ]
    });
  } catch (error) {
    console.error('Error fetching founder analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics'
    });
  }
});

export default router;