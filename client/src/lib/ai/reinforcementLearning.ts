/**
 * Reinforcement Learning System for Wizard Chess Master
 * Implements TD-Lambda, self-play, and experience replay
 */

import { GameState, ChessMove, PieceColor } from '../chess/types';
import { createInitialBoard } from '../chess/board';
import { getAllPossibleMoves } from '../chess/moves';
import { makeMove } from '../chess/gameLogic';

// Hyperparameters for RL
export interface RLConfig {
  alpha: number;          // Learning rate (0.001 - 0.1)
  gamma: number;          // Discount factor (0.9 - 0.99)
  lambda: number;         // TD-Lambda trace decay (0.7 - 0.95)
  epsilon: number;        // Exploration rate (0.1 - 0.3)
  epsilonDecay: number;   // Decay rate for epsilon
  minEpsilon: number;     // Minimum exploration rate
  batchSize: number;      // Experience replay batch size
  bufferSize: number;     // Experience replay buffer size
  updateFrequency: number; // How often to update the network
}

// State-action-reward-state tuple
export interface Experience {
  state: GameState;
  action: ChessMove;
  reward: number;
  nextState: GameState;
  done: boolean;
  value: number;          // State value estimate
  actionProb: number;     // Action probability for importance sampling
}

// Game episode for self-play
export interface Episode {
  id: string;
  states: GameState[];
  actions: ChessMove[];
  rewards: number[];
  winner: PieceColor | 'draw';
  totalMoves: number;
  features: Float32Array[];  // Neural network features for each state
}

// Training statistics
export interface RLStats {
  episodesPlayed: number;
  averageReward: number;
  winRate: { white: number; black: number; draw: number };
  averageGameLength: number;
  explorationRate: number;
  lossHistory: number[];
  valueAccuracy: number;
  policyEntropy: number;  // Measure of exploration diversity
}

export class ReinforcementLearningSystem {
  private config: RLConfig;
  private experienceBuffer: Experience[] = [];
  private eligibilityTraces: Map<string, number> = new Map();
  private valueFunction: Map<string, number> = new Map();
  private stats: RLStats;
  private neuralNetwork: any; // Will be replaced with TensorFlow.js model
  
  constructor(config?: Partial<RLConfig>) {
    this.config = {
      alpha: 0.01,
      gamma: 0.95,
      lambda: 0.9,
      epsilon: 0.2,
      epsilonDecay: 0.995,
      minEpsilon: 0.05,
      batchSize: 32,
      bufferSize: 100000,
      updateFrequency: 100,
      ...config
    };
    
    this.stats = {
      episodesPlayed: 0,
      averageReward: 0,
      winRate: { white: 0, black: 0, draw: 0 },
      averageGameLength: 0,
      explorationRate: this.config.epsilon,
      lossHistory: [],
      valueAccuracy: 0,
      policyEntropy: 0
    };
  }
  
