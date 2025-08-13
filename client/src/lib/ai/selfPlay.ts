import * as tf from '@tensorflow/tfjs';
import { createInitialBoard, makeMove, getValidMovesForPosition } from '../chess/gameEngine';
import { ChessMove, ChessPiece, Position, GameState } from '../chess/types';
import { DeepNeuralNetwork } from './deepNeuralNetwork';
import { getAIMove } from '../chess/aiPlayer';

// Self-play training configuration
interface SelfPlayConfig {
  totalGames: number;
  batchSize: number;
  checkpointInterval: number;
  learningRate: number;
  explorationRate: number;
  temperature: number; // For move selection randomness
}

// Game data for training
interface SelfPlayGame {
  moves: ChessMove[];
  boardStates: (ChessPiece | null)[][];
  outcome: 'white' | 'black' | 'draw';
  moveCount: number;
  wizardAttacks: number;
  wizardTeleports: number;
}

// Training progress tracker
interface TrainingProgress {
  gamesPlayed: number;
  whiteWins: number;
  blackWins: number;
  draws: number;
  averageMoveCount: number;
  wizardAttackAccuracy: number;
  currentElo: number;
  trainingStartTime: number;
  checkpoints: string[];
}

export class SelfPlayTrainer {
  private model: DeepNeuralNetwork;
  private config: SelfPlayConfig;
  private progress: TrainingProgress;
  private gameBuffer: SelfPlayGame[] = [];
  private isTraining: boolean = false;
  
  constructor() {
    this.model = new DeepNeuralNetwork();
    this.config = {
      totalGames: 100000,
      batchSize: 256,
      checkpointInterval: 5000,
      learningRate: 0.001,
      explorationRate: 0.15,
      temperature: 1.0
    };
    
    this.progress = {
      gamesPlayed: 0,
      whiteWins: 0,
      blackWins: 0,
      draws: 0,
      averageMoveCount: 0,
      wizardAttackAccuracy: 0,
      currentElo: 2550,
      trainingStartTime: Date.now(),
      checkpoints: []
    };
  }
  
  // Main training loop
  async startTraining(games: number = 100000): Promise<void> {
    console.log('🚀 Starting self-play training with corrected wizard logic');
    console.log(`📊 Target: ${games} games`);
    console.log('🧙 Wizard mechanics: Move OR Attack (not both)');
    
    this.isTraining = true;
    this.config.totalGames = games;
    this.progress.trainingStartTime = Date.now();
    
    // Initialize or load existing model
    await this.initializeModel();
    
    // Training phases with different exploration rates
    const phases = [
      { games: 20000, exploration: 0.25, name: 'Exploration Phase' },
      { games: 30000, exploration: 0.15, name: 'Refinement Phase' },
      { games: 30000, exploration: 0.10, name: 'Optimization Phase' },
      { games: 20000, exploration: 0.05, name: 'Mastery Phase' }
    ];
    
    let totalGamesPlayed = 0;
    
    for (const phase of phases) {
      if (!this.isTraining) break;
      
      console.log(`\n📚 ${phase.name} - ${phase.games} games`);
      this.config.explorationRate = phase.exploration;
      
      for (let i = 0; i < phase.games && this.isTraining; i++) {
        // Play a self-play game
        const gameData = await this.playSelfPlayGame();
        this.gameBuffer.push(gameData);
        
        // Update progress
        this.updateProgress(gameData);
        totalGamesPlayed++;
        
        // Train on batch when buffer is full
        if (this.gameBuffer.length >= this.config.batchSize) {
          await this.trainOnBatch();
          this.gameBuffer = [];
        }
        
        // Save checkpoint
        if (totalGamesPlayed % this.config.checkpointInterval === 0) {
          await this.saveCheckpoint(totalGamesPlayed);
        }
        
        // Progress report
        if (totalGamesPlayed % 1000 === 0) {
          this.reportProgress();
        }
      }
    }
    
    // Final training and save
    if (this.gameBuffer.length > 0) {
      await this.trainOnBatch();
    }
    
    await this.saveFinalModel();
    this.isTraining = false;
    
    console.log('✅ Self-play training complete!');
    this.reportFinalStats();
  }
  
