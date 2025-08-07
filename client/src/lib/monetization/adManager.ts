/**
 * Ad Manager for Wizard Chess
 * Handles Google AdSense integration and ad display logic
 */

export interface AdConfig {
  publisherId: string;
  interstitialSlot: string;
  bannerSlot: string;
  rewardedSlot: string;
}

export interface AdManager {
  initialize(): Promise<void>;
  showInterstitialAd(): Promise<boolean>;
  showRewardedAd(): Promise<boolean>;
  showBannerAd(containerId: string): void;
  hideBannerAd(containerId: string): void;
  isAdFree(): boolean;
  setAdFreeStatus(adFree: boolean): void;
}

class GoogleAdSenseManager implements AdManager {
  private adConfig: AdConfig;
  private isInitialized = false;
  private adFreeStatus = false;

  constructor(config: AdConfig) {
    this.adConfig = config;
    this.loadAdFreeStatus();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load Google AdSense script
      const script = document.createElement('script');
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${this.adConfig.publisherId}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      
      document.head.appendChild(script);
      
      // Wait for script to load
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });

      this.isInitialized = true;
      console.log('🎯 AdSense initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize AdSense:', error);
    }
  }

  async showInterstitialAd(): Promise<boolean> {
    if (this.adFreeStatus) {
      console.log('🚫 User has ad-free version, skipping interstitial');
      return true;
    }

    if (!this.isInitialized) {
      console.warn('⚠️ AdSense not initialized, skipping interstitial');
      return false;
    }

    try {
      console.log('📺 Showing interstitial ad...');
      
      // Create temporary overlay for interstitial
      const overlay = document.createElement('div');
      overlay.id = 'interstitial-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
      `;

      const adContainer = document.createElement('div');
      adContainer.innerHTML = `
        <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; max-width: 90vw;">
          <h3 style="margin: 0 0 15px 0; color: #333;">Game Complete!</h3>
          <ins class="adsbygoogle"
               style="display:block"
               data-ad-client="ca-pub-${this.adConfig.publisherId}"
               data-ad-slot="${this.adConfig.interstitialSlot}"
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
          <div style="margin-top: 15px;">
            <button id="close-ad" style="
              background: #4CAF50;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 4px;
              cursor: pointer;
              margin-right: 10px;
            ">Continue Game</button>
            <button id="upgrade-ad" style="
              background: #FF9800;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 4px;
              cursor: pointer;
            ">Remove Ads ($2.99)</button>
          </div>
        </div>
      `;

      overlay.appendChild(adContainer);
      document.body.appendChild(overlay);

      // Initialize the ad
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (e) {
        console.warn('AdSense push failed:', e);
      }

      // Handle user interactions
      return new Promise((resolve) => {
        const closeBtn = document.getElementById('close-ad');
        const upgradeBtn = document.getElementById('upgrade-ad');

        const cleanup = () => {
          document.body.removeChild(overlay);
          resolve(true);
        };

        closeBtn?.addEventListener('click', cleanup);
        upgradeBtn?.addEventListener('click', () => {
          this.showUpgradePrompt();
          cleanup();
        });

        // Auto-close after 10 seconds
        setTimeout(cleanup, 10000);
      });

    } catch (error) {
      console.error('❌ Interstitial ad error:', error);
      return false;
    }
  }

  async showRewardedAd(): Promise<boolean> {
    if (this.adFreeStatus) {
      console.log('🎁 User has ad-free version, granting reward directly');
      return true;
    }

    if (!this.isInitialized) {
      console.warn('⚠️ AdSense not initialized, skipping rewarded ad');
      return false;
    }

    try {
      console.log('🎁 Showing rewarded ad...');
      
      // Create rewarded ad overlay
      const overlay = document.createElement('div');
      overlay.id = 'rewarded-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
      `;

      const adContainer = document.createElement('div');
      adContainer.innerHTML = `
        <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; max-width: 90vw;">
          <h3 style="margin: 0 0 15px 0; color: #333;">Watch Ad for Reward</h3>
          <p style="color: #666; margin-bottom: 15px;">Watch this short ad to get your hint or undo!</p>
          <ins class="adsbygoogle"
               style="display:block"
               data-ad-client="ca-pub-${this.adConfig.publisherId}"
               data-ad-slot="${this.adConfig.rewardedSlot}"
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
          <div style="margin-top: 15px;">
            <button id="claim-reward" style="
              background: #4CAF50;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 4px;
              cursor: pointer;
              margin-right: 10px;
            ">Claim Reward</button>
            <button id="skip-ad" style="
              background: #9E9E9E;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 4px;
              cursor: pointer;
            ">Skip</button>
          </div>
        </div>
      `;

      overlay.appendChild(adContainer);
      document.body.appendChild(overlay);

      // Initialize the ad
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (e) {
        console.warn('AdSense push failed:', e);
      }

      // Handle user interactions
      return new Promise((resolve) => {
        const claimBtn = document.getElementById('claim-reward');
        const skipBtn = document.getElementById('skip-ad');

        const cleanup = (success: boolean) => {
          document.body.removeChild(overlay);
          resolve(success);
        };

        claimBtn?.addEventListener('click', () => cleanup(true));
        skipBtn?.addEventListener('click', () => cleanup(false));

        // Auto-reward after 15 seconds
        setTimeout(() => cleanup(true), 15000);
      });

    } catch (error) {
      console.error('❌ Rewarded ad error:', error);
      return false;
    }
  }

  showBannerAd(containerId: string): void {
    if (this.adFreeStatus) {
      console.log('🚫 User has ad-free version, skipping banner');
      return;
    }

    if (!this.isInitialized) {
      console.warn('⚠️ AdSense not initialized, skipping banner');
      return;
    }

    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`⚠️ Banner container ${containerId} not found`);
      return;
    }

    try {
      container.innerHTML = `
        <ins class="adsbygoogle"
             style="display:block"
             data-ad-client="ca-pub-${this.adConfig.publisherId}"
             data-ad-slot="${this.adConfig.bannerSlot}"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
      `;

      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      console.log(`📰 Banner ad loaded in ${containerId}`);
    } catch (error) {
      console.error('❌ Banner ad error:', error);
    }
  }

  hideBannerAd(containerId: string): void {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '';
    }
  }

  isAdFree(): boolean {
    return this.adFreeStatus;
  }

  setAdFreeStatus(adFree: boolean): void {
    this.adFreeStatus = adFree;
    localStorage.setItem('wizard-chess-ad-free', JSON.stringify(adFree));
    console.log(`💎 Ad-free status updated: ${adFree}`);
    
    // Hide all existing banner ads if going ad-free
    if (adFree) {
      ['game-banner-top', 'game-banner-bottom', 'menu-banner'].forEach(id => {
        this.hideBannerAd(id);
      });
    }
  }

  private loadAdFreeStatus(): void {
    try {
      const stored = localStorage.getItem('wizard-chess-ad-free');
      this.adFreeStatus = stored ? JSON.parse(stored) : false;
    } catch {
      this.adFreeStatus = false;
    }
  }

  private showUpgradePrompt(): void {
    // This will be handled by the payment system
    window.dispatchEvent(new CustomEvent('show-upgrade-prompt'));
  }
}

// Singleton instance
let adManager: AdManager | null = null;

export const getAdManager = (): AdManager => {
  if (!adManager) {
    // Default config - should be replaced with real publisher ID
    const config: AdConfig = {
      publisherId: 'DEMO-PUBLISHER-ID', // Replace with real AdSense publisher ID
      interstitialSlot: '1234567890',
      bannerSlot: '0987654321',
      rewardedSlot: '1122334455'
    };
    adManager = new GoogleAdSenseManager(config);
  }
  return adManager;
};

export const initializeAds = async (): Promise<void> => {
  const manager = getAdManager();
  await manager.initialize();
};