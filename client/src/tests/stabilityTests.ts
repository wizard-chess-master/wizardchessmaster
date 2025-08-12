/**
 * Stability Tests
 * Comprehensive tests for application stability under stress conditions
 */

import { logger } from '../lib/utils/clientLogger';

export interface StabilityTestResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  details: string;
  duration: number;
  timestamp: number;
}

class StabilityTester {
  private results: StabilityTestResult[] = [];
  
  /**
   * Test 1: Memory Leak Detection
   * Monitor memory usage over time during intensive operations
   */
  async testMemoryLeaks(): Promise<StabilityTestResult> {
    const startTime = performance.now();
    const test = 'Memory Leak Detection';
    
    try {
      if (!('memory' in performance)) {
        return {
          test,
          status: 'warning',
          details: 'Memory API not available in this browser',
          duration: 0,
          timestamp: Date.now()
        };
      }
      
      const memoryData: any = (performance as any).memory;
      const initialMemory = memoryData.usedJSHeapSize;
      const results: number[] = [];
      
      // Create and destroy objects to test garbage collection
      for (let i = 0; i < 5; i++) {
        // Allocate memory
        const largeArray = new Array(100000).fill(Math.random());
        const largeObject = {
          data: largeArray,
          nested: JSON.parse(JSON.stringify(largeArray))
        };
        
        // Force some operations
        largeObject.data.sort();
        
        // Wait for potential GC
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Record memory usage
        results.push(memoryData.usedJSHeapSize);
      }
      
      // Check if memory is growing linearly (potential leak)
      const memoryGrowth = results[results.length - 1] - initialMemory;
      const growthRate = memoryGrowth / initialMemory;
      
      if (growthRate > 0.5) {
        return {
          test,
          status: 'warning',
          details: `Memory grew by ${(growthRate * 100).toFixed(1)}% during test`,
          duration: performance.now() - startTime,
          timestamp: Date.now()
        };
      }
      
      return {
        test,
        status: 'pass',
        details: `Memory usage stable (${(growthRate * 100).toFixed(1)}% change)`,
        duration: performance.now() - startTime,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        test,
        status: 'fail',
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: performance.now() - startTime,
        timestamp: Date.now()
      };
    }
  }
  
  /**
   * Test 2: Concurrent API Requests
   * Test handling of multiple simultaneous API calls
   */
  async testConcurrentRequests(): Promise<StabilityTestResult> {
    const startTime = performance.now();
    const test = 'Concurrent API Requests';
    
    try {
      const endpoints = [
        '/api/health',
        '/api/auth/session',
        '/api/health/db',
        '/api/payments/config'
      ];
      
      const concurrentCount = 10;
      const requests = [];
      
      // Launch concurrent requests
      for (let i = 0; i < concurrentCount; i++) {
        for (const endpoint of endpoints) {
          requests.push(
            fetch(endpoint)
              .then(res => ({
                endpoint,
                status: res.status,
                ok: res.ok
              }))
              .catch(error => ({
                endpoint,
                status: 0,
                ok: false,
                error: error.message
              }))
          );
        }
      }
      
      const results = await Promise.all(requests);
      const failures = results.filter(r => !r.ok);
      const successRate = ((results.length - failures.length) / results.length) * 100;
      
      if (failures.length > 0) {
        return {
          test,
          status: successRate > 90 ? 'warning' : 'fail',
          details: `${successRate.toFixed(1)}% success rate (${failures.length}/${results.length} failed)`,
          duration: performance.now() - startTime,
          timestamp: Date.now()
        };
      }
      
      return {
        test,
        status: 'pass',
        details: `All ${results.length} concurrent requests succeeded`,
        duration: performance.now() - startTime,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        test,
        status: 'fail',
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: performance.now() - startTime,
        timestamp: Date.now()
      };
    }
  }
  
