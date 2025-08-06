// Comprehensive training reset for new board setup and rules
import { aiLearning } from './aiLearning';
import { aiTrainer } from './aiTraining';
import { massTraining } from './massTraining';

export function performComprehensiveTrainingReset(): void {
  console.log('🔄 Starting comprehensive training reset...');
  console.log('📋 This will clear all existing AI learning data for fresh training');
  
  try {
    // Step 1: Reset AI Learning Data
    console.log('🔍 Step 1/4: Resetting AI learning patterns and game history');
    aiLearning.resetLearning();
    
    // Step 2: Reset Training Statistics  
    console.log('🔍 Step 2/4: Clearing training statistics');
    aiTrainer.resetStats();
    
    // Step 3: Clear Local Storage Training Data
    console.log('🔍 Step 3/4: Removing stored training data');
    const keysToRemove = [
      'fantasy-chess-neural-weights',
      'fantasy-chess-learning-data', 
      'fantasy-chess-training-stats',
      'fantasy-chess-strategy-patterns',
      'fantasy-chess-game-patterns',
      'fantasy-chess-mass-training-data'
    ];
    
    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`✅ Cleared ${key}`);
      }
    });
    
    // Step 4: Reset Mass Training Data and Neural Network
    console.log('🔍 Step 4/4: Resetting mass training data and neural network');
    massTraining.resetTrainingData();
    
    console.log('');
    console.log('🎯 TRAINING RESET COMPLETE');
    console.log('✅ All AI learning data cleared');
    console.log('✅ Neural network reset to defaults');
    console.log('✅ Training statistics cleared');
    console.log('✅ Local storage cleaned');
    console.log('');
    console.log('🚀 Ready for fresh training with:');
    console.log('  • New board layout (wizards at d1/g1)');
    console.log('  • Updated castling rules (3-square king movement)');
    console.log('  • Enhanced evaluation (wizard protection, corner rook control)');
    console.log('  • Improved minimax with alpha-beta pruning');
    console.log('');
    
  } catch (error) {
    console.error('❌ Training reset encountered an error:', error);
    console.log('Some manual cleanup may be required');
    throw error;
  }
}

export function confirmAndResetTraining(): boolean {
  const confirmed = confirm(`
🔄 COMPREHENSIVE TRAINING RESET

This will permanently delete ALL existing AI training data:
• 21,000+ analyzed games
• All learning patterns and strategies  
• Neural network weights
• Training statistics

The AI will start learning from scratch with the new board layout and rules.

Are you sure you want to proceed?
  `);
  
  if (confirmed) {
    performComprehensiveTrainingReset();
    return true;
  } else {
    console.log('Training reset cancelled by user');
    return false;
  }
}

// Quick reset function for development/testing
export function quickResetForTesting(): void {
  console.log('🧪 Quick reset for testing...');
  aiLearning.resetLearning();
  aiTrainer.resetStats();
  localStorage.removeItem('fantasy-chess-neural-weights');
  console.log('✅ Quick reset complete - ready for testing');
}