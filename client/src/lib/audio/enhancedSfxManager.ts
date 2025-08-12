/**
 * Enhanced Sound Effects Manager
 * Handles high-quality MP3 sound effects for immersive gameplay
 */

export type SfxCategory = 'pieces' | 'ui' | 'magic' | 'environment' | 'feedback';

export interface SoundEffect {
  id: string;
  category: SfxCategory;
  file: string;
  volume: number;
  variations?: string[]; // Multiple files for variety
  spatial?: boolean; // 3D spatial audio support
  priority: 'low' | 'medium' | 'high';
}

export interface SfxOptions {
  volume?: number;
  pitch?: number;
  delay?: number;
  position?: { x: number; y: number; z: number };
  interrupt?: boolean;
}

class EnhancedSfxManager {
  private audioContext: AudioContext | null = null;
  private soundEffects: Map<string, SoundEffect> = new Map();
  private loadedBuffers: Map<string, AudioBuffer> = new Map();
  private activeSources: Map<string, AudioBufferSourceNode[]> = new Map();
  private isInitialized = false;
  private masterVolume = 0.8;
  private isMuted = false;

  /**
   * Initialize the enhanced SFX system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.setupSoundEffects();
      this.isInitialized = true;
      console.log('🔊 Enhanced SFX Manager initialized');
    } catch (error) {
      console.warn('🔊 Enhanced SFX Manager initialization failed:', error);
    }
  }

  /**
   * Play a sound effect with options
   */
  async playSfx(sfxId: string, options: SfxOptions = {}): Promise<void> {
    if (!this.isInitialized) await this.initialize();
    if (this.isMuted) return;

    const sfx = this.soundEffects.get(sfxId);
    if (!sfx) {
      console.warn(`🔊 Sound effect not found: ${sfxId}`);
      return;
    }

    // Handle variations
    const file = sfx.variations ? 
      sfx.variations[Math.floor(Math.random() * sfx.variations.length)] : 
      sfx.file;

    if (options.delay) {
      setTimeout(() => this.playAudioFile(file, sfx, options), options.delay);
    } else {
      await this.playAudioFile(file, sfx, options);
    }
  }

  /**
   * Play piece movement sounds
   */
  async playPieceSound(pieceType: string, moveType: 'move' | 'capture' | 'castle' = 'move'): Promise<void> {
    const sfxId = `piece_${pieceType}_${moveType}`;
    await this.playSfx(sfxId);
  }

  /**
   * Play UI interaction sounds
   */
  async playUiSound(interaction: 'click' | 'hover' | 'open' | 'close' | 'error' | 'success'): Promise<void> {
    const sfxId = `ui_${interaction}`;
    await this.playSfx(sfxId);
  }

  /**
   * Play magical effect sounds
   */
  async playMagicSound(effect: 'teleport' | 'spell_cast' | 'enchant' | 'dispel'): Promise<void> {
    const sfxId = `magic_${effect}`;
    await this.playSfx(sfxId);
  }

  /**
   * Play environmental sounds
   */
  async playEnvironmentSound(environment: 'castle' | 'forest' | 'mountain' | 'desert'): Promise<void> {
    const sfxId = `env_${environment}`;
    await this.playSfx(sfxId);
  }

  /**
   * Stop all sound effects
   */
  stopAllSfx(): void {
    this.activeSources.forEach((sources, sfxId) => {
      sources.forEach(source => {
        try {
          source.stop();
        } catch (error) {
          // Source may already be stopped
        }
      });
    });
    this.activeSources.clear();
    console.log('🔊 All SFX stopped');
  }

