/**
 * Enhanced Audio Manager
 * Integrates all audio improvements: optimization, settings, mobile handling, and debugging
 */

import { audioOptimizer } from './audioOptimizer';
import { audioSettings } from './audioSettings';
import { mobileAudioHandler } from './mobileAudioHandler';
import { audioDebugger } from './audioDebugger';
import { wizardChessAudio } from './audioManager';

export interface AudioEvent {
  type: 'music' | 'sfx' | 'voice' | 'ambient';
  url: string;
  volume?: number;
  loop?: boolean;
  position?: { x: number; y: number };
}

class EnhancedAudioManager {
  private initialized = false;
  private activeAudioNodes: Set<AudioBufferSourceNode | HTMLAudioElement> = new Set();
  private currentMusic: HTMLAudioElement | null = null;
  private isMuted = false;

  /**
   * Initialize the enhanced audio system
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('🎵 Initializing Enhanced Audio System...');

    try {
      // Initialize all subsystems
      await Promise.all([
        audioOptimizer.initialize(),
        wizardChessAudio.initialize(),
        mobileAudioHandler.ensureUnlocked()
      ]);

      // Setup settings listeners
      this.setupSettingsListeners();

      // Setup mobile state listeners
      this.setupMobileListeners();

      this.initialized = true;
      console.log('✅ Enhanced Audio System initialized');

      // Run diagnostics in debug mode
      if (process.env.NODE_ENV === 'development') {
        setTimeout(() => {
          audioDebugger.runFullTest();
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Enhanced Audio System initialization failed:', error);
      audioDebugger.logError('initialization', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Setup settings change listeners
   */
  private setupSettingsListeners(): void {
    audioSettings.addListener((settings) => {
      // Apply volume changes
      this.applyVolumeSettings(settings);
      
      // Handle quality changes
      if (settings.audioQuality === 'low') {
        audioOptimizer.suspend();
      } else {
        audioOptimizer.resume();
      }
    });
  }

  /**
   * Setup mobile state listeners
   */
  private setupMobileListeners(): void {
    mobileAudioHandler.addListener((state) => {
      if (state.isInBackground) {
        this.pauseAll();
      } else if (state.isUnlocked) {
        this.resumeAll();
      }
      
      // Adjust quality for low battery
      if (state.isLowPowerMode) {
        audioSettings.updateSettings({ 
          audioQuality: 'low',
          enable3DAudio: false 
        });
      }
    });
  }

  /**
   * Apply volume settings
   */
  private applyVolumeSettings(settings: any): void {
    // Apply to wizard chess audio
    wizardChessAudio.setVolume(settings.masterVolume);
    wizardChessAudio.setMuted(settings.masterVolume === 0);
    
    // Apply to current music
    if (this.currentMusic) {
      this.currentMusic.volume = settings.masterVolume * settings.musicVolume;
    }
  }

  /**
   * Play audio with full optimization
   */
  async play(event: AudioEvent): Promise<void> {
    if (this.isMuted) return;

    const settings = audioSettings.getSettings();
    
    // Check if category is enabled
    const categoryMap = {
      music: settings.enableMusic,
      sfx: settings.enableSfx,
      voice: settings.enableVoice,
      ambient: settings.enableAmbient
    };
    
    if (!categoryMap[event.type]) return;

    // Ensure mobile audio is unlocked
    await mobileAudioHandler.ensureUnlocked();

    // Calculate effective volume
    const categoryVolume = settings[`${event.type}Volume`];
    const effectiveVolume = settings.masterVolume * categoryVolume * (event.volume || 1.0);

    try {
      // Log performance start
      const startTime = performance.now();
      
      // Play optimized audio
      await audioOptimizer.playOptimized(event.url, effectiveVolume);
      
      // Log performance
      const loadTime = performance.now() - startTime;
      audioDebugger.logPerformance('playback', loadTime);
      
    } catch (error) {
      console.error(`Failed to play ${event.type}:`, error);
      audioDebugger.logError('playback', error instanceof Error ? error.message : String(error), event);
      
      // Fallback to basic HTML audio
      this.playFallback(event.url, effectiveVolume);
    }
  }

  /**
   * Fallback audio playback
   */
  private playFallback(url: string, volume: number): void {
    try {
      const audio = new Audio(url);
      audio.volume = Math.min(1, Math.max(0, volume));
      audio.play().catch(error => {
        console.warn('Fallback audio failed:', error);
      });
      
      this.activeAudioNodes.add(audio);
      audio.addEventListener('ended', () => {
        this.activeAudioNodes.delete(audio);
      });
    } catch (error) {
      console.error('Critical audio failure:', error);
    }
  }

