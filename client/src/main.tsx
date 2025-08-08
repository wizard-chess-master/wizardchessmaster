import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import './styles/medieval-theme.css';
import './lib/debug-admin'; // Load admin debug utilities

// FORCE Theme-music1.mp3 implementation in main initialization
if (typeof window !== 'undefined') {
  // Theme music initialization function  
  const initializeThemeMusic = () => {
    // Clear all music variables pre-init
    if ((window as any).gameAudioManager) {
      (window as any).gameAudioManager = null;
    }
    
    // Enhanced cleanup function
    function cleanAudio() {
      new AudioContext().close();
      let audios = document.querySelectorAll('audio');
      audios.forEach(a => { 
        a.pause(); 
        a.currentTime = 0; 
        a.remove(); 
      });
      console.log('Audio cleanup count:', audios.length);
    }
    
    // Call cleanup first
    cleanAudio();
    
    // ELIMINATE old music and force theme playback
    const theme = new Audio('/assets/music/Theme-music1.mp3?v=24');
    theme.loop = true;
    theme.volume = 0.42;
    console.log('🎵 Main.tsx Theme created:', theme.src);
    
    theme.play()
      .then(() => {
        console.log('✅ Main.tsx Theme-music1.mp3 v=24 FORCED started successfully');
        console.log('Theme forced:', theme.src, theme.paused ? 'Paused' : 'Playing');
      })
      .catch((error) => {
        console.error('❌ Main.tsx Failed to play theme music:', error);
        console.error('Check Chrome audio permissions if silent - autoplay policy');
      });
  };
  
  // Initialize theme music on page load
  window.addEventListener('load', initializeThemeMusic);
  
  // Audio logging - disabled in production mode as requested
  if (import.meta.env.DEV) {
    // Comprehensive audio state logging only in development
    const logAudioState = () => {
      console.log('Audio check at', new Date().toLocaleTimeString(), ':', Array.from(document.querySelectorAll('audio')).map(a => a.src));
      console.log('Audio sources:', Array.from(document.querySelectorAll('audio')).map(a => a.src));
      // Simplified AudioContext check as requested
      try {
        console.log('Context:', new AudioContext().state || 'Available');
      } catch (e) {
        console.log('Context:', 'Available');
      }
    };
    
    // Log on page load and periodically - only in development
    logAudioState();
    setInterval(logAudioState, 5000); // Log every 5 seconds for debugging
    
    // Add game start event listener for specific logging - only in development
    window.addEventListener('gamestart', () => {
      console.log('🎮 GAME START TRIGGERED - Audio Sources Check:');
      console.log('Audio sources:', Array.from(document.querySelectorAll('audio')).map(a => a.src));
      logAudioState();
    });
    
    // Debug: Make stores available on window for testing - only in development
    import('./lib/stores/useWizardAssistant').then(module => {
      (window as any).useWizardAssistant = module.useWizardAssistant;
      console.log('🧙‍♂️ Wizard Assistant store loaded for debugging');
    });
    
    import('./lib/stores/useChess').then(module => {
      (window as any).useChess = module.useChess;
      console.log('♟️ Chess store loaded for debugging');
    });
  }
}

createRoot(document.getElementById("root")!).render(<App />);
