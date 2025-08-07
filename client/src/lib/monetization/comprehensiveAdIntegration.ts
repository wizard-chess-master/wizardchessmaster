/**
 * Comprehensive Ad Integration System for Wizard Chess
 * Handles post-game interstitials, in-play banners, and rewarded videos for hints/undos
 */

import { getAdManager } from './adManager';
import { getPaymentManager } from './paymentManager';

export interface AdIntegrationConfig {
  enablePostGameAds: boolean;
  enableInPlayBanners: boolean;
  enableRewardedHints: boolean;
  enableRewardedUndos: boolean;
  interstitialDelay: number; // seconds
  bannerRefreshRate: number; // seconds
}

class ComprehensiveAdIntegration {
  private config: AdIntegrationConfig = {
    enablePostGameAds: true,
    enableInPlayBanners: true,
    enableRewardedHints: true,
    enableRewardedUndos: true,
    interstitialDelay: 2,
    bannerRefreshRate: 30
  };

  private gameEndCount = 0;
  private lastBannerRefresh = 0;
  private hintsUsed = 0;
  private undosUsed = 0;

  // Post-game interstitial ads
  async showPostGameAd(): Promise<void> {
    const adManager = getAdManager();
    const paymentManager = getPaymentManager();

    // Skip if user has premium
    if (paymentManager?.isUserPremium()) {
      console.log('🚫 Skipping post-game ad - user has premium');
      return;
    }

    // Skip if ads are disabled
    if (!this.config.enablePostGameAds || adManager.isAdFree()) {
      return;
    }

    this.gameEndCount++;
    
    // Show interstitial every 2nd game completion
    if (this.gameEndCount % 2 === 0) {
      console.log('📺 Showing post-game interstitial ad...');
      
      // Delay before showing ad to avoid interrupting victory celebration
      await new Promise(resolve => setTimeout(resolve, this.config.interstitialDelay * 1000));
      
      try {
        await adManager.showInterstitialAd();
        console.log('✅ Post-game interstitial ad completed');
      } catch (error) {
        console.error('❌ Post-game interstitial ad failed:', error);
      }
    }
  }

  // In-play banner management
  refreshInPlayBanners(): void {
    const adManager = getAdManager();
    const paymentManager = getPaymentManager();

    // Skip if user has premium or ads are disabled
    if (paymentManager?.isUserPremium() || adManager.isAdFree() || !this.config.enableInPlayBanners) {
      return;
    }

    const now = Date.now();
    if (now - this.lastBannerRefresh > this.config.bannerRefreshRate * 1000) {
      console.log('🔄 Refreshing in-play banner ads...');
      
      // Refresh existing banners
      const bannerIds = ['game-banner-top', 'game-banner-bottom', 'sidebar-banner'];
      bannerIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          adManager.hideBannerAd(id);
          setTimeout(() => adManager.showBannerAd(id), 500);
        }
      });

      this.lastBannerRefresh = now;
    }
  }

  // Rewarded video for hints
  async requestRewardedHint(): Promise<boolean> {
    const adManager = getAdManager();
    const paymentManager = getPaymentManager();

    // Premium users get unlimited hints
    if (paymentManager?.isUserPremium()) {
      console.log('🎯 Premium user - hint granted without ad');
      return true;
    }

    // Free users: limit to 3 hints per session, then require ads
    this.hintsUsed++;
    
    if (this.hintsUsed <= 3) {
      console.log(`🆓 Free hint granted (${this.hintsUsed}/3)`);
      return true;
    }

    if (!this.config.enableRewardedHints) {
      console.log('🚫 Rewarded hints disabled - hint denied');
      return false;
    }

    console.log('📺 Showing rewarded video for hint...');
    
    try {
      const success = await adManager.showRewardedAd();
      if (success) {
        console.log('✅ Rewarded video completed - hint granted');
        return true;
      } else {
        console.log('❌ Rewarded video failed - hint denied');
        return false;
      }
    } catch (error) {
      console.error('❌ Rewarded video error:', error);
      return false;
    }
  }

  // Rewarded video for undos
  async requestRewardedUndo(): Promise<boolean> {
    const adManager = getAdManager();
    const paymentManager = getPaymentManager();

    // Premium users get unlimited undos
    if (paymentManager?.isUserPremium()) {
      console.log('↩️ Premium user - undo granted without ad');
      return true;
    }

    // Free users: limit to 2 undos per game, then require ads
    this.undosUsed++;
    
    if (this.undosUsed <= 2) {
      console.log(`🆓 Free undo granted (${this.undosUsed}/2)`);
      return true;
    }

    if (!this.config.enableRewardedUndos) {
      console.log('🚫 Rewarded undos disabled - undo denied');
      return false;
    }

    console.log('📺 Showing rewarded video for undo...');
    
    try {
      const success = await adManager.showRewardedAd();
      if (success) {
        console.log('✅ Rewarded video completed - undo granted');
        return true;
      } else {
        console.log('❌ Rewarded video failed - undo denied');
        return false;
      }
    } catch (error) {
      console.error('❌ Rewarded video error:', error);
      return false;
    }
  }

  // Reset session counters (called on new game)
  resetSessionCounters(): void {
    this.hintsUsed = 0;
    this.undosUsed = 0;
    console.log('🔄 Ad integration session counters reset');
  }

  // Configuration methods
  updateConfig(newConfig: Partial<AdIntegrationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Ad integration config updated:', this.config);
  }

  getUsageStats(): {
    gameEndCount: number;
    hintsUsed: number;
    undosUsed: number;
    lastBannerRefresh: number;
  } {
    return {
      gameEndCount: this.gameEndCount,
      hintsUsed: this.hintsUsed,
      undosUsed: this.undosUsed,
      lastBannerRefresh: this.lastBannerRefresh
    };
  }

  // Initialize ad integration
  initialize(): void {
    console.log('🎯 Comprehensive Ad Integration initialized');
    
    // Set up periodic banner refresh
    setInterval(() => {
      this.refreshInPlayBanners();
    }, 10000); // Check every 10 seconds

    // Listen for game state changes
    window.addEventListener('game-ended', () => {
      this.showPostGameAd();
    });

    window.addEventListener('new-game-started', () => {
      this.resetSessionCounters();
    });
  }
}

// Export singleton instance
export const comprehensiveAdIntegration = new ComprehensiveAdIntegration();

// Global access functions
export function showPostGameAd(): Promise<void> {
  return comprehensiveAdIntegration.showPostGameAd();
}

export function requestHintWithAd(): Promise<boolean> {
  return comprehensiveAdIntegration.requestRewardedHint();
}

export function requestUndoWithAd(): Promise<boolean> {
  return comprehensiveAdIntegration.requestRewardedUndo();
}

export function initializeAdIntegration(): void {
  comprehensiveAdIntegration.initialize();
}