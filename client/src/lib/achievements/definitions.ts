import { Achievement } from './types';

export const ACHIEVEMENTS: Achievement[] = [
  // Gameplay Achievements
  {
    id: 'first_win',
    name: 'First Victory',
    description: 'Win your first game of Fantasy Chess',
    icon: '🏆',
    rarity: 'common',
    category: 'gameplay',
    criteria: { type: 'wins', target: 1 },
    reward: { experiencePoints: 100, unlockMessage: 'Welcome to the realm of Fantasy Chess!' }
  },
  {
    id: 'chess_apprentice',
    name: 'Chess Apprentice',
    description: 'Win 5 games',
    icon: '⚔️',
    rarity: 'common',
    category: 'gameplay',
    criteria: { type: 'wins', target: 5 },
    reward: { experiencePoints: 250, title: 'Apprentice', unlockMessage: 'You are learning the ways of magical chess!' }
  },
  {
    id: 'chess_knight',
    name: 'Chess Knight',
    description: 'Win 25 games',
    icon: '🛡️',
    rarity: 'rare',
    category: 'gameplay',
    criteria: { type: 'wins', target: 25 },
    reward: { experiencePoints: 500, title: 'Knight', unlockMessage: 'Your skills have been recognized by the realm!' }
  },
  {
    id: 'chess_master',
    name: 'Chess Master',
    description: 'Win 100 games',
    icon: '👑',
    rarity: 'epic',
    category: 'gameplay',
    criteria: { type: 'wins', target: 100 },
    reward: { experiencePoints: 1000, title: 'Master', unlockMessage: 'You have mastered the art of Fantasy Chess!' }
  },
  {
    id: 'chess_grandmaster',
    name: 'Grandmaster',
    description: 'Win 500 games',
    icon: '💎',
    rarity: 'legendary',
    category: 'gameplay',
    criteria: { type: 'wins', target: 500 },
    reward: { experiencePoints: 2500, title: 'Grandmaster', unlockMessage: 'You are among the greatest chess masters in the realm!' }
  },

  // Strategic Achievements
  {
    id: 'first_checkmate',
    name: 'Checkmate!',
    description: 'Deliver your first checkmate',
    icon: '♔',
    rarity: 'common',
    category: 'strategic',
    criteria: { type: 'checkmates', target: 1 },
    reward: { experiencePoints: 150, unlockMessage: 'The king falls before your strategy!' }
  },
  {
    id: 'swift_victory',
    name: 'Swift Victory',
    description: 'Win a game in under 20 moves',
    icon: '⚡',
    rarity: 'rare',
    category: 'strategic',
    criteria: { type: 'fast_wins', target: 1 },
    reward: { experiencePoints: 300, unlockMessage: 'Lightning fast tactics!' }
  },
  {
    id: 'perfect_game',
    name: 'Perfect Game',
    description: 'Win without losing any pieces',
    icon: '✨',
    rarity: 'epic',
    category: 'strategic',
    criteria: { type: 'perfect_games', target: 1 },
    reward: { experiencePoints: 500, unlockMessage: 'A flawless performance!' }
  },
  {
    id: 'win_streak_5',
    name: 'On Fire',
    description: 'Win 5 games in a row',
    icon: '🔥',
    rarity: 'rare',
    category: 'strategic',
    criteria: { type: 'streaks', target: 5 },
    reward: { experiencePoints: 400, unlockMessage: 'Your winning streak is blazing!' }
  },
  {
    id: 'win_streak_10',
    name: 'Unstoppable',
    description: 'Win 10 games in a row',
    icon: '🌟',
    rarity: 'epic',
    category: 'strategic',
    criteria: { type: 'streaks', target: 10 },
    reward: { experiencePoints: 750, title: 'Unstoppable', unlockMessage: 'No one can stand against your might!' }
  },

  // Mastery Achievements
  {
    id: 'wizard_teleporter',
    name: 'Wizard Teleporter',
    description: 'Use wizard teleportation 50 times',
    icon: '🧙‍♂️',
    rarity: 'rare',
    category: 'mastery',
    criteria: { type: 'special_moves', target: 50, condition: 'wizard_teleports' },
    reward: { experiencePoints: 350, unlockMessage: 'Master of magical teleportation!' }
  },
  {
    id: 'castle_defender',
    name: 'Castle Defender',
    description: 'Perform castling 20 times',
    icon: '🏰',
    rarity: 'common',
    category: 'mastery',
    criteria: { type: 'special_moves', target: 20, condition: 'castling' },
    reward: { experiencePoints: 200, unlockMessage: 'The castle walls protect your king!' }
  },
  {
    id: 'pawn_promoter',
    name: 'Pawn Promoter',
    description: 'Promote 10 pawns to queens',
    icon: '♕',
    rarity: 'rare',
    category: 'mastery',
    criteria: { type: 'special_moves', target: 10, condition: 'promotions' },
    reward: { experiencePoints: 300, unlockMessage: 'From humble beginnings to royal power!' }
  },
  {
    id: 'piece_hunter',
    name: 'Piece Hunter',
    description: 'Capture 100 enemy pieces',
    icon: '🎯',
    rarity: 'common',
    category: 'mastery',
    criteria: { type: 'captures', target: 100 },
    reward: { experiencePoints: 250, unlockMessage: 'A fearsome hunter on the battlefield!' }
  },
  {
    id: 'ai_conqueror',
    name: 'AI Conqueror',
    description: 'Defeat the AI 50 times',
    icon: '🤖',
    rarity: 'epic',
    category: 'mastery',
    criteria: { type: 'ai_defeats', target: 50 },
    reward: { experiencePoints: 600, title: 'AI Conqueror', unlockMessage: 'Machines bow before your intelligence!' }
  },

  // Collection Achievements
  {
    id: 'dedicated_player',
    name: 'Dedicated Player',
    description: 'Play 100 games',
    icon: '🎮',
    rarity: 'common',
    category: 'collection',
    criteria: { type: 'games_played', target: 100 },
    reward: { experiencePoints: 200, unlockMessage: 'Your dedication to the game is admirable!' }
  },
  {
    id: 'chess_marathon',
    name: 'Chess Marathon',
    description: 'Play for 10 hours total',
    icon: '⏱️',
    rarity: 'rare',
    category: 'collection',
    criteria: { type: 'time_played', target: 600 }, // 600 minutes = 10 hours
    reward: { experiencePoints: 400, unlockMessage: 'A true marathon chess player!' }
  },
  {
    id: 'move_master',
    name: 'Move Master',
    description: 'Make 1000 moves',
    icon: '🏃‍♂️',
    rarity: 'common',
    category: 'collection',
    criteria: { type: 'pieces_moved', target: 1000 },
    reward: { experiencePoints: 150, unlockMessage: 'Every move brings you closer to mastery!' }
  },

  // Special/Hidden Achievements
  {
    id: 'easter_egg',
    name: 'Secret Discovery',
    description: 'Found a hidden feature',
    icon: '🥚',
    rarity: 'legendary',
    category: 'special',
    criteria: { type: 'custom', target: 1 },
    reward: { experiencePoints: 1000, title: 'Secret Keeper', unlockMessage: 'You discovered something special!' },
    hidden: true
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Win 5 games in under 15 moves each',
    icon: '💨',
    rarity: 'legendary',
    category: 'special',
    criteria: { type: 'fast_wins', target: 5 },
    reward: { experiencePoints: 1500, title: 'Speed Demon', unlockMessage: 'Faster than lightning, sharper than steel!' },
    hidden: true
  }
];

export const LEVEL_THRESHOLDS = [
  0,     // Level 1
  100,   // Level 2
  300,   // Level 3
  600,   // Level 4
  1000,  // Level 5
  1500,  // Level 6
  2200,  // Level 7
  3000,  // Level 8
  4000,  // Level 9
  5500,  // Level 10
  7500,  // Level 11
  10000, // Level 12
  13000, // Level 13
  16500, // Level 14
  20500, // Level 15
  25000  // Level 16+
];

export function calculateLevel(experience: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (experience >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

export function getExperienceForNextLevel(currentLevel: number): number {
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + (currentLevel - LEVEL_THRESHOLDS.length + 1) * 5000;
  }
  return LEVEL_THRESHOLDS[currentLevel] || 0;
}