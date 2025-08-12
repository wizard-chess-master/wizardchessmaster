/**
 * Opening Book for Enhanced AI
 * Contains common chess openings adapted for 10x10 board
 */

export interface OpeningMove {
  from: { row: number; col: number };
  to: { row: number; col: number };
  name: string;
  evaluation: number;
}

export interface Opening {
  name: string;
  moves: OpeningMove[];
  popularity: number;
  winRate: number;
}

// 10x10 board adapted openings
const OPENINGS_10X10: Opening[] = [
  {
    name: "King's Pawn Opening",
    moves: [
      { from: { row: 8, col: 5 }, to: { row: 6, col: 5 }, name: "e2-e4", evaluation: 0.3 },
      { from: { row: 8, col: 4 }, to: { row: 6, col: 4 }, name: "d2-d4", evaluation: 0.3 }
    ],
    popularity: 0.35,
    winRate: 0.52
  },
  {
    name: "Queen's Pawn Opening",
    moves: [
      { from: { row: 8, col: 4 }, to: { row: 6, col: 4 }, name: "d2-d4", evaluation: 0.3 },
      { from: { row: 9, col: 2 }, to: { row: 7, col: 3 }, name: "Nc3", evaluation: 0.2 }
    ],
    popularity: 0.30,
    winRate: 0.51
  },
  {
    name: "Wizard's Gambit",
    moves: [
      { from: { row: 8, col: 5 }, to: { row: 6, col: 5 }, name: "e2-e4", evaluation: 0.3 },
      { from: { row: 9, col: 6 }, to: { row: 7, col: 6 }, name: "wizard-advance", evaluation: 0.4 }
    ],
    popularity: 0.20,
    winRate: 0.53
  },
  {
    name: "Fianchetto System",
    moves: [
      { from: { row: 8, col: 7 }, to: { row: 7, col: 7 }, name: "g2-g3", evaluation: 0.2 },
      { from: { row: 9, col: 6 }, to: { row: 8, col: 7 }, name: "Bg2", evaluation: 0.25 }
    ],
    popularity: 0.15,
    winRate: 0.50
  }
];

export class OpeningBook {
  private moveHistory: string[] = [];
  private currentOpening: Opening | null = null;
  
  /**
   * Get the best opening move for the current position
   */
  getBestOpeningMove(
    moveNumber: number,
    boardState: any,
    color: 'white' | 'black'
  ): OpeningMove | null {
    // Only use opening book for first 5-10 moves
    if (moveNumber > 10) return null;
    
    // For black, mirror the moves
    const isBlack = color === 'black';
    
    // First move - choose an opening based on popularity and win rate
    if (moveNumber === 1) {
      const opening = this.selectOpening();
      this.currentOpening = opening;
      const move = opening.moves[0];
      
      if (isBlack) {
        return this.mirrorMove(move);
      }
      return move;
    }
    
    // Continue with current opening if possible
    if (this.currentOpening && moveNumber <= this.currentOpening.moves.length) {
      const move = this.currentOpening.moves[moveNumber - 1];
      if (isBlack) {
        return this.mirrorMove(move);
      }
      return move;
    }
    
    return null;
  }
  
  /**
   * Select an opening based on weighted random selection
   */
  private selectOpening(): Opening {
    const totalWeight = OPENINGS_10X10.reduce((sum, opening) => 
      sum + opening.popularity * opening.winRate, 0
    );
    
    let random = Math.random() * totalWeight;
    
    for (const opening of OPENINGS_10X10) {
      random -= opening.popularity * opening.winRate;
      if (random <= 0) {
        return opening;
      }
    }
    
    // Fallback to first opening
    return OPENINGS_10X10[0];
  }
  
  /**
   * Mirror a move for black pieces (flip row coordinates)
   */
  private mirrorMove(move: OpeningMove): OpeningMove {
    return {
      from: { row: 9 - move.from.row, col: move.from.col },
      to: { row: 9 - move.to.row, col: move.to.col },
      name: move.name,
      evaluation: move.evaluation
    };
  }
  
  /**
   * Check if a move follows known opening theory
   */
  isTheoryMove(move: any, moveNumber: number): boolean {
    if (!this.currentOpening || moveNumber > this.currentOpening.moves.length) {
      return false;
    }
    
    const theoryMove = this.currentOpening.moves[moveNumber - 1];
    return (
      move.from.row === theoryMove.from.row &&
      move.from.col === theoryMove.from.col &&
      move.to.row === theoryMove.to.row &&
      move.to.col === theoryMove.to.col
    );
  }
  
  /**
   * Reset the opening book for a new game
   */
  reset(): void {
    this.moveHistory = [];
    this.currentOpening = null;
  }
}

export const openingBook = new OpeningBook();