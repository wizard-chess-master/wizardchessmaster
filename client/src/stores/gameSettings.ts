import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GameSettings {
  selectedPieceSet: string;
  selectedBoardTheme: string;
  setSelectedPieceSet: (setId: string) => void;
  setSelectedBoardTheme: (themeId: string) => void;
}

export const useGameSettings = create<GameSettings>()(
  persist(
    (set) => ({
      selectedPieceSet: 'classic',
      selectedBoardTheme: 'classic',
      setSelectedPieceSet: (setId: string) => set({ selectedPieceSet: setId }),
      setSelectedBoardTheme: (themeId: string) => set({ selectedBoardTheme: themeId }),
    }),
    {
      name: 'game-settings'
    }
  )
);