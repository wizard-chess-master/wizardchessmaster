/**
 * Security Middleware
 * Implements Content Security Policy and other security headers
 */

import { Request, Response, NextFunction } from 'express';
import { serverLogger } from '../utils/serverLogger';

// Content Security Policy configuration
const getCSP = (req: Request): string => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const directives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'", // Required for React/Vite in dev
      isDevelopment && "'unsafe-eval'", // Only in dev for HMR
      'https://js.stripe.com',
      'https://www.googletagmanager.com',
      'https://pagead2.googlesyndication.com',
    ].filter(Boolean),
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for styled components
      'https://fonts.googleapis.com',
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com',
      'data:',
    ],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https://*.stripe.com',
      'https://*.google-analytics.com',
    ],
    'connect-src': [
      "'self'",
      'wss://*.replit.app',
      'https://api.stripe.com',
      'https://*.google-analytics.com',
      'https://api.openai.com',
    ],
    'frame-src': [
      "'self'",
      'https://js.stripe.com',
      'https://hooks.stripe.com',
    ],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': !isDevelopment ? [''] : undefined,
  };

  return Object.entries(directives)
    .filter(([, values]) => values !== undefined)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
};

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Content Security Policy
    const csp = getCSP(req);
    res.setHeader('Content-Security-Policy', csp);
    
    // Other security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    // HSTS (only in production with HTTPS)
    if (process.env.NODE_ENV === 'production' && req.secure) {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    }
    
    next();
  } catch (error) {
    serverLogger.error('Security headers error', error as Error);
    next(); // Continue even if headers fail
  }
};

// Cache control middleware for static assets
export const cacheControl = (req: Request, res: Response, next: NextFunction) => {
  // Skip caching in development
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  const path = req.path;
  
  // Immutable assets (hashed filenames)
  if (path.match(/\.(js|css|woff2?|ttf|eot)$/) && path.includes('-')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  // Images
  else if (path.match(/\.(png|jpg|jpeg|gif|svg|ico|webp)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=604800'); // 7 days
  }
  // HTML and other files
  else if (path.match(/\.(html?)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  }
  // API responses
  else if (path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  }
  
  next();
};

// Compression middleware configuration
export const compressionOptions = {
  filter: (req: Request, res: Response) => {
    // Don't compress for specific requests
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Compress everything else
    return true;
  },
  level: 6, // Balanced compression level
  threshold: 1024, // Only compress files > 1KB
};

// Rate limiting configuration for API endpoints
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
};

// CORS configuration
export const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    const allowedOrigins = [
      'https://*.replit.app',
      'https://*.repl.co',
      'http://localhost:3000',
      'http://localhost:5173',
    ];
    
    // Allow requests with no origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);
    
    // Check if origin matches allowed patterns
    const isAllowed = allowedOrigins.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace('*', '.*'));
        return regex.test(origin);
      }
      return pattern === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};