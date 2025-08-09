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
  const isDevelopment = false;
  
  // Check session storage for admin authentication
  const adminSession = sessionStorage.getItem(ADMIN_SESSION_KEY);
  
  // ADMIN DEBUG LOGS DISABLED - no console output
  
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
  
  // ADMIN DEBUG LOGS DISABLED
  
  if (key === adminKey) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, 'authenticated');
    // ADMIN DEBUG LOGS DISABLED
    return true;
  }
  
  // ADMIN DEBUG LOGS DISABLED
  return false;
};

/**
 * Log out admin session
 */
export const logoutAdmin = (): void => {
  // ADMIN DEBUG LOGS DISABLED
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  // ADMIN DEBUG LOGS DISABLED
};

/**
 * Check if specific admin feature should be visible
 */
export const isAdminFeatureEnabled = (feature: 'training' | 'debug' | 'stats' | 'reset'): boolean => {
  const adminEnabled = isAdminEnabled();
  const hasSession = sessionStorage.getItem(ADMIN_SESSION_KEY) === 'authenticated';
  
  // In development mode, require session authentication for admin features
  // This tests the security system even in development
  const shouldShow = import.meta.env.DEV ? hasSession : adminEnabled;
  
  // Also check if explicitly enabled via environment
  const envForced = import.meta.env.VITE_ADMIN_MODE === 'true';
  const finalShow = envForced || shouldShow;
  
  // ADMIN DEBUG LOGS DISABLED - no feature check logging
  
  if (!finalShow) return false;
  
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