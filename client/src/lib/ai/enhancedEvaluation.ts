/**
 * Enhanced Position Evaluation for Advanced AI
 * Implements sophisticated chess evaluation concepts
 */

import type { GameState, ChessPiece as Piece, PieceColor, Position } from '../chess/types';

interface EvaluationWeights {
  material: number;
  position: number;
  mobility: number;
  kingSafety: number;
  pawnStructure: number;
  centerControl: number;
  development: number;
  tactics: number;
}

// Piece values in centipawns (1 pawn = 100)
const PIECE_VALUES = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000,
  wizard: 400 // Special piece value
};

// Piece-square tables for positional evaluation (10x10 board)
const PAWN_TABLE = [
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 30, 30, 20, 10, 10],
  [5,  5, 10, 25, 25, 25, 25, 10,  5,  5],
  [0,  0,  0, 20, 20, 20, 20,  0,  0,  0],
  [5, -5,-10,  0,  0,  0,  0,-10, -5,  5],
  [5, 10, 10,-20,-20,-20,-20, 10, 10,  5],
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0]
];

const KNIGHT_TABLE = [
  [-50,-40,-30,-30,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 15, 15, 10,  5,-30],
  [-30,  0, 10,  0,  0,  0,  0, 10,  0,-30],
  [-40,-20,  0,  5,  5,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-30,-30,-40,-50],
  [-50,-40,-30,-30,-30,-30,-30,-30,-40,-50]
];

const BISHOP_TABLE = [
  [-20,-10,-10,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  0,  0,  5,-10],
  [-10,  0,  0,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  0,  0,  0,  0,  0,  0,  0,-10],
  [-20,-10,-10,-10,-10,-10,-10,-10,-10,-20]
];

const KING_MIDDLEGAME_TABLE = [
  [-30,-40,-40,-50,-50,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-20,-20,-10],
  [ 20, 20,  0,  0,  0,  0,  0,  0, 20, 20],
  [ 20, 30, 10,  0,  0,  0,  0, 10, 30, 20],
  [ 20, 30, 10,  0,  0,  0,  0, 10, 30, 20],
  [ 20, 30, 10,  0,  0,  0,  0, 10, 30, 20]
];

const KING_ENDGAME_TABLE = [
  [-50,-40,-30,-20,-20,-20,-20,-30,-40,-50],
  [-30,-20,-10,  0,  0,  0,  0,-10,-20,-30],
  [-30,-10, 20, 30, 30, 30, 30, 20,-10,-30],
  [-30,-10, 30, 40, 40, 40, 40, 30,-10,-30],
  [-30,-10, 30, 40, 40, 40, 40, 30,-10,-30],
  [-30,-10, 30, 40, 40, 40, 40, 30,-10,-30],
  [-30,-10, 20, 30, 30, 30, 30, 20,-10,-30],
  [-30,-30,  0,  0,  0,  0,  0,  0,-30,-30],
  [-50,-30,-30,-30,-30,-30,-30,-30,-30,-50],
  [-50,-30,-30,-30,-30,-30,-30,-30,-30,-50]
];

export class EnhancedEvaluator {
  private weights: EvaluationWeights;
  
  constructor(difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'master') {
    this.weights = this.getWeightsForDifficulty(difficulty);
  }
  
  /**
   * Get evaluation weights based on difficulty
   */
  private getWeightsForDifficulty(difficulty: string): EvaluationWeights {
    switch (difficulty) {
      case 'easy':
        return {
          material: 1.0,
          position: 0.1,
          mobility: 0.1,
          kingSafety: 0.1,
          pawnStructure: 0.0,
          centerControl: 0.1,
          development: 0.1,
          tactics: 0.0
        };
      case 'medium':
        return {
          material: 1.0,
          position: 0.3,
          mobility: 0.2,
          kingSafety: 0.2,
          pawnStructure: 0.1,
          centerControl: 0.2,
          development: 0.2,
          tactics: 0.1
        };
      case 'hard':
        return {
          material: 1.0,
          position: 0.4,
          mobility: 0.3,
          kingSafety: 0.3,
          pawnStructure: 0.2,
          centerControl: 0.3,
          development: 0.3,
          tactics: 0.2
        };
      case 'expert':
        return {
          material: 1.0,
          position: 0.5,
          mobility: 0.4,
          kingSafety: 0.4,
          pawnStructure: 0.3,
          centerControl: 0.4,
          development: 0.4,
          tactics: 0.3
        };
      case 'master':
        return {
          material: 1.0,
          position: 0.6,
          mobility: 0.5,
          kingSafety: 0.5,
          pawnStructure: 0.4,
          centerControl: 0.5,
          development: 0.5,
          tactics: 0.4
        };
      default:
        return this.getWeightsForDifficulty('medium');
    }
  }
  
