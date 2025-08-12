/**
 * Centralized Error Handlers for Critical Paths
 * Provides consistent error handling and logging
 */

// Error types
export enum ErrorType {
  AI_COMPUTATION = 'AI_COMPUTATION',
  AUDIO_INIT = 'AUDIO_INIT',
  WEBSOCKET = 'WEBSOCKET',
  GAME_STATE = 'GAME_STATE',
  DATABASE = 'DATABASE',
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

interface ErrorContext {
  type: ErrorType;
  severity: ErrorSeverity;
  component?: string;
  operation?: string;
  metadata?: Record<string, any>;
}

class ErrorHandler {
  private errorLog: Array<{
    timestamp: number;
    error: Error;
    context: ErrorContext;
  }> = [];
  
  private maxLogSize = 100;

  /**
   * Handle error with context
   */
  handleError(error: Error | unknown, context: ErrorContext): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    // Log to console with formatting
    this.logError(errorObj, context);
    
    // Store in error log
    this.storeError(errorObj, context);
    
    // Send to server if critical
    if (context.severity === ErrorSeverity.CRITICAL || context.severity === ErrorSeverity.HIGH) {
      this.reportToServer(errorObj, context);
    }
    
    // Take recovery action based on error type
    this.attemptRecovery(errorObj, context);
  }

  private logError(error: Error, context: ErrorContext): void {
    const prefix = this.getLogPrefix(context.type);
    const severity = context.severity.toUpperCase();
    
    console.group(`${prefix} [${severity}] ${context.operation || 'Operation'} failed`);
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    if (context.metadata) {
      console.log('Context:', context.metadata);
    }
    console.groupEnd();
  }

  private getLogPrefix(type: ErrorType): string {
    const prefixes: Record<ErrorType, string> = {
      [ErrorType.AI_COMPUTATION]: '🤖',
      [ErrorType.AUDIO_INIT]: '🔊',
      [ErrorType.WEBSOCKET]: '🔌',
      [ErrorType.GAME_STATE]: '🎮',
      [ErrorType.DATABASE]: '📊',
      [ErrorType.NETWORK]: '🌐',
      [ErrorType.VALIDATION]: '✅',
    };
    return prefixes[type] || '❌';
  }

  private storeError(error: Error, context: ErrorContext): void {
    this.errorLog.push({
      timestamp: Date.now(),
      error,
      context,
    });
    
    // Trim log if too large
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }
  }

  private reportToServer(error: Error, context: ErrorContext): void {
    try {
      fetch('/api/log/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          context,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      }).catch(err => {
        console.error('Failed to report error to server:', err);
      });
    } catch (e) {
      console.error('Failed to send error report:', e);
    }
  }

  private attemptRecovery(error: Error, context: ErrorContext): void {
    switch (context.type) {
      case ErrorType.AUDIO_INIT:
        this.recoverAudio();
        break;
      case ErrorType.WEBSOCKET:
        this.recoverWebSocket();
        break;
      case ErrorType.AI_COMPUTATION:
        this.recoverAI();
        break;
      case ErrorType.GAME_STATE:
        this.recoverGameState();
        break;
    }
  }

  private recoverAudio(): void {
    console.log('🔊 Attempting audio recovery...');
    // Disable audio temporarily
    localStorage.setItem('audioDisabled', 'true');
    // Notify user
    this.showUserNotification('Audio has been temporarily disabled due to an error. You can re-enable it in settings.');
  }

  private recoverWebSocket(): void {
    console.log('🔌 WebSocket recovery will be handled by reconnection manager');
  }

  private recoverAI(): void {
    console.log('🤖 Falling back to simpler AI algorithm');
    // Set flag to use simpler AI
    sessionStorage.setItem('useSimpleAI', 'true');
  }

  private recoverGameState(): void {
    console.log('🎮 Attempting to recover game state from last checkpoint');
    // Try to load last valid game state
    const lastState = localStorage.getItem('lastValidGameState');
    if (lastState) {
      console.log('Found backup game state, restoring...');
    }
  }

  private showUserNotification(message: string): void {
    // This would integrate with your notification system
    console.warn('User notification:', message);
  }

  getRecentErrors(count: number = 10): Array<{
    timestamp: number;
    error: Error;
    context: ErrorContext;
  }> {
    return this.errorLog.slice(-count);
  }

  clearErrorLog(): void {
    this.errorLog = [];
  }
}

