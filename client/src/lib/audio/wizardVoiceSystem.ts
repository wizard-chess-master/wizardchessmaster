/**
 * Wizard Chess Voice System
 * Integrates all voice MP3 files with game events
 */

export type WizardVoiceClip = 
  | 'greeting'
  | 'turn_start' 
  | 'good_move'
  | 'bad_move'
  | 'check'
  | 'checkmate'
  | 'win'
  | 'defeat'
  | 'wizard_teleport'
  | 'wizard_attack'
  | 'hint'
  | 'undo'
  | 'narration_intro';

interface VoiceClipConfig {
  id: WizardVoiceClip;
  file: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  context: string;
}

class WizardVoiceSystem {
  private audioInstances: Map<WizardVoiceClip, HTMLAudioElement> = new Map();
  private voiceQueue: WizardVoiceClip[] = [];
  private currentlyPlaying: WizardVoiceClip | null = null;
  private isEnabled = true;
  private volume = 0.8;
  private isInitialized = false;

  private readonly voiceClips: VoiceClipConfig[] = [
    { 
      id: 'greeting', 
      file: '/audio/voices/greetings.mp3', 
      description: 'Welcome greeting',
      priority: 'medium',
      context: 'game_start'
    },
    { 
      id: 'turn_start', 
      file: '/audio/voices/Turn-Start.mp3', 
      description: 'Turn beginning announcement',
      priority: 'low',
      context: 'turn_change'
    },
    { 
      id: 'good_move', 
      file: '/audio/voices/Good-Move.mp3', 
      description: 'Positive move feedback',
      priority: 'medium',
      context: 'move_evaluation'
    },
    { 
      id: 'bad_move', 
      file: '/audio/voices/Bad-move.mp3', 
      description: 'Poor move feedback',
      priority: 'medium',
      context: 'move_evaluation'
    },
    { 
      id: 'check', 
      file: '/audio/voices/check.mp3', 
      description: 'Check announcement',
      priority: 'high',
      context: 'game_state'
    },
    { 
      id: 'checkmate', 
      file: '/audio/voices/checkmate.mp3', 
      description: 'Checkmate announcement',
      priority: 'high',
      context: 'game_end'
    },
    { 
      id: 'win', 
      file: '/audio/voices/win.mp3', 
      description: 'Victory celebration',
      priority: 'high',
      context: 'game_end'
    },
    { 
      id: 'defeat', 
      file: '/audio/voices/defeat.mp3', 
      description: 'Defeat acknowledgment',
      priority: 'high',
      context: 'game_end'
    },
    { 
      id: 'wizard_teleport', 
      file: '/audio/voices/wizard-moving.mp3', 
      description: 'Wizard teleport announcement',
      priority: 'medium',
      context: 'special_move'
    },
    { 
      id: 'wizard_attack', 
      file: '/audio/voices/attack.mp3', 
      description: 'Wizard attack announcement',
      priority: 'high',
      context: 'special_move'
    },
    { 
      id: 'hint', 
      file: '/audio/voices/hint.mp3', 
      description: 'Hint provision',
      priority: 'medium',
      context: 'assistance'
    },
    { 
      id: 'undo', 
      file: '/audio/voices/undo-move.mp3', 
      description: 'Undo move confirmation',
      priority: 'low',
      context: 'assistance'
    },
    { 
      id: 'narration_intro', 
      file: '/audio/voices/introduction.mp3', 
      description: 'Game introduction narration',
      priority: 'high',
      context: 'game_intro'
    }
  ];

  /**
   * Initialize the voice system with all audio instances
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Create audio instances for each voice clip
      for (const clip of this.voiceClips) {
        const audio = new Audio(clip.file);
        audio.volume = this.volume;
        audio.preload = 'auto';
        
        // Add event listeners
        audio.addEventListener('ended', () => {
          this.onVoiceClipEnded(clip.id);
        });
        
        audio.addEventListener('error', (error) => {
          console.warn(`Voice clip load failed: ${clip.id}`, error);
        });
        
        this.audioInstances.set(clip.id, audio);
      }

      this.isInitialized = true;
      console.log('🎭 Wizard Voice System initialized with', this.voiceClips.length, 'voice clips');

    } catch (error) {
      console.error('🎭 Failed to initialize Wizard Voice System:', error);
    }
  }

  /**
   * Play a voice clip immediately or add to queue
   */
  async playVoice(clipId: WizardVoiceClip, immediate = false): Promise<void> {
    if (!this.isEnabled || !this.isInitialized) return;

    const audio = this.audioInstances.get(clipId);
    if (!audio) {
      console.warn(`Voice clip not found: ${clipId}`);
      return;
    }

    const clipConfig = this.voiceClips.find(c => c.id === clipId);
    
    if (immediate || !this.currentlyPlaying) {
      await this.playAudioClip(clipId);
    } else {
      // Add to queue based on priority
      if (clipConfig?.priority === 'high') {
        this.voiceQueue.unshift(clipId); // High priority goes to front
      } else {
        this.voiceQueue.push(clipId);
      }
    }
  }

