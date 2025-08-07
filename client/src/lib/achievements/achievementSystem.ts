import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Achievement, AchievementState, PlayerProgress, UnlockedAchievement } from './types';
import { ACHIEVEMENTS, calculateLevel, getExperienceForNextLevel } from './definitions';

interface AchievementStore extends AchievementState {
  // Actions
  updateProgress: (updates: Partial<PlayerProgress>) => void;
  checkAchievements: (gameData?: any) => UnlockedAchievement[];
  markAchievementAsViewed: (achievementId: string) => void;
  resetProgress: () => void;
  unlockSecretAchievement: (achievementId: string) => void;
  
  // Getters
  getUnlockedAchievements: () => Achievement[];
  getNewAchievements: () => Achievement[];
  getProgressForAchievement: (achievement: Achievement) => number;
  getNextLevelProgress: () => { current: number; next: number; progress: number };
}

const initialProgress: PlayerProgress = {
  gamesPlayed: 0,
  gamesWon: 0,
  checkmates: 0,
  totalCaptures: 0,
  winStreak: 0,
  currentStreak: 0,
  timePlayedMinutes: 0,
  piecesMoved: 0,
  wizardTeleports: 0,
  castlingMoves: 0,
  aiDefeats: 0,
  promotions: 0,
  perfectGames: 0,
  fastWins: 0
};

const initialState: AchievementState = {
  progress: initialProgress,
  unlockedAchievements: {},
  totalExperience: 0,
  currentLevel: 1,
  currentTitle: 'Novice'
};

// Load saved state from localStorage
const loadSavedState = (): AchievementState => {
  try {
    const saved = localStorage.getItem('fantasy-chess-achievements');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure all required fields exist
      return {
        ...initialState,
        ...parsed,
        progress: { ...initialProgress, ...parsed.progress }
      };
    }
  } catch (error) {
    console.error('Failed to load achievement state:', error);
  }
  return initialState;
};

