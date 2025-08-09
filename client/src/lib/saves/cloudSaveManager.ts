import authManager from '../auth/authManager';

export interface GameSaveData {
  campaignProgress: {
    levels: any[];
    currentLevelId: string | null;
    playerStats: any;
  };
  achievements: {
    unlockedAchievements: string[];
    progress: any;
    experiencePoints: number;
  };
  playerStats: {
    totalGames: number;
    totalWins: number;
    totalLosses: number;
    winRate: number;
    averageGameTime: number;
    fastestWin: number | null;
  };
  gameSettings: {
    audioEnabled: boolean;
    volume: number;
    theme: string;
    boardTheme: string;
  };
}

export interface SaveResponse {
  success: boolean;
  saveData?: any;
  lastSyncedAt?: string;
  message?: string;
  error?: string;
  requiresPremium?: boolean;
}

class CloudSaveManager {
  private lastSyncTime: Date | null = null;
  private autoSaveInterval: NodeJS.Timeout | null = null;
  private pendingChanges = false;

  constructor() {
    // Auto-save every 5 minutes if there are pending changes
    this.autoSaveInterval = setInterval(() => {
      if (this.pendingChanges && authManager.isPremium()) {
        this.saveToCloud();
      }
    }, 5 * 60 * 1000);
  }

  // Mark that there are changes to save
  markPendingChanges(): void {
    this.pendingChanges = true;
  }

  // Get current game data from localStorage stores
  private getCurrentGameData(): GameSaveData {
    try {
      // Get campaign progress
      const campaignStore = localStorage.getItem('campaign-storage');
      const campaignData = campaignStore ? JSON.parse(campaignStore) : {};

      // Get achievements
      const achievementStore = localStorage.getItem('fantasy-chess-achievements');
      const achievementData = achievementStore ? JSON.parse(achievementStore) : {};

      // Get audio settings
      const audioStore = localStorage.getItem('wizard-chess-audio');
      const audioData = audioStore ? JSON.parse(audioStore) : {};

      // Get game settings from various stores
      const gameSettings = {
        audioEnabled: audioData.isEnabled || false,
        volume: audioData.masterVolume || 0.7,
        theme: localStorage.getItem('wizard-chess-theme') || 'medieval',
        boardTheme: localStorage.getItem('wizard-chess-board-theme') || 'classic'
      };

      const saveData: GameSaveData = {
        campaignProgress: {
          levels: campaignData.state?.levels || [],
          currentLevelId: campaignData.state?.currentLevelId || null,
          playerStats: campaignData.state?.playerStats || {}
        },
        achievements: {
          unlockedAchievements: achievementData.unlockedAchievements || [],
          progress: achievementData.progress || {},
          experiencePoints: achievementData.experiencePoints || 0
        },
        playerStats: {
          totalGames: 0,
          totalWins: 0,
          totalLosses: 0,
          winRate: 0,
          averageGameTime: 0,
          fastestWin: null
        },
        gameSettings
      };

      return saveData;
    } catch (error) {
      console.error('❌ Failed to gather current game data:', error);
      throw new Error('Failed to collect save data');
    }
  }

