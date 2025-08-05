import { GameState, ChessMove, PieceColor, Position, ChessPiece } from './types';
import { makeMove, isKingInCheck } from './gameEngine';
import { getAllValidMoves as getAllValidMovesFromBoard } from './pieceMovement';
import { getPossibleMoves } from './pieceMovement';

// Advanced AI with Minimax Alpha-Beta Pruning and Neural Network Learning
export class AdvancedAIPlayer {
  private transpositionTable: Map<string, { score: number; depth: number; flag: string }> = new Map();
  private neuralWeights: NeuralWeights;
  private explorationRate = 0.1; // 10% randomness
  private maxDepth = 4;
  
  constructor() {
    this.neuralWeights = this.loadNeuralWeights();
  }

  // Main AI move selection with minimax
  public getMove(gameState: GameState, color: PieceColor): ChessMove | null {
    const moves = this.getAllValidMoves(gameState, color);
    if (moves.length === 0) return null;

    // 10% exploration - random move
    if (Math.random() < this.explorationRate) {
      console.log('🎲 AI exploring with random move');
      return moves[Math.floor(Math.random() * moves.length)];
    }

    // Use minimax with alpha-beta pruning
    const bestMove = this.minimax(gameState, this.maxDepth, -Infinity, Infinity, true, color);
    
    if (bestMove.move) {
      console.log(`🧠 AI minimax selected: ${bestMove.move.piece.type} (score: ${bestMove.score}, depth: ${this.maxDepth})`);
      return bestMove.move;
    }

    return moves[0]; // Fallback
  }

  // Minimax algorithm with alpha-beta pruning
  private minimax(
    gameState: GameState, 
    depth: number, 
    alpha: number, 
    beta: number, 
    maximizing: boolean, 
    color: PieceColor
  ): { move: ChessMove | null; score: number } {
    
    // Generate position hash for transposition table
    const positionHash = this.hashPosition(gameState);
    const tableEntry = this.transpositionTable.get(positionHash);
    
    if (tableEntry && tableEntry.depth >= depth) {
      if (tableEntry.flag === 'exact') {
        return { move: null, score: tableEntry.score };
      }
    }

    // Base case: depth 0 or game over
    if (depth === 0 || gameState.gamePhase === 'ended') {
      const score = this.evaluatePosition(gameState, color);
      this.transpositionTable.set(positionHash, { score, depth, flag: 'exact' });
      return { move: null, score };
    }

    const currentColor = maximizing ? color : (color === 'white' ? 'black' : 'white');
    const moves = this.getAllValidMoves(gameState, currentColor);
    
    if (moves.length === 0) {
      // No legal moves - checkmate or stalemate
      const kingInCheck = isKingInCheck(gameState.board, currentColor);
      const score = kingInCheck ? (maximizing ? -10000 : 10000) : 0;
      return { move: null, score };
    }

    // Order moves for better pruning (captures first, then by piece value)
    const orderedMoves = this.orderMoves(moves, gameState);
    
    let bestMove: ChessMove | null = null;
    let bestScore = maximizing ? -Infinity : Infinity;

    for (const move of orderedMoves) {
      const newState = makeMove(gameState, move, true);
      const result = this.minimax(newState, depth - 1, alpha, beta, !maximizing, color);
      
      if (maximizing) {
        if (result.score > bestScore) {
          bestScore = result.score;
          bestMove = move;
        }
        alpha = Math.max(alpha, result.score);
      } else {
        if (result.score < bestScore) {
          bestScore = result.score;
          bestMove = move;
        }
        beta = Math.min(beta, result.score);
      }

      // Alpha-beta pruning
      if (beta <= alpha) {
        break;
      }
    }

    // Store in transposition table
    this.transpositionTable.set(positionHash, { 
      score: bestScore, 
      depth, 
      flag: 'exact' 
    });

    return { move: bestMove, score: bestScore };
  }

