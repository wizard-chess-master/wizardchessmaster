/**
 * Game Audio Manager - HTML5 Audio API Integration
 * Handles sound effects, voice files, and music for Wizard Chess
 * Optimized for Replit stability with simple HTML5 Audio
 */

export type SoundEffect = 
  | 'move_clack'
  | 'capture_zap' 
  | 'wizard_teleport'
  | 'wizard_attack'
  | 'check_alert'
  | 'checkmate'
  | 'victory'
  | 'button_click'
  | 'level_start'
  | 'hint_reveal';

export type VoiceClip = 
  | 'greeting'
  | 'game_intro'
  | 'victory_celebration'
  | 'defeat_encouragement'
  | 'hint_explanation'
  | 'level_complete'
  | 'tutorial_welcome';

export type MusicTrack = 
  | never; // ALL MUSIC TRACKS REMOVED - ONLY Theme-music1.mp3 v=12 PERMITTED

export interface AudioSettings {
  masterVolume: number;
  sfxVolume: number;
  voiceVolume: number;
  musicVolume: number;
  sfxEnabled: boolean;
  voiceEnabled: boolean;
  musicEnabled: boolean;
}

class GameAudioManager {
  private audioElements: Map<string, HTMLAudioElement> = new Map();
  private currentMusic: HTMLAudioElement | null = null;
  private settings: AudioSettings = {
    masterVolume: 0.8,
    sfxVolume: 0.7,
    voiceVolume: 0.8,
    musicVolume: 0.5,
    sfxEnabled: true,
    voiceEnabled: true,
    musicEnabled: true
  };
  private isInitialized = false;

  /**
   * Initialize the audio system and preload audio files
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.preloadAudioFiles();
      this.isInitialized = true;
      console.log('🎵 Game Audio Manager initialized');
    } catch (error) {
      console.warn('🎵 Audio initialization failed:', error);
    }
  }

  /**
   * Play a sound effect
   */
  async playSfx(effect: SoundEffect): Promise<void> {
    if (!this.settings.sfxEnabled || !this.isInitialized) return;

    const audio = this.audioElements.get(`sfx_${effect}`);
    if (!audio) {
      console.warn(`🔊 Sound effect not found: ${effect}`);
      return;
    }

    try {
      audio.currentTime = 0;
      audio.volume = this.settings.sfxVolume * this.settings.masterVolume;
      await audio.play();
      console.log(`🔊 Playing SFX: ${effect}`);
    } catch (error) {
      console.log(`🔊 SFX playback failed: ${effect}`, error);
    }
  }

  /**
   * Play a voice clip
   */
  async playVoice(clip: VoiceClip): Promise<void> {
    if (!this.settings.voiceEnabled || !this.isInitialized) return;

    const audio = this.audioElements.get(`voice_${clip}`);
    if (!audio) {
      console.warn(`🎭 Voice clip not found: ${clip}`);
      return;
    }

    try {
      audio.currentTime = 0;
      audio.volume = this.settings.voiceVolume * this.settings.masterVolume;
      await audio.play();
      console.log(`🎭 Playing voice: ${clip}`);
    } catch (error) {
      console.log(`🎭 Voice playback failed: ${clip}`, error);
    }
  }

  /**
   * Play background music
   */
  async playMusic(track: MusicTrack, loop = true): Promise<void> {
    if (!this.settings.musicEnabled || !this.isInitialized) return;

    // Stop current music
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
    }

    const audio = this.audioElements.get(`music_${track}`);
    if (!audio) {
      console.warn(`🎼 Music track not found: ${track}`);
      return;
    }

