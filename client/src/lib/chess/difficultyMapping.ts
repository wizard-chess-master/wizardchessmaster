import { AIDifficulty } from './types';

// Map campaign levels to specific AI difficulties
export const campaignDifficultyMap: Record<string, AIDifficulty> = {
  'level_1': 'level1',
  'level_2': 'level2',
  'level_3': 'level3',
  'level_4': 'level4',
  'level_5': 'level5',
  'level_6': 'level6',
  'level_7': 'level7',
  'level_8': 'level8',
  'level_9': 'level9',
  'level_10': 'level10',
  'level_11': 'level11',
  'level_12': 'level12',
  'level_13': 'level13',
  'level_14': 'level14',
  'level_15': 'level15',
  'level_16': 'level16',
  'level_17': 'level17',
  'level_18': 'level18',
  'level_19': 'level19',
  'level_20': 'level20'
};

// Map difficulty levels to AI search depth and evaluation parameters
export const difficultyConfig = {
  // Campaign difficulty levels (1-20)
  level1: { searchDepth: 1, thinkingTime: 500, skillMultiplier: 0.1, name: 'Novice (Level 1)' },
  level2: { searchDepth: 1, thinkingTime: 700, skillMultiplier: 0.15, name: 'Beginner (Level 2)' },
  level3: { searchDepth: 2, thinkingTime: 900, skillMultiplier: 0.2, name: 'Apprentice (Level 3)' },
  level4: { searchDepth: 2, thinkingTime: 1100, skillMultiplier: 0.25, name: 'Student (Level 4)' },
  level5: { searchDepth: 2, thinkingTime: 1300, skillMultiplier: 0.3, name: 'Amateur (Level 5)' },
  level6: { searchDepth: 3, thinkingTime: 1500, skillMultiplier: 0.35, name: 'Competitor (Level 6)' },
  level7: { searchDepth: 3, thinkingTime: 1700, skillMultiplier: 0.4, name: 'Challenger (Level 7)' },
  level8: { searchDepth: 3, thinkingTime: 1900, skillMultiplier: 0.45, name: 'Tactician (Level 8)' },
  level9: { searchDepth: 4, thinkingTime: 2100, skillMultiplier: 0.5, name: 'Strategist (Level 9)' },
  level10: { searchDepth: 4, thinkingTime: 2300, skillMultiplier: 0.55, name: 'Skilled (Level 10)' },
  level11: { searchDepth: 4, thinkingTime: 2500, skillMultiplier: 0.6, name: 'Advanced (Level 11)' },
  level12: { searchDepth: 5, thinkingTime: 2700, skillMultiplier: 0.65, name: 'Veteran (Level 12)' },
  level13: { searchDepth: 5, thinkingTime: 2900, skillMultiplier: 0.7, name: 'Elite (Level 13)' },
  level14: { searchDepth: 5, thinkingTime: 3100, skillMultiplier: 0.75, name: 'Expert (Level 14)' },
  level15: { searchDepth: 6, thinkingTime: 3300, skillMultiplier: 0.8, name: 'Master (Level 15)' },
  level16: { searchDepth: 6, thinkingTime: 3500, skillMultiplier: 0.85, name: 'Grandmaster (Level 16)' },
  level17: { searchDepth: 7, thinkingTime: 3700, skillMultiplier: 0.9, name: 'Champion (Level 17)' },
  level18: { searchDepth: 7, thinkingTime: 3900, skillMultiplier: 0.93, name: 'Legend (Level 18)' },
  level19: { searchDepth: 8, thinkingTime: 4100, skillMultiplier: 0.96, name: 'Mythical (Level 19)' },
  level20: { searchDepth: 9, thinkingTime: 4500, skillMultiplier: 1.0, name: 'Wizard Master (Level 20)' },
  
  // Legacy difficulty mappings
  'easy': { searchDepth: 2, thinkingTime: 800, skillMultiplier: 0.2, name: 'Easy' },
  'medium': { searchDepth: 3, thinkingTime: 1500, skillMultiplier: 0.4, name: 'Medium' },
  'hard': { searchDepth: 4, thinkingTime: 2500, skillMultiplier: 0.6, name: 'Hard' },
  'advanced': { searchDepth: 5, thinkingTime: 3000, skillMultiplier: 0.75, name: 'Advanced' },
  'expert': { searchDepth: 6, thinkingTime: 3500, skillMultiplier: 0.85, name: 'Expert' },
  'master': { searchDepth: 8, thinkingTime: 4000, skillMultiplier: 1.0, name: 'Master' }
};

// Get difficulty configuration
export function getDifficultyConfig(difficulty: AIDifficulty) {
  return difficultyConfig[difficulty] || difficultyConfig.medium;
}

// Convert campaign level to difficulty
export function getCampaignDifficulty(levelId: string): AIDifficulty {
  return campaignDifficultyMap[levelId] || 'level1';
}

// Get difficulty name for display
export function getDifficultyDisplayName(difficulty: AIDifficulty): string {
  const config = getDifficultyConfig(difficulty);
  return config.name;
}

// Calculate AI evaluation bonus based on difficulty
export function getDifficultyBonus(difficulty: AIDifficulty): number {
  const config = getDifficultyConfig(difficulty);
  return config.skillMultiplier * 100; // Returns 10-100 based on difficulty
}