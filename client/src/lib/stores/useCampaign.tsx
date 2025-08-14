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
  wizardCaptures: number; // Track wizard captures for this level
  requiredWins: number; // Number of wins required to complete level
  requiredWizardCaptures: number; // Number of wizard captures required
  bestMoveCount?: number;
  stars: number; // 0-3 stars based on performance
  requiredWinRate: number; // Required win rate to unlock next level
  // Enhanced features for unlockable content
  storyContent?: {
    preGameStory: string;
    postWinStory: string;
    characterIntroduction?: string;
  };
  boardVariant?: 'classic' | 'forest' | 'castle' | 'mountain' | 'desert' | 'volcanic' | 'ice' | 'cosmic';
  unlockRequirements?: {
    previousLevelsCompleted: string[];
    minimumStars: number;
    specialCondition?: string;
  };
  rewards?: {
    experiencePoints: number;
    unlocksStory: boolean;
    unlocksBoard: boolean;
    unlocksBoardVariant?: string;
  };
  isPremiumLevel: boolean; // Requires premium subscription
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
  completeCampaignGame: (levelId: string, won: boolean, moveCount: number, gameTime: number, wizardCaptures: number) => void;
  calculateNextDifficulty: () => string;
  updatePlayerRating: (won: boolean, opponentStrength: number) => void;
  resetCampaign: () => void;
  getCurrentLevel: () => CampaignLevel | null;
  getNextLevel: () => CampaignLevel | null;
}

