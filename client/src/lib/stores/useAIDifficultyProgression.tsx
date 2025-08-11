import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface DifficultyDataPoint {
  timestamp: number;
  difficulty: number; // 1-10 scale
  gameOutcome: 'win' | 'loss' | 'draw';
  gameLength: number;
  playerPerformance: number; // 0-100 score
  aiResponseTime: number;
  moveAccuracy: number; // 0-100 percentage
}

export interface DifficultyAdjustment {
  timestamp: number;
  oldDifficulty: number;
  newDifficulty: number;
  reason: string;
  triggerEvent: 'win_streak' | 'loss_streak' | 'performance_improvement' | 'performance_decline' | 'time_based';
}

export interface PerformanceMetrics {
  averageGameTime: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  averageAccuracy: number;
  improvementTrend: 'improving' | 'declining' | 'stable';
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
}

interface AIDifficultyProgressionStore {
  // Current state
  currentDifficulty: number;
  targetDifficulty: number;
  adaptationEnabled: boolean;
  
  // Historical data
  difficultyHistory: DifficultyDataPoint[];
  adjustmentHistory: DifficultyAdjustment[];
  
  // Performance tracking
  recentPerformance: PerformanceMetrics;
  
  // Visualization settings
  timeRange: '1h' | '6h' | '24h' | '7d' | '30d';
  showPredictions: boolean;
  showAdjustmentReasons: boolean;
  
  // Actions
  recordGameResult: (outcome: 'win' | 'loss' | 'draw', gameLength: number, moveAccuracy: number) => void;
  adjustDifficulty: (newDifficulty: number, reason: string, triggerEvent: DifficultyAdjustment['triggerEvent']) => void;
  calculatePerformanceScore: (outcome: 'win' | 'loss' | 'draw', gameLength: number, moveAccuracy: number) => number;
  updatePerformanceMetrics: () => void;
  checkForDifficultyAdjustment: () => void;
  getFilteredHistory: () => DifficultyDataPoint[];
  getPredictedDifficulty: () => number;
  setTimeRange: (range: '1h' | '6h' | '24h' | '7d' | '30d') => void;
  toggleAdaptation: () => void;
  togglePredictions: () => void;
  toggleAdjustmentReasons: () => void;
  resetProgression: () => void;
  loadProgressionData: () => void;
  saveProgressionData: () => void;
  initializeRichProgressionData: () => void;
}

const STORAGE_KEY = 'wizard-chess-ai-progression';

const calculateSkillLevel = (metrics: PerformanceMetrics): PerformanceMetrics['skillLevel'] => {
  const score = (metrics.winRate * 0.4) + (metrics.averageAccuracy * 0.3) + (metrics.bestStreak * 2) + (metrics.currentStreak * 0.3);
  
  if (score >= 80) return 'master';
  if (score >= 65) return 'expert';
  if (score >= 50) return 'advanced';
  if (score >= 30) return 'intermediate';
  return 'beginner';
};

const calculateImprovementTrend = (history: DifficultyDataPoint[]): PerformanceMetrics['improvementTrend'] => {
  if (history.length < 5) return 'stable';
  
  const recent = history.slice(-10);
  const older = history.slice(-20, -10);
  
  if (recent.length === 0 || older.length === 0) return 'stable';
  
  const recentAvg = recent.reduce((sum, point) => sum + point.playerPerformance, 0) / recent.length;
  const olderAvg = older.reduce((sum, point) => sum + point.playerPerformance, 0) / older.length;
  
  const improvement = recentAvg - olderAvg;
  
  if (improvement > 5) return 'improving';
  if (improvement < -5) return 'declining';
  return 'stable';
};

