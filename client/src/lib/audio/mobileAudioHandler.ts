/**
 * Mobile Audio Handler
 * Handles mobile-specific audio challenges and optimizations
 */

export interface MobileAudioState {
  isUnlocked: boolean;
  canAutoplay: boolean;
  hasUserGesture: boolean;
  orientation: 'portrait' | 'landscape';
  isInBackground: boolean;
  batteryLevel: number | null;
  isLowPowerMode: boolean;
}

class MobileAudioHandler {
  private state: MobileAudioState = {
    isUnlocked: false,
    canAutoplay: false,
    hasUserGesture: false,
    orientation: 'portrait',
    isInBackground: false,
    batteryLevel: null,
    isLowPowerMode: false
  };
  
  private audioContext: AudioContext | null = null;
  private silentAudio: HTMLAudioElement | null = null;
  private unlockPromise: Promise<void> | null = null;
  private listeners: Set<(state: MobileAudioState) => void> = new Set();

  constructor() {
    this.detectInitialState();
    this.setupEventListeners();
  }

  /**
   * Detect initial mobile state
   */
  private detectInitialState(): void {
    // Check if mobile
    const isMobile = this.isMobileDevice();
    
    if (isMobile) {
      // Check orientation
      this.updateOrientation();
      
      // Check battery status
      this.checkBatteryStatus();
      
      // Setup silent audio for iOS
      this.setupSilentAudio();
      
      console.log('📱 Mobile audio handler initialized');
    }
  }

