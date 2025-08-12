import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { useAIDifficultyProgression } from './useAIDifficultyProgression';
import { GameState, ChessMove, PieceColor } from '../chess/types';

// Enhanced mentor feedback types
export interface MentorFeedback {
  id: string;
  type: 'encouragement' | 'strategy' | 'warning' | 'celebration' | 'analysis';
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: number;
  context?: {
    gamePhase?: 'opening' | 'middle' | 'endgame';
    playerPerformance?: number;
    suggestedMove?: ChessMove;
    learningPoint?: string;
  };
}

// Real-time performance analytics
interface PerformanceAnalytics {
  currentGameScore: number;
  moveQuality: 'excellent' | 'good' | 'average' | 'poor';
  adaptationNeeded: boolean;
  recommendedDifficulty: number;
  learningProgress: number; // 0-100%
  sessionImprovement: number;
  weakAreas: string[];
  strongAreas: string[];
  nextMilestone: string;
}

// Adaptive coaching strategies
interface CoachingStrategy {
  id: string;
  name: string;
  description: string;
  triggerConditions: {
    minGamesPlayed: number;
    performanceThreshold: number;
    winRateRange: [number, number];
    skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  };
  interventions: {
    difficultyAdjustment: number;
    feedbackFrequency: 'high' | 'medium' | 'low';
    hintAvailability: boolean;
    analysisDepth: 'basic' | 'detailed' | 'comprehensive';
  };
}

// Dynamic mentor store interface
interface DynamicAIMentorStore {
  // Current mentor state
  isActive: boolean;
  currentFeedback: MentorFeedback[];
  analytics: PerformanceAnalytics;
  currentStrategy: CoachingStrategy | null;
  
  // Adaptation settings
  adaptationSensitivity: 'conservative' | 'moderate' | 'aggressive';
  feedbackStyle: 'encouraging' | 'analytical' | 'challenging';
  autoAdjustDifficulty: boolean;
  showRealTimeAnalysis: boolean;
  
  // Performance tracking
  sessionStartTime: number;
  gamesThisSession: number;
  sessionProgress: {
    improvementPoints: number;
    milestonesReached: string[];
    challengesOvercome: string[];
  };
  
  // Actions
  initializeMentor: () => void;
  activateMentor: () => void;
  deactivateMentor: () => void;
  
  // Real-time analysis
  analyzeCurrentMove: (gameState: GameState, move: ChessMove) => void;
  updatePerformanceAnalytics: (gameState: GameState) => void;
  assessGamePhase: (gameState: GameState) => 'opening' | 'middle' | 'endgame';
  
  // Adaptive coaching
  selectOptimalStrategy: () => CoachingStrategy;
  generateContextualFeedback: (gameState: GameState, moveQuality: number) => MentorFeedback;
  adjustDifficultyInRealTime: (performanceScore: number) => void;
  
  // Feedback management
  addFeedback: (feedback: MentorFeedback) => void;
  clearOldFeedback: () => void;
  getFeedbackForPhase: (phase: 'opening' | 'middle' | 'endgame') => MentorFeedback[];
  
  // Progress tracking
  recordMilestone: (milestone: string) => void;
  calculateSessionImprovement: () => number;
  identifyLearningAreas: (gameHistory: GameState[]) => { weak: string[], strong: string[] };
  
  // Configuration
  setAdaptationSensitivity: (sensitivity: 'conservative' | 'moderate' | 'aggressive') => void;
  setFeedbackStyle: (style: 'encouraging' | 'analytical' | 'challenging') => void;
  toggleAutoAdjustDifficulty: () => void;
  toggleRealTimeAnalysis: () => void;
  
  // Reset and persistence
  resetSession: () => void;
  saveMentorProgress: () => void;
  loadMentorProgress: () => void;
}

