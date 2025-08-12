/**
 * Winston Logger Configuration
 * Provides structured logging with different levels and transports
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston about our colors
winston.addColors(colors);

// Define format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} [${info.level}]: ${info.message}`,
  ),
);

// Define which transports to use
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
    ),
  }),
  
  // Error log file transport
  new DailyRotateFile({
    filename: path.join('logs', 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '20m',
    maxFiles: '14d',
  }),
  
  // Combined log file transport
  new DailyRotateFile({
    filename: path.join('logs', 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
  }),
];

// Create the logger
const Logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
  exitOnError: false, // Do not exit on handled exceptions
});

// Create a stream object for Morgan HTTP logger
export const stream = {
  write: (message: string) => {
    Logger.http(message.trim());
  },
};

// Export logger functions with context support
export const logger = {
  error: (message: string, meta?: any) => {
    Logger.error(meta ? `${message} ${JSON.stringify(meta)}` : message);
  },
  warn: (message: string, meta?: any) => {
    Logger.warn(meta ? `${message} ${JSON.stringify(meta)}` : message);
  },
  info: (message: string, meta?: any) => {
    Logger.info(meta ? `${message} ${JSON.stringify(meta)}` : message);
  },
  http: (message: string, meta?: any) => {
    Logger.http(meta ? `${message} ${JSON.stringify(meta)}` : message);
  },
  debug: (message: string, meta?: any) => {
    Logger.debug(meta ? `${message} ${JSON.stringify(meta)}` : message);
  },
  
  // WebSocket specific logging
  socket: {
    connect: (socketId: string, userId?: number) => {
      Logger.info(`🔌 Socket connected: ${socketId}${userId ? ` (User: ${userId})` : ''}`);
    },
    disconnect: (socketId: string, reason: string) => {
      Logger.info(`🔌 Socket disconnected: ${socketId} - Reason: ${reason}`);
    },
    error: (socketId: string, error: any) => {
      Logger.error(`🔌 Socket error: ${socketId}`, error);
    },
    event: (socketId: string, event: string, data?: any) => {
      Logger.debug(`🔌 Socket event: ${socketId} - ${event}`, data);
    },
  },
  
  // Game specific logging
  game: {
    created: (gameId: string, player1: string, player2: string) => {
      Logger.info(`🎮 Game created: ${gameId} - ${player1} vs ${player2}`);
    },
    move: (gameId: string, player: string, move: any) => {
      Logger.debug(`♟️ Game move: ${gameId} - Player: ${player}`, move);
    },
    ended: (gameId: string, winner: string, reason: string) => {
      Logger.info(`🏁 Game ended: ${gameId} - Winner: ${winner} - Reason: ${reason}`);
    },
    error: (gameId: string, error: any) => {
      Logger.error(`🎮 Game error: ${gameId}`, error);
    },
    desync: (gameId: string, details: any) => {
      Logger.warn(`⚠️ Game desync detected: ${gameId}`, details);
    },
  },
  
  // AI specific logging
  ai: {
    moveStart: (difficulty: string, depth: number) => {
      Logger.debug(`🤖 AI move calculation started - Difficulty: ${difficulty}, Depth: ${depth}`);
    },
    moveComplete: (duration: number, move: any) => {
      Logger.debug(`🤖 AI move completed in ${duration}ms`, move);
    },
    error: (error: any) => {
      Logger.error(`🤖 AI calculation error`, error);
    },
  },
  
  // Database specific logging
  db: {
    query: (query: string, params?: any) => {
      Logger.debug(`📊 Database query: ${query}`, params);
    },
    error: (operation: string, error: any) => {
      Logger.error(`📊 Database error in ${operation}`, error);
    },
    connected: () => {
      Logger.info(`📊 Database connected successfully`);
    },
    disconnected: () => {
      Logger.warn(`📊 Database disconnected`);
    },
  },
  
  // Performance logging
  performance: {
    slow: (operation: string, duration: number, threshold: number) => {
      Logger.warn(`⚡ Slow operation detected: ${operation} took ${duration}ms (threshold: ${threshold}ms)`);
    },
    memory: (usage: any) => {
      Logger.info(`💾 Memory usage`, usage);
    },
  },
};

export default logger;