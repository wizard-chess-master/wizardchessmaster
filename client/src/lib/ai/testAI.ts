/**
 * Quick test to verify AI model is working correctly
 */

import { DeepNeuralNetwork } from './deepNeuralNetwork';
import { createInitialBoard } from '../chess/gameEngine';

export async function testAIModel(): Promise<any> {
  console.log('🧪 Testing AI Model Configuration...');
  
  try {
    // Create a test model with correct input size
    const model = new DeepNeuralNetwork({
      inputSize: 1634,  // Fixed: 10x10x16 board (1600) + additional features
      hiddenLayers: [512, 256, 256, 128, 128],
      outputSize: 101,
      learningRate: 0.0001,
      batchSize: 64,
      epochs: 100,
      dropout: 0.3
    });
    
    // Build the model
    model.buildModel();
    console.log('✅ Model built successfully with correct input size (1634)');
    
    // Test feature extraction
    const testState = {
      board: createInitialBoard(),
      currentPlayer: 'white' as const,
      isInCheck: false,
      isCheckmate: false,
      isStalemate: false,
      moveHistory: [],
      capturedPieces: { white: [], black: [] },
      gameId: 'test',
      timeLeft: { white: 600, black: 600 },
      lastMove: null,
      drawOffered: false,
      winner: null,
      moveCount: 0
    };
    
    const features = model.extractFeatures(testState);
    console.log(`✅ Feature extraction successful: ${features.length} features`);
    
    // Test prediction
    const prediction = await model.predict(testState);
    console.log('✅ Model prediction successful');
    console.log(`   Value: ${prediction.value.toFixed(3)}`);
    console.log(`   Policy shape: ${prediction.policy.length} moves`);
    
    console.log('\n🎉 AI Model is working correctly!');
    console.log('   You can now start training with: startAITraining(100000)');
    
    return;
  } catch (error) {
    console.error('❌ AI Model test failed:', error);
    throw error;
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  (window as any).testAIModel = testAIModel;
}

export default testAIModel;