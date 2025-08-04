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
    this.isTraining = true;
    console.log(`🧠 Starting AI training session: ${numGames} games at ${difficulty} difficulty`);

    for (let i = 0; i < numGames; i++) {
      if (!this.isTraining) break; // Allow stopping training
      
      const game = await this.playTrainingGame(i + 1, difficulty);
      this.games.push(game);
      this.updateStats(game);
      
      // Log progress every 10 games
      if ((i + 1) % 10 === 0) {
        console.log(`📊 Progress: ${i + 1}/${numGames} games completed`);
        this.logCurrentStats();
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
    const maxMoves = 200; // Prevent infinite games

    while (gameState.gamePhase === 'playing' && moveCount < maxMoves) {
      const aiMove = getAIMove(gameState);
      if (!aiMove) break;

      gameState = makeMove(gameState, aiMove);
      moveCount++;
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