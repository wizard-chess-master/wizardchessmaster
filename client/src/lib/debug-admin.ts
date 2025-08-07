// Debug utilities for admin system testing
import { isAdminEnabled, isAdminFeatureEnabled, authenticateAdmin, logoutAdmin, getAdminStatus } from './admin';

declare global {
  interface Window {
    debugAdmin: {
      status: () => void;
      login: (key?: string) => boolean;
      logout: () => void;
      testFeatures: () => void;
      clearSession: () => void;
    };
  }
}

// Add debug functions to window for testing
window.debugAdmin = {
  status: () => {
    console.log('=== ADMIN DEBUG STATUS ===');
    const status = getAdminStatus();
    console.log('Admin Status:', status);
    console.log('Features enabled:');
    console.log('  Training:', isAdminFeatureEnabled('training'));
    console.log('  Debug:', isAdminFeatureEnabled('debug'));
    console.log('  Stats:', isAdminFeatureEnabled('stats'));
    console.log('  Reset:', isAdminFeatureEnabled('reset'));
    console.log('Session storage key:', sessionStorage.getItem('wizard-chess-admin-session'));
  },

  login: (key = 'wizard-admin-2025') => {
    console.log('=== ADMIN DEBUG LOGIN ===');
    console.log('Attempting login with key:', key);
    const result = authenticateAdmin(key);
    console.log('Login result:', result);
    window.debugAdmin.status();
    return result;
  },

  logout: () => {
    console.log('=== ADMIN DEBUG LOGOUT ===');
    logoutAdmin();
    window.debugAdmin.status();
  },

  testFeatures: () => {
    console.log('=== ADMIN FEATURE TEST ===');
    const features = ['training', 'debug', 'stats', 'reset'] as const;
    features.forEach(feature => {
      const enabled = isAdminFeatureEnabled(feature);
      console.log(`Feature "${feature}":`, enabled ? '✅ ENABLED' : '❌ DISABLED');
    });
  },

  clearSession: () => {
    console.log('=== CLEARING ALL SESSIONS ===');
    sessionStorage.clear();
    window.debugAdmin.status();
  }
};

console.log('🔧 Admin debug utilities loaded. Available commands:');
console.log('  window.debugAdmin.status() - Check current admin status');
console.log('  window.debugAdmin.login() - Login with default key');
console.log('  window.debugAdmin.logout() - Logout admin');
console.log('  window.debugAdmin.testFeatures() - Test all admin features');
console.log('  window.debugAdmin.clearSession() - Clear all session storage');

export {};