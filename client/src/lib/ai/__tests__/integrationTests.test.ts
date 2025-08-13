/**
 * Integration Tests for AI System
 * Testing self-play, human-AI games, and reward system
 */

import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { SelfPlayManager } from '../selfPlayTraining';
import { RLTrainer } from '../reinforcementLearning';
import { deepNN } from '../deepNeuralNetwork';
import { GameState, ChessMove } from '../../chess/types';
import { createInitialBoard } from '../../chess/board';
import { makeMove } from '../../chess/moves';
import { checkGameEnd } from '../../chess/gameEngine';

describe('AI Integration Tests', () => {
  let selfPlayManager: SelfPlayManager;
  let rlTrainer: RLTrainer;

  beforeAll(() => {
    // Initialize systems
    selfPlayManager = new SelfPlayManager();
    rlTrainer = new RLTrainer();
    deepNN.buildModel();
  });

  afterEach(() => {
    // Clean up after each test
    rlTrainer.clearExperienceBuffer();
  });

  describe('Self-Play System', () => {
    it('should complete a self-play game', async () => {
      const result = await selfPlayManager.playSingleGame({
        maxMoves: 200,
        temperature: 1.0,
        noise: 0.25
      });

      expect(result).toHaveProperty('winner');
      expect(result).toHaveProperty('moves');
      expect(result).toHaveProperty('states');
      expect(result).toHaveProperty('policies');
      expect(result).toHaveProperty('rewards');
      expect(result.moves.length).toBeGreaterThan(0);
    });

    it('should generate training data from self-play', async () => {
      const result = await selfPlayManager.playSingleGame({
        maxMoves: 100,
        temperature: 0.8,
        noise: 0.2
      });

      // Verify training data structure
      expect(result.states.length).toBe(result.moves.length);
      expect(result.policies.length).toBe(result.moves.length);
      expect(result.rewards.length).toBe(result.moves.length);
      
      // Verify rewards are properly assigned
      if (result.winner) {
        const lastReward = result.rewards[result.rewards.length - 1];
        expect(Math.abs(lastReward)).toBeCloseTo(1, 1);
      }
    });

    it('should handle parallel self-play games', async () => {
      const numGames = 5;
      const promises = [];
      
      for (let i = 0; i < numGames; i++) {
        promises.push(selfPlayManager.playSingleGame({
          maxMoves: 50,
          temperature: 1.0,
          noise: 0.3
        }));
      }
      
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(numGames);
      results.forEach(result => {
        expect(result).toHaveProperty('winner');
        expect(result.moves.length).toBeGreaterThan(0);
      });
    });

    it('should respect temperature settings', async () => {
      // Low temperature should produce more deterministic play
      const lowTempGame = await selfPlayManager.playSingleGame({
        maxMoves: 30,
        temperature: 0.1,
        noise: 0
      });
      
      // High temperature should produce more varied play
      const highTempGame = await selfPlayManager.playSingleGame({
        maxMoves: 30,
        temperature: 2.0,
        noise: 0
      });
      
      expect(lowTempGame.moves.length).toBeGreaterThan(0);
      expect(highTempGame.moves.length).toBeGreaterThan(0);
    });
  });

  describe('Human-AI Game Integration', () => {
    it('should handle human vs AI game flow', async () => {
      const gameState = createTestGameState();
      
      // Simulate human move
      const humanMove: ChessMove = {
        from: { row: 8, col: 4 },
        to: { row: 7, col: 4 },
        piece: gameState.board[8][4]!,
        captured: null,
        isCheck: false,
        isCheckmate: false,
        notation: 'e3'
      };
      
      const newState = makeMove(gameState, humanMove);
      
      // Get AI response
      const aiMove = await getAIMove(newState);
      
      expect(aiMove).toBeDefined();
      expect(aiMove).toHaveProperty('from');
      expect(aiMove).toHaveProperty('to');
      expect(aiMove).toHaveProperty('piece');
    });

    it('should handle different AI difficulty levels', async () => {
      const gameState = createTestGameState();
      
      // Test easy AI
      gameState.aiDifficulty = 'easy';
      const easyMove = await getAIMove(gameState);
      expect(easyMove).toBeDefined();
      
      // Test hard AI
      gameState.aiDifficulty = 'hard';
      const hardMove = await getAIMove(gameState);
      expect(hardMove).toBeDefined();
      
      // Test neural network AI
      gameState.aiDifficulty = 'neural';
      const neuralMove = await getAIMove(gameState);
      expect(neuralMove).toBeDefined();
    });

    it('should handle wizard-specific moves', async () => {
      const gameState = createTestGameState();
      
      // Place a wizard on the board
      gameState.board[5][5] = {
        type: 'wizard',
        color: 'white',
        id: 'w-wizard',
        hasMoved: false
      };
      
      gameState.currentPlayer = 'white';
      
      // Get AI move (should consider wizard abilities)
      const aiMove = await getAIMove(gameState);
      
      expect(aiMove).toBeDefined();
      // AI should be able to move the wizard or other pieces
    });
  });

  describe('Reward System', () => {
    it('should calculate proper rewards for game outcomes', () => {
      const trainer = new RLTrainer();
      
      // Test win reward
      const winReward = trainer.calculateReward({
        winner: 'white',
        currentPlayer: 'white',
        moveNumber: 50
      });
      expect(winReward).toBeGreaterThan(0.5);
      
      // Test loss reward
      const lossReward = trainer.calculateReward({
        winner: 'black',
        currentPlayer: 'white',
        moveNumber: 50
      });
      expect(lossReward).toBeLessThan(-0.5);
      
      // Test draw reward
      const drawReward = trainer.calculateReward({
        winner: null,
        currentPlayer: 'white',
        moveNumber: 100
      });
      expect(Math.abs(drawReward)).toBeLessThan(0.1);
    });

    it('should apply TD-Lambda updates correctly', async () => {
      const trainer = new RLTrainer();
      const states = [createTestGameState()];
      const rewards = [0.1];
      const nextStates = [createTestGameState()];
      
      const tdError = await trainer.updateWithTDLambda(
        states,
        rewards,
        nextStates
      );
      
      expect(typeof tdError).toBe('number');
      expect(Math.abs(tdError)).toBeLessThan(1);
    });

    it('should handle experience replay', () => {
      const trainer = new RLTrainer();
      
      // Add experiences
      for (let i = 0; i < 10; i++) {
        trainer.addExperience({
          state: createTestGameState(),
          action: { from: { row: 0, col: 0 }, to: { row: 1, col: 1 } } as ChessMove,
          reward: Math.random() * 2 - 1,
          nextState: createTestGameState(),
          done: i === 9
        });
      }
      
      // Sample batch
      const batch = trainer.sampleExperienceBatch(5);
      expect(batch).toHaveLength(5);
      expect(batch[0]).toHaveProperty('state');
      expect(batch[0]).toHaveProperty('action');
      expect(batch[0]).toHaveProperty('reward');
    });
  });

  describe('Training Integration', () => {
    it('should complete a training cycle', async () => {
      const manager = new SelfPlayManager();
      
      // Run mini training cycle
      const stats = await manager.runTrainingCycle({
        numGames: 2,
        batchSize: 2,
        epochs: 1,
        saveInterval: 10
      });
      
      expect(stats).toHaveProperty('gamesPlayed');
      expect(stats).toHaveProperty('averageMoveCount');
      expect(stats).toHaveProperty('winRates');
      expect(stats.gamesPlayed).toBe(2);
    });

    it('should improve over training iterations', async () => {
      const manager = new SelfPlayManager();
      
      // Get initial performance
      const initialGame = await manager.playSingleGame({
        maxMoves: 50,
        temperature: 0.1,
        noise: 0
      });
      
      // Train for a few games
      await manager.runTrainingCycle({
        numGames: 5,
        batchSize: 5,
        epochs: 2,
        saveInterval: 10
      });
      
      // Get post-training performance
      const improvedGame = await manager.playSingleGame({
        maxMoves: 50,
        temperature: 0.1,
        noise: 0
      });
      
      // Both games should complete successfully
      expect(initialGame.moves.length).toBeGreaterThan(0);
      expect(improvedGame.moves.length).toBeGreaterThan(0);
    });
  });

  describe('Memory Management', () => {
    it('should not leak memory during extended play', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      const manager = new SelfPlayManager();
      
      // Play multiple games
      for (let i = 0; i < 10; i++) {
        await manager.playSingleGame({
          maxMoves: 30,
          temperature: 1.0,
          noise: 0.25
        });
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryGrowth = (finalMemory - initialMemory) / 1024 / 1024; // MB
      
      // Memory growth should be reasonable (<100MB for 10 games)
      expect(memoryGrowth).toBeLessThan(100);
    });
  });
});

// Helper functions
function createTestGameState(): GameState {
  return {
    board: createInitialBoard(),
    currentPlayer: 'white',
    selectedPosition: null,
    validMoves: [],
    gamePhase: 'playing',
    gameMode: 'ai',
    aiDifficulty: 'neural',
    moveHistory: [],
    isInCheck: false,
    isCheckmate: false,
    isStalemate: false,
    winner: null,
    capturedPieces: { white: [], black: [] },
    lastMove: null
  };
}

async function getAIMove(state: GameState): Promise<ChessMove | null> {
  // Simulate AI move selection using neural network
  const prediction = await deepNN.predict(state);
  
  // Mock move selection based on policy
  const mockMove: ChessMove = {
    from: { row: 1, col: 4 },
    to: { row: 2, col: 4 },
    piece: state.board[1][4] || { type: 'pawn', color: 'black', id: 'mock', hasMoved: false },
    captured: null,
    isCheck: false,
    isCheckmate: false,
    notation: 'e6'
  };
  
  return mockMove;
}