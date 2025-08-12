/**
 * Client-side structured logging system
 * Provides consistent logging for React components with different log levels
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  error?: Error;
}

class ClientLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private currentLevel = LogLevel.INFO;

  constructor() {
    // Store logs in memory for debugging
    if (typeof window !== 'undefined') {
      (window as any).__wizardChessLogs = this.logs;
    }
  }

  private createEntry(level: LogLevel, category: string, message: string, data?: any, error?: Error): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
      error
    };
  }

  private log(entry: LogEntry) {
    // Only log if level is enabled
    if (entry.level > this.currentLevel) return;

    // Add to memory buffer
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output with proper formatting
    const prefix = `[${entry.category}]`;
    const style = this.getConsoleStyle(entry.level);
    
    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(style, prefix, entry.message, entry.data || '', entry.error || '');
        break;
      case LogLevel.WARN:
        console.warn(style, prefix, entry.message, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(style, prefix, entry.message, entry.data || '');
        break;
      case LogLevel.DEBUG:
        console.debug(style, prefix, entry.message, entry.data || '');
        break;
    }

    // Send critical errors to server
    if (entry.level === LogLevel.ERROR && typeof fetch !== 'undefined') {
      this.sendToServer(entry);
    }
  }

  private getConsoleStyle(level: LogLevel): string {
    switch (level) {
      case LogLevel.ERROR:
        return 'color: red; font-weight: bold';
      case LogLevel.WARN:
        return 'color: orange; font-weight: bold';
      case LogLevel.INFO:
        return 'color: blue';
      case LogLevel.DEBUG:
        return 'color: gray';
      default:
        return '';
    }
  }

  private async sendToServer(entry: LogEntry) {
    try {
      await fetch('/api/logs/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    } catch (err) {
      // Silently fail to avoid infinite loop
    }
  }

  // Public logging methods
  error(category: string, message: string, error?: Error, data?: any) {
    this.log(this.createEntry(LogLevel.ERROR, category, message, data, error));
  }

  warn(category: string, message: string, data?: any) {
    this.log(this.createEntry(LogLevel.WARN, category, message, data));
  }

  info(category: string, message: string, data?: any) {
    this.log(this.createEntry(LogLevel.INFO, category, message, data));
  }

  debug(category: string, message: string, data?: any) {
    this.log(this.createEntry(LogLevel.DEBUG, category, message, data));
  }

  // Performance tracking
  startTimer(label: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.info('Performance', `${label} took ${duration.toFixed(2)}ms`, { duration });
    };
  }

  // Get logs for debugging
  getLogs(filter?: { level?: LogLevel; category?: string }): LogEntry[] {
    if (!filter) return this.logs;
    
    return this.logs.filter(log => {
      if (filter.level !== undefined && log.level !== filter.level) return false;
      if (filter.category && log.category !== filter.category) return false;
      return true;
    });
  }

  // Clear logs
  clear() {
    this.logs = [];
  }

  // Set log level
  setLevel(level: LogLevel) {
    this.currentLevel = level;
    this.info('Logger', `Log level set to ${LogLevel[level]}`);
  }
}

// Singleton instance
export const logger = new ClientLogger();

// Category constants for consistency
export const LogCategory = {
  MULTIPLAYER: 'Multiplayer',
  AUDIO: 'Audio',
  AI: 'AI',
  PERFORMANCE: 'Performance',
  CAMPAIGN: 'Campaign',
  UI: 'UI',
  NETWORK: 'Network',
  GAME: 'Game',
  AUTH: 'Auth',
  PAYMENT: 'Payment'
} as const;