export const useAIDifficultyProgression = create<AIDifficultyProgressionStore>()(
  subscribeWithSelector((set, get) => ({
    currentDifficulty: 5,
    targetDifficulty: 5,
    adaptationEnabled: true,
    difficultyHistory: [],
    adjustmentHistory: [],
    recentPerformance: {
      averageGameTime: 0,
      winRate: 0,
      currentStreak: 0,
      bestStreak: 0,
      averageAccuracy: 0,
      improvementTrend: 'stable',
      skillLevel: 'beginner'
    },
    timeRange: '24h',
    showPredictions: true,
    showAdjustmentReasons: true,

    recordGameResult: (outcome: 'win' | 'loss' | 'draw', gameLength: number, moveAccuracy: number) => {
      const state = get();
      const performanceScore = state.calculatePerformanceScore(outcome, gameLength, moveAccuracy);
      
      const dataPoint: DifficultyDataPoint = {
        timestamp: Date.now(),
        difficulty: state.currentDifficulty,
        gameOutcome: outcome,
        gameLength,
        playerPerformance: performanceScore,
        aiResponseTime: Math.random() * 2000 + 500, // Simulated AI response time
        moveAccuracy
      };
      
      const newHistory = [...state.difficultyHistory, dataPoint].slice(-1000); // Keep last 1000 games
      
      set({ difficultyHistory: newHistory });
      get().updatePerformanceMetrics();
      
      // Check if difficulty adjustment is needed
      if (state.adaptationEnabled) {
        get().checkForDifficultyAdjustment();
      }
      
      get().saveProgressionData();
    },

    calculatePerformanceScore: (outcome: 'win' | 'loss' | 'draw', gameLength: number, moveAccuracy: number): number => {
      let baseScore = 50; // Neutral performance
      
      // Outcome scoring
      if (outcome === 'win') baseScore += 30;
      else if (outcome === 'draw') baseScore += 10;
      else baseScore -= 20;
      
      // Game length scoring (faster wins are better, longer losses are worse)
      const timeBonus = outcome === 'win' ? Math.max(0, 20 - gameLength / 60000) : 0;
      const timePenalty = outcome === 'loss' ? Math.min(0, gameLength / 120000 - 10) : 0;
      
      // Accuracy scoring
      const accuracyScore = (moveAccuracy - 50) * 0.5;
      
      return Math.max(0, Math.min(100, baseScore + timeBonus + timePenalty + accuracyScore));
    },

    updatePerformanceMetrics: () => {
      const state = get();
      const history = state.difficultyHistory;
      
      if (history.length === 0) return;
      
      const recentGames = history.slice(-20); // Last 20 games
      
      // Calculate metrics
      const wins = recentGames.filter(g => g.gameOutcome === 'win').length;
      const winRate = (wins / recentGames.length) * 100;
      
      const averageGameTime = recentGames.reduce((sum, g) => sum + g.gameLength, 0) / recentGames.length;
      const averageAccuracy = recentGames.reduce((sum, g) => sum + g.moveAccuracy, 0) / recentGames.length;
      
      // Calculate streaks
      let currentStreak = 0;
      let bestStreak = 0;
      let tempStreak = 0;
      let lastOutcome = '';
      
      for (let i = history.length - 1; i >= 0; i--) {
        const outcome = history[i].gameOutcome;
        if (i === history.length - 1) {
          currentStreak = 1;
          lastOutcome = outcome;
          tempStreak = 1;
        } else if (outcome === lastOutcome) {
          if (i === history.length - 2) currentStreak++;
          tempStreak++;
        } else {
          bestStreak = Math.max(bestStreak, tempStreak);
          tempStreak = 1;
          lastOutcome = outcome;
        }
      }
      bestStreak = Math.max(bestStreak, tempStreak);
      
      const metrics: PerformanceMetrics = {
        averageGameTime,
        winRate,
        currentStreak,
        bestStreak,
        averageAccuracy,
        improvementTrend: calculateImprovementTrend(history),
        skillLevel: 'beginner' // Will be updated below
      };
      
      metrics.skillLevel = calculateSkillLevel(metrics);
      
      set({ recentPerformance: metrics });
    },



    adjustDifficulty: (newDifficulty: number, reason: string, triggerEvent: DifficultyAdjustment['triggerEvent']) => {
      const state = get();
      
      const adjustment: DifficultyAdjustment = {
        timestamp: Date.now(),
        oldDifficulty: state.currentDifficulty,
        newDifficulty,
        reason,
        triggerEvent
      };
      
      set({
        currentDifficulty: newDifficulty,
        targetDifficulty: newDifficulty,
        adjustmentHistory: [...state.adjustmentHistory, adjustment].slice(-100) // Keep last 100 adjustments
      });
      
      get().saveProgressionData();
    },

    getFilteredHistory: (): DifficultyDataPoint[] => {
      const state = get();
      const now = Date.now();
      const timeRangeMs = {
        '1h': 60 * 60 * 1000,
        '6h': 6 * 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000
      }[state.timeRange];
      
      return state.difficultyHistory.filter(point => now - point.timestamp <= timeRangeMs);
    },

    getPredictedDifficulty: (): number => {
      const state = get();
      const recent = state.difficultyHistory.slice(-10);
      
      if (recent.length < 3) return state.currentDifficulty;
      
      const trend = calculateImprovementTrend(recent);
      const avgPerformance = recent.reduce((sum, p) => sum + p.playerPerformance, 0) / recent.length;
      
      let prediction = state.currentDifficulty;
      
      if (trend === 'improving' && avgPerformance > 60) {
        prediction = Math.min(10, state.currentDifficulty + 0.5);
      } else if (trend === 'declining' && avgPerformance < 40) {
        prediction = Math.max(1, state.currentDifficulty - 0.5);
      }
      
      return Math.round(prediction * 2) / 2; // Round to nearest 0.5
    },

    setTimeRange: (range: '1h' | '6h' | '24h' | '7d' | '30d') => {
      set({ timeRange: range });
    },

    toggleAdaptation: () => {
      set(state => ({ adaptationEnabled: !state.adaptationEnabled }));
      get().saveProgressionData();
    },

    togglePredictions: () => {
      set(state => ({ showPredictions: !state.showPredictions }));
    },

    toggleAdjustmentReasons: () => {
      set(state => ({ showAdjustmentReasons: !state.showAdjustmentReasons }));
    },

    resetProgression: () => {
      set({
        currentDifficulty: 5,
        targetDifficulty: 5,
        difficultyHistory: [],
        adjustmentHistory: [],
        recentPerformance: {
          averageGameTime: 0,
          winRate: 0,
          currentStreak: 0,
          bestStreak: 0,
          averageAccuracy: 0,
          improvementTrend: 'stable',
          skillLevel: 'beginner'
        }
      });
      
      localStorage.removeItem(STORAGE_KEY);
    },

    initializeRichProgressionData: () => {
      const sampleData: DifficultyDataPoint[] = [];
      const now = Date.now();
      const baseTimestamp = now - (7 * 24 * 60 * 60 * 1000); // Last week
      const totalGames = 60; // Rich data set
      
      for (let i = 0; i < totalGames; i++) {
        const progress = i / (totalGames - 1);
        const timestamp = baseTimestamp + (progress * 7 * 24 * 60 * 60 * 1000);
        
        // Realistic difficulty progression inspired by 44,670 training games
        let difficulty;
        if (progress < 0.15) {
          difficulty = 2 + progress * 13; // Start easy (2-4)
        } else if (progress < 0.4) {
          difficulty = 4 + (progress - 0.15) * 16; // Medium progression (4-8)
        } else if (progress < 0.7) {
          difficulty = 6 + (progress - 0.4) * 10; // Advanced (6-9)
        } else {
          difficulty = 8 + (progress - 0.7) * 6.5; // Master level (8-10)
        }
        
        // Add realistic variance
        const difficultyNoise = (Math.sin(i * 0.8) + Math.cos(i * 0.3)) * 0.3;
        difficulty = Math.max(1, Math.min(10, difficulty + difficultyNoise));
        
        // Performance improves over time with realistic variance
        const basePerformance = 35 + (progress * 35); // 35-70 base range
        const performanceNoise = Math.sin(i * 0.5) * 12 * (1 - progress * 0.3);
        const playerPerformance = Math.max(15, Math.min(95, basePerformance + performanceNoise));
        
        // Win rate improves with skill
        const winProbability = 0.25 + (progress * 0.5) + (Math.sin(i * 0.2) * 0.1);
        const randomOutcome = Math.random();
        let gameOutcome: 'win' | 'loss' | 'draw';
        
        if (randomOutcome < winProbability) {
          gameOutcome = 'win';
        } else if (randomOutcome < winProbability + 0.15) {
          gameOutcome = 'draw';
        } else {
          gameOutcome = 'loss';
        }
        
        sampleData.push({
          timestamp,
          difficulty: Math.round(difficulty * 10) / 10,
          gameOutcome,
          gameLength: 25 + Math.floor(Math.random() * 40), // 25-65 moves
          playerPerformance: Math.round(playerPerformance),
          aiResponseTime: 500 + Math.random() * 1000, // 0.5-1.5s
          moveAccuracy: Math.max(40, Math.min(95, playerPerformance + Math.random() * 10 - 5))
        });
      }
      
      set({ 
        difficultyHistory: sampleData,
        currentDifficulty: sampleData[sampleData.length - 1]?.difficulty || 7
      });
      
      // Update performance metrics
      get().updatePerformanceMetrics();
      console.log('📈 Rich AI difficulty progression data initialized with', totalGames, 'realistic data points');
    },

    loadProgressionData: () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          set({
            currentDifficulty: data.currentDifficulty || 5,
            targetDifficulty: data.targetDifficulty || 5,
            adaptationEnabled: data.adaptationEnabled ?? true,
            difficultyHistory: data.difficultyHistory || [],
            adjustmentHistory: data.adjustmentHistory || [],
            recentPerformance: data.recentPerformance || {
              averageGameTime: 0,
              winRate: 0,
              currentStreak: 0,
              bestStreak: 0,
              averageAccuracy: 0,
              improvementTrend: 'stable',
              skillLevel: 'beginner'
            }
          });
          
          // Only initialize with rich data in development mode to prevent resource waste
          if (import.meta.env.DEV && (!data.difficultyHistory || data.difficultyHistory.length === 0)) {
            get().initializeRichProgressionData();
          }
        } else if (import.meta.env.DEV) {
          // Only initialize expensive sample data in development
          get().initializeRichProgressionData();
        }
      } catch (error) {
        console.error('Failed to load AI difficulty progression data:', error);
      }
    },

    saveProgressionData: () => {
      try {
        const state = get();
        const dataToSave = {
          currentDifficulty: state.currentDifficulty,
          targetDifficulty: state.targetDifficulty,
          adaptationEnabled: state.adaptationEnabled,
          difficultyHistory: state.difficultyHistory,
          adjustmentHistory: state.adjustmentHistory,
          recentPerformance: state.recentPerformance
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      } catch (error) {
        console.error('Failed to save AI difficulty progression data:', error);
      }
    },

    checkForDifficultyAdjustment: () => {
      const state = get();
      const { recentPerformance, currentDifficulty } = state;
      const recent = state.difficultyHistory.slice(-5);
      
      if (recent.length < 5) return;
      
      const avgPerformance = recent.reduce((sum, p) => sum + p.playerPerformance, 0) / recent.length;
      let newDifficulty = currentDifficulty;
      let reason = '';
      let triggerEvent: DifficultyAdjustment['triggerEvent'] = 'performance_improvement';
      
      // Performance-based adjustments
      if (avgPerformance > 75 && recentPerformance.winRate > 70) {
        newDifficulty = Math.min(10, currentDifficulty + 1);
        reason = `High performance detected (${avgPerformance.toFixed(1)}% avg, ${recentPerformance.winRate.toFixed(1)}% win rate)`;
        triggerEvent = 'performance_improvement';
      } else if (avgPerformance < 30 && recentPerformance.winRate < 30) {
        newDifficulty = Math.max(1, currentDifficulty - 1);
        reason = `Low performance detected (${avgPerformance.toFixed(1)}% avg, ${recentPerformance.winRate.toFixed(1)}% win rate)`;
        triggerEvent = 'performance_decline';
      }
      
      // Streak-based adjustments
      if (recentPerformance.currentStreak >= 5 && recent.every(g => g.gameOutcome === 'win')) {
        newDifficulty = Math.min(10, currentDifficulty + 1);
        reason = `Win streak of ${recentPerformance.currentStreak} games`;
        triggerEvent = 'win_streak';
      } else if (recentPerformance.currentStreak >= 5 && recent.every(g => g.gameOutcome === 'loss')) {
        newDifficulty = Math.max(1, currentDifficulty - 1);
        reason = `Loss streak of ${recentPerformance.currentStreak} games`;
        triggerEvent = 'loss_streak';
      }
      
      if (newDifficulty !== currentDifficulty) {
        get().adjustDifficulty(newDifficulty, reason, triggerEvent);
      }
    }
  }))
);



// Load data on initialization - only in development mode to prevent resource waste
if (import.meta.env.DEV) {
  useAIDifficultyProgression.getState().loadProgressionData();
}