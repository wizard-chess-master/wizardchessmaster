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
  
  // Log current status for testing
  console.log('🔐 Admin Status Check:', {
    envAdminMode,
    isDevelopment,
    hasSession: adminSession === 'authenticated',
    envVars: {
      VITE_ADMIN_MODE: import.meta.env.VITE_ADMIN_MODE,
      DEV: import.meta.env.DEV
    }
  });
  
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
  
  console.log('🔐 Authentication attempt:', {
    providedKey: key.substring(0, 3) + '***',
    expectedKey: adminKey.substring(0, 3) + '***',
    matches: key === adminKey
  });
  
  if (key === adminKey) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, 'authenticated');
    console.log('✅ Admin authentication successful');
    return true;
  }
  
  console.log('❌ Admin authentication failed');
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
  const adminEnabled = isAdminEnabled();
  const hasSession = sessionStorage.getItem(ADMIN_SESSION_KEY) === 'authenticated';
  
  // In development mode, require session authentication for admin features
  // This tests the security system even in development
  const shouldShow = import.meta.env.DEV ? hasSession : adminEnabled;
  
  console.log(`🔐 Feature "${feature}" check:`, {
    adminEnabled,
    hasSession,
    shouldShow,
    isDev: import.meta.env.DEV
  });
  
  if (!shouldShow) return false;
  
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