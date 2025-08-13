import * as tf from '@tensorflow/tfjs';
import { ChessMove, ChessPiece, Position } from '../chess/types';
import { DeepNeuralNetwork } from './deepNeuralNetwork';

// Types for training data
interface HumanGameData {
  playerId?: number;
  playerColor: 'white' | 'black';
  aiDifficulty: string;
  moves: ChessMove[];
  boardStates: any[][];
  outcome: 'player_win' | 'ai_win' | 'draw' | 'abandoned';
  playerElo?: number;
  gameTime: number;
  moveCount: number;
  wizardMovesUsed: number;
  blunders?: number;
  mistakes?: number;
  accuracyScore?: number;
  openingType?: string;
  endgameType?: string;
}

interface TrainingMetrics {
  modelVersion: string;
  trainingGames: number;
  humanGames: number;
  currentElo: number;
  winRate: number;
  winRateVsAmateur?: number;
  winRateVsIntermediate?: number;
  winRateVsExpert?: number;
}

// Enhanced neural network for human-like play
export class HumanAwareNeuralNetwork {
  private model: tf.LayersModel | null = null;
  private humanPatterns: Map<string, number> = new Map();
  private explorationRate: number = 0.1; // 10% exploration for Q-learning
  
  constructor() {
    this.initializeModel();
  }

  private async initializeModel() {
    // Build enhanced network with human pattern recognition
    this.model = tf.sequential({
      layers: [
        // Input layer - 10x10 board + wizard features
        tf.layers.dense({ 
          units: 512, 
          activation: 'relu', 
          inputShape: [858], // Encoded board features
          kernelInitializer: 'glorotUniform'
        }),
        
        // Hidden layers with dropout for regularization
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 256, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 256, activation: 'relu' }),
        
        // Wizard-specific pattern recognition layer
        tf.layers.dense({ 
          units: 128, 
          activation: 'relu',
          name: 'wizard_patterns'
        }),
        
        // Human strategy layer
        tf.layers.dense({ 
          units: 128, 
          activation: 'relu',
          name: 'human_patterns'
        }),
        
        // Dual output heads
        tf.layers.dense({ 
          units: 100, // Move probabilities for 10x10 board
          activation: 'softmax',
          name: 'policy_head'
        })
      ]
    });

    // Compile with advanced optimizer
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    console.log('🧠 Enhanced neural network initialized for human training');
  }

  // Train on human game data with reinforcement learning
  async trainOnHumanGame(gameData: HumanGameData): Promise<void> {
    if (!this.model) return;

    const reward = this.calculateReward(gameData.outcome);
    const batchSize = Math.min(32, gameData.moves.length);
    
    // Process moves in batches
    for (let i = 0; i < gameData.moves.length; i += batchSize) {
      const batch = gameData.moves.slice(i, i + batchSize);
      const states: number[][] = [];
      const actions: number[][] = [];
      const rewards: number[] = [];

      for (let j = 0; j < batch.length; j++) {
        const boardState = gameData.boardStates[i + j];
        const encodedState = this.encodeBoardState(boardState);
        const move = batch[j];
        const moveIndex = this.moveToIndex(move);
        
        states.push(encodedState);
        actions.push(this.oneHotEncode(moveIndex, 100));
        
        // Decay reward based on move position
        const moveReward = reward * Math.pow(0.99, i + j);
        rewards.push(moveReward);
      }

      // Train on batch with sample weights based on rewards
      const stateTensor = tf.tensor2d(states);
      const actionTensor = tf.tensor2d(actions);
      const rewardTensor = tf.tensor1d(rewards);

      await this.model.fit(stateTensor, actionTensor, {
        epochs: 1,
        batchSize,
        sampleWeight: rewardTensor,
        verbose: 0
      });

      // Clean up tensors
      stateTensor.dispose();
      actionTensor.dispose();
      rewardTensor.dispose();
    }

    // Update human pattern recognition
    this.updateHumanPatterns(gameData);
  }

  // Q-learning reward calculation
  private calculateReward(outcome: string): number {
    switch (outcome) {
      case 'ai_win': return 1;
      case 'player_win': return -1;
      case 'draw': return 0;
      default: return -0.5; // Abandoned games
    }
  }

  // Update human playing patterns
  private updateHumanPatterns(gameData: HumanGameData) {
    // Track opening patterns
    if (gameData.openingType) {
      const count = this.humanPatterns.get(gameData.openingType) || 0;
      this.humanPatterns.set(gameData.openingType, count + 1);
    }

    // Track wizard move patterns
    const wizardMoveRate = gameData.wizardMovesUsed / gameData.moveCount;
    const patternKey = `wizard_usage_${Math.floor(wizardMoveRate * 10)}`;
    const patternCount = this.humanPatterns.get(patternKey) || 0;
    this.humanPatterns.set(patternKey, patternCount + 1);
  }

  // Encode board state for neural network
  private encodeBoardState(boardState: any): number[] {
    // Create a temporary neural network instance for encoding
    const encoder = new DeepNeuralNetwork({
      inputSize: 858,
      hiddenLayers: [512, 256, 256, 128, 128],
      outputSize: 2
    });
    
    // Extract features using the neural network's feature extraction
    const features = encoder.extractFeatures({
      board: boardState,
      currentPlayer: 'white' as PieceColor,
      selectedPosition: null,
      validMoves: [],
      gamePhase: 'playing' as GamePhase,
      gameMode: 'ai' as GameMode,
      aiDifficulty: 'hard' as AIDifficulty,
      moveHistory: [],
      isInCheck: false,
      isCheckmate: false,
      isStalemate: false,
      winner: null
    });
    
    const baseEncoding = Array.from(features);
    
    // Add human-specific features
    const humanFeatures = [
      ...Array.from(this.humanPatterns.values()).slice(0, 10), // Top 10 patterns
      Math.random() < this.explorationRate ? 1 : 0 // Exploration flag
    ];

    return [...baseEncoding, ...humanFeatures];
  }

  // Convert move to index for neural network output
  private moveToIndex(move: ChessMove): number {
    return move.from.row * 10 + move.from.col;
  }

  // One-hot encode action
  private oneHotEncode(index: number, size: number): number[] {
    const encoded = new Array(size).fill(0);
    encoded[index] = 1;
    return encoded;
  }

  // Predict best move with exploration
  async predictMove(boardState: any): Promise<ChessMove | null> {
    if (!this.model) return null;

    const encodedState = this.encodeBoardState(boardState);
    const stateTensor = tf.tensor2d([encodedState]);
    
    const prediction = this.model.predict(stateTensor) as tf.Tensor;
    const probabilities = await prediction.array() as number[][];
    
    // Epsilon-greedy exploration
    let moveIndex: number;
    if (Math.random() < this.explorationRate) {
      // Random exploration
      moveIndex = Math.floor(Math.random() * 100);
    } else {
      // Exploit best known move
      moveIndex = probabilities[0].indexOf(Math.max(...probabilities[0]));
    }

    // Clean up
    stateTensor.dispose();
    prediction.dispose();

    // Convert index back to move
    const row = Math.floor(moveIndex / 10);
    const col = moveIndex % 10;
    
    // This is simplified - would need actual move validation
    return {
      from: { row, col },
      to: { row, col }, // Would need to determine valid destination
      piece: boardState[row]?.[col],
      captured: null,
      isCheck: false,
      isCheckmate: false,
      isDraw: false
    };
  }

  // Save model to localStorage
  async saveModel(): Promise<void> {
    if (!this.model) return;
    await this.model.save('localstorage://wizard-chess-human-ai');
    console.log('💾 Human-trained AI model saved');
  }

  // Load model from localStorage
  async loadModel(): Promise<void> {
    try {
      this.model = await tf.loadLayersModel('localstorage://wizard-chess-human-ai');
      console.log('📂 Human-trained AI model loaded');
    } catch (error) {
      console.log('No saved human-trained model found, using base model');
    }
  }
}

