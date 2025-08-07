import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { GameState, ChessMove, AIDifficulty } from '../chess/types';
import { useAIDifficultyProgression } from './useAIDifficultyProgression';

export interface WizardHint {
  id: string;
  type: 'strategy' | 'tactical' | 'warning' | 'encouragement' | 'difficulty';
  message: string;
  magicalQuote: string;
  timestamp: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  icon: string;
  duration: number; // How long to show in ms
}

export interface WizardPersonality {
  name: string;
  title: string;
  mood: 'helpful' | 'encouraging' | 'concerned' | 'proud' | 'mystical';
  arcaneLevel: number; // 1-100, affects hint sophistication
}

interface WizardAssistantStore {
  // Wizard state
  isActive: boolean;
  personality: WizardPersonality;
  currentHint: WizardHint | null;
  hintHistory: WizardHint[];
  
  // Performance monitoring
  gamesPlayed: number;
  currentStreak: number;
  strugglingCounter: number; // Tracks when player needs help
  masteryCounter: number; // Tracks when player is doing well
  
  // Adaptive settings
  hintFrequency: 'minimal' | 'normal' | 'frequent' | 'maximum';
  adaptiveMode: boolean;
  autoAdjustDifficulty: boolean;
  
  // Actions
  activateWizard: () => void;
  deactivateWizard: () => void;
  generateHint: (gameState: GameState, context?: string) => void;
  dismissHint: () => void;
  recordGamePerformance: (won: boolean, moveCount: number, timeSpent: number) => void;
  adjustPersonality: (gameState: GameState) => void;
  setHintFrequency: (frequency: 'minimal' | 'normal' | 'frequent' | 'maximum') => void;
  toggleAdaptiveMode: () => void;
  toggleAutoAdjustDifficulty: () => void;
  resetWizardStats: () => void;
}

const defaultPersonality: WizardPersonality = {
  name: 'Merlin the Wise',
  title: 'Master of Chess Arcana',
  mood: 'helpful',
  arcaneLevel: 50
};

export const useWizardAssistant = create<WizardAssistantStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    isActive: true,
    personality: defaultPersonality,
    currentHint: null,
    hintHistory: [],
    gamesPlayed: 0,
    currentStreak: 0,
    strugglingCounter: 0,
    masteryCounter: 0,
    hintFrequency: 'normal',
    adaptiveMode: true,
    autoAdjustDifficulty: true,

    activateWizard: () => {
      set({ isActive: true });
      get().generateHint({} as GameState, 'Welcome! I am here to guide your chess journey.');
    },

    deactivateWizard: () => {
      set({ isActive: false, currentHint: null });
    },

    generateHint: (gameState: GameState, context?: string) => {
      const state = get();
      if (!state.isActive) return;

      const hint = createWizardHint(gameState, state, context);
      if (hint && shouldShowHint(state)) {
        set({ 
          currentHint: hint,
          hintHistory: [...state.hintHistory, hint].slice(-50) // Keep last 50 hints
        });

        // Auto-dismiss after duration
        setTimeout(() => {
          if (get().currentHint?.id === hint.id) {
            get().dismissHint();
          }
        }, hint.duration);
      }
    },

    dismissHint: () => {
      set({ currentHint: null });
    },

    recordGamePerformance: (won: boolean, moveCount: number, timeSpent: number) => {
      const state = get();
      const newGamesPlayed = state.gamesPlayed + 1;
      let newStreak = won ? state.currentStreak + 1 : 0;
      let newStruggling = state.strugglingCounter;
      let newMastery = state.masteryCounter;

      // Update struggle/mastery counters
      if (!won) {
        newStruggling++;
        newMastery = Math.max(0, newMastery - 1);
      } else {
        newStruggling = Math.max(0, newStruggling - 1);
        newMastery++;
      }

      set({
        gamesPlayed: newGamesPlayed,
        currentStreak: newStreak,
        strugglingCounter: newStruggling,
        masteryCounter: newMastery
      });

      // Adjust personality based on performance
      get().adjustPersonality({} as GameState);

      // Auto-adjust difficulty if enabled
      if (state.autoAdjustDifficulty) {
        checkForDifficultyAdjustment(won, newStreak, newStruggling, newMastery);
      }
    },

    adjustPersonality: (gameState: GameState) => {
      const state = get();
      let newMood = state.personality.mood;
      let newArcaneLevel = state.personality.arcaneLevel;

      // Adjust mood based on player performance
      if (state.strugglingCounter >= 3) {
        newMood = 'concerned';
      } else if (state.currentStreak >= 3) {
        newMood = 'proud';
      } else if (state.masteryCounter >= 5) {
        newMood = 'mystical';
        newArcaneLevel = Math.min(100, newArcaneLevel + 5);
      } else {
        newMood = 'helpful';
      }

      set({
        personality: {
          ...state.personality,
          mood: newMood,
          arcaneLevel: newArcaneLevel
        }
      });
    },

    setHintFrequency: (frequency) => {
      set({ hintFrequency: frequency });
    },

    toggleAdaptiveMode: () => {
      set(state => ({ adaptiveMode: !state.adaptiveMode }));
    },

    toggleAutoAdjustDifficulty: () => {
      set(state => ({ autoAdjustDifficulty: !state.autoAdjustDifficulty }));
    },

    resetWizardStats: () => {
      set({
        gamesPlayed: 0,
        currentStreak: 0,
        strugglingCounter: 0,
        masteryCounter: 0,
        hintHistory: [],
        currentHint: null,
        personality: defaultPersonality
      });
    }
  }))
);

