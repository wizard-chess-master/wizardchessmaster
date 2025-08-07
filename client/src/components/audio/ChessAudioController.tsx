/**
 * Chess Audio Controller Component
 * Integrates immersive 3D audio with chess game mechanics
 */

import { useEffect } from 'react';
import { immersiveAudio } from '@/lib/audio/immersiveAudioSystem';
import { useChess } from '@/lib/stores/useChess';
import { useAudio } from '@/lib/stores/useAudio';

interface ChessPosition {
  row: number;
  col: number;
}

export function ChessAudioController() {
  const { 
    board, 
    gameStatus, 
    isInCheck, 
    lastMove, 
    capturedPieces = [] // Default to empty array if undefined
  } = useChess();
  
  const { isMuted } = useAudio();

  // Initialize immersive audio system
  useEffect(() => {
    if (!isMuted) {
      immersiveAudio.initialize().catch(console.warn);
    }

    return () => {
      immersiveAudio.dispose();
    };
  }, [isMuted]);

  // Handle game state changes for dynamic music
  useEffect(() => {
    if (isMuted) return;

    let intensity: 'calm' | 'tension' | 'battle' | 'victory' | 'defeat' = 'calm';

    switch (gameStatus) {
      case 'checkmate':
        intensity = 'victory'; // Will need to determine winner
        break;
      case 'stalemate':
      case 'draw':
        intensity = 'calm';
        break;
      default:
        if (isInCheck) {
          intensity = 'tension';
        } else if (capturedPieces && capturedPieces.length > 6) { // Active battle
          intensity = 'battle';
        } else {
          intensity = 'calm';
        }
    }

    immersiveAudio.setMusicIntensity(intensity);
  }, [gameStatus, isInCheck, capturedPieces?.length || 0, isMuted]);

  // Handle move sounds
  useEffect(() => {
    if (!lastMove || isMuted) return;

    const { from, to, piece, capturedPiece, isWizardAbility } = lastMove;
    
    // Convert chess coordinates to spatial positions
    const fromPos = { x: from.col, y: from.row };
    const toPos = { x: to.col, y: to.row };

    // Determine piece type for appropriate sound
    const pieceType = piece?.type || 'pawn';

    if (isWizardAbility) {
      // Special wizard ability sounds
      if (capturedPiece) {
        // Wizard attack
        immersiveAudio.playWizardAttack(fromPos, toPos);
      } else {
        // Wizard teleport
        immersiveAudio.playWizardTeleport(fromPos, toPos);
      }
    } else if (capturedPiece) {
      // Regular capture
      immersiveAudio.playPieceCapture(toPos, pieceType === 'wizard');
    } else {
      // Regular move
      immersiveAudio.playPieceMove(fromPos, toPos, pieceType);
    }
  }, [lastMove, isMuted]);

  // Handle special game events
  useEffect(() => {
    if (isMuted) return;

    if (gameStatus === 'checkmate') {
      immersiveAudio.playGameEvent('checkmate');
    } else if (isInCheck) {
      immersiveAudio.playGameEvent('check');
    }
  }, [gameStatus, isInCheck, isMuted]);

  // Handle castling
  useEffect(() => {
    if (!lastMove || isMuted || !lastMove.isCastling) return;
    
    immersiveAudio.playGameEvent('castling');
  }, [lastMove, isMuted]);

  // Handle pawn promotion
  useEffect(() => {
    if (!lastMove || isMuted || !lastMove.isPromotion) return;
    
    immersiveAudio.playGameEvent('promotion');
  }, [lastMove, isMuted]);

  // Volume controls based on audio store
  useEffect(() => {
    if (isMuted) {
      immersiveAudio.toggleMute();
    }
  }, [isMuted]);

  return null; // This is an audio-only component
}

export default ChessAudioController;