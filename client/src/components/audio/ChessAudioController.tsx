import { useEffect } from 'react';
import { useChess } from '../../lib/stores/useChess';
import { useAudio } from '../../lib/stores/useAudio';
import { wizardChessAudio } from '../../lib/audio/audioManager';

export function ChessAudioController() {
  const { 
    gamePhase,
    moveHistory,
    isInCheck,
    isCheckmate,
    winner,
    board
  } = useChess();
  const { isMuted } = useAudio();

  // Initialize audio when component mounts
  useEffect(() => {
    const { initializeAudio } = useAudio.getState();
    initializeAudio();
  }, []);

  // Handle game phase changes
  useEffect(() => {
    if (isMuted) return;

    switch (gamePhase) {
      case 'playing':
        if (moveHistory.length === 0) {
          console.log('🎵 TRIGGERING Theme-music1.mp3 via ChessAudioController...');
          wizardChessAudio.onGameStart();
          
          // Also directly call playBackgroundMusic to ensure theme plays
          const { playBackgroundMusic } = useAudio.getState();
          setTimeout(() => playBackgroundMusic(), 200); // Small delay to ensure game state is set
          
          // Also ensure we stop any competing audio from gameAudioManager
          if ((window as any).gameAudioManager?.stopMusic) {
            (window as any).gameAudioManager.stopMusic();
            console.log('🛑 Stopped competing gameAudioManager music');
          }
        }
        break;
      case 'ended':
        if (winner) {
          wizardChessAudio.onGameEnd(winner === 'white' || winner === 'black');
        }
        break;
    }
  }, [gamePhase, moveHistory.length, winner, isMuted]);

  // Handle move events
  useEffect(() => {
    if (isMuted || moveHistory.length === 0) return;

    const lastMove = moveHistory[moveHistory.length - 1];
    if (!lastMove) return;

    // Check for capture
    if (lastMove.capturedPiece) {
      wizardChessAudio.onPieceCapture();
    } else {
      // Regular move sound
      wizardChessAudio.onPieceMove();
    }

    // Check for wizard special moves
    if (lastMove.piece?.type === 'wizard') {
      if (lastMove.isSpecialMove) {
        wizardChessAudio.onWizardTeleport();
      } else if (lastMove.capturedPiece) {
        wizardChessAudio.onWizardAttack();
      }
    }

    // Check for check/checkmate
    if (isCheckmate) {
      wizardChessAudio.onCheckmate();
    } else if (isInCheck) {
      wizardChessAudio.onCheck();
    }
  }, [isInCheck, isCheckmate, isMuted, moveHistory.length]);

  return null; // This component only handles audio events
}

export default ChessAudioController;