  // Advanced position evaluation using neural network weights
  private evaluatePosition(gameState: GameState, aiColor: PieceColor): number {
    let score = 0;
    const opponentColor = aiColor === 'white' ? 'black' : 'white';

    // Material evaluation with piece values (updated to match user specification)
    const pieceValues = {
      pawn: 10, knight: 30, bishop: 30, rook: 50, queen: 90, wizard: 35, king: 900
    };

    let aiMaterial = 0;
    let opponentMaterial = 0;

    // Position-based bonuses
    const centerSquares = [[4, 4], [4, 5], [5, 4], [5, 5]];
    const extendedCenter = [[3, 3], [3, 4], [3, 5], [3, 6], [4, 3], [4, 6], [5, 3], [5, 6], [6, 3], [6, 4], [6, 5], [6, 6]];

    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const piece = gameState.board[row][col];
        if (!piece) continue;

        const pieceValue = pieceValues[piece.type];
        const isAI = piece.color === aiColor;
        
        // Material count
        if (isAI) {
          aiMaterial += pieceValue;
        } else {
          opponentMaterial += pieceValue;
        }

        // Position bonuses
        let positionBonus = 0;

        // Center control bonus
        if (centerSquares.some(([r, c]) => r === row && c === col)) {
          positionBonus += piece.type === 'pawn' ? 0.5 : 1;
        } else if (extendedCenter.some(([r, c]) => r === row && c === col)) {
          positionBonus += piece.type === 'pawn' ? 0.2 : 0.5;
        }

        // Piece-specific positional bonuses
        if (piece.type === 'knight') {
          positionBonus += this.getKnightPositionBonus(row, col);
        } else if (piece.type === 'bishop') {
          positionBonus += this.getBishopPositionBonus(row, col, gameState.board);
        } else if (piece.type === 'wizard') {
          positionBonus += this.getWizardUtility(row, col, gameState.board, piece.color);
        } else if (piece.type === 'pawn') {
          positionBonus += this.getPawnPositionBonus(row, col, piece.color);
        }

        // Apply neural network weights
        positionBonus *= this.neuralWeights.positionWeight;

        if (isAI) {
          score += positionBonus;
        } else {
          score -= positionBonus;
        }
      }
    }

    // Material advantage
    score += (aiMaterial - opponentMaterial) * this.neuralWeights.materialWeight;

    // King safety
    const aiKingSafety = this.evaluateKingSafety(gameState.board, aiColor);
    const opponentKingSafety = this.evaluateKingSafety(gameState.board, opponentColor);
    score += (aiKingSafety - opponentKingSafety) * this.neuralWeights.kingSafetyWeight;

    // Mobility (number of legal moves)
    const aiMobility = this.getAllValidMoves(gameState, aiColor).length;
    const opponentMobility = this.getAllValidMoves(gameState, opponentColor).length;
    score += (aiMobility - opponentMobility) * this.neuralWeights.mobilityWeight;

    // Checkmate detection
    if (gameState.gamePhase === 'ended') {
      if (gameState.winner === aiColor) {
        score += 10000;
      } else if (gameState.winner === opponentColor) {
        score -= 10000;
      }
    }

    return score;
  }

  // Wizard utility evaluation (teleport and attack capabilities)
  private getWizardUtility(row: number, col: number, board: (ChessPiece | null)[][], color: PieceColor): number {
    let utility = 0;
    
    // Teleport options within 2 squares
    const teleportSquares = [];
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        if (Math.abs(dr) + Math.abs(dc) <= 2 && (dr !== 0 || dc !== 0)) {
          const newRow = row + dr;
          const newCol = col + dc;
          if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10) {
            if (!board[newRow][newCol]) {
              teleportSquares.push([newRow, newCol]);
            }
          }
        }
      }
    }
    
    utility += teleportSquares.length * 0.1; // Mobility bonus for teleport options
    
    // Attack options within 2 squares
    let attackTargets = 0;
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        if (Math.abs(dr) + Math.abs(dc) <= 2 && (dr !== 0 || dc !== 0)) {
          const newRow = row + dr;
          const newCol = col + dc;
          if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10) {
            const target = board[newRow][newCol];
            if (target && target.color !== color) {
              attackTargets++;
            }
          }
        }
      }
    }
    
    utility += attackTargets * 0.5; // Bonus for attacking enemy pieces
    
    return utility;
  }

  // Knight position evaluation
  private getKnightPositionBonus(row: number, col: number): number {
    // Knights are better in center
    const distanceFromCenter = Math.abs(row - 4.5) + Math.abs(col - 4.5);
    return Math.max(0, 5 - distanceFromCenter) * 0.1;
  }

  // Bishop position evaluation
  private getBishopPositionBonus(row: number, col: number, board: (ChessPiece | null)[][]): number {
    // Bishops prefer long diagonals
    let diagonalLength = 0;
    
    // Check all four diagonal directions
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (const [dr, dc] of directions) {
      let length = 0;
      let r = row + dr;
      let c = col + dc;
      while (r >= 0 && r < 10 && c >= 0 && c < 10 && !board[r][c]) {
        length++;
        r += dr;
        c += dc;
      }
      diagonalLength += length;
    }
    
    return diagonalLength * 0.05;
  }

  // Pawn position evaluation
  private getPawnPositionBonus(row: number, col: number, color: PieceColor): number {
    // Pawns get bonus for advancing
    const advancementRow = color === 'white' ? 9 - row : row;
    return advancementRow * 0.1;
  }

  // King safety evaluation
  private evaluateKingSafety(board: (ChessPiece | null)[][], color: PieceColor): number {
    const kingPos = this.findKing(board, color);
    if (!kingPos) return -100; // King not found = very bad
    
    let safety = 0;
    
    // Penalty for king in center during middlegame
    const distanceFromEdge = Math.min(kingPos.row, kingPos.col, 9 - kingPos.row, 9 - kingPos.col);
    if (distanceFromEdge > 2) {
      safety -= 2;
    }
    
    // Bonus for pieces defending king
    let defenders = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const r = kingPos.row + dr;
        const c = kingPos.col + dc;
        if (r >= 0 && r < 10 && c >= 0 && c < 10) {
          const piece = board[r][c];
          if (piece && piece.color === color && piece.type !== 'king') {
            defenders++;
          }
        }
      }
    }
    safety += defenders * 0.5;
    
    return safety;
  }

  // Find king position
  private findKing(board: (ChessPiece | null)[][], color: PieceColor): Position | null {
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const piece = board[row][col];
        if (piece && piece.type === 'king' && piece.color === color) {
          return { row, col };
        }
      }
    }
    return null;
  }

  // Move ordering for better alpha-beta pruning
  private orderMoves(moves: ChessMove[], gameState: GameState): ChessMove[] {
    const pieceValues = {
      pawn: 10, knight: 30, bishop: 30, rook: 50, queen: 90, wizard: 35, king: 900
    };
    
    return moves.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      
      // Captures first (Most Valuable Victim - Least Valuable Attacker)
      if (a.captured) {
        scoreA += pieceValues[a.captured.type] - pieceValues[a.piece.type];
      }
      if (b.captured) {
        scoreB += pieceValues[b.captured.type] - pieceValues[b.piece.type];
      }
      
      // Checks second
      const stateA = makeMove(gameState, a, true);
      const stateB = makeMove(gameState, b, true);
      const opponentColor = gameState.currentPlayer === 'white' ? 'black' : 'white';
      
      if (isKingInCheck(stateA.board, opponentColor)) scoreA += 50;
      if (isKingInCheck(stateB.board, opponentColor)) scoreB += 50;
      
      return scoreB - scoreA;
    });
  }

  // Position hashing for transposition table
  private hashPosition(gameState: GameState): string {
    let hash = '';
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const piece = gameState.board[row][col];
        if (piece) {
          hash += `${piece.type[0]}${piece.color[0]}${row}${col}`;
        }
      }
    }
    hash += gameState.currentPlayer[0];
    return hash;
  }

  // Neural network learning from game outcomes
  public learnFromGame(gameData: GameAnalysisData): void {
    const outcome = gameData.winner === 'white' ? 1 : gameData.winner === 'black' ? -1 : 0;
    
    // Update neural weights based on game outcome
    const learningRate = 0.01;
    
    // Adjust weights based on game characteristics
    if (Math.abs(outcome) > 0) { // Not a draw
      if (gameData.gameLength < 30) {
        // Quick games suggest tactical play worked
        this.neuralWeights.materialWeight += learningRate * outcome * 0.1;
      } else {
        // Long games suggest positional play was important
        this.neuralWeights.positionWeight += learningRate * outcome * 0.1;
        this.neuralWeights.kingSafetyWeight += learningRate * outcome * 0.05;
      }
      
      // Mobility was important if many pieces were active
      if (gameData.avgMobility > 20) {
        this.neuralWeights.mobilityWeight += learningRate * outcome * 0.05;
      }
    }
    
    // Normalize weights to prevent drift
    this.normalizeWeights();
    this.saveNeuralWeights();
    
    console.log('🧠 Neural weights updated from game outcome:', outcome);
  }

  // Normalize neural network weights
  private normalizeWeights(): void {
    const total = this.neuralWeights.materialWeight + this.neuralWeights.positionWeight + 
                  this.neuralWeights.kingSafetyWeight + this.neuralWeights.mobilityWeight;
    
    if (total > 0) {
      this.neuralWeights.materialWeight /= total;
      this.neuralWeights.positionWeight /= total;
      this.neuralWeights.kingSafetyWeight /= total;
      this.neuralWeights.mobilityWeight /= total;
      
      // Scale back up to reasonable values
      this.neuralWeights.materialWeight *= 4;
      this.neuralWeights.positionWeight *= 4;
      this.neuralWeights.kingSafetyWeight *= 4;
      this.neuralWeights.mobilityWeight *= 4;
    }
  }

  // Load neural weights from storage
  private loadNeuralWeights(): NeuralWeights {
    const stored = localStorage.getItem('fantasy-chess-neural-weights');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.warn('Failed to load neural weights, using defaults');
      }
    }
    
    // Default weights
    return {
      materialWeight: 1.0,
      positionWeight: 0.3,
      kingSafetyWeight: 0.2,
      mobilityWeight: 0.1
    };
  }

  // Save neural weights to storage
  private saveNeuralWeights(): void {
    localStorage.setItem('fantasy-chess-neural-weights', JSON.stringify(this.neuralWeights));
  }

  // Reset neural network
  public resetNeuralNetwork(): void {
    this.neuralWeights = {
      materialWeight: 1.0,
      positionWeight: 0.3,
      kingSafetyWeight: 0.2,
      mobilityWeight: 0.1
    };
    this.saveNeuralWeights();
    this.transpositionTable.clear();
    console.log('🧠 Neural network reset to defaults');
  }

  // Get current neural weights for analysis
  public getNeuralWeights(): NeuralWeights {
    return { ...this.neuralWeights };
  }



  // Helper method to get all valid moves for a game state
  private getAllValidMoves(gameState: GameState, color: PieceColor): ChessMove[] {
    const moves: ChessMove[] = [];
    
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const piece = gameState.board[row][col];
        if (piece && piece.color === color) {
          const from = { row, col };
          const possibleMoves = getPossibleMoves(gameState.board, from, piece);
          
          for (const to of possibleMoves) {
            const captured = gameState.board[to.row][to.col] || undefined;
            const isWizardTeleport = piece.type === 'wizard' && !captured;
            const isWizardAttack = piece.type === 'wizard' && !!captured;
            
            // Check if pawn promotion is needed
            const promotion = piece.type === 'pawn' && 
              ((piece.color === 'white' && to.row === 0) || (piece.color === 'black' && to.row === 9)) 
              ? 'queen' // Auto-promote to queen
              : undefined;
            
            // Validate move doesn't put own king in check
            const testBoard = gameState.board.map(r => [...r]);
            let pieceToPlace = piece;
            if (promotion) {
              pieceToPlace = { ...piece, type: promotion };
            }
            testBoard[to.row][to.col] = pieceToPlace;
            if (!isWizardAttack) {
              testBoard[from.row][from.col] = null;
            }
            
            if (!isKingInCheck(testBoard, color)) {
              moves.push({
                from,
                to,
                piece,
                captured,
                isWizardTeleport,
                isWizardAttack,
                promotion
              });
            }
          }
        }
      }
    }
    
    return moves;
  }
}

