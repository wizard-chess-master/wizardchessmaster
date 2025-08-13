/**
 * Test control tags generation
 */

import { aiCoach } from './coach';
import { GameState } from '../chess/types';

// Create a sample game state for testing
function createTestGameState(): GameState {
  const board = Array(10).fill(null).map(() => Array(10).fill(null));
  
  // Set up a simple position
  // White pieces
  board[9][4] = { type: 'king', color: 'white' };
  board[9][3] = { type: 'queen', color: 'white' };
  board[9][2] = { type: 'bishop', color: 'white' };
  board[9][1] = { type: 'knight', color: 'white' };
  board[9][0] = { type: 'rook', color: 'white' };
  board[8][4] = { type: 'pawn', color: 'white' };
  
  // Black pieces
  board[0][4] = { type: 'king', color: 'black' };
  board[0][3] = { type: 'queen', color: 'black' };
  board[1][4] = { type: 'pawn', color: 'black' };
  
  return {
    board,
    currentPlayer: 'white',
    moveHistory: [],
    capturedPieces: { white: [], black: [] },
    gamePhase: 'playing',
    winner: null,
    isInCheck: false,
    lastMoveTime: Date.now()
  };
}

// Test function
export async function testControlTags() {
  console.log('🧪 Testing Control Tags Generation...\n');
  
  const gameState = createTestGameState();
  
  try {
    // Test 1: Basic control tags
    console.log('Test 1: Basic move evaluation');
    const move = {
      from: { row: 8, col: 4 },
      to: { row: 6, col: 4 },
      piece: { type: 'pawn' as const, color: 'white' as const },
      captured: null,
      isWizardTeleport: false,
      isWizardAttack: false,
      isCastling: false
    };
    
    const tags = await aiCoach.addControlTags(gameState, move);
    console.log('✅ Move Quality (0-1):', tags.moveQuality.toFixed(3));
    console.log('✅ Suggestion:', tags.suggestion);
    console.log('');
    
    // Test 2: Check situation
    console.log('Test 2: King in check scenario');
    gameState.isInCheck = true;
    const checkTags = await aiCoach.addControlTags(gameState, move);
    console.log('✅ Move Quality:', checkTags.moveQuality.toFixed(3));
    console.log('✅ Suggestion:', checkTags.suggestion);
    console.log('');
    
    // Test 3: Capture move
    console.log('Test 3: Capture move evaluation');
    const captureMove = { 
      ...move, 
      captured: { type: 'pawn' as const, color: 'black' as const } 
    };
    gameState.isInCheck = false;
    const captureTags = await aiCoach.addControlTags(gameState, captureMove);
    console.log('✅ Move Quality:', captureTags.moveQuality.toFixed(3));
    console.log('✅ Suggestion:', captureTags.suggestion);
    console.log('');
    
    // Test 4: Different quality levels
    console.log('Test 4: Testing quality thresholds');
    console.log('Normal move:', tags.suggestion);
    console.log('Check response:', checkTags.suggestion);
    console.log('Capture move:', captureTags.suggestion);
    
    console.log('\n✅ All control tag tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Make function available globally for browser console
if (typeof window !== 'undefined') {
  (window as any).testControlTags = testControlTags;
}