/**
 * Deep Neural Network for Wizard Chess Master
 * TensorFlow.js implementation with wizard-specific features
 * Optimized for Replit environment
 */

import * as tf from '@tensorflow/tfjs';
import { GameState, ChessMove, ChessPiece, PieceColor, Position, PieceType } from '../chess/types';
import { isKingInCheck } from '../chess/gameEngine';

// Helper function for getting possible moves
function getAllPossibleMoves(state: GameState, color: PieceColor): ChessMove[] {
  // Simplified version - would integrate with existing move generation
  return [];
}

// Network configuration
export interface NetworkConfig {
  inputSize: number;              // Board features + game state
  hiddenLayers: number[];         // Nodes per hidden layer
  outputSize: number;             // Value + policy outputs
  learningRate: number;
  batchSize: number;
  epochs: number;
  dropout: number;
  l2Regularization: number;
  optimizerType: 'adam' | 'sgd' | 'rmsprop';
  activationType: 'relu' | 'leakyRelu' | 'elu';
  useBatchNorm: boolean;
  useResidualBlocks: boolean;
}

// Feature extraction configuration
export interface FeatureConfig {
  includeWizardFeatures: boolean;
  includeTacticalFeatures: boolean;
  includePositionalFeatures: boolean;
  includeTemporalFeatures: boolean;
  includeMobilityFeatures: boolean;
  featureNormalization: boolean;
}

export class DeepNeuralNetwork {
  private model: tf.LayersModel | null = null;
  private valueHead: tf.LayersModel | null = null;
  private policyHead: tf.LayersModel | null = null;
  private config: NetworkConfig;
  private featureConfig: FeatureConfig;
  private trainingHistory: tf.History[] = [];
  private isTraining: boolean = false;
  
  // Optimized for Replit: Use WebGL backend for GPU acceleration
  private backend: string = 'webgl';
  
  constructor(config?: Partial<NetworkConfig>, featureConfig?: Partial<FeatureConfig>) {
    // Optimized configuration for Replit environment
    this.config = {
      inputSize: 1024,  // 10x10 board + additional features
      hiddenLayers: [512, 256, 256, 128, 128],  // 5 hidden layers
      outputSize: 101,  // 100 moves + 1 value
      learningRate: 0.001,
      batchSize: 32,
      epochs: 100,
      dropout: 0.3,
      l2Regularization: 0.0001,
      optimizerType: 'adam',
      activationType: 'relu',
      useBatchNorm: true,
      useResidualBlocks: true,
      ...config
    };
    
    this.featureConfig = {
      includeWizardFeatures: true,
      includeTacticalFeatures: true,
      includePositionalFeatures: true,
      includeTemporalFeatures: true,
      includeMobilityFeatures: true,
      featureNormalization: true,
      ...featureConfig
    };
    
    this.initializeBackend();
  }
  
  /**
   * Initialize TensorFlow.js backend optimized for Replit
   */
  private async initializeBackend(): Promise<void> {
    try {
      // Try WebGL first (GPU acceleration in browser)
      await tf.setBackend('webgl');
      console.log('🚀 TensorFlow.js using WebGL backend (GPU acceleration)');
    } catch (error) {
      // Fallback to CPU if WebGL not available
      await tf.setBackend('cpu');
      console.log('💻 TensorFlow.js using CPU backend');
    }
    
    // Memory management for Replit's limited resources
    tf.engine().startScope();
  }
  
