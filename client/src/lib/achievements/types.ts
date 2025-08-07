export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'gameplay' | 'strategic' | 'collection' | 'mastery' | 'special';
  criteria: AchievementCriteria;
  reward: AchievementReward;
  hidden?: boolean; // Hidden until unlocked
}

export interface AchievementCriteria {
  type: 'wins' | 'games_played' | 'checkmates' | 'captures' | 'streaks' | 'time_played' | 'pieces_moved' | 'special_moves' | 'ai_defeats' | 'fast_wins' | 'perfect_games' | 'custom';
  target: number;
  condition?: string; // For complex criteria
}

export interface AchievementReward {
  experiencePoints: number;
  title?: string;
  badge?: string;
  unlockMessage: string;
}

export interface PlayerProgress {
  gamesPlayed: number;
  gamesWon: number;
  checkmates: number;
  totalCaptures: number;
  winStreak: number;
  currentStreak: number;
  timePlayedMinutes: number;
  piecesMoved: number;
  wizardTeleports: number;
  castlingMoves: number;
  aiDefeats: number;
  promotions: number;
  perfectGames: number; // Games won without losing pieces
  fastWins: number; // Games won in under 20 moves
}

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: number; // timestamp
  isNew: boolean; // For showing notifications
}

export interface AchievementState {
  progress: PlayerProgress;
  unlockedAchievements: Record<string, UnlockedAchievement>;
  totalExperience: number;
  currentLevel: number;
  currentTitle: string;
}