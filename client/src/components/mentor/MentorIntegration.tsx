import React, { useEffect } from 'react';
import { useDynamicAIMentor } from '../../lib/stores/useDynamicAIMentor';
import { useChess } from '../../lib/stores/useChess';
import { DynamicMentorPanel } from './DynamicMentorPanel';

export function MentorIntegration() {
  const { isActive, initializeMentor, analyzeCurrentMove, activateMentor } = useDynamicAIMentor();
  const { 
    moveHistory, 
    gamePhase, 
    board, 
    currentPlayer, 
    selectedPosition,
    validMoves,
    gameMode,
    aiDifficulty,
    isInCheck,
    isCheckmate,
    isStalemate,
    winner,
    gameStartTime
  } = useChess();

  // Initialize mentor system on mount and activate it automatically
  useEffect(() => {
    console.log('🧙‍♂️ MentorIntegration mounted, activating mentor system');
    activateMentor();
    setTimeout(() => {
      initializeMentor();
    }, 100);
  }, [activateMentor, initializeMentor]);

  // Monitor move history for real-time analysis
  useEffect(() => {
    if (isActive && moveHistory.length > 0) {
      const lastMove = moveHistory[moveHistory.length - 1];
      console.log('🧙‍♂️ Analyzing move:', lastMove);
      
      // Create complete game state for analysis
      const gameState = {
        board,
        moveHistory,
        currentPlayer,
        gamePhase,
        selectedPosition,
        validMoves,
        gameMode,
        aiDifficulty,
        isInCheck,
        isCheckmate,
        isStalemate,
        winner,
        gameStartTime
      };
      
      // Trigger move analysis
      analyzeCurrentMove(gameState, lastMove);
    }
  }, [moveHistory, isActive, board, currentPlayer, gamePhase, analyzeCurrentMove, selectedPosition, validMoves, gameMode, aiDifficulty, isInCheck, isCheckmate, isStalemate, winner, gameStartTime]);

  // Monitor game state changes for mentor milestones
  useEffect(() => {
    const mentorState = useDynamicAIMentor.getState();
    if (isActive && moveHistory.length > 0) {
      // Increment games played when game ends
      if (gamePhase === 'ended') {
        console.log('🧙‍♂️ Game ended, recording progress');
        mentorState.sessionProgress.improvementPoints += 10;
        
        // Check for milestones
        if (moveHistory.length < 30) {
          mentorState.recordMilestone('Quick Game Completion');
        }
        if (moveHistory.filter(m => m.isWizardTeleport || m.isWizardAttack).length > 2) {
          mentorState.recordMilestone('Wizard Mastery');
        }
        
        // Record session game count
        mentorState.gamesThisSession += 1;
      }
    }
  }, [gamePhase, isActive, moveHistory]);

  return (
    <div className="mentor-integration">
      <DynamicMentorPanel />
    </div>
  );
}