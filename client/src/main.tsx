import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import './styles/medieval-theme.css';
import './responsive-game.css';
import './styles/responsive.css';
// DEBUG DISABLED: import './lib/debug-admin'; // Load admin debug utilities

// Global error handling for production stability
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    // Handle audio-related DOMExceptions silently
    if (event.reason instanceof DOMException) {
      console.debug('Audio DOMException caught (normal browser behavior):', event.reason.name);
      event.preventDefault();
      return;
    }
    
    // Handle AdSense TagErrors silently (common when containers have zero width)
    if (event.reason && event.reason.name === 'TagError' && event.reason.message?.includes('No slot size')) {
      console.debug('AdSense sizing issue (normal when containers are hidden)');
      event.preventDefault();
      return;
    }
    
    console.warn('Unhandled promise rejection:', event.reason);
    // Prevent default to avoid console error spam
    event.preventDefault();
  });

  window.addEventListener('error', (event) => {
    // Handle audio-related errors gracefully
    if (event.error instanceof DOMException) {
      console.debug('Audio error caught (normal browser behavior):', event.error.name);
      return;
    }
    
    // Handle AdSense TagErrors gracefully
    if (event.error && event.error.name === 'TagError') {
      console.debug('AdSense error caught (normal browser behavior):', event.error.name);
      return;
    }
    
    console.warn('Global error caught:', event.error);
  });
}

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
  
  // Audio logging - disabled to prevent performance issues
  if (import.meta.env.DEV && false) { // Disabled due to performance concerns
    // Comprehensive audio state logging only in development
    const logAudioState = () => {
      console.log('Audio check:', Array.from(document.querySelectorAll('audio')).map(a => a.src));
      // Simplified AudioContext check as requested
      try {
        console.log('Context:', 'Available');
      } catch (e) {
        console.log('Context:', 'Available');
      }
    };
    
    // Disabled periodic logging to prevent console spam
    // logAudioState();
    // setInterval(logAudioState, 5000); // Disabled - was causing performance issues
    
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
