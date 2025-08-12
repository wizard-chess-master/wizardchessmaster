/**
 * Client-side Game State Reconciliation
 * Handles state validation and synchronization with server
 */

import { gameStateManager, detectDesyncIndicators } from '../../../../shared/gameStateSync';

export interface StateReconciliationConfig {
  onDesyncDetected?: (reasons: string[]) => void;
  onStateReconciled?: () => void;
  onReconciliationFailed?: (error: string) => void;
  maxReconciliationAttempts?: number;
}

export class ClientStateReconciliation {
  private config: Required<StateReconciliationConfig>;
  private reconciliationAttempts = 0;
  private lastValidChecksum: string | null = null;
  private pendingMoves: any[] = [];
  private isReconciling = false;

  constructor(config: StateReconciliationConfig = {}) {
    this.config = {
      onDesyncDetected: config.onDesyncDetected ?? (() => {}),
      onStateReconciled: config.onStateReconciled ?? (() => {}),
      onReconciliationFailed: config.onReconciliationFailed ?? (() => {}),
      maxReconciliationAttempts: config.maxReconciliationAttempts ?? 3
    };
  }

  /**
   * Validate local state against server checksum
   */
  validateState(localState: any, serverChecksum: string): boolean {
    const localChecksum = gameStateManager.generateChecksum(localState);
    const isValid = localChecksum === serverChecksum;
    
    if (isValid) {
      this.lastValidChecksum = localChecksum;
      this.reconciliationAttempts = 0;
    } else {
      console.warn(`❌ State validation failed - Local: ${localChecksum}, Server: ${serverChecksum}`);
    }
    
    return isValid;
  }

  /**
   * Handle incoming state sync from server
   */
  handleStateSync(serverState: any, serverChecksum: string): any {
    console.log('📥 Received state sync from server');
    
    // Clear pending moves as they're now invalid
    this.pendingMoves = [];
    
    // Update last valid checksum
    this.lastValidChecksum = serverChecksum;
    
    // Reset reconciliation attempts
    this.reconciliationAttempts = 0;
    this.isReconciling = false;
    
    // Notify reconciliation success
    this.config.onStateReconciled();
    
    return serverState;
  }

  /**
   * Queue a move for optimistic updates
   */
  queueMove(move: any) {
    this.pendingMoves.push({
      ...move,
      timestamp: Date.now(),
      sequenceNumber: gameStateManager.getSequenceNumber()
    });
  }

  /**
   * Confirm a move was accepted by server
   */
  confirmMove(sequenceNumber: number) {
    this.pendingMoves = this.pendingMoves.filter(
      move => move.sequenceNumber > sequenceNumber
    );
  }

  /**
   * Rollback pending moves on desync
   */
  rollbackPendingMoves() {
    console.log(`🔄 Rolling back ${this.pendingMoves.length} pending moves`);
    this.pendingMoves = [];
  }

  /**
   * Start reconciliation process
   */
  async startReconciliation(
    localState: any,
    requestSyncCallback: () => Promise<any>
  ): Promise<any> {
    if (this.isReconciling) {
      console.log('⏳ Reconciliation already in progress');
      return localState;
    }
    
    this.isReconciling = true;
    this.reconciliationAttempts++;
    
    if (this.reconciliationAttempts > this.config.maxReconciliationAttempts) {
      const error = 'Max reconciliation attempts exceeded';
      console.error(`❌ ${error}`);
      this.config.onReconciliationFailed(error);
      this.isReconciling = false;
      return localState;
    }
    
    console.log(`🔄 Starting reconciliation attempt ${this.reconciliationAttempts}/${this.config.maxReconciliationAttempts}`);
    
    try {
      // Request state sync from server
      const serverState = await requestSyncCallback();
      
      if (serverState) {
        return this.handleStateSync(serverState.gameState, serverState.checksum);
      }
      
      return localState;
    } catch (error) {
      console.error('❌ Reconciliation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.config.onReconciliationFailed(errorMessage);
      return localState;
    } finally {
      this.isReconciling = false;
    }
  }

  /**
   * Check if reconciliation is needed
   */
  needsReconciliation(localState: any, remoteState: any): boolean {
    const { isDesynced, reasons } = detectDesyncIndicators(localState, remoteState);
    
    if (isDesynced) {
      console.warn('⚠️ Desync detected:', reasons);
      this.config.onDesyncDetected(reasons);
    }
    
    return isDesynced;
  }

  /**
   * Get pending moves count
   */
  getPendingMovesCount(): number {
    return this.pendingMoves.length;
  }

  /**
   * Reset reconciliation state
   */
  reset() {
    this.reconciliationAttempts = 0;
    this.lastValidChecksum = null;
    this.pendingMoves = [];
    this.isReconciling = false;
    gameStateManager.reset();
  }
}

// Singleton instance for easy access
export const clientReconciliation = new ClientStateReconciliation({
  onDesyncDetected: (reasons) => {
    console.warn('🔄 Desync detected:', reasons);
    // Could show a notification to the user
  },
  onStateReconciled: () => {
    console.log('✅ Game state reconciled successfully');
  },
  onReconciliationFailed: (error) => {
    console.error('❌ Failed to reconcile game state:', error);
    // Could show an error message to the user
  }
});