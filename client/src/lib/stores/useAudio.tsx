import { create } from "zustand";
import { magicalSoundLibrary, type MagicalSoundEffect } from '../audio/magicalSoundLibrary';

export type GameIntensity = 'calm' | 'moderate' | 'tense' | 'critical';
export type MusicTrack = 'main_theme' | 'battle_theme' | 'victory_theme' | 'tension_theme' | 'wizard_theme';

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  themeMusic: HTMLAudioElement | null;
  isThemeMusicEnabled: boolean;
  themeVolume: number;
  musicTracks: Record<MusicTrack, HTMLAudioElement | null>;
  currentTrack: MusicTrack;
  isTransitioning: boolean;
  musicVolume: number;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  ambientSounds: Record<GameIntensity, HTMLAudioElement | null>;
  currentIntensity: GameIntensity;
  isMuted: boolean;
  isAmbientEnabled: boolean;
  
  // Setter functions
  setBackgroundMusic: (music: HTMLAudioElement) => void;
  setThemeMusic: (music: HTMLAudioElement) => void;
  setMusicTracks: (tracks: Record<MusicTrack, HTMLAudioElement | null>) => void;
  setHitSound: (sound: HTMLAudioElement) => void;
  setSuccessSound: (sound: HTMLAudioElement) => void;
  setAmbientSounds: (sounds: Record<GameIntensity, HTMLAudioElement | null>) => void;
  
  // Control functions
  toggleMute: () => void;
  toggleAmbient: () => void;
  toggleThemeMusic: () => void;
  setGameIntensity: (intensity: GameIntensity) => void;
  playHit: () => void;
  playSuccess: () => void;
  playAmbient: (intensity?: GameIntensity) => void;
  stopAmbient: () => void;
  playBackgroundMusic: () => void;
  stopBackgroundMusic: () => void;
  playThemeMusic: () => void;
  stopThemeMusic: () => void;
  setThemeVolume: (volume: number) => void;
  switchMusicTrack: (track: MusicTrack, crossfade?: boolean) => void;
  setDynamicMusic: (gameState: 'menu' | 'playing' | 'check' | 'victory' | 'defeat') => void;
  initializeAudio: () => void;
  initializeThemeMusic: () => Promise<void>;
  
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
  themeMusic: null,
  isThemeMusicEnabled: true,
  themeVolume: 0.5,
  musicTracks: {
    main_theme: null,
    battle_theme: null,
    victory_theme: null,
    tension_theme: null,
    wizard_theme: null
  },
  currentTrack: 'main_theme',
  isTransitioning: false,
  musicVolume: 0.3,
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
  setThemeMusic: (music) => set({ themeMusic: music }),
  setMusicTracks: (tracks) => set({ musicTracks: tracks }),
  setHitSound: (sound) => set({ hitSound: sound }),
  setSuccessSound: (sound) => set({ successSound: sound }),
  setAmbientSounds: (sounds) => set({ ambientSounds: sounds }),
  
  toggleMute: () => {
    const { isMuted, ambientSounds, currentIntensity, backgroundMusic, themeMusic } = get();
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
      
      // Stop theme music
      if (themeMusic) {
        themeMusic.pause();
        console.log('🎵 Theme music paused (muted)');
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
      
      // Resume theme music
      if (themeMusic && get().isThemeMusicEnabled) {
        themeMusic.play().then(() => {
          console.log('🎵 Theme music resumed (unmuted)');
        }).catch(error => {
          console.log('❌ Theme music play failed:', error);
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

  stopAllSounds: () => {
    const { ambientSounds, backgroundMusic, themeMusic } = get();
    
    // Stop all ambient sounds
    Object.values(ambientSounds).forEach(sound => {
      if (sound) {
        sound.pause();
        sound.currentTime = 0;
      }
    });
    
    // Stop background music
    if (backgroundMusic) {
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
    }
    
    // Stop theme music
    if (themeMusic) {
      themeMusic.pause();
      themeMusic.currentTime = 0;
    }
    
    // Stop any looping HTML audio elements
    const allAudioElements = document.querySelectorAll('audio');
    allAudioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    
    console.log('🔇 All audio stopped');
  },

  playBackgroundMusic: () => {
    const { currentTrack } = get();
    get().switchMusicTrack(currentTrack, false);
  },

  stopBackgroundMusic: () => {
    const { musicTracks } = get();
    
    Object.values(musicTracks).forEach(track => {
      if (track) {
        track.pause();
        track.currentTime = 0;
      }
    });
    console.log('🎵 All background music stopped');
  },

  switchMusicTrack: (track: MusicTrack, crossfade: boolean = true) => {
    const { musicTracks, currentTrack, isMuted, musicVolume, isTransitioning } = get();
    
    if (isMuted || isTransitioning || currentTrack === track) {
      return;
    }
    
    const newTrack = musicTracks[track];
    const oldTrack = musicTracks[currentTrack];
    
    if (!newTrack) {
      console.log(`❌ Track not available: ${track}`);
      return;
    }
    
    console.log(`🎵 Switching from ${currentTrack} to ${track} (crossfade: ${crossfade})`);
    
    set({ isTransitioning: true, currentTrack: track });
    
    if (crossfade && oldTrack && !oldTrack.paused) {
      // Crossfade between tracks
      newTrack.volume = 0;
      newTrack.loop = true;
      newTrack.currentTime = 0;
      newTrack.play().catch(console.log);
      
      // Fade out old track and fade in new track
      const fadeSteps = 20;
      const fadeInterval = 100; // ms
      let step = 0;
      
      const fadeTimer = setInterval(() => {
        step++;
        const progress = step / fadeSteps;
        
        if (oldTrack) {
          oldTrack.volume = musicVolume * (1 - progress);
        }
        newTrack.volume = musicVolume * progress;
        
        if (step >= fadeSteps) {
          clearInterval(fadeTimer);
          if (oldTrack) {
            oldTrack.pause();
            oldTrack.currentTime = 0;
          }
          set({ isTransitioning: false });
          console.log(`🎵 Crossfade complete to ${track}`);
        }
      }, fadeInterval);
    } else {
      // Instant switch
      if (oldTrack) {
        oldTrack.pause();
        oldTrack.currentTime = 0;
      }
      
      newTrack.loop = true;
      newTrack.volume = musicVolume;
      newTrack.currentTime = 0;
      newTrack.play().then(() => {
        console.log(`🎵 Switched to ${track}`);
        set({ isTransitioning: false });
      }).catch(error => {
        console.log(`❌ Failed to play ${track}:`, error);
        set({ isTransitioning: false });
      });
    }
  },

  setDynamicMusic: (gameState: 'menu' | 'playing' | 'check' | 'victory' | 'defeat') => {
    let targetTrack: MusicTrack;
    
    switch (gameState) {
      case 'menu':
        targetTrack = 'main_theme';
        break;
      case 'playing':
        targetTrack = Math.random() > 0.5 ? 'battle_theme' : 'wizard_theme';
        break;
      case 'check':
        targetTrack = 'tension_theme';
        break;
      case 'victory':
        targetTrack = 'victory_theme';
        break;
      case 'defeat':
        targetTrack = 'tension_theme';
        break;
      default:
        targetTrack = 'main_theme';
    }
    
    console.log(`🎵 Setting dynamic music for ${gameState} state: ${targetTrack}`);
    get().switchMusicTrack(targetTrack, true);
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

  // ===== THEME MUSIC SYSTEM =====
  toggleThemeMusic: () => {
    const { isThemeMusicEnabled, isMuted, themeMusic } = get();
    const newThemeState = !isThemeMusicEnabled;
    
    if (!newThemeState && themeMusic) {
      // Stop theme music
      themeMusic.pause();
      themeMusic.currentTime = 0;
      console.log('🎵 Theme music stopped');
    } else if (newThemeState && !isMuted && themeMusic) {
      // Start theme music
      themeMusic.play().then(() => {
        console.log('🎵 Theme music started');
      }).catch(error => {
        console.log('❌ Theme music play failed:', error);
      });
    }
    
    set({ isThemeMusicEnabled: newThemeState });
    console.log(`🎵 Theme music ${newThemeState ? 'enabled' : 'disabled'}`);
  },

  playThemeMusic: () => {
    const { themeMusic, isMuted, isThemeMusicEnabled } = get();
    
    if (!themeMusic || isMuted || !isThemeMusicEnabled) return;
    
    themeMusic.currentTime = 0;
    themeMusic.play().then(() => {
      console.log('🎵 Theme music playing');
    }).catch(error => {
      console.log('❌ Theme music play failed:', error);
    });
  },

  stopThemeMusic: () => {
    const { themeMusic } = get();
    if (themeMusic) {
      themeMusic.pause();
      themeMusic.currentTime = 0;
      console.log('🎵 Theme music stopped');
    }
  },

  setThemeVolume: (volume: number) => {
    const { themeMusic } = get();
    const clampedVolume = Math.max(0, Math.min(1, volume));
    
    set({ themeVolume: clampedVolume });
    
    if (themeMusic) {
      themeMusic.volume = clampedVolume;
      console.log(`🎵 Theme volume set to: ${clampedVolume}`);
    }
  },

  initializeThemeMusic: async () => {
    try {
      const theme = new Audio('/assets/music/Theme-music1.mp3');
      theme.loop = true;
      theme.volume = get().themeVolume;
      theme.preload = 'auto';

      // Optimize for Replit performance
      theme.crossOrigin = 'anonymous';
      
      // Handle loading events
      theme.addEventListener('canplaythrough', () => {
        console.log('🎵 Theme music loaded and ready to play');
      });

      theme.addEventListener('error', (error) => {
        console.warn('❌ Theme music failed to load:', error);
      });

      // Ensure seamless looping
      theme.addEventListener('ended', () => {
        if (get().isThemeMusicEnabled && !get().isMuted) {
          theme.currentTime = 0;
          theme.play().catch(console.warn);
        }
      });

      set({ themeMusic: theme });
      console.log('🎵 Theme music initialized');
      
      // Auto-play theme music if enabled
      if (get().isThemeMusicEnabled && !get().isMuted) {
        setTimeout(() => {
          theme.play().catch(console.warn);
        }, 1000);
      }
      
    } catch (error) {
      console.error('❌ Failed to initialize theme music:', error);
    }
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
