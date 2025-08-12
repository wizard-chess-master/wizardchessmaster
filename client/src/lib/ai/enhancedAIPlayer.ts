/**
 * Enhanced AI Player for Task 4
 * Integrates opening book, enhanced evaluation, tactical patterns, and advanced search
 */

import type { GameState, ChessMove, PieceColor, Position, AIDifficulty } from '../chess/types';
import { makeMove, isKingInCheck } from '../chess/gameEngine';
import { getAllPossibleMoves } from '../chess/aiPlayer';
import { openingBook } from './openingBook';
import { EnhancedEvaluator } from './enhancedEvaluation';
import { tacticalAnalyzer } from './tacticalPatterns';
import { aiLearning } from '../chess/aiLearning';

export type EnhancedDifficulty = AIDifficulty | 'expert' | 'master';

interface SearchResult {
  move: ChessMove | null;
  evaluation: number;
  depth: number;
  nodes: number;
  time: number;
}

export class EnhancedAIPlayer {
  private evaluator: EnhancedEvaluator;
  private difficulty: EnhancedDifficulty;
  private maxDepth: number;
  private maxTime: number; // milliseconds
  private nodesEvaluated: number = 0;
  private startTime: number = 0;
  private transpositionTable: Map<string, { eval: number; depth: number }> = new Map();
  
  constructor(difficulty: EnhancedDifficulty = 'medium') {
    this.difficulty = difficulty;
    this.evaluator = new EnhancedEvaluator(difficulty as any);
    
    // Set search parameters based on difficulty
    switch (difficulty) {
      case 'easy':
        this.maxDepth = 2;
        this.maxTime = 100;
        break;
      case 'medium':
        this.maxDepth = 3;
        this.maxTime = 500;
        break;
      case 'hard':
        this.maxDepth = 4;
        this.maxTime = 1000;
        break;
      case 'expert':
        this.maxDepth = 5;
        this.maxTime = 2000;
        break;
      case 'master':
        this.maxDepth = 6;
        this.maxTime = 3000;
        break;
      default:
        this.maxDepth = 3;
        this.maxTime = 500;
    }
  }
  
  /**
   * Get the best move for the current position
   */
  async getBestMove(gameState: GameState): Promise<ChessMove | null> {
    this.nodesEvaluated = 0;
    this.startTime = Date.now();
    this.transpositionTable.clear();
    
    const color = gameState.currentPlayer;
    const moveNumber = Math.floor(gameState.moveHistory.length / 2) + 1;
    
    // Step 1: Check opening book (first 10 moves)
    if (moveNumber <= 10 && this.difficulty !== 'easy') {
      const bookMove = openingBook.getBestOpeningMove(moveNumber, gameState.board, color);
      if (bookMove) {
        // Convert opening move to ChessMove format
        const allMoves = getAllPossibleMoves(gameState, color);
        const matchingMove = allMoves.find(m => 
          m.from.row === bookMove.from.row &&
          m.from.col === bookMove.from.col &&
          m.to.row === bookMove.to.row &&
          m.to.col === bookMove.to.col
        );
        if (matchingMove) {
          console.log(`📖 Using opening book: ${bookMove.name}`);
          return matchingMove;
        }
      }
    }
    
    // Step 2: Check for immediate tactical opportunities
    if (this.difficulty !== 'easy' && this.difficulty !== 'medium') {
      const tactics = tacticalAnalyzer.findTacticalPatterns(gameState, color);
      if (tactics.length > 0) {
        const bestTactic = tactics[0]; // Already sorted by value
        if (bestTactic.value >= 300) { // Significant tactical opportunity
          const allMoves = getAllPossibleMoves(gameState, color);
          const tacticMove = allMoves.find(m => 
            m.from.row === bestTactic.attacker.row &&
            m.from.col === bestTactic.attacker.col
          );
          if (tacticMove) {
            console.log(`⚔️ Tactical pattern found: ${bestTactic.description}`);
            return tacticMove;
          }
        }
      }
    }
    
    // Step 3: Check for checkmate in 1
    const allMoves = getAllPossibleMoves(gameState, color);
    if (allMoves.length === 0) return null;
    
    for (const move of allMoves) {
      const newState = makeMove(gameState, move, true);
      if (newState.isCheckmate && newState.winner === color) {
        console.log('♔ Checkmate in 1 found!');
        return move;
      }
    }
    
    // Step 4: Use AI learning patterns (for hard+ difficulty)
    if (this.difficulty !== 'easy' && this.difficulty !== 'medium') {
      const learnedMove = aiLearning.getBestLearnedMove(gameState, color);
      if (learnedMove && Math.random() < 0.3) { // Use learned moves 30% of the time
        console.log('🧠 Using learned pattern');
        return learnedMove;
      }
    }
    
    // Step 5: Endgame tablebase check (simplified)
    if (this.isEndgame(gameState) && (this.difficulty === 'expert' || this.difficulty === 'master')) {
      const endgameMove = this.getEndgameMove(gameState, color);
      if (endgameMove) {
        console.log('♟️ Using endgame knowledge');
        return endgameMove;
      }
    }
    
    // Step 6: Perform minimax search with iterative deepening
    const searchResult = await this.iterativeDeepening(gameState, color);
    
    if (searchResult.move) {
      console.log(`🤖 AI (${this.difficulty}) evaluated ${this.nodesEvaluated} positions in ${searchResult.time}ms at depth ${searchResult.depth}`);
      return searchResult.move;
    }
    
    // Fallback: return random legal move
    return allMoves[Math.floor(Math.random() * allMoves.length)];
  }
  
