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

  // Handle game phase changes (auto-music disabled to prevent conflicts)
  useEffect(() => {
    if (isMuted) return;

    switch (gamePhase) {
      case 'playing':
        console.log('🎵 Game start - Music only via manual user control');
        // All automatic music triggers disabled to prevent conflicts
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
    if (lastMove.captured) {
      wizardChessAudio.onPieceCapture();
    } else {
      // Regular move sound
      wizardChessAudio.onPieceMove();
    }

    // Check for wizard special moves
    if (lastMove.piece?.type === 'wizard') {
      if (lastMove.isWizardTeleport) {
        wizardChessAudio.onWizardTeleport();
      } else if (lastMove.captured) {
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