/**
 * Immersive Audio Coordinator
 * Orchestrates all audio systems: voices, music, SFX, and ambient sounds
 */

import { voiceManager } from './voiceManager';
import { musicManager } from './musicManager';
import { enhancedSfxManager } from './enhancedSfxManager';

export interface AudioContext {
  gamePhase: 'menu' | 'gameplay' | 'victory' | 'defeat' | 'campaign';
  gameIntensity: 'calm' | 'tense' | 'climax';
  boardTheme: 'classic' | 'forest' | 'castle' | 'mountain' | 'desert' | 'volcanic' | 'ice' | 'cosmic';
  playerActions: string[];
}

export interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  voiceVolume: number;
  enableVoices: boolean;
  enableMusic: boolean;
  enableSfx: boolean;
  enableSpatialAudio: boolean;
}

class ImmersiveAudioCoordinator {
  private isInitialized = false;
  private currentContext: AudioContext | null = null;
  private settings: AudioSettings = {
    masterVolume: 0.8,
    musicVolume: 0.6,
    sfxVolume: 0.7,
    voiceVolume: 0.8,
    enableVoices: true,
    enableMusic: true,
    enableSfx: true,
    enableSpatialAudio: true
  };

  /**
   * Initialize all audio systems
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await Promise.all([
        voiceManager.initialize(),
        musicManager.initialize(),
        enhancedSfxManager.initialize()
      ]);

      this.isInitialized = true;
      console.log('🎭 Immersive Audio Coordinator initialized');
    } catch (error) {
      console.warn('🎭 Audio coordinator initialization failed:', error);
    }
  }

  /**
   * Update audio context based on game state
   */
  async updateAudioContext(context: Partial<AudioContext>): Promise<void> {
    this.currentContext = { ...this.currentContext, ...context } as AudioContext;
    await this.orchestrateAudio();
  }

  /**
   * Handle game events with coordinated audio
   */
  async handleGameEvent(event: string, data?: any): Promise<void> {
    if (!this.isInitialized) await this.initialize();

    switch (event) {
      case 'game_start':
        await this.onGameStart(data);
        break;
      case 'piece_move':
        await this.onPieceMove(data);
        break;
      case 'piece_capture':
        await this.onPieceCapture(data);
        break;
      case 'check':
        await this.onCheck(data);
        break;
      case 'checkmate':
        await this.onCheckmate(data);
        break;
      case 'victory':
        await this.onVictory(data);
        break;
      case 'defeat':
        await this.onDefeat(data);
        break;
      case 'level_complete':
        await this.onLevelComplete(data);
        break;
      case 'hint_requested':
        await this.onHintRequested(data);
        break;
      case 'menu_navigation':
        await this.onMenuNavigation(data);
        break;
    }
  }

  /**
   * Update audio settings
   */
  updateSettings(newSettings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.applySettings();
  }

  /**
   * Stop all audio systems
   */
  stopAll(): void {
    voiceManager.stopAll();
    musicManager.stopMusic(false);
    enhancedSfxManager.stopAllSfx();
  }

  /**
   * Get current audio state
   */
  getState(): { context: AudioContext | null; settings: AudioSettings } {
    return {
      context: this.currentContext,
      settings: this.settings
    };
  }

  // Private event handlers

  private async onGameStart(data: any): Promise<void> {
    if (this.settings.enableVoices) {
      await voiceManager.playNarrator('game_intro');
    }
    
    if (this.settings.enableMusic) {
      await musicManager.setGameplayMusic('calm');
    }
    
    if (this.settings.enableSfx && this.currentContext?.boardTheme) {
      await enhancedSfxManager.playEnvironmentSound(this.currentContext.boardTheme as any);
    }
  }

  private async onPieceMove(data: { pieceType: string; isSpecialMove?: boolean }): Promise<void> {
    if (this.settings.enableSfx) {
      await enhancedSfxManager.playPieceSound(data.pieceType, 'move');
    }
    
    if (data.isSpecialMove && this.settings.enableVoices) {
      await voiceManager.playCoach('special_move_tip');
    }
  }

  private async onPieceCapture(data: { capturedPiece: string; dramatic?: boolean }): Promise<void> {
    if (this.settings.enableSfx) {
      const sfxId = data.dramatic ? 'piece_capture_dramatic' : 'piece_capture';
      await enhancedSfxManager.playSfx(sfxId);
    }
  }

  private async onCheck(data: any): Promise<void> {
    if (this.settings.enableMusic) {
      await musicManager.setGameplayMusic('tense');
    }
    
    if (this.settings.enableVoices) {
      await voiceManager.playAssistant('check_warning');
    }
  }

  private async onCheckmate(data: any): Promise<void> {
    if (this.settings.enableMusic) {
      await musicManager.setGameplayMusic('climax');
    }
    
    if (this.settings.enableSfx) {
      await enhancedSfxManager.playSfx('feedback_achievement');
    }
  }

  private async onVictory(data: any): Promise<void> {
    if (this.settings.enableMusic) {
      await musicManager.playTrack('victory_fanfare');
    }
    
    if (this.settings.enableVoices) {
      await voiceManager.playNarrator('victory_celebration');
    }
    
    if (this.settings.enableSfx) {
      await enhancedSfxManager.playSfx('feedback_achievement');
    }
  }

  private async onDefeat(data: any): Promise<void> {
    if (this.settings.enableMusic) {
      await musicManager.playTrack('defeat_melancholy');
    }
    
    if (this.settings.enableVoices) {
      await voiceManager.playCoach('encouragement_after_loss');
    }
  }

  private async onLevelComplete(data: any): Promise<void> {
    if (this.settings.enableSfx) {
      await enhancedSfxManager.playSfx('feedback_level_up');
    }
    
    if (this.settings.enableVoices) {
      await voiceManager.playNarrator('level_progression');
    }
  }

  private async onHintRequested(data: any): Promise<void> {
    if (this.settings.enableVoices) {
      await voiceManager.playCoach('hint_explanation');
    }
    
    if (this.settings.enableSfx) {
      await enhancedSfxManager.playSfx('feedback_notification');
    }
  }

  private async onMenuNavigation(data: { action: string }): Promise<void> {
    if (this.settings.enableSfx) {
      await enhancedSfxManager.playUiSound(data.action as any);
    }
  }

  private async orchestrateAudio(): Promise<void> {
    if (!this.currentContext) return;

    // Adjust music based on context
    if (this.settings.enableMusic) {
      if (this.currentContext.gamePhase === 'menu') {
        await musicManager.playTrack('menu_ambient');
      } else if (this.currentContext.gamePhase === 'gameplay') {
        await musicManager.setGameplayMusic(this.currentContext.gameIntensity);
      }
    }

    // Set environmental audio based on board theme
    if (this.settings.enableSfx && this.currentContext.boardTheme) {
      await enhancedSfxManager.playEnvironmentSound(this.currentContext.boardTheme as any);
    }
  }

  private applySettings(): void {
    voiceManager.setVolume(this.settings.voiceVolume * this.settings.masterVolume);
    voiceManager.setMuted(!this.settings.enableVoices);
    
    musicManager.setVolume(this.settings.musicVolume * this.settings.masterVolume);
    musicManager.setMuted(!this.settings.enableMusic);
    
    enhancedSfxManager.setVolume(this.settings.sfxVolume * this.settings.masterVolume);
    enhancedSfxManager.setMuted(!this.settings.enableSfx);
  }
}

export const immersiveAudioCoordinator = new ImmersiveAudioCoordinator();