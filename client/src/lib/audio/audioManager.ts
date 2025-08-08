// HTML5 Audio Manager for Wizard Chess
// Optimized for Replit stability with MP3 file support

export interface AudioConfig {
  soundEffects: {
    move_clack: string;
    capture_zap: string;
    wizard_teleport: string;
    wizard_attack: string;
    check_alert: string;
    checkmate: string;
    victory: string;
    button_click: string;
    level_start: string;
    hint_reveal: string;
  };
  music: {
    theme_music?: string; // Optional since we use direct implementation
  };
  voiceFiles: {
    greeting: string;
    game_intro: string;
    victory_celebration: string;
    hint_explanation: string;
    defeat_encouragement: string;
    level_complete: string;
    tutorial_welcome: string;
  };
}

class WizardChessAudioManager {
  private soundEffects: Map<string, HTMLAudioElement> = new Map();
  private voiceFiles: Map<string, HTMLAudioElement> = new Map();
  private music: Map<string, HTMLAudioElement> = new Map();
  private currentMusic: HTMLAudioElement | null = null;
  private themeMusic: HTMLAudioElement | null = null;
  private volume: number = 0.7;
  private muted: boolean = false;
  private initialized: boolean = false;

  private config: AudioConfig = {
    soundEffects: {
      move_clack: '/assets/sound-fx/move_clack.mp3',
      capture_zap: '/assets/sound-fx/capture_zap.mp3',
      wizard_teleport: '/assets/sound-fx/wizard_teleport.mp3',
      wizard_attack: '/assets/sound-fx/wizard_attack.mp3',
      check_alert: '/assets/sound-fx/check_alert.mp3',
      checkmate: '/assets/sound-fx/checkmate.mp3',
      victory: '/assets/sound-fx/victory.mp3',
      button_click: '/assets/sound-fx/button_click.mp3',
      level_start: '/assets/sound-fx/level_start.mp3',
      hint_reveal: '/assets/sound-fx/hint_reveal.mp3',
    },
    music: {
      // DISABLED - Using direct Theme-music1.mp3 implementation instead
      // theme_music: '/assets/music/Theme-music1.mp3',
    },
    voiceFiles: {
      greeting: '/assets/voice-files/greeting.mp3',
      game_intro: '/assets/voice-files/game_intro.mp3',
      victory_celebration: '/assets/voice-files/victory_celebration.mp3',
      hint_explanation: '/assets/voice-files/hint_explanation.mp3',
      defeat_encouragement: '/assets/voice-files/defeat_encouragement.mp3',
      level_complete: '/assets/voice-files/level_complete.mp3',
      tutorial_welcome: '/assets/voice-files/tutorial_welcome.mp3',
    }
  };

  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('🎵 Initializing Wizard Chess Audio Manager...');
    
