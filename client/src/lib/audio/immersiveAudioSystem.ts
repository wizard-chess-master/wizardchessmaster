/**
 * Immersive 3D Audio System for Wizard Chess
 * Features background music, spatial audio effects, and low-latency piece sounds
 */

export interface SpatialPosition {
  x: number;
  y: number;
  z?: number;
}

export interface AudioEffectConfig {
  volume: number;
  pan: number; // -1 to 1 for stereo panning
  pitch: number; // playback rate multiplier
  reverb?: number; // 0 to 1 for reverb intensity
  delay?: number; // delay in seconds
}

class ImmersiveAudioSystem {
  private audioContext: AudioContext | null = null;
  private backgroundMusic: HTMLAudioElement | null = null;
  private spatialSources: Map<string, AudioBufferSourceNode> = new Map();
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private effectsGain: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private isInitialized = false;
  private isMuted = false;

  // Audio file paths
  private readonly audioPaths = {
    backgroundMusic: '/sounds/background.mp3',
    pieceMove: '/sounds/success.mp3',
    pieceCapture: '/sounds/hit.mp3',
    wizardTeleport: '/sounds/hit.mp3',
    wizardAttack: '/sounds/hit.mp3',
    gameEvent: '/sounds/success.mp3'
  };

  // Flag to disable background music in favor of theme music
  private disableBackgroundMusic = true;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize Web Audio API
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume context if needed (Chrome autoplay policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Create master gain nodes
      this.masterGain = this.audioContext.createGain();
      this.musicGain = this.audioContext.createGain();
      this.effectsGain = this.audioContext.createGain();

      // Connect gain nodes
      this.masterGain.connect(this.audioContext.destination);
      this.musicGain.connect(this.masterGain);
      this.effectsGain.connect(this.masterGain);

      // Set initial volumes
      this.masterGain.gain.value = 0.7;
      this.musicGain.gain.value = 0.3;
      this.effectsGain.gain.value = 0.8;

      // Create reverb effect
      await this.setupReverb();

      // Preload audio buffers
      await this.preloadAudioBuffers();

      // Start background music only if not disabled
      if (!this.disableBackgroundMusic) {
        await this.startBackgroundMusic();
      } else {
        console.log('🎵 Background music disabled - using theme music instead');
      }

      this.isInitialized = true;
      console.log('✅ Immersive Audio System initialized');

    } catch (error) {
      console.warn('⚠️ Audio system initialization failed:', error);
    }
  }

  private async setupReverb(): Promise<void> {
    if (!this.audioContext) return;

    this.reverbNode = this.audioContext.createConvolver();
    
    // Create impulse response for reverb (medieval hall effect)
    const impulseLength = this.audioContext.sampleRate * 2; // 2 seconds
    const impulse = this.audioContext.createBuffer(2, impulseLength, this.audioContext.sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < impulseLength; i++) {
        const decay = Math.pow(1 - i / impulseLength, 2);
        channelData[i] = (Math.random() * 2 - 1) * decay * 0.3;
      }
    }
    
    this.reverbNode.buffer = impulse;
    if (this.masterGain) {
      this.reverbNode.connect(this.masterGain);
    }
  }

  private async preloadAudioBuffers(): Promise<void> {
    if (!this.audioContext) return;

    const loadPromises = Object.entries(this.audioPaths).map(async ([key, path]) => {
      try {
        const response = await fetch(path);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
        this.audioBuffers.set(key, audioBuffer);
      } catch (error) {
        console.warn(`Failed to load audio: ${path}`, error);
      }
    });

    await Promise.all(loadPromises);
    console.log(`🎵 Preloaded ${this.audioBuffers.size} audio buffers`);
  }

  private async startBackgroundMusic(): Promise<void> {
    if (!this.musicGain) return;

    try {
      this.backgroundMusic = new Audio(this.audioPaths.backgroundMusic);
      this.backgroundMusic.loop = true;
      this.backgroundMusic.volume = 0;
      
      // Create media source for spatial processing
      const mediaSource = this.audioContext!.createMediaElementSource(this.backgroundMusic);
      mediaSource.connect(this.musicGain);
      
      // Fade in background music
      await this.backgroundMusic.play();
      this.fadeVolume(this.backgroundMusic, 0.4, 2000);
      
      console.log('🎼 Background music started');
    } catch (error) {
      console.warn('⚠️ Background music failed to start:', error);
    }
  }

  private fadeVolume(audio: HTMLAudioElement, targetVolume: number, duration: number): void {
    const startVolume = audio.volume;
    const volumeDelta = targetVolume - startVolume;
    const steps = 20;
    const stepTime = duration / steps;
    let currentStep = 0;

    const fadeInterval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      audio.volume = startVolume + (volumeDelta * progress);

      if (currentStep >= steps) {
        clearInterval(fadeInterval);
      }
    }, stepTime);
  }

  // Play 3D positioned audio effect
  playSpatialized3D(soundKey: string, position: SpatialPosition, config?: Partial<AudioEffectConfig>): void {
    if (!this.audioContext || !this.effectsGain || this.isMuted) return;

    const buffer = this.audioBuffers.get(soundKey);
    if (!buffer) {
      console.warn(`Audio buffer not found: ${soundKey}`);
      return;
    }

    try {
      // Create audio source
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;

      // Create panner for 3D positioning
      const panner = this.audioContext.createPanner();
      panner.panningModel = 'HRTF';
      panner.distanceModel = 'inverse';
      panner.maxDistance = 100;
      panner.rolloffFactor = 1;

      // Set 3D position (chess board coordinates to 3D space)
      const x = (position.x - 4.5) * 2; // Center board and scale
      const y = 0;
      const z = (position.y - 4.5) * 2;
      panner.setPosition(x, y, z);

      // Create gain node for volume control
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = config?.volume ?? 0.7;

      // Apply pitch variation
      source.playbackRate.value = config?.pitch ?? 1.0;

      // Connect audio graph
      source.connect(gainNode);
      gainNode.connect(panner);
      panner.connect(this.effectsGain);

      // Add reverb for magical effects
      if (config?.reverb && this.reverbNode) {
        const reverbGain = this.audioContext.createGain();
        reverbGain.gain.value = config.reverb;
        gainNode.connect(reverbGain);
        reverbGain.connect(this.reverbNode);
      }

      // Play sound
      source.start();
      source.stop(this.audioContext.currentTime + 3); // Auto-stop after 3s

      // Cleanup
      source.onended = () => {
        this.spatialSources.delete(soundKey);
      };

      this.spatialSources.set(soundKey, source);

    } catch (error) {
      console.warn('Failed to play spatialized audio:', error);
    }
  }

  // Chess-specific audio methods
  playPieceMove(from: SpatialPosition, to: SpatialPosition, pieceType: string): void {
    const midPoint = {
      x: (from.x + to.x) / 2,
      y: (from.y + to.y) / 2
    };

    let config: Partial<AudioEffectConfig> = { volume: 0.5 };

    // Vary sound based on piece type
    switch (pieceType.toLowerCase()) {
      case 'pawn':
        config.pitch = 1.2;
        break;
      case 'knight':
        config.pitch = 0.8;
        config.reverb = 0.1;
        break;
      case 'rook':
        config.pitch = 0.6;
        break;
      case 'bishop':
        config.pitch = 1.1;
        config.reverb = 0.15;
        break;
      case 'queen':
        config.pitch = 0.9;
        config.reverb = 0.2;
        break;
      case 'king':
        config.pitch = 0.7;
        config.reverb = 0.3;
        break;
      case 'wizard':
        config.reverb = 0.4;
        config.pitch = 0.85;
        break;
    }

    this.playSpatialized3D('pieceMove', midPoint, config);
  }

  playPieceCapture(position: SpatialPosition, isWizard: boolean = false): void {
    const config: Partial<AudioEffectConfig> = {
      volume: 0.8,
      pitch: isWizard ? 0.9 : 1.0,
      reverb: isWizard ? 0.3 : 0.1
    };

    this.playSpatialized3D('pieceCapture', position, config);
  }

  playWizardTeleport(from: SpatialPosition, to: SpatialPosition): void {
    // Play whoosh at departure
    this.playSpatialized3D('wizardTeleport', from, {
      volume: 0.7,
      pitch: 1.2,
      reverb: 0.5
    });

    // Play arrival sound with delay
    setTimeout(() => {
      this.playSpatialized3D('wizardTeleport', to, {
        volume: 0.6,
        pitch: 0.8,
        reverb: 0.4
      });
    }, 200);
  }

  playWizardAttack(position: SpatialPosition, targetPosition: SpatialPosition): void {
    // Cast sound at wizard position
    this.playSpatialized3D('wizardAttack', position, {
      volume: 0.8,
      pitch: 0.9,
      reverb: 0.6
    });

    // Impact sound at target with delay
    setTimeout(() => {
      this.playSpatialized3D('pieceCapture', targetPosition, {
        volume: 0.9,
        pitch: 1.1,
        reverb: 0.3
      });
    }, 300);
  }

  playGameEvent(eventType: 'check' | 'checkmate' | 'castling' | 'promotion'): void {
    const centerPosition = { x: 4.5, y: 4.5 };
    
    let config: Partial<AudioEffectConfig> = {
      volume: 0.9,
      reverb: 0.4
    };

    switch (eventType) {
      case 'check':
        config.pitch = 1.3;
        break;
      case 'checkmate':
        config.pitch = 0.7;
        config.reverb = 0.8;
        break;
      case 'castling':
        config.pitch = 0.8;
        config.reverb = 0.2;
        break;
      case 'promotion':
        config.pitch = 1.1;
        config.reverb = 0.5;
        break;
    }

    this.playSpatialized3D('gameEvent', centerPosition, config);
  }

  // Volume controls
  setMasterVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  setMusicVolume(volume: number): void {
    if (this.musicGain) {
      this.musicGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  setEffectsVolume(volume: number): void {
    if (this.effectsGain) {
      this.effectsGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  toggleMute(): void {
    this.isMuted = !this.isMuted;
    
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : 0.7;
    }
    
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = this.isMuted ? 0 : 0.4;
    }
  }

  // Dynamic music intensity based on game state
  setMusicIntensity(intensity: 'calm' | 'tension' | 'battle' | 'victory' | 'defeat'): void {
    if (!this.backgroundMusic || !this.musicGain) return;

    let targetVolume = 0.4;
    let playbackRate = 1.0;

    switch (intensity) {
      case 'calm':
        targetVolume = 0.3;
        playbackRate = 0.9;
        break;
      case 'tension':
        targetVolume = 0.5;
        playbackRate = 1.1;
        break;
      case 'battle':
        targetVolume = 0.6;
        playbackRate = 1.2;
        break;
      case 'victory':
        targetVolume = 0.7;
        playbackRate = 1.0;
        break;
      case 'defeat':
        targetVolume = 0.2;
        playbackRate = 0.8;
        break;
    }

    // Smooth transitions
    this.fadeVolume(this.backgroundMusic, targetVolume, 1000);
    
    if ((this.backgroundMusic as any).preservesPitch !== undefined) {
      (this.backgroundMusic as any).playbackRate = playbackRate;
    }
  }

  dispose(): void {
    // Clean up resources
    this.spatialSources.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Source might already be stopped
      }
    });
    this.spatialSources.clear();

    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }

    this.isInitialized = false;
    console.log('🔇 Audio system disposed');
  }
}

// Export singleton instance
export const immersiveAudio = new ImmersiveAudioSystem();