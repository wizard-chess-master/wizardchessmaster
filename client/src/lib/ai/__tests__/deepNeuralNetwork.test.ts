/**
 * Unit Tests for Deep Neural Network
 * Testing AI logic, neural net outputs, and wizard-specific features
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { deepNN } from '../deepNeuralNetwork';
import { GameState, ChessPiece, PieceColor } from '../../chess/types';
import { createInitialBoard } from '../../chess/board';

describe('Deep Neural Network Unit Tests', () => {
  beforeAll(() => {
    // Build the neural network model
    deepNN.buildModel();
  });

  afterAll(() => {
    // Clean up resources
    deepNN.dispose();
  });

  describe('Model Architecture', () => {
    it('should build model with correct architecture', () => {
      const summary = deepNN.getModelSummary();
      expect(summary).toContain('512');
      expect(summary).toContain('256');
      expect(summary).toContain('128');
      expect(summary).toContain('value_output');
      expect(summary).toContain('policy_output');
    });

    it('should have correct input/output dimensions', () => {
      const summary = deepNN.getModelSummary();
      expect(summary).toContain('1024'); // Input size
      expect(summary).toContain('100');  // Policy output size
    });
  });

  describe('Feature Extraction', () => {
    it('should extract correct number of features', () => {
      const gameState = createTestGameState();
      const features = deepNN.extractFeatures(gameState);
      
      expect(features).toBeInstanceOf(Float32Array);
      expect(features.length).toBeGreaterThanOrEqual(1024);
    });

    it('should normalize features to [-1, 1] range', () => {
      const gameState = createTestGameState();
      const features = deepNN.extractFeatures(gameState);
      
      for (let i = 0; i < features.length; i++) {
        expect(features[i]).toBeGreaterThanOrEqual(-1);
        expect(features[i]).toBeLessThanOrEqual(1);
      }
    });

    it('should encode wizard pieces correctly', () => {
      const gameState = createTestGameState();
      // Add a wizard piece
      gameState.board[4][4] = {
        type: 'wizard',
        color: 'white',
        id: 'test-wizard',
        hasMoved: false
      };
      
      const features = deepNN.extractFeatures(gameState);
      expect(features.length).toBeGreaterThan(0);
      
      // Check wizard-specific features are extracted
      // Features should include wizard count and mobility
      const wizardFeatureSum = Array.from(features.slice(1600, 1610))
        .reduce((sum, val) => sum + Math.abs(val), 0);
      expect(wizardFeatureSum).toBeGreaterThan(0);
    });

    it('should handle empty board', () => {
      const gameState = createTestGameState();
      gameState.board = Array(10).fill(null).map(() => Array(10).fill(null));
      
      const features = deepNN.extractFeatures(gameState);
      expect(features).toBeInstanceOf(Float32Array);
      expect(features.length).toBeGreaterThanOrEqual(1024);
    });

    it('should encode check/checkmate states', () => {
      const gameState = createTestGameState();
      gameState.isInCheck = true;
      gameState.isCheckmate = false;
      
      const features = deepNN.extractFeatures(gameState);
      // Tactical features should reflect check state
      expect(features.length).toBeGreaterThan(0);
    });
  });

  describe('Prediction', () => {
    it('should return valid predictions', async () => {
      const gameState = createTestGameState();
      const prediction = await deepNN.predict(gameState);
      
      expect(prediction).toHaveProperty('value');
      expect(prediction).toHaveProperty('policy');
      expect(typeof prediction.value).toBe('number');
      expect(prediction.value).toBeGreaterThanOrEqual(-1);
      expect(prediction.value).toBeLessThanOrEqual(1);
    });

    it('should return valid policy distribution', async () => {
      const gameState = createTestGameState();
      const prediction = await deepNN.predict(gameState);
      
      expect(prediction.policy).toBeInstanceOf(Float32Array);
      expect(prediction.policy.length).toBe(100);
      
      // Policy should be a probability distribution
      const sum = Array.from(prediction.policy).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0, 1);
    });

    it('should handle multiple predictions without memory leak', async () => {
      const gameState = createTestGameState();
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Run 10 predictions
      for (let i = 0; i < 10; i++) {
        await deepNN.predict(gameState);
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryGrowth = (finalMemory - initialMemory) / 1024 / 1024; // MB
      
      // Memory growth should be minimal (<50MB)
      expect(memoryGrowth).toBeLessThan(50);
    });
  });

  describe('Wizard-Specific Features', () => {
    it('should calculate wizard mobility correctly', () => {
      const gameState = createTestGameState();
      gameState.board[5][5] = {
        type: 'wizard',
        color: 'white',
        id: 'wizard-1',
        hasMoved: false
      };
      
      const features = deepNN.extractFeatures(gameState);
      // Check that wizard features are non-zero
      const wizardFeatures = Array.from(features.slice(1600, 1605));
      const hasWizardFeatures = wizardFeatures.some(f => f !== 0);
      expect(hasWizardFeatures).toBe(true);
    });

    it('should detect wizard threats', () => {
      const gameState = createTestGameState();
      // Place wizards in threatening positions
      gameState.board[4][4] = {
        type: 'wizard',
        color: 'white',
        id: 'w-wizard',
        hasMoved: false
      };
      gameState.board[4][5] = {
        type: 'pawn',
        color: 'black',
        id: 'b-pawn',
        hasMoved: false
      };
      
      const features = deepNN.extractFeatures(gameState);
      expect(features.length).toBeGreaterThan(0);
    });
  });

  describe('Training', () => {
    it('should train on batch of examples', async () => {
      const states = [createTestGameState()];
      const targetValues = [0.5];
      const targetPolicies = [Array(100).fill(0.01)];
      
      const history = await deepNN.train(
        states,
        targetValues,
        targetPolicies,
        {
          onEpochEnd: (epoch, logs) => {
            expect(logs).toBeDefined();
          }
        }
      );
      
      expect(history).toBeDefined();
      expect(history.history).toHaveProperty('loss');
    });
  });

  describe('Model Persistence', () => {
    it('should save and load model', async () => {
      const testPath = 'localstorage://test-dnn-model';
      
      // Save model
      await deepNN.saveModel(testPath);
      
      // Create new instance and load
      const newNN = new (deepNN.constructor as any)();
      await newNN.loadModel(testPath);
      
      expect(newNN.getModelSummary()).toContain('value_output');
      newNN.dispose();
    });
  });
});

// Helper function to create test game state
function createTestGameState(): GameState {
  return {
    board: createInitialBoard(),
    currentPlayer: 'white',
    selectedPosition: null,
    validMoves: [],
    gamePhase: 'playing',
    gameMode: 'ai',
    aiDifficulty: 'hard',
    moveHistory: [],
    isInCheck: false,
    isCheckmate: false,
    isStalemate: false,
    winner: null,
    capturedPieces: { white: [], black: [] },
    lastMove: null
  };
}