import { GameState, ChessMove, AIDifficulty } from './types';
import { createInitialBoard, makeMove } from './gameEngine';
import { getAIMove } from './aiPlayer';

interface TrainingGame {
  id: number;
  winner: 'white' | 'black' | null;
  moves: number;
  duration: number;
  whiteStrategy: string;
  blackStrategy: string;
}

interface TrainingStats {
  gamesPlayed: number;
  whiteWins: number;
  blackWins: number;
  draws: number;
  averageMoves: number;
  winningStrategies: { [key: string]: number };
}

export class AITrainer {
  private stats: TrainingStats = {
    gamesPlayed: 0,
    whiteWins: 0,
    blackWins: 0,
    draws: 0,
    averageMoves: 0,
    winningStrategies: {}
  };

  private games: TrainingGame[] = [];
  private isTraining = false;

  async runTrainingSession(numGames: number, difficulty: AIDifficulty = 'hard'): Promise<TrainingStats> {
    if (this.isTraining) {
      console.log('Training already in progress, skipping...');
      return this.stats;
    }

    this.isTraining = true;
    
    // Reset stats for fresh session
    this.resetStats();
    
    console.log(`🧠 Starting AI training session: ${numGames} games at ${difficulty} difficulty`);

    for (let i = 0; i < numGames; i++) {
      if (!this.isTraining) break; // Allow stopping training
      
      try {
        const game = await this.playTrainingGame(i + 1, difficulty);
        this.games.push(game);
        this.updateStats(game);
        
        // Log progress every 5 games for better feedback
        if ((i + 1) % 5 === 0) {
          console.log(`📊 Progress: ${i + 1}/${numGames} games completed`);
          if ((i + 1) % 10 === 0) {
            this.logCurrentStats();
          }
        }
      } catch (error) {
        console.error(`Error in training game ${i + 1}:`, error);
        continue;
      }
    }

    this.isTraining = false;
    console.log('🎓 Training session completed!');
    this.logFinalStats();
    return this.stats;
  }