  /**
   * Play background music
   */
  async playMusic(url: string): Promise<void> {
    const settings = audioSettings.getSettings();
    if (!settings.enableMusic) return;

    // Stop current music
    this.stopMusic();

    try {
      await mobileAudioHandler.ensureUnlocked();
      
      // Preload music
      const cached = await audioOptimizer.getCachedAudio(url);
      
      if (cached.audio) {
        this.currentMusic = cached.audio.cloneNode() as HTMLAudioElement;
        this.currentMusic.loop = true;
        this.currentMusic.volume = settings.masterVolume * settings.musicVolume;
        
        await this.currentMusic.play();
        console.log('🎵 Music started:', url);
      }
    } catch (error) {
      console.error('Failed to play music:', error);
      audioDebugger.logError('music', error instanceof Error ? error.message : String(error), { url });
    }
  }

  /**
   * Stop background music
   */
  stopMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
      this.currentMusic = null;
      console.log('🎵 Music stopped');
    }
  }

  /**
   * Play UI sound effect
   */
  async playUISound(type: string): Promise<void> {
    const soundMap: Record<string, string> = {
      click: '/assets/sound-fx/button_click.mp3',
      hover: '/assets/sound-fx/button_hover.mp3',
      success: '/sounds/success.mp3',
      error: '/assets/sound-fx/error_chime.mp3',
      notification: '/assets/sound-fx/notification_ping.mp3'
    };
    
    const url = soundMap[type] || soundMap.click;
    
    await this.play({
      type: 'sfx',
      url,
      volume: 0.5
    });
  }

  /**
   * Play chess move sound
   */
  async playMoveSound(piece: string, capture: boolean = false): Promise<void> {
    const url = capture ? '/sounds/hit.mp3' : '/sounds/success.mp3';
    
    await this.play({
      type: 'sfx',
      url,
      volume: capture ? 0.7 : 0.5
    });
  }

  /**
   * Toggle mute
   */
  toggleMute(): void {
    this.isMuted = !this.isMuted;
    audioSettings.toggleMute();
    
    if (this.isMuted) {
      this.pauseAll();
    } else {
      this.resumeAll();
    }
    
    console.log(`🔊 Audio ${this.isMuted ? 'muted' : 'unmuted'}`);
  }

  /**
   * Pause all active audio
   */
  private pauseAll(): void {
    this.activeAudioNodes.forEach(node => {
      if (node instanceof HTMLAudioElement) {
        node.pause();
      }
    });
    
    if (this.currentMusic) {
      this.currentMusic.pause();
    }
    
    audioOptimizer.suspend();
  }

  /**
   * Resume all paused audio
   */
  private resumeAll(): void {
    this.activeAudioNodes.forEach(node => {
      if (node instanceof HTMLAudioElement && node.paused) {
        node.play().catch(() => {});
      }
    });
    
    if (this.currentMusic && this.currentMusic.paused) {
      this.currentMusic.play().catch(() => {});
    }
    
    audioOptimizer.resume();
  }

  /**
   * Preload critical game sounds
   */
  async preloadGameSounds(): Promise<void> {
    const sounds = [
      '/sounds/success.mp3',
      '/sounds/hit.mp3',
      '/assets/sound-fx/piece_move.mp3',
      '/assets/sound-fx/piece_capture.mp3',
      '/assets/sound-fx/check_warning.mp3',
      '/assets/sound-fx/checkmate_victory.mp3',
      '/assets/sound-fx/button_click.mp3',
      '/assets/sound-fx/game_start_fanfare.mp3'
    ];
    
    console.log('📦 Preloading game sounds...');
    await audioOptimizer.batchPreload(sounds, 'high');
    console.log('✅ Game sounds preloaded');
  }

  /**
   * Get current audio status
   */
  getStatus(): {
    initialized: boolean;
    muted: boolean;
    musicPlaying: boolean;
    settings: any;
    mobile: any;
    performance: any;
  } {
    return {
      initialized: this.initialized,
      muted: this.isMuted,
      musicPlaying: this.currentMusic !== null && !this.currentMusic.paused,
      settings: audioSettings.getSettings(),
      mobile: mobileAudioHandler.getState(),
      performance: audioOptimizer.getMetrics()
    };
  }

  /**
   * Enable debug mode
   */
  enableDebug(): void {
    audioDebugger.enableDebugMode();
  }

  /**
   * Disable debug mode
   */
  disableDebug(): void {
    audioDebugger.disableDebugMode();
  }

  /**
   * Get diagnostics
   */
  getDiagnostics(): any {
    return audioDebugger.getDiagnostics();
  }

  /**
   * Clean up and dispose
   */
  dispose(): void {
    this.stopMusic();
    
    this.activeAudioNodes.forEach(node => {
      if (node instanceof HTMLAudioElement) {
        node.pause();
        node.src = '';
      }
    });
    
    this.activeAudioNodes.clear();
    
    audioOptimizer.dispose();
    mobileAudioHandler.dispose();
    
    this.initialized = false;
    console.log('🔇 Enhanced Audio System disposed');
  }
}

// Export singleton instance
export const enhancedAudioManager = new EnhancedAudioManager();