// Neural network weights interface
interface NeuralWeights {
  materialWeight: number;
  positionWeight: number;
  kingSafetyWeight: number;
  mobilityWeight: number;
}

// Simplified AI Manager that matches user's pseudocode structure
export class AIManager {
  private maxDepth = 4; // Depth 4+ as requested
  
  // Piece values as specified by user
  private pieceValues = {
    pawn: 10, knight: 30, bishop: 30, rook: 50, queen: 90, wizard: 35, king: 900
  };

  getBestMove(gameState: GameState, aiColor: PieceColor = 'white'): ChessMove | null {
    let bestMove: ChessMove | null = null;
    let bestValue = -Infinity;
    
    const validMoves = this.getValidMoves(gameState, aiColor);
    
    for (const move of validMoves) {
      const newBoard = this.makeMove(gameState, move);
      const boardValue = this.minimax(newBoard, this.maxDepth, -Infinity, Infinity, false, aiColor);
      
      if (boardValue > bestValue) {
        bestValue = boardValue;
        bestMove = move;
      }
    }
    
    console.log(`🤖 AIManager selected move with value: ${bestValue}`);
    return bestMove;
  }

  private minimax(
    gameState: GameState, 
    depth: number, 
    alpha: number, 
    beta: number, 
    maximizingPlayer: boolean,
    aiColor: PieceColor
  ): number {
    
    if (depth === 0 || this.gameOver(gameState)) {
      return this.evaluateBoard(gameState, aiColor);
    }
    
    const currentColor = maximizingPlayer ? aiColor : (aiColor === 'white' ? 'black' : 'white');
    
    if (maximizingPlayer) {
      let maxEval = -Infinity;
      const moves = this.getValidMoves(gameState, currentColor);
      
      for (const move of moves) {
        const newPos = this.makeMove(gameState, move);
        const evalScore = this.minimax(newPos, depth - 1, alpha, beta, false, aiColor);
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        
        if (beta <= alpha) break; // Alpha-beta pruning
      }
      return maxEval;
      
    } else {
      let minEval = Infinity;
      const moves = this.getValidMoves(gameState, currentColor);
      
      for (const move of moves) {
        const newPos = this.makeMove(gameState, move);
        const evalScore = this.minimax(newPos, depth - 1, alpha, beta, true, aiColor);
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        
        if (beta <= alpha) break; // Alpha-beta pruning
      }
      return minEval;
    }
  }

