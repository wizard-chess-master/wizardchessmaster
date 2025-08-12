/**
 * Integration helpers for adding logging to existing components
 */

import { logger, LogCategory } from './clientLogger';

// Multiplayer event logging
export function logMultiplayerEvent(event: string, data?: any) {
  logger.info(LogCategory.MULTIPLAYER, event, data);
}

export function logMultiplayerError(error: Error, context?: any) {
  logger.error(LogCategory.MULTIPLAYER, 'Multiplayer error', error, context);
}

// Audio event logging
export function logAudioInit(success: boolean, details?: any) {
  if (success) {
    logger.info(LogCategory.AUDIO, 'Audio system initialized', details);
  } else {
    logger.error(LogCategory.AUDIO, 'Audio initialization failed', undefined, details);
  }
}

export function logAudioEvent(event: string, data?: any) {
  logger.debug(LogCategory.AUDIO, event, data);
}

// AI decision logging
export function logAIDecision(move: any, difficulty: string, evaluation?: number) {
  logger.debug(LogCategory.AI, 'AI move decision', {
    move,
    difficulty,
    evaluation,
    timestamp: Date.now()
  });
}

export function logAITraining(results: any) {
  logger.info(LogCategory.AI, 'Training session completed', results);
}

// Performance logging
export function logPerformanceMetric(metric: string, value: number, context?: any) {
  logger.debug(LogCategory.PERFORMANCE, metric, {
    value,
    ...context,
    timestamp: Date.now()
  });
}

export function logFPSWarning(fps: number) {
  if (fps < 30) {
    logger.warn(LogCategory.PERFORMANCE, `Low FPS detected: ${fps}`, { fps });
  }
}

// Campaign progress logging
export function logCampaignEvent(event: string, level: number, data?: any) {
  logger.info(LogCategory.CAMPAIGN, event, {
    level,
    ...data,
    timestamp: Date.now()
  });
}

export function logCampaignError(error: Error, level: number, context?: any) {
  logger.error(LogCategory.CAMPAIGN, 'Campaign error', error, {
    level,
    ...context
  });
}

// Game state logging
export function logGameStateChange(from: string, to: string, context?: any) {
  logger.info(LogCategory.GAME, `Game state: ${from} → ${to}`, context);
}

export function logGameError(error: Error, context?: any) {
  logger.error(LogCategory.GAME, 'Game error', error, context);
}

// Network request logging
export function logNetworkRequest(method: string, url: string, status?: number) {
  logger.debug(LogCategory.NETWORK, `${method} ${url}`, {
    status,
    timestamp: Date.now()
  });
}

export function logNetworkError(error: Error, url: string, context?: any) {
  logger.error(LogCategory.NETWORK, 'Network request failed', error, {
    url,
    ...context
  });
}

// Auth logging
export function logAuthEvent(event: string, userId?: string, data?: any) {
  logger.info(LogCategory.AUTH, event, {
    userId,
    ...data,
    timestamp: Date.now()
  });
}

// Payment logging
export function logPaymentEvent(event: string, amount?: number, data?: any) {
  logger.info(LogCategory.PAYMENT, event, {
    amount,
    ...data,
    timestamp: Date.now()
  });
}