// Predefined coaching strategies
const COACHING_STRATEGIES: CoachingStrategy[] = [
  {
    id: 'beginner-encouragement',
    name: 'Encouraging Beginner',
    description: 'Focus on positive reinforcement and basic concepts',
    triggerConditions: {
      minGamesPlayed: 0,
      performanceThreshold: 40,
      winRateRange: [0, 30],
      skillLevel: 'beginner'
    },
    interventions: {
      difficultyAdjustment: -1,
      feedbackFrequency: 'high',
      hintAvailability: true,
      analysisDepth: 'basic'
    }
  },
  {
    id: 'intermediate-challenge',
    name: 'Progressive Challenge',
    description: 'Gradually increase complexity with strategic insights',
    triggerConditions: {
      minGamesPlayed: 5,
      performanceThreshold: 60,
      winRateRange: [30, 70],
      skillLevel: 'intermediate'
    },
    interventions: {
      difficultyAdjustment: 0,
      feedbackFrequency: 'medium',
      hintAvailability: true,
      analysisDepth: 'detailed'
    }
  },
  {
    id: 'advanced-mastery',
    name: 'Mastery Focus',
    description: 'Advanced tactics and minimal guidance',
    triggerConditions: {
      minGamesPlayed: 20,
      performanceThreshold: 80,
      winRateRange: [70, 100],
      skillLevel: 'advanced'
    },
    interventions: {
      difficultyAdjustment: 1,
      feedbackFrequency: 'low',
      hintAvailability: false,
      analysisDepth: 'comprehensive'
    }
  }
];