// Curriculum training manager
export class CurriculumTrainer {
  private network: HumanAwareNeuralNetwork;
  private trainingQueue: HumanGameData[] = [];
  private currentPhase: 'amateur' | 'intermediate' | 'expert' = 'amateur';
  
  constructor(network: HumanAwareNeuralNetwork) {
    this.network = network;
  }

  // Add game to training queue
  queueGame(gameData: HumanGameData) {
    this.trainingQueue.push(gameData);
  }

  // Train on queued games in curriculum order
  async trainCurriculum(): Promise<void> {
    // Sort games by player skill level
    const amateur = this.trainingQueue.filter(g => (g.playerElo || 0) < 1200);
    const intermediate = this.trainingQueue.filter(g => 
      (g.playerElo || 0) >= 1200 && (g.playerElo || 0) < 1800
    );
    const expert = this.trainingQueue.filter(g => (g.playerElo || 0) >= 1800);

    console.log('📚 Starting curriculum training...');
    
    // Phase 1: Train on amateur games
    if (amateur.length > 0) {
      console.log(`Training on ${amateur.length} amateur games...`);
      for (const game of amateur) {
        await this.network.trainOnHumanGame(game);
      }
    }

    // Phase 2: Train on intermediate games
    if (intermediate.length > 0) {
      console.log(`Training on ${intermediate.length} intermediate games...`);
      for (const game of intermediate) {
        await this.network.trainOnHumanGame(game);
      }
    }

    // Phase 3: Train on expert games
    if (expert.length > 0) {
      console.log(`Training on ${expert.length} expert games...`);
      for (const game of expert) {
        await this.network.trainOnHumanGame(game);
      }
    }

    // Clear queue after training
    this.trainingQueue = [];
    
    // Save updated model
    await this.network.saveModel();
    console.log('✅ Curriculum training complete');
  }

