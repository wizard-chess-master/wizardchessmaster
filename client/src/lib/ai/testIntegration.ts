/**
 * Test Integration: RL Commentary with useDynamicAIMentor
 * Simulates a game and generates commentary for 5 moves
 */

import { useChess } from '../stores/useChess';
import { useDynamicAIMentor } from '../stores/useDynamicAIMentor';
import { Position } from '../chess/types';

export async function simulateGameWithCommentary() {
  console.log('🎮 Starting Game Simulation with RL Commentary Integration\n');
  console.log('═══════════════════════════════════════════════════════\n');
  
  // Initialize the game
  const chessStore = useChess.getState();
  const mentorStore = useDynamicAIMentor.getState();
  
  // Start a new AI game
  chessStore.startGame('ai', 'medium');
  
  // Activate the mentor
  mentorStore.activateMentor();
  
  console.log('✅ Game initialized: AI mode, Medium difficulty');
  console.log('✅ AI Mentor activated\n');
  
  // Predefined moves to simulate
  const moves: Array<{ from: Position, to: Position, description: string }> = [
    { from: { row: 8, col: 4 }, to: { row: 6, col: 4 }, description: 'White pawn e2 to e4' },
    { from: { row: 8, col: 3 }, to: { row: 6, col: 3 }, description: 'White pawn d2 to d4' },
    { from: { row: 9, col: 1 }, to: { row: 7, col: 2 }, description: 'White knight b1 to c3' },
    { from: { row: 9, col: 2 }, to: { row: 8, col: 3 }, description: 'White bishop c1 to d2' },
    { from: { row: 9, col: 4 }, to: { row: 8, col: 4 }, description: 'White queen d1 to d2' }
  ];
  
  console.log('🎯 Simulating 5 moves with RL commentary:\n');
  
  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    console.log(`\n───── Move ${i + 1} ─────`);
    console.log(`📍 ${move.description}`);
    
    // Make the move
    await chessStore.makePlayerMove(move.from, move.to);
    
    // Wait a bit for async operations
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Get current feedback from mentor
    const currentFeedback = mentorStore.currentFeedback;
    const latestFeedback = currentFeedback[currentFeedback.length - 1];
    
    if (latestFeedback) {
      console.log(`💬 Commentary: "${latestFeedback.message}"`);
      console.log(`📊 Priority: ${latestFeedback.priority}`);
      console.log(`📈 Context:`, latestFeedback.context);
    } else {
      console.log('⏸️ No commentary (frequency limit or processing)');
    }
    
    // Check RL stats
    const rlStats = (window as any).rlCommentaryStats();
    console.log(`📉 RL Stats: Comments: ${rlStats.totalComments}, History: ${rlStats.historySize}`);
    
    // Small delay between moves
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('✅ Simulation Complete!\n');
  
  // Final statistics
  const finalStats = (window as any).rlCommentaryStats();
  const mentorAnalytics = mentorStore.analytics;
  
  console.log('📊 Final Statistics:');
  console.log('   RL System:');
  console.log(`     • Total comments generated: ${finalStats.totalComments}`);
  console.log(`     • Comment history size: ${finalStats.historySize}`);
  console.log(`     • Model ready: ${finalStats.modelReady}`);
  console.log('   Mentor System:');
  console.log(`     • Current game score: ${mentorAnalytics.currentGameScore}`);
  console.log(`     • Move quality: ${mentorAnalytics.moveQuality}`);
  console.log(`     • Learning progress: ${mentorAnalytics.learningProgress}%`);
  
  console.log('\n💡 The RL system generates commentary every 5 moves');
  console.log('   with relevance rewards and repetition penalties.');
  
  return true;
}

// Make available in console
if (typeof window !== 'undefined') {
  (window as any).simulateGameWithCommentary = simulateGameWithCommentary;
}