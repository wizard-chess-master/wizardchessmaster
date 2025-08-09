import { useAchievements } from '../achievements/achievementSystem';

export interface PieceSet {
  id: string;
  name: string;
  description: string;
  theme: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  unlockType: 'achievement' | 'level' | 'purchase';
  unlockRequirement: string | number;
  price?: number;
  imagePath?: string;
}

export interface BoardTheme {
  id: string;
  name: string;
  description: string;
  theme: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  unlockType: 'achievement' | 'level' | 'purchase';
  unlockRequirement: string | number;
  price?: number;
  lightSquare: string;
  darkSquare: string;
}

export const PIECE_SETS: PieceSet[] = [
  {
    id: 'classic',
    name: 'Classic Wooden',
    description: 'Traditional wooden chess pieces',
    theme: 'Classic',
    rarity: 'common',
    unlockType: 'level',
    unlockRequirement: 1,
    imagePath: '/assets/pieces/classic'
  },
  {
    id: 'crystal',
    name: 'Crystal Realm',
    description: 'Luminous crystal pieces with magical glow',
    theme: 'Mystical',
    rarity: 'rare',
    unlockType: 'achievement',
    unlockRequirement: 'chess_knight'
  },
  {
    id: 'shadow',
    name: 'Shadow Legion',
    description: 'Dark obsidian pieces with purple energy',
    theme: 'Dark',
    rarity: 'epic',
    unlockType: 'achievement',
    unlockRequirement: 'battle_legend'
  },
  {
    id: 'golden',
    name: 'Golden Empire',
    description: 'Ornate golden pieces with royal gems',
    theme: 'Royal',
    rarity: 'epic',
    unlockType: 'achievement',
    unlockRequirement: 'chess_master'
  },
  {
    id: 'elemental',
    name: 'Elemental Forces',
    description: 'Pieces representing the four elements',
    theme: 'Elemental',
    rarity: 'legendary',
    unlockType: 'achievement',
    unlockRequirement: 'wizard_supreme'
  },
  {
    id: 'cosmic',
    name: 'Cosmic Guardians',
    description: 'Cosmic pieces with galaxy patterns',
    theme: 'Cosmic',
    rarity: 'legendary',
    unlockType: 'achievement',
    unlockRequirement: 'chess_grandmaster'
  },
  {
    id: 'dragon',
    name: 'Dragon Lords',
    description: 'Ancient dragon-themed pieces',
    theme: 'Dragon',
    rarity: 'mythic',
    unlockType: 'achievement',
    unlockRequirement: 'ai_destroyer'
  }
];

export const BOARD_THEMES: BoardTheme[] = [
  {
    id: 'classic',
    name: 'Classic Wood',
    description: 'Traditional wooden chess board',
    theme: 'Classic',
    rarity: 'common',
    unlockType: 'level',
    unlockRequirement: 1,
    lightSquare: '#f0d9b5',
    darkSquare: '#b58863'
  },
  {
    id: 'marble',
    name: 'Royal Marble',
    description: 'Elegant marble with gold veining',
    theme: 'Royal',
    rarity: 'rare',
    unlockType: 'achievement',
    unlockRequirement: 'royal_ascension',
    lightSquare: '#f5f5dc',
    darkSquare: '#8b7355'
  },
  {
    id: 'crystal_ice',
    name: 'Frozen Realm',
    description: 'Crystalline ice board with magical glow',
    theme: 'Ice',
    rarity: 'epic',
    unlockType: 'achievement',
    unlockRequirement: 'lightning_lord',
    lightSquare: '#e6f3ff',
    darkSquare: '#4a90e2'
  }
];

export function useRewards() {
  const { unlockedAchievements, currentLevel } = useAchievements();
  
  // Ensure unlockedAchievements is always an array
  const safeUnlockedAchievements = Array.isArray(unlockedAchievements) ? unlockedAchievements : [];
  
  const isPieceSetUnlocked = (setId: string): boolean => {
    const pieceSet = PIECE_SETS.find(set => set.id === setId);
    if (!pieceSet) return false;
    
    if (pieceSet.unlockType === 'level') {
      return currentLevel >= (pieceSet.unlockRequirement as number);
    }
    
    if (pieceSet.unlockType === 'achievement') {
      return safeUnlockedAchievements.includes(pieceSet.unlockRequirement as string);
    }
    
    // For purchase type, we'll implement this later
    return false;
  };
  
  const isBoardThemeUnlocked = (themeId: string): boolean => {
    const boardTheme = BOARD_THEMES.find(theme => theme.id === themeId);
    if (!boardTheme) return false;
    
    if (boardTheme.unlockType === 'level') {
      return currentLevel >= (boardTheme.unlockRequirement as number);
    }
    
    if (boardTheme.unlockType === 'achievement') {
      return safeUnlockedAchievements.includes(boardTheme.unlockRequirement as string);
    }
    
    // For purchase type, we'll implement this later
    return false;
  };
  
  return {
    PIECE_SETS,
    BOARD_THEMES,
    isPieceSetUnlocked,
    isBoardThemeUnlocked
  };
}