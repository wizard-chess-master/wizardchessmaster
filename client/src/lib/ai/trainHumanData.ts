/**
 * Training module for learning from human game data
 * Processes PostgreSQL human_games data to train TensorFlow.js model
 */

import * as tf from '@tensorflow/tfjs';
import { GameState, ChessMove } from '../chess/types';
import { aiCoach } from './coach';

// Encode game state to numerical features
function encodeState(state: GameState): number[] {
  const features: number[] = [];
  
  // Board encoding (100 features for 10x10 board)
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const piece = state.board[row][col];
      if (!piece) {
        features.push(0);
      } else {
        // Encode piece type and color
        const pieceValues: Record<string, number> = {
          'pawn': 1, 'knight': 2, 'bishop': 3, 'rook': 4, 
          'queen': 5, 'wizard': 6, 'king': 7
        };
        const value = pieceValues[piece.type] || 0;
        features.push(piece.color === 'white' ? value : -value);
      }
    }
  }
  
  // Additional features
  features.push(state.currentPlayer === 'white' ? 1 : -1); // Current player
  features.push(state.isInCheck ? 1 : 0); // Check status
  features.push(state.moveHistory.length / 100); // Normalized move count
  // Count captured pieces from board (since GameState doesn't have capturedPieces)
  let whitePieces = 0, blackPieces = 0;
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const piece = state.board[row][col];
      if (piece) {
        if (piece.color === 'white') whitePieces++;
        else blackPieces++;
      }
    }
  }
  features.push((16 - blackPieces) / 15); // Estimated white captures
  features.push((16 - whitePieces) / 15); // Estimated black captures
  
  // Pad to ensure consistent input size
  while (features.length < 105) {
    features.push(0);
  }
  
  return features.slice(0, 105); // Ensure exactly 105 features
}

// Convert suggestion tag to numerical index
function tagToIndex(suggestion: string): number {
  const tagMap: Record<string, number> = {
    'Improve king safety immediately': 0,
    'Strengthen your pawn structure': 1,
    'Complete piece development': 2,
    'Consider defensive moves to protect your pieces': 3,
    'Look for better piece coordination': 4,
    'Good position, maintain pressure': 5,
    'Excellent! Continue with tactical play': 6,
    'Consider tactical play': 7
  };
  return tagMap[suggestion] || 7; // Default to 'Consider tactical play'
}

