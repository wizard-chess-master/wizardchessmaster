import { GameState, ChessMove, PieceColor } from './types';
import { makeMove, isKingInCheck } from './gameEngine';
import { getAllValidMoves as getAllValidMovesFromBoard } from './pieceMovement';
import { advancedAI, GameAnalysisData, StrategyPattern } from './advancedAI';

// Mass training system for 1000-game self-play
export class MassAITraining {
  private trainingStats: TrainingStats;
  private strategyPatterns: Map<string, StrategyPattern>;
  private gameLog: TrainingGameData[] = [];
  
  constructor() {
    this.trainingStats = this.loadTrainingStats();
    this.strategyPatterns = new Map();
    this.loadStrategyPatterns();
  }

  // Run 1000-game training session
  public async runMassTraining(
    gameCount: number = 1000,
    onProgress?: (progress: TrainingProgress) => void
  ): Promise<TrainingResults> {
    console.log(`🚀 Starting mass training: ${gameCount} games`);
    
    const startTime = Date.now();
    const results: TrainingResults = {
      totalGames: gameCount,
      whiteWins: 0,
      blackWins: 0,
      draws: 0,
      avgGameLength: 0,
      strategiesLearned: 0,
      completionTime: 0,
      learningProgress: []
    };

    let totalGameLength = 0;
    const batchSize = 50; // Process in batches to avoid blocking

    for (let batch = 0; batch < Math.ceil(gameCount / batchSize); batch++) {
      const batchStart = batch * batchSize;
      const batchEnd = Math.min((batch + 1) * batchSize, gameCount);
      
      // Process batch of games
      for (let gameIndex = batchStart; gameIndex < batchEnd; gameIndex++) {
        const gameResult = await this.playTrainingGame();
        
        // Update results
        if (gameResult.winner === 'white') {
          results.whiteWins++;
        } else if (gameResult.winner === 'black') {
          results.blackWins++;
        } else {
          results.draws++;
        }
        
        totalGameLength += gameResult.gameLength;
        
        // Learn from game
        advancedAI.learnFromGame(gameResult.analysisData);
        this.analyzeStrategyPatterns(gameResult);
        
        // Log progress
        if (onProgress && (gameIndex + 1) % 10 === 0) {
          onProgress({
            gamesCompleted: gameIndex + 1,
            totalGames: gameCount,
            currentWinRate: {
              white: results.whiteWins / (gameIndex + 1),
              black: results.blackWins / (gameIndex + 1),
              draw: results.draws / (gameIndex + 1)
            },
            avgGameLength: totalGameLength / (gameIndex + 1),
            strategiesLearned: this.strategyPatterns.size
          });
        }
      }
      
      // Small delay between batches to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    // Finalize results
    results.avgGameLength = totalGameLength / gameCount;
    results.strategiesLearned = this.strategyPatterns.size;
    results.completionTime = Date.now() - startTime;
    
    // Update training stats
    this.trainingStats.totalTrainingGames += gameCount;
    this.trainingStats.totalTrainingTime += results.completionTime;
    this.trainingStats.lastTrainingDate = new Date().toISOString();
    this.saveTrainingStats();
    
    // Save strategy patterns
    this.saveStrategyPatterns();
    
    console.log(`✅ Mass training completed: ${gameCount} games in ${results.completionTime}ms`);
    return results;
  }

  // Play a single training game
  private async playTrainingGame(): Promise<TrainingGameResult> {
    let gameState: GameState = {
      board: Array(10).fill(null).map(() => Array(10).fill(null)),
      currentPlayer: 'white',
      gamePhase: 'active',
      winner: null,
      moveHistory: [],
      aiDifficulty: 'hard',
      gameMode: 'ai-vs-ai'
    };
    
    // Initialize board with starting position
    this.initializeBoard(gameState.board);
    gameState.gameMode = 'ai-vs-ai';
    
    const moves: ChessMove[] = [];
    const moveAnalysis: MoveAnalysis[] = [];
    let moveCount = 0;
    const maxMoves = 100; // Prevent infinite games
    
    while (gameState.gamePhase === 'active' && moveCount < maxMoves) {
      const currentColor = gameState.currentPlayer;
      const move = advancedAI.getMove(gameState, currentColor);
      
      if (!move) {
        // No legal moves - game over
        break;
      }
      
      // Analyze move before making it
      const analysis = this.analyzeMoveType(gameState, move);
      moveAnalysis.push(analysis);
      
      // Make the move
      gameState = makeMove(gameState, move);
      moves.push(move);
      moveCount++;
      
      // Check for game end conditions
      if (gameState.gamePhase === 'ended') {
        break;
      }
      
      // Prevent infinite loops
      if (this.detectPositionRepetition(moves)) {
        gameState.gamePhase = 'ended';
        gameState.winner = 'draw';
        break;
      }
    }
    
    // Force draw if too many moves
    if (moveCount >= maxMoves && gameState.gamePhase === 'active') {
      gameState.gamePhase = 'ended';
      gameState.winner = 'draw';
    }
    
    // Calculate game statistics
    const tacticalMoves = moveAnalysis.filter(a => a.type === 'tactical').length;
    const strategicMoves = moveAnalysis.filter(a => a.type === 'strategic').length;
    const avgMobility = moveAnalysis.reduce((sum, a) => sum + a.mobility, 0) / moveAnalysis.length;
    
    const analysisData: GameAnalysisData = {
      winner: gameState.winner || 'draw',
      gameLength: moveCount,
      avgMobility,
      tacticalMoves,
      strategicMoves,
      moves
    };
    
    const gameData: TrainingGameData = {
      moves,
      winner: gameState.winner || 'draw',
      gameLength: moveCount,
      timestamp: Date.now(),
      strategiesUsed: this.identifyStrategies(moveAnalysis),
      openingType: this.classifyOpening(moves.slice(0, 10)),
      endgameType: moveCount > 40 ? this.classifyEndgame(moves.slice(-10)) : 'none'
    };
    
    this.gameLog.push(gameData);
    
    return {
      winner: gameState.winner || 'draw',
      gameLength: moveCount,
      analysisData,
      gameData
    };
  }

  // Analyze move type for strategy learning
  private analyzeMoveType(gameState: GameState, move: ChessMove): MoveAnalysis {
    const validMoves = getAllValidMoves(gameState, gameState.currentPlayer).length;
    
    let type: 'tactical' | 'strategic' | 'positional' = 'positional';
    
    // Tactical move indicators
    if (move.captured) {
      type = 'tactical';
    } else if (move.isWizardAttack) {
      type = 'tactical';
    } else if (this.isCheckMove(gameState, move)) {
      type = 'tactical';
    } else if (this.isCenterControlMove(move)) {
      type = 'strategic';
    } else if (this.isDevelopmentMove(move)) {
      type = 'strategic';
    }
    
    return {
      type,
      mobility: validMoves,
      pieceType: move.piece.type,
      fromSquare: `${String.fromCharCode(97 + move.from.col)}${10 - move.from.row}`,
      toSquare: `${String.fromCharCode(97 + move.to.col)}${10 - move.to.row}`
    };
  }

  // Check if move puts opponent in check
  private isCheckMove(gameState: GameState, move: ChessMove): boolean {
    const testState = makeMove(gameState, move, true);
    const opponentColor = gameState.currentPlayer === 'white' ? 'black' : 'white';
    return isKingInCheck(testState.board, opponentColor);
  }

  // Check if move controls center squares
  private isCenterControlMove(move: ChessMove): boolean {
    const centerSquares = [[4, 4], [4, 5], [5, 4], [5, 5]];
    return centerSquares.some(([r, c]) => r === move.to.row && c === move.to.col);
  }

  // Check if move develops a piece
  private isDevelopmentMove(move: ChessMove): boolean {
    return !move.piece.hasMoved && 
           ['knight', 'bishop', 'wizard'].includes(move.piece.type);
  }

  // Detect position repetition
  private detectPositionRepetition(moves: ChessMove[]): boolean {
    if (moves.length < 6) return false;
    
    // Simple repetition detection - check last 4 moves
    const lastMoves = moves.slice(-4);
    if (lastMoves.length === 4) {
      const move1 = lastMoves[0];
      const move2 = lastMoves[1];
      const move3 = lastMoves[2];
      const move4 = lastMoves[3];
      
      return (move1.from.row === move3.from.row && move1.from.col === move3.from.col &&
              move1.to.row === move3.to.row && move1.to.col === move3.to.col &&
              move2.from.row === move4.from.row && move2.from.col === move4.from.col &&
              move2.to.row === move4.to.row && move2.to.col === move4.to.col);
    }
    
    return false;
  }

  // Identify strategies used in game
  private identifyStrategies(moveAnalysis: MoveAnalysis[]): string[] {
    const strategies: string[] = [];
    
    const tacticalMoves = moveAnalysis.filter(a => a.type === 'tactical').length;
    const strategicMoves = moveAnalysis.filter(a => a.type === 'strategic').length;
    const positionalMoves = moveAnalysis.filter(a => a.type === 'positional').length;
    
    if (tacticalMoves > strategicMoves && tacticalMoves > positionalMoves) {
      strategies.push('aggressive-tactical');
    } else if (strategicMoves > tacticalMoves) {
      strategies.push('strategic-development');
    } else {
      strategies.push('positional-play');
    }
    
    // Check for specific patterns
    const wizardMoves = moveAnalysis.filter(a => a.pieceType === 'wizard').length;
    if (wizardMoves > 3) {
      strategies.push('wizard-focused');
    }
    
    const queenMoves = moveAnalysis.filter(a => a.pieceType === 'queen').length;
    if (queenMoves > 5) {
      strategies.push('queen-aggressive');
    }
    
    return strategies;
  }

  // Classify opening type
  private classifyOpening(openingMoves: ChessMove[]): string {
    if (openingMoves.length < 4) return 'incomplete';
    
    const pawnMoves = openingMoves.filter(m => m.piece.type === 'pawn').length;
    const knightMoves = openingMoves.filter(m => m.piece.type === 'knight').length;
    const bishopMoves = openingMoves.filter(m => m.piece.type === 'bishop').length;
    
    if (pawnMoves >= 3) return 'pawn-storm';
    if (knightMoves >= 2) return 'knight-development';
    if (bishopMoves >= 2) return 'bishop-fianchetto';
    
    return 'standard';
  }

  // Classify endgame type
  private classifyEndgame(endgameMoves: ChessMove[]): string {
    const queenMoves = endgameMoves.filter(m => m.piece.type === 'queen').length;
    const wizardMoves = endgameMoves.filter(m => m.piece.type === 'wizard').length;
    const kingMoves = endgameMoves.filter(m => m.piece.type === 'king').length;
    
    if (queenMoves >= 3) return 'queen-endgame';
    if (wizardMoves >= 2) return 'wizard-endgame';
    if (kingMoves >= 2) return 'king-active';
    
    return 'material';
  }

  // Analyze and store strategy patterns
  private analyzeStrategyPatterns(gameResult: TrainingGameResult): void {
    for (const strategy of gameResult.gameData.strategiesUsed) {
      let pattern = this.strategyPatterns.get(strategy);
      
      if (!pattern) {
        pattern = {
          name: strategy,
          frequency: 0,
          successRate: 0,
          avgGameLength: 0,
          conditions: []
        };
        this.strategyPatterns.set(strategy, pattern);
      }
      
      pattern.frequency++;
      
      // Calculate success rate (wins for the strategy user)
      const isSuccess = gameResult.winner !== 'draw';
      const currentTotal = pattern.frequency - 1;
      const currentSuccesses = pattern.successRate * currentTotal;
      pattern.successRate = (currentSuccesses + (isSuccess ? 1 : 0)) / pattern.frequency;
      
      // Update average game length
      pattern.avgGameLength = (pattern.avgGameLength * currentTotal + gameResult.gameLength) / pattern.frequency;
    }
  }

  // Export training data as JSON
  public exportTrainingData(): string {
    const exportData = {
      trainingStats: this.trainingStats,
      strategyPatterns: Array.from(this.strategyPatterns.entries()),
      neuralWeights: advancedAI.getNeuralWeights(),
      gameLog: this.gameLog.slice(-100), // Last 100 games
      exportDate: new Date().toISOString()
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  // Import training data from JSON
  public importTrainingData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.trainingStats) {
        this.trainingStats = data.trainingStats;
        this.saveTrainingStats();
      }
      
      if (data.strategyPatterns) {
        this.strategyPatterns = new Map(data.strategyPatterns);
        this.saveStrategyPatterns();
      }
      
      if (data.gameLog) {
        this.gameLog = data.gameLog;
      }
      
      console.log('✅ Training data imported successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to import training data:', error);
      return false;
    }
  }

