import { create } from "zustand";

interface AudioState {
  isMuted: boolean;
  
  // Control functions
  toggleMute: () => void;
  initializeAudio: () => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  isMuted: false, // Start unmuted by default
  
  toggleMute: () => {
    const { isMuted } = get();
    const newMutedState = !isMuted;
    
    console.log(`🔊 Toggling mute: ${isMuted} → ${newMutedState}`);
    set({ isMuted: newMutedState });
    console.log(`🔊 Sound ${newMutedState ? 'muted' : 'unmuted'}`);
  },

  initializeAudio: () => {
    console.log('🎵 Basic audio system initialized');
    set({ isMuted: false });
  },
}));