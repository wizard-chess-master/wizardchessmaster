import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import './styles/medieval-theme.css';
import './lib/debug-admin'; // Load admin debug utilities

// Debug: Make stores available on window for testing
if (typeof window !== 'undefined') {
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
