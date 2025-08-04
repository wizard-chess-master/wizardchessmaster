import { ChessMove, GameState, PieceType, Position } from './types';

interface GamePattern {
  id: string;
  moves: ChessMove[];
  outcome: 'win' | 'loss' | 'draw';
  aiColor: 'white' | 'black';
  opponentType: 'human' | 'ai';
  gameLength: number;
  timestamp: number;
}

interface MovePattern {
  pieceType: PieceType;
  fromSquare: string;
  toSquare: string;
  isCapture: boolean;
  isWizardMove: boolean;
  gamePhase: 'opening' | 'middle' | 'endgame';
  successRate: number;
  timesUsed: number;
}

interface PositionalPattern {
  boardHash: string;
  bestMove: ChessMove;
  successRate: number;
  timesEncountered: number;
}

interface LearningData {
  gamesPlayed: number;
  movePatterns: Map<string, MovePattern>;
  positionalPatterns: Map<string, PositionalPattern>;
  recentGames: GamePattern[];
  winRateVsHuman: number;
  winRateVsAI: number;
  preferredStrategies: string[];
}

export class AILearningSystem {
  private learningData: LearningData;
  private maxGameHistory = 1000; // Keep last 1000 games
  private maxPositionalPatterns = 5000; // Limit memory usage

  constructor() {
    this.learningData = this.loadLearningData();
  }