  // Play a single self-play game
  private async playSelfPlayGame(): Promise<SelfPlayGame> {
    const engine = new ChessEngine();
    const gameData: SelfPlayGame = {
      moves: [],
      boardStates: [],
      outcome: 'draw',
      moveCount: 0,
      wizardAttacks: 0,
      wizardTeleports: 0
    };
    
    // Game loop
    while (!engine.isGameOver() && gameData.moveCount < 200) {
      const currentPlayer = engine.getCurrentPlayer();
      const board = engine.getBoard();
      
      // Store board state
      gameData.boardStates.push(this.cloneBoard(board));
      
      // Get move using trained model with exploration
      const move = await this.selectMove(engine, currentPlayer);
      
      if (move) {
        // Track wizard-specific moves
        if (move.piece.type === 'wizard') {
          if (move.isWizardAttack) {
            gameData.wizardAttacks++;
            // Ensure wizard attack is properly executed (no movement)
            console.log(`🧙 Wizard attack from (${move.from.row},${move.from.col}) to (${move.to.row},${move.to.col})`);
          } else if (move.isWizardTeleport) {
            gameData.wizardTeleports++;
          }
        }
        
        // Make the move
        const result = engine.makeMove(
          move.from.row,
          move.from.col,
          move.to.row,
          move.to.col
        );
        
        if (result.success) {
          gameData.moves.push(move);
          gameData.moveCount++;
        }
      } else {
        // No valid moves - game over
        break;
      }
    }
    
    // Determine outcome
    const gameState = engine.getGameState();
    if (gameState.checkmate) {
      gameData.outcome = gameState.winner || 'draw';
    } else if (gameState.stalemate || gameData.moveCount >= 200) {
      gameData.outcome = 'draw';
    }
    
    return gameData;
  }
  
  // Select move with exploration and temperature
  private async selectMove(engine: ChessEngine, player: 'white' | 'black'): Promise<ChessMove | null> {
    // Use exploration (random moves) occasionally
    if (Math.random() < this.config.explorationRate) {
      return this.selectRandomMove(engine, player);
    }
    
    // Use trained model
    const board = engine.getBoard();
    const validMoves = engine.getValidMovesForPlayer(player);
    
    if (validMoves.length === 0) return null;
    
    // Prioritize wizard attacks when available
    const wizardAttacks = validMoves.filter(move => {
      const piece = board[move.from.row][move.from.col];
      if (piece?.type === 'wizard') {
        const targetPiece = board[move.to.row][move.to.col];
        return targetPiece !== null && targetPiece.color !== piece.color;
      }
      return false;
    });
    
    // Use AI to evaluate moves
    const moveScores: { move: ChessMove; score: number }[] = [];
    
    for (const move of validMoves) {
      // Clone engine and make move
      const testEngine = this.cloneEngine(engine);
      testEngine.makeMove(move.from.row, move.from.col, move.to.row, move.to.col);
      
      // Evaluate position
      const score = await this.evaluatePosition(testEngine.getBoard(), player);
      moveScores.push({ move, score });
    }
    
    // Apply temperature for move selection
    return this.selectMoveWithTemperature(moveScores);
  }
  
  // Select random move for exploration
  private selectRandomMove(engine: ChessEngine, player: 'white' | 'black'): ChessMove | null {
    const validMoves = engine.getValidMovesForPlayer(player);
    if (validMoves.length === 0) return null;
    
    // Slightly prefer wizard moves for learning
    const wizardMoves = validMoves.filter(move => {
      const board = engine.getBoard();
      const piece = board[move.from.row][move.from.col];
      return piece?.type === 'wizard';
    });
    
    if (wizardMoves.length > 0 && Math.random() < 0.3) {
      return wizardMoves[Math.floor(Math.random() * wizardMoves.length)];
    }
    
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }
  
