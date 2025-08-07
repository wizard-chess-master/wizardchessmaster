// Admin access control utilities
interface AdminConfig {
  isAdminMode: boolean;
  adminKey?: string;
  allowedIPs?: string[];
}

const ADMIN_SESSION_KEY = 'wizard-chess-admin-session';

/**
 * Check if admin features should be enabled
 * Based on environment variables and session storage
 */
export const isAdminEnabled = (): boolean => {
  // Check environment variable for admin mode
  const envAdminMode = import.meta.env.VITE_ADMIN_MODE === 'true';
  
  // Check for development environment
  const isDevelopment = import.meta.env.DEV;
  
  // Check session storage for admin authentication
  const adminSession = sessionStorage.getItem(ADMIN_SESSION_KEY);
  
  // Admin is enabled if:
  // 1. Explicitly enabled via environment variable, OR
  // 2. In development mode, OR  
  // 3. Valid admin session exists
  return envAdminMode || isDevelopment || adminSession === 'authenticated';
};

/**
 * Authenticate admin access with a key
 */
export const authenticateAdmin = (key: string): boolean => {
  const adminKey = import.meta.env.VITE_ADMIN_KEY || 'wizard-admin-2025';
  
  if (key === adminKey) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, 'authenticated');
    return true;
  }
  
  return false;
};

/**
 * Log out admin session
 */
export const logoutAdmin = (): void => {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
};

/**
 * Check if specific admin feature should be visible
 */
export const isAdminFeatureEnabled = (feature: 'training' | 'debug' | 'stats' | 'reset'): boolean => {
  if (!isAdminEnabled()) return false;
  
  // You can add feature-specific permissions here if needed
  switch (feature) {
    case 'training':
    case 'debug':
    case 'stats':
    case 'reset':
      return true;
    default:
      return false;
  }
};

/**
 * Get admin status information
 */
export const getAdminStatus = () => {
  return {
    isEnabled: isAdminEnabled(),
    isDevelopment: import.meta.env.DEV,
    hasSession: sessionStorage.getItem(ADMIN_SESSION_KEY) === 'authenticated',
    envAdminMode: import.meta.env.VITE_ADMIN_MODE === 'true'
  };
};