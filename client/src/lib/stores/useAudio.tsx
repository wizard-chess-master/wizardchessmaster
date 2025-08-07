import { create } from "zustand";

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
    const { isMuted, ambientSounds, currentIntensity } = get();
    const newMutedState = !isMuted;
    
    // Stop ambient sounds if muting
    if (newMutedState) {
      Object.values(ambientSounds).forEach(sound => {
        if (sound) {
          sound.pause();
          sound.currentTime = 0;
        }
      });
    } else {
      // Resume ambient sound if unmuting
      const currentAmbient = ambientSounds[currentIntensity];
      if (currentAmbient && get().isAmbientEnabled) {
        currentAmbient.play().catch(error => {
          console.log("Ambient sound play prevented:", error);
        });
      }
    }
    
    // Just update the muted state
    set({ isMuted: newMutedState });
    
    // Log the change
    console.log(`Sound ${newMutedState ? 'muted' : 'unmuted'}`);
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
  
  playHit: () => {
    const { hitSound, isMuted } = get();
    if (hitSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Hit sound skipped (muted)");
        return;
      }
      
      // Clone the sound to allow overlapping playback
      const soundClone = hitSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.3;
      soundClone.play().catch(error => {
        console.log("Hit sound play prevented:", error);
      });
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
  }
}));
