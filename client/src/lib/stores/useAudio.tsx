import { create } from "zustand";
import { magicalSoundLibrary, type MagicalSoundEffect } from '../audio/magicalSoundLibrary';

export type GameIntensity = 'calm' | 'moderate' | 'tense' | 'critical';

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  ambientSounds: Record<GameIntensity, HTMLAudioElement | null>;
  currentIntensity: GameIntensity;
  isMuted: boolean;
  isAmbientEnabled: boolean;
  
  // Setter functions
  setBackgroundMusic: (music: HTMLAudioElement) => void;
  setHitSound: (sound: HTMLAudioElement) => void;
  setSuccessSound: (sound: HTMLAudioElement) => void;
  setAmbientSounds: (sounds: Record<GameIntensity, HTMLAudioElement | null>) => void;
  
  // Control functions
  toggleMute: () => void;
  toggleAmbient: () => void;
  setGameIntensity: (intensity: GameIntensity) => void;
  playHit: () => void;
  playSuccess: () => void;
  playAmbient: (intensity?: GameIntensity) => void;
  stopAmbient: () => void;
  playBackgroundMusic: () => void;
  stopBackgroundMusic: () => void;
  initializeAudio: () => void;
  
  // Magical Sound Library functions
  playMagicalSound: (soundId: MagicalSoundEffect, options?: {
    volume?: number;
    playbackRate?: number;
    delay?: number;
  }) => Promise<void>;
  playPieceMovementSound: (pieceType: string, isCapture?: boolean) => Promise<void>;
  playWizardAbility: (abilityType: 'teleport' | 'ranged_attack' | 'summon') => Promise<void>;
  playGameEvent: (eventType: 'check' | 'checkmate_win' | 'checkmate_lose' | 'castling' | 'promotion' | 'game_start') => Promise<void>;
  playUISound: (uiType: 'hover' | 'click' | 'menu_open' | 'menu_close' | 'success' | 'error' | 'notification') => Promise<void>;
  playAmbientMagic: (intensityLevel: 'low' | 'medium' | 'high') => Promise<void>;
  stopAmbientMagic: () => void;
  initializeMagicalSounds: () => Promise<void>;
}

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: null,
  hitSound: null,
  successSound: null,
  ambientSounds: {
    calm: null,
    moderate: null,
    tense: null,
    critical: null
  },
  currentIntensity: 'calm',
  isMuted: false, // Start unmuted by default
  isAmbientEnabled: true,
  
  setBackgroundMusic: (music) => set({ backgroundMusic: music }),
  setHitSound: (sound) => set({ hitSound: sound }),
  setSuccessSound: (sound) => set({ successSound: sound }),
  setAmbientSounds: (sounds) => set({ ambientSounds: sounds }),
  
  toggleMute: () => {
    const { isMuted, ambientSounds, currentIntensity, backgroundMusic } = get();
    const newMutedState = !isMuted;
    
    console.log(`🔊 Toggling mute: ${isMuted} → ${newMutedState}`);
    
    if (newMutedState) {
      // Stop all sounds when muting
      Object.values(ambientSounds).forEach(sound => {
        if (sound) {
          sound.pause();
          sound.currentTime = 0;
        }
      });
      
      // Stop background music
      if (backgroundMusic) {
        backgroundMusic.pause();
        console.log('🎵 Background music paused (muted)');
      }
    } else {
      // Resume sounds when unmuting
      const currentAmbient = ambientSounds[currentIntensity];
      if (currentAmbient && get().isAmbientEnabled) {
        currentAmbient.play().catch(error => {
          console.log("Ambient sound play prevented:", error);
        });
      }
      
      // Resume background music
      if (backgroundMusic) {
        backgroundMusic.play().then(() => {
          console.log('🎵 Background music resumed (unmuted)');
        }).catch(error => {
          console.log('❌ Background music play failed:', error);
        });
      }
    }
    
    set({ isMuted: newMutedState });
    console.log(`🔊 Sound ${newMutedState ? 'muted' : 'unmuted'}`);
  },

  toggleAmbient: () => {
    const { isAmbientEnabled, isMuted, ambientSounds, currentIntensity } = get();
    const newAmbientState = !isAmbientEnabled;
    
    if (!newAmbientState) {
      // Stop all ambient sounds
      Object.values(ambientSounds).forEach(sound => {
        if (sound) {
          sound.pause();
          sound.currentTime = 0;
        }
      });
    } else if (!isMuted) {
      // Start current intensity ambient sound
      const currentAmbient = ambientSounds[currentIntensity];
      if (currentAmbient) {
        currentAmbient.play().catch(error => {
          console.log("Ambient sound play prevented:", error);
        });
      }
    }
    
    set({ isAmbientEnabled: newAmbientState });
    console.log(`Ambient sounds ${newAmbientState ? 'enabled' : 'disabled'}`);
  },

  setGameIntensity: (intensity: GameIntensity) => {
    const { isMuted, isAmbientEnabled, ambientSounds, currentIntensity } = get();
    
    // Stop current ambient sound
    const currentAmbient = ambientSounds[currentIntensity];
    if (currentAmbient) {
      currentAmbient.pause();
      currentAmbient.currentTime = 0;
    }
    
    // Start new ambient sound if not muted and ambient enabled
    if (!isMuted && isAmbientEnabled) {
      const newAmbient = ambientSounds[intensity];
      if (newAmbient) {
        newAmbient.play().catch(error => {
          console.log("Ambient sound play prevented:", error);
        });
      }
    }
    
    set({ currentIntensity: intensity });
    console.log(`🎵 Game intensity changed to: ${intensity}`);
  },

  playAmbient: (intensity?: GameIntensity) => {
    const { isMuted, isAmbientEnabled, ambientSounds, currentIntensity } = get();
    
    if (isMuted || !isAmbientEnabled) return;
    
    const targetIntensity = intensity || currentIntensity;
    const ambientSound = ambientSounds[targetIntensity];
    
    if (ambientSound) {
      ambientSound.currentTime = 0;
      ambientSound.play().catch(error => {
        console.log("Ambient sound play prevented:", error);
      });
    }
  },

  stopAmbient: () => {
    const { ambientSounds } = get();
    Object.values(ambientSounds).forEach(sound => {
      if (sound) {
        sound.pause();
        sound.currentTime = 0;
      }
    });
  },

  playBackgroundMusic: () => {
    const { backgroundMusic, isMuted } = get();
    
    console.log('🎵 playBackgroundMusic called:', { hasMusic: !!backgroundMusic, isMuted });
    
    if (backgroundMusic && !isMuted) {
      backgroundMusic.loop = true;
      backgroundMusic.volume = 0.3; // Lower volume for background music
      backgroundMusic.currentTime = 0;
      backgroundMusic.play().then(() => {
        console.log('🎵 Background music started playing');
      }).catch(error => {
        console.log('❌ Background music play failed:', error);
      });
    } else if (isMuted) {
      console.log('🎵 Background music skipped (muted)');
    } else {
      console.log('❌ No background music available');
    }
  },

  stopBackgroundMusic: () => {
    const { backgroundMusic } = get();
    
    if (backgroundMusic) {
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
      console.log('🎵 Background music stopped');
    }
  },
  
  playHit: () => {
    const { hitSound, isMuted } = get();
    console.log('🎵 playHit called:', { hasHitSound: !!hitSound, isMuted });
    if (hitSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Hit sound skipped (muted)");
        return;
      }
      
      // Clone the sound to allow overlapping playback
      const soundClone = hitSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.5; // Increase volume
      console.log('🎵 Playing sound clone...');
      soundClone.play().then(() => {
        console.log('🎵 Sound played successfully');
      }).catch(error => {
        console.log("Hit sound play prevented:", error);
      });
    } else {
      console.log('❌ No hit sound available');
    }
  },
  
  playSuccess: () => {
    const { successSound, isMuted } = get();
    if (successSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Success sound skipped (muted)");
        return;
      }
      
      successSound.currentTime = 0;
      successSound.play().catch(error => {
        console.log("Success sound play prevented:", error);
      });
    }
  },

  initializeAudio: () => {
    console.log('🎵 Initializing audio system - setting to unmuted');
    set({ isMuted: false });
  },
  
  // Magical Sound Library Implementation
  initializeMagicalSounds: async () => {
    try {
      await magicalSoundLibrary.initialize();
      console.log('✨ Magical Sound Library initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Magical Sound Library:', error);
    }
  },
  
  playMagicalSound: async (soundId: MagicalSoundEffect, options?: {
    volume?: number;
    playbackRate?: number;
    delay?: number;
  }) => {
    const { isMuted } = get();
    if (isMuted) {
      console.log(`🎭 Magical sound skipped (muted): ${soundId}`);
      return;
    }
    
    try {
      await magicalSoundLibrary.playSound(soundId, options);
    } catch (error) {
      console.log(`🎭 Failed to play magical sound: ${soundId}`, error);
    }
  },
  
  playPieceMovementSound: async (pieceType: string, isCapture: boolean = false) => {
    const { isMuted } = get();
    if (isMuted) return;
    
    try {
      await magicalSoundLibrary.playPieceMovementSound(pieceType, isCapture);
    } catch (error) {
      console.log(`🎭 Failed to play piece movement sound for: ${pieceType}`, error);
    }
  },
  
  playWizardAbility: async (abilityType: 'teleport' | 'ranged_attack' | 'summon') => {
    const { isMuted } = get();
    if (isMuted) return;
    
    try {
      await magicalSoundLibrary.playWizardAbility(abilityType);
    } catch (error) {
      console.log(`🎭 Failed to play wizard ability sound: ${abilityType}`, error);
    }
  },
  
  playGameEvent: async (eventType: 'check' | 'checkmate_win' | 'checkmate_lose' | 'castling' | 'promotion' | 'game_start') => {
    const { isMuted } = get();
    if (isMuted) return;
    
    try {
      await magicalSoundLibrary.playGameEvent(eventType);
    } catch (error) {
      console.log(`🎭 Failed to play game event sound: ${eventType}`, error);
    }
  },
  
  playUISound: async (uiType: 'hover' | 'click' | 'menu_open' | 'menu_close' | 'success' | 'error' | 'notification') => {
    const { isMuted } = get();
    if (isMuted) return;
    
    try {
      await magicalSoundLibrary.playUISound(uiType);
    } catch (error) {
      console.log(`🎭 Failed to play UI sound: ${uiType}`, error);
    }
  },
  
  playAmbientMagic: async (intensityLevel: 'low' | 'medium' | 'high') => {
    const { isMuted, isAmbientEnabled } = get();
    if (isMuted || !isAmbientEnabled) return;
    
    try {
      await magicalSoundLibrary.playAmbientMagic(intensityLevel);
    } catch (error) {
      console.log(`🎭 Failed to play ambient magic: ${intensityLevel}`, error);
    }
  },
  
  stopAmbientMagic: () => {
    try {
      magicalSoundLibrary.stopAmbientSounds();
      console.log('🎭 Ambient magical sounds stopped');
    } catch (error) {
      console.log('🎭 Failed to stop ambient magical sounds', error);
    }
  }
}));
