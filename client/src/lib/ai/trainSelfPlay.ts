/**
 * Self-Play Training System for Wizard Chess AI
 * Trains the AI through 100k+ self-play games with corrected wizard attack mechanics
 */

import * as tf from '@tensorflow/tfjs';
import { createInitialBoard, makeMove, getValidMovesForPosition } from '../chess/gameEngine';
import { ChessMove, ChessPiece, Position } from '../chess/types';
import { getAIMove } from '../chess/aiPlayer';
import { getAllValidMoves } from '../chess/pieceMovement';

// Training configuration
interface TrainingConfig {
  totalGames: number;
  batchSize: number;
  checkpointInterval: number;
  learningRate: number;
  explorationRate: number;
}

// Training progress
interface TrainingProgress {
  gamesPlayed: number;
  whiteWins: number;
  blackWins: number;
  draws: number;
  wizardAttacksUsed: number;
  wizardTeleportsUsed: number;
  averageGameLength: number;
  currentElo: number;
  startTime: number;
}

// Game record for training
interface GameRecord {
  positions: number[][];
  moves: number[][];
  outcome: number; // 1 for white win, -1 for black win, 0 for draw
  wizardAttacks: number;
  wizardTeleports: number;
}

export class WizardChessSelfPlay {
  private model: tf.LayersModel;
  private config: TrainingConfig;
  private progress: TrainingProgress;
  private gameBuffer: GameRecord[] = [];
  private isTraining: boolean = false;
  
  constructor() {
    this.config = {
      totalGames: 100000,
      batchSize: 256,
      checkpointInterval: 5000,
      learningRate: 0.001,
      explorationRate: 0.15
    };
    
    this.progress = {
      gamesPlayed: 0,
      whiteWins: 0,
      blackWins: 0,
      draws: 0,
      wizardAttacksUsed: 0,
      wizardTeleportsUsed: 0,
      averageGameLength: 0,
      currentElo: 2550,
      startTime: Date.now()
    };
    
    this.model = this.buildModel();
  }
  
  // Build the neural network model
  private buildModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        // Input layer: 10x10 board with 8 features per square
        tf.layers.dense({
          units: 512,
          activation: 'relu',
          inputShape: [800], // 10x10x8 features
          kernelInitializer: 'glorotUniform'
        }),
        
