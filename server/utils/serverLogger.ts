import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, category, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `${timestamp} [${level.toUpperCase()}] [${category || 'General'}] ${message} ${metaStr}`;
  })
);

// Create transports
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  })
];

// File transports for production
if (process.env.NODE_ENV === 'production') {
  // Daily rotating file for all logs
  transports.push(
    new DailyRotateFile({
      filename: path.join('logs', 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat
    })
  );

  // Separate file for errors
  transports.push(
    new DailyRotateFile({
      filename: path.join('logs', 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error',
      format: logFormat
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join('logs', 'exceptions.log'),
      format: logFormat
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join('logs', 'rejections.log'),
      format: logFormat
    })
  ]
});

// Wrapper class for structured logging
class ServerLogger {
  private logger: winston.Logger;

  constructor(winstonLogger: winston.Logger) {
    this.logger = winstonLogger;
  }

  // Main logging methods with category
  error(category: string, message: string, error?: Error, meta?: any) {
    this.logger.error(message, { 
      category, 
      error: error?.stack || error?.message,
      ...meta 
    });
  }

  warn(category: string, message: string, meta?: any) {
    this.logger.warn(message, { category, ...meta });
  }

  info(category: string, message: string, meta?: any) {
    this.logger.info(message, { category, ...meta });
  }

  debug(category: string, message: string, meta?: any) {
    this.logger.debug(message, { category, ...meta });
  }

  // Specialized logging methods
  logMultiplayerEvent(event: string, data: any) {
    this.info('Multiplayer', event, data);
  }

  logAIDecision(decision: string, data: any) {
    this.debug('AI', decision, data);
  }

  logPerformance(metric: string, value: number, context?: any) {
    this.info('Performance', metric, { value, ...context });
  }

  logAudioEvent(event: string, data?: any) {
    this.debug('Audio', event, data);
  }

  logCampaignProgress(level: number, event: string, data?: any) {
    this.info('Campaign', event, { level, ...data });
  }

  logAuth(event: string, userId?: string, data?: any) {
    this.info('Auth', event, { userId, ...data });
  }

  logPayment(event: string, userId?: string, data?: any) {
    this.info('Payment', event, { userId, ...data });
  }

  // Request logging middleware
  requestLogger() {
    return (req: any, res: any, next: any) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        this.info('HTTP', `${req.method} ${req.path}`, {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          ip: req.ip
        });
      });
      
      next();
    };
  }

  // Socket.IO event logging
  logSocketEvent(event: string, socketId: string, data?: any) {
    this.debug('Socket', event, { socketId, ...data });
  }

  // Database query logging
  logQuery(query: string, duration: number, params?: any) {
    this.debug('Database', 'Query executed', { 
      query: query.substring(0, 100), // Truncate long queries
      duration: `${duration}ms`,
      params 
    });
  }
}

export const serverLogger = new ServerLogger(logger);
export default serverLogger;