  /**
   * Iterative deepening search
   */
  private async iterativeDeepening(gameState: GameState, color: PieceColor): Promise<SearchResult> {
    let bestMove: ChessMove | null = null;
    let bestEval = color === 'white' ? -Infinity : Infinity;
    let completedDepth = 0;
    
    for (let depth = 1; depth <= this.maxDepth; depth++) {
      if (Date.now() - this.startTime > this.maxTime) break;
      
      const result = this.minimax(
        gameState,
        depth,
        -Infinity,
        Infinity,
        color === 'white',
        color
      );
      
      if (result.move) {
        bestMove = result.move;
        bestEval = result.eval;
        completedDepth = depth;
      }
      
      // Early exit if we found a winning move
      if (Math.abs(bestEval) > 10000) break;
    }
    
    return {
      move: bestMove,
      evaluation: bestEval,
      depth: completedDepth,
      nodes: this.nodesEvaluated,
      time: Date.now() - this.startTime
    };
  }
  
  /**
   * Minimax with alpha-beta pruning
   */
  private minimax(
    gameState: GameState,
    depth: number,
    alpha: number,
    beta: number,
    maximizing: boolean,
    aiColor: PieceColor
  ): { move: ChessMove | null; eval: number } {
    this.nodesEvaluated++;
    
    // Check time limit
    if (Date.now() - this.startTime > this.maxTime) {
      return { move: null, eval: this.evaluator.evaluate(gameState, aiColor) };
    }
    
    // Terminal node or depth limit
    if (depth === 0 || gameState.gamePhase === 'ended') {
      return { move: null, eval: this.evaluator.evaluate(gameState, aiColor) };
    }
    
    // Check transposition table
    const boardHash = this.hashBoard(gameState);
    const ttEntry = this.transpositionTable.get(boardHash);
    if (ttEntry && ttEntry.depth >= depth) {
      return { move: null, eval: ttEntry.eval };
    }
    
    const currentColor = gameState.currentPlayer;
    const moves = getAllPossibleMoves(gameState, currentColor);
    
    // No legal moves
    if (moves.length === 0) {
      if (isKingInCheck(gameState.board, currentColor)) {
        // Checkmate
        return { 
          move: null, 
          eval: maximizing ? -20000 : 20000 
        };
      } else {
        // Stalemate
        return { move: null, eval: 0 };
      }
    }
    
    // Order moves for better pruning
    const orderedMoves = this.orderMoves(moves, gameState);
    
    let bestMove: ChessMove | null = null;
    let bestEval = maximizing ? -Infinity : Infinity;
    
    for (const move of orderedMoves) {
      const newState = makeMove(gameState, move, true);
      const result = this.minimax(
        newState,
        depth - 1,
        alpha,
        beta,
        !maximizing,
        aiColor
      );
      
      if (maximizing) {
        if (result.eval > bestEval) {
          bestEval = result.eval;
          bestMove = move;
        }
        alpha = Math.max(alpha, bestEval);
      } else {
        if (result.eval < bestEval) {
          bestEval = result.eval;
          bestMove = move;
        }
        beta = Math.min(beta, bestEval);
      }
      
      // Alpha-beta pruning
      if (beta <= alpha) break;
    }
    
    // Store in transposition table
    this.transpositionTable.set(boardHash, { eval: bestEval, depth });
    
    return { move: bestMove, eval: bestEval };
  }
  