  /**
   * Run a self-play episode
   */
  async runSelfPlayEpisode(): Promise<Episode> {
    const episode: Episode = {
      id: `episode_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      states: [],
      actions: [],
      rewards: [],
      winner: 'draw',
      totalMoves: 0,
      features: []
    };
    
    let gameState = this.createInitialGameState();
    let moveCount = 0;
    const maxMoves = 200; // Prevent infinite games
    
    while (gameState.gamePhase === 'playing' && moveCount < maxMoves) {
      // Store current state
      episode.states.push({ ...gameState });
      
      // Get action using epsilon-greedy policy
      const action = await this.selectAction(gameState);
      if (!action) break;
      
      episode.actions.push(action);
      
      // Execute move
      const nextState = this.executeMove(gameState, action);
      
      // Calculate immediate reward
      const reward = this.calculateReward(gameState, action, nextState);
      episode.rewards.push(reward);
      
      // Store experience
      this.addExperience({
        state: gameState,
        action,
        reward,
        nextState,
        done: nextState.gamePhase === 'ended',
        value: this.getStateValue(gameState),
        actionProb: this.getActionProbability(gameState, action)
      });
      
      // Update state
      gameState = nextState;
      moveCount++;
      
      // Update TD-Lambda values every N moves
      if (moveCount % 10 === 0) {
        this.updateTDLambda(episode);
      }
    }
    
    // Determine winner and assign final rewards
    episode.winner = gameState.winner || 'draw';
    episode.totalMoves = moveCount;
    this.assignFinalRewards(episode);
    
    // Update statistics
    this.updateStats(episode);
    
    // Decay exploration rate
    this.config.epsilon = Math.max(
      this.config.minEpsilon,
      this.config.epsilon * this.config.epsilonDecay
    );
    
    return episode;
  }
  
  /**
   * Select action using epsilon-greedy policy with noise injection
   */
  private async selectAction(state: GameState): Promise<ChessMove | null> {
    const moves = getAllPossibleMoves(state, state.currentPlayer);
    if (moves.length === 0) return null;
    
    // Exploration: random move
    if (Math.random() < this.config.epsilon) {
      // Add Dirichlet noise for better exploration (like AlphaZero)
      const noiseWeights = this.generateDirichletNoise(moves.length, 0.3);
      const selectedIndex = this.sampleFromDistribution(noiseWeights);
      return moves[selectedIndex];
    }
    
    // Exploitation: best move according to value function
    let bestMove = moves[0];
    let bestValue = -Infinity;
    
    for (const move of moves) {
      const nextState = this.executeMove(state, move);
      const value = this.getStateValue(nextState) + this.getActionBonus(state, move);
      
      if (value > bestValue) {
        bestValue = value;
        bestMove = move;
      }
    }
    
    return bestMove;
  }
  
  /**
   * Calculate immediate reward for a move
   */
  private calculateReward(state: GameState, action: ChessMove, nextState: GameState): number {
    let reward = 0;
    
    // Basic rewards
    if (nextState.gamePhase === 'ended') {
      if (nextState.winner === state.currentPlayer) {
        reward = 1.0; // Win
      } else if (nextState.winner) {
        reward = -1.0; // Loss
      } else {
        reward = 0.0; // Draw
      }
    } else {
      // Intermediate rewards to guide learning
      
      // Material difference
      const materialDiff = this.evaluateMaterial(nextState) - this.evaluateMaterial(state);
      reward += materialDiff * 0.01;
      
      // Check bonus
      if (nextState.isInCheck) {
        reward += 0.05;
      }
      
      // Center control bonus
      if (this.isCenter(action.to)) {
        reward += 0.02;
      }
      
      // Wizard ability usage bonus
      if (action.piece.type === 'wizard' && (action.isWizardTeleport || action.isWizardAttack)) {
        reward += 0.03;
      }
      
      // Piece development bonus (early game)
      if (state.moveHistory.length < 20) {
        if (action.piece.type !== 'pawn' && !action.piece.hasMoved) {
          reward += 0.02;
        }
      }
    }
    
    return reward;
  }
  
  /**
   * TD-Lambda update with eligibility traces
   */
  private updateTDLambda(episode: Episode): void {
    const states = episode.states;
    const rewards = episode.rewards;
    
    // Reset eligibility traces
    this.eligibilityTraces.clear();
    
    for (let t = 0; t < states.length - 1; t++) {
      const state = states[t];
      const stateKey = this.getStateKey(state);
      
      // Update eligibility trace
      this.eligibilityTraces.set(stateKey, 
        (this.eligibilityTraces.get(stateKey) || 0) * this.config.gamma * this.config.lambda + 1
      );
      
      // Calculate TD error
      const currentValue = this.getStateValue(state);
      const nextValue = t < states.length - 1 ? this.getStateValue(states[t + 1]) : 0;
      const tdError = rewards[t] + this.config.gamma * nextValue - currentValue;
      
      // Update all states in eligibility trace
      for (const [key, trace] of this.eligibilityTraces.entries()) {
        const oldValue = this.valueFunction.get(key) || 0;
        const newValue = oldValue + this.config.alpha * tdError * trace;
        this.valueFunction.set(key, newValue);
      }
    }
  }
  
  /**
   * Experience replay training
   */
  async trainOnBatch(): Promise<number> {
    if (this.experienceBuffer.length < this.config.batchSize) {
      return 0;
    }
    
    // Sample batch from experience buffer
    const batch = this.sampleExperienceBatch(this.config.batchSize);
    let totalLoss = 0;
    
    for (const exp of batch) {
      // Calculate target value
      const target = exp.done 
        ? exp.reward 
        : exp.reward + this.config.gamma * this.getStateValue(exp.nextState);
      
      // Calculate loss
      const prediction = this.getStateValue(exp.state);
      const loss = Math.pow(target - prediction, 2);
      totalLoss += loss;
      
      // Update value function
      const stateKey = this.getStateKey(exp.state);
      const currentValue = this.valueFunction.get(stateKey) || 0;
      const newValue = currentValue + this.config.alpha * (target - prediction);
      this.valueFunction.set(stateKey, newValue);
    }
    
    return totalLoss / batch.length;
  }
  
  /**
   * Generate Dirichlet noise for exploration (like AlphaZero)
   */
  private generateDirichletNoise(size: number, alpha: number): number[] {
    const noise: number[] = [];
    let sum = 0;
    
    // Generate gamma-distributed random variables
    for (let i = 0; i < size; i++) {
      const gamma = this.sampleGamma(alpha);
      noise.push(gamma);
      sum += gamma;
    }
    
    // Normalize to create Dirichlet distribution
    return noise.map(n => n / sum);
  }
  
  /**
   * Sample from Gamma distribution (for Dirichlet noise)
   */
  private sampleGamma(alpha: number): number {
    // Marsaglia and Tsang method
    const d = alpha - 1/3;
    const c = 1 / Math.sqrt(9 * d);
    
    while (true) {
      const x = this.gaussianRandom();
      const v = Math.pow(1 + c * x, 3);
      
      if (v > 0) {
        const u = Math.random();
        if (u < 1 - 0.0331 * Math.pow(x, 4)) {
          return d * v;
        }
        if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
          return d * v;
        }
      }
    }
  }
  
  /**
   * Gaussian random number generator (Box-Muller transform)
   */
  private gaussianRandom(): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }
  
  /**
   * Sample from a probability distribution
   */
  private sampleFromDistribution(weights: number[]): number {
    const sum = weights.reduce((a, b) => a + b, 0);
    const normalized = weights.map(w => w / sum);
    const random = Math.random();
    
    let cumulative = 0;
    for (let i = 0; i < normalized.length; i++) {
      cumulative += normalized[i];
      if (random < cumulative) {
        return i;
      }
    }
    
    return normalized.length - 1;
  }
  
  /**
   * Helper methods
   */
  private getStateKey(state: GameState): string {
    // Create a unique key for the state (simplified - should use Zobrist hashing)
    return JSON.stringify(state.board.map(row => 
      row.map(piece => piece ? `${piece.color[0]}${piece.type[0]}` : '-')
    ));
  }
  
  private getStateValue(state: GameState): number {
    const key = this.getStateKey(state);
    return this.valueFunction.get(key) || 0;
  }
  
  private getActionBonus(state: GameState, action: ChessMove): number {
    // PUCT-like exploration bonus
    const visits = 1; // Will be tracked properly with MCTS
    const c = 1.4; // Exploration constant
    return c * Math.sqrt(Math.log(state.moveHistory.length + 1) / visits);
  }
  
  private getActionProbability(state: GameState, action: ChessMove): number {
    const moves = getAllPossibleMoves(state, state.currentPlayer);
    return 1 / moves.length; // Uniform for now, will use neural network later
  }
  
  private isCenter(pos: { row: number; col: number }): boolean {
    // Check if position is in the center of the 10x10 board
    return pos.row >= 3 && pos.row <= 6 && pos.col >= 3 && pos.col <= 6;
  }
  
  private evaluateMaterial(state: GameState): number {
    const pieceValues = {
      pawn: 1,
      knight: 3,
      bishop: 3,
      rook: 5,
      queen: 9,
      king: 0,
      wizard: 7
    };
    
    let value = 0;
    for (const row of state.board) {
      for (const piece of row) {
        if (piece) {
          const multiplier = piece.color === state.currentPlayer ? 1 : -1;
          value += multiplier * pieceValues[piece.type];
        }
      }
    }
    
    return value;
  }
  
  private createInitialGameState(): GameState {
    return {
      board: createInitialBoard(),
      currentPlayer: 'white',
      gamePhase: 'playing',
      selectedPosition: null,
      validMoves: [],
      capturedPieces: { white: [], black: [] },
      moveHistory: [],
      isInCheck: false,
      isCheckmate: false,
      isStalemate: false,
      winner: null,
      lastMove: null,
      gameMode: 'ai-vs-ai',
      aiDifficulty: 'hard'
    };
  }
  
  private executeMove(state: GameState, move: ChessMove): GameState {
    const newState = { ...state };
    makeMove(newState, move);
    return newState;
  }
  
  private addExperience(exp: Experience): void {
    this.experienceBuffer.push(exp);
    
    // Remove oldest experiences if buffer is full
    if (this.experienceBuffer.length > this.config.bufferSize) {
      this.experienceBuffer.shift();
    }
  }
  
  private sampleExperienceBatch(size: number): Experience[] {
    const batch: Experience[] = [];
    const indices = new Set<number>();
    
    // Random sampling without replacement
    while (indices.size < size && indices.size < this.experienceBuffer.length) {
      indices.add(Math.floor(Math.random() * this.experienceBuffer.length));
    }
    
    for (const idx of indices) {
      batch.push(this.experienceBuffer[idx]);
    }
    
    return batch;
  }
  
  private assignFinalRewards(episode: Episode): void {
    // Propagate final reward backwards with discount
    const finalReward = episode.winner === 'white' ? 1.0 : 
                       episode.winner === 'black' ? -1.0 : 0.0;
    
    for (let i = episode.rewards.length - 1; i >= 0; i--) {
      const discount = Math.pow(this.config.gamma, episode.rewards.length - 1 - i);
      const sideMultiplier = i % 2 === 0 ? 1 : -1; // Alternating sides
      episode.rewards[i] += finalReward * discount * sideMultiplier;
    }
  }
  
  private updateStats(episode: Episode): void {
    this.stats.episodesPlayed++;
    
    // Update win rates
    const total = this.stats.episodesPlayed;
    if (episode.winner === 'white') {
      this.stats.winRate.white = (this.stats.winRate.white * (total - 1) + 1) / total;
    } else if (episode.winner === 'black') {
      this.stats.winRate.black = (this.stats.winRate.black * (total - 1) + 1) / total;
    } else {
      this.stats.winRate.draw = (this.stats.winRate.draw * (total - 1) + 1) / total;
    }
    
    // Update average game length
    this.stats.averageGameLength = 
      (this.stats.averageGameLength * (total - 1) + episode.totalMoves) / total;
    
    // Update average reward
    const episodeReward = episode.rewards.reduce((a, b) => a + b, 0) / episode.rewards.length;
    this.stats.averageReward = 
      (this.stats.averageReward * (total - 1) + episodeReward) / total;
    
    this.stats.explorationRate = this.config.epsilon;
  }
  
  /**
   * Save the learned value function and statistics
   */
  saveModel(path: string = 'rl_model'): void {
    const modelData = {
      valueFunction: Array.from(this.valueFunction.entries()),
      stats: this.stats,
      config: this.config,
      timestamp: Date.now()
    };
    
    localStorage.setItem(`wizard_chess_${path}`, JSON.stringify(modelData));
    console.log(`💾 RL Model saved: ${this.valueFunction.size} states learned`);
  }
  
  /**
   * Load a previously trained model
   */
  loadModel(path: string = 'rl_model'): boolean {
    const data = localStorage.getItem(`wizard_chess_${path}`);
    if (!data) return false;
    
    try {
      const modelData = JSON.parse(data);
      this.valueFunction = new Map(modelData.valueFunction);
      this.stats = modelData.stats;
      this.config = { ...this.config, ...modelData.config };
      console.log(`📂 RL Model loaded: ${this.valueFunction.size} states`);
      return true;
    } catch (error) {
      console.error('Failed to load RL model:', error);
      return false;
    }
  }
  
  /**
   * Get current training statistics
   */
  getStats(): RLStats {
    return { ...this.stats };
  }
  
  /**
   * Reset the learning system
   */
  reset(): void {
    this.experienceBuffer = [];
    this.eligibilityTraces.clear();
    this.valueFunction.clear();
    this.stats = {
      episodesPlayed: 0,
      averageReward: 0,
      winRate: { white: 0, black: 0, draw: 0 },
      averageGameLength: 0,
      explorationRate: this.config.epsilon,
      lossHistory: [],
      valueAccuracy: 0,
      policyEntropy: 0
    };
  }
}

// Create singleton instance
export const rlSystem = new ReinforcementLearningSystem();