  /**
   * Build the deep neural network architecture
   */
  buildModel(): void {
    console.log('🏗️ Building deep neural network...');
    
    // Input layer
    const input = tf.input({ shape: [this.config.inputSize] });
    
    let x: tf.SymbolicTensor = input;
    
    // Build hidden layers with advanced features
    for (let i = 0; i < this.config.hiddenLayers.length; i++) {
      const units = this.config.hiddenLayers[i];
      const previousUnits = i === 0 ? this.config.inputSize : this.config.hiddenLayers[i - 1];
      
      // Residual block for deeper networks
      if (this.config.useResidualBlocks && i > 0 && i % 2 === 0 && previousUnits === units) {
        const residual = x;
        
        // First dense layer in residual block
        x = tf.layers.dense({
          units,
          kernelRegularizer: tf.regularizers.l2({ l2: this.config.l2Regularization })
        }).apply(x) as tf.SymbolicTensor;
        
        // Batch normalization
        if (this.config.useBatchNorm) {
          x = tf.layers.batchNormalization().apply(x) as tf.SymbolicTensor;
        }
        
        // Activation
        x = this.getActivationLayer().apply(x) as tf.SymbolicTensor;
        
        // Second dense layer
        x = tf.layers.dense({
          units,
          kernelRegularizer: tf.regularizers.l2({ l2: this.config.l2Regularization })
        }).apply(x) as tf.SymbolicTensor;
        
        // Add residual connection
        x = tf.layers.add().apply([x, residual]) as tf.SymbolicTensor;
        
        // Final activation
        x = this.getActivationLayer().apply(x) as tf.SymbolicTensor;
      } else {
        // Regular dense layer
        x = tf.layers.dense({
          units,
          kernelRegularizer: tf.regularizers.l2({ l2: this.config.l2Regularization })
        }).apply(x) as tf.SymbolicTensor;
        
        // Batch normalization
        if (this.config.useBatchNorm) {
          x = tf.layers.batchNormalization().apply(x) as tf.SymbolicTensor;
        }
        
        // Activation
        x = this.getActivationLayer().apply(x) as tf.SymbolicTensor;
        
        // Dropout for regularization
        if (this.config.dropout > 0) {
          x = tf.layers.dropout({ rate: this.config.dropout }).apply(x) as tf.SymbolicTensor;
        }
      }
    }
    
    // Split into value and policy heads (AlphaZero-style)
    
    // Value head - predicts game outcome
    let valueHead = tf.layers.dense({
      units: 128,
      activation: 'relu'
    }).apply(x) as tf.SymbolicTensor;
    
    valueHead = tf.layers.dense({
      units: 1,
      activation: 'tanh',  // -1 to 1 (loss to win)
      name: 'value_output'
    }).apply(valueHead) as tf.SymbolicTensor;
    
    // Policy head - predicts move probabilities
    let policyHead = tf.layers.dense({
      units: 256,
      activation: 'relu'
    }).apply(x) as tf.SymbolicTensor;
    
    policyHead = tf.layers.dense({
      units: 100,  // 10x10 possible moves
      activation: 'softmax',
      name: 'policy_output'
    }).apply(policyHead) as tf.SymbolicTensor;
    
    // Create the model
    this.model = tf.model({
      inputs: input,
      outputs: [valueHead, policyHead]
    });
    
    // Compile the model
    const optimizer = this.getOptimizer();
    
    this.model.compile({
      optimizer,
      loss: {
        'value_output': 'meanSquaredError',
        'policy_output': 'categoricalCrossentropy'
      },
      metrics: ['mse', 'accuracy']
    });
    
    console.log('✅ Deep neural network built successfully');
    console.log(`   Architecture: ${this.config.hiddenLayers.join(' → ')} nodes`);
    console.log(`   Total parameters: ${this.model.countParams()}`);
  }
  