  /**
   * Check if device is mobile
   */
  private isMobileDevice(): boolean {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
           ('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0);
  }

  /**
   * Setup event listeners for mobile-specific events
   */
  private setupEventListeners(): void {
    // User interaction to unlock audio
    ['touchstart', 'touchend', 'click'].forEach(event => {
      document.addEventListener(event, () => this.handleUserGesture(), { 
        once: true, 
        passive: true 
      });
    });

    // Orientation change
    window.addEventListener('orientationchange', () => this.updateOrientation());
    window.addEventListener('resize', () => this.updateOrientation());

    // Page visibility
    document.addEventListener('visibilitychange', () => {
      this.state.isInBackground = document.hidden;
      this.notifyListeners();
      
      if (document.hidden) {
        this.handleBackgroundMode();
      } else {
        this.handleForegroundMode();
      }
    });

    // iOS specific - handle audio interruptions
    if (this.isIOS()) {
      document.addEventListener('pause', () => this.handleAudioInterruption());
      document.addEventListener('resume', () => this.handleAudioResume());
    }
  }

  /**
   * Check if iOS device
   */
  private isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  /**
   * Setup silent audio for iOS audio unlock
   */
  private setupSilentAudio(): void {
    if (this.isIOS()) {
      // Create silent audio element
      this.silentAudio = new Audio();
      this.silentAudio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU2LjM2LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV6urq6urq6urq6urq6urq6urq6urq6urq6v////////////////////////////////8AAAAATGF2YzU2LjQxAAAAAAAAAAAAAAAAJAAAAAAAAAAAASDs90hvAAAAAAAAAAAAAAAAAAAA//MUZAAAAAGkAAAAAAAAA0gAAAAATEFN//MUZAMAAAGkAAAAAAAAA0gAAAAARTMu//MUZAYAAAGkAAAAAAAAA0gAAAAAOTku//MUZAkAAAGkAAAAAAAAA0gAAAAANVVV';
      this.silentAudio.loop = true;
      this.silentAudio.volume = 0.01;
      
      console.log('🔇 iOS silent audio prepared');
    }
  }

  /**
   * Handle user gesture to unlock audio
   */
  private async handleUserGesture(): Promise<void> {
    if (this.state.isUnlocked) return;

    console.log('👆 User gesture detected - unlocking audio');
    
    try {
      // Create or resume audio context
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Play silent audio on iOS
      if (this.silentAudio) {
        try {
          await this.silentAudio.play();
          console.log('🔊 iOS silent audio started');
        } catch (error) {
          console.warn('Failed to start iOS silent audio:', error);
        }
      }

      // Test autoplay capability
      await this.testAutoplay();

      this.state.isUnlocked = true;
      this.state.hasUserGesture = true;
      this.notifyListeners();
      
      console.log('✅ Audio unlocked successfully');
    } catch (error) {
      console.error('❌ Failed to unlock audio:', error);
    }
  }

  /**
   * Test autoplay capability
   */
  private async testAutoplay(): Promise<void> {
    try {
      const testAudio = new Audio();
      testAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';
      testAudio.volume = 0;
      
      await testAudio.play();
      testAudio.pause();
      
      this.state.canAutoplay = true;
      console.log('✅ Autoplay is supported');
    } catch (error) {
      this.state.canAutoplay = false;
      console.log('⚠️ Autoplay is not supported - user gesture required');
    }
  }

  /**
   * Update device orientation
   */
  private updateOrientation(): void {
    const isPortrait = window.innerHeight > window.innerWidth;
    this.state.orientation = isPortrait ? 'portrait' : 'landscape';
    this.notifyListeners();
    
    console.log(`📱 Orientation: ${this.state.orientation}`);
  }

  /**
   * Check battery status
   */
  private async checkBatteryStatus(): Promise<void> {
    try {
      const battery = await (navigator as any).getBattery?.();
      if (battery) {
        this.state.batteryLevel = battery.level;
        this.state.isLowPowerMode = battery.level < 0.2;
        
        battery.addEventListener('levelchange', () => {
          this.state.batteryLevel = battery.level;
          this.state.isLowPowerMode = battery.level < 0.2;
          this.notifyListeners();
        });
        
        console.log(`🔋 Battery: ${Math.round(battery.level * 100)}%`);
      }
    } catch (error) {
      console.log('Battery API not available');
    }
  }

  /**
   * Handle background mode
   */
  private handleBackgroundMode(): void {
    console.log('📱 App moved to background - pausing audio');
    
    // Pause silent audio to save battery
    if (this.silentAudio) {
      this.silentAudio.pause();
    }
    
    // Suspend audio context
    if (this.audioContext && this.audioContext.state === 'running') {
      this.audioContext.suspend();
    }
  }

  /**
   * Handle foreground mode
   */
  private handleForegroundMode(): void {
    console.log('📱 App moved to foreground - resuming audio');
    
    // Resume silent audio on iOS
    if (this.silentAudio && this.state.isUnlocked) {
      this.silentAudio.play().catch(() => {});
    }
    
    // Resume audio context
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  /**
   * Handle audio interruption (iOS)
   */
  private handleAudioInterruption(): void {
    console.log('⚠️ Audio interruption detected (phone call, alarm, etc.)');
    this.handleBackgroundMode();
  }

  /**
   * Handle audio resume after interruption
   */
  private handleAudioResume(): void {
    console.log('✅ Audio interruption ended');
    this.handleForegroundMode();
  }

  /**
   * Ensure audio is unlocked (returns promise)
   */
  async ensureUnlocked(): Promise<void> {
    if (this.state.isUnlocked) return;

    if (!this.unlockPromise) {
      this.unlockPromise = new Promise((resolve) => {
        const checkUnlocked = () => {
          if (this.state.isUnlocked) {
            resolve();
          } else {
            setTimeout(checkUnlocked, 100);
          }
        };
        checkUnlocked();
      });
    }

    return this.unlockPromise;
  }

  /**
   * Get current state
   */
  getState(): MobileAudioState {
    return { ...this.state };
  }

  /**
   * Add state change listener
   */
  addListener(listener: (state: MobileAudioState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getState());
      } catch (error) {
        console.error('Error in mobile audio listener:', error);
      }
    });
  }

  /**
   * Get mobile optimization recommendations
   */
  getOptimizationTips(): string[] {
    const tips: string[] = [];
    
    if (!this.state.isUnlocked) {
      tips.push('Tap anywhere to enable audio');
    }
    
    if (!this.state.canAutoplay) {
      tips.push('Audio requires user interaction to play');
    }
    
    if (this.state.isLowPowerMode) {
      tips.push('Low battery - audio quality reduced');
    }
    
    if (this.state.orientation === 'portrait' && this.isMobileDevice()) {
      tips.push('Rotate to landscape for better experience');
    }
    
    return tips;
  }

  /**
   * Dispose of handler
   */
  dispose(): void {
    if (this.silentAudio) {
      this.silentAudio.pause();
      this.silentAudio.src = '';
      this.silentAudio = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.listeners.clear();
    console.log('📱 Mobile audio handler disposed');
  }
}

// Export singleton instance
export const mobileAudioHandler = new MobileAudioHandler();