  // Get training statistics
  public getTrainingStats(): TrainingStats {
    return { ...this.trainingStats };
  }

  // Get strategy patterns
  public getStrategyPatterns(): StrategyPattern[] {
    return Array.from(this.strategyPatterns.values());
  }

  // Reset all training data
  public resetTrainingData(): void {
    this.trainingStats = {
      totalTrainingGames: 0,
      totalTrainingTime: 0,
      lastTrainingDate: '',
      bestPerformanceMetrics: {
        shortestWin: Infinity,
        longestGame: 0,
        mostTacticalGame: 0
      }
    };
    
    this.strategyPatterns.clear();
    this.gameLog = [];
    
    this.saveTrainingStats();
    this.saveStrategyPatterns();
    advancedAI.resetNeuralNetwork();
    
    console.log('🔄 All training data reset');
  }

  // Initialize board to starting position
  private initializeBoard(board: (ChessPiece | null)[][]): void {
    // Initialize empty board
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        board[row][col] = null;
      }
    }

    // White pieces (bottom rows)
    const whiteBackRow = [
      { type: 'rook' as const, color: 'white' as PieceColor },
      { type: 'knight' as const, color: 'white' as PieceColor },
      { type: 'bishop' as const, color: 'white' as PieceColor },
      { type: 'queen' as const, color: 'white' as PieceColor },
      { type: 'king' as const, color: 'white' as PieceColor },
      { type: 'bishop' as const, color: 'white' as PieceColor },
      { type: 'knight' as const, color: 'white' as PieceColor },
      { type: 'rook' as const, color: 'white' as PieceColor }
    ];

    // Place white pieces (row 9, columns 1-8)
    for (let i = 0; i < 8; i++) {
      board[9][i + 1] = { ...whiteBackRow[i], hasMoved: false, id: `w-${whiteBackRow[i].type}-${i+1}` };
    }

    // White pawns (row 8, columns 0-9)
    for (let i = 0; i < 10; i++) {
      board[8][i] = { type: 'pawn', color: 'white', hasMoved: false, id: `w-pawn-${i}` };
    }

    // White wizards in corners
    board[9][0] = { type: 'wizard', color: 'white', hasMoved: false, id: 'w-wizard-0' };
    board[9][9] = { type: 'wizard', color: 'white', hasMoved: false, id: 'w-wizard-9' };

    // Black pieces (top rows)  
    const blackBackRow = [
      { type: 'rook' as const, color: 'black' as PieceColor },
      { type: 'knight' as const, color: 'black' as PieceColor },
      { type: 'bishop' as const, color: 'black' as PieceColor },
      { type: 'queen' as const, color: 'black' as PieceColor },
      { type: 'king' as const, color: 'black' as PieceColor },
      { type: 'bishop' as const, color: 'black' as PieceColor },
      { type: 'knight' as const, color: 'black' as PieceColor },
      { type: 'rook' as const, color: 'black' as PieceColor }
    ];

    // Place black pieces (row 0, columns 1-8)
    for (let i = 0; i < 8; i++) {
      board[0][i + 1] = { ...blackBackRow[i], hasMoved: false, id: `b-${blackBackRow[i].type}-${i+1}` };
    }

    // Black pawns (row 1, columns 0-9)
    for (let i = 0; i < 10; i++) {
      board[1][i] = { type: 'pawn', color: 'black', hasMoved: false, id: `b-pawn-${i}` };
    }

    // Black wizards in corners
    board[0][0] = { type: 'wizard', color: 'black', hasMoved: false, id: 'b-wizard-0' };
    board[0][9] = { type: 'wizard', color: 'black', hasMoved: false, id: 'b-wizard-9' };
  }

  // Save/load methods
  private saveTrainingStats(): void {
    localStorage.setItem('fantasy-chess-training-stats', JSON.stringify(this.trainingStats));
  }

  private loadTrainingStats(): TrainingStats {
    const stored = localStorage.getItem('fantasy-chess-training-stats');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.warn('Failed to load training stats');
      }
    }
    
    return {
      totalTrainingGames: 0,
      totalTrainingTime: 0,
      lastTrainingDate: '',
      bestPerformanceMetrics: {
        shortestWin: Infinity,
        longestGame: 0,
        mostTacticalGame: 0
      }
    };
  }

  private saveStrategyPatterns(): void {
    const patternsArray = Array.from(this.strategyPatterns.entries());
    localStorage.setItem('fantasy-chess-strategy-patterns', JSON.stringify(patternsArray));
  }

  private loadStrategyPatterns(): void {
    const stored = localStorage.getItem('fantasy-chess-strategy-patterns');
    if (stored) {
      try {
        const patternsArray = JSON.parse(stored);
        this.strategyPatterns = new Map(patternsArray);
      } catch (e) {
        console.warn('Failed to load strategy patterns');
      }
    }
  }
}

