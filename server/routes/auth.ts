import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { insertUserSchema, loginSchema, passwordResetRequestSchema, passwordResetSchema } from '@shared/schema';
import type { User } from '@shared/schema';

const router = Router();

// Extend Express Request to include session
interface AuthRequest extends Request {
  session: any;
}

// Register new user
router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    // Add displayName if not provided
    const requestData = {
      ...req.body,
      displayName: req.body.displayName || req.body.username
    };
    const userData = insertUserSchema.parse(requestData);
    
    // Check if username already exists
    const existingUser = await storage.getUserByUsername(userData.username);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username already taken' 
      });
    }

    // Check if email already exists
    const existingEmail = await storage.getUserByEmail(userData.email);
    if (existingEmail) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email already registered' 
      });
    }

    // Create user
    const user = await storage.createUser(userData);
    
    // Don't return password in response
    const { password, ...safeUser } = user;
    
    // Set session
    req.session.userId = user.id;
    req.session.user = safeUser as User;

    console.log(`✅ New user registered: ${user.username}`);
    
    res.json({ 
      success: true, 
      user: safeUser,
      message: 'Account created successfully!' 
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(400).json({ 
      success: false, 
      error: 'Invalid registration data' 
    });
  }
});

// Login user
router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { username, password } = loginSchema.parse(req.body);
    
    // Verify credentials
    const user = await storage.verifyPassword(username, password);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid username or password' 
      });
    }

    // Don't return password in response
    const { password: userPassword, ...safeUser } = user;
    
    // Set session
    req.session.userId = user.id;
    req.session.user = safeUser as User;

    console.log(`✅ User logged in: ${user.username}`);
    
    res.json({ 
      success: true, 
      user: safeUser,
      message: 'Logged in successfully!' 
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(400).json({ 
      success: false, 
      error: 'Invalid login data' 
    });
  }
});

// Logout user
router.post('/logout', (req: AuthRequest, res: Response) => {
  const username = req.session.user?.username;
  
  req.session.destroy((err: any) => {
    if (err) {
      console.error('❌ Logout error:', err);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to logout' 
      });
    }
    
    console.log(`✅ User logged out: ${username}`);
    res.json({ 
      success: true, 
      message: 'Logged out successfully!' 
    });
  });
});

// Get current user session
router.get('/session', (req: AuthRequest, res: Response) => {
  if (req.session.userId && req.session.user) {
    res.json({ 
      success: true, 
      user: req.session.user,
      isLoggedIn: true 
    });
  } else {
    res.json({ 
      success: true, 
      user: null,
      isLoggedIn: false 
    });
  }
});

// Password recovery - Request reset token
router.post('/forgot-password', async (req: AuthRequest, res: Response) => {
  try {
    const { email } = passwordResetRequestSchema.parse(req.body);
    
    // Find user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      // For security, don't reveal if email exists or not
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }
    
    // Generate reset token
    const token = await storage.createPasswordResetToken(user.id);
    
    // In a real app, you would send an email here
    // For demo purposes, we'll log the reset link
    console.log(`🔐 Password reset requested for ${user.email}`);
    console.log(`🔗 Reset link: ${process.env.CLIENT_URL || 'http://localhost:5000'}/reset-password?token=${token}`);
    
    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
      // In development, include the token for testing
      ...(process.env.NODE_ENV === 'development' && { resetToken: token })
    });
    
  } catch (error) {
    console.error('❌ Password reset request error:', error);
    res.status(400).json({
      success: false,
      error: 'Invalid email address'
    });
  }
});

// Password recovery - Reset password with token
router.post('/reset-password', async (req: AuthRequest, res: Response) => {
  try {
    const { token, newPassword } = passwordResetSchema.parse(req.body);
    
    // Validate token and get user
    const user = await storage.validatePasswordResetToken(token);
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token'
      });
    }
    
    // Reset the password
    const success = await storage.resetPassword(token, newPassword);
    if (!success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to reset password'
      });
    }
    
    console.log(`✅ Password reset successful for user: ${user.username}`);
    
    res.json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.'
    });
    
  } catch (error) {
    console.error('❌ Password reset error:', error);
    res.status(400).json({
      success: false,
      error: 'Invalid reset data'
    });
  }
});

// Validate reset token (for checking if token is valid before showing reset form)
router.post('/validate-reset-token', async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Reset token is required'
      });
    }
    
    const user = await storage.validatePasswordResetToken(token);
    
    res.json({
      success: true,
      valid: !!user,
      email: user ? user.email.replace(/(.{2}).*(@.*)/, '$1***$2') : null // Masked email
    });
    
  } catch (error) {
    console.error('❌ Token validation error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to validate token'
    });
  }
});

// Debug endpoint to grant premium access (testing enabled for tokingteepee@gmail.com)
router.post('/grant-premium', async (req: AuthRequest, res: Response) => {
  // Only allow for specific test email
  const testEmail = 'tokingteepee@gmail.com';
  if (req.body.email !== testEmail) {
    return res.status(403).json({
      success: false,
      error: 'Not available for this email'
    });
  }

  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Grant premium access
    await storage.updateUserPremiumStatus(user.id, true, 'dev_subscription', 'active');

    console.log(`✅ Premium access granted to: ${user.email}`);

    res.json({
      success: true,
      message: 'Premium access granted successfully',
      user: {
        ...user,
        isPremium: true,
        subscriptionStatus: 'active'
      }
    });

  } catch (error) {
    console.error('❌ Grant premium error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to grant premium access'
    });
  }
});

// Middleware to require authentication
export const requireAuth = (req: AuthRequest, res: Response, next: any) => {
  if (!req.session.userId) {
    return res.status(401).json({ 
      success: false, 
      error: 'Authentication required' 
    });
  }
  next();
};

export default router;