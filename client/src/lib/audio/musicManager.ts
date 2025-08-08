/**
 * Enhanced Music Management System
 * Handles theme music, gameplay tracks, and dynamic music transitions
 */

export type MusicTrack = 
  | 'main_theme' 
  | 'menu_ambient'
  | 'gameplay_calm'
  | 'gameplay_tense' 
  | 'gameplay_climax'
  | 'victory_fanfare'
  | 'defeat_melancholy'
  | 'campaign_intro'
  | 'wizard_theme';

export interface MusicConfig {
  track: MusicTrack;
  file: string;
  volume: number;
  loop: boolean;
  fadeInDuration?: number;
  fadeOutDuration?: number;
}

export interface MusicState {
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  crossfading: boolean;
}

class MusicManager {
  private currentAudio: HTMLAudioElement | null = null;
  private nextAudio: HTMLAudioElement | null = null;
  private state: MusicState = {
    currentTrack: null,
    isPlaying: false,
    volume: 0.6,
    isMuted: false,
    crossfading: false
  };
  private isInitialized = false;
  private musicTracks: Map<MusicTrack, MusicConfig> = new Map();

  /**
   * Initialize music system and load track configurations
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    this.setupMusicTracks();
    this.isInitialized = true;
    console.log('🎼 Music Manager initialized');
  }

  /**
   * Play a music track with optional crossfading
   */
  async playTrack(track: MusicTrack, crossfade = true): Promise<void> {
    if (!this.isInitialized) await this.initialize();
    if (this.state.isMuted) return;

    const config = this.musicTracks.get(track);
    if (!config) {
      console.warn(`🎼 Music track not found: ${track}`);
      return;
    }

    if (this.state.currentTrack === track && this.state.isPlaying) {
      return; // Already playing this track
    }

    if (crossfade && this.currentAudio) {
      await this.crossfadeToTrack(config);
    } else {
      await this.playTrackDirectly(config);
    }

    this.state.currentTrack = track;
    console.log(`🎼 Now playing: ${track}`);
  }

  /**
   * Stop current music with optional fade out
   */
  async stopMusic(fadeOut = true): Promise<void> {
    if (!this.currentAudio) return;

    if (fadeOut) {
      await this.fadeOut(this.currentAudio, 1000);
    }

    this.currentAudio.pause();
    this.currentAudio.currentTime = 0;
    this.currentAudio = null;
    
    this.state.currentTrack = null;
    this.state.isPlaying = false;
    
    console.log('🎼 Music stopped');
  }

  /**
   * Set music volume (0-1)
   */
  setVolume(volume: number): void {
    this.state.volume = Math.max(0, Math.min(1, volume));
    if (this.currentAudio) {
      this.currentAudio.volume = this.state.volume;
    }
  }

  /**
   * Mute/unmute music
   */
  setMuted(muted: boolean): void {
    this.state.isMuted = muted;
    if (muted) {
      this.stopMusic(false);
    }
  }

  /**
   * Get current music state
   */
  getState(): MusicState {
    return { ...this.state };
  }

  /**
   * Dynamic music based on game context
   */
  async setGameplayMusic(intensity: 'calm' | 'tense' | 'climax'): Promise<void> {
    const trackMap: Record<string, MusicTrack> = {
      calm: 'gameplay_calm',
      tense: 'gameplay_tense',
      climax: 'gameplay_climax'
    };

    await this.playTrack(trackMap[intensity], true);
  }

  // Private methods

