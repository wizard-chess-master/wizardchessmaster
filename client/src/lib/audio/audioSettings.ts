/**
 * Audio Settings Manager
 * Handles persistent audio settings and user preferences
 */

export interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  voiceVolume: number;
  ambientVolume: number;
  
  // Feature toggles
  enableMusic: boolean;
  enableSfx: boolean;
  enableVoice: boolean;
  enableAmbient: boolean;
  enable3DAudio: boolean;
  
  // Performance settings
  audioQuality: 'low' | 'medium' | 'high';
  preloadStrategy: 'none' | 'critical' | 'all';
  maxSimultaneousSounds: number;
  
  // Mobile specific
  useMobileOptimizations: boolean;
  reducedQualityOnMobile: boolean;
}

const DEFAULT_SETTINGS: AudioSettings = {
  masterVolume: 0.7,
  musicVolume: 0.5,
  sfxVolume: 0.7,
  voiceVolume: 0.8,
  ambientVolume: 0.3,
  
  enableMusic: true,
  enableSfx: true,
  enableVoice: true,
  enableAmbient: true,
  enable3DAudio: true,
  
  audioQuality: 'high',
  preloadStrategy: 'critical',
  maxSimultaneousSounds: 10,
  
  useMobileOptimizations: false,
  reducedQualityOnMobile: true
};

class AudioSettingsManager {
  private settings: AudioSettings;
  private listeners: Set<(settings: AudioSettings) => void> = new Set();
  private readonly storageKey = 'wizardChess_audioSettings';

  constructor() {
    this.settings = this.loadSettings();
    this.detectMobileAndApplyOptimizations();
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): AudioSettings {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new settings
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load audio settings:', error);
    }
    
    return { ...DEFAULT_SETTINGS };
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
      console.log('💾 Audio settings saved');
    } catch (error) {
      console.warn('Failed to save audio settings:', error);
    }
  }

  /**
   * Detect mobile device and apply optimizations
   */
  private detectMobileAndApplyOptimizations(): void {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const hasLowMemory = (navigator as any).deviceMemory && (navigator as any).deviceMemory < 4;
    const hasSlowConnection = (navigator as any).connection && 
      ['slow-2g', '2g', '3g'].includes((navigator as any).connection.effectiveType);

    if (isMobile || hasLowMemory || hasSlowConnection) {
      this.settings.useMobileOptimizations = true;
      
      // Apply mobile optimizations
      if (this.settings.reducedQualityOnMobile) {
        this.settings.audioQuality = 'low';
        this.settings.maxSimultaneousSounds = 5;
        this.settings.enable3DAudio = false;
        this.settings.preloadStrategy = 'none';
      }
      
      console.log('📱 Mobile optimizations applied');
    }
  }

  /**
   * Get current settings
   */
  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  /**
   * Update settings
   */
  updateSettings(updates: Partial<AudioSettings>): void {
    const oldSettings = { ...this.settings };
    this.settings = { ...this.settings, ...updates };
    
    // Save to localStorage
    this.saveSettings();
    
    // Notify listeners
    this.notifyListeners();
    
    // Log significant changes
    if (oldSettings.masterVolume !== this.settings.masterVolume) {
      console.log(`🔊 Master volume: ${Math.round(this.settings.masterVolume * 100)}%`);
    }
    if (oldSettings.audioQuality !== this.settings.audioQuality) {
      console.log(`🎵 Audio quality: ${this.settings.audioQuality}`);
    }
  }

  /**
   * Get effective volume for a category
   */
  getEffectiveVolume(category: 'music' | 'sfx' | 'voice' | 'ambient'): number {
    const categoryVolume = this.settings[`${category}Volume`];
    return this.settings.masterVolume * categoryVolume;
  }

  /**
   * Check if a category is enabled
   */
  isCategoryEnabled(category: 'music' | 'sfx' | 'voice' | 'ambient'): boolean {
    const enableKey = `enable${category.charAt(0).toUpperCase() + category.slice(1)}` as keyof AudioSettings;
    return this.settings[enableKey] as boolean;
  }

  /**
   * Quick mute/unmute all
   */
  toggleMute(): void {
    const isMuted = this.settings.masterVolume === 0;
    this.updateSettings({ 
      masterVolume: isMuted ? 0.7 : 0 
    });
  }

  /**
   * Reset to default settings
   */
  resetToDefaults(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.detectMobileAndApplyOptimizations();
    this.saveSettings();
    this.notifyListeners();
    console.log('🔄 Audio settings reset to defaults');
  }

  /**
   * Add settings change listener
   */
  addListener(listener: (settings: AudioSettings) => void): () => void {
    this.listeners.add(listener);
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of settings change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getSettings());
      } catch (error) {
        console.error('Error in audio settings listener:', error);
      }
    });
  }

  /**
   * Export settings as JSON
   */
  exportSettings(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  /**
   * Import settings from JSON
   */
  importSettings(json: string): boolean {
    try {
      const imported = JSON.parse(json);
      this.updateSettings(imported);
      return true;
    } catch (error) {
      console.error('Failed to import audio settings:', error);
      return false;
    }
  }

  /**
   * Get performance recommendations based on device
   */
  getPerformanceRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this.settings.useMobileOptimizations) {
      recommendations.push('Mobile device detected - optimizations applied');
    }
    
    if (this.settings.maxSimultaneousSounds > 10) {
      recommendations.push('Consider reducing max simultaneous sounds for better performance');
    }
    
    if (this.settings.audioQuality === 'high' && this.settings.useMobileOptimizations) {
      recommendations.push('Consider using medium or low quality on mobile devices');
    }
    
    if (this.settings.enable3DAudio && this.settings.useMobileOptimizations) {
      recommendations.push('3D audio may impact performance on mobile devices');
    }
    
    return recommendations;
  }
}

// Export singleton instance
export const audioSettings = new AudioSettingsManager();