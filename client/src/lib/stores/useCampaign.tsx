import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CampaignLevel {
  id: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'advanced' | 'master' | 'grandmaster';
  aiStrength: number; // 1-10 scale
  description: string;
  unlocked: boolean;
  completed: boolean;
  attempts: number;
  wins: number;
  losses: number;
  bestMoveCount?: number;
  stars: number; // 0-3 stars based on performance
  requiredWinRate: number; // Required win rate to unlock next level
}

export interface PlayerStats {
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  currentLevel: number;
  skillRating: number; // ELO-like rating system
  campaignProgress: number; // 0-100%
  averageMovesPerGame: number;
  winStreak: number;
  bestWinStreak: number;
  lastPlayed: number;
  totalPlayTime: number; // in milliseconds
}

export interface CampaignState {
  levels: CampaignLevel[];
  playerStats: PlayerStats;
  currentLevelId: string | null;
  isInCampaign: boolean;
  
  // Actions
  initializeCampaign: () => void;
  startCampaignLevel: (levelId: string) => void;
  completeCampaignGame: (levelId: string, won: boolean, moveCount: number, gameTime: number) => void;
  calculateNextDifficulty: () => string;
  updatePlayerRating: (won: boolean, opponentStrength: number) => void;
  resetCampaign: () => void;
  getCurrentLevel: () => CampaignLevel | null;
  getNextLevel: () => CampaignLevel | null;
}

const initialLevels: CampaignLevel[] = [
  {
    id: 'level1',
    name: 'Apprentice Wizard',
    difficulty: 'easy',
    aiStrength: 1,
    description: 'Learn the basics of wizard chess against a novice AI',
    unlocked: true,
    completed: false,
    attempts: 0,
    wins: 0,
    losses: 0,
    stars: 0,
    requiredWinRate: 0.6, // 60% win rate to unlock next level
  },
  {
    id: 'level2',
    name: 'Tower Guardian',
    difficulty: 'easy',
    aiStrength: 2,
    description: 'Face a slightly more challenging opponent',
    unlocked: false,
    completed: false,
    attempts: 0,
    wins: 0,
    losses: 0,
    stars: 0,
    requiredWinRate: 0.65,
  },
  {
    id: 'level3',
    name: 'Court Mage',
    difficulty: 'medium',
    aiStrength: 3,
    description: 'Battle against an intermediate AI with improved tactics',
    unlocked: false,
    completed: false,
    attempts: 0,
    wins: 0,
    losses: 0,
    stars: 0,
    requiredWinRate: 0.65,
  },
  {
    id: 'level4',
    name: 'Battle Wizard',
    difficulty: 'medium',
    aiStrength: 4,
    description: 'Test your skills against a tactical AI',
    unlocked: false,
    completed: false,
    attempts: 0,
    wins: 0,
    losses: 0,
    stars: 0,
    requiredWinRate: 0.7,
  },
  {
    id: 'level5',
    name: 'Royal Advisor',
    difficulty: 'hard',
    aiStrength: 5,
    description: 'Face a strategic AI that thinks several moves ahead',
    unlocked: false,
    completed: false,
    attempts: 0,
    wins: 0,
    losses: 0,
    stars: 0,
    requiredWinRate: 0.7,
  },
  {
    id: 'level6',
    name: 'Archmage',
    difficulty: 'hard',
    aiStrength: 6,
    description: 'Challenge a highly strategic AI opponent',
    unlocked: false,
    completed: false,
    attempts: 0,
    wins: 0,
    losses: 0,
    stars: 0,
    requiredWinRate: 0.75,
  },
  {
    id: 'level7',
    name: 'Elder Wizard',
    difficulty: 'advanced',
    aiStrength: 7,
    description: 'Battle against an advanced AI with deep analysis',
    unlocked: false,
    completed: false,
    attempts: 0,
    wins: 0,
    losses: 0,
    stars: 0,
    requiredWinRate: 0.75,
  },
  {
    id: 'level8',
    name: 'Wizard Master',
    difficulty: 'advanced',
    aiStrength: 8,
    description: 'Face a master-level AI with near-perfect play',
    unlocked: false,
    completed: false,
    attempts: 0,
    wins: 0,
    losses: 0,
    stars: 0,
    requiredWinRate: 0.8,
  },
  {
    id: 'level9',
    name: 'Legendary Sorcerer',
    difficulty: 'master',
    aiStrength: 9,
    description: 'Challenge a legendary AI that rarely makes mistakes',
    unlocked: false,
    completed: false,
    attempts: 0,
    wins: 0,
    losses: 0,
    stars: 0,
    requiredWinRate: 0.8,
  },
  {
    id: 'level10',
    name: 'Supreme Wizard',
    difficulty: 'grandmaster',
    aiStrength: 10,
    description: 'The ultimate challenge - face the Supreme Wizard AI',
    unlocked: false,
    completed: false,
    attempts: 0,
    wins: 0,
    losses: 0,
    stars: 0,
    requiredWinRate: 0.85,
  },
];

const initialPlayerStats: PlayerStats = {
  totalGames: 0,
  totalWins: 0,
  totalLosses: 0,
  currentLevel: 0,
  skillRating: 1200, // Starting ELO rating
  campaignProgress: 0,
  averageMovesPerGame: 0,
  winStreak: 0,
  bestWinStreak: 0,
  lastPlayed: Date.now(),
  totalPlayTime: 0,
};