// Train model on human game data
export async function trainOnHumanData() {
  console.log('🎓 Starting training on human game data...');
  
  try {
    // Fetch human games from server
    const response = await fetch('/api/training/human-games');
    if (!response.ok) {
      throw new Error('Failed to fetch human game data');
    }
    
    const games = await response.json();
    console.log(`📊 Loaded ${games.length} human games for training`);
    
    // Process games and create training dataset
    const dataset: { input: number[], label: number[] }[] = [];
    let processedGames = 0;
    
    for (const game of games) {
      try {
        // Parse game state and moves
        const gameState = game.game_state as GameState;
        const moves = game.moves as ChessMove[];
        
        // Skip games with invalid data
        if (!gameState || !moves || moves.length === 0) {
          continue;
        }
        
        // Process each move in the game
        let currentState = gameState;
        for (const move of moves) {
          // Get control tags for this position and move
          const tags = await aiCoach.addControlTags(currentState, move);
          
          // Create training sample
          const input = encodeState(currentState);
          const label = [
            tags.moveQuality, // Move quality (0-1)
            tagToIndex(tags.suggestion) / 7 // Normalized suggestion index (0-1)
          ];
          
          dataset.push({ input, label });
          
          // Update state (simplified - in practice would use makeMove)
          currentState = {
            ...currentState,
            moveHistory: [...currentState.moveHistory, move]
          };
        }
        
        processedGames++;
        if (processedGames % 10 === 0) {
          console.log(`   Processed ${processedGames} games...`);
        }
      } catch (error) {
        console.warn('Failed to process game:', error);
      }
    }
    
    console.log(`✅ Processed ${processedGames} games, ${dataset.length} training samples`);
    
    if (dataset.length === 0) {
      throw new Error('No valid training data found');
    }
    
    // Create and compile model
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ 
          units: 128, 
          activation: 'relu', 
          inputShape: [105],
          kernelInitializer: 'glorotUniform'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ 
          units: 64, 
          activation: 'relu',
          kernelInitializer: 'glorotUniform'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ 
          units: 32, 
          activation: 'relu',
          kernelInitializer: 'glorotUniform'
        }),
        tf.layers.dense({ 
          units: 2, 
          activation: 'sigmoid' // Sigmoid for 0-1 output range
        })
      ]
    });
    
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['accuracy']
    });
    
    console.log('📚 Model architecture:');
    model.summary();
    
    // Prepare tensors
    const inputs = tf.tensor2d(dataset.map(d => d.input));
    const labels = tf.tensor2d(dataset.map(d => d.label));
    
    // Split into train/validation (80/20)
    const splitIdx = Math.floor(dataset.length * 0.8);
    const trainInputs = inputs.slice([0, 0], [splitIdx, -1]);
    const trainLabels = labels.slice([0, 0], [splitIdx, -1]);
    const valInputs = inputs.slice([splitIdx, 0], [-1, -1]);
    const valLabels = labels.slice([splitIdx, 0], [-1, -1]);
    
    // Train the model
    console.log('🏋️ Training model...');
    const history = await model.fit(trainInputs, trainLabels, {
      epochs: 20,
      batchSize: 32,
      validationData: [valInputs, valLabels],
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`   Epoch ${epoch + 1}/20 - Loss: ${logs?.loss?.toFixed(4)}, Val Loss: ${logs?.val_loss?.toFixed(4)}`);
        }
      }
    });
    
    // Clean up tensors
    inputs.dispose();
    labels.dispose();
    trainInputs.dispose();
    trainLabels.dispose();
    valInputs.dispose();
    valLabels.dispose();
    
    // Save model to browser storage
    await model.save('localstorage://wizard-chess-human-trained-model');
    console.log('💾 Model saved to browser storage');
    
    // Store model globally for use
    (window as any).humanTrainedModel = model;
    
    console.log('\n✅ Training complete!');
    console.log(`   Final loss: ${history.history.loss[history.history.loss.length - 1]}`);
    console.log(`   Final validation loss: ${history.history.val_loss[history.history.val_loss.length - 1]}`);
    console.log('   Model available as window.humanTrainedModel');
    
    return model;
    
  } catch (error) {
    console.error('❌ Training failed:', error);
    throw error;
  }
}

// Test the trained model
export async function testHumanTrainedModel(gameState: GameState, move: ChessMove) {
  const model = (window as any).humanTrainedModel;
  if (!model) {
    console.error('No trained model found. Run trainOnHumanData() first.');
    return null;
  }
  
  const input = tf.tensor2d([encodeState(gameState)]);
  const prediction = model.predict(input) as tf.Tensor;
  const result = await prediction.array() as number[][];
  input.dispose();
  prediction.dispose();
  
  const [moveQuality, suggestionIndex] = result[0];
  const suggestions = [
    'Improve king safety immediately',
    'Strengthen your pawn structure',
    'Complete piece development',
    'Consider defensive moves to protect your pieces',
    'Look for better piece coordination',
    'Good position, maintain pressure',
    'Excellent! Continue with tactical play',
    'Consider tactical play'
  ];
  
  return {
    moveQuality: moveQuality,
    suggestion: suggestions[Math.round(suggestionIndex * 7)]
  };
}

// Export for console access
if (typeof window !== 'undefined') {
  (window as any).trainOnHumanData = trainOnHumanData;
  (window as any).testHumanTrainedModel = testHumanTrainedModel;
}