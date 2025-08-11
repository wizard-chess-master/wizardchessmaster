import { create } from 'zustand';
import { useEffect } from 'react';
import authManager, { type AuthUser } from '../auth/authManager';
import cloudSaveManager from '../saves/cloudSaveManager';

export interface AuthState {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  register: (data: { username: string; email: string; password: string; displayName: string }) => Promise<boolean>;
  login: (data: { username: string; password: string }) => Promise<boolean>;
  logout: () => Promise<boolean>;
  clearError: () => void;
  checkSession: () => Promise<void>;
  isPremium: () => boolean;
}

export const useAuth = create<AuthState & AuthActions>((set, get) => {
  // Initialize auth manager subscription
  let unsubscribe: (() => void) | null = null;
  
  // Set up subscription only on client side
  if (typeof window !== 'undefined') {
    unsubscribe = authManager.subscribe((state) => {
      set({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        isLoading: state.isLoading
      });
    });
    
    // Clean up subscription on unmount
    window.addEventListener('beforeunload', () => {
      unsubscribe?.();
      cloudSaveManager.destroy();
    });
  }

  return {
    // Initial state
    user: null,
    isLoggedIn: false,
    isLoading: true,
    error: null,

    // Actions
    register: async (userData) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await authManager.register(userData);
        
        if (response.success) {
          set({ error: null });
          return true;
        } else {
          set({ error: response.error || 'Registration failed' });
          return false;
        }
      } catch (error) {
        set({ error: 'Network error during registration' });
        return false;
      } finally {
        set({ isLoading: false });
      }
    },

    login: async (credentials) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await authManager.login(credentials);
        
        if (response.success) {
          set({ error: null });
          
          // Try to load cloud saves for premium users
          if (authManager.isPremium()) {
            setTimeout(async () => {
              const cloudLoad = await cloudSaveManager.loadFromCloud();
              if (cloudLoad.success) {
                console.log('☁️ Cloud save auto-loaded after login');
              }
            }, 1000);
          }
          
          return true;
        } else {
          set({ error: response.error || 'Login failed' });
          return false;
        }
      } catch (error) {
        set({ error: 'Network error during login' });
        return false;
      } finally {
        set({ isLoading: false });
      }
    },

    logout: async () => {
      set({ isLoading: true, error: null });
      
      try {
        // Save current progress before logout for premium users
        if (authManager.isPremium()) {
          await cloudSaveManager.saveToCloud();
        }
        
        const response = await authManager.logout();
        
        if (response.success) {
          set({ error: null });
          return true;
        } else {
          set({ error: response.error || 'Logout failed' });
          return false;
        }
      } catch (error) {
        set({ error: 'Network error during logout' });
        return false;
      } finally {
        set({ isLoading: false });
      }
    },

    clearError: () => {
      set({ error: null });
    },

    checkSession: async () => {
      set({ isLoading: true });
      
      try {
        await authManager.checkSession();
        set({ error: null });
      } catch (error) {
        set({ error: 'Failed to check session' });
      } finally {
        set({ isLoading: false });
      }
    },

    isPremium: () => {
      const state = get();
      const authPremium = authManager.isPremium();
      console.log('🔍 useAuth isPremium check:', {
        stateUser: state.user?.username,
        stateUserPremium: state.user?.isPremium,
        authManagerPremium: authPremium,
        finalResult: state.user?.isPremium || authPremium
      });
      return state.user?.isPremium || authPremium;
    }
  };
});