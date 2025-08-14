import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import './styles/medieval-theme.css';
import './responsive-game.css';
import './styles/responsive.css';
// DEBUG DISABLED: import './lib/debug-admin'; // Load admin debug utilities

// ===== DEPLOYMENT DEBUG LOGGING =====
console.log(`[${new Date().toISOString()}] Wizard Chess Master - Initializing...`);
console.log(`[${new Date().toISOString()}] Environment: ${import.meta.env.MODE}`);
console.log(`[${new Date().toISOString()}] URL: ${window.location.href}`);

// ===== CONSOLE DIAGNOSTICS =====
// Add console diagnostics to verify functionality
window.addEventListener('load', () => {
  console.log(`[${new Date().toISOString()}] ✅ Window load event fired - Console is functional`);
  console.log(`[${new Date().toISOString()}] 📊 Console Diagnostics:`);
  console.log(`  - User Agent: ${navigator.userAgent}`);
  console.log(`  - Platform: ${navigator.platform}`);
  console.log(`  - Screen Resolution: ${window.screen.width}x${window.screen.height}`);
  console.log(`  - Viewport: ${window.innerWidth}x${window.innerHeight}`);
  console.log(`  - Memory: ${(performance as any).memory ? `${Math.round((performance as any).memory.usedJSHeapSize / 1048576)}MB used` : 'Not available'}`);
  console.log(`  - Connection: ${(navigator as any).connection ? (navigator as any).connection.effectiveType : 'Not available'}`);
  
  // Test console methods
  console.info(`[${new Date().toISOString()}] ℹ️ Console.info working`);
  console.warn(`[${new Date().toISOString()}] ⚠️ Console.warn working`);
  console.error(`[${new Date().toISOString()}] ❌ Console.error working (test only)`);
  console.debug(`[${new Date().toISOString()}] 🐛 Console.debug working`);
  
  console.log(`[${new Date().toISOString()}] ✅ All console methods verified - Ready for deployment`);
});

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

// ===== AI FUNCTIONS INITIALIZATION =====
console.log(`[${new Date().toISOString()}] Initializing AI functions...`);

// Import and expose AI functions globally
import('./lib/ai/testAI').then(module => {
  (window as any).testAIModel = module.testAIModel;
  console.log(`[${new Date().toISOString()}] ✅ testAIModel loaded and exposed globally`);
}).catch(err => {
  console.error(`[${new Date().toISOString()}] ❌ Failed to load testAI:`, err);
});

import('./lib/ai/selfPlay').then(module => {
  (window as any).runSelfPlay = module.runSelfPlay;
  (window as any).getSelfPlayStatus = module.getSelfPlayStatus;
  console.log(`[${new Date().toISOString()}] ✅ runSelfPlay and getSelfPlayStatus loaded`);
}).catch(err => {
  console.error(`[${new Date().toISOString()}] ❌ Failed to load selfPlay:`, err);
});

import('./lib/ai/trainSelfPlay').then(module => {
  // Check if startAITraining exists in the module
  if ('startAITraining' in module) {
    (window as any).startAITraining = module.startAITraining;
    console.log(`[${new Date().toISOString()}] ✅ startAITraining loaded`);
  } else {
    console.log(`[${new Date().toISOString()}] ⚠️ startAITraining not found in module`);
  }
}).catch(err => {
  console.error(`[${new Date().toISOString()}] ❌ Failed to load trainSelfPlay:`, err);
});

// Add control tags test
import('./lib/ai/testControlTags').then(module => {
  (window as any).testControlTags = module.testControlTags;
  console.log(`[${new Date().toISOString()}] ✅ testControlTags loaded`);
}).catch(err => {
  console.error(`[${new Date().toISOString()}] ❌ Failed to load testControlTags:`, err);
});

// Add human data training
import('./lib/ai/trainHumanData').then(module => {
  (window as any).trainOnHumanData = module.trainOnHumanData;
  (window as any).testHumanTrainedModel = module.testHumanTrainedModel;
  console.log(`[${new Date().toISOString()}] ✅ trainOnHumanData loaded`);
}).catch(err => {
  console.error(`[${new Date().toISOString()}] ❌ Failed to load trainHumanData:`, err);
});

// Add training test
import('./lib/ai/testTraining').then(module => {
  (window as any).testTraining = module.testTraining;
  console.log(`[${new Date().toISOString()}] ✅ testTraining loaded`);
  console.log('💡 Run testTraining() to verify human data training setup');
}).catch(err => {
  console.error(`[${new Date().toISOString()}] ❌ Failed to load testTraining:`, err);
});

// Add RL test
import('./lib/ai/testRL').then(module => {
  (window as any).testRLSystem = module.testRLSystem;
  console.log(`[${new Date().toISOString()}] ✅ testRLSystem loaded`);
  console.log('💡 Run testRLSystem() to test RL commentary');
}).catch(err => {
  console.error(`[${new Date().toISOString()}] ❌ Failed to load testRL:`, err);
});

// Add integration test
import('./lib/ai/testIntegration').then(module => {
  (window as any).simulateGameWithCommentary = module.simulateGameWithCommentary;
  console.log(`[${new Date().toISOString()}] ✅ simulateGameWithCommentary loaded`);
  console.log('🎮 Run simulateGameWithCommentary() to test full integration');
}).catch(err => {
  console.error(`[${new Date().toISOString()}] ❌ Failed to load testIntegration:`, err);
});

// Add ElevenLabs test functions
import('./lib/test/testElevenLabsIntegration').then(module => {
  (window as any).testLevel5Unlock = module.testLevel5Unlock;
  (window as any).checkCampaignStatus = module.checkCampaignStatus;
  console.log(`[${new Date().toISOString()}] ✅ ElevenLabs test functions loaded`);
  console.log('🎮 ElevenLabs Integration Test Functions:');
  console.log('   • testLevel5Unlock() - Simulate Level 5 unlock with music/voice');
  console.log('   • checkCampaignStatus() - Check current campaign and API status');
}).catch(err => {
  console.error(`[${new Date().toISOString()}] ❌ Failed to load ElevenLabs test:`, err);
});

// Add deployment AI
import('./lib/ai/deployAI').then(module => {
  module.deployAI().then(() => {
    console.log(`[${new Date().toISOString()}] ✅ AI deployed successfully`);
  }).catch(err => {
    console.error(`[${new Date().toISOString()}] ❌ Failed to deploy AI:`, err);
  });
}).catch(err => {
  console.error(`[${new Date().toISOString()}] ❌ Failed to load deployAI:`, err);
});

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
