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
    gamePhase,
    isInCheck
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





  // Handle special game events
  useEffect(() => {
    if (isMuted) return;

    if (gamePhase === 'ended') {
      immersiveAudio.playGameEvent('checkmate');
    } else if (isInCheck) {
      immersiveAudio.playGameEvent('check');
    }
  }, [gamePhase, isInCheck, isMuted]);



  return null; // Audio controller doesn't render anything
}

export default ChessAudioController;