export const useCampaign = create<CampaignState>()(
  persist(
    (set, get) => ({
      levels: initialLevels,
      playerStats: initialPlayerStats,
      currentLevelId: null,
      isInCampaign: false,

      initializeCampaign: () => {
        const state = get();
        if (state.levels.length === 0) {
          set({ levels: initialLevels });
        }
      },

      startCampaignLevel: (levelId: string) => {
        set({ currentLevelId: levelId, isInCampaign: true });
        
        // Increment attempts for this level
        const state = get();
        const updatedLevels = state.levels.map(level => 
          level.id === levelId 
            ? { ...level, attempts: level.attempts + 1 }
            : level
        );
        set({ levels: updatedLevels });
      },

      completeCampaignGame: (levelId: string, won: boolean, moveCount: number, gameTime: number) => {
        const state = get();
        const level = state.levels.find(l => l.id === levelId);
        if (!level) return;

        // Update level stats
        const updatedLevels = state.levels.map(l => {
          if (l.id === levelId) {
            const newWins = won ? l.wins + 1 : l.wins;
            const newLosses = won ? l.losses : l.losses + 1;
            const totalGames = newWins + newLosses;
            const winRate = totalGames > 0 ? newWins / totalGames : 0;
            
            // Calculate stars based on performance
            let stars = 0;
            if (winRate >= 0.9) stars = 3;
            else if (winRate >= 0.75) stars = 2;
            else if (winRate >= 0.6) stars = 1;

            const completed = winRate >= l.requiredWinRate && totalGames >= 3;
            
            return {
              ...l,
              wins: newWins,
              losses: newLosses,
              completed,
              stars,
              bestMoveCount: !l.bestMoveCount || moveCount < l.bestMoveCount ? moveCount : l.bestMoveCount,
            };
          }
          return l;
        });

        // Update player stats
        const newTotalGames = state.playerStats.totalGames + 1;
        const newTotalWins = won ? state.playerStats.totalWins + 1 : state.playerStats.totalWins;
        const newTotalLosses = won ? state.playerStats.totalLosses : state.playerStats.totalLosses + 1;
        const newWinStreak = won ? state.playerStats.winStreak + 1 : 0;
        const newBestWinStreak = Math.max(state.playerStats.bestWinStreak, newWinStreak);
        
        // Update average moves per game
        const totalMoves = state.playerStats.averageMovesPerGame * state.playerStats.totalGames + moveCount;
        const newAverageMovesPerGame = totalMoves / newTotalGames;

        // Calculate campaign progress
        const completedLevels = updatedLevels.filter(l => l.completed).length;
        const campaignProgress = (completedLevels / updatedLevels.length) * 100;

        const updatedPlayerStats: PlayerStats = {
          ...state.playerStats,
          totalGames: newTotalGames,
          totalWins: newTotalWins,
          totalLosses: newTotalLosses,
          campaignProgress,
          averageMovesPerGame: newAverageMovesPerGame,
          winStreak: newWinStreak,
          bestWinStreak: newBestWinStreak,
          lastPlayed: Date.now(),
          totalPlayTime: state.playerStats.totalPlayTime + gameTime,
        };

        // Update player rating
        get().updatePlayerRating(won, level.aiStrength);

        // Unlock next level if current level is completed
        const currentLevel = updatedLevels.find(l => l.id === levelId);
        if (currentLevel?.completed) {
          const currentIndex = updatedLevels.findIndex(l => l.id === levelId);
          if (currentIndex < updatedLevels.length - 1) {
            updatedLevels[currentIndex + 1].unlocked = true;
          }
        }

        set({ 
          levels: updatedLevels, 
          playerStats: updatedPlayerStats,
          isInCampaign: false,
          currentLevelId: null 
        });
      },

      calculateNextDifficulty: () => {
        const state = get();
        const rating = state.playerStats.skillRating;
        
        if (rating < 1300) return 'easy';
        if (rating < 1500) return 'medium';
        if (rating < 1700) return 'hard';
        if (rating < 1900) return 'advanced';
        if (rating < 2100) return 'master';
        return 'grandmaster';
      },

      updatePlayerRating: (won: boolean, opponentStrength: number) => {
        const state = get();
        const currentRating = state.playerStats.skillRating;
        
        // ELO-like rating calculation
        const expectedScore = 1 / (1 + Math.pow(10, (opponentStrength * 200 - currentRating) / 400));
        const actualScore = won ? 1 : 0;
        const K = 32; // K-factor for rating changes
        
        const ratingChange = Math.round(K * (actualScore - expectedScore));
        const newRating = Math.max(800, Math.min(2800, currentRating + ratingChange));
        
        set({
          playerStats: {
            ...state.playerStats,
            skillRating: newRating,
          }
        });
      },

      resetCampaign: () => {
        set({
          levels: initialLevels,
          playerStats: initialPlayerStats,
          currentLevelId: null,
          isInCampaign: false,
        });
      },

      getCurrentLevel: () => {
        const state = get();
        return state.levels.find(l => l.id === state.currentLevelId) || null;
      },

      getNextLevel: () => {
        const state = get();
        const currentIndex = state.levels.findIndex(l => l.id === state.currentLevelId);
        if (currentIndex >= 0 && currentIndex < state.levels.length - 1) {
          return state.levels[currentIndex + 1];
        }
        return null;
      },
    }),
    {
      name: 'wizard-chess-campaign',
      version: 1,
    }
  )
);