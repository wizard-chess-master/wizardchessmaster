import { create } from "zustand";
import { wizardChessAudio } from '../audio/audioManager';

interface AudioState {
  isMuted: boolean;
  volume: number;
  initialized: boolean;
  
  // Control functions
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  initializeAudio: () => Promise<void>;
}

export const useAudio = create<AudioState>((set, get) => ({
  isMuted: false,
  volume: 0.7,
  initialized: false,
  
  toggleMute: () => {
    const { isMuted } = get();
    const newMutedState = !isMuted;
    
    wizardChessAudio.setMuted(newMutedState);
    set({ isMuted: newMutedState });
    console.log(`🔊 Sound ${newMutedState ? 'muted' : 'unmuted'}`);
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
}));