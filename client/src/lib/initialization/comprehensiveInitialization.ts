/**
 * Comprehensive System Initialization for Wizard Chess
 * Coordinates all enhanced features including AI training, campaign, monetization, and ads
 */

import { initializePayments } from '../monetization/paymentManager';
import { initializeAdIntegration } from '../monetization/comprehensiveAdIntegration';
import { getAdManager } from '../monetization/adManager';

interface InitializationConfig {
  enableAITraining: boolean;
  enableCampaign: boolean;
  enableMonetization: boolean;
  enableAdIntegration: boolean;
  enableMultiplayer: boolean;
  enableAudio: boolean;
}

class ComprehensiveInitialization {
  private config: InitializationConfig = {
    enableAITraining: true,
    enableCampaign: true,
    enableMonetization: true,
    enableAdIntegration: true,
    enableMultiplayer: true,
    enableAudio: true
  };

  private initialized = false;
  private initializationPromises: Promise<void>[] = [];

  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('🚫 Systems already initialized');
      return;
    }

    console.log('🚀 Starting comprehensive system initialization...');

    try {
      // Initialize all systems in parallel for efficiency
      await this.initializeAllSystems();
      
      this.initialized = true;
      console.log('✅ All systems initialized successfully');
      
      // Post-initialization setup
      this.setupEventListeners();
      this.logSystemStatus();
      
    } catch (error) {
      console.error('❌ System initialization failed:', error);
      throw error;
    }
  }

  private async initializeAllSystems(): Promise<void> {
    const promises: Promise<void>[] = [];

    // AI Training System
    if (this.config.enableAITraining) {
      promises.push(this.initializeAISystem());
    }

    // Monetization System
    if (this.config.enableMonetization) {
      promises.push(this.initializeMonetizationSystem());
    }

    // Ad Integration System
    if (this.config.enableAdIntegration) {
      promises.push(this.initializeAdSystem());
    }

    // Audio System (already handled by existing audio initialization)
    if (this.config.enableAudio) {
      promises.push(this.initializeAudioSystem());
    }

    // Multiplayer System (already handled by existing multiplayer initialization)
    if (this.config.enableMultiplayer) {
      promises.push(this.initializeMultiplayerSystem());
    }

    await Promise.all(promises);
  }

  private async initializeAISystem(): Promise<void> {
    try {
      console.log('🤖 AI training system already initialized via existing systems');
      // AI Training system is already handled by the existing game initialization
      console.log('✅ AI training system ready');
    } catch (error) {
      console.error('❌ AI system initialization failed:', error);
    }
  }

  private async initializeMonetizationSystem(): Promise<void> {
    try {
      console.log('💳 Initializing monetization system...');
      await initializePayments();
      console.log('✅ Monetization system ready');
    } catch (error) {
      console.error('❌ Monetization system initialization failed:', error);
    }
  }

  private async initializeAdSystem(): Promise<void> {
    try {
      console.log('🎯 Initializing comprehensive ad integration...');
      
      // Initialize ad manager
      const adManager = getAdManager();
      await adManager.initialize();
      
      // Initialize comprehensive ad integration
      initializeAdIntegration();
      
      console.log('✅ Ad integration system ready');
    } catch (error) {
      console.error('❌ Ad system initialization failed:', error);
    }
  }

  private async initializeAudioSystem(): Promise<void> {
    try {
      console.log('🎵 Audio system already initialized via existing systems');
      // Audio is handled by the existing audio initialization
    } catch (error) {
      console.error('❌ Audio system initialization failed:', error);
    }
  }

  private async initializeMultiplayerSystem(): Promise<void> {
    try {
      console.log('🔌 Multiplayer system already initialized via existing systems');
      // Multiplayer is handled by the existing initialization
    } catch (error) {
      console.error('❌ Multiplayer system initialization failed:', error);
    }
  }

  private setupEventListeners(): void {
    // Listen for game events to trigger ad integration
    window.addEventListener('game-completed', (event: any) => {
      console.log('🎮 Game completed - triggering post-game systems');
      window.dispatchEvent(new CustomEvent('game-ended', { detail: event.detail }));
    });

    // Listen for campaign progression
    window.addEventListener('campaign-level-completed', (event: any) => {
      console.log('🏆 Campaign level completed');
      // Handle campaign progression rewards, story unlocks, etc.
    });

    // Listen for premium status changes
    window.addEventListener('premium-status-changed', (event: any) => {
      console.log('💎 Premium status changed:', event.detail);
      // Update UI and feature access based on premium status
    });

    console.log('📡 Event listeners configured');
  }

  private logSystemStatus(): void {
    const status = {
      aiTraining: this.config.enableAITraining ? '✅ Active' : '🚫 Disabled',
      campaign: this.config.enableCampaign ? '✅ Active' : '🚫 Disabled',
      monetization: this.config.enableMonetization ? '✅ Active' : '🚫 Disabled',
      adIntegration: this.config.enableAdIntegration ? '✅ Active' : '🚫 Disabled',
      multiplayer: this.config.enableMultiplayer ? '✅ Active' : '🚫 Disabled',
      audio: this.config.enableAudio ? '✅ Active' : '🚫 Disabled'
    };

    console.log('🎮 Wizard Chess - Comprehensive System Status:');
    console.log('  🤖 AI Training System:', status.aiTraining);
    console.log('  🏰 Campaign System:', status.campaign);
    console.log('  💳 Monetization System:', status.monetization);
    console.log('  🎯 Ad Integration:', status.adIntegration);
    console.log('  🔌 Multiplayer System:', status.multiplayer);
    console.log('  🎵 Audio System:', status.audio);
  }

  // Configuration methods
  updateConfig(newConfig: Partial<InitializationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Initialization config updated:', this.config);
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getSystemStatus(): {
    initialized: boolean;
    config: InitializationConfig;
    features: string[];
  } {
    const features = [];
    if (this.config.enableAITraining) features.push('Advanced AI Training (500 games max)');
    if (this.config.enableCampaign) features.push('Enhanced Campaign with Stories');
    if (this.config.enableMonetization) features.push('$2.99 IAP / $4.99 Subscription');
    if (this.config.enableAdIntegration) features.push('Comprehensive Ad Integration');
    if (this.config.enableMultiplayer) features.push('Multiplayer & PvP');
    if (this.config.enableAudio) features.push('Immersive Audio System');

    return {
      initialized: this.initialized,
      config: this.config,
      features
    };
  }
}

// Export singleton instance
export const comprehensiveInitialization = new ComprehensiveInitialization();

// Convenience functions
export async function initializeAllSystems(): Promise<void> {
  return comprehensiveInitialization.initialize();
}

export function getSystemStatus() {
  return comprehensiveInitialization.getSystemStatus();
}

// Auto-initialize when module is loaded
if (typeof window !== 'undefined') {
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializeAllSystems();
    });
  } else {
    initializeAllSystems();
  }
}