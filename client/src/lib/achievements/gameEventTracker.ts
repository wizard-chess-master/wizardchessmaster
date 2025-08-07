/**
 * Game Event Tracker for Achievement System
 * Monitors chess game events and updates achievement progress
 */

import { useAchievements } from './achievementSystem';
import { useChess } from '../stores/useChess';
import { GameState } from '../chess/types';

class GameEventTracker {
  private gameStartTime: number = 0;
  private movesThisGame: number = 0;
  private capturesThisGame: number = 0;
  private wizardTeleportsThisGame: number = 0;
  private castlingMovesThisGame: number = 0;
  private promotionsThisGame: number = 0;
  private piecesLostThisGame: number = 0;

  startGame() {
    this.gameStartTime = Date.now();
    this.movesThisGame = 0;
    this.capturesThisGame = 0;
    this.wizardTeleportsThisGame = 0;
    this.castlingMovesThisGame = 0;
    this.promotionsThisGame = 0;
    this.piecesLostThisGame = 0;
    console.log('🎯 Achievement tracking started for new game');
  }

  trackMove(fromPiece: string, wasCapture: boolean, wasWizardTeleport: boolean = false) {
    const state = useAchievements.getState();
    
    this.movesThisGame++;
    
    // Update pieces moved counter
    state.updateProgress({ piecesMoved: state.progress.piecesMoved + 1 });

    if (wasCapture) {
      this.capturesThisGame++;
      state.updateProgress({ totalCaptures: state.progress.totalCaptures + 1 });
    }

    if (wasWizardTeleport) {
      this.wizardTeleportsThisGame++;
      state.updateProgress({ wizardTeleports: state.progress.wizardTeleports + 1 });
    }

    console.log(`🎯 Move tracked: ${fromPiece}, capture: ${wasCapture}, teleport: ${wasWizardTeleport}`);
  }

  trackCastling() {
    const state = useAchievements.getState();
    
    this.castlingMovesThisGame++;
    state.updateProgress({ castlingMoves: state.progress.castlingMoves + 1 });
    
    console.log('🎯 Castling move tracked');
  }

  trackPromotion() {
    const state = useAchievements.getState();
    
    this.promotionsThisGame++;
    state.updateProgress({ promotions: state.progress.promotions + 1 });
    
    console.log('🎯 Pawn promotion tracked');
  }

  trackPieceLoss() {
    this.piecesLostThisGame++;
    console.log('🎯 Piece loss tracked');
  }

  trackGameEnd(winner: string | null, isCheckmate: boolean, gameMode: string) {
    const state = useAchievements.getState();
    const currentProgress = state.progress;
    
    const gameTimeMinutes = (Date.now() - this.gameStartTime) / (1000 * 60);
    const humanWon = (gameMode === 'local' && winner) || (gameMode === 'ai' && winner === 'white');
    const aiDefeated = gameMode === 'ai' && winner === 'white';
    const isFastWin = humanWon && this.movesThisGame <= 20;
    const isPerfectGame = humanWon && this.piecesLostThisGame === 0;

    // Update basic game stats
    const updates: any = {
      gamesPlayed: currentProgress.gamesPlayed + 1,
      timePlayedMinutes: Math.round(currentProgress.timePlayedMinutes + gameTimeMinutes)
    };

    // Track wins and streaks
    if (humanWon) {
      const newGamesWon = currentProgress.gamesWon + 1;
      const newCurrentStreak = currentProgress.currentStreak + 1;
      
      updates.gamesWon = newGamesWon;
      updates.currentStreak = newCurrentStreak;
      updates.winStreak = Math.max(currentProgress.winStreak, newCurrentStreak);
      
      if (isFastWin) {
        updates.fastWins = currentProgress.fastWins + 1;
      }
      
      if (isPerfectGame) {
        updates.perfectGames = currentProgress.perfectGames + 1;
      }
    } else {
      updates.currentStreak = 0; // Reset streak on loss
    }

    // Track checkmates
    if (isCheckmate && humanWon) {
      updates.checkmates = currentProgress.checkmates + 1;
    }

    // Track AI defeats
    if (aiDefeated) {
      updates.aiDefeats = currentProgress.aiDefeats + 1;
    }

    // Update progress and check for new achievements
    state.updateProgress(updates);
    
    // Check for newly unlocked achievements
    const newAchievements = state.checkAchievements({
      gameMode,
      winner,
      isCheckmate,
      movesPlayed: this.movesThisGame,
      capturesMade: this.capturesThisGame,
      gameTimeMinutes,
      wasFastWin: isFastWin,
      wasPerfectGame: isPerfectGame
    });

    console.log(`🎯 Game completed tracking:`, {
      winner,
      isCheckmate,
      moves: this.movesThisGame,
      captures: this.capturesThisGame,
      gameTime: Math.round(gameTimeMinutes * 10) / 10,
      newAchievements: newAchievements.length
    });

    if (newAchievements.length > 0) {
      console.log(`🏆 ${newAchievements.length} new achievements unlocked!`);
    }

    // Reset game-specific counters
    this.resetGameCounters();
  }

  private resetGameCounters() {
    this.gameStartTime = 0;
    this.movesThisGame = 0;
    this.capturesThisGame = 0;
    this.wizardTeleportsThisGame = 0;
    this.castlingMovesThisGame = 0;
    this.promotionsThisGame = 0;
    this.piecesLostThisGame = 0;
  }

  // Method to manually unlock special achievements
  unlockSpecialAchievement(achievementId: string) {
    const state = useAchievements.getState();
    state.unlockSecretAchievement(achievementId);
    console.log(`🎉 Special achievement unlocked: ${achievementId}`);
  }

  // Get current game stats (for debugging)
  getCurrentGameStats() {
    return {
      gameTime: Date.now() - this.gameStartTime,
      moves: this.movesThisGame,
      captures: this.capturesThisGame,
      wizardTeleports: this.wizardTeleportsThisGame,
      castlingMoves: this.castlingMovesThisGame,
      promotions: this.promotionsThisGame,
      piecesLost: this.piecesLostThisGame
    };
  }
}

export const gameEventTracker = new GameEventTracker();

// Make it available globally for testing
(window as any).gameEventTracker = gameEventTracker;