  /**
   * Test 3: WebSocket Stability
   * Test WebSocket connection resilience
   */
  async testWebSocketStability(): Promise<StabilityTestResult> {
    const startTime = performance.now();
    const test = 'WebSocket Stability';
    
    try {
      return new Promise((resolve) => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const ws = new WebSocket(`${protocol}//${window.location.host}/socket.io/?transport=websocket`);
        
        let connected = false;
        let reconnectCount = 0;
        
        const timeout = setTimeout(() => {
          ws.close();
          resolve({
            test,
            status: connected ? 'warning' : 'fail',
            details: connected ? 
              'Connection established but slow' : 
              'Failed to establish WebSocket connection',
            duration: performance.now() - startTime,
            timestamp: Date.now()
          });
        }, 5000);
        
        ws.onopen = () => {
          connected = true;
          clearTimeout(timeout);
          
          // Test ping-pong
          ws.send('ping');
          
          setTimeout(() => {
            ws.close();
            resolve({
              test,
              status: 'pass',
              details: 'WebSocket connection stable',
              duration: performance.now() - startTime,
              timestamp: Date.now()
            });
          }, 1000);
        };
        
        ws.onerror = (error) => {
          clearTimeout(timeout);
          ws.close();
          resolve({
            test,
            status: 'fail',
            details: 'WebSocket connection error',
            duration: performance.now() - startTime,
            timestamp: Date.now()
          });
        };
      });
    } catch (error) {
      return {
        test,
        status: 'fail',
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: performance.now() - startTime,
        timestamp: Date.now()
      };
    }
  }
  
  /**
   * Test 4: Error Recovery
   * Test application's ability to recover from errors
   */
  async testErrorRecovery(): Promise<StabilityTestResult> {
    const startTime = performance.now();
    const test = 'Error Recovery';
    
    try {
      const errors: string[] = [];
      let recovered = true;
      
      // Test API error recovery
      try {
        const response = await fetch('/api/nonexistent');
        if (response.status !== 404) {
          errors.push('Unexpected response for non-existent endpoint');
        }
      } catch (error) {
        errors.push('Failed to handle 404 gracefully');
        recovered = false;
      }
      
      // Test malformed request recovery
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: 'invalid json'
        });
        // Should get 400 or similar error
        if (response.status < 400 || response.status >= 500) {
          errors.push('Invalid error code for malformed request');
        }
      } catch (error) {
        errors.push('Failed to handle malformed request');
        recovered = false;
      }
      
      // Test timeout recovery (simulated)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 100);
        
        await fetch('/api/health', { signal: controller.signal });
        clearTimeout(timeoutId);
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          errors.push('Failed to handle timeout properly');
          recovered = false;
        }
      }
      
      if (!recovered) {
        return {
          test,
          status: 'fail',
          details: `Recovery failed: ${errors.join(', ')}`,
          duration: performance.now() - startTime,
          timestamp: Date.now()
        };
      }
      
      if (errors.length > 0) {
        return {
          test,
          status: 'warning',
          details: `Minor issues: ${errors.join(', ')}`,
          duration: performance.now() - startTime,
          timestamp: Date.now()
        };
      }
      
      return {
        test,
        status: 'pass',
        details: 'Application recovers gracefully from errors',
        duration: performance.now() - startTime,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        test,
        status: 'fail',
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: performance.now() - startTime,
        timestamp: Date.now()
      };
    }
  }
  
  /**
   * Test 5: DOM Manipulation Performance
   * Test heavy DOM operations
   */
  async testDOMPerformance(): Promise<StabilityTestResult> {
    const startTime = performance.now();
    const test = 'DOM Performance';
    
    try {
      const container = document.createElement('div');
      container.style.display = 'none';
      document.body.appendChild(container);
      
      const operations = 1000;
      const startOp = performance.now();
      
      // Add elements
      for (let i = 0; i < operations; i++) {
        const element = document.createElement('div');
        element.className = 'test-element';
        element.textContent = `Element ${i}`;
        container.appendChild(element);
      }
      
      // Modify elements
      const elements = container.querySelectorAll('.test-element');
      elements.forEach((el, index) => {
        (el as HTMLElement).style.color = index % 2 === 0 ? 'red' : 'blue';
      });
      
      // Remove elements
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      
      document.body.removeChild(container);
      
      const operationTime = performance.now() - startOp;
      
      if (operationTime > 500) {
        return {
          test,
          status: 'warning',
          details: `DOM operations took ${operationTime.toFixed(0)}ms (target < 500ms)`,
          duration: performance.now() - startTime,
          timestamp: Date.now()
        };
      }
      
      return {
        test,
        status: 'pass',
        details: `DOM operations completed in ${operationTime.toFixed(0)}ms`,
        duration: performance.now() - startTime,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        test,
        status: 'fail',
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: performance.now() - startTime,
        timestamp: Date.now()
      };
    }
  }
  
  /**
   * Test 6: Local Storage Limits
   * Test storage capacity and performance
   */
  async testStorageLimits(): Promise<StabilityTestResult> {
    const startTime = performance.now();
    const test = 'Storage Limits';
    
    try {
      const testKey = 'stability-test-storage';
      const chunkSize = 10000; // 10KB chunks
      let totalStored = 0;
      const maxChunks = 100; // Max 1MB test
      
      // Test write performance
      const writeStart = performance.now();
      for (let i = 0; i < maxChunks; i++) {
        try {
          const data = new Array(chunkSize).fill('x').join('');
          localStorage.setItem(`${testKey}-${i}`, data);
          totalStored += chunkSize;
        } catch (e) {
          // Quota exceeded is expected at some point
          break;
        }
      }
      const writeTime = performance.now() - writeStart;
      
      // Test read performance
      const readStart = performance.now();
      for (let i = 0; i < maxChunks; i++) {
        const data = localStorage.getItem(`${testKey}-${i}`);
        if (!data) break;
      }
      const readTime = performance.now() - readStart;
      
      // Cleanup
      for (let i = 0; i < maxChunks; i++) {
        localStorage.removeItem(`${testKey}-${i}`);
      }
      
      const totalMB = (totalStored / 1024 / 1024).toFixed(2);
      
      if (writeTime > 1000 || readTime > 500) {
        return {
          test,
          status: 'warning',
          details: `Storage slow: ${totalMB}MB, write ${writeTime.toFixed(0)}ms, read ${readTime.toFixed(0)}ms`,
          duration: performance.now() - startTime,
          timestamp: Date.now()
        };
      }
      
      return {
        test,
        status: 'pass',
        details: `Storage performant: ${totalMB}MB capacity, write ${writeTime.toFixed(0)}ms, read ${readTime.toFixed(0)}ms`,
        duration: performance.now() - startTime,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        test,
        status: 'fail',
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: performance.now() - startTime,
        timestamp: Date.now()
      };
    }
  }
  
  /**
   * Run all stability tests
   */
  async runAllTests(onProgress?: (test: string) => void): Promise<StabilityTestResult[]> {
    this.results = [];
    
    const tests = [
      { name: 'Memory Leaks', fn: () => this.testMemoryLeaks() },
      { name: 'Concurrent Requests', fn: () => this.testConcurrentRequests() },
      { name: 'WebSocket Stability', fn: () => this.testWebSocketStability() },
      { name: 'Error Recovery', fn: () => this.testErrorRecovery() },
      { name: 'DOM Performance', fn: () => this.testDOMPerformance() },
      { name: 'Storage Limits', fn: () => this.testStorageLimits() }
    ];
    
    for (const test of tests) {
      if (onProgress) {
        onProgress(test.name);
      }
      
      const result = await test.fn();
      this.results.push(result);
      
      logger.info('Stability', `Test completed: ${test.name}`, {
        status: result.status,
        duration: result.duration
      });
    }
    
    return this.results;
  }
  
  /**
   * Generate test report
   */
  generateReport(): string {
    const passed = this.results.filter(r => r.status === 'pass').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    
    let report = '# Stability Test Report\n\n';
    report += `**Summary**: ${passed} passed, ${warnings} warnings, ${failed} failed\n\n`;
    
    report += '## Test Results\n\n';
    for (const result of this.results) {
      const icon = result.status === 'pass' ? '✅' : 
                    result.status === 'warning' ? '⚠️' : '❌';
      report += `### ${icon} ${result.test}\n`;
      report += `- **Status**: ${result.status}\n`;
      report += `- **Details**: ${result.details}\n`;
      report += `- **Duration**: ${result.duration.toFixed(2)}ms\n`;
      report += `- **Timestamp**: ${new Date(result.timestamp).toISOString()}\n\n`;
    }
    
    return report;
  }
}

export const stabilityTester = new StabilityTester();