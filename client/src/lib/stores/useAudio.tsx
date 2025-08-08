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
    
    console.log('🎵 Initializing Wizard Chess Audio System...');
    await wizardChessAudio.initialize();
    set({ initialized: true });
    console.log('✅ Wizard Chess Audio System initialized');
  },

  playBackgroundMusic: () => {
    const { isMuted, backgroundMusic } = get();
    
    // Stop any existing background music first
    if (backgroundMusic) {
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
    }
    
    if (isMuted) {
      console.log('🎵 Background music not started - audio is muted');
      return;
    }

    // Create new Audio instance with v=8 cache busting as requested
    const theme = new Audio('/assets/music/Theme-music1.mp3?v=8');
    theme.loop = true;
    theme.volume = 0.42; // Set exact volume as requested
    
    console.log('🎵 Playing music:', theme.src);
    
    theme.play()
      .then(() => {
        console.log('✅ Background music started successfully');
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
}));