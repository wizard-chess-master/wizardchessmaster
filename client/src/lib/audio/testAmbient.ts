import { ambientManager } from './ambientManager';
import { useAudio } from '../stores/useAudio';
import { GameState } from '../chess/types';

/**
 * Test function to manually trigger different intensity levels
 * This is useful for testing the ambient sound system
 */
export function testAmbientIntensity() {
  const testScenarios = [
    {
      name: 'Calm Opening',
      intensity: 'calm' as const,
      state: {
        gamePhase: 'playing' as const,
        board: [], // Empty board for simplicity
        moveHistory: [],
        isInCheck: false,
        isCheckmate: false,
        currentPlayer: 'white' as const,
        selectedPosition: null,
        validMoves: [],
        gameMode: 'local' as const,
        aiDifficulty: 'medium' as const,
        isStalemate: false,
        winner: null
      }
    },
    {
      name: 'Check Situation',
      intensity: 'tense' as const,
      state: {
        gamePhase: 'playing' as const,
        board: [],
        moveHistory: Array(15).fill(null), // Mid-game
        isInCheck: true,
        isCheckmate: false,
        currentPlayer: 'white' as const,
        selectedPosition: null,
        validMoves: [],
        gameMode: 'local' as const,
        aiDifficulty: 'medium' as const,
        isStalemate: false,
        winner: null
      }
    },
    {
      name: 'Critical Endgame',
      intensity: 'critical' as const,
      state: {
        gamePhase: 'playing' as const,
        board: [],
        moveHistory: Array(40).fill(null), // Late game
        isInCheck: true,
        isCheckmate: false,
        currentPlayer: 'white' as const,
        selectedPosition: null,
        validMoves: [],
        gameMode: 'local' as const,
        aiDifficulty: 'medium' as const,
        isStalemate: false,
        winner: null
      }
    }
  ];

  console.log('🎵 Testing Ambient Sound Intensity System');
  
  testScenarios.forEach((scenario, index) => {
    setTimeout(() => {
      console.log(`🎯 Testing scenario: ${scenario.name} (${scenario.intensity})`);
      
      // Manually set intensity for testing
      const { setGameIntensity } = useAudio.getState();
      setGameIntensity(scenario.intensity);
      
      // Also run through the analyzer
      ambientManager.analyzeGameIntensity(scenario.state);
    }, index * 3000); // 3 seconds between tests
  });
}

// Function to be called from browser console for testing
(window as any).testAmbientSounds = testAmbientIntensity;