// Save state to localStorage
const saveState = (state: AchievementState) => {
  try {
    localStorage.setItem('fantasy-chess-achievements', JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save achievement state:', error);
  }
};

export const useAchievements = create<AchievementStore>()(
  subscribeWithSelector((set, get) => ({
    ...loadSavedState(),

    updateProgress: (updates: Partial<PlayerProgress>) => {
      set((state) => {
        const newProgress = { ...state.progress, ...updates };
        const newState = { ...state, progress: newProgress };
        
        // Check for newly unlocked achievements
        const newAchievements = get().checkAchievements();
        
        saveState(newState);
        return newState;
      });
    },

    checkAchievements: (gameData?: any) => {
      const state = get();
      const newlyUnlocked: UnlockedAchievement[] = [];

      for (const achievement of ACHIEVEMENTS) {
        // Skip if already unlocked
        if (state.unlockedAchievements[achievement.id]) continue;

        // Check if achievement criteria is met
        if (isAchievementUnlocked(achievement, state.progress, gameData)) {
          const unlockedAchievement: UnlockedAchievement = {
            achievementId: achievement.id,
            unlockedAt: Date.now(),
            isNew: true
          };

          newlyUnlocked.push(unlockedAchievement);

          // Update state with unlocked achievement
          set((currentState) => {
            const newUnlocked = {
              ...currentState.unlockedAchievements,
              [achievement.id]: unlockedAchievement
            };

            const newExperience = currentState.totalExperience + achievement.reward.experiencePoints;
            const newLevel = calculateLevel(newExperience);
            const newTitle = achievement.reward.title || currentState.currentTitle;

            const updatedState = {
              ...currentState,
              unlockedAchievements: newUnlocked,
              totalExperience: newExperience,
              currentLevel: newLevel,
              currentTitle: newTitle
            };

            saveState(updatedState);
            return updatedState;
          });

          console.log(`🏆 Achievement unlocked: ${achievement.name}`);
        }
      }

      return newlyUnlocked;
    },

    markAchievementAsViewed: (achievementId: string) => {
      set((state) => {
        const updated = {
          ...state.unlockedAchievements,
          [achievementId]: {
            ...state.unlockedAchievements[achievementId],
            isNew: false
          }
        };

        const newState = { ...state, unlockedAchievements: updated };
        saveState(newState);
        return newState;
      });
    },

    unlockSecretAchievement: (achievementId: string) => {
      const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
      if (!achievement) return;

      const state = get();
      if (state.unlockedAchievements[achievementId]) return;

      const unlockedAchievement: UnlockedAchievement = {
        achievementId,
        unlockedAt: Date.now(),
        isNew: true
      };

      set((currentState) => {
        const newUnlocked = {
          ...currentState.unlockedAchievements,
          [achievementId]: unlockedAchievement
        };

        const newExperience = currentState.totalExperience + achievement.reward.experiencePoints;
        const newLevel = calculateLevel(newExperience);
        const newTitle = achievement.reward.title || currentState.currentTitle;

        const updatedState = {
          ...currentState,
          unlockedAchievements: newUnlocked,
          totalExperience: newExperience,
          currentLevel: newLevel,
          currentTitle: newTitle
        };

        saveState(updatedState);
        return updatedState;
      });

      console.log(`🎉 Secret achievement unlocked: ${achievement.name}`);
    },

    resetProgress: () => {
      set(initialState);
      localStorage.removeItem('fantasy-chess-achievements');
    },

    getUnlockedAchievements: () => {
      const state = get();
      return ACHIEVEMENTS.filter(achievement => 
        state.unlockedAchievements[achievement.id]
      );
    },

    getNewAchievements: () => {
      const state = get();
      return ACHIEVEMENTS.filter(achievement => 
        state.unlockedAchievements[achievement.id]?.isNew
      );
    },

    getProgressForAchievement: (achievement: Achievement) => {
      const state = get();
      const progress = state.progress;

      switch (achievement.criteria.type) {
        case 'wins': return Math.min(progress.gamesWon, achievement.criteria.target);
        case 'games_played': return Math.min(progress.gamesPlayed, achievement.criteria.target);
        case 'checkmates': return Math.min(progress.checkmates, achievement.criteria.target);
        case 'captures': return Math.min(progress.totalCaptures, achievement.criteria.target);
        case 'streaks': return Math.min(progress.winStreak, achievement.criteria.target);
        case 'time_played': return Math.min(progress.timePlayedMinutes, achievement.criteria.target);
        case 'pieces_moved': return Math.min(progress.piecesMoved, achievement.criteria.target);
        case 'ai_defeats': return Math.min(progress.aiDefeats, achievement.criteria.target);
        case 'special_moves':
          switch (achievement.criteria.condition) {
            case 'wizard_teleports': return Math.min(progress.wizardTeleports, achievement.criteria.target);
            case 'castling': return Math.min(progress.castlingMoves, achievement.criteria.target);
            case 'promotions': return Math.min(progress.promotions, achievement.criteria.target);
            default: return 0;
          }
        default: return 0;
      }
    },

    getNextLevelProgress: () => {
      const state = get();
      const currentLevelExp = state.currentLevel > 1 ? getExperienceForNextLevel(state.currentLevel - 1) : 0;
      const nextLevelExp = getExperienceForNextLevel(state.currentLevel);
      const progress = (state.totalExperience - currentLevelExp) / (nextLevelExp - currentLevelExp);

      return {
        current: state.totalExperience - currentLevelExp,
        next: nextLevelExp - currentLevelExp,
        progress: Math.min(progress, 1)
      };
    }
  }))
);

// Helper function to check if an achievement is unlocked
function isAchievementUnlocked(achievement: Achievement, progress: PlayerProgress, gameData?: any): boolean {
  const { criteria } = achievement;

  switch (criteria.type) {
    case 'wins':
      return progress.gamesWon >= criteria.target;
    case 'games_played':
      return progress.gamesPlayed >= criteria.target;
    case 'checkmates':
      return progress.checkmates >= criteria.target;
    case 'captures':
      return progress.totalCaptures >= criteria.target;
    case 'streaks':
      return progress.winStreak >= criteria.target;
    case 'time_played':
      return progress.timePlayedMinutes >= criteria.target;
    case 'pieces_moved':
      return progress.piecesMoved >= criteria.target;
    case 'ai_defeats':
      return progress.aiDefeats >= criteria.target;
    case 'special_moves':
      switch (criteria.condition) {
        case 'wizard_teleports':
          return progress.wizardTeleports >= criteria.target;
        case 'castling':
          return progress.castlingMoves >= criteria.target;
        case 'promotions':
          return progress.promotions >= criteria.target;
        default:
          return false;
      }
    case 'fast_wins':
      return progress.fastWins >= criteria.target;
    case 'perfect_games':
      return progress.perfectGames >= criteria.target;
    case 'custom':
      // Custom achievements need special handling
      return handleCustomAchievement(achievement.id, progress, gameData);
    default:
      return false;
  }
}

// Handle custom achievement logic
function handleCustomAchievement(achievementId: string, progress: PlayerProgress, gameData?: any): boolean {
  switch (achievementId) {
    case 'easter_egg':
      // This would be triggered manually
      return false;
    case 'speed_demon':
      // Win 5 games in under 15 moves each - would need special tracking
      return progress.fastWins >= 5;
    default:
      return false;
  }
}