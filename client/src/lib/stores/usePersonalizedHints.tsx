import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types for personalized hint learning
export interface HintInteraction {
  id: string;
  hintText: string;
  hintType: 'beginner' | 'intermediate' | 'advanced';
  moveDescription: string;
  aiDifficulty: string;
  timestamp: number;
  userAction: 'followed' | 'ignored' | 'dismissed' | 'requested_more';
  gamePhase: 'opening' | 'middle' | 'endgame';
  positionHash: string;
  timeSpentViewing: number; // milliseconds
}

export interface HintPreferences {
  preferredComplexity: 'simple' | 'detailed' | 'advanced';
  preferredStyle: 'encouraging' | 'technical' | 'strategic';
  responseTime: number; // average time to act on hints
  successRate: number; // percentage of followed hints that led to good moves
  learningVelocity: number; // how quickly user adapts to new concepts
}

export interface PersonalizedHintPattern {
  patternType: string;
  effectiveness: number; // 0-100
  timesUsed: number;
  timesFollowed: number;
  averageImprovementScore: number;
  lastUsed: number;
}

interface PersonalizedHintStore {
  // User interaction data
  interactions: HintInteraction[];
  preferences: HintPreferences;
  patterns: PersonalizedHintPattern[];
  
  // Learning metrics
  totalHintsGiven: number;
  totalHintsFollowed: number;
  averageHintEffectiveness: number;
  learningProgress: number; // 0-100
  
  // Personalization settings
  adaptationLevel: 'conservative' | 'moderate' | 'aggressive';
  enablePersonalization: boolean;
  minimumInteractionsRequired: number;
  
  // Actions
  recordHintInteraction: (interaction: HintInteraction) => void;
  analyzeUserPreferences: () => HintPreferences;
  getPersonalizedHintStyle: (aiDifficulty: string, gamePhase: string) => string;
  calculateHintEffectiveness: (hintType: string) => number;
  updateLearningProgress: () => void;
  
  // Adaptive hint selection
  selectOptimalHintVariation: (
    hintVariations: string[], 
    moveDescription: string, 
    gameContext: { difficulty: string; phase: string; position: string }
  ) => string;
  
  // Analytics
  getPersonalizationInsights: () => {
    mostEffectiveHintTypes: string[];
    preferredGamePhases: string[];
    learningTrends: number[];
    improvementAreas: string[];
  };
  
  // Configuration
  setAdaptationLevel: (level: 'conservative' | 'moderate' | 'aggressive') => void;
  togglePersonalization: () => void;
  resetLearningData: () => void;
}

// Initial state
const initialPreferences: HintPreferences = {
  preferredComplexity: 'simple',
  preferredStyle: 'encouraging',
  responseTime: 5000,
  successRate: 50,
  learningVelocity: 0.5
};

