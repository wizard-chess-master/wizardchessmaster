import { create } from "zustand";
import { wizardChessAudio } from '../audio/audioManager';

interface AudioState {
  isMuted: boolean;
  volume: number;
  initialized: boolean;
  backgroundMusic: HTMLAudioElement | null;
  
  // Control functions
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  initializeAudio: () => Promise<void>;
  playBackgroundMusic: () => void;
  stopBackgroundMusic: () => void;
  playUISound: (type: string) => void;
  playPieceMovementSound: (moveType?: string) => void;
  playGameEvent: (event: string) => void;
  playWizardAbility: (ability: string) => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  isMuted: false,
  volume: 0.7,
  initialized: false,
  backgroundMusic: null,
  
  toggleMute: () => {
    const { isMuted, backgroundMusic, stopBackgroundMusic, playBackgroundMusic } = get();
    const newMutedState = !isMuted;
    
    wizardChessAudio.setMuted(newMutedState);
    set({ isMuted: newMutedState });
    
    // Handle background music based on mute state
    if (newMutedState) {
      // Stop background music when muting
      stopBackgroundMusic();
      console.log(`🔊 Audio muted`);
    } else {
      // Start background music when unmuting
      console.log(`🔊 Audio unmuted`);
      // Don't auto-start music here, let the user control it
    }
  },

  setVolume: (volume: number) => {
    wizardChessAudio.setVolume(volume);
    set({ volume });
    console.log(`🔊 Volume set to: ${Math.round(volume * 100)}%`);
  },

  initializeAudio: async () => {
    if (get().initialized) return;
    
    // Stop all audio on load as requested
    console.log('🛑 Stopping all audio on initialization...');
    document.querySelectorAll('audio').forEach(a => a.pause());
    console.log('Active audio:', Array.from(document.querySelectorAll('audio')).map(a => a.src));
    
    console.log('🎵 Initializing Wizard Chess Audio System...');
    await wizardChessAudio.initialize();
    set({ initialized: true });
    console.log('✅ Wizard Chess Audio System initialized');
  },

  playBackgroundMusic: () => {
    const { isMuted, backgroundMusic } = get();
    
    // Stop any existing background music first and comprehensive cleanup
    if (backgroundMusic) {
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
    }
    
    // Stop all audio on load as requested
    document.querySelectorAll('audio').forEach(a => a.pause());
    console.log('Active audio:', Array.from(document.querySelectorAll('audio')).map(a => a.src));
    
    if (isMuted) {
      console.log('🎵 Background music not started - audio is muted');
      return;
    }

    // Create new Audio instance with v=10 cache busting as requested
    const theme = new Audio('/assets/music/Theme-music1.mp3?v=10');
    theme.loop = true;
    theme.volume = 0.42; // Set exact volume as requested
    
    console.log('🎵 Playing music:', theme.src);
    console.log('🎵 ONLY Theme-music1.mp3 should play - no old music references');
    
    theme.play()
      .then(() => {
        console.log('✅ Background music started successfully');
        console.log('✅ Theme-music1.mp3 v=10 confirmed playing');
        set({ backgroundMusic: theme });
      })
      .catch((error) => {
        console.error('❌ Failed to play background music:', error);
      });
  },

  stopBackgroundMusic: () => {
    const { backgroundMusic } = get();
    if (backgroundMusic) {
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
      set({ backgroundMusic: null });
      console.log('🛑 Background music stopped');
    }
  },

  playUISound: (type: string) => {
    const { isMuted } = get();
    if (isMuted) return;

    // Stop all existing audio first as requested
    document.querySelectorAll('audio').forEach(a => a.pause());
    console.log('Active audio:', Array.from(document.querySelectorAll('audio')).map(a => a.src));

    const sound = new Audio(`/assets/sound-fx/button_${type}.mp3?v=1`);
    sound.volume = 0.3;
    sound.play().catch(() => {
      // Fallback to generic click sound
      const fallback = new Audio('/sounds/hit.mp3');
      fallback.volume = 0.3;
      fallback.play().catch(() => console.log('🔊 UI sound fallback failed'));
    });
  },

  playPieceMovementSound: (moveType: string = 'move') => {
    const { isMuted } = get();
    if (isMuted) return;

    const sound = new Audio(`/assets/sound-fx/move_${moveType}.mp3?v=1`);
    sound.volume = 0.4;
    sound.play().catch(() => {
      // Fallback
      const fallback = new Audio('/sounds/hit.mp3');
      fallback.volume = 0.4;
      fallback.play().catch(() => console.log('🔊 Movement sound fallback failed'));
    });
  },

  playGameEvent: (event: string) => {
    const { isMuted } = get();
    if (isMuted) return;

    const sound = new Audio(`/assets/sound-fx/${event}.mp3?v=1`);
    sound.volume = 0.5;
    sound.play().catch(() => {
      // Fallback
      const fallback = new Audio('/sounds/success.mp3');
      fallback.volume = 0.5;
      fallback.play().catch(() => console.log('🔊 Game event sound fallback failed'));
    });
  },

  playWizardAbility: (ability: string) => {
    const { isMuted } = get();
    if (isMuted) return;

    const sound = new Audio(`/assets/sound-fx/wizard_${ability}.mp3?v=1`);
    sound.volume = 0.6;
    sound.play().catch(() => {
      // Fallback
      const fallback = new Audio('/sounds/success.mp3');
      fallback.volume = 0.6;
      fallback.play().catch(() => console.log('🔊 Wizard ability sound fallback failed'));
    });
  },
}));