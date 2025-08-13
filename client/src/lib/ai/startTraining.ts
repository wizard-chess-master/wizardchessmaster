/**
 * Browser-based launcher for Wizard Chess AI Self-Play Training
 * Run this from the browser console or integrate into the UI
 */

import { WizardChessSelfPlay } from './trainSelfPlay';

// Global training instance
let trainingInstance: WizardChessSelfPlay | null = null;

/**
 * Start the AI self-play training
 * @param games Number of games to train (default 100,000)
 */
export async function startAITraining(games: number = 100000): Promise<void> {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('🧙 WIZARD CHESS AI SELF-PLAY TRAINING');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log();
  console.log('📋 Training Configuration:');
  console.log(`   • Games: ${games.toLocaleString()} self-play matches`);
  console.log('   • Phases: 4 progressive training phases');
  console.log('   • Checkpoints: Every 5,000 games');
  console.log('   • Estimated Time: ${(games / 50000).toFixed(1)}-${(games / 25000).toFixed(1)} hours');
  console.log();
  console.log('🧙 Wizard Mechanics Being Trained:');
  console.log('   • Move OR Attack (not both in same turn)');
  console.log('   • Attack Range: Up to 2 squares in straight line');
  console.log('   • Teleport Range: Up to 2 squares any direction');
  console.log('   • Wizard stays in place during ranged attacks');
  console.log();
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log();
  
  // Check if training is already in progress
  if (trainingInstance) {
    console.warn('⚠️ Training is already in progress!');
    console.log('Use stopAITraining() to stop the current training first.');
    return;
  }
  
  try {
    // Create new training instance
    trainingInstance = new WizardChessSelfPlay();
    
    // Start training
    console.log('🚀 Starting self-play training...');
    await trainingInstance.startTraining(games);
    
    // Training completed
    console.log();
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('🏆 AI TRAINING COMPLETE!');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log();
    console.log('📊 Training Results:');
    console.log('   • Model saved to localStorage');
    console.log('   • AI deployed and ready for gameplay');
    console.log('   • Wizard mechanics fully optimized');
    console.log();
    console.log('🎮 The AI has been successfully retrained!');
    console.log('   Refresh the page to play against the new AI');
    console.log('═══════════════════════════════════════════════════════════════════');
    
  } catch (error) {
    console.error('❌ Training failed:', error);
  } finally {
    trainingInstance = null;
  }
}

/**
 * Stop the current training session
 */
export function stopAITraining(): void {
  if (!trainingInstance) {
    console.log('ℹ️ No training session is currently running.');
    return;
  }
  
  console.log('🛑 Stopping training...');
  trainingInstance.stop();
  trainingInstance = null;
  console.log('✅ Training stopped. Progress has been saved.');
}

/**
 * Get training status
 */
export function getTrainingStatus(): void {
  const progress = localStorage.getItem('wizardChessProgress');
  const finalStats = localStorage.getItem('wizardChessFinalStats');
  
  if (finalStats) {
    const stats = JSON.parse(finalStats);
    console.log('📊 Last Completed Training:');
    console.log(`   • Total Games: ${stats.gamesPlayed}`);
    console.log(`   • White Wins: ${stats.whiteWins}`);
    console.log(`   • Black Wins: ${stats.blackWins}`);
    console.log(`   • Draws: ${stats.draws}`);
    console.log(`   • Wizard Attacks: ${stats.wizardAttacksUsed}`);
    console.log(`   • Wizard Teleports: ${stats.wizardTeleportsUsed}`);
    console.log(`   • Average Game Length: ${stats.averageGameLength?.toFixed(1)} moves`);
  } else if (progress) {
    const stats = JSON.parse(progress);
    console.log('📊 Training In Progress:');
    console.log(`   • Games Played: ${stats.gamesPlayed}`);
    console.log(`   • Current ELO: ${stats.currentElo}`);
  } else {
    console.log('ℹ️ No training data found.');
  }
}

// Make functions available globally for browser console
if (typeof window !== 'undefined') {
  (window as any).startAITraining = startAITraining;
  (window as any).stopAITraining = stopAITraining;
  (window as any).getTrainingStatus = getTrainingStatus;
  
  console.log('🎮 Wizard Chess AI Training Functions Loaded!');
  console.log('   • startAITraining(100000) - Start training with 100k games');
  console.log('   • stopAITraining() - Stop current training');
  console.log('   • getTrainingStatus() - Check training progress');
}

// Export for use in other modules
export default {
  startAITraining,
  stopAITraining,
  getTrainingStatus
};