  private evaluateBoard(gameState: GameState, aiColor: PieceColor): number {
    let score = 0;
    
    // Material evaluation
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const piece = gameState.board[row][col];
        if (piece) {
          const pieceValue = this.pieceValues[piece.type];
          if (piece.color === aiColor) {
            score += pieceValue;
          } else {
            score -= pieceValue;
          }
        }
      }
    }
    
    // Checkmate/Stalemate detection
    if (gameState.isCheckmate) {
      return gameState.winner === aiColor ? 10000 : -10000;
    }
    if (gameState.isStalemate) {
      return 0;
    }
    
    return score;
  }

  private gameOver(gameState: GameState): boolean {
    return gameState.isCheckmate || gameState.isStalemate || gameState.gamePhase === 'ended';
  }

  private getValidMoves(gameState: GameState, color: PieceColor): ChessMove[] {
    const moves: ChessMove[] = [];
    
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const piece = gameState.board[row][col];
        if (piece && piece.color === color) {
          const pieceMoves = getPossibleMoves(gameState.board, { row, col }, piece);
          for (const move of pieceMoves) {
            // Create proper ChessMove object
            const chessMove: ChessMove = {
              from: { row, col },
              to: move,
              piece: piece,
              captured: gameState.board[move.row][move.col],
              isWizardTeleport: piece.type === 'wizard' && Math.abs(move.row - row) + Math.abs(move.col - col) > 1,
              isWizardAttack: piece.type === 'wizard' && gameState.board[move.row][move.col] !== null
            };
            moves.push(chessMove);
          }
        }
      }
    }
    
    return moves;
  }

  private makeMove(gameState: GameState, move: ChessMove): GameState {
    // Use existing makeMove function from game engine
    return makeMove(gameState, move, true);
  }
}

// Game analysis data for learning
export interface GameAnalysisData {
  winner: PieceColor | 'draw';
  gameLength: number;
  avgMobility: number;
  tacticalMoves: number;
  strategicMoves: number;
  moves: ChessMove[];
}

// Strategy pattern logging
export interface StrategyPattern {
  name: string;
  frequency: number;
  successRate: number;
  avgGameLength: number;
  conditions: string[];
}

// Export the advanced AI instances
export const advancedAI = new AdvancedAIPlayer();
export const aiManager = new AIManager();