  // Analyze a completed game and extract learning patterns
  analyzeGame(gameState: GameState, aiColor: 'white' | 'black', opponentType: 'human' | 'ai'): void {
    const gamePattern: GamePattern = {
      id: `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      moves: gameState.moveHistory,
      outcome: this.determineOutcome(gameState, aiColor),
      aiColor,
      opponentType,
      gameLength: gameState.moveHistory.length,
      timestamp: Date.now()
    };

    // Add to recent games
    this.learningData.recentGames.push(gamePattern);
    if (this.learningData.recentGames.length > this.maxGameHistory) {
      this.learningData.recentGames.shift();
    }

    // Update move patterns
    this.analyzeMovePatterns(gamePattern);

    // Update positional patterns
    this.analyzePositionalPatterns(gamePattern);

    // Update win rates
    this.updateWinRates();

    // Update preferred strategies
    this.updatePreferredStrategies();

    // Increment games played
    this.learningData.gamesPlayed++;

    // Save learning data
    this.saveLearningData();

    console.log(`🧠 AI Learning: Analyzed ${opponentType} game, outcome: ${gamePattern.outcome}`);
    console.log(`📊 Total games analyzed: ${this.learningData.gamesPlayed}`);
  }

  // Get the best move based on learned patterns
  getBestLearnedMove(gameState: GameState, aiColor: 'white' | 'black'): ChessMove | null {
    const boardHash = this.getBoardHash(gameState);
    const positionalPattern = this.learningData.positionalPatterns.get(boardHash);
    
    if (positionalPattern && positionalPattern.successRate > 0.6) {
      console.log(`🎯 Using learned positional pattern (${Math.round(positionalPattern.successRate * 100)}% success rate)`);
      return positionalPattern.bestMove;
    }

    // Look for similar move patterns
    const currentPhase = this.getGamePhase(gameState);
    const bestMovePattern = this.findBestMovePattern(gameState, aiColor, currentPhase);
    
    if (bestMovePattern) {
      console.log(`🎯 Using learned move pattern (${Math.round(bestMovePattern.successRate * 100)}% success rate)`);
      return this.createMoveFromPattern(gameState, bestMovePattern);
    }

    return null;
  }

  // Get learning statistics
  getLearningStats(): any {
    const totalGames = this.learningData.recentGames.length;
    const humanGames = this.learningData.recentGames.filter(g => g.opponentType === 'human').length;
    const aiGames = totalGames - humanGames;

    return {
      totalGamesAnalyzed: this.learningData.gamesPlayed,
      recentGames: totalGames,
      humanGames,
      aiGames,
      winRateVsHuman: this.learningData.winRateVsHuman,
      winRateVsAI: this.learningData.winRateVsAI,
      movePatterns: this.learningData.movePatterns.size,
      positionalPatterns: this.learningData.positionalPatterns.size,
      preferredStrategies: this.learningData.preferredStrategies
    };
  }

  private determineOutcome(gameState: GameState, aiColor: 'white' | 'black'): 'win' | 'loss' | 'draw' {
    if (!gameState.winner) return 'draw';
    return gameState.winner === aiColor ? 'win' : 'loss';
  }

  private analyzeMovePatterns(game: GamePattern): void {
    const aiMoves = game.moves.filter(move => move.piece.color === game.aiColor);
    
    aiMoves.forEach((move, index) => {
      const gamePhase = this.getGamePhaseFromMoveIndex(index, game.moves.length);
      const patternKey = this.getMovePatternKey(move, gamePhase);
      
      let pattern = this.learningData.movePatterns.get(patternKey);
      if (!pattern) {
        pattern = {
          pieceType: move.piece.type,
          fromSquare: this.positionToString(move.from),
          toSquare: this.positionToString(move.to),
          isCapture: !!move.captured,
          isWizardMove: move.isWizardTeleport || move.isWizardAttack || false,
          gamePhase,
          successRate: 0,
          timesUsed: 0
        };
      }

      pattern.timesUsed++;
      
      // Update success rate based on game outcome
      const outcomeValue = game.outcome === 'win' ? 1 : game.outcome === 'draw' ? 0.5 : 0;
      pattern.successRate = (pattern.successRate * (pattern.timesUsed - 1) + outcomeValue) / pattern.timesUsed;
      
      this.learningData.movePatterns.set(patternKey, pattern);
    });
  }

  private analyzePositionalPatterns(game: GamePattern): void {
    // Analyze key positions where AI made decisions
    game.moves.forEach((move, index) => {
      if (move.piece.color === game.aiColor && index < game.moves.length - 5) {
        // Reconstruct board state at this move
        const boardHash = `pos_${index}_${game.id}`;
        
        let pattern = this.learningData.positionalPatterns.get(boardHash);
        if (!pattern) {
          pattern = {
            boardHash,
            bestMove: move,
            successRate: 0,
            timesEncountered: 0
          };
        }

        pattern.timesEncountered++;
        const outcomeValue = game.outcome === 'win' ? 1 : game.outcome === 'draw' ? 0.5 : 0;
        pattern.successRate = (pattern.successRate * (pattern.timesEncountered - 1) + outcomeValue) / pattern.timesEncountered;
        
        this.learningData.positionalPatterns.set(boardHash, pattern);
      }
    });

    // Clean up old patterns if we have too many
    if (this.learningData.positionalPatterns.size > this.maxPositionalPatterns) {
      const patterns = Array.from(this.learningData.positionalPatterns.entries());
      patterns.sort((a, b) => a[1].timesEncountered - b[1].timesEncountered);
      
      // Remove least used patterns
      const toRemove = patterns.slice(0, 1000);
      toRemove.forEach(([key]) => this.learningData.positionalPatterns.delete(key));
    }
  }

  private updateWinRates(): void {
    const humanGames = this.learningData.recentGames.filter(g => g.opponentType === 'human');
    const aiGames = this.learningData.recentGames.filter(g => g.opponentType === 'ai');
    
    if (humanGames.length > 0) {
      const humanWins = humanGames.filter(g => g.outcome === 'win').length;
      this.learningData.winRateVsHuman = humanWins / humanGames.length;
    }
    
    if (aiGames.length > 0) {
      const aiWins = aiGames.filter(g => g.outcome === 'win').length;
      this.learningData.winRateVsAI = aiWins / aiGames.length;
    }
  }

  private updatePreferredStrategies(): void {
    const winningGames = this.learningData.recentGames.filter(g => g.outcome === 'win');
    const strategyCount: { [key: string]: number } = {};

    winningGames.forEach(game => {
      const strategy = this.analyzeGameStrategy(game);
      strategyCount[strategy] = (strategyCount[strategy] || 0) + 1;
    });

    this.learningData.preferredStrategies = Object.entries(strategyCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([strategy]) => strategy);
  }

  private analyzeGameStrategy(game: GamePattern): string {
    const aiMoves = game.moves.filter(move => move.piece.color === game.aiColor);
    const wizardMoves = aiMoves.filter(move => move.piece.type === 'wizard').length;
    const captures = aiMoves.filter(move => move.captured).length;
    const wizardAttacks = aiMoves.filter(move => move.isWizardAttack).length;

    if (wizardMoves > aiMoves.length * 0.3) return 'Wizard-focused';
    if (captures > aiMoves.length * 0.4) return 'Aggressive';
    if (wizardAttacks > wizardMoves * 0.6) return 'Tactical';
    if (game.gameLength > 80) return 'Defensive';
    return 'Balanced';
  }

  private getGamePhase(gameState: GameState): 'opening' | 'middle' | 'endgame' {
    const moveCount = gameState.moveHistory.length;
    if (moveCount < 20) return 'opening';
    if (moveCount < 60) return 'middle';
    return 'endgame';
  }

  private getGamePhaseFromMoveIndex(moveIndex: number, totalMoves: number): 'opening' | 'middle' | 'endgame' {
    if (moveIndex < totalMoves * 0.3) return 'opening';
    if (moveIndex < totalMoves * 0.7) return 'middle';
    return 'endgame';
  }

  private getMovePatternKey(move: ChessMove, gamePhase: string): string {
    return `${move.piece.type}_${gamePhase}_${move.captured ? 'capture' : 'move'}_${move.isWizardTeleport ? 'teleport' : move.isWizardAttack ? 'attack' : 'normal'}`;
  }

  private positionToString(pos: Position): string {
    return `${String.fromCharCode(97 + pos.col)}${10 - pos.row}`;
  }

  private getBoardHash(gameState: GameState): string {
    // Simple board hashing for position recognition
    return gameState.board.flat().map(piece => 
      piece ? `${piece.type[0]}${piece.color[0]}` : '.'
    ).join('');
  }

  private findBestMovePattern(gameState: GameState, aiColor: 'white' | 'black', gamePhase: string): MovePattern | null {
    let bestPattern: MovePattern | null = null;
    let bestScore = 0;

    this.learningData.movePatterns.forEach(pattern => {
      if (pattern.gamePhase === gamePhase && pattern.timesUsed >= 3) {
        const score = pattern.successRate * Math.log(pattern.timesUsed + 1);
        if (score > bestScore) {
          bestScore = score;
          bestPattern = pattern;
        }
      }
    });

    return bestPattern;
  }

  private createMoveFromPattern(gameState: GameState, pattern: MovePattern): ChessMove | null {
    // This is a simplified version - in practice, you'd need to find actual pieces
    // that can make moves matching the pattern
    return null; // Placeholder - would need complex move generation
  }

  private loadLearningData(): LearningData {
    try {
      const saved = localStorage.getItem('ai_learning_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          movePatterns: new Map(parsed.movePatterns || []),
          positionalPatterns: new Map(parsed.positionalPatterns || [])
        };
      }
    } catch (error) {
      console.warn('Failed to load AI learning data:', error);
    }

    return {
      gamesPlayed: 0,
      movePatterns: new Map(),
      positionalPatterns: new Map(),
      recentGames: [],
      winRateVsHuman: 0,
      winRateVsAI: 0,
      preferredStrategies: []
    };
  }

  private saveLearningData(): void {
    try {
      const toSave = {
        ...this.learningData,
        movePatterns: Array.from(this.learningData.movePatterns.entries()),
        positionalPatterns: Array.from(this.learningData.positionalPatterns.entries())
      };
      localStorage.setItem('ai_learning_data', JSON.stringify(toSave));
    } catch (error) {
      console.warn('Failed to save AI learning data:', error);
    }
  }

  // Reset all learning data
  resetLearning(): void {
    this.learningData = {
      gamesPlayed: 0,
      movePatterns: new Map(),
      positionalPatterns: new Map(),
      recentGames: [],
      winRateVsHuman: 0,
      winRateVsAI: 0,
      preferredStrategies: []
    };
    this.saveLearningData();
    console.log('🔄 AI learning data reset');
  }
}

// Global learning system instance
export const aiLearning = new AILearningSystem();