// Interfaces for training system
interface TrainingStats {
  totalTrainingGames: number;
  totalTrainingTime: number;
  lastTrainingDate: string;
  bestPerformanceMetrics: {
    shortestWin: number;
    longestGame: number;
    mostTacticalGame: number;
  };
}

interface TrainingProgress {
  gamesCompleted: number;
  totalGames: number;
  currentWinRate: {
    white: number;
    black: number;
    draw: number;
  };
  avgGameLength: number;
  strategiesLearned: number;
}

interface TrainingResults {
  totalGames: number;
  whiteWins: number;
  blackWins: number;
  draws: number;
  avgGameLength: number;
  strategiesLearned: number;
  completionTime: number;
  learningProgress: TrainingProgress[];
}

interface TrainingGameResult {
  winner: PieceColor | 'draw';
  gameLength: number;
  analysisData: GameAnalysisData;
  gameData: TrainingGameData;
}

interface TrainingGameData {
  moves: ChessMove[];
  winner: PieceColor | 'draw';
  gameLength: number;
  timestamp: number;
  strategiesUsed: string[];
  openingType: string;
  endgameType: string;
}

interface MoveAnalysis {
  type: 'tactical' | 'strategic' | 'positional';
  mobility: number;
  pieceType: string;
  fromSquare: string;
  toSquare: string;
}

// Export the training system
export const massTraining = new MassAITraining();