// Singleton instance
export const errorHandler = new ErrorHandler();

/**
 * Wrapper for AI computations with error handling
 */
export async function withAIErrorHandling<T>(
  operation: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T | null> {
  try {
    const startTime = performance.now();
    const result = await operation();
    const duration = performance.now() - startTime;
    
    // Log slow operations
    if (duration > 1000) {
      console.warn(`⚡ Slow AI operation: ${duration.toFixed(2)}ms`);
    }
    
    return result;
  } catch (error) {
    errorHandler.handleError(error, {
      type: ErrorType.AI_COMPUTATION,
      severity: ErrorSeverity.MEDIUM,
      operation: 'AI Calculation',
      metadata,
    });
    return null;
  }
}

/**
 * Wrapper for audio operations with error handling
 */
export function withAudioErrorHandling<T>(
  operation: () => T,
  metadata?: Record<string, any>
): T | null {
  try {
    return operation();
  } catch (error) {
    errorHandler.handleError(error, {
      type: ErrorType.AUDIO_INIT,
      severity: ErrorSeverity.LOW,
      operation: 'Audio Operation',
      metadata,
    });
    return null;
  }
}

/**
 * Wrapper for WebSocket operations with error handling
 */
export function withWebSocketErrorHandling<T>(
  operation: () => T,
  metadata?: Record<string, any>
): T | null {
  try {
    return operation();
  } catch (error) {
    errorHandler.handleError(error, {
      type: ErrorType.WEBSOCKET,
      severity: ErrorSeverity.HIGH,
      operation: 'WebSocket Operation',
      metadata,
    });
    return null;
  }
}

/**
 * Wrapper for game state operations with error handling
 */
export function withGameStateErrorHandling<T>(
  operation: () => T,
  metadata?: Record<string, any>
): T | null {
  try {
    // Save current state as backup before operation
    const currentState = metadata?.currentState;
    if (currentState) {
      localStorage.setItem('lastValidGameState', JSON.stringify(currentState));
    }
    
    return operation();
  } catch (error) {
    errorHandler.handleError(error, {
      type: ErrorType.GAME_STATE,
      severity: ErrorSeverity.HIGH,
      operation: 'Game State Update',
      metadata,
    });
    return null;
  }
}

/**
 * Performance monitoring wrapper
 */
export function withPerformanceMonitoring<T>(
  operation: () => T,
  operationName: string,
  threshold: number = 100
): T {
  const startTime = performance.now();
  // Type assertion for Chrome-specific performance.memory API
  const performanceWithMemory = performance as any;
  const startMemory = performanceWithMemory.memory?.usedJSHeapSize || 0;
  
  try {
    const result = operation();
    
    const duration = performance.now() - startTime;
    const memoryDelta = performanceWithMemory.memory 
      ? performanceWithMemory.memory.usedJSHeapSize - startMemory 
      : 0;
    
    if (duration > threshold) {
      console.warn(`⚡ Slow operation: ${operationName} took ${duration.toFixed(2)}ms`);
    }
    
    if (memoryDelta > 10 * 1024 * 1024) { // 10MB
      console.warn(`💾 High memory usage: ${operationName} used ${(memoryDelta / 1024 / 1024).toFixed(2)}MB`);
    }
    
    return result;
  } catch (error) {
    console.error(`Performance monitoring failed for ${operationName}:`, error);
    throw error;
  }
}

export default errorHandler;