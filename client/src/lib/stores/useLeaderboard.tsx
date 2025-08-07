import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface PlayerStats {
  playerId: string;
  playerName: string;
  timestamp: number;
}

export interface CampaignStats extends PlayerStats {
  currentLevel: number;
  totalCampaignWins: number;
  totalCampaignGames: number;
  campaignWinRate: number;
  highestLevelReached: number;
  averageGameTime: number;
  bestGameTime: number;
  totalExperience: number;
  campaignScore: number; // Calculated score based on performance
}

export interface PvPStats extends PlayerStats {
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  totalGames: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  averageGameLength: number;
  fastestWin: number;
  pvpRating: number; // ELO-style rating
}

export interface LeaderboardEntry {
  rank: number;
  stats: CampaignStats | PvPStats;
  isCurrentPlayer: boolean;
}

interface LeaderboardStore {
  // Current player stats
  currentPlayerName: string;
  campaignStats: CampaignStats | null;
  pvpStats: PvPStats | null;
  
  // Leaderboard data
  campaignLeaderboard: CampaignStats[];
  pvpLeaderboard: PvPStats[];
  
  // Actions
  setPlayerName: (name: string) => void;
  updateCampaignStats: (update: Partial<CampaignStats>) => void;
  updatePvPStats: (update: Partial<PvPStats>) => void;
  recordCampaignGame: (won: boolean, gameTime: number, level: number) => void;
  recordPvPGame: (result: 'win' | 'loss' | 'draw', gameLength: number) => void;
  getCampaignLeaderboard: () => LeaderboardEntry[];
  getPvPLeaderboard: () => LeaderboardEntry[];
  resetStats: () => void;
  loadLeaderboardData: () => void;
  saveLeaderboardData: () => void;
}

const STORAGE_KEY = 'wizard-chess-leaderboard';

const createInitialCampaignStats = (playerId: string, playerName: string): CampaignStats => ({
  playerId,
  playerName,
  timestamp: Date.now(),
  currentLevel: 1,
  totalCampaignWins: 0,
  totalCampaignGames: 0,
  campaignWinRate: 0,
  highestLevelReached: 1,
  averageGameTime: 0,
  bestGameTime: Infinity,
  totalExperience: 0,
  campaignScore: 0
});

const createInitialPvPStats = (playerId: string, playerName: string): PvPStats => ({
  playerId,
  playerName,
  timestamp: Date.now(),
  totalWins: 0,
  totalLosses: 0,
  totalDraws: 0,
  totalGames: 0,
  winRate: 0,
  currentStreak: 0,
  bestStreak: 0,
  averageGameLength: 0,
  fastestWin: Infinity,
  pvpRating: 1200 // Starting ELO rating
});

const calculateCampaignScore = (stats: CampaignStats): number => {
  const levelBonus = stats.highestLevelReached * 100;
  const winBonus = stats.totalCampaignWins * 50;
  const efficiencyBonus = stats.campaignWinRate * 200;
  const speedBonus = stats.bestGameTime < Infinity ? Math.max(0, 300 - stats.bestGameTime / 1000) : 0;
  
  return Math.round(levelBonus + winBonus + efficiencyBonus + speedBonus);
};

const calculatePvPRating = (currentRating: number, opponentRating: number, result: 'win' | 'loss' | 'draw'): number => {
  const K = 32; // K-factor for rating changes
  const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - currentRating) / 400));
  
  let actualScore = 0;
  if (result === 'win') actualScore = 1;
  else if (result === 'draw') actualScore = 0.5;
  
  const newRating = currentRating + K * (actualScore - expectedScore);
  return Math.max(800, Math.min(2800, Math.round(newRating))); // Clamp between 800-2800
};

