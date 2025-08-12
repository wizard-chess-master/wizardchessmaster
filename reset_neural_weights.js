// Script to reset neural network weights and remove skewed training data

console.log('🧹 Resetting neural network weights to remove skewed data from failed tests...');

// Clear the corrupted neural weights from localStorage
if (typeof localStorage !== 'undefined') {
  // Remove the corrupted weights
  localStorage.removeItem('fantasy-chess-neural-weights');
  console.log('✅ Removed corrupted neural weights from failed training sessions');
  
  // Set clean default weights
  const defaultWeights = {
    materialWeight: 1.0,
    positionWeight: 0.3,
    kingSafetyWeight: 0.2,
    mobilityWeight: 0.1
  };
  
  localStorage.setItem('fantasy-chess-neural-weights', JSON.stringify(defaultWeights));
  console.log('✅ Reset to default neural weights:', defaultWeights);
  console.log('🎯 AI is now ready for proper training with clean data!');
} else {
  console.log('❌ localStorage not available in this environment');
  console.log('💡 To reset weights, run this in the browser console:');
  console.log(`
    localStorage.removeItem('fantasy-chess-neural-weights');
    const defaultWeights = {
      materialWeight: 1.0,
      positionWeight: 0.3,
      kingSafetyWeight: 0.2,
      mobilityWeight: 0.1
    };
    localStorage.setItem('fantasy-chess-neural-weights', JSON.stringify(defaultWeights));
    console.log('✅ Neural weights reset successfully!');
  `);
}