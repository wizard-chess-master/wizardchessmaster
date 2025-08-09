import type { User } from '@shared/schema';

export interface AuthUser extends Omit<User, 'password'> {}

export interface AuthState {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  displayName: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  message?: string;
  error?: string;
}

class AuthManager {
  private currentUser: AuthUser | null = null;
  private listeners: Set<(state: AuthState) => void> = new Set();

  constructor() {
    this.checkSession();
  }

  // Subscribe to auth state changes
  subscribe(callback: (state: AuthState) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    const state: AuthState = {
      user: this.currentUser,
      isLoggedIn: !!this.currentUser,
      isLoading: false
    };
    this.listeners.forEach(callback => callback(state));
  }

  // Check current session with server
  async checkSession(): Promise<AuthUser | null> {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include'
      });
      const data: AuthResponse = await response.json();
      
      if (data.success && data.user) {
        this.currentUser = data.user;
        this.notifyListeners();
        console.log('✅ User session restored:', data.user.username);
        return data.user;
      } else {
        this.currentUser = null;
        this.notifyListeners();
        return null;
      }
    } catch (error) {
      console.error('❌ Session check failed:', error);
      this.currentUser = null;
      this.notifyListeners();
      return null;
    }
  }

  // Register new user
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData),
        credentials: 'include'
      });

      const data: AuthResponse = await response.json();
      
      if (data.success && data.user) {
        this.currentUser = data.user;
        this.notifyListeners();
        console.log('✅ User registered:', data.user.username);
      }

      return data;
    } catch (error) {
      console.error('❌ Registration failed:', error);
      return {
        success: false,
        error: 'Network error during registration'
      };
    }
  }

  // Login user
  async login(credentials: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials),
        credentials: 'include'
      });

      const data: AuthResponse = await response.json();
      
      if (data.success && data.user) {
        this.currentUser = data.user;
        this.notifyListeners();
        console.log('✅ User logged in:', data.user.username);
      }

      return data;
    } catch (error) {
      console.error('❌ Login failed:', error);
      return {
        success: false,
        error: 'Network error during login'
      };
    }
  }

  // Logout user
  async logout(): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      const data: AuthResponse = await response.json();
      
      if (data.success) {
        console.log('✅ User logged out');
      }

      // Clear local state regardless of server response
      this.currentUser = null;
      this.notifyListeners();

      return data;
    } catch (error) {
      console.error('❌ Logout failed:', error);
      
      // Still clear local state on network error
      this.currentUser = null;
      this.notifyListeners();
      
      return {
        success: false,
        error: 'Network error during logout'
      };
    }
  }

  // Get current user
  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  // Check if user is logged in
  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  // Check if user has premium access
  isPremium(): boolean {
    return this.currentUser?.isPremium || false;
  }

  // Get user's subscription status
  getSubscriptionStatus(): string | null {
    return this.currentUser?.subscriptionStatus || null;
  }
}

// Singleton instance
const authManager = new AuthManager();
export default authManager;