  // Save current progress to cloud (premium feature)
  async saveToCloud(): Promise<SaveResponse> {
    try {
      if (!authManager.isAuthenticated()) {
        return {
          success: false,
          error: 'Must be logged in to save to cloud'
        };
      }

      if (!authManager.isPremium()) {
        return {
          success: false,
          error: 'Premium subscription required for cloud saves',
          requiresPremium: true
        };
      }

      const gameData = this.getCurrentGameData();

      const response = await fetch('/api/savedata/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(gameData),
        credentials: 'include'
      });

      const result: SaveResponse = await response.json();

      if (result.success) {
        this.pendingChanges = false;
        this.lastSyncTime = new Date();
        console.log('☁️ Game progress saved to cloud');
      }

      return result;
    } catch (error) {
      console.error('❌ Cloud save failed:', error);
      return {
        success: false,
        error: 'Network error during cloud save'
      };
    }
  }

  // Load progress from cloud (premium feature)
  async loadFromCloud(): Promise<SaveResponse> {
    try {
      if (!authManager.isAuthenticated()) {
        return {
          success: false,
          error: 'Must be logged in to load from cloud'
        };
      }

      if (!authManager.isPremium()) {
        return {
          success: false,
          error: 'Premium subscription required for cloud saves',
          requiresPremium: true
        };
      }

      const response = await fetch('/api/savedata/sync', {
        method: 'GET',
        credentials: 'include'
      });

      const result: SaveResponse = await response.json();

      if (result.success && result.saveData) {
        await this.applyLoadedData(result.saveData);
        this.lastSyncTime = new Date();
        console.log('☁️ Game progress loaded from cloud');
      }

      return result;
    } catch (error) {
      console.error('❌ Cloud load failed:', error);
      return {
        success: false,
        error: 'Network error during cloud load'
      };
    }
  }

  // Create local backup (available to all logged-in users)
  async createLocalBackup(): Promise<SaveResponse> {
    try {
      if (!authManager.isAuthenticated()) {
        return {
          success: false,
          error: 'Must be logged in to create backup'
        };
      }

      const gameData = this.getCurrentGameData();

      const response = await fetch('/api/savedata/local-backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(gameData),
        credentials: 'include'
      });

      const result: SaveResponse = await response.json();

      if (result.success) {
        console.log('💾 Local backup created');
      }

      return result;
    } catch (error) {
      console.error('❌ Local backup failed:', error);
      return {
        success: false,
        error: 'Network error during local backup'
      };
    }
  }

  // Restore from local backup (available to all logged-in users)
  async restoreFromLocalBackup(): Promise<SaveResponse> {
    try {
      if (!authManager.isAuthenticated()) {
        return {
          success: false,
          error: 'Must be logged in to restore backup'
        };
      }

      const response = await fetch('/api/savedata/local-backup', {
        method: 'GET',
        credentials: 'include'
      });

      const result: SaveResponse = await response.json();

      if (result.success && result.saveData) {
        await this.applyLoadedData(result.saveData);
        console.log('💾 Local backup restored');
      }

      return result;
    } catch (error) {
      console.error('❌ Local backup restore failed:', error);
      return {
        success: false,
        error: 'Network error during backup restore'
      };
    }
  }

  // Apply loaded data to localStorage stores
  private async applyLoadedData(saveData: any): Promise<void> {
    try {
      // Apply campaign progress
      if (saveData.campaignProgress) {
        const campaignStore = {
          state: {
            levels: saveData.campaignProgress.levels || [],
            currentLevelId: saveData.campaignProgress.currentLevelId,
            playerStats: saveData.campaignProgress.playerStats || {}
          },
          version: 0
        };
        localStorage.setItem('campaign-storage', JSON.stringify(campaignStore));
      }

      // Apply achievements
      if (saveData.achievements) {
        localStorage.setItem('fantasy-chess-achievements', JSON.stringify(saveData.achievements));
      }

      // Apply game settings
      if (saveData.gameSettings) {
        const audioSettings = {
          isEnabled: saveData.gameSettings.audioEnabled,
          masterVolume: saveData.gameSettings.volume
        };
        localStorage.setItem('wizard-chess-audio', JSON.stringify(audioSettings));
        localStorage.setItem('wizard-chess-theme', saveData.gameSettings.theme);
        localStorage.setItem('wizard-chess-board-theme', saveData.gameSettings.boardTheme);
      }

      // Trigger page reload to apply changes
      console.log('🔄 Reloading to apply saved data...');
      window.location.reload();
    } catch (error) {
      console.error('❌ Failed to apply loaded data:', error);
      throw error;
    }
  }

  // Get last sync time
  getLastSyncTime(): Date | null {
    return this.lastSyncTime;
  }

  // Check if user can use cloud saves
  canUseCloudSaves(): boolean {
    return authManager.isAuthenticated() && authManager.isPremium();
  }

  // Check if user can use local backups
  canUseLocalBackups(): boolean {
    return authManager.isAuthenticated();
  }

  // Auto-save when game state changes
  autoSave(): void {
    this.markPendingChanges();
    
    // For premium users, save to cloud after 30 seconds of inactivity
    if (authManager.isPremium()) {
      setTimeout(() => {
        if (this.pendingChanges) {
          this.saveToCloud();
        }
      }, 30 * 1000);
    }
  }

  // Cleanup
  destroy(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
  }
}

// Singleton instance
const cloudSaveManager = new CloudSaveManager();
export default cloudSaveManager;