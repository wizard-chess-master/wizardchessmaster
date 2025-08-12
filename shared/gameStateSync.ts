/**
 * Game State Synchronization and Validation
 * Handles checksums, state reconciliation, and desync prevention
 */

// Platform-specific crypto handling
const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;

export interface GameStateSnapshot {
  board: any[][];
  currentTurn: 'white' | 'black';
  moveHistory: any[];
  capturedPieces: any[];
  gameStatus: string;
  sequenceNumber: number;
  timestamp: number;
  checksum: string;
}

export interface MoveData {
  from: { row: number; col: number };
  to: { row: number; col: number };
  piece: any;
  captured?: any;
  sequenceNumber: number;
  timestamp: number;
  checksum?: string;
}

export class GameStateManager {
  private sequenceNumber: number = 0;
  private stateHistory: GameStateSnapshot[] = [];
  private maxHistorySize: number = 50;

  /**
   * Generate a checksum for the current game state
   */
  generateChecksum(gameState: any): string {
    // Create a deterministic string representation of the game state
    const stateString = JSON.stringify({
      board: this.normalizeBoardState(gameState.board),
      currentTurn: gameState.currentTurn,
      moveCount: gameState.moveHistory?.length || 0,
      capturedCount: gameState.capturedPieces?.length || 0,
      gameStatus: gameState.gameStatus || 'active'
    });

    // Use simple hash function that works in both environments
    let hash = 0;
    for (let i = 0; i < stateString.length; i++) {
      const char = stateString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Convert to hexadecimal and ensure 8 characters
    const hashStr = Math.abs(hash).toString(16);
    return hashStr.padStart(8, '0').substring(0, 8);
  }

  /**
   * Normalize board state for consistent checksum generation
   */
  private normalizeBoardState(board: any[][]): string[][] {
    if (!board) return [];
    
    return board.map(row => 
      row.map(piece => {
        if (!piece) return 'empty';
        return `${piece.color}-${piece.type}-${piece.id}`;
      })
    );
  }

  /**
   * Create a snapshot of the current game state
   */
  createSnapshot(gameState: any): GameStateSnapshot {
    const snapshot: GameStateSnapshot = {
      board: JSON.parse(JSON.stringify(gameState.board)), // Deep clone
      currentTurn: gameState.currentTurn,
      moveHistory: [...(gameState.moveHistory || [])],
      capturedPieces: [...(gameState.capturedPieces || [])],
      gameStatus: gameState.gameStatus || 'active',
      sequenceNumber: ++this.sequenceNumber,
      timestamp: Date.now(),
      checksum: this.generateChecksum(gameState)
    };

    // Add to history
    this.stateHistory.push(snapshot);
    
    // Trim history if too large
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift();
    }

    return snapshot;
  }

  /**
   * Validate a move against the current state
   */
  validateMove(move: MoveData, currentChecksum: string): boolean {
    // Check if the move's checksum matches the current state
    if (move.checksum && move.checksum !== currentChecksum) {
      console.warn('❌ Move checksum mismatch - potential desync detected');
      return false;
    }

    // Check sequence number
    if (move.sequenceNumber <= this.sequenceNumber - 10) {
      console.warn('❌ Move sequence too old - rejecting');
      return false;
    }

    return true;
  }

  /**
   * Find the last common valid state between two players
   */
  findCommonState(localChecksum: string, remoteChecksum: string): GameStateSnapshot | null {
    // Search history for matching checksums
    for (let i = this.stateHistory.length - 1; i >= 0; i--) {
      const snapshot = this.stateHistory[i];
      if (snapshot.checksum === localChecksum || snapshot.checksum === remoteChecksum) {
        return snapshot;
      }
    }
    return null;
  }

  /**
   * Reconcile states when desync is detected
   */
  reconcileStates(
    localState: any,
    remoteState: GameStateSnapshot,
    isAuthoritative: boolean
  ): any {
    const localChecksum = this.generateChecksum(localState);
    const remoteChecksum = remoteState.checksum;

    console.log(`🔄 State reconciliation - Local: ${localChecksum}, Remote: ${remoteChecksum}`);

    // If checksums match, no reconciliation needed
    if (localChecksum === remoteChecksum) {
      console.log('✅ States are synchronized');
      return localState;
    }

    // If this is the authoritative source (server), keep local state
    if (isAuthoritative) {
      console.log('📋 Using authoritative (server) state');
      return localState;
    }

    // Otherwise, adopt remote state
    console.log('📥 Adopting remote state to resolve desync');
    return {
      board: remoteState.board,
      currentTurn: remoteState.currentTurn,
      moveHistory: remoteState.moveHistory,
      capturedPieces: remoteState.capturedPieces,
      gameStatus: remoteState.gameStatus
    };
  }

  /**
   * Get the current sequence number
   */
  getSequenceNumber(): number {
    return this.sequenceNumber;
  }

  /**
   * Reset the state manager
   */
  reset(): void {
    this.sequenceNumber = 0;
    this.stateHistory = [];
  }

  /**
   * Get state history for debugging
   */
  getStateHistory(): GameStateSnapshot[] {
    return this.stateHistory;
  }
}

// Singleton instance for client-side use
export const gameStateManager = new GameStateManager();

/**
 * Utility function to detect potential desync indicators
 */
export function detectDesyncIndicators(
  localState: any,
  remoteState: any
): { isDesynced: boolean; reasons: string[] } {
  const reasons: string[] = [];

  // Check turn mismatch
  if (localState.currentTurn !== remoteState.currentTurn) {
    reasons.push('Turn mismatch');
  }

  // Check move count difference
  const localMoveCount = localState.moveHistory?.length || 0;
  const remoteMoveCount = remoteState.moveHistory?.length || 0;
  if (Math.abs(localMoveCount - remoteMoveCount) > 1) {
    reasons.push(`Move count difference: local=${localMoveCount}, remote=${remoteMoveCount}`);
  }

  // Check piece count (basic validation)
  const localPieceCount = countPieces(localState.board);
  const remotePieceCount = countPieces(remoteState.board);
  if (localPieceCount.white !== remotePieceCount.white || 
      localPieceCount.black !== remotePieceCount.black) {
    reasons.push('Piece count mismatch');
  }

  return {
    isDesynced: reasons.length > 0,
    reasons
  };
}

/**
 * Count pieces on the board
 */
function countPieces(board: any[][]): { white: number; black: number } {
  let white = 0;
  let black = 0;
  
  if (!board) return { white, black };
  
  for (const row of board) {
    for (const piece of row) {
      if (piece) {
        if (piece.color === 'white') white++;
        else if (piece.color === 'black') black++;
      }
    }
  }
  
  return { white, black };
}