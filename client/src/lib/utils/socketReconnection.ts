/**
 * Socket.IO Reconnection Manager
 * Handles automatic reconnection with exponential backoff and state recovery
 */

import { Socket } from 'socket.io-client';

export interface ReconnectionConfig {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  onReconnecting?: (attempt: number) => void;
  onReconnected?: () => void;
  onReconnectFailed?: () => void;
}

export class SocketReconnectionManager {
  private socket: Socket;
  private config: Required<ReconnectionConfig>;
  private reconnectAttempts = 0;
  private reconnectTimer?: NodeJS.Timeout;
  private isReconnecting = false;
  private lastPingTime = Date.now();
  private pingCheckInterval?: NodeJS.Timeout;
  private visibilityChangeHandler?: () => void;

  constructor(socket: Socket, config: ReconnectionConfig = {}) {
    this.socket = socket;
    this.config = {
      maxRetries: config.maxRetries ?? 10,
      initialDelay: config.initialDelay ?? 1000,
      maxDelay: config.maxDelay ?? 30000,
      backoffMultiplier: config.backoffMultiplier ?? 1.5,
      onReconnecting: config.onReconnecting ?? (() => {}),
      onReconnected: config.onReconnected ?? (() => {}),
      onReconnectFailed: config.onReconnectFailed ?? (() => {})
    };

    this.setupEventHandlers();
    this.setupPingPong();
    this.setupVisibilityHandling();
  }

  private setupEventHandlers() {
    // Handle disconnection
    this.socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket disconnected: ${reason}`);
      
      // Don't reconnect if manually disconnected
      if (reason === 'io client disconnect') {
        return;
      }

      this.startReconnection();
    });

    // Handle successful reconnection
    this.socket.on('connect', () => {
      if (this.isReconnecting) {
        console.log('✅ Successfully reconnected!');
        this.isReconnecting = false;
        this.reconnectAttempts = 0;
        
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = undefined;
        }

        this.config.onReconnected();
      }
    });

    // Handle connection errors
    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
      
      if (!this.isReconnecting) {
        this.startReconnection();
      }
    });
  }

  private setupPingPong() {
    // Listen for ping from server
    this.socket.on('ping', () => {
      this.lastPingTime = Date.now();
      this.socket.emit('pong');
    });

    // Check for connection health every 20 seconds
    this.pingCheckInterval = setInterval(() => {
      const timeSinceLastPing = Date.now() - this.lastPingTime;
      
      // If no ping received in 45 seconds, connection might be stale
      if (timeSinceLastPing > 45000 && this.socket.connected) {
        console.warn('⚠️ No ping received in 45 seconds, reconnecting...');
        this.socket.disconnect();
        this.startReconnection();
      }
    }, 20000);
  }

  private setupVisibilityHandling() {
    // Reconnect when tab becomes visible
    this.visibilityChangeHandler = () => {
      if (!document.hidden && !this.socket.connected && !this.isReconnecting) {
        console.log('👁️ Tab became visible, checking connection...');
        this.startReconnection();
      }
    };

    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
  }

  private startReconnection() {
    if (this.isReconnecting) {
      return;
    }

    this.isReconnecting = true;
    this.attemptReconnect();
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.config.maxRetries) {
      console.error('❌ Max reconnection attempts reached');
      this.isReconnecting = false;
      this.config.onReconnectFailed();
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.config.initialDelay * Math.pow(this.config.backoffMultiplier, this.reconnectAttempts - 1),
      this.config.maxDelay
    );

    console.log(`🔄 Reconnection attempt ${this.reconnectAttempts}/${this.config.maxRetries} in ${delay}ms`);
    this.config.onReconnecting(this.reconnectAttempts);

    this.reconnectTimer = setTimeout(() => {
      if (!this.socket.connected) {
        this.socket.connect();
        
        // Check if connection succeeded after a timeout
        setTimeout(() => {
          if (!this.socket.connected && this.isReconnecting) {
            this.attemptReconnect();
          }
        }, 5000);
      }
    }, delay);
  }

  public destroy() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.pingCheckInterval) {
      clearInterval(this.pingCheckInterval);
    }

    if (this.visibilityChangeHandler) {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
    }

    this.socket.off('disconnect');
    this.socket.off('connect');
    this.socket.off('connect_error');
    this.socket.off('ping');
  }

  public forceReconnect() {
    console.log('🔄 Forcing reconnection...');
    this.socket.disconnect();
    this.startReconnection();
  }
}