/**
 * Hint System for Wizard Chess
 * Provides intelligent hints for player moves using simplified AI evaluation
 */

import { ChessPiece, Position, ChessMove } from './types';
import * as aiPlayerModule from './aiPlayer';

export interface HintInfo {
  from: Position;
  to: Position;
  piece: ChessPiece;
  score: number;
  description: string;
  reasoning: string;
}

class ChessHintSystem {
  /**
   * Generate a hint for the current position
   */
  generateHint(
    board: (ChessPiece | null)[][],
    currentPlayer: 'white' | 'black',
    moveHistory: ChessMove[]
  ): HintInfo | null {
    try {
      console.log('🎯 Generating hint for', currentPlayer);

      // Use AI player to find the best move
      const bestMove = aiPlayerModule.getBestMove(board, currentPlayer, moveHistory, 2); // Depth 2 for hints
      
      if (!bestMove) {
        console.log('❌ No valid moves found for hint');
        return null;
      }

      const piece = board[bestMove.from.row][bestMove.from.col];
      if (!piece) {
        console.log('❌ No piece found at hint position');
        return null;
      }

      const hint: HintInfo = {
        from: bestMove.from,
        to: bestMove.to,
        piece: piece,
        score: bestMove.score,
        description: this.generateHintDescription(bestMove, board),
        reasoning: this.generateHintReasoning(bestMove, board)
      };

      console.log('💡 Generated hint:', hint);
      return hint;
    } catch (error) {
      console.error('❌ Error generating hint:', error);
      return null;
    }
  }

  /**
   * Generate user-friendly description of the hint move
   */
  private generateHintDescription(move: ChessMove, board: (ChessPiece | null)[][]): string {
    const piece = move.piece;
    const fromSquare = this.positionToSquare(move.from);
    const toSquare = this.positionToSquare(move.to);
    
    let description = `Move ${piece.type} from ${fromSquare} to ${toSquare}`;
    
    if (move.captured) {
      description += ` (captures ${move.captured.type})`;
    }
    
    if (move.isWizardTeleport) {
      description += ' (wizard teleport)';
    }
    
    if (move.isWizardAttack) {
      description += ' (wizard ranged attack)';
    }
    
    if (move.isCastling) {
      description = 'Castle king for safety';
    }

    return description;
  }

  /**
   * Generate strategic reasoning for the hint
   */
  private generateHintReasoning(move: ChessMove, board: (ChessPiece | null)[][]): string {
    const reasonings: string[] = [];
    
    // Check for captures
    if (move.captured) {
      reasonings.push(`Captures enemy ${move.captured.type}`);
    }
    
    // Check for threats
    if (this.createsThreat(move, board)) {
      reasonings.push('Creates threat to enemy pieces');
    }
    
    // Check for defense
    if (this.improvesDefense(move, board)) {
      reasonings.push('Improves piece defense');
    }
    
    // Check for center control
    if (this.improvesCenterControl(move)) {
      reasonings.push('Controls important central squares');
    }
    
    // Check for piece development
    if (this.developsPiece(move, board)) {
      reasonings.push('Develops piece to better position');
    }
    
    // Check for king safety
    if (this.improvesKingSafety(move, board)) {
      reasonings.push('Improves king safety');
    }
    
    // Wizard-specific reasoning
    if (move.isWizardTeleport) {
      reasonings.push('Uses wizard mobility advantage');
    }
    
    if (move.isWizardAttack) {
      reasonings.push('Uses wizard ranged attack ability');
    }

    return reasonings.length > 0 ? reasonings.join(', ') : 'Strong tactical move';
  }

  /**
   * Check if move creates threat to enemy pieces
   */
  private createsThreat(move: ChessMove, board: (ChessPiece | null)[][]): boolean {
    // Simplified threat detection - check if move captures or attacks valuable pieces
    if (move.captured) {
      return true; // Capturing is always a threat
    }
    
    // For now, simplified logic - wizard attacks are threats
    if (move.isWizardAttack) {
      return true;
    }
    
    return false;
  }

  /**
   * Check if move improves defense
   */
  private improvesDefense(move: ChessMove, board: (ChessPiece | null)[][]): boolean {
    // Simplified defense check - moving king or castling improves defense
    if (move.piece.type === 'king' || move.isCastling) {
      return true;
    }
    
    // Moving pieces away from attacks improves defense
    return move.piece.type !== 'pawn';
  }

  /**
   * Check if move improves center control
   */
  private improvesCenterControl(move: ChessMove): boolean {
    const centralSquares = [
      { row: 4, col: 4 }, { row: 4, col: 5 },
      { row: 5, col: 4 }, { row: 5, col: 5 }
    ];
    
    return centralSquares.some(square => 
      square.row === move.to.row && square.col === move.to.col
    );
  }

  /**
   * Check if move develops a piece
   */
  private developsPiece(move: ChessMove, board: (ChessPiece | null)[][]): boolean {
    // Check if piece is moving from back rank to a more active square
    const isWhite = move.piece.color === 'white';
    const backRank = isWhite ? 0 : 9;
    
    if (move.from.row === backRank && move.to.row !== backRank) {
      return ['knight', 'bishop', 'queen'].includes(move.piece.type);
    }
    
    return false;
  }

  /**
   * Check if move improves king safety
   */
  private improvesKingSafety(move: ChessMove, board: (ChessPiece | null)[][]): boolean {
    return move.piece.type === 'king' || Boolean(move.isCastling);
  }

  /**
   * Simulate a move on the board (without modifying original)
   */
  private simulateMove(board: (ChessPiece | null)[][], move: ChessMove): (ChessPiece | null)[][] {
    const newBoard = board.map(row => [...row]);
    
    newBoard[move.to.row][move.to.col] = move.piece;
    newBoard[move.from.row][move.from.col] = null;
    
    return newBoard;
  }

  /**
   * Convert position to human-readable square notation
   */
  private positionToSquare(pos: Position): string {
    const col = String.fromCharCode(65 + pos.col); // A-J
    const row = (10 - pos.row).toString(); // 1-10
    return col + row;
  }
}

export const hintSystem = new ChessHintSystem();