const initialLevels: CampaignLevel[] = [
  {
    id: 'level1',
    name: 'Apprentice\'s First Steps',
    difficulty: 'easy',
    aiStrength: 1,
    description: 'Master the basics against a gentle AI tutor. Learn how pieces move and capture.',
    unlocked: true,
    completed: false,
    attempts: 0,
    wins: 0,
    losses: 0,
    wizardCaptures: 0,
    requiredWins: 1,
    requiredWizardCaptures: 0,
    stars: 0,
    requiredWinRate: 0.5,
    isPremiumLevel: false,
    boardVariant: 'classic',
    storyContent: {
      preGameStory: 'Welcome to the magical realm of Wizard Chess! Your journey begins here.',
      postWinStory: 'Well done, apprentice! You have taken your first steps in mastering the ancient art.',
      characterIntroduction: 'Meet Master Alric, your gentle guide in the ways of magical combat.'
    },
    rewards: {
      experiencePoints: 100,
      unlocksStory: true,
      unlocksBoard: false
    }
  },
  {
    id: 'level2',
    name: 'Tower Defense',
    difficulty: 'easy',
    aiStrength: 2,
    description: 'Protect your pieces while learning basic tactics. The AI will test your defense.',
    unlocked: false,
    completed: false,
    attempts: 0,
    wins: 0,
    losses: 0,
    wizardCaptures: 0,
    requiredWins: 2,
    requiredWizardCaptures: 1,
    stars: 0,
    requiredWinRate: 0.6,
    isPremiumLevel: false,
    boardVariant: 'forest',
    storyContent: {
      preGameStory: 'The ancient forest holds many secrets. Defend your position as nature spirits test your resolve.',
      postWinStory: 'The forest spirits approve of your defensive skills. You may proceed deeper into the realm.',
    },
    rewards: { experiencePoints: 150, unlocksStory: true, unlocksBoard: false }
  },
  {
    id: 'level3',
    name: 'Wizard\'s Gambit',
    difficulty: 'easy',
    aiStrength: 2,
    description: 'Learn to use wizard teleportation and ranged attacks effectively.',
    unlocked: false,
    completed: false,
    attempts: 0,
    wins: 0,
    losses: 0,
    wizardCaptures: 0,
    requiredWins: 3,
    requiredWizardCaptures: 2,
    stars: 0,
    requiredWinRate: 0.6,
    isPremiumLevel: false,
    boardVariant: 'castle',
    storyContent: {
      preGameStory: 'Within the castle walls, ancient magic flows. Master your wizard\'s unique abilities.',
      postWinStory: 'You have unlocked the secrets of wizardry! Your magical prowess grows stronger.',
    },
    rewards: { experiencePoints: 200, unlocksStory: true, unlocksBoard: true, unlocksBoardVariant: 'castle' }
  },
  {
    id: 'level4',
    name: 'Court Strategist',
    difficulty: 'medium',
    aiStrength: 3,
    description: 'Face an AI that plans ahead. Develop your positional understanding.',
    unlocked: false,
    completed: false,
    attempts: 0,
    wins: 0,
    losses: 0,
    wizardCaptures: 0,
    requiredWins: 4,
    requiredWizardCaptures: 3,
    stars: 0,
    requiredWinRate: 0.65,
    isPremiumLevel: true,
    boardVariant: 'mountain',
    storyContent: {
      preGameStory: 'High in the mountains, strategic minds are forged. Plan your moves carefully.',
      postWinStory: 'Your strategic thinking has impressed the mountain lords. Premium content awaits.',
    },
    rewards: { experiencePoints: 300, unlocksStory: true, unlocksBoard: true, unlocksBoardVariant: 'mountain' }
  },
  {
    id: 'level5',
    name: 'Battle Mage',
    difficulty: 'medium',
    aiStrength: 4,
    description: 'Combat an aggressive AI that favors tactical combinations and attacks.',
    unlocked: false,
    completed: false,
    attempts: 0,
    wins: 0,
    losses: 0,
    wizardCaptures: 0,
    requiredWins: 5,
    requiredWizardCaptures: 4,
    stars: 0,
    requiredWinRate: 0.65,
    isPremiumLevel: false,
    boardVariant: 'desert',
    storyContent: {
      preGameStory: 'In the scorching desert, battle mages hone their aggressive tactics.',
      postWinStory: 'Your aggressive spirit has impressed the desert warriors.',
    },
    rewards: { experiencePoints: 250, unlocksStory: true, unlocksBoard: true, unlocksBoardVariant: 'desert' }
  },
  {
    id: 'level6',
    name: 'Royal Advisor',
    difficulty: 'medium',
    aiStrength: 4,
    description: 'Outwit a calculating AI known for endgame precision and patience.',
    unlocked: false,
    completed: false,
    attempts: 0,
    wins: 0,
    losses: 0,
    wizardCaptures: 0,
    requiredWins: 6,
    requiredWizardCaptures: 5,
    stars: 0,
    requiredWinRate: 0.7,
    isPremiumLevel: true,
    boardVariant: 'volcanic',
    storyContent: {
      preGameStory: 'In the volcanic halls, patience and precision are tested against molten challenges.',
      postWinStory: 'The volcanic spirits acknowledge your calculated mastery.',
    },
    rewards: { experiencePoints: 400, unlocksStory: true, unlocksBoard: true, unlocksBoardVariant: 'volcanic' }
  },
  {
    id: 'level7',
    name: 'Archmage\'s Trial',
    difficulty: 'hard',
    aiStrength: 5,
    description: 'Test your skills against a master of both strategy and tactics.',
    unlocked: false,
    completed: false,
    attempts: 0,
    wins: 0,
    losses: 0,
    wizardCaptures: 0,
    requiredWins: 7,
    requiredWizardCaptures: 6,
    stars: 0,
    requiredWinRate: 0.7,
    isPremiumLevel: true,
    boardVariant: 'ice',
    storyContent: {
      preGameStory: 'The frozen realm of the Archmage tests both strategic minds and tactical prowess.',
      postWinStory: 'You have passed the Archmage\'s trial. Greater challenges await.',
    },
    rewards: { experiencePoints: 500, unlocksStory: true, unlocksBoard: true, unlocksBoardVariant: 'ice' }
  },
  {
    id: 'level8',
    name: 'Elder\'s Challenge',
    difficulty: 'hard',
    aiStrength: 6,
    description: 'Face an ancient AI with centuries of accumulated wisdom.',
    unlocked: false,
    completed: false,
    attempts: 0,
    wins: 0,
    losses: 0,
    wizardCaptures: 0,
    requiredWins: 8,
    requiredWizardCaptures: 7,
    stars: 0,
    requiredWinRate: 0.7,
    isPremiumLevel: true,
    boardVariant: 'cosmic',
    storyContent: {
      preGameStory: 'Among the stars, ancient wisdom transcends mortal understanding.',
      postWinStory: 'The cosmic elders smile upon your growing wisdom.',
    },
    rewards: { experiencePoints: 600, unlocksStory: true, unlocksBoard: true, unlocksBoardVariant: 'cosmic' }
  },
  {
    id: 'level9',
    name: 'Wizard\'s Crucible',
    difficulty: 'advanced',
    aiStrength: 7,
    description: 'Battle an advanced AI that adapts to your playing style.',
    unlocked: false,
    completed: false,
    attempts: 0,
    wins: 0,
    losses: 0,
    wizardCaptures: 0,
    requiredWins: 9,
    requiredWizardCaptures: 8,
    stars: 0,
    requiredWinRate: 0.75,
    isPremiumLevel: true,
    boardVariant: 'forest',
    storyContent: {
      preGameStory: 'In the crucible of ancient magic, only the truly skilled survive.',
      postWinStory: 'You have been forged in the wizard\'s crucible and emerged stronger.',
    },
    rewards: { experiencePoints: 750, unlocksStory: true, unlocksBoard: false }
  },
  {
    id: 'level10',
    name: 'Master\'s Examination',
    difficulty: 'advanced',
    aiStrength: 8,
    description: 'Prove your mastery against an AI that rarely makes errors.',
    unlocked: false,
    completed: false,
    attempts: 0,
    wins: 0,
    losses: 0,
    wizardCaptures: 0,
    requiredWins: 10,
    requiredWizardCaptures: 9,
    stars: 0,
    requiredWinRate: 0.75,
    isPremiumLevel: true,
    boardVariant: 'castle',
    storyContent: {
      preGameStory: 'The final examination approaches. Demonstrate the mastery you have gained.',
      postWinStory: 'Congratulations, Master. You have proven your worth.',
    },
    rewards: { experiencePoints: 900, unlocksStory: true, unlocksBoard: false }
  },
  {
    id: 'level11',
    name: 'Legendary Duel',
    difficulty: 'master',
    aiStrength: 9,
    description: 'Face the legendary AI sorcerer in an epic battle of minds.',
    unlocked: false,
    completed: false,
    attempts: 0,
    wins: 0,
    losses: 0,
    wizardCaptures: 0,
    requiredWins: 11,
    requiredWizardCaptures: 10,
    stars: 0,
    requiredWinRate: 0.8,
    isPremiumLevel: true,
    boardVariant: 'cosmic',
    storyContent: {
      preGameStory: 'The legendary sorcerer awaits. This battle will echo through eternity.',
      postWinStory: 'You have achieved legendary status. The cosmos acknowledges your mastery.',
    },
    rewards: { experiencePoints: 1000, unlocksStory: true, unlocksBoard: false }
  },
  {
    id: 'level12',
    name: 'Supreme Enchanter',
    difficulty: 'grandmaster',
    aiStrength: 10,
    description: 'The ultimate trial - defeat the Supreme Enchanter to become a legend yourself.',
    unlocked: false,
    completed: false,
    attempts: 0,
    wins: 0,
    losses: 0,
    wizardCaptures: 0,
    requiredWins: 12,
    requiredWizardCaptures: 12,
    stars: 0,
    requiredWinRate: 0.8,
    isPremiumLevel: true,
    boardVariant: 'cosmic',
    storyContent: {
      preGameStory: 'The final challenge. Face the Supreme Enchanter in the ultimate test of wizardry.',
      postWinStory: 'Congratulations, Supreme Master! You have conquered all challenges and become legend.',
    },
    rewards: { experiencePoints: 1500, unlocksStory: true, unlocksBoard: false }
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

      completeCampaignGame: (levelId: string, won: boolean, moveCount: number, gameTime: number, wizardCaptures: number) => {
        const state = get();
        const level = state.levels.find(l => l.id === levelId);
        if (!level) return;

        // Update level stats
        const updatedLevels = state.levels.map(l => {
          if (l.id === levelId) {
            const newWins = won ? l.wins + 1 : l.wins;
            const newLosses = won ? l.losses : l.losses + 1;
            const newWizardCaptures = l.wizardCaptures + wizardCaptures;
            const totalGames = newWins + newLosses;
            const winRate = totalGames > 0 ? newWins / totalGames : 0;
            
            // Calculate stars based on performance (5-star system)
            let stars = 0;
            if (winRate >= 0.95) stars = 5;        // 95%+ = 5 stars (nearly perfect)
            else if (winRate >= 0.85) stars = 4;   // 85%+ = 4 stars (excellent)
            else if (winRate >= 0.75) stars = 3;   // 75%+ = 3 stars (good)
            else if (winRate >= 0.65) stars = 2;   // 65%+ = 2 stars (decent)
            else if (winRate >= 0.5) stars = 1;    // 50%+ = 1 star (basic completion)

            // Check if level requirements are met
            const completed = newWins >= l.requiredWins && newWizardCaptures >= l.requiredWizardCaptures;
            
            if (completed && !l.completed) {
              console.log(`🔓 Level ${levelId.replace('level', '')} completed! Wins: ${newWins}/${l.requiredWins}, Wizard Captures: ${newWizardCaptures}/${l.requiredWizardCaptures}`);
            }
            
            return {
              ...l,
              wins: newWins,
              losses: newLosses,
              wizardCaptures: newWizardCaptures,
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

        // Check if level was just completed for the first time and process rewards
        const currentLevel = updatedLevels.find(l => l.id === levelId);
        const wasJustCompleted = currentLevel?.completed && !level.completed;
        
        if (wasJustCompleted && level.rewards) {
          console.log(`🎉 Level ${levelId} completed! Processing rewards:`, level.rewards);
          
          // Award experience points
          if (level.rewards.experiencePoints) {
            console.log(`✨ Awarded ${level.rewards.experiencePoints} XP for completing ${level.name}!`);
          }
          
          // Unlock board variants
          if (level.rewards.unlocksBoardVariant) {
            console.log(`🏰 Unlocked new board variant: ${level.rewards.unlocksBoardVariant}!`);
          }
          
          // Trigger achievement system
          try {
            import('../achievements/gameEventTracker').then(({ gameEventTracker }) => {
              // Unlock achievement for campaign level completion
              const achievementId = `campaign_${levelId}_completed`;
              gameEventTracker.unlockSpecialAchievement(achievementId);
            });
          } catch (error) {
            console.log('Achievement system not available:', error);
          }

          // Trigger reward celebration UI
          setTimeout(() => {
            const celebrationEvent = new CustomEvent('campaignRewardEarned', {
              detail: {
                levelName: level.name,
                experiencePoints: level.rewards?.experiencePoints,
                unlocksBoardVariant: level.rewards?.unlocksBoardVariant,
                unlocksStory: level.rewards?.unlocksStory,
                levelId
              }
            });
            window.dispatchEvent(celebrationEvent);
          }, 1000); // Delay to let game finish processing
        }

        // Unlock next level if current level is completed
        if (currentLevel?.completed) {
          const currentIndex = updatedLevels.findIndex(l => l.id === levelId);
          if (currentIndex < updatedLevels.length - 1) {
            updatedLevels[currentIndex + 1].unlocked = true;
            console.log(`🔓 Unlocked next level: ${updatedLevels[currentIndex + 1].name}`);
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