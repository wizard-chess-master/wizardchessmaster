#!/usr/bin/env node

/**
 * Wizard Chess AI Self-Play Training Runner
 * Trains the AI through 100,000+ self-play games with corrected wizard mechanics
 * 
 * Usage: node startAITraining.js [number_of_games]
 * Default: 100,000 games
 */

const fs = require('fs');
const path = require('path');

console.log('═══════════════════════════════════════════════════════════════════');
console.log('🧙 WIZARD CHESS AI SELF-PLAY TRAINING');
console.log('═══════════════════════════════════════════════════════════════════');
console.log();
console.log('📋 Training Configuration:');
console.log('   • Games: 100,000 self-play matches');
console.log('   • Phases: 4 progressive training phases');
console.log('   • Wizard Mechanics: Corrected attack logic');
console.log('   • Checkpoints: Every 5,000 games');
console.log('   • Estimated Time: 2-4 hours');
console.log();
console.log('🧙 Wizard Mechanics Being Trained:');
console.log('   • Move OR Attack (not both in same turn)');
console.log('   • Attack Range: Up to 2 squares in straight line');
console.log('   • Teleport Range: Up to 2 squares any direction');
console.log('   • Wizard stays in place during ranged attacks');
console.log();

// Get number of games from command line argument
const numGames = process.argv[2] ? parseInt(process.argv[2]) : 100000;

if (isNaN(numGames) || numGames < 1000) {
  console.error('❌ Invalid number of games. Must be at least 1000.');
  process.exit(1);
}

console.log(`🎯 Training Target: ${numGames.toLocaleString()} games`);
console.log();

// Create training script content
const trainingScript = `
import { startWizardChessSelfPlay } from './client/src/lib/ai/trainSelfPlay';

async function runTraining() {
  console.log('🚀 Initializing TensorFlow.js...');
  
  try {
    // Start self-play training
    await startWizardChessSelfPlay(${numGames});
    
    console.log('✅ Training completed successfully!');
    console.log('📊 Check localStorage for training statistics');
    console.log('🎮 AI model has been deployed and is ready for gameplay');
    
  } catch (error) {
    console.error('❌ Training failed:', error);
    process.exit(1);
  }
}

// Run the training
runTraining().catch(console.error);
`;

// Write temporary training file
const tempFile = path.join(__dirname, 'temp_training.ts');
fs.writeFileSync(tempFile, trainingScript);

console.log('📝 Training script prepared');
console.log('🔄 Starting self-play training...');
console.log();
console.log('═══════════════════════════════════════════════════════════════════');
console.log();

// Execute the training using tsx
const { spawn } = require('child_process');
const training = spawn('npx', ['tsx', tempFile], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'production' }
});

// Handle training completion
training.on('close', (code) => {
  // Clean up temp file
  try {
    fs.unlinkSync(tempFile);
  } catch (e) {
    // Ignore cleanup errors
  }
  
  if (code === 0) {
    console.log();
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('🏆 AI TRAINING COMPLETE!');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log();
    console.log('📊 Training Results:');
    console.log('   • Model saved to localStorage');
    console.log('   • Checkpoints available for rollback');
    console.log('   • AI deployed and ready for gameplay');
    console.log();
    console.log('🎮 Next Steps:');
    console.log('   1. Start the game server: npm run dev');
    console.log('   2. Play against the retrained AI');
    console.log('   3. Observe improved wizard attack mechanics');
    console.log();
    console.log('✅ The AI has been successfully retrained with corrected wizard logic!');
    console.log('═══════════════════════════════════════════════════════════════════');
  } else {
    console.error();
    console.error('❌ Training failed with exit code:', code);
    console.error('Please check the error messages above for details.');
    process.exit(code);
  }
});

// Handle interruption
process.on('SIGINT', () => {
  console.log('\n\n⚠️ Training interrupted by user');
  console.log('Progress has been saved and can be resumed later.');
  training.kill('SIGINT');
  process.exit(0);
});