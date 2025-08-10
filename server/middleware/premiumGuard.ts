import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

// Extend Express Request to include session and user
interface AuthRequest extends Request {
  session: any;
  user?: any;
}

/**
 * Middleware to ensure only premium users can access certain endpoints
 * Critical for preventing free users from accessing paid features
 */
export const requirePremium = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Check if user is authenticated
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        premiumRequired: true
      });
    }

    // Get fresh user data from database to verify premium status
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
        premiumRequired: true
      });
    }

    // CRITICAL: Check actual premium status from database
    if (!user.isPremium) {
      console.log(`🔒 Premium access denied for user ${user.username} (ID: ${user.id})`);
      return res.status(403).json({
        success: false,
        error: 'Premium subscription required',
        premiumRequired: true,
        userPlan: 'free'
      });
    }

    // Verify subscription is still active (if applicable)
    if (user.subscriptionStatus && user.subscriptionStatus !== 'active') {
      console.log(`🔒 Inactive subscription for user ${user.username}: ${user.subscriptionStatus}`);
      return res.status(403).json({
        success: false,
        error: 'Premium subscription expired or inactive',
        premiumRequired: true,
        subscriptionStatus: user.subscriptionStatus
      });
    }

    console.log(`✅ Premium access granted for user ${user.username}`);
    
    // Add user info to request for downstream use
    req.user = user;
    next();

  } catch (error) {
    console.error('❌ Premium guard error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during premium verification'
    });
  }
};

/**
 * Optional middleware for feature access logging
 */
export const logFeatureAccess = (feature: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.session.userId;
    const isPremium = req.user?.isPremium || false;
    
    console.log(`📊 Feature access: ${feature} | User: ${userId} | Premium: ${isPremium}`);
    next();
  };
};