/**
 * Hint System for Wizard Chess
 * Provides intelligent hints for player moves using simplified AI evaluation
 */

import { ChessPiece, Position, ChessMove, GameState } from './types';
import { getAIMove } from './aiPlayer';

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
  async generateHint(
    board: (ChessPiece | null)[][],
    currentPlayer: 'white' | 'black',
    moveHistory: ChessMove[]
  ): Promise<HintInfo | null> {
    try {
      console.log('🎯 Generating hint for', currentPlayer);

      // Create a game state for the AI to analyze
      const gameState: GameState = {
        board,
        currentPlayer,
        selectedPosition: null,
        validMoves: [],
        gamePhase: 'playing',
        gameMode: 'ai',
        aiDifficulty: 'hard',
        moveHistory,
        isInCheck: false,
        isCheckmate: false,
        isStalemate: false,
        winner: null
      };

      // Use AI player to find the best move
      const bestMove = await getAIMove(gameState);
      
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
        score: 0, // Score not available from bestMove
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
   * Generate engaging, thematic description of the hint move
   */
  private generateHintDescription(move: ChessMove, board: (ChessPiece | null)[][]): string {
    const piece = move.piece;
    const fromSquare = this.positionToSquare(move.from);
    const toSquare = this.positionToSquare(move.to);
    
    // Create more engaging descriptions based on piece type and action
    if (move.isCastling) {
      return '🏰 Shelter your king behind castle walls for protection';
    }
    
    if (move.isWizardTeleport) {
      if (move.captured) {
        return `✨ Teleport your wizard to ${toSquare} and banish the enemy ${move.captured.type}!`;
      }
      return `✨ Teleport your wizard from ${fromSquare} to ${toSquare} using mystical powers`;
    }
    
    if (move.isWizardAttack) {
      return `⚡ Cast a magical spell to destroy the enemy ${move.captured?.type || 'piece'} at ${toSquare}`;
    }
    
    // Regular moves with thematic descriptions
    const pieceEmojis: { [key: string]: string } = {
      king: '👑',
      queen: '♕',
      castle: '🏰', 
      bishop: '⛪',
      knight: '🐎',
      pawn: '⚔️',
      wizard: '🧙‍♂️'
    };
    
    const emoji = pieceEmojis[piece.type] || '♟️';
    
    if (move.captured) {
      return `${emoji} Command your ${piece.type} to charge from ${fromSquare} to ${toSquare} and capture the enemy ${move.captured.type}!`;
    }
    
    return `${emoji} Advance your ${piece.type} from ${fromSquare} to ${toSquare}`;
  }

  /**
   * Generate engaging strategic reasoning for the hint
   */
  private generateHintReasoning(move: ChessMove, board: (ChessPiece | null)[][]): string {
    const reasonings: string[] = [];
    
    // Check for captures with thematic language
    if (move.captured) {
      const capturedValue = this.getPieceValue(move.captured.type);
      if (capturedValue >= 9) {
        reasonings.push(`🎯 Eliminates a powerful enemy commander worth ${capturedValue} points!`);
      } else if (capturedValue >= 5) {
        reasonings.push(`⚔️ Destroys a valuable enemy unit worth ${capturedValue} points`);
      } else {
        reasonings.push(`💥 Removes an enemy ${move.captured.type} from the battlefield`);
      }
    }
    
    // Check for threats with engaging descriptions
    if (this.createsThreat(move, board)) {
      reasonings.push('🔥 Puts enemy forces under pressure');
    }
    
    // Check for defense
    if (this.improvesDefense(move, board)) {
      reasonings.push('🛡️ Strengthens your defensive formation');
    }
    
    // Check for center control
    if (this.improvesCenterControl(move)) {
      reasonings.push('⭐ Dominates the strategic center of the battlefield');
    }
    
    // Check for piece development
    if (this.developsPiece(move, board)) {
      reasonings.push('📈 Activates your piece for future attacks');
    }
    
    // Check for king safety
    if (this.improvesKingSafety(move, board)) {
      reasonings.push('👑 Protects your royal commander');
    }
    
    // Wizard-specific reasoning with mystical flavor
    if (move.isWizardTeleport) {
      reasonings.push('✨ Harnesses mystical teleportation magic');
    }
    
    if (move.isWizardAttack) {
      reasonings.push('⚡ Unleashes devastating ranged sorcery');
    }

    if (reasonings.length === 0) {
      return '🧠 A strategically sound move that improves your position';
    }

    return reasonings.join(' • ');
  }

  /**
   * Get the tactical value of a piece for hint explanations
   */
  private getPieceValue(pieceType: string): number {
    const values: { [key: string]: number } = {
      pawn: 1,
      knight: 3,
      bishop: 3,
      castle: 5,
      wizard: 7,
      queen: 9,
      king: 100
    };
    return values[pieceType] || 1;
  }

  /**
   * Convert position to chess square notation
   */
  private positionToSquare(pos: Position): string {
    const files = 'abcdefghij'; // 10x10 board
    return files[pos.col] + (10 - pos.row);
  }

  // Simplified analysis methods for improved hints
  private createsThreat(move: ChessMove, board: (ChessPiece | null)[][]): boolean {
    // Simple threat detection - can be enhanced later
    return false;
  }

  private improvesDefense(move: ChessMove, board: (ChessPiece | null)[][]): boolean {
    // Simple defense detection - can be enhanced later
    return false;
  }

  private improvesCenterControl(move: ChessMove): boolean {
    const centerSquares = [[4,4], [4,5], [5,4], [5,5]]; // Center of 10x10 board
    return centerSquares.some(([row, col]) => 
      move.to.row === row && move.to.col === col
    );
  }

  private developsPiece(move: ChessMove, board: (ChessPiece | null)[][]): boolean {
    // Check if piece is moving from back rank
    const backRank = move.piece.color === 'white' ? 9 : 0;
    return move.from.row === backRank;
  }

  private improvesKingSafety(move: ChessMove, board: (ChessPiece | null)[][]): boolean {
    // Simple king safety check - can be enhanced later
    return move.isCastling || false;
  }
}

// Export singleton instance
export const hintSystem = new ChessHintSystem();