  /**
   * Set master volume for all SFX
   */
  setVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Mute/unmute SFX
   */
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted) {
      this.stopAllSfx();
    }
  }

  // Private methods

  private setupSoundEffects(): void {
    const effects: SoundEffect[] = [
      // Piece sounds
      { id: 'piece_pawn_move', category: 'pieces', file: '/audio/sfx/pieces/pawn_step.mp3', volume: 0.6, priority: 'low' },
      { id: 'piece_rook_move', category: 'pieces', file: '/audio/sfx/pieces/rook_slide.mp3', volume: 0.7, priority: 'medium' },
      { id: 'piece_knight_move', category: 'pieces', file: '/audio/sfx/pieces/knight_gallop.mp3', volume: 0.8, priority: 'medium' },
      { id: 'piece_bishop_move', category: 'pieces', file: '/audio/sfx/pieces/bishop_glide.mp3', volume: 0.7, priority: 'medium' },
      { id: 'piece_queen_move', category: 'pieces', file: '/audio/sfx/pieces/queen_majesty.mp3', volume: 0.9, priority: 'high' },
      { id: 'piece_king_move', category: 'pieces', file: '/audio/sfx/pieces/king_royal.mp3', volume: 0.8, priority: 'high' },
      { id: 'piece_wizard_move', category: 'pieces', file: '/audio/sfx/pieces/wizard_teleport.mp3', volume: 0.9, priority: 'high' },
      
      // Capture sounds
      { id: 'piece_capture', category: 'pieces', file: '/assets/sound-fx/capture_zap.mp3', volume: 0.8, priority: 'high' },
      { id: 'piece_capture_dramatic', category: 'pieces', file: '/audio/sfx/pieces/dramatic_capture.mp3', volume: 0.9, priority: 'high' },
      
      // UI sounds
      { id: 'ui_click', category: 'ui', file: '/audio/sfx/ui/button_click.mp3', volume: 0.5, priority: 'low' },
      { id: 'ui_hover', category: 'ui', file: '/audio/sfx/ui/button_hover.mp3', volume: 0.3, priority: 'low' },
      { id: 'ui_open', category: 'ui', file: '/audio/sfx/ui/menu_open.mp3', volume: 0.6, priority: 'medium' },
      { id: 'ui_close', category: 'ui', file: '/audio/sfx/ui/menu_close.mp3', volume: 0.6, priority: 'medium' },
      { id: 'ui_error', category: 'ui', file: '/audio/sfx/ui/error_tone.mp3', volume: 0.7, priority: 'high' },
      { id: 'ui_success', category: 'ui', file: '/audio/sfx/ui/success_chime.mp3', volume: 0.6, priority: 'medium' },
      
      // Magic sounds
      { id: 'magic_teleport', category: 'magic', file: '/audio/sfx/magic/teleport_whoosh.mp3', volume: 0.8, priority: 'high' },
      { id: 'magic_spell_cast', category: 'magic', file: '/audio/sfx/magic/spell_casting.mp3', volume: 0.7, priority: 'medium' },
      { id: 'magic_enchant', category: 'magic', file: '/audio/sfx/magic/enchantment_sparkle.mp3', volume: 0.6, priority: 'medium' },
      { id: 'magic_dispel', category: 'magic', file: '/audio/sfx/magic/dispel_magic.mp3', volume: 0.7, priority: 'medium' },
      
      // Environment sounds
      { id: 'env_castle', category: 'environment', file: '/audio/sfx/environment/castle_ambience.mp3', volume: 0.4, priority: 'low' },
      { id: 'env_forest', category: 'environment', file: '/audio/sfx/environment/forest_whispers.mp3', volume: 0.4, priority: 'low' },
      { id: 'env_mountain', category: 'environment', file: '/audio/sfx/environment/mountain_wind.mp3', volume: 0.4, priority: 'low' },
      { id: 'env_desert', category: 'environment', file: '/audio/sfx/environment/desert_mystique.mp3', volume: 0.4, priority: 'low' },
      
      // Feedback sounds
      { id: 'feedback_notification', category: 'feedback', file: '/audio/sfx/feedback/gentle_chime.mp3', volume: 0.5, priority: 'medium' },
      { id: 'feedback_achievement', category: 'feedback', file: '/audio/sfx/feedback/achievement_fanfare.mp3', volume: 0.8, priority: 'high' },
      { id: 'feedback_level_up', category: 'feedback', file: '/audio/sfx/feedback/level_progression.mp3', volume: 0.7, priority: 'high' }
    ];

    effects.forEach(effect => {
      this.soundEffects.set(effect.id, effect);
    });
  }

  private async playAudioFile(file: string, sfx: SoundEffect, options: SfxOptions): Promise<void> {
    if (!this.audioContext) return;

    try {
      // Load audio buffer if not cached
      if (!this.loadedBuffers.has(file)) {
        const response = await fetch(file);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.loadedBuffers.set(file, audioBuffer);
      }

      const buffer = this.loadedBuffers.get(file)!;
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = buffer;
      
      // Set volume
      const volume = (options.volume ?? sfx.volume) * this.masterVolume;
      gainNode.gain.value = volume;
      
      // Set pitch
      if (options.pitch) {
        source.playbackRate.value = options.pitch;
      }
      
      // Connect audio graph
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Track active source
      if (!this.activeSources.has(sfx.id)) {
        this.activeSources.set(sfx.id, []);
      }
      this.activeSources.get(sfx.id)!.push(source);
      
      // Clean up when finished
      source.onended = () => {
        const sources = this.activeSources.get(sfx.id) || [];
        const index = sources.indexOf(source);
        if (index > -1) {
          sources.splice(index, 1);
        }
      };
      
      source.start();
      console.log(`🔊 Playing SFX: ${sfx.id}`);
      
    } catch (error) {
      console.warn(`🔊 SFX playback failed: ${sfx.id}`, error);
    }
  }
}

export const enhancedSfxManager = new EnhancedSfxManager();