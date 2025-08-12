/**
 * Enhanced WebSocket Manager with Ping-Pong Heartbeat
 * Provides robust connection management and monitoring
 */

import { errorHandler, ErrorType, ErrorSeverity } from './errorHandlers';

interface WebSocketConfig {
  url: string;
  protocols?: string | string[];
  reconnectDelay?: number;
  maxReconnectDelay?: number;
  reconnectDecay?: number;
  maxReconnectAttempts?: number;
  pingInterval?: number;
  pongTimeout?: number;
  enablePingPong?: boolean;
  debug?: boolean;
}

interface ConnectionStats {
  connectTime: number;
  disconnectTime: number;
  messagesReceived: number;
  messagesSent: number;
  bytesReceived: number;
  bytesSent: number;
  latency: number[];
  reconnectCount: number;
  lastError?: string;
}

type WebSocketState = 'connecting' | 'connected' | 'disconnecting' | 'disconnected' | 'reconnecting';

export class EnhancedWebSocketManager {
  private ws: WebSocket | null = null;
  private config: Required<WebSocketConfig>;
  private state: WebSocketState = 'disconnected';
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pingTimer: NodeJS.Timeout | null = null;
  private pongTimer: NodeJS.Timeout | null = null;
  private messageQueue: Array<string | ArrayBuffer> = [];
  private stats: ConnectionStats;
  private listeners: Map<string, Set<Function>> = new Map();
  private lastPingTime = 0;
  private isDestroyed = false;

  constructor(config: WebSocketConfig) {
    this.config = {
      url: config.url,
      protocols: config.protocols,
      reconnectDelay: config.reconnectDelay ?? 1000,
      maxReconnectDelay: config.maxReconnectDelay ?? 30000,
      reconnectDecay: config.reconnectDecay ?? 1.5,
      maxReconnectAttempts: config.maxReconnectAttempts ?? Infinity,
      pingInterval: config.pingInterval ?? 30000,
      pongTimeout: config.pongTimeout ?? 10000,
      enablePingPong: config.enablePingPong ?? true,
      debug: config.debug ?? false
    };

    this.stats = this.resetStats();
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.isDestroyed) {
      console.error('WebSocket manager has been destroyed');
      return;
    }

    if (this.state === 'connecting' || this.state === 'connected') {
      this.log('Already connected or connecting');
      return;
    }

    this.state = 'connecting';
    this.log('Connecting to WebSocket...');

    try {
      this.ws = new WebSocket(this.config.url, this.config.protocols);
      this.setupEventHandlers();
      this.stats.connectTime = Date.now();
    } catch (error) {
      this.handleError(error);
      this.scheduleReconnect();
    }
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = (event) => {
      this.state = 'connected';
      this.reconnectAttempts = 0;
      this.log('WebSocket connected');
      
      // Start ping-pong heartbeat
      if (this.config.enablePingPong) {
        this.startPingPong();
      }

      // Send queued messages
      this.flushMessageQueue();

      // Emit event
      this.emit('open', event);
    };

    this.ws.onmessage = (event) => {
      this.stats.messagesReceived++;
      this.stats.bytesReceived += event.data.length || 0;

      // Handle ping-pong messages
      if (this.config.enablePingPong) {
        if (event.data === 'ping') {
          this.send('pong');
          return;
        } else if (event.data === 'pong') {
          this.handlePong();
          return;
        }
      }

      this.emit('message', event.data);
    };

    this.ws.onerror = (event) => {
      this.handleError(event);
      this.emit('error', event);
    };