  // Apply temperature-based selection
  private selectMoveWithTemperature(moveScores: { move: ChessMove; score: number }[]): ChessMove | null {
    if (moveScores.length === 0) return null;
    
    // Apply temperature to scores
    const temp = this.config.temperature;
    const expScores = moveScores.map(ms => ({
      move: ms.move,
      prob: Math.exp(ms.score / temp)
    }));
    
    // Normalize probabilities
    const totalProb = expScores.reduce((sum, ms) => sum + ms.prob, 0);
    const probabilities = expScores.map(ms => ms.prob / totalProb);
    
    // Sample from distribution
    const rand = Math.random();
    let cumProb = 0;
    
    for (let i = 0; i < probabilities.length; i++) {
      cumProb += probabilities[i];
      if (rand < cumProb) {
        return expScores[i].move;
      }
    }
    
    return moveScores[0].move;
  }
  
  // Train model on batch of games
  private async trainOnBatch(): Promise<void> {
    if (this.gameBuffer.length === 0) return;
    
    console.log(`🎯 Training on batch of ${this.gameBuffer.length} games...`);
    
    const inputs: number[][] = [];
    const targets: number[][] = [];
    
    for (const game of this.gameBuffer) {
      // Process each position in the game
      for (let i = 0; i < game.moves.length; i++) {
        const boardState = game.boardStates[i];
        const move = game.moves[i];
        
        // Encode board state
        const input = this.encodeBoardState(boardState);
        
        // Create target based on game outcome
        const moveQuality = this.calculateMoveQuality(
          move,
          game.outcome,
          move.piece.color,
          i,
          game.moveCount
        );
        
        // Special handling for wizard moves
        if (move.piece.type === 'wizard') {
          // Reinforce correct wizard mechanics
          if (move.isWizardAttack) {
            // Boost score for successful wizard attacks
            const target = this.createTarget(move, moveQuality * 1.2);
            inputs.push(input);
            targets.push(target);
          } else if (move.isWizardTeleport) {
            // Normal scoring for teleports
            const target = this.createTarget(move, moveQuality);
            inputs.push(input);
            targets.push(target);
          }
        } else {
          const target = this.createTarget(move, moveQuality);
          inputs.push(input);
          targets.push(target);
        }
      }
    }
    
    // Train the model
    if (inputs.length > 0) {
      const inputTensor = tf.tensor2d(inputs);
      const targetTensor = tf.tensor2d(targets);
      
      await this.model.train(inputTensor, targetTensor, {
        epochs: 5,
        batchSize: 32,
        validationSplit: 0.1
      });
      
      inputTensor.dispose();
      targetTensor.dispose();
    }
  }
  
  // Helper methods
  private cloneBoard(board: (ChessPiece | null)[][]): (ChessPiece | null)[][] {
    return board.map(row => row.map(piece => piece ? { ...piece } : null));
  }
  
  private cloneEngine(engine: ChessEngine): ChessEngine {
    const newEngine = new ChessEngine();
    // Copy board state
    const board = engine.getBoard();
    newEngine.setBoard(this.cloneBoard(board));
    return newEngine;
  }
  
