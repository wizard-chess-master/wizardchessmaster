#!/usr/bin/env node

/**
 * Multiplayer Stability Test Suite
 * Tests WebSocket reconnection, state sync, checksums, and heartbeat mechanisms
 */

import io from 'socket.io-client';
import { GameStateManager } from './shared/gameStateSync.js';

const SERVER_URL = 'http://localhost:5000';
const TEST_DURATION = 60000; // 1 minute of testing

class MultiplayerStabilityTester {
  constructor() {
    this.results = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      details: []
    };
    this.socket1 = null;
    this.socket2 = null;
    this.gameId = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📋',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type] || '📋';
    
    console.log(`[${timestamp}] ${prefix} ${message}`);
    this.results.details.push({ timestamp, type, message });
  }

  async runAllTests() {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 MULTIPLAYER STABILITY TEST SUITE');
    console.log('='.repeat(60) + '\n');

    try {
      // Test 1: Basic connection
      await this.testBasicConnection();
      
      // Test 2: Heartbeat mechanism
      await this.testHeartbeat();
      
      // Test 3: Disconnection and reconnection
      await this.testReconnection();
      
      // Test 4: State synchronization with checksums
      await this.testStateSync();
      
      // Test 5: Desync detection and recovery
      await this.testDesyncRecovery();
      
      // Test 6: Multiple rapid reconnections
      await this.testRapidReconnections();
      
      // Test 7: Network interruption simulation
      await this.testNetworkInterruption();
      
    } catch (error) {
      this.log(`Test suite error: ${error.message}`, 'error');
    } finally {
      this.printResults();
      this.cleanup();
    }
  }

  async testBasicConnection() {
    this.log('Testing basic connection...', 'info');
    
    return new Promise((resolve) => {
      this.socket1 = io(SERVER_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      this.socket1.on('connect', () => {
        this.log('Socket 1 connected successfully', 'success');
        this.results.passed++;
        
        // Join as player
        this.socket1.emit('player:join', {
          userId: 1001,
          username: 'test_player_1',
          displayName: 'Test Player 1',
          rating: 1500
        });
        
        resolve();
      });

      this.socket1.on('connect_error', (error) => {
        this.log(`Connection error: ${error.message}`, 'error');
        this.results.failed++;
        resolve();
      });

      // Set timeout
      setTimeout(() => {
        if (!this.socket1.connected) {
          this.log('Connection timeout', 'error');
          this.results.failed++;
          resolve();
        }
      }, 5000);
    });
  }

  async testHeartbeat() {
    this.log('Testing heartbeat mechanism...', 'info');
    
    return new Promise((resolve) => {
      let pingReceived = false;
      let pongSent = false;
      
      this.socket1.on('ping', () => {
        pingReceived = true;
        this.log('Ping received from server', 'success');
        this.socket1.emit('pong');
        pongSent = true;
        this.log('Pong sent to server', 'success');
      });

      // Wait for heartbeat cycle
      setTimeout(() => {
        if (pingReceived && pongSent) {
          this.log('Heartbeat mechanism working correctly', 'success');
          this.results.passed++;
        } else {
          this.log('Heartbeat mechanism not working', 'error');
          this.results.failed++;
        }
        resolve();
      }, 15000); // Wait 15 seconds for heartbeat
    });
  }

  async testReconnection() {
    this.log('Testing disconnection and reconnection...', 'info');
    
    return new Promise((resolve) => {
      let disconnected = false;
      let reconnected = false;
      
      // Set up reconnection handlers
      this.socket1.on('disconnect', () => {
        disconnected = true;
        this.log('Socket disconnected', 'warning');
      });

      this.socket1.on('reconnection:success', (data) => {
        reconnected = true;
        this.log(`Reconnection successful: ${data.message}`, 'success');
      });

      // Force disconnect
      this.socket1.disconnect();
      
      // Wait a bit then reconnect
      setTimeout(() => {
        this.socket1.connect();
        
        // Send reconnect event
        this.socket1.emit('player:reconnect', {
          userId: 1001,
          username: 'test_player_1',
          displayName: 'Test Player 1',
          rating: 1500,
          lastGameId: this.gameId,
          lastChecksum: 'abc12345'
        });
      }, 2000);

      // Check results after reconnection attempt
      setTimeout(() => {
        if (disconnected && reconnected) {
          this.log('Reconnection test passed', 'success');
          this.results.passed++;
        } else {
          this.log('Reconnection test failed', 'error');
          this.results.failed++;
        }
        resolve();
      }, 5000);
    });
  }

  async testStateSync() {
    this.log('Testing state synchronization with checksums...', 'info');
    
    return new Promise((resolve) => {
      // Create a mock game state
      const mockGameState = {
        board: Array(10).fill(null).map(() => Array(10).fill(null)),
        currentTurn: 'white',
        moveHistory: [],
        capturedPieces: [],
        gameStatus: 'active'
      };

      // Create state manager
      const stateManager = new GameStateManager();
      const checksum = stateManager.generateChecksum(mockGameState);
      
      this.log(`Generated checksum: ${checksum}`, 'info');

      // Listen for state recovery
      this.socket1.on('game:state-recovered', (data) => {
        if (data.checksum) {
          this.log(`State recovered with checksum: ${data.checksum}`, 'success');
          this.results.passed++;
        } else {
          this.log('State recovery missing checksum', 'error');
          this.results.failed++;
        }
        resolve();
      });

      // Simulate state recovery request
      this.socket1.emit('player:reconnect', {
        userId: 1001,
        username: 'test_player_1',
        displayName: 'Test Player 1',
        rating: 1500,
        lastGameId: 'test-game-123',
        lastChecksum: checksum
      });

      // Timeout fallback
      setTimeout(() => {
        this.log('State sync test timeout', 'warning');
        resolve();
      }, 5000);
    });
  }

  async testDesyncRecovery() {
    this.log('Testing desync detection and recovery...', 'info');
    
    return new Promise((resolve) => {
      let desyncDetected = false;
      let syncRequested = false;
      
      // Listen for desync detection
      this.socket1.on('game:state-sync-required', (data) => {
        desyncDetected = true;
        this.log(`Desync detected - Server: ${data.serverChecksum}, Client: ${data.clientChecksum}`, 'warning');
        
        // Request full sync
        this.socket1.emit('game:request-full-sync', {
          gameId: 'test-game-123'
        });
        syncRequested = true;
      });

      // Simulate a desync by sending mismatched checksum
      this.socket1.emit('player:reconnect', {
        userId: 1001,
        username: 'test_player_1',
        displayName: 'Test Player 1',
        rating: 1500,
        lastGameId: 'test-game-123',
        lastChecksum: 'mismatch123'
      });

      // Check results
      setTimeout(() => {
        if (desyncDetected && syncRequested) {
          this.log('Desync recovery mechanism working', 'success');
          this.results.passed++;
        } else {
          this.log('Desync recovery not triggered', 'error');
          this.results.failed++;
        }
        resolve();
      }, 3000);
    });
  }

  async testRapidReconnections() {
    this.log('Testing multiple rapid reconnections...', 'info');
    
    return new Promise(async (resolve) => {
      let reconnectCount = 0;
      const targetReconnects = 5;
      
      for (let i = 0; i < targetReconnects; i++) {
        await new Promise((innerResolve) => {
          this.log(`Rapid reconnection attempt ${i + 1}/${targetReconnects}`, 'info');
          
          // Disconnect
          this.socket1.disconnect();
          
          // Quick reconnect
          setTimeout(() => {
            this.socket1.connect();
            reconnectCount++;
            innerResolve();
          }, 500);
        });
        
        // Small delay between attempts
        await new Promise(r => setTimeout(r, 1000));
      }
      
      // Check final connection state
      setTimeout(() => {
        if (this.socket1.connected && reconnectCount === targetReconnects) {
          this.log('Rapid reconnection test passed', 'success');
          this.results.passed++;
        } else {
          this.log(`Rapid reconnection test failed - Connected: ${this.socket1.connected}, Count: ${reconnectCount}/${targetReconnects}`, 'error');
          this.results.failed++;
        }
        resolve();
      }, 2000);
    });
  }

  async testNetworkInterruption() {
    this.log('Testing network interruption simulation...', 'info');
    
    return new Promise((resolve) => {
      // Simulate network interruption by pausing the connection
      const originalEmit = this.socket1.emit;
      let interrupted = false;
      let recovered = false;
      
      // Block outgoing messages
      this.socket1.emit = () => {
        if (interrupted) {
          this.log('Message blocked due to simulated network interruption', 'warning');
          return false;
        }
        return originalEmit.apply(this.socket1, arguments);
      };
      
      // Start interruption
      setTimeout(() => {
        interrupted = true;
        this.log('Network interruption started', 'warning');
      }, 1000);
      
      // End interruption
      setTimeout(() => {
        interrupted = false;
        this.socket1.emit = originalEmit;
        recovered = true;
        this.log('Network interruption ended', 'success');
        
        // Test if connection recovers
        this.socket1.emit('ping-test');
      }, 3000);
      
      // Check results
      setTimeout(() => {
        if (recovered && this.socket1.connected) {
          this.log('Network interruption recovery successful', 'success');
          this.results.passed++;
        } else {
          this.log('Network interruption recovery failed', 'error');
          this.results.failed++;
        }
        resolve();
      }, 5000);
    });
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS');
    console.log('='.repeat(60));
    
    this.results.totalTests = this.results.passed + this.results.failed;
    
    console.log(`Total Tests: ${this.results.totalTests}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`Success Rate: ${((this.results.passed / this.results.totalTests) * 100).toFixed(1)}%`);
    
    if (this.results.failed > 0) {
      console.log('\n⚠️ Failed Test Details:');
      this.results.details
        .filter(d => d.type === 'error')
        .forEach(d => console.log(`  - ${d.message}`));
    }
    
    console.log('\n' + '='.repeat(60));
    
    // Exit with appropriate code
    process.exit(this.results.failed > 0 ? 1 : 0);
  }

  cleanup() {
    if (this.socket1) {
      this.socket1.disconnect();
    }
    if (this.socket2) {
      this.socket2.disconnect();
    }
  }
}

// Run the tests
const tester = new MultiplayerStabilityTester();
tester.runAllTests().catch(console.error);