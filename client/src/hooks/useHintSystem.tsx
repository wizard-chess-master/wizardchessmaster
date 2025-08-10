import { useState, useEffect, useCallback } from 'react';
import { useChess } from '@/lib/stores/useChess';

export interface HintTrigger {
  id: string;
  condition: () => boolean;
  priority: 'high' | 'medium' | 'low';
  delay?: number;
}

export interface HintState {
  isNewPlayer: boolean;
  showHints: boolean;
  dismissedHints: Set<string>;
  currentHint: string | null;
}

export function useHintSystem() {
  const [hintState, setHintState] = useState<HintState>({
    isNewPlayer: true,
    showHints: true,
    dismissedHints: new Set(),
    currentHint: null
  });

  const { gamePhase, moveHistory, currentPlayer } = useChess();

  // Initialize hint system
  useEffect(() => {
    const savedHints = localStorage.getItem('wizard-chess-dismissed-hints');
    const savedSettings = localStorage.getItem('wizard-chess-hint-settings');
    
    if (savedHints) {
      setHintState(prev => ({
        ...prev,
        dismissedHints: new Set(JSON.parse(savedHints) as string[])
      }));
    }

    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setHintState(prev => ({
        ...prev,
        isNewPlayer: settings.isNewPlayer ?? true,
        showHints: settings.showHints ?? true
      }));
    }

    // Determine if player is new based on game history
    const totalGames = parseInt(localStorage.getItem('wizard-chess-total-games') || '0');
    if (totalGames > 5) {
      setHintState(prev => ({ ...prev, isNewPlayer: false }));
    }
  }, []);

  // Save settings to localStorage
  const saveHintSettings = useCallback((newState: Partial<HintState>) => {
    const settings = {
      isNewPlayer: newState.isNewPlayer ?? hintState.isNewPlayer,
      showHints: newState.showHints ?? hintState.showHints
    };
    localStorage.setItem('wizard-chess-hint-settings', JSON.stringify(settings));

    if (newState.dismissedHints) {
      localStorage.setItem('wizard-chess-dismissed-hints', 
        JSON.stringify(Array.from(newState.dismissedHints)));
    }
  }, [hintState]);

  // Toggle hint visibility
  const toggleHints = useCallback((show: boolean) => {
    const newState = { ...hintState, showHints: show };
    setHintState(newState);
    saveHintSettings(newState);
  }, [hintState, saveHintSettings]);

  // Dismiss a specific hint
  const dismissHint = useCallback((hintId: string) => {
    const newDismissed = new Set(hintState.dismissedHints);
    newDismissed.add(hintId);
    const newState: HintState = { ...hintState, dismissedHints: newDismissed, currentHint: null };
    setHintState(newState);
    saveHintSettings(newState);
  }, [hintState, saveHintSettings]);

  // Reset all dismissed hints
  const resetDismissedHints = useCallback(() => {
    const newState = { ...hintState, dismissedHints: new Set() };
    setHintState(newState);
    localStorage.removeItem('wizard-chess-dismissed-hints');
  }, [hintState]);

  // Mark player as experienced
  const markAsExperienced = useCallback(() => {
    const newState = { ...hintState, isNewPlayer: false };
    setHintState(newState);
    saveHintSettings(newState);
  }, [hintState, saveHintSettings]);

  // Check if a hint should be shown
  const shouldShowHint = useCallback((hintId: string): boolean => {
    return hintState.showHints && 
           hintState.isNewPlayer && 
           !hintState.dismissedHints.has(hintId);
  }, [hintState]);

  // Track game completion for new player detection
  useEffect(() => {
    if (gamePhase === 'ended') {
      const totalGames = parseInt(localStorage.getItem('wizard-chess-total-games') || '0') + 1;
      localStorage.setItem('wizard-chess-total-games', totalGames.toString());
      
      // Mark as experienced after 5 games
      if (totalGames >= 5) {
        markAsExperienced();
      }
    }
  }, [gamePhase, markAsExperienced]);

  return {
    hintState,
    toggleHints,
    dismissHint,
    resetDismissedHints,
    markAsExperienced,
    shouldShowHint
  };
}