    this.ws.onclose = (event) => {
      this.state = 'disconnected';
      this.stats.disconnectTime = Date.now();
      this.stopPingPong();

      this.log(`WebSocket closed: ${event.code} - ${event.reason}`);
      this.emit('close', event);

      // Auto-reconnect if not intentionally closed
      if (!event.wasClean && !this.isDestroyed) {
        this.scheduleReconnect();
      }
    };
  }

  /**
   * Start ping-pong heartbeat
   */
  private startPingPong(): void {
    this.stopPingPong();

    this.pingTimer = setInterval(() => {
      if (this.state === 'connected' && this.ws?.readyState === WebSocket.OPEN) {
        this.sendPing();
      }
    }, this.config.pingInterval);
  }

  /**
   * Stop ping-pong heartbeat
   */
  private stopPingPong(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
    if (this.pongTimer) {
      clearTimeout(this.pongTimer);
      this.pongTimer = null;
    }
  }

  /**
   * Send ping message
   */
  private sendPing(): void {
    this.lastPingTime = Date.now();
    this.send('ping');
    
    // Set pong timeout
    this.pongTimer = setTimeout(() => {
      this.log('Pong timeout - connection may be dead');
      this.handlePongTimeout();
    }, this.config.pongTimeout);
  }

  /**
   * Handle pong response
   */
  private handlePong(): void {
    if (this.pongTimer) {
      clearTimeout(this.pongTimer);
      this.pongTimer = null;
    }

    const latency = Date.now() - this.lastPingTime;
    this.stats.latency.push(latency);
    
    // Keep only last 10 latency measurements
    if (this.stats.latency.length > 10) {
      this.stats.latency.shift();
    }

    this.log(`Pong received - latency: ${latency}ms`);
    this.emit('latency', latency);
  }

  /**
   * Handle pong timeout
   */
  private handlePongTimeout(): void {
    this.log('Connection appears dead - reconnecting...');
    this.ws?.close();
    this.scheduleReconnect();
  }

  /**
   * Send message through WebSocket
   */
  send(data: string | ArrayBuffer): boolean {
    if (this.state === 'connected' && this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(data);
        this.stats.messagesSent++;
        this.stats.bytesSent += data instanceof ArrayBuffer ? data.byteLength : data.length;
        return true;
      } catch (error) {
        this.handleError(error);
        this.messageQueue.push(data);
        return false;
      }
    } else {
      // Queue message for later
      this.messageQueue.push(data);
      return false;
    }
  }

  /**
   * Send JSON data
   */
  sendJSON(data: any): boolean {
    try {
      return this.send(JSON.stringify(data));
    } catch (error) {
      this.handleError(error);
      return false;
    }
  }

  /**
   * Flush message queue
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  /**
   * Schedule reconnection
   */
  private scheduleReconnect(): void {
    if (this.isDestroyed || this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.log('Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    const delay = Math.min(
      this.config.reconnectDelay * Math.pow(this.config.reconnectDecay, this.reconnectAttempts),
      this.config.maxReconnectDelay
    );

    this.state = 'reconnecting';
    this.reconnectAttempts++;
    this.stats.reconnectCount++;

    this.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    this.emit('reconnecting', { attempt: this.reconnectAttempts, delay });

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(code?: number, reason?: string): void {
    this.state = 'disconnecting';
    this.stopPingPong();

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(code ?? 1000, reason ?? 'Normal closure');
      this.ws = null;
    }

    this.state = 'disconnected';
  }

  /**
   * Destroy WebSocket manager
   */
  destroy(): void {
    this.isDestroyed = true;
    this.disconnect();
    this.messageQueue = [];
    this.listeners.clear();
  }

  /**
   * Handle errors
   */
  private handleError(error: any): void {
    const errorMessage = error?.message || 'Unknown WebSocket error';
    this.stats.lastError = errorMessage;
    
    errorHandler.handleError(error, {
      type: ErrorType.WEBSOCKET,
      severity: ErrorSeverity.MEDIUM,
      operation: 'WebSocket Operation',
      metadata: { 
        state: this.state, 
        reconnectAttempts: this.reconnectAttempts 
      }
    });
  }

  /**
   * Event emitter methods
   */
  on(event: string, handler: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(handler);
  }

  off(event: string, handler: Function): void {
    this.listeners.get(event)?.delete(handler);
  }

  private emit(event: string, data?: any): void {
    this.listeners.get(event)?.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }

  /**
   * Get connection state
   */
  getState(): WebSocketState {
    return this.state;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.state === 'connected' && this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get statistics
   */
  getStats(): ConnectionStats {
    return { ...this.stats };
  }

  /**
   * Get average latency
   */
  getAverageLatency(): number {
    if (this.stats.latency.length === 0) return 0;
    const sum = this.stats.latency.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.stats.latency.length);
  }

  /**
   * Reset statistics
   */
  private resetStats(): ConnectionStats {
    return {
      connectTime: 0,
      disconnectTime: 0,
      messagesReceived: 0,
      messagesSent: 0,
      bytesReceived: 0,
      bytesSent: 0,
      latency: [],
      reconnectCount: 0
    };
  }

  /**
   * Debug logging
   */
  private log(...args: any[]): void {
    if (this.config.debug) {
      console.log('[WebSocket]', ...args);
    }
  }
}

export default EnhancedWebSocketManager;