// Create the Dynamic AI Mentor store
export const useDynamicAIMentor = create<DynamicAIMentorStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    isActive: true, // Start active by default
    currentFeedback: [],
    analytics: {
      currentGameScore: 50,
      moveQuality: 'average',
      adaptationNeeded: false,
      recommendedDifficulty: 5,
      learningProgress: 0,
      sessionImprovement: 0,
      weakAreas: [],
      strongAreas: [],
      nextMilestone: 'Complete your first game'
    },
    currentStrategy: null,
    
    // Configuration
    adaptationSensitivity: 'moderate',
    feedbackStyle: 'encouraging',
    autoAdjustDifficulty: true,
    showRealTimeAnalysis: true,
    
    // Session tracking
    sessionStartTime: Date.now(),
    gamesThisSession: 0,
    sessionProgress: {
      improvementPoints: 0,
      milestonesReached: [],
      challengesOvercome: []
    },

    // Initialize mentor system
    initializeMentor: () => {
      console.log('🧙‍♂️ Initializing Dynamic AI Mentor...');
      set({
        sessionStartTime: Date.now(),
        gamesThisSession: 0,
        currentFeedback: [],
        sessionProgress: {
          improvementPoints: 0,
          milestonesReached: [],
          challengesOvercome: []
        }
      });
      
      // Select initial strategy
      get().selectOptimalStrategy();
      
      // Add welcome feedback
      get().addFeedback({
        id: `welcome-${Date.now()}`,
        type: 'encouragement',
        message: 'Greetings, young apprentice! I am Merlin the Wise. I shall guide your chess journey with ancient wisdom and magical insights.',
        priority: 'medium',
        timestamp: Date.now(),
        context: {
          learningPoint: 'Mentor system activated'
        }
      });
    },

    activateMentor: () => {
      set({ isActive: true });
      get().initializeMentor();
      console.log('🧙‍♂️ AI Mentor activated');
    },

    deactivateMentor: () => {
      set({ isActive: false });
      console.log('🧙‍♂️ AI Mentor deactivated');
    },

    // Real-time move analysis
    analyzeCurrentMove: (gameState: GameState, move: ChessMove) => {
      const state = get();
      if (!state.isActive) {
        console.log('🧙‍♂️ Mentor not active, skipping analysis');
        return;
      }

      console.log('🧙‍♂️ Analyzing move:', move, 'Game state:', gameState);

      // Only provide feedback occasionally to avoid over-commenting
      const moveNumber = gameState.moveHistory.length;
      const shouldProvideFeedback = (
        moveNumber === 1 || // First move
        moveNumber === 10 || // Opening transition
        moveNumber === 20 || // Middle game start
        moveNumber === 40 || // Late middle game
        moveNumber % 15 === 0 || // Every 15 moves
        move.isWizardTeleport || // Special wizard moves
        move.isWizardAttack || 
        move.isCastling || // Important strategic moves
        move.captured?.type === 'queen' || // Queen captures
        gameState.isCheck || // Check situations
        Math.random() < 0.15 // 15% chance for random feedback
      );

      if (!shouldProvideFeedback) {
        console.log('🧙‍♂️ Skipping feedback for move', moveNumber);
        return;
      }

      // Calculate move quality based on various factors
      let moveQuality = 50; // Base score
      
      // Analyze move type
      if (move.captured) moveQuality += 15;
      if (move.isWizardTeleport) moveQuality += 10;
      if (move.isWizardAttack) moveQuality += 20;
      if (move.isCastling) moveQuality += 12;
      
      // Add randomness for more dynamic feedback
      moveQuality += Math.random() * 20 - 10;
      moveQuality = Math.max(0, Math.min(100, moveQuality));
      
      // Game phase assessment
      const phase = get().assessGamePhase(gameState);
      
      // Generate contextual feedback
      const feedback = get().generateContextualFeedback(gameState, moveQuality);
      console.log('🧙‍♂️ Generated feedback:', feedback);
      get().addFeedback(feedback);
      
      // Update analytics
      get().updatePerformanceAnalytics(gameState);
      
      console.log('🧙‍♂️ Move analyzed:', { 
        moveQuality, 
        phase, 
        feedbackType: feedback.type,
        message: feedback.message 
      });
    },

    // Update performance analytics in real-time
    updatePerformanceAnalytics: (gameState: GameState) => {
      const state = get();
      const difficultyStore = useAIDifficultyProgression.getState();
      
      const newAnalytics: PerformanceAnalytics = {
        currentGameScore: Math.max(0, Math.min(100, state.analytics.currentGameScore + Math.random() * 10 - 5)),
        moveQuality: state.analytics.currentGameScore > 75 ? 'excellent' 
                   : state.analytics.currentGameScore > 60 ? 'good'
                   : state.analytics.currentGameScore > 40 ? 'average' : 'poor',
        adaptationNeeded: Math.abs(difficultyStore.currentDifficulty - difficultyStore.targetDifficulty) > 1,
        recommendedDifficulty: difficultyStore.targetDifficulty,
        learningProgress: Math.min(100, (state.gamesThisSession * 10) + (state.sessionProgress.improvementPoints * 2)),
        sessionImprovement: get().calculateSessionImprovement(),
        weakAreas: state.analytics.weakAreas,
        strongAreas: state.analytics.strongAreas,
        nextMilestone: state.gamesThisSession < 5 ? 'Play 5 games' 
                     : state.sessionProgress.improvementPoints < 50 ? 'Earn 50 improvement points'
                     : 'Master advanced tactics'
      };

      set({ analytics: newAnalytics });

      // Trigger difficulty adjustment if needed
      if (state.autoAdjustDifficulty && newAnalytics.adaptationNeeded) {
        get().adjustDifficultyInRealTime(newAnalytics.currentGameScore);
      }
    },

    // Assess current game phase
    assessGamePhase: (gameState: GameState): 'opening' | 'middle' | 'endgame' => {
      const moveCount = gameState.moveHistory.length;
      if (moveCount < 20) return 'opening';
      if (moveCount < 40) return 'middle';
      return 'endgame';
    },

    // Select optimal coaching strategy
    selectOptimalStrategy: (): CoachingStrategy => {
      const difficultyStore = useAIDifficultyProgression.getState();
      const performanceMetrics = difficultyStore.recentPerformance;
      
      // Find the best matching strategy
      const matchingStrategy = COACHING_STRATEGIES.find(strategy => {
        const conditions = strategy.triggerConditions;
        return (
          performanceMetrics.averageAccuracy >= conditions.performanceThreshold &&
          performanceMetrics.winRate >= conditions.winRateRange[0] &&
          performanceMetrics.winRate <= conditions.winRateRange[1]
        );
      }) || COACHING_STRATEGIES[0]; // Default to beginner strategy

      set({ currentStrategy: matchingStrategy });
      console.log('🧙‍♂️ Selected strategy:', matchingStrategy.name);
      
      return matchingStrategy;
    },

    // Generate contextual feedback based on game state and performance
    generateContextualFeedback: (gameState: GameState, moveQuality: number): MentorFeedback => {
      const state = get();
      const phase = get().assessGamePhase(gameState);
      
      // Check for recent similar feedback to avoid repetition
      const recentMessages = state.currentFeedback
        .filter(f => Date.now() - f.timestamp < 45000) // Last 45 seconds
        .map(f => f.message);
      
      let message = '';
      let type: MentorFeedback['type'] = 'encouragement';
      let priority: MentorFeedback['priority'] = 'medium';
      
      // Generate phase-specific feedback with variations
      // Arrays of varied messages to prevent repetition
      const openingMessages = {
        excellent: [
          'Excellent opening strategy! You\'re developing your pieces effectively.',
          'Superb opening play! Your development is textbook perfect.',
          'Magnificent start! Your pieces are positioned beautifully.',
          'Outstanding opening! You\'re controlling the center masterfully.'
        ],
        poor: [
          'Consider developing your knights and bishops before advancing pawns too aggressively.',
          'Focus on piece development over pawn storms in the opening.',
          'Try developing your minor pieces before launching attacks.',
          'Remember: knights before bishops, and castle early for safety.'
        ],
        average: [
          'Good opening development. Try to control the center squares.',
          'Solid opening moves. Consider improving your piece coordination.',
          'Decent development. Look for central control opportunities.',
          'Good progress. Focus on completing your development.'
        ]
      };

      const middleMessages = {
        excellent: [
          'Brilliant tactical play! Your pieces are working together beautifully.',
          'Magnificent tactics! Your coordination is exceptional.',
          'Superb strategic play! You\'re creating powerful threats.',
          'Outstanding combination! Your pieces dance in harmony.'
        ],
        poor: [
          'Look for tactical opportunities - can you create threats or improve piece coordination?',
          'Search for tactical motifs and improve your piece activity.',
          'Consider reorganizing your pieces for better coordination.',
          'Look for forcing moves - checks, captures, and threats!'
        ],
        average: [
          'The middlegame is where tactics shine. Look for wizard teleport opportunities!',
          'Good positioning. Consider tactical combinations with your wizards.',
          'Solid play. Watch for tactical opportunities to break through.',
          'Nice development. Look for ways to increase piece activity.'
        ]
      };

      const endgameMessages = {
        excellent: [
          'Outstanding endgame technique! You\'re converting your advantage perfectly.',
          'Masterful endgame play! Your technique is impeccable.',
          'Brilliant endgame! You\'re demonstrating excellent precision.',
          'Superb endgame technique! Victory is within your grasp.'
        ],
        poor: [
          'In the endgame, every move counts. Calculate carefully and activate your king.',
          'Endgame precision is crucial. Activate your king and advance carefully.',
          'Every move matters now. Calculate deeply and avoid mistakes.',
          'Focus on king activity and pawn advancement in the endgame.'
        ],
        average: [
          'Endgame precision is key. Consider pawn promotion possibilities.',
          'Good endgame positioning. Look for breakthrough opportunities.',
          'Solid endgame play. Focus on king and pawn coordination.',
          'Nice technique. Consider creating passed pawns.'
        ]
      };

      // Select message category and random variation
      if (phase === 'opening') {
        const category = moveQuality > 70 ? 'excellent' : moveQuality < 40 ? 'poor' : 'average';
        const messages = openingMessages[category];
        message = messages[Math.floor(Math.random() * messages.length)];
        type = moveQuality > 70 ? 'celebration' : moveQuality < 40 ? 'strategy' : 'encouragement';
        priority = moveQuality < 40 ? 'high' : 'medium';
      } else if (phase === 'middle') {
        const category = moveQuality > 70 ? 'excellent' : moveQuality < 40 ? 'poor' : 'average';
        const messages = middleMessages[category];
        message = messages[Math.floor(Math.random() * messages.length)];
        type = moveQuality > 70 ? 'celebration' : moveQuality < 40 ? 'strategy' : 'analysis';
        priority = moveQuality < 40 ? 'high' : 'medium';
      } else {
        const category = moveQuality > 70 ? 'excellent' : moveQuality < 40 ? 'poor' : 'average';
        const messages = endgameMessages[category];
        message = messages[Math.floor(Math.random() * messages.length)];
        type = moveQuality > 70 ? 'celebration' : moveQuality < 40 ? 'strategy' : 'analysis';
        priority = moveQuality < 40 ? 'high' : 'medium';
      }

      // Final check: if this exact message was recently shown, try another variation
      if (recentMessages.includes(message)) {
        // Try to get a different message from the same category
        const fallbackMessage = `Wise move, young apprentice. Continue with such ${moveQuality > 70 ? 'excellent' : moveQuality < 40 ? 'thoughtful' : 'steady'} play.`;
        message = fallbackMessage;
      }

      return {
        id: `feedback-${Date.now()}`,
        type,
        message,
        priority,
        timestamp: Date.now(),
        context: {
          gamePhase: phase,
          playerPerformance: moveQuality,
          learningPoint: `${phase} phase improvement`
        }
      };
    },

    // Adjust AI difficulty in real-time
    adjustDifficultyInRealTime: (performanceScore: number) => {
      const state = get();
      const difficultyStore = useAIDifficultyProgression.getState();
      
      let adjustment = 0;
      let reason = '';
      
      if (performanceScore > 80) {
        adjustment = 1;
        reason = 'Player performing excellently - increasing challenge';
      } else if (performanceScore < 30) {
        adjustment = -1;
        reason = 'Player struggling - reducing difficulty';
      }
      
      if (adjustment !== 0 && state.currentStrategy) {
        const newDifficulty = Math.max(1, Math.min(10, 
          difficultyStore.currentDifficulty + adjustment + state.currentStrategy.interventions.difficultyAdjustment
        ));
        
        difficultyStore.adjustDifficulty(newDifficulty, reason, 'performance_improvement');
        
        // Provide feedback about the adjustment
        get().addFeedback({
          id: `adjustment-${Date.now()}`,
          type: 'analysis',
          message: `I have ${adjustment > 0 ? 'enhanced' : 'eased'} the challenge to better suit your growing abilities, young chess warrior.`,
          priority: 'medium',
          timestamp: Date.now(),
          context: {
            learningPoint: 'Adaptive difficulty adjustment'
          }
        });
        
        console.log('🧙‍♂️ Difficulty adjusted:', { newDifficulty, reason });
      }
    },

    // Feedback management
    addFeedback: (feedback: MentorFeedback) => {
      set(state => {
        const newFeedback = [...state.currentFeedback, feedback].slice(-10);
        return { currentFeedback: newFeedback };
      });
    },

    clearOldFeedback: () => {
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      set(state => ({
        currentFeedback: state.currentFeedback.filter(f => f.timestamp > fiveMinutesAgo)
      }));
    },

    getFeedbackForPhase: (phase: 'opening' | 'middle' | 'endgame') => {
      const state = get();
      return state.currentFeedback.filter(f => f.context?.gamePhase === phase);
    },

    // Progress tracking
    recordMilestone: (milestone: string) => {
      set(state => ({
        sessionProgress: {
          ...state.sessionProgress,
          milestonesReached: [...state.sessionProgress.milestonesReached, milestone]
        }
      }));
      
      get().addFeedback({
        id: `milestone-${Date.now()}`,
        type: 'celebration',
        message: `Milestone achieved: ${milestone}! 🎉`,
        priority: 'high',
        timestamp: Date.now(),
        context: {
          learningPoint: milestone
        }
      });
    },

    calculateSessionImprovement: (): number => {
      const state = get();
      const sessionDuration = Date.now() - state.sessionStartTime;
      const hoursPassed = sessionDuration / (1000 * 60 * 60);
      
      // Calculate improvement based on games played, time spent, and milestones
      return Math.min(100, 
        (state.gamesThisSession * 5) + 
        (hoursPassed * 10) + 
        (state.sessionProgress.milestonesReached.length * 15)
      );
    },

    identifyLearningAreas: (gameHistory: GameState[]): { weak: string[], strong: string[] } => {
      // Analyze game history to identify patterns
      const weak: string[] = [];
      const strong: string[] = [];
      
      // This would be enhanced with real game analysis
      if (Math.random() > 0.7) weak.push('Opening development');
      if (Math.random() > 0.7) weak.push('Endgame technique');
      if (Math.random() > 0.7) weak.push('Tactical awareness');
      
      if (Math.random() > 0.6) strong.push('Wizard piece usage');
      if (Math.random() > 0.6) strong.push('Strategic planning');
      if (Math.random() > 0.6) strong.push('Position evaluation');
      
      set(state => ({
        analytics: {
          ...state.analytics,
          weakAreas: weak,
          strongAreas: strong
        }
      }));
      
      return { weak, strong };
    },

    // Configuration methods
    setAdaptationSensitivity: (sensitivity) => set({ adaptationSensitivity: sensitivity }),
    setFeedbackStyle: (style) => set({ feedbackStyle: style }),
    toggleAutoAdjustDifficulty: () => set(state => ({ autoAdjustDifficulty: !state.autoAdjustDifficulty })),
    toggleRealTimeAnalysis: () => set(state => ({ showRealTimeAnalysis: !state.showRealTimeAnalysis })),

    // Reset and persistence
    resetSession: () => {
      set({
        sessionStartTime: Date.now(),
        gamesThisSession: 0,
        currentFeedback: [],
        sessionProgress: {
          improvementPoints: 0,
          milestonesReached: [],
          challengesOvercome: []
        }
      });
      get().initializeMentor();
    },

    saveMentorProgress: () => {
      const state = get();
      try {
        localStorage.setItem('wizardChess_mentorProgress', JSON.stringify({
          sessionProgress: state.sessionProgress,
          analytics: state.analytics,
          adaptationSensitivity: state.adaptationSensitivity,
          feedbackStyle: state.feedbackStyle
        }));
        console.log('🧙‍♂️ Mentor progress saved');
      } catch (error) {
        console.warn('Failed to save mentor progress:', error);
      }
    },

    loadMentorProgress: () => {
      try {
        const saved = localStorage.getItem('wizardChess_mentorProgress');
        if (saved) {
          const data = JSON.parse(saved);
          set({
            sessionProgress: data.sessionProgress || get().sessionProgress,
            analytics: data.analytics || get().analytics,
            adaptationSensitivity: data.adaptationSensitivity || get().adaptationSensitivity,
            feedbackStyle: data.feedbackStyle || get().feedbackStyle
          });
          console.log('🧙‍♂️ Mentor progress loaded');
        }
      } catch (error) {
        console.warn('Failed to load mentor progress:', error);
      }
    }
  }))
);

// Subscribe to game events for automatic mentor responses
useDynamicAIMentor.subscribe(
  (state) => state.isActive,
  (isActive) => {
    if (isActive) {
      console.log('🧙‍♂️ Dynamic AI Mentor is now monitoring your game');
      // Load progress when activated
      useDynamicAIMentor.getState().loadMentorProgress();
    }
  }
);

// Export the store for global access
if (typeof window !== 'undefined') {
  (window as any).useDynamicAIMentor = useDynamicAIMentor;
}