    try {
      audio.currentTime = 0;
      audio.volume = this.settings.musicVolume * this.settings.masterVolume;
      audio.loop = loop;
      this.currentMusic = audio;
      await audio.play();
      console.log(`🎼 Playing music: ${track} ${loop ? '(looping)' : ''}`);
    } catch (error) {
      console.log(`🎼 Music playback failed: ${track}`, error);
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
      console.log('🎼 Music stopped');
    }
  }

  /**
   * Stop all audio
   */
  stopAll(): void {
    this.audioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.currentMusic = null;
    console.log('🔇 All audio stopped');
  }

  /**
   * Update audio settings
   */
  updateSettings(newSettings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    
    // Update current music volume if playing
    if (this.currentMusic) {
      this.currentMusic.volume = this.settings.musicVolume * this.settings.masterVolume;
    }

    console.log('🎵 Audio settings updated:', this.settings);
  }

  /**
   * Get current audio settings
   */
  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  /**
   * Game event handlers
   */
  async onPieceMove(): Promise<void> {
    await this.playSfx('move_clack');
  }

  async onPieceCapture(): Promise<void> {
    await this.playSfx('capture_zap');
  }

  async onWizardTeleport(): Promise<void> {
    await this.playSfx('wizard_teleport');
  }

  async onWizardAttack(): Promise<void> {
    await this.playSfx('wizard_attack');
  }

  async onCheck(): Promise<void> {
    await this.playSfx('check_alert');
  }

  async onCheckmate(): Promise<void> {
    await this.playSfx('checkmate');
  }

  async onVictory(): Promise<void> {
    await this.playSfx('victory');
  }

  async onButtonClick(): Promise<void> {
    await this.playSfx('button_click');
  }

  async onLevelStart(): Promise<void> {
    await this.playSfx('level_start');
  }

  async onHintReveal(): Promise<void> {
    await this.playSfx('hint_reveal');
  }

  async onGameStart(): Promise<void> {
    console.log('🎮 URGENT: Game start triggered - comprehensive audio cleanup...');
    
    // URGENT: Comprehensive audio cleanup on game start as requested
    try {
      if (typeof AudioContext !== 'undefined') {
        new AudioContext().close().then(() => {
          console.log('✅ Game start: AudioContext closed');
        }).catch(() => {
          console.log('⚠️ Game start: AudioContext close failed or not needed');
        });
      }
    } catch (e) {
      console.log('⚠️ Game start: AudioContext not available or already closed');
    }
    
    // Aggressive DOM audio cleanup with removal as specifically requested
    const audioElements = document.querySelectorAll('audio');
    console.log('Audio cleanup:', audioElements.length);
    audioElements.forEach(a => { 
      a.pause(); 
      a.currentTime = 0;
      a.remove(); // Force remove from DOM as requested
    });
    
    // Exhaustive logging as urgently requested
    console.log('Audio check at', new Date().toLocaleTimeString(), ':', Array.from(document.querySelectorAll('audio')).map(a => a.src));
    try {
      console.log('Context:', (new AudioContext()).state);
    } catch (e) {
      console.log('Context: Not Available');
    }
    
    await this.playVoice('game_intro');
    // Note: Music handled separately via direct Theme-music1.mp3 implementation
  }

  async onGreeting(): Promise<void> {
    await this.playVoice('greeting');
  }

  // Private methods

  private async preloadAudioFiles(): Promise<void> {
    const audioFiles = [
      // Sound Effects (check multiple possible locations)
      { key: 'sfx_move_clack', paths: ['/assets/sound-fx/move_clack.mp3', '/sounds/hit.mp3'] },
      { key: 'sfx_capture_zap', paths: ['/assets/sound-fx/capture_zap.mp3', '/sounds/hit.mp3'] },
      { key: 'sfx_wizard_teleport', paths: ['/assets/sound-fx/wizard_teleport.mp3', '/sounds/success.mp3'] },
      { key: 'sfx_wizard_attack', paths: ['/assets/sound-fx/wizard_attack.mp3', '/sounds/hit.mp3'] },
      { key: 'sfx_check_alert', paths: ['/assets/sound-fx/check_alert.mp3', '/sounds/success.mp3'] },
      { key: 'sfx_checkmate', paths: ['/assets/sound-fx/checkmate.mp3', '/sounds/success.mp3'] },
      { key: 'sfx_victory', paths: ['/assets/sound-fx/victory.mp3', '/sounds/success.mp3'] },
      { key: 'sfx_button_click', paths: ['/assets/sound-fx/button_click.mp3', '/sounds/hit.mp3'] },
      { key: 'sfx_level_start', paths: ['/assets/sound-fx/level_start.mp3', '/sounds/success.mp3'] }, // Removed background.mp3 reference
      { key: 'sfx_hint_reveal', paths: ['/assets/sound-fx/hint_reveal.mp3', '/sounds/success.mp3'] },

      // Voice Files
      { key: 'voice_greeting', paths: ['/assets/voice-files/greeting.mp3'] },
      { key: 'voice_game_intro', paths: ['/assets/voice-files/game_intro.mp3'] },
      { key: 'voice_victory_celebration', paths: ['/assets/voice-files/victory_celebration.mp3'] },
      { key: 'voice_defeat_encouragement', paths: ['/assets/voice-files/defeat_encouragement.mp3'] },
      { key: 'voice_hint_explanation', paths: ['/assets/voice-files/hint_explanation.mp3'] },
      { key: 'voice_level_complete', paths: ['/assets/voice-files/level_complete.mp3'] },
      { key: 'voice_tutorial_welcome', paths: ['/assets/voice-files/tutorial_welcome.mp3'] },

      // Music - DISABLED: Using direct Theme-music1.mp3 implementation instead
      // { key: 'music_theme_music', paths: ['/assets/music/Theme-music1.mp3'] }
    ];

    const loadPromises = audioFiles.map(({ key, paths }) => 
      this.loadAudioWithFallback(key, paths)
    );

    await Promise.allSettled(loadPromises);
    console.log(`🎵 Preloaded ${this.audioElements.size} audio files`);
  }

  private async loadAudioWithFallback(key: string, paths: string[]): Promise<void> {
    for (const path of paths) {
      try {
        const audio = new Audio(path);
        
        // Test if file exists and can be loaded
        await new Promise<void>((resolve, reject) => {
          audio.addEventListener('canplaythrough', () => resolve());
          audio.addEventListener('error', () => reject());
          audio.load();
        });

        this.audioElements.set(key, audio);
        console.log(`🎵 Loaded audio: ${key} from ${path}`);
        return;
      } catch (error) {
        console.log(`🎵 Failed to load ${path}, trying next fallback...`);
        continue;
      }
    }
    
    console.warn(`🎵 Could not load audio for ${key} from any fallback path`);
  }
}

export const gameAudioManager = new GameAudioManager();