  private setupMusicTracks(): void {
    const tracks: [MusicTrack, Omit<MusicConfig, 'track'>][] = [
      ['main_theme', { file: '/audio/music/theme/main_theme.mp3', volume: 0.7, loop: true, fadeInDuration: 2000 }],
      ['menu_ambient', { file: '/audio/music/theme/menu_ambient.mp3', volume: 0.5, loop: true, fadeInDuration: 1500 }],
      ['gameplay_calm', { file: '/audio/music/gameplay/calm_strategy.mp3', volume: 0.4, loop: true, fadeInDuration: 1000 }],
      ['gameplay_tense', { file: '/audio/music/gameplay/rising_tension.mp3', volume: 0.6, loop: true, fadeInDuration: 800 }],
      ['gameplay_climax', { file: '/audio/music/gameplay/epic_battle.mp3', volume: 0.8, loop: true, fadeInDuration: 500 }],
      ['victory_fanfare', { file: '/audio/music/victory/triumphant_victory.mp3', volume: 0.9, loop: false }],
      ['defeat_melancholy', { file: '/audio/music/defeat/somber_defeat.mp3', volume: 0.6, loop: false }],
      ['campaign_intro', { file: '/audio/music/theme/campaign_intro.mp3', volume: 0.8, loop: false, fadeInDuration: 1000 }],
      ['wizard_theme', { file: '/audio/music/theme/mystical_wizard.mp3', volume: 0.7, loop: true, fadeInDuration: 1500 }]
    ];

    tracks.forEach(([track, config]) => {
      this.musicTracks.set(track, { track, ...config });
    });
  }

  private async playTrackDirectly(config: MusicConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (this.currentAudio) {
          this.currentAudio.pause();
        }

        this.currentAudio = new Audio(config.file);
        this.currentAudio.volume = 0;
        this.currentAudio.loop = config.loop;

        this.currentAudio.addEventListener('canplaythrough', async () => {
          if (config.fadeInDuration) {
            await this.fadeIn(this.currentAudio!, config.fadeInDuration);
          } else {
            this.currentAudio!.volume = config.volume * this.state.volume;
          }
          this.state.isPlaying = true;
          resolve();
        });

        this.currentAudio.addEventListener('error', () => reject());
        this.currentAudio.load();
        this.currentAudio.play().catch(reject);

      } catch (error) {
        console.warn(`🎼 Music playback failed: ${config.track}`, error);
        reject(error);
      }
    });
  }

  private async crossfadeToTrack(config: MusicConfig): Promise<void> {
    if (!this.currentAudio) {
      return this.playTrackDirectly(config);
    }

    this.state.crossfading = true;
    
    // Start fading out current track
    const fadeOutPromise = this.fadeOut(this.currentAudio, 1500);
    
    // Load and start fading in new track
    this.nextAudio = new Audio(config.file);
    this.nextAudio.volume = 0;
    this.nextAudio.loop = config.loop;
    
    await new Promise<void>((resolve, reject) => {
      this.nextAudio!.addEventListener('canplaythrough', () => resolve());
      this.nextAudio!.addEventListener('error', () => reject());
      this.nextAudio!.load();
    });

    await this.nextAudio.play();
    const fadeInPromise = this.fadeIn(this.nextAudio, 1500);

    // Wait for crossfade to complete
    await Promise.all([fadeOutPromise, fadeInPromise]);

    // Cleanup old audio
    this.currentAudio.pause();
    this.currentAudio = this.nextAudio;
    this.nextAudio = null;
    this.state.crossfading = false;
  }

  private async fadeIn(audio: HTMLAudioElement, duration: number): Promise<void> {
    const targetVolume = this.state.volume;
    const steps = 50;
    const stepDuration = duration / steps;
    const volumeStep = targetVolume / steps;

    for (let i = 0; i <= steps; i++) {
      audio.volume = volumeStep * i;
      await new Promise(resolve => setTimeout(resolve, stepDuration));
    }
  }

  private async fadeOut(audio: HTMLAudioElement, duration: number): Promise<void> {
    const initialVolume = audio.volume;
    const steps = 50;
    const stepDuration = duration / steps;
    const volumeStep = initialVolume / steps;

    for (let i = steps; i >= 0; i--) {
      audio.volume = volumeStep * i;
      await new Promise(resolve => setTimeout(resolve, stepDuration));
    }
  }
}

export const musicManager = new MusicManager();