  /**
   * Main evaluation function
   */
  evaluate(gameState: GameState, color: PieceColor): number {
    let score = 0;
    
    // Material evaluation
    score += this.evaluateMaterial(gameState, color) * this.weights.material;
    
    // Positional evaluation
    score += this.evaluatePosition(gameState, color) * this.weights.position;
    
    // Mobility evaluation
    score += this.evaluateMobility(gameState, color) * this.weights.mobility;
    
    // King safety
    score += this.evaluateKingSafety(gameState, color) * this.weights.kingSafety;
    
    // Pawn structure
    score += this.evaluatePawnStructure(gameState, color) * this.weights.pawnStructure;
    
    // Center control
    score += this.evaluateCenterControl(gameState, color) * this.weights.centerControl;
    
    // Development
    score += this.evaluateDevelopment(gameState, color) * this.weights.development;
    
    // Tactical opportunities
    score += this.evaluateTactics(gameState, color) * this.weights.tactics;
    
    return score;
  }
  
  /**
   * Evaluate material balance
   */
  private evaluateMaterial(gameState: GameState, color: PieceColor): number {
    let score = 0;
    
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const piece = gameState.board[row][col];
        if (piece) {
          const value = PIECE_VALUES[piece.type as keyof typeof PIECE_VALUES] || 100;
          if (piece.color === color) {
            score += value;
          } else {
            score -= value;
          }
        }
      }
    }
    
    return score;
  }
  
  /**
   * Evaluate piece positions using piece-square tables
   */
  private evaluatePosition(gameState: GameState, color: PieceColor): number {
    let score = 0;
    const isEndgame = this.isEndgame(gameState);
    
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const piece = gameState.board[row][col];
        if (piece) {
          let positionValue = 0;
          const tableRow = piece.color === 'white' ? row : 9 - row;
          
          switch (piece.type) {
            case 'pawn':
              positionValue = PAWN_TABLE[tableRow][col];
              break;
            case 'knight':
              positionValue = KNIGHT_TABLE[tableRow][col];
              break;
            case 'bishop':
              positionValue = BISHOP_TABLE[tableRow][col];
              break;
            case 'king':
              positionValue = isEndgame ? 
                KING_ENDGAME_TABLE[tableRow][col] : 
                KING_MIDDLEGAME_TABLE[tableRow][col];
              break;
            case 'wizard':
              // Wizards prefer central positions
              positionValue = BISHOP_TABLE[tableRow][col] * 1.2;
              break;
          }
          
          if (piece.color === color) {
            score += positionValue;
          } else {
            score -= positionValue;
          }
        }
      }
    }
    
    return score;
  }
  
  /**
   * Evaluate piece mobility (number of available moves)
   */
  private evaluateMobility(gameState: GameState, color: PieceColor): number {
    // Simplified mobility evaluation
    // In a real implementation, this would count legal moves
    let mobility = 0;
    
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const piece = gameState.board[row][col];
        if (piece && piece.color === color) {
          // Estimate mobility based on piece type
          switch (piece.type) {
            case 'pawn':
              mobility += piece.hasMoved ? 1 : 2;
              break;
            case 'knight':
              mobility += 8;
              break;
            case 'bishop':
              mobility += 13;
              break;
            case 'rook':
              mobility += 14;
              break;
            case 'queen':
              mobility += 27;
              break;
            case 'wizard':
              mobility += 20; // High mobility due to teleportation
              break;
            case 'king':
              mobility += 8;
              break;
          }
        }
      }
    }
    
    return mobility;
  }
  
  /**
   * Evaluate king safety
   */
  private evaluateKingSafety(gameState: GameState, color: PieceColor): number {
    let safety = 0;
    
    // Find king position
    let kingPos: Position | null = null;
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const piece = gameState.board[row][col];
        if (piece && piece.type === 'king' && piece.color === color) {
          kingPos = { row, col };
          break;
        }
      }
      if (kingPos) break;
    }
    
    if (!kingPos) return -10000; // King missing is very bad
    
    // Check pawn shield
    const pawnShieldRow = color === 'white' ? kingPos.row - 1 : kingPos.row + 1;
    if (pawnShieldRow >= 0 && pawnShieldRow < 10) {
      for (let col = Math.max(0, kingPos.col - 1); col <= Math.min(9, kingPos.col + 1); col++) {
        const piece = gameState.board[pawnShieldRow][col];
        if (piece && piece.type === 'pawn' && piece.color === color) {
          safety += 10;
        }
      }
    }
    
    // Penalty for exposed king
    if (kingPos.row < 2 || kingPos.row > 7) {
      safety -= 20; // King on edge is more vulnerable
    }
    
    return safety;
  }
  
  /**
   * Evaluate pawn structure
   */
  private evaluatePawnStructure(gameState: GameState, color: PieceColor): number {
    let score = 0;
    const pawns: Position[] = [];
    
    // Find all pawns
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const piece = gameState.board[row][col];
        if (piece && piece.type === 'pawn' && piece.color === color) {
          pawns.push({ row, col });
        }
      }
    }
    
    // Check for doubled pawns (negative)
    const colCounts = new Array(10).fill(0);
    for (const pawn of pawns) {
      colCounts[pawn.col]++;
    }
    for (const count of colCounts) {
      if (count > 1) {
        score -= (count - 1) * 10; // Penalty for doubled pawns
      }
    }
    
    // Check for isolated pawns (negative)
    for (const pawn of pawns) {
      let hasNeighbor = false;
      if (pawn.col > 0 && colCounts[pawn.col - 1] > 0) hasNeighbor = true;
      if (pawn.col < 9 && colCounts[pawn.col + 1] > 0) hasNeighbor = true;
      if (!hasNeighbor) {
        score -= 15; // Penalty for isolated pawn
      }
    }
    
    // Bonus for passed pawns
    for (const pawn of pawns) {
      let isPassed = true;
      const enemyPawnRow = color === 'white' ? 
        (row: number) => row < pawn.row : 
        (row: number) => row > pawn.row;
      
      for (let row = 0; row < 10; row++) {
        if (!enemyPawnRow(row)) continue;
        for (let col = Math.max(0, pawn.col - 1); col <= Math.min(9, pawn.col + 1); col++) {
          const piece = gameState.board[row][col];
          if (piece && piece.type === 'pawn' && piece.color !== color) {
            isPassed = false;
            break;
          }
        }
        if (!isPassed) break;
      }
      
      if (isPassed) {
        const advancement = color === 'white' ? (9 - pawn.row) : pawn.row;
        score += 20 + advancement * 5; // Bonus for passed pawns
      }
    }
    
    return score;
  }
  
  /**
   * Evaluate center control
   */
  private evaluateCenterControl(gameState: GameState, color: PieceColor): number {
    let score = 0;
    const centerSquares = [
      { row: 4, col: 4 }, { row: 4, col: 5 },
      { row: 5, col: 4 }, { row: 5, col: 5 }
    ];
    
    const extendedCenter = [
      { row: 3, col: 3 }, { row: 3, col: 4 }, { row: 3, col: 5 }, { row: 3, col: 6 },
      { row: 4, col: 3 }, { row: 4, col: 6 },
      { row: 5, col: 3 }, { row: 5, col: 6 },
      { row: 6, col: 3 }, { row: 6, col: 4 }, { row: 6, col: 5 }, { row: 6, col: 6 }
    ];
    
    // Check center occupation
    for (const pos of centerSquares) {
      const piece = gameState.board[pos.row][pos.col];
      if (piece) {
        if (piece.color === color) {
          score += 15;
          if (piece.type === 'pawn') score += 10; // Extra bonus for central pawns
        } else {
          score -= 15;
        }
      }
    }
    
    // Check extended center
    for (const pos of extendedCenter) {
      const piece = gameState.board[pos.row][pos.col];
      if (piece && piece.color === color) {
        score += 5;
      }
    }
    
    return score;
  }
  
  /**
   * Evaluate piece development
   */
  private evaluateDevelopment(gameState: GameState, color: PieceColor): number {
    let score = 0;
    const startRow = color === 'white' ? 9 : 0;
    const secondRow = color === 'white' ? 8 : 1;
    
    // Penalty for undeveloped pieces
    for (let col = 0; col < 10; col++) {
      const piece = gameState.board[startRow][col];
      if (piece && piece.color === color) {
        switch (piece.type) {
          case 'knight':
            score -= 10; // Knights should be developed
            break;
          case 'bishop':
            score -= 10; // Bishops should be developed
            break;
        }
      }
      
      const secondPiece = gameState.board[secondRow][col];
      if (secondPiece && secondPiece.color === color && secondPiece.type === 'queen') {
        if (gameState.moveHistory.length < 10) {
          score -= 20; // Early queen development is usually bad
        }
      }
    }
    
    // Bonus for castling
    const king = this.findKing(gameState, color);
    if (king && !king.hasMoved) {
      // Check if king has castled (moved 3 squares)
      const originalCol = 5; // King starts at column 5
      if (Math.abs(king.col - originalCol) >= 2) {
        score += 30; // Bonus for castling
      }
    }
    
    return score;
  }
  
  /**
   * Evaluate tactical opportunities
   */
  private evaluateTactics(gameState: GameState, color: PieceColor): number {
    let score = 0;
    
    // Look for forks, pins, skewers
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const piece = gameState.board[row][col];
        if (piece && piece.color === color) {
          // Check for knight forks
          if (piece.type === 'knight') {
            score += this.evaluateKnightForks(gameState, { row, col }, color) * 20;
          }
          
          // Check for pins and skewers (simplified)
          if (piece.type === 'bishop' || piece.type === 'rook' || piece.type === 'queen') {
            score += this.evaluatePinsAndSkewers(gameState, { row, col }, piece, color) * 15;
          }
        }
      }
    }
    
    return score;
  }
  
  /**
   * Check for knight fork opportunities
   */
  private evaluateKnightForks(gameState: GameState, knightPos: Position, color: PieceColor): number {
    const knightMoves = [
      { dr: -2, dc: -1 }, { dr: -2, dc: 1 },
      { dr: -1, dc: -2 }, { dr: -1, dc: 2 },
      { dr: 1, dc: -2 }, { dr: 1, dc: 2 },
      { dr: 2, dc: -1 }, { dr: 2, dc: 1 }
    ];
    
    let attackedPieces = 0;
    let attackedValue = 0;
    
    for (const move of knightMoves) {
      const newRow = knightPos.row + move.dr;
      const newCol = knightPos.col + move.dc;
      
      if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10) {
        const target = gameState.board[newRow][newCol];
        if (target && target.color !== color) {
          attackedPieces++;
          attackedValue += PIECE_VALUES[target.type as keyof typeof PIECE_VALUES] || 100;
        }
      }
    }
    
    // Fork bonus if attacking multiple pieces
    if (attackedPieces >= 2) {
      return attackedValue / 100; // Convert to pawns
    }
    
    return 0;
  }
  
  /**
   * Evaluate pins and skewers
   */
  private evaluatePinsAndSkewers(
    gameState: GameState, 
    piecePos: Position, 
    piece: Piece,
    color: PieceColor
  ): number {
    // Simplified pin/skewer detection
    // In a real implementation, this would trace rays and check for alignment
    return 0; // Placeholder for now
  }
  
  /**
   * Check if the game is in endgame phase
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
    
    // Endgame if few pieces left or no queens
    return totalPieces < 14 || queens === 0;
  }
  
  /**
   * Find king position
   */
  private findKing(gameState: GameState, color: PieceColor): Position & { hasMoved: boolean } | null {
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const piece = gameState.board[row][col];
        if (piece && piece.type === 'king' && piece.color === color) {
          return { row, col, hasMoved: piece.hasMoved || false };
        }
      }
    }
    return null;
  }
}