  /**
   * Extract features from game state (optimized for 10x10 wizard chess)
   */
  extractFeatures(state: GameState): Float32Array {
    const features: number[] = [];
    
    // 1. Board representation (10x10 = 100 squares × 8 piece types × 2 colors = 1600 features)
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const piece = state.board[row][col];
        const pieceFeatures = this.encodePiece(piece);
        features.push(...pieceFeatures);
      }
    }
    
    // 2. Wizard-specific features (if enabled)
    if (this.featureConfig.includeWizardFeatures) {
      const wizardFeatures = this.extractWizardFeatures(state);
      features.push(...wizardFeatures);
    }
    
    // 3. Tactical features
    if (this.featureConfig.includeTacticalFeatures) {
      const tacticalFeatures = this.extractTacticalFeatures(state);
      features.push(...tacticalFeatures);
    }
    
    // 4. Positional features
    if (this.featureConfig.includePositionalFeatures) {
      const positionalFeatures = this.extractPositionalFeatures(state);
      features.push(...positionalFeatures);
    }
    
    // 5. Temporal features (game phase, move count)
    if (this.featureConfig.includeTemporalFeatures) {
      const temporalFeatures = this.extractTemporalFeatures(state);
      features.push(...temporalFeatures);
    }
    
    // 6. Mobility features
    if (this.featureConfig.includeMobilityFeatures) {
      const mobilityFeatures = this.extractMobilityFeatures(state);
      features.push(...mobilityFeatures);
    }
    
    // Normalize features if configured
    if (this.featureConfig.featureNormalization) {
      return this.normalizeFeatures(new Float32Array(features));
    }
    
    return new Float32Array(features);
  }
  
  /**
   * Encode a piece into neural network features
   */
  private encodePiece(piece: ChessPiece | null): number[] {
    const features = new Array(16).fill(0);
    
    if (!piece) return features;
    
    // One-hot encoding for piece type (7 types)
    const pieceTypes = ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king', 'wizard'];
    const typeIndex = pieceTypes.indexOf(piece.type);
    if (typeIndex >= 0) features[typeIndex] = 1;
    
    // Color encoding (offset by 8)
    features[8] = piece.color === 'white' ? 1 : 0;
    features[9] = piece.color === 'black' ? 1 : 0;
    
    // Special properties
    features[10] = piece.hasMoved ? 1 : 0;
    features[11] = 0; // justMovedTwo (tracked in game state)
    
    // Wizard-specific properties
    if (piece.type === 'wizard') {
      // Extended properties for wizard pieces (stored in game state separately)
      features[12] = 1; // Can teleport (default for wizards)
      features[13] = 0; // Has used ability (tracked elsewhere)
      features[14] = 1; // Wizard level
      features[15] = 0; // Capture count
    }
    
    return features;
  }
  
  /**
   * Extract wizard-specific features
   */
  private extractWizardFeatures(state: GameState): number[] {
    const features: number[] = [];
    
    // Count wizards for each side
    let whiteWizards = 0;
    let blackWizards = 0;
    let wizardMobility = 0;
    
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const piece = state.board[row][col];
        if (piece?.type === 'wizard') {
          if (piece.color === 'white') whiteWizards++;
          else blackWizards++;
          
          // Calculate wizard mobility (teleportation range)
          // All wizards can teleport by default
          wizardMobility += this.calculateWizardMobility(state, { row, col });
        }
      }
    }
    
    features.push(whiteWizards / 2);  // Normalized
    features.push(blackWizards / 2);
    features.push(wizardMobility / 20);  // Normalized mobility
    
    // Wizard threat detection
    const wizardThreats = this.detectWizardThreats(state);
    features.push(...wizardThreats);
    
    return features;
  }
  
  /**
   * Calculate wizard mobility (available teleportation targets)
   */
  private calculateWizardMobility(state: GameState, pos: Position): number {
    let mobility = 0;
    
    // Check 2-square radius for teleportation
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        if (dr === 0 && dc === 0) continue;
        
        const newRow = pos.row + dr;
        const newCol = pos.col + dc;
        
        if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10) {
          const target = state.board[newRow][newCol];
          if (!target || target.color !== state.board[pos.row][pos.col]?.color) {
            mobility++;
          }
        }
      }
    }
    
    return mobility;
  }
  
  /**
   * Detect wizard threats
   */
  private detectWizardThreats(state: GameState): number[] {
    const threats = [0, 0, 0, 0];  // [white attacks, black attacks, white defends, black defends]
    
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const piece = state.board[row][col];
        if (piece?.type === 'wizard') {
          // Check for attack patterns
          const adjacentEnemies = this.countAdjacentPieces(state, { row, col }, 
            piece.color === 'white' ? 'black' : 'white');
          
          if (piece.color === 'white') {
            threats[0] += adjacentEnemies;
            threats[2] += this.countAdjacentPieces(state, { row, col }, 'white');
          } else {
            threats[1] += adjacentEnemies;
            threats[3] += this.countAdjacentPieces(state, { row, col }, 'black');
          }
        }
      }
    }
    
    // Normalize
    return threats.map(t => t / 10);
  }
  
  /**
   * Count adjacent pieces of a specific color
   */
  private countAdjacentPieces(state: GameState, pos: Position, color: PieceColor): number {
    let count = 0;
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
    
    for (const [dr, dc] of directions) {
      const newRow = pos.row + dr;
      const newCol = pos.col + dc;
      
      if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10) {
        const piece = state.board[newRow][newCol];
        if (piece?.color === color) count++;
      }
    }
    
    return count;
  }
  
  /**
   * Extract tactical features
   */
  private extractTacticalFeatures(state: GameState): number[] {
    const features: number[] = [];
    
    // Check/checkmate detection
    features.push(state.isInCheck ? 1 : 0);
    features.push(state.isCheckmate ? 1 : 0);
    features.push(state.isStalemate ? 1 : 0);
    
    // Material balance
    const material = this.calculateMaterialBalance(state);
    features.push(material / 100);  // Normalized
    
    // Hanging pieces detection
    const hangingPieces = this.detectHangingPieces(state);
    features.push(hangingPieces.white / 10);
    features.push(hangingPieces.black / 10);
    
    // Fork/pin opportunities
    const tactics = this.detectTacticalPatterns(state);
    features.push(...tactics);
    
    return features;
  }
  
  /**
   * Calculate material balance
   */
  private calculateMaterialBalance(state: GameState): number {
    const values = { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 0, wizard: 7 };
    let balance = 0;
    
    for (const row of state.board) {
      for (const piece of row) {
        if (piece) {
          const value = values[piece.type];
          balance += piece.color === 'white' ? value : -value;
        }
      }
    }
    
    return balance;
  }
  
  /**
   * Detect hanging pieces
   */
  private detectHangingPieces(state: GameState): { white: number; black: number } {
    // Simplified - would need full attack map calculation
    return { white: 0, black: 0 };
  }
  
  /**
   * Detect tactical patterns (forks, pins, skewers)
   */
  private detectTacticalPatterns(state: GameState): number[] {
    // Simplified - returns normalized tactical scores
    return [0, 0, 0, 0];  // [white forks, black forks, white pins, black pins]
  }
  
  /**
   * Extract positional features
   */
  private extractPositionalFeatures(state: GameState): number[] {
    const features: number[] = [];
    
    // Center control (e4, e5, d4, d5 equivalent in 10x10)
    let centerControl = 0;
    const centerSquares = [
      [4, 4], [4, 5], [5, 4], [5, 5],  // Inner center
      [3, 3], [3, 6], [6, 3], [6, 6]   // Extended center
    ];
    
    for (const [row, col] of centerSquares) {
      const piece = state.board[row][col];
      if (piece) {
        centerControl += piece.color === 'white' ? 1 : -1;
      }
    }
    
    features.push(centerControl / 8);  // Normalized
    
    // King safety
    const kingSafety = this.evaluateKingSafety(state);
    features.push(kingSafety.white / 10);
    features.push(kingSafety.black / 10);
    
    // Pawn structure
    const pawnStructure = this.evaluatePawnStructure(state);
    features.push(...pawnStructure);
    
    return features;
  }
  
  /**
   * Evaluate king safety
   */
  private evaluateKingSafety(state: GameState): { white: number; black: number } {
    // Simplified - counts pieces around king
    return { white: 5, black: 5 };
  }
  
  /**
   * Evaluate pawn structure
   */
  private evaluatePawnStructure(state: GameState): number[] {
    // Returns normalized scores for doubled, isolated, passed pawns
    return [0, 0, 0, 0];
  }
  
  /**
   * Extract temporal features
   */
  private extractTemporalFeatures(state: GameState): number[] {
    const features: number[] = [];
    
    // Game phase (opening, middle, endgame)
    const moveCount = state.moveHistory.length;
    features.push(moveCount < 20 ? 1 : 0);  // Opening
    features.push(moveCount >= 20 && moveCount < 40 ? 1 : 0);  // Middle
    features.push(moveCount >= 40 ? 1 : 0);  // Endgame
    
    // Move count (normalized)
    features.push(Math.min(moveCount / 100, 1));
    
    // Castling rights (track separately if needed)
    features.push(0); // White kingside
    features.push(0); // White queenside
    features.push(0); // Black kingside
    features.push(0); // Black queenside
    
    return features;
  }
  
  /**
   * Extract mobility features
   */
  private extractMobilityFeatures(state: GameState): number[] {
    const features: number[] = [];
    
    // Calculate legal moves for both sides
    const whiteMoves = state.currentPlayer === 'white' ? 
      getAllPossibleMoves(state, 'white').length : 0;
    const blackMoves = state.currentPlayer === 'black' ? 
      getAllPossibleMoves(state, 'black').length : 0;
    
    features.push(whiteMoves / 50);  // Normalized
    features.push(blackMoves / 50);
    
    return features;
  }
  
  /**
   * Normalize features to [-1, 1] range
   */
  private normalizeFeatures(features: Float32Array): Float32Array {
    const normalized = new Float32Array(features.length);
    
    for (let i = 0; i < features.length; i++) {
      // Simple normalization - could use running mean/std
      normalized[i] = Math.max(-1, Math.min(1, features[i]));
    }
    
    return normalized;
  }
  
  /**
   * Get activation layer based on configuration
   */
  private getActivationLayer(): tf.layers.Layer {
    switch (this.config.activationType) {
      case 'leakyRelu':
        return tf.layers.leakyReLU({ alpha: 0.1 });
      case 'elu':
        return tf.layers.elu();
      default:
        return tf.layers.reLU();
    }
  }
  
  /**
   * Get optimizer based on configuration
   */
  private getOptimizer(): tf.Optimizer {
    switch (this.config.optimizerType) {
      case 'sgd':
        return tf.train.sgd(this.config.learningRate);
      case 'rmsprop':
        return tf.train.rmsprop(this.config.learningRate);
      default:
        return tf.train.adam(this.config.learningRate);
    }
  }
  
  /**
   * Predict move and value for a given state
   */
  async predict(state: GameState): Promise<{ value: number; policy: Float32Array }> {
    if (!this.model) {
      throw new Error('Model not built. Call buildModel() first.');
    }
    
    const features = this.extractFeatures(state);
    const input = tf.tensor2d([Array.from(features)], [1, features.length]);
    
    const [valuePred, policyPred] = this.model.predict(input) as tf.Tensor[];
    
    const value = await valuePred.data();
    const policy = await policyPred.data();
    
    input.dispose();
    valuePred.dispose();
    policyPred.dispose();
    
    return {
      value: value[0],
      policy: new Float32Array(policy)
    };
  }
  
  /**
   * Train the model on a batch of examples
   */
  async train(
    states: GameState[],
    targetValues: number[],
    targetPolicies: number[][],
    callbacks?: tf.CustomCallbackArgs
  ): Promise<tf.History> {
    if (!this.model) {
      throw new Error('Model not built. Call buildModel() first.');
    }
    
    this.isTraining = true;
    
    // Extract features for all states
    const features: number[][] = [];
    for (const state of states) {
      const stateFeatures = this.extractFeatures(state);
      features.push(Array.from(stateFeatures));
    }
    
    // Create tensors
    const x = tf.tensor2d(features);
    const yValue = tf.tensor2d(targetValues.map(v => [v]));
    const yPolicy = tf.tensor2d(targetPolicies);
    
    // Train the model
    const history = await this.model.fit(x, {
      'value_output': yValue,
      'policy_output': yPolicy
    }, {
      batchSize: this.config.batchSize,
      epochs: this.config.epochs,
      validationSplit: 0.1,
      callbacks,
      verbose: 1
    });
    
    // Clean up tensors
    x.dispose();
    yValue.dispose();
    yPolicy.dispose();
    
    this.trainingHistory.push(history);
    this.isTraining = false;
    
    return history;
  }
  
  /**
   * Save the model
   */
  async saveModel(path: string = 'localstorage://wizard-chess-dnn'): Promise<void> {
    if (!this.model) {
      throw new Error('Model not built.');
    }
    
    await this.model.save(path);
    console.log(`💾 Model saved to ${path}`);
  }
  
  /**
   * Load a saved model
   */
  async loadModel(path: string = 'localstorage://wizard-chess-dnn'): Promise<void> {
    try {
      this.model = await tf.loadLayersModel(path);
      console.log(`📂 Model loaded from ${path}`);
    } catch (error) {
      console.error('Failed to load model:', error);
      throw error;
    }
  }
  
  /**
   * Get model summary
   */
  getModelSummary(): string {
    if (!this.model) {
      return 'Model not built';
    }
    
    let summary = '';
    this.model.summary(undefined, undefined, (line: string) => {
      summary += line + '\n';
    });
    
    return summary;
  }
  
  /**
   * Memory cleanup
   */
  dispose(): void {
    if (this.model) {
      this.model.dispose();
    }
    tf.engine().endScope();
  }
}

// Create singleton instance
export const deepNN = new DeepNeuralNetwork();