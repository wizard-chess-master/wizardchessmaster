/**
 * Tactical Pattern Recognition for Enhanced AI
 * Identifies forks, pins, skewers, discovered attacks, and other tactics
 */

import type { GameState, ChessPiece as Piece, PieceColor, Position } from '../chess/types';

export interface TacticalPattern {
  type: 'fork' | 'pin' | 'skewer' | 'discovered_attack' | 'double_attack' | 'removal' | 'deflection';
  attacker: Position;
  targets: Position[];
  value: number;
  description: string;
}

export class TacticalAnalyzer {
  /**
   * Find all tactical patterns in the current position
   */
  findTacticalPatterns(gameState: GameState, color: PieceColor): TacticalPattern[] {
    const patterns: TacticalPattern[] = [];
    
    // Find forks
    patterns.push(...this.findForks(gameState, color));
    
    // Find pins
    patterns.push(...this.findPins(gameState, color));
    
    // Find skewers
    patterns.push(...this.findSkewers(gameState, color));
    
    // Find discovered attacks
    patterns.push(...this.findDiscoveredAttacks(gameState, color));
    
    // Find double attacks
    patterns.push(...this.findDoubleAttacks(gameState, color));
    
    return patterns.sort((a, b) => b.value - a.value);
  }
  
  /**
   * Find fork opportunities (piece attacking multiple targets)
   */
  private findForks(gameState: GameState, color: PieceColor): TacticalPattern[] {
    const forks: TacticalPattern[] = [];
    
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const piece = gameState.board[row][col];
        if (piece && piece.color === color) {
          const attackedSquares = this.getAttackedSquares(gameState, { row, col }, piece);
          const enemyPieces = attackedSquares.filter(pos => {
            const target = gameState.board[pos.row][pos.col];
            return target && target.color !== color;
          });
          
          if (enemyPieces.length >= 2) {
            const value = enemyPieces.reduce((sum, pos) => {
              const target = gameState.board[pos.row][pos.col];
              return sum + this.getPieceValue(target!.type);
            }, 0);
            
            forks.push({
              type: 'fork',
              attacker: { row, col },
              targets: enemyPieces,
              value: value / 2, // Divide by 2 since we can only capture one
              description: `${piece.type} fork attacking ${enemyPieces.length} pieces`
            });
          }
        }
      }
    }
    
    return forks;
  }
  
  /**
   * Find pin opportunities (piece pinned to a more valuable piece)
   */
  private findPins(gameState: GameState, color: PieceColor): TacticalPattern[] {
    const pins: TacticalPattern[] = [];
    
    // Find all sliding pieces (bishop, rook, queen)
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const piece = gameState.board[row][col];
        if (piece && piece.color === color && this.isSlidingPiece(piece.type)) {
          const pinPatterns = this.findPinsFromPiece(gameState, { row, col }, piece);
          pins.push(...pinPatterns);
        }
      }
    }
    
    return pins;
  }
  
  /**
   * Find pins from a specific sliding piece
   */
  private findPinsFromPiece(gameState: GameState, pos: Position, piece: Piece): TacticalPattern[] {
    const pins: TacticalPattern[] = [];
    const directions = this.getDirectionsForPiece(piece.type);
    
    for (const dir of directions) {
      const ray = this.traceRay(gameState, pos, dir);
      
      // Look for pattern: attacker -> enemy piece -> valuable enemy piece
      if (ray.length >= 2) {
        const firstPiece = gameState.board[ray[0].row][ray[0].col];
        const secondPiece = gameState.board[ray[1].row][ray[1].col];
        
        if (firstPiece && secondPiece && 
            firstPiece.color !== piece.color && 
            secondPiece.color !== piece.color) {
          
          const firstValue = this.getPieceValue(firstPiece.type);
          const secondValue = this.getPieceValue(secondPiece.type);
          
          if (secondValue > firstValue) {
            pins.push({
              type: 'pin',
              attacker: pos,
              targets: [ray[0], ray[1]],
              value: firstValue, // Value of the pinned piece
              description: `${firstPiece.type} pinned to ${secondPiece.type}`
            });
          }
        }
      }
    }
    
    return pins;
  }
  
  /**
   * Find skewer opportunities (forcing valuable piece to move, exposing less valuable piece)
   */
  private findSkewers(gameState: GameState, color: PieceColor): TacticalPattern[] {
    const skewers: TacticalPattern[] = [];
    
    // Similar to pins but first piece is more valuable
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const piece = gameState.board[row][col];
        if (piece && piece.color === color && this.isSlidingPiece(piece.type)) {
          const skewerPatterns = this.findSkewersFromPiece(gameState, { row, col }, piece);
          skewers.push(...skewerPatterns);
        }
      }
    }
    
    return skewers;
  }
  
  /**
   * Find skewers from a specific sliding piece
   */
  private findSkewersFromPiece(gameState: GameState, pos: Position, piece: Piece): TacticalPattern[] {
    const skewers: TacticalPattern[] = [];
    const directions = this.getDirectionsForPiece(piece.type);
    
    for (const dir of directions) {
      const ray = this.traceRay(gameState, pos, dir);
      
      if (ray.length >= 2) {
        const firstPiece = gameState.board[ray[0].row][ray[0].col];
        const secondPiece = gameState.board[ray[1].row][ray[1].col];
        
        if (firstPiece && secondPiece && 
            firstPiece.color !== piece.color && 
            secondPiece.color !== piece.color) {
          
          const firstValue = this.getPieceValue(firstPiece.type);
          const secondValue = this.getPieceValue(secondPiece.type);
          
          if (firstValue > secondValue && firstValue >= 500) { // Skewer if first is valuable
            skewers.push({
              type: 'skewer',
              attacker: pos,
              targets: [ray[0], ray[1]],
              value: secondValue, // Value we can win
              description: `Skewer: ${firstPiece.type} forced to move, exposing ${secondPiece.type}`
            });
          }
        }
      }
    }
    
    return skewers;
  }
  
  /**
   * Find discovered attack opportunities
   */
  private findDiscoveredAttacks(gameState: GameState, color: PieceColor): TacticalPattern[] {
    const discovered: TacticalPattern[] = [];
    
    // Look for pieces that block attacks from our sliding pieces
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const blocker = gameState.board[row][col];
        if (blocker && blocker.color === color && !this.isSlidingPiece(blocker.type)) {
          // Check if moving this piece would discover an attack
          const attacks = this.checkDiscoveredAttack(gameState, { row, col }, color);
          if (attacks.length > 0) {
            const value = Math.max(...attacks.map(a => a.value));
            discovered.push({
              type: 'discovered_attack',
              attacker: { row, col },
              targets: attacks.map(a => a.target),
              value,
              description: `Moving ${blocker.type} discovers attack`
            });
          }
        }
      }
    }
    
    return discovered;
  }
  
  /**
   * Check if moving a piece would discover an attack
   */
  private checkDiscoveredAttack(
    gameState: GameState, 
    blockerPos: Position, 
    color: PieceColor
  ): { target: Position; value: number }[] {
    const attacks: { target: Position; value: number }[] = [];
    
    // Temporarily remove the blocker
    const blocker = gameState.board[blockerPos.row][blockerPos.col];
    gameState.board[blockerPos.row][blockerPos.col] = null;
    
    // Check all sliding pieces of our color
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const piece = gameState.board[row][col];
        if (piece && piece.color === color && this.isSlidingPiece(piece.type)) {
          const newAttacks = this.getAttackedSquares(gameState, { row, col }, piece);
          for (const attack of newAttacks) {
            const target = gameState.board[attack.row][attack.col];
            if (target && target.color !== color) {
              attacks.push({
                target: attack,
                value: this.getPieceValue(target.type)
              });
            }
          }
        }
      }
    }
    
    // Restore the blocker
    gameState.board[blockerPos.row][blockerPos.col] = blocker;
    
    return attacks;
  }
  
  /**
   * Find double attack opportunities
   */
  private findDoubleAttacks(gameState: GameState, color: PieceColor): TacticalPattern[] {
    const doubleAttacks: TacticalPattern[] = [];
    
    // Look for pieces that can attack two targets simultaneously
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const piece = gameState.board[row][col];
        if (piece && piece.color === color) {
          const attacks = this.getAttackedSquares(gameState, { row, col }, piece);
          const valuableTargets = attacks.filter(pos => {
            const target = gameState.board[pos.row][pos.col];
            return target && target.color !== color && this.getPieceValue(target.type) >= 300;
          });
          
          if (valuableTargets.length >= 2) {
            const totalValue = valuableTargets.reduce((sum, pos) => {
              const target = gameState.board[pos.row][pos.col];
              return sum + this.getPieceValue(target!.type);
            }, 0);
            
            doubleAttacks.push({
              type: 'double_attack',
              attacker: { row, col },
              targets: valuableTargets,
              value: Math.min(...valuableTargets.map(pos => {
                const target = gameState.board[pos.row][pos.col];
                return this.getPieceValue(target!.type);
              })),
              description: `${piece.type} double attack`
            });
          }
        }
      }
    }
    
    return doubleAttacks;
  }
  
  /**
   * Get all squares attacked by a piece
   */
  private getAttackedSquares(gameState: GameState, pos: Position, piece: Piece): Position[] {
    const attacked: Position[] = [];
    
    switch (piece.type) {
      case 'pawn':
        attacked.push(...this.getPawnAttacks(pos, piece.color));
        break;
      case 'knight':
        attacked.push(...this.getKnightAttacks(pos));
        break;
      case 'bishop':
        attacked.push(...this.getBishopAttacks(gameState, pos));
        break;
      case 'rook':
        attacked.push(...this.getRookAttacks(gameState, pos));
        break;
      case 'queen':
        attacked.push(...this.getQueenAttacks(gameState, pos));
        break;
      case 'king':
        attacked.push(...this.getKingAttacks(pos));
        break;
      case 'wizard':
        attacked.push(...this.getWizardAttacks(gameState, pos));
        break;
    }
    
    return attacked.filter(p => p.row >= 0 && p.row < 10 && p.col >= 0 && p.col < 10);
  }
  
  /**
   * Get pawn attack squares
   */
  private getPawnAttacks(pos: Position, color: PieceColor): Position[] {
    const attacks: Position[] = [];
    const direction = color === 'white' ? -1 : 1;
    
    // Diagonal captures
    attacks.push({ row: pos.row + direction, col: pos.col - 1 });
    attacks.push({ row: pos.row + direction, col: pos.col + 1 });
    
    return attacks;
  }
  
  /**
   * Get knight attack squares
   */
  private getKnightAttacks(pos: Position): Position[] {
    const moves = [
      { dr: -2, dc: -1 }, { dr: -2, dc: 1 },
      { dr: -1, dc: -2 }, { dr: -1, dc: 2 },
      { dr: 1, dc: -2 }, { dr: 1, dc: 2 },
      { dr: 2, dc: -1 }, { dr: 2, dc: 1 }
    ];
    
    return moves.map(m => ({ row: pos.row + m.dr, col: pos.col + m.dc }));
  }
  
  /**
   * Get bishop attack squares
   */
  private getBishopAttacks(gameState: GameState, pos: Position): Position[] {
    const attacks: Position[] = [];
    const directions = [
      { dr: -1, dc: -1 }, { dr: -1, dc: 1 },
      { dr: 1, dc: -1 }, { dr: 1, dc: 1 }
    ];
    
    for (const dir of directions) {
      attacks.push(...this.traceRay(gameState, pos, dir));
    }
    
    return attacks;
  }
  
  /**
   * Get rook attack squares
   */
  private getRookAttacks(gameState: GameState, pos: Position): Position[] {
    const attacks: Position[] = [];
    const directions = [
      { dr: -1, dc: 0 }, { dr: 1, dc: 0 },
      { dr: 0, dc: -1 }, { dr: 0, dc: 1 }
    ];
    
    for (const dir of directions) {
      attacks.push(...this.traceRay(gameState, pos, dir));
    }
    
    return attacks;
  }
  
  /**
   * Get queen attack squares
   */
  private getQueenAttacks(gameState: GameState, pos: Position): Position[] {
    return [
      ...this.getBishopAttacks(gameState, pos),
      ...this.getRookAttacks(gameState, pos)
    ];
  }
  
  /**
   * Get king attack squares
   */
  private getKingAttacks(pos: Position): Position[] {
    const attacks: Position[] = [];
    
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr !== 0 || dc !== 0) {
          attacks.push({ row: pos.row + dr, col: pos.col + dc });
        }
      }
    }
    
    return attacks;
  }
  
  /**
   * Get wizard attack squares (can teleport and attack)
   */
  private getWizardAttacks(gameState: GameState, pos: Position): Position[] {
    const attacks: Position[] = [];
    
    // Wizards can attack any square within 3 squares
    for (let row = Math.max(0, pos.row - 3); row <= Math.min(9, pos.row + 3); row++) {
      for (let col = Math.max(0, pos.col - 3); col <= Math.min(9, pos.col + 3); col++) {
        if (row !== pos.row || col !== pos.col) {
          attacks.push({ row, col });
        }
      }
    }
    
    return attacks;
  }
  
  /**
   * Trace a ray in a direction until blocked
   */
  private traceRay(
    gameState: GameState, 
    start: Position, 
    direction: { dr: number; dc: number }
  ): Position[] {
    const positions: Position[] = [];
    let row = start.row + direction.dr;
    let col = start.col + direction.dc;
    
    while (row >= 0 && row < 10 && col >= 0 && col < 10) {
      positions.push({ row, col });
      
      if (gameState.board[row][col]) {
        break; // Stop at first piece
      }
      
      row += direction.dr;
      col += direction.dc;
    }
    
    return positions;
  }
  
  /**
   * Check if piece is a sliding piece
   */
  private isSlidingPiece(type: string): boolean {
    return type === 'bishop' || type === 'rook' || type === 'queen';
  }
  
  /**
   * Get movement directions for a piece type
   */
  private getDirectionsForPiece(type: string): { dr: number; dc: number }[] {
    switch (type) {
      case 'bishop':
        return [
          { dr: -1, dc: -1 }, { dr: -1, dc: 1 },
          { dr: 1, dc: -1 }, { dr: 1, dc: 1 }
        ];
      case 'rook':
        return [
          { dr: -1, dc: 0 }, { dr: 1, dc: 0 },
          { dr: 0, dc: -1 }, { dr: 0, dc: 1 }
        ];
      case 'queen':
        return [
          { dr: -1, dc: -1 }, { dr: -1, dc: 1 },
          { dr: 1, dc: -1 }, { dr: 1, dc: 1 },
          { dr: -1, dc: 0 }, { dr: 1, dc: 0 },
          { dr: 0, dc: -1 }, { dr: 0, dc: 1 }
        ];
      default:
        return [];
    }
  }
  
  /**
   * Get piece value for evaluation
   */
  private getPieceValue(type: string): number {
    const values: { [key: string]: number } = {
      pawn: 100,
      knight: 320,
      bishop: 330,
      rook: 500,
      queen: 900,
      king: 20000,
      wizard: 400
    };
    return values[type] || 0;
  }
}

export const tacticalAnalyzer = new TacticalAnalyzer();