  /**
   * Order moves for better alpha-beta pruning
   */
  private orderMoves(moves: ChessMove[], gameState: GameState): ChessMove[] {
    return moves.sort((a, b) => {
      // Prioritize captures
      if (a.captured && !b.captured) return -1;
      if (!a.captured && b.captured) return 1;
      
      // Prioritize checks
      const stateA = makeMove(gameState, a, true);
      const stateB = makeMove(gameState, b, true);
      
      if (stateA.isInCheck && !stateB.isInCheck) return -1;
      if (!stateA.isInCheck && stateB.isInCheck) return 1;
      
      // Prioritize center moves
      const centerA = Math.abs(a.to.row - 4.5) + Math.abs(a.to.col - 4.5);
      const centerB = Math.abs(b.to.row - 4.5) + Math.abs(b.to.col - 4.5);
      
      return centerA - centerB;
    });
  }
  
  /**
   * Check if game is in endgame phase
   */
  private isEndgame(gameState: GameState): boolean {
    let totalPieces = 0;
    let queens = 0;
    
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const piece = gameState.board[row][col];
        if (piece) {
          totalPieces++;
          if (piece.type === 'queen') queens++;
        }
      }
    }
    
    return totalPieces < 14 || queens === 0;
  }
  
  /**
   * Get endgame move using simplified tablebase concepts
   */
  private getEndgameMove(gameState: GameState, color: PieceColor): ChessMove | null {
    const moves = getAllPossibleMoves(gameState, color);
    if (moves.length === 0) return null;
    
    // In endgame, prioritize:
    // 1. Checkmates
    // 2. Pawn promotion
    // 3. King activity
    // 4. Piece coordination
    
    let bestMove: ChessMove | null = null;
    let bestScore = -Infinity;
    
    for (const move of moves) {
      let score = 0;
      const newState = makeMove(gameState, move, true);
      
      // Checkmate is best
      if (newState.isCheckmate && newState.winner === color) {
        return move;
      }
      
      // Pawn advancement
      if (move.piece.type === 'pawn') {
        const advancement = color === 'white' ? (9 - move.to.row) : move.to.row;
        score += advancement * 50;
      }
      
      // King activity
      if (move.piece.type === 'king') {
        // Move king toward center in endgame
        const centerDistance = Math.abs(move.to.row - 4.5) + Math.abs(move.to.col - 4.5);
        score += (9 - centerDistance) * 20;
      }
      
      // Evaluate position
      score += this.evaluator.evaluate(newState, color);
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    
    return bestMove;
  }
  
  /**
   * Create a hash of the board position for transposition table
   */
  private hashBoard(gameState: GameState): string {
    let hash = '';
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const piece = gameState.board[row][col];
        if (piece) {
          hash += piece.type[0] + piece.color[0];
        } else {
          hash += '-';
        }
      }
    }
    hash += gameState.currentPlayer[0];
    return hash;
  }
}

// Export singleton instance for easy use
export const enhancedAI = new EnhancedAIPlayer('medium');