  private async playTrainingGame(gameId: number, difficulty: AIDifficulty): Promise<TrainingGame> {
    const startTime = Date.now();
    let gameState: GameState = {
      board: createInitialBoard(),
      currentPlayer: 'white',
      selectedPosition: null,
      validMoves: [],
      gamePhase: 'playing',
      gameMode: 'ai-vs-ai',
      aiDifficulty: difficulty,
      moveHistory: [],
      isInCheck: false,
      isCheckmate: false,
      isStalemate: false,
      winner: null
    };

    let moveCount = 0;
    const maxMoves = 100; // Reduced to prevent infinite games
    let consecutiveNoProgress = 0; // Track if game is stuck

    while (gameState.gamePhase === 'playing' && moveCount < maxMoves) {
      const aiMove = getAIMove(gameState);
      if (!aiMove) {
        // No valid moves available - this should trigger game end
        console.log(`No AI move available at move ${moveCount + 1}, ending game`);
        break;
      }

      const prevBoardState = JSON.stringify(gameState.board);
      gameState = makeMove(gameState, aiMove);
      moveCount++;
      
      // Check if game state actually changed
      const newBoardState = JSON.stringify(gameState.board);
      if (prevBoardState === newBoardState) {
        consecutiveNoProgress++;
        if (consecutiveNoProgress > 5) {
          console.log(`Game stuck at move ${moveCount}, forcing end`);
          break;
        }
      } else {
        consecutiveNoProgress = 0;
      }

      // Force end if game is clearly decided but not detected
      if (moveCount > 50 && gameState.gamePhase === 'playing') {
        const pieces = gameState.board.flat().filter(p => p !== null);
        const whitePieces = pieces.filter(p => p!.color === 'white');
        const blackPieces = pieces.filter(p => p!.color === 'black');
        
        // If one side has significantly fewer pieces, end the game
        if (whitePieces.length <= 3 || blackPieces.length <= 3) {
          const winner = whitePieces.length > blackPieces.length ? 'white' : 'black';
          gameState = { ...gameState, gamePhase: 'ended', winner };
          break;
        }
      }

      // Add small delay to prevent browser freeze (only every 10 moves)
      if (moveCount % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }

    // If maxMoves reached without winner, declare draw
    if (moveCount >= maxMoves && !gameState.winner) {
      gameState = { ...gameState, gamePhase: 'ended', isStalemate: true };
    }

    const duration = Date.now() - startTime;

    return {
      id: gameId,
      winner: gameState.winner,
      moves: moveCount,
      duration,
      whiteStrategy: this.getStrategyDescription(gameState, 'white'),
      blackStrategy: this.getStrategyDescription(gameState, 'black')
    };
  }

  private getStrategyDescription(gameState: GameState, color: 'white' | 'black'): string {
    const moves = gameState.moveHistory.filter(move => move.piece.color === color);
    
    const wizardMoves = moves.filter(move => move.piece.type === 'wizard').length;
    const captures = moves.filter(move => move.captured).length;
    const teleports = moves.filter(move => move.isWizardTeleport).length;
    const wizardAttacks = moves.filter(move => move.isWizardAttack).length;

    let strategy = 'Balanced';
    if (wizardMoves > moves.length * 0.3) strategy = 'Wizard-focused';
    else if (captures > moves.length * 0.4) strategy = 'Aggressive';
    else if (teleports > wizardMoves * 0.5) strategy = 'Mobile';
    else if (wizardAttacks > wizardMoves * 0.6) strategy = 'Tactical';

    return strategy;
  }

  private updateStats(game: TrainingGame): void {
    this.stats.gamesPlayed++;
    
    if (game.winner === 'white') this.stats.whiteWins++;
    else if (game.winner === 'black') this.stats.blackWins++;
    else this.stats.draws++;

    // Update average moves
    const totalMoves = this.games.reduce((sum, g) => sum + g.moves, 0);
    this.stats.averageMoves = Math.round(totalMoves / this.stats.gamesPlayed);

    // Track winning strategies
    if (game.winner) {
      const strategy = game.winner === 'white' ? game.whiteStrategy : game.blackStrategy;
      this.stats.winningStrategies[strategy] = (this.stats.winningStrategies[strategy] || 0) + 1;
    }
  }

  private logCurrentStats(): void {
    const winRate = {
      white: Math.round((this.stats.whiteWins / this.stats.gamesPlayed) * 100),
      black: Math.round((this.stats.blackWins / this.stats.gamesPlayed) * 100),
      draw: Math.round((this.stats.draws / this.stats.gamesPlayed) * 100)
    };

    console.log(`📈 Current Stats: White ${winRate.white}% | Black ${winRate.black}% | Draw ${winRate.draw}%`);
    console.log(`🎯 Average game length: ${this.stats.averageMoves} moves`);
  }

  private logFinalStats(): void {
    console.log('\n🏆 TRAINING COMPLETE - FINAL RESULTS:');
    console.log(`Games Played: ${this.stats.gamesPlayed}`);
    console.log(`White Wins: ${this.stats.whiteWins} (${Math.round((this.stats.whiteWins / this.stats.gamesPlayed) * 100)}%)`);
    console.log(`Black Wins: ${this.stats.blackWins} (${Math.round((this.stats.blackWins / this.stats.gamesPlayed) * 100)}%)`);
    console.log(`Draws: ${this.stats.draws} (${Math.round((this.stats.draws / this.stats.gamesPlayed) * 100)}%)`);
    console.log(`Average Moves: ${this.stats.averageMoves}`);
    
    console.log('\n🧠 WINNING STRATEGIES:');
    Object.entries(this.stats.winningStrategies)
      .sort(([,a], [,b]) => b - a)
      .forEach(([strategy, wins]) => {
        const percentage = Math.round((wins / (this.stats.whiteWins + this.stats.blackWins)) * 100);
        console.log(`${strategy}: ${wins} wins (${percentage}%)`);
      });

    // Generate insights
    this.generateInsights();
  }

  private generateInsights(): void {
    console.log('\n🔍 AI TRAINING INSIGHTS:');
    
    const mostSuccessful = Object.entries(this.stats.winningStrategies)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (mostSuccessful) {
      console.log(`Most successful strategy: ${mostSuccessful[0]} (${mostSuccessful[1]} wins)`);
    }

    if (this.stats.averageMoves < 30) {
      console.log('Games are ending quickly - aggressive strategies dominate');
    } else if (this.stats.averageMoves > 60) {
      console.log('Games are lengthy - defensive strategies are effective');
    }

    const whiteAdvantage = this.stats.whiteWins - this.stats.blackWins;
    if (Math.abs(whiteAdvantage) > this.stats.gamesPlayed * 0.1) {
      console.log(`${whiteAdvantage > 0 ? 'White' : 'Black'} has significant advantage (${Math.abs(whiteAdvantage)} game difference)`);
    } else {
      console.log('Game appears well-balanced between white and black');
    }
  }

  stopTraining(): void {
    this.isTraining = false;
    console.log('🛑 Training stopped by user');
  }

  getStats(): TrainingStats {
    return { ...this.stats };
  }

  getGames(): TrainingGame[] {
    return [...this.games];
  }

  resetStats(): void {
    this.stats = {
      gamesPlayed: 0,
      whiteWins: 0,
      blackWins: 0,
      draws: 0,
      averageMoves: 0,
      winningStrategies: {}
    };
    this.games = [];
    console.log('📊 Training stats reset');
  }
}

// Global trainer instance
export const aiTrainer = new AITrainer();