// Helper functions
function createWizardHint(gameState: GameState, wizardState: WizardAssistantStore, context?: string): WizardHint | null {
  if (context) {
    return {
      id: `hint-${Date.now()}`,
      type: 'encouragement',
      message: context,
      magicalQuote: getRandomMagicalQuote(),
      timestamp: Date.now(),
      priority: 'medium',
      icon: '🧙‍♂️',
      duration: 5000
    };
  }

  const hints = generateContextualHints(gameState, wizardState);
  if (hints.length === 0) return null;

  // Select hint based on priority and wizard mood
  return hints.reduce((best, current) => {
    const priorityScore = getPriorityScore(current.priority);
    const bestScore = getPriorityScore(best.priority);
    return priorityScore > bestScore ? current : best;
  });
}

function generateContextualHints(gameState: GameState, wizardState: WizardAssistantStore): WizardHint[] {
  const hints: WizardHint[] = [];
  const { personality } = wizardState;

  // Struggling player hints
  if (wizardState.strugglingCounter >= 2) {
    hints.push({
      id: `struggle-${Date.now()}`,
      type: 'encouragement',
      message: personality.mood === 'concerned' 
        ? "Fear not, young apprentice. Every master was once a beginner. Let's focus on protecting your king."
        : "I sense your frustration. Remember, chess is a journey of patience and wisdom.",
      magicalQuote: "Even the mightiest oak was once an acorn that held its ground. 🌟",
      timestamp: Date.now(),
      priority: 'high',
      icon: '💪',
      duration: 8000
    });
  }

  // Mastery recognition
  if (wizardState.masteryCounter >= 3) {
    hints.push({
      id: `mastery-${Date.now()}`,
      type: 'encouragement',
      message: "Excellent progress! Your strategic thinking is becoming more refined. You're ready for greater challenges.",
      magicalQuote: "The spark of mastery grows brighter in your mind. ✨",
      timestamp: Date.now(),
      priority: 'medium',
      icon: '🌟',
      duration: 6000
    });
  }

  // Difficulty adjustment suggestions
  if (wizardState.currentStreak >= 5) {
    hints.push({
      id: `difficulty-up-${Date.now()}`,
      type: 'difficulty',
      message: "Your skills have grown considerably! Perhaps it's time to face a more challenging opponent?",
      magicalQuote: "The mind sharpened by victory yearns for greater trials. ⚔️",
      timestamp: Date.now(),
      priority: 'medium',
      icon: '📈',
      duration: 10000
    });
  }

  // Check-related hints
  if (gameState.isInCheck) {
    hints.push({
      id: `check-warning-${Date.now()}`,
      type: 'warning',
      message: "Your king is in danger! You must move to safety, block the attack, or capture the threatening piece.",
      magicalQuote: "When the storm approaches, the wise king seeks shelter. 👑",
      timestamp: Date.now(),
      priority: 'urgent',
      icon: '⚠️',
      duration: 12000
    });
  }

  return hints;
}

function shouldShowHint(wizardState: WizardAssistantStore): boolean {
  if (!wizardState.isActive || !wizardState.adaptiveMode) return false;

  const frequency = wizardState.hintFrequency;
  const timeSinceLastHint = wizardState.hintHistory.length > 0 
    ? Date.now() - wizardState.hintHistory[wizardState.hintHistory.length - 1].timestamp
    : Infinity;

  const minIntervals = {
    minimal: 60000, // 1 minute
    normal: 30000,  // 30 seconds
    frequent: 15000, // 15 seconds
    maximum: 5000   // 5 seconds
  };

  return timeSinceLastHint >= minIntervals[frequency];
}

function checkForDifficultyAdjustment(won: boolean, streak: number, struggling: number, mastery: number) {
  const difficultyStore = useAIDifficultyProgression.getState();
  
  if (streak >= 4 && mastery >= 3) {
    // Player is doing too well, increase difficulty
    const newDifficulty = Math.min(difficultyStore.currentDifficulty + 0.2, 1.0);
    difficultyStore.adjustDifficulty(newDifficulty, 'Wizard Assistant: Player mastery detected', 'performance_improvement');
  } else if (struggling >= 4) {
    // Player is struggling, decrease difficulty
    const newDifficulty = Math.max(difficultyStore.currentDifficulty - 0.15, 0.1);
    difficultyStore.adjustDifficulty(newDifficulty, 'Wizard Assistant: Player struggling detected', 'performance_decline');
  }
}

function getPriorityScore(priority: string): number {
  const scores = { low: 1, medium: 2, high: 3, urgent: 4 };
  return scores[priority as keyof typeof scores] || 1;
}

function getRandomMagicalQuote(): string {
  const quotes = [
    "Ancient wisdom flows through the 64 squares of power. ⚡",
    "In chess, as in magic, foresight is the greatest weapon. 🔮",
    "Every move echoes through the chambers of eternity. ✨",
    "The board reveals secrets to those who listen. 🎭",
    "Strategy is the highest form of magical thinking. 🧠",
    "Victory belongs to those who see beyond the visible. 👁️",
    "The dance of pieces mirrors the cosmos itself. 🌟",
    "Patience, young wizard. Mastery comes to those who persist. 🕰️"
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}