/**
 * Test Reinforcement Learning Commentary System
 */

import { rlCommentary } from './coach';
import { GameState } from '../chess/types';
import type { Tags } from './coach';

export async function testRLSystem() {
  console.log('🧪 Testing Reinforcement Learning Commentary System\n');
  
  // Create test game states
  const earlyGameState: GameState = {
    board: Array(10).fill(null).map(() => Array(10).fill(null)),
    currentPlayer: 'white',
    selectedPosition: null,
    validMoves: [],
    gamePhase: 'playing',
    gameMode: 'ai',
    aiDifficulty: 'medium',
    moveHistory: [], // Early game
    isInCheck: false,
    isCheckmate: false,
    isStalemate: false,
    winner: null
  };
  
  const midGameState: GameState = {
    ...earlyGameState,
    moveHistory: Array(15).fill({
      from: { row: 0, col: 0 },
      to: { row: 1, col: 1 },
      piece: { type: 'pawn', color: 'white', id: 'p1' }
    } as any) // Mid game
  };
  
  const checkState: GameState = {
    ...earlyGameState,
    isInCheck: true
  };
  
  console.log('Test 1: Frequency Limiting (1 comment per 5 moves)');
  console.log('----------------------------------------');
  
  // Reset the system first
  rlCommentary.reset();
  
  // Test frequency limiting
  for (let i = 1; i <= 10; i++) {
    const tags: Tags = {
      moveQuality: Math.random(),
      suggestion: i % 2 === 0 ? 'Consider tactical play' : 'Improve king safety immediately'
    };
    
    const comment = await rlCommentary.generateCommentary(earlyGameState, tags);
    console.log(`Move ${i}: ${comment || '(No comment - frequency limit)'}`);
  }
  
  console.log('\n');
  console.log('Test 2: Repetition Penalty');
  console.log('----------------------------------------');
  
  // Reset for clean test
  rlCommentary.reset();
  
  // Force similar comments to test repetition penalty
  const sameTag: Tags = {
    moveQuality: 0.8,
    suggestion: 'Excellent! Continue with tactical play'
  };
  
  for (let i = 1; i <= 15; i++) {
    const comment = await rlCommentary.generateCommentary(earlyGameState, sameTag);
    if (comment) {
      console.log(`Move ${i}: "${comment}"`);
    }
  }
  
  console.log('\n');
  console.log('Test 3: Relevance Rewards');
  console.log('----------------------------------------');
  
  // Reset for clean test
  rlCommentary.reset();
  
  // Test relevance in different game phases
  const testCases = [
    {
      state: earlyGameState,
      tags: { moveQuality: 0.6, suggestion: 'Complete piece development' } as Tags,
      phase: 'Early game + development'
    },
    {
      state: checkState,
      tags: { moveQuality: 0.3, suggestion: 'Improve king safety immediately' } as Tags,
      phase: 'Check + king safety'
    },
    {
      state: midGameState,
      tags: { moveQuality: 0.7, suggestion: 'Good position, maintain pressure' } as Tags,
      phase: 'Mid game + pressure'
    }
  ];
  
  for (let i = 0; i < testCases.length; i++) {
    // Skip moves to hit frequency limit
    for (let j = 0; j < 4; j++) {
      await rlCommentary.generateCommentary(testCases[i].state, testCases[i].tags);
    }
    // This should generate a comment (5th move)
    const comment = await rlCommentary.generateCommentary(testCases[i].state, testCases[i].tags);
    console.log(`${testCases[i].phase}: "${comment}"`);
  }
  
  console.log('\n');
  console.log('Test 4: RL Model Statistics');
  console.log('----------------------------------------');
  
  const stats = rlCommentary.getStats();
  console.log('Commentary Stats:', stats);
  
  console.log('\n✅ RL System Test Complete!');
  console.log('\nAvailable console commands:');
  console.log('  • generateCommentary() - Generate single commentary');
  console.log('  • rlCommentaryStats() - View system statistics');
  console.log('  • resetRLCommentary() - Reset the system');
  
  return true;
}

// Make available in console
if (typeof window !== 'undefined') {
  (window as any).testRLSystem = testRLSystem;
}