  // Batch training for efficiency
  async batchTrain(batchSize: number = 100): Promise<void> {
    for (let i = 0; i < this.trainingQueue.length; i += batchSize) {
      const batch = this.trainingQueue.slice(i, i + batchSize);
      
      await Promise.all(batch.map(game => 
        this.network.trainOnHumanGame(game)
      ));

      // Save checkpoint every batch
      if (i % (batchSize * 10) === 0) {
        await this.network.saveModel();
        console.log(`📍 Checkpoint saved at ${i} games`);
      }
    }
  }
}

// API client for logging games
export class AITrainingClient {
  private baseUrl = '/api/ai-training';
  
  // Log a completed game for training
  async logGame(gameData: HumanGameData): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/log-game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameData)
      });

      if (!response.ok) {
        throw new Error('Failed to log game');
      }

      const result = await response.json();
      console.log('📝 Game logged for AI training:', result.gameId);
    } catch (error) {
      console.error('Failed to log game:', error);
    }
  }

  // Fetch training games for local training
  async fetchTrainingGames(params?: {
    limit?: number;
    minElo?: number;
    maxElo?: number;
    outcome?: string;
    difficulty?: string;
  }): Promise<HumanGameData[]> {
    const queryParams = new URLSearchParams(params as any);
    
    try {
      const response = await fetch(`${this.baseUrl}/training-games?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch training games');
      
      const data = await response.json();
      return data.games;
    } catch (error) {
      console.error('Failed to fetch training games:', error);
      return [];
    }
  }

  // Get current AI metrics
  async getMetrics(): Promise<TrainingMetrics | null> {
    try {
      const response = await fetch(`${this.baseUrl}/metrics`);
      if (!response.ok) throw new Error('Failed to fetch metrics');
      
      const data = await response.json();
      return data.metrics;
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      return null;
    }
  }

  // Update metrics after training
  async updateMetrics(metrics: TrainingMetrics): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/update-metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics)
      });

      if (!response.ok) throw new Error('Failed to update metrics');
      console.log('📊 Training metrics updated');
    } catch (error) {
      console.error('Failed to update metrics:', error);
    }
  }
}

// Evaluation system for AI performance
export class AIEvaluator {
  private client: AITrainingClient;
  private baseElo: number = 2550;
  
  constructor(client: AITrainingClient) {
    this.client = client;
  }

  // Evaluate AI against test games
  async evaluatePerformance(testGames: HumanGameData[]): Promise<number> {
    let elo = this.baseElo;
    let wins = 0;
    let losses = 0;
    let draws = 0;

    for (const game of testGames) {
      // Simulate game outcome (simplified)
      const outcome = this.simulateGame(game);
      
      if (outcome === 'win') {
        wins++;
        elo += 20;
      } else if (outcome === 'loss') {
        losses++;
        elo -= 20;
      } else {
        draws++;
      }
    }

    const winRate = (wins / testGames.length) * 100;
    console.log(`📈 AI Evaluation Results:`);
    console.log(`   - ELO: ${elo}`);
    console.log(`   - Win Rate: ${winRate.toFixed(1)}%`);
    console.log(`   - Record: ${wins}W-${losses}L-${draws}D`);

    return elo;
  }

  // Simulate game outcome (simplified)
  private simulateGame(game: HumanGameData): 'win' | 'loss' | 'draw' {
    // This would use the actual AI to play through the game
    // For now, return a weighted random outcome based on player ELO
    const playerElo = game.playerElo || 1200;
    const eloDiff = this.baseElo - playerElo;
    const winProbability = 1 / (1 + Math.pow(10, -eloDiff / 400));
    
    const random = Math.random();
    if (random < winProbability * 0.9) return 'win';
    if (random < winProbability + 0.1) return 'draw';
    return 'loss';
  }

  // Adjust difficulty based on player performance
  adjustDifficulty(playerWinRate: number): string {
    if (playerWinRate > 60) {
      console.log('🎯 Increasing AI difficulty');
      return 'expert';
    } else if (playerWinRate < 40) {
      console.log('🎯 Decreasing AI difficulty');
      return 'intermediate';
    }
    return 'balanced';
  }
}

// Initialize training system
let humanAI: HumanAwareNeuralNetwork | null = null;
let curriculumTrainer: CurriculumTrainer | null = null;
let trainingClient: AITrainingClient | null = null;
let evaluator: AIEvaluator | null = null;

export function initializeHumanTraining() {
  humanAI = new HumanAwareNeuralNetwork();
  curriculumTrainer = new CurriculumTrainer(humanAI);
  trainingClient = new AITrainingClient();
  evaluator = new AIEvaluator(trainingClient);
  
  // Load existing model if available
  humanAI.loadModel();
  
  console.log('🎓 Human training system initialized');
  return { humanAI, curriculumTrainer, trainingClient, evaluator };
}

// Export for use in game
export { humanAI, curriculumTrainer, trainingClient, evaluator };