export const usePersonalizedHints = create<PersonalizedHintStore>()(
  persist(
    (set, get) => ({
      // Initial state
      interactions: [],
      preferences: initialPreferences,
      patterns: [],
      totalHintsGiven: 0,
      totalHintsFollowed: 0,
      averageHintEffectiveness: 50,
      learningProgress: 0,
      adaptationLevel: 'moderate',
      enablePersonalization: true,
      minimumInteractionsRequired: 5,

      // Record user interaction with hints
      recordHintInteraction: (interaction: HintInteraction) => {
        set(state => {
          const newInteractions = [...state.interactions, interaction].slice(-100); // Keep last 100
          
          // Update totals
          const newTotalHints = state.totalHintsGiven + 1;
          const newTotalFollowed = interaction.userAction === 'followed' 
            ? state.totalHintsFollowed + 1 
            : state.totalHintsFollowed;
          
          console.log('🧠 Recorded hint interaction:', {
            action: interaction.userAction,
            hintType: interaction.hintType,
            effectiveness: (newTotalFollowed / newTotalHints) * 100
          });
          
          return {
            interactions: newInteractions,
            totalHintsGiven: newTotalHints,
            totalHintsFollowed: newTotalFollowed,
            averageHintEffectiveness: (newTotalFollowed / newTotalHints) * 100
          };
        });
        
        // Trigger analysis after recording
        setTimeout(() => {
          get().analyzeUserPreferences();
          get().updateLearningProgress();
        }, 100);
      },

      // Analyze user preferences based on interaction history
      analyzeUserPreferences: (): HintPreferences => {
        const state = get();
        const recent = state.interactions.slice(-20); // Analyze last 20 interactions
        
        if (recent.length < state.minimumInteractionsRequired) {
          return state.preferences; // Not enough data yet
        }

        // Analyze complexity preference
        const complexityScores = {
          simple: 0,
          detailed: 0,
          advanced: 0
        };
        
        recent.forEach(interaction => {
          const score = interaction.userAction === 'followed' ? 2 : 
                       interaction.userAction === 'ignored' ? -1 : 0;
          
          if (interaction.hintType === 'beginner') complexityScores.simple += score;
          else if (interaction.hintType === 'intermediate') complexityScores.detailed += score;
          else if (interaction.hintType === 'advanced') complexityScores.advanced += score;
        });

        const preferredComplexity = Object.entries(complexityScores)
          .sort(([,a], [,b]) => b - a)[0][0] as 'simple' | 'detailed' | 'advanced';

        // Calculate average response time
        const responseTimes = recent
          .filter(i => i.timeSpentViewing > 0)
          .map(i => i.timeSpentViewing);
        const avgResponseTime = responseTimes.length > 0 
          ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
          : 5000;

        // Calculate success rate
        const followed = recent.filter(i => i.userAction === 'followed').length;
        const successRate = (followed / recent.length) * 100;

        // Calculate learning velocity (improvement over time)
        const recentSuccess = recent.slice(-10).filter(i => i.userAction === 'followed').length / 10;
        const earlierSuccess = recent.slice(-20, -10).filter(i => i.userAction === 'followed').length / 10;
        const learningVelocity = Math.max(0, recentSuccess - earlierSuccess);

        const newPreferences: HintPreferences = {
          preferredComplexity,
          preferredStyle: successRate > 70 ? 'technical' : successRate > 50 ? 'strategic' : 'encouraging',
          responseTime: avgResponseTime,
          successRate,
          learningVelocity
        };

        set({ preferences: newPreferences });
        
        console.log('🧠 Updated user preferences:', newPreferences);
        return newPreferences;
      },

      // Get personalized hint style based on learned preferences
      getPersonalizedHintStyle: (aiDifficulty: string, gamePhase: string): string => {
        const state = get();
        
        if (!state.enablePersonalization || state.interactions.length < state.minimumInteractionsRequired) {
          return aiDifficulty; // Fall back to standard difficulty-based hints
        }

        const { preferences } = state;
        
        // Adapt difficulty based on user preferences and learning progress
        if (preferences.preferredComplexity === 'simple' && preferences.successRate < 60) {
          return 'easy'; // Simplify hints for struggling users
        } else if (preferences.preferredComplexity === 'advanced' && preferences.successRate > 80) {
          return 'hard'; // Challenge advanced users
        } else if (preferences.learningVelocity > 0.3) {
          // User is learning quickly, gradually increase complexity
          return aiDifficulty === 'easy' ? 'medium' : 'hard';
        }
        
        return aiDifficulty; // Default to current difficulty
      },

      // Calculate effectiveness of specific hint types
      calculateHintEffectiveness: (hintType: string): number => {
        const state = get();
        const relevantInteractions = state.interactions.filter(i => i.hintType === hintType);
        
        if (relevantInteractions.length === 0) return 50; // Default effectiveness
        
        const followed = relevantInteractions.filter(i => i.userAction === 'followed').length;
        return (followed / relevantInteractions.length) * 100;
      },

      // Update overall learning progress
      updateLearningProgress: () => {
        const state = get();
        const recentInteractions = state.interactions.slice(-30);
        
        if (recentInteractions.length < 5) {
          set({ learningProgress: 0 });
          return;
        }

        // Calculate progress based on multiple factors
        const successTrend = state.preferences.learningVelocity * 100;
        const overallSuccess = state.averageHintEffectiveness;
        const consistency = Math.min(100, recentInteractions.length * 3); // Reward consistent usage
        
        const progress = Math.min(100, (successTrend * 0.4 + overallSuccess * 0.4 + consistency * 0.2));
        
        set({ learningProgress: progress });
        console.log('🧠 Learning progress updated:', progress);
      },

      // Select optimal hint variation based on learned preferences
      selectOptimalHintVariation: (hintVariations, moveDescription, gameContext) => {
        const state = get();
        
        if (!state.enablePersonalization || state.interactions.length < state.minimumInteractionsRequired) {
          // Not enough data for personalization, use random selection
          return hintVariations[Math.floor(Math.random() * hintVariations.length)];
        }

        const { preferences } = state;
        
        // Filter variations based on user preferences
        let preferredVariations = hintVariations;
        
        // Apply style preferences
        if (preferences.preferredStyle === 'encouraging') {
          preferredVariations = hintVariations.filter(hint => 
            hint.includes('Good') || hint.includes('Nice') || hint.includes('Consider') || hint.includes('Try')
          );
        } else if (preferences.preferredStyle === 'technical') {
          preferredVariations = hintVariations.filter(hint => 
            hint.includes('Analyze') || hint.includes('Strategic') || hint.includes('Tactical')
          );
        } else if (preferences.preferredStyle === 'strategic') {
          preferredVariations = hintVariations.filter(hint => 
            hint.includes('controls') || hint.includes('improves') || hint.includes('dominates')
          );
        }
        
        // Fall back to all variations if filtering results in empty array
        if (preferredVariations.length === 0) {
          preferredVariations = hintVariations;
        }
        
        // Select from preferred variations
        const selectedHint = preferredVariations[Math.floor(Math.random() * preferredVariations.length)];
        
        console.log('🧠 Selected personalized hint:', {
          style: preferences.preferredStyle,
          hint: selectedHint.substring(0, 50) + '...'
        });
        
        return selectedHint;
      },

      // Get insights about personalization effectiveness
      getPersonalizationInsights: () => {
        const state = get();
        const interactions = state.interactions;
        
        // Most effective hint types
        const hintTypeEffectiveness = ['beginner', 'intermediate', 'advanced'].map(type => ({
          type,
          effectiveness: state.calculateHintEffectiveness(type)
        })).sort((a, b) => b.effectiveness - a.effectiveness);

        // Preferred game phases
        const phasePreferences = ['opening', 'middle', 'endgame'].map(phase => {
          const phaseInteractions = interactions.filter(i => i.gamePhase === phase);
          const followed = phaseInteractions.filter(i => i.userAction === 'followed').length;
          return {
            phase,
            effectiveness: phaseInteractions.length > 0 ? (followed / phaseInteractions.length) * 100 : 0
          };
        }).sort((a, b) => b.effectiveness - a.effectiveness);

        // Learning trends (improvement over time)
        const trends = [];
        for (let i = 0; i < Math.min(10, Math.floor(interactions.length / 5)); i++) {
          const chunk = interactions.slice(i * 5, (i + 1) * 5);
          const followed = chunk.filter(int => int.userAction === 'followed').length;
          trends.push((followed / chunk.length) * 100);
        }

        return {
          mostEffectiveHintTypes: hintTypeEffectiveness.map(h => h.type),
          preferredGamePhases: phasePreferences.map(p => p.phase),
          learningTrends: trends,
          improvementAreas: state.preferences.successRate < 50 
            ? ['Hint timing', 'Complexity adjustment', 'Style preference']
            : ['Advanced concepts', 'Strategic depth']
        };
      },

      // Configuration methods
      setAdaptationLevel: (level) => set({ adaptationLevel: level }),
      togglePersonalization: () => set(state => ({ enablePersonalization: !state.enablePersonalization })),
      resetLearningData: () => set({
        interactions: [],
        preferences: initialPreferences,
        patterns: [],
        totalHintsGiven: 0,
        totalHintsFollowed: 0,
        averageHintEffectiveness: 50,
        learningProgress: 0
      })
    }),
    {
      name: 'personalized-hints-storage',
      partialize: (state) => ({
        interactions: state.interactions,
        preferences: state.preferences,
        patterns: state.patterns,
        totalHintsGiven: state.totalHintsGiven,
        totalHintsFollowed: state.totalHintsFollowed,
        averageHintEffectiveness: state.averageHintEffectiveness,
        learningProgress: state.learningProgress,
        adaptationLevel: state.adaptationLevel,
        enablePersonalization: state.enablePersonalization
      })
    }
  )
);