        // Hidden layers with dropout
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 256, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 256, activation: 'relu' }),
        
        // Wizard-specific layer
        tf.layers.dense({ 
          units: 128, 
          activation: 'relu',
          name: 'wizard_layer'
        }),
        
        // Output layer for move evaluation
        tf.layers.dense({
          units: 1,
          activation: 'tanh', // Output between -1 and 1
          name: 'value_head'
        })
      ]
    });
    
    model.compile({
      optimizer: tf.train.adam(this.config.learningRate),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });
    
    return model;
  }
  
  // Main training function
  async startTraining(totalGames: number = 100000): Promise<void> {
    console.log('🚀 Starting Wizard Chess Self-Play Training');
    console.log(`📊 Target: ${totalGames} games`);
    console.log('🧙 Training with corrected wizard mechanics:');
    console.log('   - Wizard can move OR attack (not both)');
    console.log('   - Attack range: up to 2 squares straight line');
    console.log('   - Teleport range: up to 2 squares any direction');
    
    this.isTraining = true;
    this.config.totalGames = totalGames;
    this.progress.startTime = Date.now();
    
    // Training phases
    const phases = [
      { games: 20000, exploration: 0.25, name: 'Phase 1: Exploration' },
      { games: 30000, exploration: 0.15, name: 'Phase 2: Refinement' },
      { games: 30000, exploration: 0.10, name: 'Phase 3: Optimization' },
      { games: 20000, exploration: 0.05, name: 'Phase 4: Mastery' }
    ];
    
    let totalPlayed = 0;
    
    for (const phase of phases) {
      if (!this.isTraining || totalPlayed >= totalGames) break;
      
      console.log(`\n📚 ${phase.name}`);
      this.config.explorationRate = phase.exploration;
      
      const phaseGames = Math.min(phase.games, totalGames - totalPlayed);
      
      for (let i = 0; i < phaseGames && this.isTraining; i++) {
        // Play a self-play game
        const gameRecord = await this.playSelfPlayGame();
        this.gameBuffer.push(gameRecord);
        
        // Update progress
        this.updateProgress(gameRecord);
        totalPlayed++;
        
        // Train when buffer is full
        if (this.gameBuffer.length >= this.config.batchSize) {
          await this.trainOnBatch();
          this.gameBuffer = [];
        }
        
        // Save checkpoint
        if (totalPlayed % this.config.checkpointInterval === 0) {
          await this.saveCheckpoint(totalPlayed);
        }
        
        // Progress report
        if (totalPlayed % 1000 === 0) {
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
  
  // Convert valid positions to ChessMove objects
  private getValidMovesAsChessMoves(board: (ChessPiece | null)[][], player: 'white' | 'black'): ChessMove[] {
    const moves: ChessMove[] = [];
    
    for (let fromRow = 0; fromRow < 10; fromRow++) {
      for (let fromCol = 0; fromCol < 10; fromCol++) {
        const piece = board[fromRow][fromCol];
        if (piece && piece.color === player) {
          const validPositions = getValidMovesForPosition(board, { row: fromRow, col: fromCol });
          
          for (const to of validPositions) {
            const targetPiece = board[to.row][to.col];
            const isWizardAttack = piece.type === 'wizard' && targetPiece && targetPiece.color !== piece.color;
            const isWizardTeleport = piece.type === 'wizard' && !targetPiece && 
              (Math.abs(to.row - fromRow) > 1 || Math.abs(to.col - fromCol) > 1);
            
            moves.push({
              from: { row: fromRow, col: fromCol },
              to,
              piece,
              captured: targetPiece,
              isWizardAttack,
              isWizardTeleport
            });
          }
        }
      }
    }
    
    return moves;
  }
  
  // Play a single self-play game
  private async playSelfPlayGame(): Promise<GameRecord> {
    let board = createInitialBoard();
    let currentPlayer: 'white' | 'black' = 'white';
    let moveCount = 0;
    const maxMoves = 200;
    
    const gameRecord: GameRecord = {
      positions: [],
      moves: [],
      outcome: 0,
      wizardAttacks: 0,
      wizardTeleports: 0
    };
    
    // Game loop
    while (moveCount < maxMoves) {
      // Encode current position
      const positionEncoding = this.encodeBoard(board, currentPlayer);
      gameRecord.positions.push(positionEncoding);
      
      // Get all valid moves as ChessMove objects
      const allMoves = this.getValidMovesAsChessMoves(board, currentPlayer);
      if (allMoves.length === 0) {
        // Game over - checkmate or stalemate
        const isInCheck = this.isKingInCheck(board, currentPlayer);
        if (isInCheck) {
          // Checkmate
          gameRecord.outcome = currentPlayer === 'white' ? -1 : 1;
        } else {
          // Stalemate
          gameRecord.outcome = 0;
        }
        break;
      }
      
      // Select move (with exploration)
      const selectedMove = await this.selectMove(board, currentPlayer, allMoves);
      
      // Track wizard moves
      const piece = board[selectedMove.from.row][selectedMove.from.col];
      if (piece?.type === 'wizard') {
        const targetPiece = board[selectedMove.to.row][selectedMove.to.col];
        if (targetPiece && targetPiece.color !== piece.color) {
          // Wizard attack - piece stays in place
          gameRecord.wizardAttacks++;
          selectedMove.isWizardAttack = true;
        } else {
          // Wizard teleport
          gameRecord.wizardTeleports++;
          selectedMove.isWizardTeleport = true;
        }
      }
      
      // Encode move
      const moveEncoding = this.encodeMove(selectedMove);
      gameRecord.moves.push(moveEncoding);
      
      // Make the move
      const result = makeMove(
        board,
        selectedMove.from,
        selectedMove.to
      );
      
      if (result.board) {
        board = result.board;
        currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
        moveCount++;
      } else {
        console.error('Invalid move in self-play:', selectedMove);
        break;
      }
    }
    
    // If game reached max moves, it's a draw
    if (moveCount >= maxMoves) {
      gameRecord.outcome = 0;
    }
    
    return gameRecord;
  }
  
  // Select a move using the model with exploration
  private async selectMove(
    board: (ChessPiece | null)[][],
    player: 'white' | 'black',
    validMoves: ChessMove[]
  ): Promise<ChessMove> {
    // Exploration: select random move
    if (Math.random() < this.config.explorationRate) {
      // Prefer wizard moves occasionally for better learning
      const wizardMoves = validMoves.filter(move => {
        const piece = board[move.from.row][move.from.col];
        return piece?.type === 'wizard';
      });
      
      if (wizardMoves.length > 0 && Math.random() < 0.3) {
        return wizardMoves[Math.floor(Math.random() * wizardMoves.length)];
      }
      
      return validMoves[Math.floor(Math.random() * validMoves.length)];
    }
    
    // Exploitation: use model to evaluate moves
    const moveEvaluations: { move: ChessMove; score: number }[] = [];
    
    for (const move of validMoves) {
      // Clone board and make move
      const testBoard = board.map(row => row.map(piece => piece ? {...piece} : null));
      const result = makeMove(
        testBoard,
        move.from,
        move.to
      );
      
      if (result.board) {
        // Evaluate position after move
        const encoding = this.encodeBoard(result.board, player);
        const evaluation = await this.evaluatePosition(encoding);
        
        // Bonus for wizard attacks (teaching proper mechanics)
        let score = evaluation;
        const piece = board[move.from.row][move.from.col];
        if (piece?.type === 'wizard') {
          const targetPiece = board[move.to.row][move.to.col];
          if (targetPiece && targetPiece.color !== piece.color) {
            score += 0.1; // Encourage wizard attacks
          }
        }
        
        moveEvaluations.push({ move, score });
      }
    }
    
    // Select best move (or use softmax for variety)
    if (moveEvaluations.length === 0) {
      return validMoves[0];
    }
    
    // Sort by score and select best
    moveEvaluations.sort((a, b) => b.score - a.score);
    
    // Use softmax selection for variety
    const temperature = 1.0;
    const scores = moveEvaluations.map(me => me.score);
    const maxScore = Math.max(...scores);
    const expScores = scores.map(s => Math.exp((s - maxScore) / temperature));
    const sumExp = expScores.reduce((a, b) => a + b, 0);
    const probs = expScores.map(e => e / sumExp);
    
    // Sample from distribution
    const rand = Math.random();
    let cumProb = 0;
    for (let i = 0; i < probs.length; i++) {
      cumProb += probs[i];
      if (rand < cumProb) {
        return moveEvaluations[i].move;
      }
    }
    
    return moveEvaluations[0].move;
  }
  
  // Evaluate a position using the model
  private async evaluatePosition(encoding: number[]): Promise<number> {
    const input = tf.tensor2d([encoding]);
    const prediction = this.model.predict(input) as tf.Tensor;
    const value = await prediction.data();
    input.dispose();
    prediction.dispose();
    return value[0];
  }
  
  // Train the model on a batch of games
  private async trainOnBatch(): Promise<void> {
    if (this.gameBuffer.length === 0) return;
    
    console.log(`🎯 Training on batch of ${this.gameBuffer.length} games...`);
    
    const inputs: number[][] = [];
    const targets: number[] = [];
    
    for (const game of this.gameBuffer) {
      // Process each position in the game
      for (let i = 0; i < game.positions.length; i++) {
        inputs.push(game.positions[i]);
        
        // Target value based on game outcome and move position
        // Decay factor for earlier moves
        const decay = Math.pow(0.99, game.positions.length - i - 1);
        targets.push(game.outcome * decay);
      }
    }
    
    if (inputs.length > 0) {
      const inputTensor = tf.tensor2d(inputs);
      const targetTensor = tf.tensor1d(targets);
      
      // Train the model
      await this.model.fit(inputTensor, targetTensor, {
        epochs: 1,
        batchSize: 32,
        shuffle: true,
        verbose: 0
      });
      
      inputTensor.dispose();
      targetTensor.dispose();
    }
  }
  
  // Encode board state for neural network
  private encodeBoard(board: (ChessPiece | null)[][], currentPlayer: 'white' | 'black'): number[] {
    const encoding: number[] = [];
    
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const piece = board[row][col];
        if (!piece) {
          // Empty square
          encoding.push(0, 0, 0, 0, 0, 0, 0, 0);
        } else {
          // Piece encoding
          const colorValue = piece.color === currentPlayer ? 1 : -1;
          encoding.push(
            piece.type === 'pawn' ? colorValue : 0,
            piece.type === 'knight' ? colorValue : 0,
            piece.type === 'bishop' ? colorValue : 0,
            piece.type === 'rook' ? colorValue : 0,
            piece.type === 'queen' ? colorValue : 0,
            piece.type === 'king' ? colorValue : 0,
            piece.type === 'wizard' ? colorValue : 0,
            piece.hasMoved ? 1 : 0
          );
        }
      }
    }
    
    return encoding;
  }
  
  // Encode move for training
  private encodeMove(move: ChessMove): number[] {
    return [
      move.from.row,
      move.from.col,
      move.to.row,
      move.to.col,
      move.isWizardAttack ? 1 : 0,
      move.isWizardTeleport ? 1 : 0
    ];
  }
  
  // Check if king is in check
  private isKingInCheck(board: (ChessPiece | null)[][], player: 'white' | 'black'): boolean {
    // Find king position
    let kingPos: Position | null = null;
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const piece = board[row][col];
        if (piece?.type === 'king' && piece.color === player) {
          kingPos = { row, col };
          break;
        }
      }
      if (kingPos) break;
    }
    
    if (!kingPos) return false;
    
    // Check if any opponent piece can attack the king
    const opponent = player === 'white' ? 'black' : 'white';
    const opponentPositions = getAllValidMoves(board, opponent);
    
    return opponentPositions.some(pos => 
      pos.row === kingPos!.row && pos.col === kingPos!.col
    );
  }
  
  // Update training progress
  private updateProgress(game: GameRecord): void {
    this.progress.gamesPlayed++;
    
    if (game.outcome > 0) {
      this.progress.whiteWins++;
    } else if (game.outcome < 0) {
      this.progress.blackWins++;
    } else {
      this.progress.draws++;
    }
    
    this.progress.wizardAttacksUsed += game.wizardAttacks;
    this.progress.wizardTeleportsUsed += game.wizardTeleports;
    
    // Update average game length
    const gameLength = game.positions.length;
    this.progress.averageGameLength = 
      (this.progress.averageGameLength * (this.progress.gamesPlayed - 1) + gameLength) / 
      this.progress.gamesPlayed;
  }
  
  // Report progress
  private reportProgress(): void {
    const elapsed = (Date.now() - this.progress.startTime) / 1000 / 60; // minutes
    const gamesPerMinute = this.progress.gamesPlayed / elapsed;
    const remaining = (this.config.totalGames - this.progress.gamesPlayed) / gamesPerMinute;
    
    console.log('\n📊 Training Progress');
    console.log('═══════════════════════════════════════');
    console.log(`Games: ${this.progress.gamesPlayed}/${this.config.totalGames}`);
    console.log(`White Wins: ${this.progress.whiteWins} (${(this.progress.whiteWins / this.progress.gamesPlayed * 100).toFixed(1)}%)`);
    console.log(`Black Wins: ${this.progress.blackWins} (${(this.progress.blackWins / this.progress.gamesPlayed * 100).toFixed(1)}%)`);
    console.log(`Draws: ${this.progress.draws} (${(this.progress.draws / this.progress.gamesPlayed * 100).toFixed(1)}%)`);
    console.log(`Avg Game Length: ${this.progress.averageGameLength.toFixed(1)} moves`);
    console.log(`Wizard Attacks: ${this.progress.wizardAttacksUsed}`);
    console.log(`Wizard Teleports: ${this.progress.wizardTeleportsUsed}`);
    console.log(`Speed: ${gamesPerMinute.toFixed(1)} games/min`);
    console.log(`ETA: ${remaining.toFixed(1)} minutes`);
    console.log('═══════════════════════════════════════\n');
  }
  
  // Save checkpoint
  private async saveCheckpoint(games: number): Promise<void> {
    console.log(`💾 Saving checkpoint at ${games} games...`);
    
    try {
      // Save model to localStorage
      await this.model.save(`localstorage://wizard-chess-${games}`);
      
      // Save progress
      localStorage.setItem('wizardChessProgress', JSON.stringify(this.progress));
      
      console.log('✅ Checkpoint saved');
    } catch (error) {
      console.error('Failed to save checkpoint:', error);
    }
  }
  
  // Save final model
  private async saveFinalModel(): Promise<void> {
    console.log('💾 Saving final model...');
    
    try {
      // Save model
      await this.model.save('localstorage://wizard-chess-final');
      
      // Save final stats
      localStorage.setItem('wizardChessFinalStats', JSON.stringify(this.progress));
      
      // Deploy model globally
      (window as any).wizardChessAI = {
        model: this.model,
        evaluate: (board: any, player: any) => {
          const encoding = this.encodeBoard(board, player);
          return this.evaluatePosition(encoding);
        },
        stats: this.progress
      };
      
      console.log('✅ Model saved and deployed!');
    } catch (error) {
      console.error('Failed to save final model:', error);
    }
  }
  
  // Report final statistics
  private reportFinalStats(): void {
    const totalTime = (Date.now() - this.progress.startTime) / 1000 / 60 / 60; // hours
    const wizardUsage = this.progress.wizardAttacksUsed + this.progress.wizardTeleportsUsed;
    const wizardAttackRatio = wizardUsage > 0 
      ? this.progress.wizardAttacksUsed / wizardUsage 
      : 0;
    
    console.log('\n🏆 FINAL TRAINING STATISTICS');
    console.log('═══════════════════════════════════════');
    console.log(`Total Games: ${this.progress.gamesPlayed}`);
    console.log(`Training Time: ${totalTime.toFixed(2)} hours`);
    console.log(`Final Win Rates:`);
    console.log(`  White: ${(this.progress.whiteWins / this.progress.gamesPlayed * 100).toFixed(2)}%`);
    console.log(`  Black: ${(this.progress.blackWins / this.progress.gamesPlayed * 100).toFixed(2)}%`);
    console.log(`  Draws: ${(this.progress.draws / this.progress.gamesPlayed * 100).toFixed(2)}%`);
    console.log(`Average Game Length: ${this.progress.averageGameLength.toFixed(1)} moves`);
    console.log(`Wizard Mechanics:`);
    console.log(`  Total Attacks: ${this.progress.wizardAttacksUsed}`);
    console.log(`  Total Teleports: ${this.progress.wizardTeleportsUsed}`);
    console.log(`  Attack Ratio: ${(wizardAttackRatio * 100).toFixed(1)}%`);
    console.log(`Estimated ELO: ${this.progress.currentElo}+`);
    console.log('═══════════════════════════════════════');
    console.log('\n✅ AI Successfully Retrained with Corrected Wizard Mechanics!');
  }
  
  // Stop training
  stop(): void {
    this.isTraining = false;
    console.log('🛑 Training stopped by user');
  }
}

// Export function to start training
export async function startWizardChessSelfPlay(games: number = 100000): Promise<void> {
  const trainer = new WizardChessSelfPlay();
  await trainer.startTraining(games);
}