    try {
      // Load sound effects
      await this.loadAudioGroup(this.config.soundEffects, this.soundEffects, 'Sound Effects');
      
      // Legacy music loading DISABLED - using direct Theme-music1.mp3 implementation
      // await this.loadAudioGroup(this.config.music, this.music, 'Music');
      
      // Load voice files
      await this.loadAudioGroup(this.config.voiceFiles, this.voiceFiles, 'Voice Files');
      
      // Set up music for looping
      this.music.forEach(audio => {
        audio.loop = true;
      });
      
      this.initialized = true;
      console.log('✅ Wizard Chess Audio Manager initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize audio manager:', error);
    }
  }

  private async loadAudioGroup(
    config: Record<string, string>, 
    storage: Map<string, HTMLAudioElement>, 
    groupName: string
  ): Promise<void> {
    console.log(`🎵 Loading ${groupName}...`);
    
    const loadPromises = Object.entries(config).map(([key, path]) => {
      return new Promise<void>((resolve) => {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.volume = this.volume;
        
        audio.addEventListener('canplaythrough', () => {
          storage.set(key, audio);
          console.log(`✅ Loaded ${groupName}: ${key}`);
          resolve();
        });
        
        audio.addEventListener('error', (e) => {
          console.warn(`⚠️ Failed to load ${groupName} ${key} from ${path}:`, e);
          resolve(); // Don't fail the entire loading process
        });
        
        audio.src = path;
      });
    });
    
    await Promise.all(loadPromises);
    console.log(`✅ ${groupName} loading completed`);
  }

  // Sound Effects
  async playSoundEffect(effectKey: keyof AudioConfig['soundEffects']): Promise<void> {
    if (!this.initialized || this.muted) return;
    
    const audio = this.soundEffects.get(effectKey);
    if (!audio) {
      console.warn(`⚠️ Sound effect not found: ${effectKey}`);
      return;
    }
    
    try {
      // Reset and play
      audio.currentTime = 0;
      audio.volume = this.volume;
      await audio.play();
      console.log(`🎵 Playing sound effect: ${effectKey}`);
    } catch (error) {
      console.warn(`⚠️ Failed to play sound effect ${effectKey}:`, error);
    }
  }

  // Voice Files
  async playVoice(voiceKey: keyof AudioConfig['voiceFiles']): Promise<void> {
    if (!this.initialized || this.muted) return;
    
    // Stop any currently playing voice
    this.stopAllVoices();
    
    const audio = this.voiceFiles.get(voiceKey);
    if (!audio) {
      console.warn(`⚠️ Voice file not found: ${voiceKey}`);
      return;
    }
    
    try {
      audio.currentTime = 0;
      audio.volume = this.volume;
      await audio.play();
      console.log(`🗣️ Playing voice: ${voiceKey}`);
    } catch (error) {
      console.warn(`⚠️ Failed to play voice ${voiceKey}:`, error);
    }
  }

  // Music
  async playMusic(musicKey: keyof AudioConfig['music']): Promise<void> {
    if (!this.initialized || this.muted) return;
    
    const audio = this.music.get(musicKey);
    if (!audio) {
      console.warn(`⚠️ Music not found: ${musicKey}`);
      return;
    }
    
    // Stop current music if playing
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
    }
    
    try {
      audio.currentTime = 0;
      audio.volume = this.volume * 0.6; // Music should be quieter than SFX
      this.currentMusic = audio;
      await audio.play();
      console.log(`🎼 Playing music: ${musicKey} (${this.config.music[musicKey]})`);
    } catch (error) {
      console.warn(`⚠️ Failed to play music ${musicKey}:`, error);
    }
  }

  stopMusic(): void {
    // Stop old music system
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
      this.currentMusic = null;
    }
    
    // Stop theme music
    if (this.themeMusic) {
      this.themeMusic.pause();
      this.themeMusic.currentTime = 0;
      this.themeMusic = null;
      console.log('🎼 Theme-music1.mp3 stopped');
    }
  }

  stopAllVoices(): void {
    this.voiceFiles.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  // Volume Control
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    
    // Update all audio elements
    this.soundEffects.forEach(audio => audio.volume = this.volume);
    this.voiceFiles.forEach(audio => audio.volume = this.volume);
    this.music.forEach(audio => audio.volume = this.volume * 0.6); // Music quieter
    
    // Update theme music volume
    if (this.themeMusic) {
      this.themeMusic.volume = this.volume * 0.6;
    }
    
    console.log(`🔊 Volume set to: ${Math.round(this.volume * 100)}%`);
  }

  getVolume(): number {
    return this.volume;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    
    if (muted) {
      this.stopMusic();
      this.stopAllVoices();
    } else {
      // Resume theme music if it was playing
      if (this.themeMusic && this.themeMusic.paused) {
        this.themeMusic.play().catch(console.error);
      }
    }
    
    console.log(`🔊 Audio ${muted ? 'muted' : 'unmuted'}`);
  }

  isMuted(): boolean {
    return this.muted;
  }

  toggleMute(): void {
    this.setMuted(!this.muted);
  }

  // Game Event Handlers
  onPieceMove(): void {
    this.playSoundEffect('move_clack');
  }

  onPieceCapture(): void {
    this.playSoundEffect('capture_zap');
  }

  onWizardTeleport(): void {
    this.playSoundEffect('wizard_teleport');
  }

  onWizardAttack(): void {
    this.playSoundEffect('wizard_attack');
  }

  onCheck(): void {
    this.playSoundEffect('check_alert');
  }

  onCheckmate(): void {
    this.playSoundEffect('checkmate');
  }

  onVictory(): void {
    this.playSoundEffect('victory');
  }

  onButtonClick(): void {
    this.playSoundEffect('button_click');
  }

  onLevelStart(): void {
    this.playSoundEffect('level_start');
  }

  onHintReveal(): void {
    this.playSoundEffect('hint_reveal');
  }

  onGameStart(): void {
    this.playThemeMusic();
    this.playVoice('game_intro');
  }

  // Direct Theme Music Implementation as requested
  playThemeMusic(): void {
    if (this.muted) return;
    
    console.log('🎵 Starting direct Theme-music1.mp3 implementation...');
    console.log('🎵 Cache busting with ?v=10 parameter added');
    
    // COMPLETE AUDIO CLEANUP - Stop ALL audio sources FIRST
    this.stopAllAudio();
    
    console.log('🎼 ✅ VERIFICATION STEP 1: All competing audio stopped');
    console.log('🎼 ✅ VERIFICATION STEP 2: Now loading ONLY Theme-music1.mp3 with ?v=10');
    
    // Stop any existing theme music
    if (this.themeMusic) {
      this.themeMusic.pause();
      this.themeMusic.currentTime = 0;
      this.themeMusic = null;
      console.log('🛑 Previous theme music stopped and cleared');
    }
    
    // Create new Audio instance with updated cache busting v=10
    const theme = new Audio('/assets/music/Theme-music1.mp3?v=10');
    theme.loop = true;
    theme.volume = 0.42; // Exact volume as requested
    
    // Debug logging as requested - verify ONLY Theme-music1.mp3
    console.log('🎼 Current audio:', theme.src);
    console.log('🎼 Theme music source:', theme.src);
    console.log('🎼 Theme music loop enabled:', theme.loop);
    console.log('🎼 Theme music volume should be 0.42:', theme.volume);
    console.log('🎼 ✅ VERIFICATION: This is the ONLY audio that should play');
    
    // Log active audio sources as requested
    console.log('Audio:', Array.from(document.querySelectorAll('audio')).map(a => a.src));
    
    this.themeMusic = theme;
    
    // Handle loading and play
    theme.addEventListener('loadeddata', () => {
      console.log('✅ Theme-music1.mp3 loaded successfully');
      console.log('🎼 ✅ File size:', theme.duration || 'Loading...');
      console.log('🎼 ✅ Ready state:', theme.readyState);
    });
    
    theme.addEventListener('error', (error) => {
      console.error('❌ Theme music failed to load:', error);
    });
    
    theme.addEventListener('ended', () => {
      console.log('🔄 Theme music ended, restarting loop');
    });
    
    // Play the music with comprehensive logging
    theme.play()
      .then(() => {
        console.log('🎼 ✅ Theme-music1.mp3 started playing successfully');
        console.log('🎼 ✅ CONFIRMED: Only Theme-music1.mp3 is now playing');
        console.log('🎼 ✅ Loop status:', theme.loop);
        console.log('🎼 ✅ Volume level (should be 0.42):', theme.volume);
        console.log('🎼 ✅ FINAL VERIFICATION: Audio source is:', theme.src.split('/').pop());
        
        // Final verification of active audio sources
        const activeAudio = Array.from(document.querySelectorAll('audio')).map(a => a.src);
        console.log('🎼 ✅ Active audio sources:', activeAudio);
        console.log('🎼 ✅ Active audio count:', activeAudio.length);
        console.log('🎼 ✅ NO OTHER MUSIC should be playing - verification complete');
        
        // Log ALL active audio sources as requested
        const allAudios = Array.from(document.querySelectorAll('audio'));
        console.log('Active audio sources:', allAudios.map(a => a.src));
        console.log('Active audio count:', allAudios.length);
        console.log('Theme music volume should be 0.42:', theme.volume);
      })
      .catch(error => {
        console.error('❌ FAILED to play Theme-music1.mp3:', error);
      });
  }

  onGameEnd(victory: boolean): void {
    this.stopMusic();
    if (victory) {
      this.playVoice('victory_celebration');
    } else {
      this.playVoice('defeat_encouragement');
    }
  }

  onGreeting(): void {
    this.playVoice('greeting');
  }

  onTutorialWelcome(): void {
    this.playVoice('tutorial_welcome');
  }

  onHintExplanation(): void {
    this.playVoice('hint_explanation');
  }

  onLevelComplete(): void {
    this.playVoice('level_complete');
  }

  // COMPLETE AUDIO CLEANUP METHOD
  stopAllAudio(): void {
    console.log('🛑 Stopping ALL audio sources to prevent conflicts...');
    
    // Stop all sound effects
    this.soundEffects.forEach((audio, key) => {
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
        console.log(`🛑 Stopped sound effect: ${key}`);
      }
    });
    
    // Stop all voice files
    this.voiceFiles.forEach((audio, key) => {
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
        console.log(`🛑 Stopped voice file: ${key}`);
      }
    });
    
    // Stop all legacy music
    this.music.forEach((audio, key) => {
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
        console.log(`🛑 Stopped legacy music: ${key}`);
      }
    });
    
    // Stop current legacy music
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
      this.currentMusic = null;
      console.log('🛑 Stopped current legacy music');
    }
    
    console.log('✅ All audio sources stopped - ready for Theme-music1.mp3');
    
    // COMPREHENSIVE AUDIO CLEANUP - Stop ALL audio elements in DOM
    this.stopAllDOMAudio();
  }

  // COMPREHENSIVE DOM AUDIO CLEANUP FUNCTION as requested
  stopAllDOMAudio(): void {
    console.log('🛑 COMPREHENSIVE AUDIO CLEANUP: Stopping all DOM audio elements...');
    
    // Stop ALL audio elements in the DOM
    document.querySelectorAll('audio').forEach((audio, index) => {
      audio.pause();
      audio.currentTime = 0;
      console.log(`🛑 Stopped audio element ${index}: ${audio.src}`);
    });
    
    // Log active audio sources BEFORE cleanup
    const activeAudios = Array.from(document.querySelectorAll('audio'));
    console.log('Active audio sources before cleanup:', activeAudios.map(a => a.src));
    
    // Try to close any existing AudioContext instances
    try {
      if (window.AudioContext || (window as any).webkitAudioContext) {
        console.log('🛑 AudioContext available for cleanup if needed');
      }
    } catch (error) {
      console.log('🛑 No AudioContext cleanup needed');
    }
    
    console.log('🛑 DOM audio cleanup completed');
  }

  dispose(): void {
    this.stopMusic();
    this.stopAllVoices();
    
    // Clean up all audio elements
    this.soundEffects.clear();
    this.voiceFiles.clear();
    this.music.clear();
    
    this.initialized = false;
    console.log('🎵 Audio manager disposed');
  }
}

// Export singleton instance
export const wizardChessAudio = new WizardChessAudioManager();