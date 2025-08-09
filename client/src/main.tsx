import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import './styles/medieval-theme.css';
// DEBUG DISABLED: import './lib/debug-admin'; // Load admin debug utilities

// FORCE Theme-music2.mp3 implementation in main initialization
if (typeof window !== 'undefined') {
  // Theme music initialization function  
  const initializeThemeMusic = () => {
    // Don't auto-start music in main.tsx - let user control it
    console.log('🎵 Main.tsx: Theme-music2.mp3 ready - user will control theme music');
    
    // Store cleanup function globally
    (window as any).stopAllAudio = function() {
      console.log('🛑 Global stopAllAudio called');
      if ((window as any).currentTheme) {
        (window as any).currentTheme.pause();
        (window as any).currentTheme.currentTime = 0;
        (window as any).currentTheme.src = '';
        (window as any).currentTheme = null;
      }
      document.querySelectorAll('audio').forEach(a => {
        a.pause();
        a.currentTime = 0;
        a.src = '';
        a.remove();
      });
      console.log('🛑 All audio stopped');
    };
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