export const useLeaderboard = create<LeaderboardStore>()(
  subscribeWithSelector((set, get) => ({
    currentPlayerName: '',
    campaignStats: null,
    pvpStats: null,
    campaignLeaderboard: [],
    pvpLeaderboard: [],

    setPlayerName: (name: string) => {
      const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      set({
        currentPlayerName: name,
        campaignStats: createInitialCampaignStats(playerId, name),
        pvpStats: createInitialPvPStats(playerId, name)
      });
      
      get().saveLeaderboardData();
    },

    updateCampaignStats: (update: Partial<CampaignStats>) => {
      const state = get();
      if (!state.campaignStats) return;
      
      const updatedStats = { ...state.campaignStats, ...update, timestamp: Date.now() };
      updatedStats.campaignScore = calculateCampaignScore(updatedStats);
      
      set({ campaignStats: updatedStats });
      get().saveLeaderboardData();
    },

    updatePvPStats: (update: Partial<PvPStats>) => {
      const state = get();
      if (!state.pvpStats) return;
      
      const updatedStats = { ...state.pvpStats, ...update, timestamp: Date.now() };
      
      set({ pvpStats: updatedStats });
      get().saveLeaderboardData();
    },

    recordCampaignGame: (won: boolean, gameTime: number, level: number) => {
      const state = get();
      if (!state.campaignStats) return;
      
      const currentStats = state.campaignStats;
      const totalGames = currentStats.totalCampaignGames + 1;
      const totalWins = currentStats.totalCampaignWins + (won ? 1 : 0);
      const winRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;
      
      const totalGameTime = (currentStats.averageGameTime * currentStats.totalCampaignGames) + gameTime;
      const averageGameTime = totalGameTime / totalGames;
      
      const updates: Partial<CampaignStats> = {
        totalCampaignGames: totalGames,
        totalCampaignWins: totalWins,
        campaignWinRate: winRate,
        averageGameTime,
        bestGameTime: Math.min(currentStats.bestGameTime, gameTime),
        currentLevel: level,
        highestLevelReached: Math.max(currentStats.highestLevelReached, level),
        totalExperience: currentStats.totalExperience + (won ? level * 100 : level * 25)
      };
      
      get().updateCampaignStats(updates);
    },

    recordPvPGame: (result: 'win' | 'loss' | 'draw', gameLength: number) => {
      const state = get();
      if (!state.pvpStats) return;
      
      const currentStats = state.pvpStats;
      const totalGames = currentStats.totalGames + 1;
      
      let totalWins = currentStats.totalWins;
      let totalLosses = currentStats.totalLosses;
      let totalDraws = currentStats.totalDraws;
      let currentStreak = currentStats.currentStreak;
      
      if (result === 'win') {
        totalWins++;
        currentStreak = currentStreak > 0 ? currentStreak + 1 : 1;
      } else if (result === 'loss') {
        totalLosses++;
        currentStreak = currentStreak < 0 ? currentStreak - 1 : -1;
      } else {
        totalDraws++;
        currentStreak = 0;
      }
      
      const winRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;
      const bestStreak = Math.max(currentStats.bestStreak, Math.abs(currentStreak));
      
      const totalGameTime = (currentStats.averageGameLength * currentStats.totalGames) + gameLength;
      const averageGameLength = totalGameTime / totalGames;
      
      const fastestWin = result === 'win' ? Math.min(currentStats.fastestWin, gameLength) : currentStats.fastestWin;
      
      // Calculate new rating (using average rating 1200 as opponent for simplicity)
      const newRating = calculatePvPRating(currentStats.pvpRating, 1200, result);
      
      const updates: Partial<PvPStats> = {
        totalGames,
        totalWins,
        totalLosses,
        totalDraws,
        winRate,
        currentStreak,
        bestStreak,
        averageGameLength,
        fastestWin,
        pvpRating: newRating
      };
      
      get().updatePvPStats(updates);
    },

    getCampaignLeaderboard: (): LeaderboardEntry[] => {
      const state = get();
      const allStats = [...state.campaignLeaderboard];
      
      if (state.campaignStats && !allStats.find(s => s.playerId === state.campaignStats!.playerId)) {
        allStats.push(state.campaignStats);
      }
      
      const sorted = allStats
        .sort((a, b) => b.campaignScore - a.campaignScore)
        .slice(0, 100); // Top 100
      
      return sorted.map((stats, index) => ({
        rank: index + 1,
        stats,
        isCurrentPlayer: stats.playerId === state.campaignStats?.playerId
      }));
    },

    getPvPLeaderboard: (): LeaderboardEntry[] => {
      const state = get();
      const allStats = [...state.pvpLeaderboard];
      
      if (state.pvpStats && !allStats.find(s => s.playerId === state.pvpStats!.playerId)) {
        allStats.push(state.pvpStats);
      }
      
      const sorted = allStats
        .sort((a, b) => b.pvpRating - a.pvpRating)
        .slice(0, 100); // Top 100
      
      return sorted.map((stats, index) => ({
        rank: index + 1,
        stats,
        isCurrentPlayer: stats.playerId === state.pvpStats?.playerId
      }));
    },

    resetStats: () => {
      set({
        campaignStats: null,
        pvpStats: null,
        campaignLeaderboard: [],
        pvpLeaderboard: []
      });
      
      localStorage.removeItem(STORAGE_KEY);
    },

    loadLeaderboardData: () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          set({
            currentPlayerName: data.currentPlayerName || '',
            campaignStats: data.campaignStats || null,
            pvpStats: data.pvpStats || null,
            campaignLeaderboard: data.campaignLeaderboard || [],
            pvpLeaderboard: data.pvpLeaderboard || []
          });
        }
      } catch (error) {
        console.error('Failed to load leaderboard data:', error);
      }
    },

    saveLeaderboardData: () => {
      try {
        const state = get();
        const dataToSave = {
          currentPlayerName: state.currentPlayerName,
          campaignStats: state.campaignStats,
          pvpStats: state.pvpStats,
          campaignLeaderboard: state.campaignLeaderboard,
          pvpLeaderboard: state.pvpLeaderboard
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      } catch (error) {
        console.error('Failed to save leaderboard data:', error);
      }
    }
  }))
);

// Load data on initialization
useLeaderboard.getState().loadLeaderboardData();