  /**
   * Play specific voice clips for game events
   */
  async onGameEvent(event: string, data?: any): Promise<void> {
    if (!this.isEnabled) return;

    switch (event) {
      case 'game_start':
        await this.playVoice('greeting');
        break;
        
      case 'turn_start':
        if (Math.random() < 0.3) { // Only sometimes announce turn start
          await this.playVoice('turn_start');
        }
        break;
        
      case 'good_move':
        await this.playVoice('good_move');
        break;
        
      case 'bad_move':
        if (Math.random() < 0.5) { // Don't be too harsh
          await this.playVoice('bad_move');
        }
        break;
        
      case 'check':
        await this.playVoice('check', true); // Immediate
        break;
        
      case 'checkmate':
        await this.playVoice('checkmate', true); // Immediate
        break;
        
      case 'game_won':
        await this.playVoice('win', true); // Immediate
        break;
        
      case 'game_lost':
        await this.playVoice('defeat', true); // Immediate
        break;
        
      case 'wizard_move':
        const moveType = data?.moveType || 'teleport';
        if (moveType === 'attack' || data?.isCapture) {
          await this.playVoice('wizard_attack');
        } else {
          await this.playVoice('wizard_teleport');
        }
        break;
        
      case 'hint_requested':
        await this.playVoice('hint');
        break;
        
      case 'move_undone':
        await this.playVoice('undo');
        break;
        
      case 'game_intro':
        await this.playVoice('narration_intro');
        break;
    }
  }

  /**
   * Stop all voice playback
   */
  stopAll(): void {
    this.audioInstances.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.voiceQueue = [];
    this.currentlyPlaying = null;
    console.log('🎭 All voice playback stopped');
  }

  /**
   * Set voice system enabled/disabled
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stopAll();
    }
    console.log(`🎭 Voice system ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Set voice volume (0-1)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.audioInstances.forEach(audio => {
      audio.volume = this.volume;
    });
  }

  /**
   * Get current voice system state
   */
  getState() {
    return {
      isEnabled: this.isEnabled,
      isInitialized: this.isInitialized,
      currentlyPlaying: this.currentlyPlaying,
      queueLength: this.voiceQueue.length,
      volume: this.volume,
      availableClips: this.voiceClips.map(c => c.id)
    };
  }

  /**
   * Test voice playback
   */
  async testVoice(clipId: WizardVoiceClip): Promise<void> {
    console.log(`🎭 Testing voice clip: ${clipId}`);
    await this.playVoice(clipId, true);
  }

  // Private methods

  private async playAudioClip(clipId: WizardVoiceClip): Promise<void> {
    const audio = this.audioInstances.get(clipId);
    if (!audio) return;

    try {
      // Stop current playback if any
      if (this.currentlyPlaying) {
        const currentAudio = this.audioInstances.get(this.currentlyPlaying);
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }
      }

      this.currentlyPlaying = clipId;
      audio.currentTime = 0;
      await audio.play();
      
      const clipConfig = this.voiceClips.find(c => c.id === clipId);
      console.log(`🎭 Playing voice: ${clipId} (${clipConfig?.description})`);
      
    } catch (error) {
      console.warn(`Voice playback failed: ${clipId}`, error);
      this.currentlyPlaying = null;
    }
  }

  private onVoiceClipEnded(clipId: WizardVoiceClip): void {
    if (this.currentlyPlaying === clipId) {
      this.currentlyPlaying = null;
    }
    
    // Process queue
    if (this.voiceQueue.length > 0) {
      const nextClip = this.voiceQueue.shift()!;
      setTimeout(() => this.playAudioClip(nextClip), 200); // Small delay between clips
    }
  }
}

export const wizardVoiceSystem = new WizardVoiceSystem();