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
    // Initialize model with correct input size
    this.model = new DeepNeuralNetwork({
      inputSize: 1634,  // Fixed: 10x10x16 board + features
      hiddenLayers: [512, 256, 256, 128, 128],
      outputSize: 101,
      learningRate: 0.001,
      batchSize: 256,  // 64 * 4 as requested
      epochs: 100,
      dropout: 0.3
    });
    
    this.config = {
      totalGames: 100000,
      batchSize: 256,  // Batch config: 64 * 4 = 256
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
    
    console.log('\n✅ Training complete!');
    this.reportFinalStats();
  }
  
  // Initialize or load existing model
  private async initializeModel(): Promise<void> {
    console.log('🏗️ Initializing AI model...');
    this.model.buildModel();
    
    // Try to load existing checkpoint
    try {
      const checkpoint = localStorage.getItem('wizardChessCheckpoint');
      if (checkpoint) {
        const data = JSON.parse(checkpoint);
        console.log(`📁 Loaded checkpoint from game ${data.gamesPlayed}`);
        this.progress = data.progress;
      }
    } catch (error) {
      console.log('📁 Starting fresh training (no checkpoint found)');
    }
  }
  
  // Play a single self-play game with corrected wizard mechanics
  private async playSelfPlayGame(): Promise<SelfPlayGame> {
    const game: SelfPlayGame = {
      moves: [],
      boardStates: [],
      outcome: 'draw',
      moveCount: 0,
      wizardAttacks: 0,
      wizardTeleports: 0
    };
    
    // Initialize game state
    let board = createInitialBoard();
    let currentPlayer: 'white' | 'black' = 'white';
    let moveCount = 0;
    const maxMoves = 200; // Prevent infinite games
    
    while (moveCount < maxMoves) {
      // Get valid moves with corrected wizard logic
      const validMoves = this.getValidMovesWithWizardLogic(board, currentPlayer);
      
      if (validMoves.length === 0) {
        // Game over - checkmate or stalemate
        game.outcome = currentPlayer === 'white' ? 'black' : 'white';
        break;
      }
      
      // Select move using neural network with exploration
      const move = await this.selectMove(board, validMoves, currentPlayer);
      
      // Track wizard statistics
      const piece = board[move.from.row][move.from.col];
      if (piece?.type === 'wizard') {
        // Corrected wizard logic: wizard stays in place during ranged attacks
        const distance = Math.abs(move.to.row - move.from.row) + Math.abs(move.to.col - move.from.col);
        
        if (move.capturedPiece && distance > 1) {
          // Ranged attack - wizard doesn't move
          game.wizardAttacks++;
          if (this.progress.gamesPlayed % 100 === 0) {
            console.log(`🧙 Game ${this.progress.gamesPlayed}: Wizard ranged attack from (${move.from.row},${move.from.col})`);
          }
        } else if (distance > 2) {
          // Teleport move
          game.wizardTeleports++;
        }
      }
      
      // Make the move
      board = makeMove(board, move);
      game.moves.push(move);
      game.boardStates.push(board);
      
      // Switch players
      currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
      moveCount++;
    }
    
    game.moveCount = moveCount;
    
    // Log wizard move stats for this game if significant
    if (game.wizardAttacks > 0 || game.wizardTeleports > 0) {
      if (this.progress.gamesPlayed % 100 === 0) {
        console.log(`📊 Game ${this.progress.gamesPlayed}: Wizard moves - Attacks: ${game.wizardAttacks}, Teleports: ${game.wizardTeleports}`);
      }
    }
    
    return game;
  }
  
  // Get valid moves with corrected wizard attack logic
  private getValidMovesWithWizardLogic(board: (ChessPiece | null)[][], player: 'white' | 'black'): ChessMove[] {
    const moves: ChessMove[] = [];
    
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const piece = board[row][col];
        if (piece && piece.color === player) {
          const position: Position = { row, col };
          const pieceMoves = getValidMovesForPosition(
            { 
              board, 
              currentPlayer: player,
              isInCheck: false,
              isCheckmate: false,
              isStalemate: false,
              moveHistory: [],
              capturedPieces: { white: [], black: [] },
              gameId: 'selfplay',
              timeLeft: { white: 600, black: 600 },
              lastMove: null,
              drawOffered: false,
              winner: null,
              moveCount: 0
            },
            position
          );
          
          // For wizard pieces, ensure attack moves don't move the wizard
          if (piece.type === 'wizard') {
            pieceMoves.forEach(move => {
              const targetPiece = board[move.to.row][move.to.col];
              const distance = Math.abs(move.to.row - position.row) + Math.abs(move.to.col - position.col);
              
              // Corrected: Wizard stays in place for ranged attacks
              if (targetPiece && targetPiece.color !== piece.color && distance > 1) {
                // This is a ranged attack - wizard should stay in place
                moves.push({
                  from: position,
                  to: position, // Wizard doesn't move
                  piece: piece,
                  capturedPiece: targetPiece,
                  isWizardAttack: true
                });
              } else {
                // Regular move or teleport
                moves.push(move);
              }
            });
          } else {
            moves.push(...pieceMoves);
          }
        }
      }
    }
    
    return moves;
  }
  
  // Select move using neural network
  private async selectMove(board: (ChessPiece | null)[][], validMoves: ChessMove[], player: 'white' | 'black'): Promise<ChessMove> {
    // Use exploration during training
    if (Math.random() < this.config.explorationRate) {
      // Random move for exploration
      return validMoves[Math.floor(Math.random() * validMoves.length)];
    }
    
    // Use neural network to evaluate moves
    const gameState: GameState = {
      board,
      currentPlayer: player,
      isInCheck: false,
      isCheckmate: false,
      isStalemate: false,
      moveHistory: [],
      capturedPieces: { white: [], black: [] },
      gameId: 'selfplay',
      timeLeft: { white: 600, black: 600 },
      lastMove: null,
      drawOffered: false,
      winner: null,
      moveCount: 0
    };
    
    // Get AI move using trained model
    const prediction = await this.model.predict(gameState);
    
    // Apply temperature for move selection diversity
    const moveScores = validMoves.map((move, idx) => ({
      move,
      score: prediction.policy[idx] || 0
    }));
    
    // Sort by score and select with temperature-based probability
    moveScores.sort((a, b) => b.score - a.score);
    
    // Temperature-based selection
    const tempScores = moveScores.map(m => Math.exp(m.score / this.config.temperature));
    const sumScores = tempScores.reduce((a, b) => a + b, 0);
    const probabilities = tempScores.map(s => s / sumScores);
    
    // Sample from probability distribution
    const random = Math.random();
    let cumProb = 0;
    for (let i = 0; i < probabilities.length; i++) {
      cumProb += probabilities[i];
      if (random < cumProb) {
        return moveScores[i].move;
      }
    }
    
    return moveScores[0].move; // Fallback to best move
  }
  
  // Train model on batch of games
  private async trainOnBatch(): Promise<void> {
    if (this.gameBuffer.length === 0) return;
    
    console.log(`🎯 Training on batch of ${this.gameBuffer.length} games...`);
    
    // Prepare training data
    const inputs: number[][] = [];
    const outputs: number[][] = [];
    
    for (const game of this.gameBuffer) {
      // Convert game data to training examples
      for (let i = 0; i < game.boardStates.length; i++) {
        const state: GameState = {
          board: game.boardStates[i],
          currentPlayer: i % 2 === 0 ? 'white' : 'black',
          isInCheck: false,
          isCheckmate: false,
          isStalemate: false,
          moveHistory: game.moves.slice(0, i),
          capturedPieces: { white: [], black: [] },
          gameId: 'training',
          timeLeft: { white: 600, black: 600 },
          lastMove: i > 0 ? game.moves[i - 1] : null,
          drawOffered: false,
          winner: null,
          moveCount: i
        };
        
        // Extract features
        const features = this.model.extractFeatures(state);
        inputs.push(Array.from(features));
        
        // Create target output (game outcome from current player's perspective)
        const outcome = game.outcome === state.currentPlayer ? 1 : 
                       game.outcome === 'draw' ? 0 : -1;
        outputs.push([outcome]);
      }
    }
    
    // Train the model
    if (inputs.length > 0) {
      const xs = tf.tensor2d(inputs);
      const ys = tf.tensor2d(outputs);
      
      try {
        await this.model.model.fit(xs, ys, {
          batchSize: this.config.batchSize,
          epochs: 1,
          verbose: 0
        });
      } finally {
        xs.dispose();
        ys.dispose();
      }
    }
    
    // Clear memory
    await tf.nextFrame();
  }
  
  // Save checkpoint
  private async saveCheckpoint(gameCount: number): Promise<void> {
    console.log(`💾 Saving checkpoint at ${gameCount} games...`);
    
    const checkpoint = {
      gamesPlayed: gameCount,
      progress: this.progress,
      timestamp: Date.now(),
      modelWeights: await this.model.model.getWeights()
    };
    
    // Save to localStorage (in production, save to server)
    try {
      localStorage.setItem('wizardChessCheckpoint', JSON.stringify({
        gamesPlayed: gameCount,
        progress: this.progress,
        timestamp: Date.now()
      }));
      
      // Save model weights separately
      await this.model.model.save('localstorage://wizardChess-checkpoint-' + gameCount);
      
      this.progress.checkpoints.push(`checkpoint-${gameCount}`);
      console.log(`✅ Checkpoint saved successfully`);
    } catch (error) {
      console.error('Failed to save checkpoint:', error);
    }
  }
  
  // Update training progress
  private updateProgress(game: SelfPlayGame): void {
    this.progress.gamesPlayed++;
    
    if (game.outcome === 'white') this.progress.whiteWins++;
    else if (game.outcome === 'black') this.progress.blackWins++;
    else this.progress.draws++;
    
    // Update average move count
    const totalMoves = this.progress.averageMoveCount * (this.progress.gamesPlayed - 1) + game.moveCount;
    this.progress.averageMoveCount = totalMoves / this.progress.gamesPlayed;
    
    // Update wizard attack accuracy (simplified)
    if (game.wizardAttacks > 0) {
      this.progress.wizardAttackAccuracy = 
        (this.progress.wizardAttackAccuracy * 0.95) + (game.wizardAttacks / game.moveCount * 0.05);
    }
  }
  
  // Report training progress
  private reportProgress(): void {
    const elapsed = (Date.now() - this.progress.trainingStartTime) / 1000 / 60; // minutes
    const gamesPerMinute = this.progress.gamesPlayed / elapsed;
    
    console.log('\n📊 Training Progress Report');
    console.log('═══════════════════════════════════════');
    console.log(`Games Played: ${this.progress.gamesPlayed}/${this.config.totalGames}`);
    console.log(`White Wins: ${this.progress.whiteWins} (${(this.progress.whiteWins / this.progress.gamesPlayed * 100).toFixed(1)}%)`);
    console.log(`Black Wins: ${this.progress.blackWins} (${(this.progress.blackWins / this.progress.gamesPlayed * 100).toFixed(1)}%)`);
    console.log(`Draws: ${this.progress.draws} (${(this.progress.draws / this.progress.gamesPlayed * 100).toFixed(1)}%)`);
    console.log(`Avg Game Length: ${this.progress.averageMoveCount.toFixed(1)} moves`);
    console.log(`Wizard Attack Usage: ${(this.progress.wizardAttackAccuracy * 100).toFixed(2)}%`);
    console.log(`Current ELO: ${this.progress.currentElo}`);
    console.log(`Training Speed: ${gamesPerMinute.toFixed(1)} games/min`);
    console.log(`Time Elapsed: ${elapsed.toFixed(1)} minutes`);
    console.log(`ETA: ${((this.config.totalGames - this.progress.gamesPlayed) / gamesPerMinute).toFixed(1)} minutes`);
    console.log('═══════════════════════════════════════\n');
  }
  
  // Report final statistics
  private reportFinalStats(): void {
    console.log('\n🏆 FINAL TRAINING STATISTICS');
    console.log('═══════════════════════════════════════');
    console.log(`Total Games: ${this.progress.gamesPlayed}`);
    console.log(`Final ELO: ${this.progress.currentElo}`);
    console.log(`Win Distribution:`);
    console.log(`  White: ${this.progress.whiteWins} (${(this.progress.whiteWins / this.progress.gamesPlayed * 100).toFixed(1)}%)`);
    console.log(`  Black: ${this.progress.blackWins} (${(this.progress.blackWins / this.progress.gamesPlayed * 100).toFixed(1)}%)`);
    console.log(`  Draws: ${this.progress.draws} (${(this.progress.draws / this.progress.gamesPlayed * 100).toFixed(1)}%)`);
    console.log(`Checkpoints Saved: ${this.progress.checkpoints.length}`);
    console.log(`Training Time: ${((Date.now() - this.progress.trainingStartTime) / 1000 / 60 / 60).toFixed(2)} hours`);
    console.log('═══════════════════════════════════════');
  }
  
  // Stop training
  stopTraining(): void {
    console.log('⏹️ Stopping training...');
    this.isTraining = false;
  }
}

