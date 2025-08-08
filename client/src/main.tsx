import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import './styles/medieval-theme.css';
import './lib/debug-admin'; // Load admin debug utilities

// URGENT: Force client-side audio logging in main entry point as requested
if (typeof window !== 'undefined') {
  // Comprehensive audio state logging as urgently requested
  const logAudioState = () => {
    console.log('Audio check at', new Date().toLocaleTimeString(), ':', Array.from(document.querySelectorAll('audio')).map(a => a.src));
    try {
      console.log('Context:', (new AudioContext()).state);
    } catch (e) {
      console.log('Context: Not Available');
    }
  };
  
  // Log on page load and periodically
  logAudioState();
  setInterval(logAudioState, 5000); // Log every 5 seconds for debugging
  
  // Debug: Make stores available on window for testing
  import('./lib/stores/useWizardAssistant').then(module => {
    window.useWizardAssistant = module.useWizardAssistant;
    console.log('🧙‍♂️ Wizard Assistant store loaded for debugging');
  });
  
  import('./lib/stores/useChess').then(module => {
    window.useChess = module.useChess;
    console.log('♟️ Chess store loaded for debugging');
  });
}

createRoot(document.getElementById("root")!).render(<App />);
