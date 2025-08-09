import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { insertUserSchema, loginSchema } from '@shared/schema';
import type { User } from '@shared/schema';

const router = Router();

// Extend Express Request to include session
interface AuthRequest extends Request {
  session: {
    userId?: number;
    user?: Omit<User, 'password'>;
    destroy: (callback: (err?: any) => void) => void;
    [key: string]: any;
  };
}

// Register new user
router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const userData = insertUserSchema.parse(req.body);
    
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
  
  req.session.destroy((err) => {
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