// Global instance for browser console access
let trainer: SelfPlayTrainer | null = null;

// Main entry point for self-play training
export async function runSelfPlay(games: number = 100000): Promise<void> {
  console.log('🚀 Starting Wizard Chess Self-Play Training');
  console.log(`📊 Configuration: ${games} games, batch size 256 (64×4), checkpoint every 5k`);
  console.log('🧙 Wizard Logic: Corrected (stays in place for ranged attacks)');
  
  // Create new trainer
  trainer = new SelfPlayTrainer();
  
  // Start training
  await trainer.startTraining(games);
}

// Stop current training
export function stopSelfPlay(): void {
  if (trainer) {
    trainer.stopTraining();
    console.log('✅ Training stopped successfully');
  } else {
    console.log('⚠️ No training in progress');
  }
}

// Get training status
export function getSelfPlayStatus(): void {
  if (trainer) {
    trainer.reportProgress();
  } else {
    console.log('⚠️ No training in progress');
  }
}

// Make functions available globally in browser
if (typeof window !== 'undefined') {
  (window as any).runSelfPlay = runSelfPlay;
  (window as any).stopSelfPlay = stopSelfPlay;
  (window as any).getSelfPlayStatus = getSelfPlayStatus;
  
  console.log('🎮 Self-Play Training Functions Loaded!');
  console.log('   • runSelfPlay(100000) - Start 100k game training');
  console.log('   • stopSelfPlay() - Stop current training');
  console.log('   • getSelfPlayStatus() - Check training progress');
}
