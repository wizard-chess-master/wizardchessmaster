import { create } from "zustand";
import { wizardChessAudio } from '../audio/audioManager';
import { enhancedAudioManager } from '../audio/enhancedAudioManager';
import { audioSettings } from '../audio/audioSettings';
import { mobileAudioHandler } from '../audio/mobileAudioHandler';

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
      playBackgroundMusic();
    }
  },

  setVolume: (volume: number) => {
    wizardChessAudio.setVolume(volume);
    set({ volume });
    console.log(`🔊 Volume set to: ${Math.round(volume * 100)}%`);
  },

  initializeAudio: async () => {
    if (get().initialized) return;
    
    // COMPREHENSIVE AUDIO CLEANUP as urgently requested
    console.log('🛑 URGENT: Comprehensive audio cleanup on initialization...');
    
    // Close any existing AudioContext
    try {
      if (typeof AudioContext !== 'undefined') {
        new AudioContext().close().then(() => {
          console.log('✅ AudioContext closed');
        }).catch(() => {
          console.log('⚠️ AudioContext close failed or not needed');
        });
      }
    } catch (e) {
      console.log('⚠️ AudioContext not available or already closed');
    }
    
    // Comprehensive DOM audio cleanup
    document.querySelectorAll('audio').forEach(a => { 
      a.pause(); 
      a.currentTime = 0; 
    });
    
    // Exhaustive audio logging as requested
    console.log('Audio check:', Array.from(document.querySelectorAll('audio')).map(a => a.src));
    console.log('Context:', typeof AudioContext !== 'undefined' ? 'Available' : 'Not Available');
    
    console.log('🎵 Initializing Wizard Chess Audio System...');
    
    try {
      // Initialize both audio systems
      await Promise.all([
        wizardChessAudio.initialize(),
        enhancedAudioManager.initialize()
      ]);
      
      // Preload critical sounds
      await enhancedAudioManager.preloadGameSounds();
      
      // Setup audio settings listener
      audioSettings.addListener((settings) => {
        set({ 
          isMuted: settings.masterVolume === 0,
          volume: settings.masterVolume
        });
      });
      
      // Setup mobile audio listener
      mobileAudioHandler.addListener((state) => {
        if (!state.isUnlocked) {
          console.log('📱 Waiting for user interaction to unlock audio');
        }
      });
      
      set({ initialized: true });
      console.log('✅ Enhanced Audio System initialized');
    } catch (error) {
      console.error('❌ Failed to initialize audio:', error);
      set({ initialized: false });
    }
  },

  playBackgroundMusic: () => {
    const { isMuted } = get();
    
    // Master audio cleanup function
    function masterAudioCleanup() {
      console.log('🛑 MASTER AUDIO CLEANUP - Stopping ALL audio systems...');
      
      // 1. Stop WizardChessAudioManager
      if (wizardChessAudio?.stopAllAudio) {
        wizardChessAudio.stopAllAudio();
      }
      
      // 2. Stop GameAudioManager
      if ((window as any).gameAudioManager?.stopAll) {
        (window as any).gameAudioManager.stopAll();
      }
      
      // 3. Close ImmersiveAudioSystem
      if ((window as any).immersiveAudio?.dispose) {
        (window as any).immersiveAudio.dispose();
      }
      
      // 4. Close ALL AudioContexts
      if (typeof AudioContext !== 'undefined') {
        try {
          const context = new AudioContext();
          context.close();
        } catch (e) {}
      }
      
      // 5. Remove ALL DOM audio elements
      document.querySelectorAll('audio').forEach(a => {
        a.pause();
        a.currentTime = 0;
        a.src = '';
        a.remove();
      });
      
      // 6. Clear global references
      (window as any).currentTheme = null;
      (window as any).backgroundMusic = null;
      (window as any).gameAudioManager = null;
      
      console.log('🛑 Master cleanup complete');
    }
    
    if (isMuted) {
      console.log('🎵 Background music not started - audio is muted');
      return;
    }
    
    // Execute master cleanup
    masterAudioCleanup();
    
    // Auto-start theme music when not muted
    console.log('🎵 useAudio playBackgroundMusic - starting theme music');
    wizardChessAudio.playThemeMusic();
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

    // URGENT: Stop all existing audio first with comprehensive cleanup
    document.querySelectorAll('audio').forEach(a => { 
      a.pause(); 
      a.currentTime = 0; 
    });
    
    // Exhaustive logging as urgently requested  
    console.log('Audio check:', Array.from(document.querySelectorAll('audio')).map(a => a.src));
    console.log('Context:', typeof AudioContext !== 'undefined' ? 'Available' : 'Not Available');

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