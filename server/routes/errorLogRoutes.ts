/**
 * Error Logging API Routes
 * Handles client-side error reporting to server
 */

import { Router } from 'express';
import logger from '../utils/logger';

const router = Router();

// Error log endpoint
router.post('/api/log/error', (req, res) => {
  const { message, stack, context, componentStack, timestamp, userAgent, url } = req.body;
  
  // Log the error with Winston
  logger.error(`Client Error: ${message}`, {
    stack,
    context,
    componentStack,
    timestamp,
    userAgent,
    url,
    ip: req.ip,
  });

  // Store in database if needed (future enhancement)
  // await saveErrorToDatabase({ ... });

  res.json({ success: true, message: 'Error logged successfully' });
});

// Performance log endpoint
router.post('/api/log/performance', (req, res) => {
  const { operation, duration, memory, timestamp } = req.body;
  
  // Log performance data
  if (duration > 1000) {
    logger.performance.slow(operation, duration, memory);
  }
  
  // Also log as info for tracking
  logger.info('Performance metric', {
    operation,
    duration,
    memory,
    timestamp,
    userAgent: req.headers['user-agent'],
  });

  res.json({ success: true });
});

// Memory leak report endpoint
router.post('/api/log/memory-leak', (req, res) => {
  const { report, snapshots, timestamp } = req.body;
  
  logger.warn('Memory leak detected', {
    report,
    snapshots,
    timestamp,
    userAgent: req.headers['user-agent'],
  });

  res.json({ success: true });
});

// WebSocket health endpoint
router.post('/api/log/websocket-health', (req, res) => {
  const { stats, state, reconnectCount } = req.body;
  
  // Log WebSocket health info
  logger.info('WebSocket health report', {
    stats,
    state,
    reconnectCount,
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true });
});

export default router;