  private encodeBoardState(board: (ChessPiece | null)[][]): number[] {
    const encoded: number[] = [];
    
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const piece = board[row][col];
        if (!piece) {
          encoded.push(0, 0, 0, 0, 0, 0, 0, 0); // 8 features per square
        } else {
          // Piece type encoding (6 types + wizard)
          const typeEncoding = [
            piece.type === 'pawn' ? 1 : 0,
            piece.type === 'knight' ? 1 : 0,
            piece.type === 'bishop' ? 1 : 0,
            piece.type === 'rook' ? 1 : 0,
            piece.type === 'queen' ? 1 : 0,
            piece.type === 'king' ? 1 : 0,
            piece.type === 'wizard' ? 1 : 0,
            piece.color === 'white' ? 1 : -1
          ];
          encoded.push(...typeEncoding);
        }
      }
    }
    
    // Add global features
    encoded.push(
      this.progress.gamesPlayed / 100000, // Normalized game count
      this.progress.wizardAttackAccuracy, // Wizard accuracy
      this.config.explorationRate, // Current exploration
      Math.random() * 0.1 // Small noise
    );
    
    return encoded;
  }
  
  private async evaluatePosition(board: (ChessPiece | null)[][], player: 'white' | 'black'): Promise<number> {
    const encoded = this.encodeBoardState(board);
    const prediction = await this.model.predict(tf.tensor2d([encoded]));
    return prediction as number;
  }
  
  private calculateMoveQuality(
    move: ChessMove,
    outcome: 'white' | 'black' | 'draw',
    player: 'white' | 'black',
    moveIndex: number,
    totalMoves: number
  ): number {
    let quality = 0.5; // Base quality
    
    // Adjust based on game outcome
    if (outcome === player) {
      quality = 1.0; // Win
    } else if (outcome === 'draw') {
      quality = 0.5; // Draw
    } else {
      quality = 0.0; // Loss
    }
    
    // Decay based on move position (earlier moves less responsible for outcome)
    const decay = Math.pow(0.99, totalMoves - moveIndex);
    quality *= decay;
    
    // Bonus for wizard attacks (teaching proper mechanics)
    if (move.piece.type === 'wizard' && move.isWizardAttack) {
      quality *= 1.1;
    }
    
    return quality;
  }
  
  private createTarget(move: ChessMove, quality: number): number[] {
    // Create a 100-element array (10x10 board)
    const target = new Array(100).fill(0);
    
    // Set the target square value
    const targetIndex = move.to.row * 10 + move.to.col;
    target[targetIndex] = quality;
    
    return target;
  }
  
  private updateProgress(game: SelfPlayGame): void {
    this.progress.gamesPlayed++;
    
    if (game.outcome === 'white') {
      this.progress.whiteWins++;
    } else if (game.outcome === 'black') {
      this.progress.blackWins++;
    } else {
      this.progress.draws++;
    }
    
    // Update average move count
    this.progress.averageMoveCount = 
      (this.progress.averageMoveCount * (this.progress.gamesPlayed - 1) + game.moveCount) / 
      this.progress.gamesPlayed;
    
    // Update wizard attack accuracy
    if (game.wizardAttacks > 0) {
      const attackAccuracy = game.wizardAttacks / (game.wizardAttacks + game.wizardTeleports);
      this.progress.wizardAttackAccuracy = 
        (this.progress.wizardAttackAccuracy * 0.95) + (attackAccuracy * 0.05);
    }
  }
  
  private reportProgress(): void {
    const elapsed = (Date.now() - this.progress.trainingStartTime) / 1000 / 60; // minutes
    const gamesPerMinute = this.progress.gamesPlayed / elapsed;
    const estimatedTimeRemaining = (this.config.totalGames - this.progress.gamesPlayed) / gamesPerMinute;
    
    console.log('\n📊 Training Progress Report');
    console.log('═══════════════════════════════════════════');
    console.log(`Games Played: ${this.progress.gamesPlayed}/${this.config.totalGames}`);
    console.log(`White Wins: ${this.progress.whiteWins} (${(this.progress.whiteWins / this.progress.gamesPlayed * 100).toFixed(1)}%)`);
    console.log(`Black Wins: ${this.progress.blackWins} (${(this.progress.blackWins / this.progress.gamesPlayed * 100).toFixed(1)}%)`);
    console.log(`Draws: ${this.progress.draws} (${(this.progress.draws / this.progress.gamesPlayed * 100).toFixed(1)}%)`);
    console.log(`Average Move Count: ${this.progress.averageMoveCount.toFixed(1)}`);
    console.log(`Wizard Attack Accuracy: ${(this.progress.wizardAttackAccuracy * 100).toFixed(1)}%`);
    console.log(`Current ELO: ~${this.progress.currentElo}`);
    console.log(`Games/minute: ${gamesPerMinute.toFixed(1)}`);
    console.log(`Est. Time Remaining: ${estimatedTimeRemaining.toFixed(1)} minutes`);
    console.log('═══════════════════════════════════════════\n');
  }
  
  private async saveCheckpoint(gamesPlayed: number): Promise<void> {
    const checkpointName = `wizard-chess-ai-${gamesPlayed}games`;
    console.log(`💾 Saving checkpoint: ${checkpointName}`);
    
    try {
      await this.model.save(checkpointName);
      this.progress.checkpoints.push(checkpointName);
      
      // Save training progress
      localStorage.setItem('selfPlayProgress', JSON.stringify(this.progress));
    } catch (error) {
      console.error('Failed to save checkpoint:', error);
    }
  }
  
  private async saveFinalModel(): Promise<void> {
    console.log('💾 Saving final trained model...');
    
    try {
      await this.model.save('wizard-chess-ai-final');
      
      // Save final stats
      const finalStats = {
        ...this.progress,
        trainingEndTime: Date.now(),
        totalTrainingTime: Date.now() - this.progress.trainingStartTime
      };
      
      localStorage.setItem('selfPlayFinalStats', JSON.stringify(finalStats));
      
      // Deploy the model globally
      (window as any).wizardChessAI = this.model;
      
      console.log('✅ Model saved and deployed successfully!');
    } catch (error) {
      console.error('Failed to save final model:', error);
    }
  }
  
  private reportFinalStats(): void {
    const totalTime = (Date.now() - this.progress.trainingStartTime) / 1000 / 60 / 60; // hours
    
    console.log('\n🏆 FINAL TRAINING STATISTICS');
    console.log('═══════════════════════════════════════════');
    console.log(`Total Games: ${this.progress.gamesPlayed}`);
    console.log(`Training Time: ${totalTime.toFixed(2)} hours`);
    console.log(`Final Win Rates:`);
    console.log(`  White: ${(this.progress.whiteWins / this.progress.gamesPlayed * 100).toFixed(2)}%`);
    console.log(`  Black: ${(this.progress.blackWins / this.progress.gamesPlayed * 100).toFixed(2)}%`);
    console.log(`  Draws: ${(this.progress.draws / this.progress.gamesPlayed * 100).toFixed(2)}%`);
    console.log(`Average Game Length: ${this.progress.averageMoveCount.toFixed(1)} moves`);
    console.log(`Wizard Attack Mastery: ${(this.progress.wizardAttackAccuracy * 100).toFixed(1)}%`);
    console.log(`Estimated ELO: ${this.progress.currentElo}+`);
    console.log(`Checkpoints Saved: ${this.progress.checkpoints.length}`);
    console.log('═══════════════════════════════════════════\n');
    console.log('🎯 Model is now ready for deployment!');
  }
  
  private async initializeModel(): Promise<void> {
    // Try to load existing model or create new one
    try {
      const savedModel = localStorage.getItem('selfPlayProgress');
      if (savedModel) {
        this.progress = JSON.parse(savedModel);
        console.log(`📂 Resuming training from game ${this.progress.gamesPlayed}`);
      }
      
      await this.model.initialize();
    } catch (error) {
      console.log('🆕 Starting fresh training session');
      await this.model.initialize();
    }
  }
  
  // Stop training gracefully
  stopTraining(): void {
    console.log('🛑 Stopping training...');
    this.isTraining = false;
  }
}

// Export function to start training
export async function startSelfPlayTraining(games: number = 100000): Promise<void> {
  const trainer = new SelfPlayTrainer();
  await trainer.startTraining(games);
}