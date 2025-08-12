/**
 * Stability Testing Utilities
 * Automated testing for application stability and resilience
 */

import { performanceProfiler } from './performanceProfiler';
import { memoryLeakDetector } from './memoryLeakDetector';

// Simple logger for stability tester
const logger = {
  debug: (message: string, ...args: any[]) => console.log(message, ...args),
  info: (message: string, ...args: any[]) => console.log(message, ...args),
  warn: (message: string, ...args: any[]) => console.warn(message, ...args),
  error: (message: string, ...args: any[]) => console.error(message, ...args)
};

interface StabilityTestResult {
  testName: string;
  passed: boolean;
  duration: number;
  errors: string[];
  warnings: string[];
  metrics?: Record<string, any>;
}

interface StressTest {
  name: string;
  iterations: number;
  delayMs: number;
  action: () => Promise<void>;
}

export class StabilityTester {
  private testResults: StabilityTestResult[] = [];
  private isRunning = false;
  private abortController: AbortController | null = null;

  /**
   * Run all stability tests
   */
  async runAllTests(): Promise<StabilityTestResult[]> {
    if (this.isRunning) {
      console.warn('Stability tests already running');
      return [];
    }

    this.isRunning = true;
    this.testResults = [];
    this.abortController = new AbortController();

    console.log('🔬 Starting stability tests...');

    try {
      // Memory stability test
      await this.testMemoryStability();

      // Event listener leak test
      await this.testEventListenerLeaks();

      // DOM manipulation stress test
      await this.testDOMStress();

      // Network resilience test
      await this.testNetworkResilience();

      // State management test
      await this.testStateManagement();

      // Error recovery test
      await this.testErrorRecovery();

      // Performance degradation test
      await this.testPerformanceDegradation();

      // Concurrent operations test
      await this.testConcurrentOperations();

      console.log('✅ Stability tests completed');
      return this.testResults;
    } catch (error) {
      console.error('❌ Stability tests failed:', error);
      throw error;
    } finally {
      this.isRunning = false;
      this.abortController = null;
    }
  }

  /**
   * Test memory stability
   */
  private async testMemoryStability(): Promise<void> {
    const testName = 'Memory Stability';
    const startTime = performance.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      console.log('Testing memory stability...');
      
      // Get initial memory snapshot
      const initialMemory = memoryLeakDetector.getMemoryStatus();
      
      // Create and destroy large objects
      for (let i = 0; i < 100; i++) {
        if (this.abortController?.signal.aborted) break;
        
        // Create large array
        const largeArray = new Array(10000).fill({ data: 'test'.repeat(100) });
        
        // Process it
        const processed = largeArray.map(item => ({ ...item, index: i }));
        
        // Clear references
        largeArray.length = 0;
        processed.length = 0;
        
        // Small delay
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // Force garbage collection if available
      memoryLeakDetector.forceGarbageCollection();
      
      // Wait for memory to stabilize
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get final memory snapshot
      const finalMemory = memoryLeakDetector.getMemoryStatus();
      
      // Check for memory growth
      if (initialMemory && finalMemory) {
        const growth = finalMemory.current - initialMemory.current;
        const growthPercent = (growth / initialMemory.current) * 100;
        
        if (growthPercent > 50) {
          errors.push(`Excessive memory growth: ${growthPercent.toFixed(2)}%`);
        } else if (growthPercent > 20) {
          warnings.push(`Moderate memory growth: ${growthPercent.toFixed(2)}%`);
        }
      }

      this.recordTestResult({
        testName,
        passed: errors.length === 0,
        duration: performance.now() - startTime,
        errors,
        warnings,
        metrics: {
          initialMemory: initialMemory?.current,
          finalMemory: finalMemory?.current
        }
      });
    } catch (error) {
      this.recordTestResult({
        testName,
        passed: false,
        duration: performance.now() - startTime,
        errors: [error instanceof Error ? error.message : String(error)],
        warnings
      });
    }
  }

  /**
   * Test for event listener leaks
   */
  private async testEventListenerLeaks(): Promise<void> {
    const testName = 'Event Listener Leaks';
    const startTime = performance.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      console.log('Testing event listener leaks...');
      
      const testElement = document.createElement('div');
      document.body.appendChild(testElement);
      
      const listeners: Array<() => void> = [];
      
      // Add many listeners
      for (let i = 0; i < 1000; i++) {
        const listener = () => console.log(`Listener ${i}`);
        listeners.push(listener);
        testElement.addEventListener('click', listener);
      }

      // Remove half of them
      for (let i = 0; i < 500; i++) {
        testElement.removeEventListener('click', listeners[i]);
      }

      // Clean up
      document.body.removeChild(testElement);
      
      // Check if listeners were properly removed
      // This is a simplified check - in reality, we'd need more sophisticated detection
      const remainingListeners = listeners.length - 500;
      if (remainingListeners > 0) {
        warnings.push(`${remainingListeners} listeners may not have been removed`);
      }

      this.recordTestResult({
        testName,
        passed: errors.length === 0,
        duration: performance.now() - startTime,
        errors,
        warnings
      });
    } catch (error) {
      this.recordTestResult({
        testName,
        passed: false,
        duration: performance.now() - startTime,
        errors: [error instanceof Error ? error.message : String(error)],
        warnings
      });
    }
  }

  /**
   * Test DOM manipulation under stress
   */
  private async testDOMStress(): Promise<void> {
    const testName = 'DOM Stress';
    const startTime = performance.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      console.log('Testing DOM stress...');
      
      const container = document.createElement('div');
      container.style.display = 'none';
      document.body.appendChild(container);

      // Rapid DOM manipulation
      for (let i = 0; i < 500; i++) {
        if (this.abortController?.signal.aborted) break;
        
        // Add elements
        const element = document.createElement('div');
        element.textContent = `Element ${i}`;
        element.className = `test-element-${i}`;
        container.appendChild(element);
        
        // Modify elements
        element.style.color = `rgb(${i % 255}, ${(i * 2) % 255}, ${(i * 3) % 255})`;
        element.setAttribute('data-index', String(i));
        
        // Remove every 10th element
        if (i % 10 === 0 && container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }

      // Clean up
      document.body.removeChild(container);

      // Check for performance impact
      const renderTime = performance.now() - startTime;
      if (renderTime > 5000) {
        errors.push(`DOM operations took too long: ${renderTime.toFixed(2)}ms`);
      } else if (renderTime > 2000) {
        warnings.push(`DOM operations slow: ${renderTime.toFixed(2)}ms`);
      }

      this.recordTestResult({
        testName,
        passed: errors.length === 0,
        duration: renderTime,
        errors,
        warnings,
        metrics: {
          elementsCreated: 500,
          renderTime
        }
      });
    } catch (error) {
      this.recordTestResult({
        testName,
        passed: false,
        duration: performance.now() - startTime,
        errors: [error instanceof Error ? error.message : String(error)],
        warnings
      });
    }
  }

  /**
   * Test network resilience
   */
  private async testNetworkResilience(): Promise<void> {
    const testName = 'Network Resilience';
    const startTime = performance.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      console.log('Testing network resilience...');
      
      const endpoints = [
        '/api/auth/session',
        '/api/payments/config',
        '/api/leaderboard'
      ];

      const results = await Promise.allSettled(
        endpoints.map(async endpoint => {
          const response = await fetch(endpoint, {
            signal: AbortSignal.timeout(5000)
          });
          return { endpoint, status: response.status };
        })
      );

      // Check results
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          warnings.push(`${endpoints[index]} failed: ${result.reason}`);
        } else if (result.value.status >= 500) {
          errors.push(`${result.value.endpoint} returned ${result.value.status}`);
        } else if (result.value.status >= 400) {
          warnings.push(`${result.value.endpoint} returned ${result.value.status}`);
        }
      });

      this.recordTestResult({
        testName,
        passed: errors.length === 0,
        duration: performance.now() - startTime,
        errors,
        warnings,
        metrics: {
          endpointsTested: endpoints.length,
          successfulRequests: results.filter(r => r.status === 'fulfilled').length
        }
      });
    } catch (error) {
      this.recordTestResult({
        testName,
        passed: false,
        duration: performance.now() - startTime,
        errors: [error instanceof Error ? error.message : String(error)],
        warnings
      });
    }
  }

  /**
   * Test state management stability
   */
  private async testStateManagement(): Promise<void> {
    const testName = 'State Management';
    const startTime = performance.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      console.log('Testing state management...');
      
      // Simulate rapid state changes
      const stateChanges: any[] = [];
      
      for (let i = 0; i < 1000; i++) {
        if (this.abortController?.signal.aborted) break;
        
        stateChanges.push({
          id: i,
          timestamp: Date.now(),
          data: { value: Math.random() }
        });
        
        // Simulate state update delay
        if (i % 100 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1));
        }
      }

      // Check for state consistency
      const uniqueIds = new Set(stateChanges.map(s => s.id));
      if (uniqueIds.size !== stateChanges.length) {
        errors.push('State consistency issue: duplicate IDs found');
      }

      this.recordTestResult({
        testName,
        passed: errors.length === 0,
        duration: performance.now() - startTime,
        errors,
        warnings,
        metrics: {
          stateChanges: stateChanges.length
        }
      });
    } catch (error) {
      this.recordTestResult({
        testName,
        passed: false,
        duration: performance.now() - startTime,
        errors: [error instanceof Error ? error.message : String(error)],
        warnings
      });
    }
  }

  /**
   * Test error recovery
   */
  private async testErrorRecovery(): Promise<void> {
    const testName = 'Error Recovery';
    const startTime = performance.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      console.log('Testing error recovery...');
      
      let recoveredCount = 0;
      
      // Test various error scenarios
      const errorScenarios = [
        () => { throw new Error('Test error 1'); },
        () => { throw new TypeError('Test type error'); },
        () => { JSON.parse('invalid json'); },
        () => { (null as any).toString(); },
        () => { (undefined as any).property; }
      ];

      for (const scenario of errorScenarios) {
        try {
          scenario();
        } catch (error) {
          // Simulate error recovery
          recoveredCount++;
          logger.debug(`Recovered from: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      if (recoveredCount !== errorScenarios.length) {
        errors.push(`Failed to recover from ${errorScenarios.length - recoveredCount} errors`);
      }

      this.recordTestResult({
        testName,
        passed: errors.length === 0,
        duration: performance.now() - startTime,
        errors,
        warnings,
        metrics: {
          errorsThrown: errorScenarios.length,
          errorsRecovered: recoveredCount
        }
      });
    } catch (error) {
      this.recordTestResult({
        testName,
        passed: false,
        duration: performance.now() - startTime,
        errors: [error instanceof Error ? error.message : String(error)],
        warnings
      });
    }
  }

  /**
   * Test performance degradation over time
   */
  private async testPerformanceDegradation(): Promise<void> {
    const testName = 'Performance Degradation';
    const startTime = performance.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      console.log('Testing performance degradation...');
      
      const operationTimes: number[] = [];
      
      // Run same operation multiple times
      for (let i = 0; i < 100; i++) {
        if (this.abortController?.signal.aborted) break;
        
        const opStart = performance.now();
        
        // Simulate complex operation
        const data = new Array(1000).fill(0).map((_, idx) => ({
          id: idx,
          value: Math.random(),
          nested: { data: 'test'.repeat(10) }
        }));
        
        // Process data
        const processed = data
          .filter(item => item.value > 0.5)
          .map(item => ({ ...item, processed: true }))
          .sort((a, b) => a.value - b.value);
        
        operationTimes.push(performance.now() - opStart);
        
        // Small delay between operations
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // Check for degradation
      const firstHalf = operationTimes.slice(0, 50);
      const secondHalf = operationTimes.slice(50);
      
      const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      const degradation = ((avgSecond - avgFirst) / avgFirst) * 100;
      
      if (degradation > 50) {
        errors.push(`Severe performance degradation: ${degradation.toFixed(2)}%`);
      } else if (degradation > 20) {
        warnings.push(`Performance degradation detected: ${degradation.toFixed(2)}%`);
      }

      this.recordTestResult({
        testName,
        passed: errors.length === 0,
        duration: performance.now() - startTime,
        errors,
        warnings,
        metrics: {
          avgFirstHalf: avgFirst,
          avgSecondHalf: avgSecond,
          degradation
        }
      });
    } catch (error) {
      this.recordTestResult({
        testName,
        passed: false,
        duration: performance.now() - startTime,
        errors: [error instanceof Error ? error.message : String(error)],
        warnings
      });
    }
  }

  /**
   * Test concurrent operations
   */
  private async testConcurrentOperations(): Promise<void> {
    const testName = 'Concurrent Operations';
    const startTime = performance.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      console.log('Testing concurrent operations...');
      
      const operations = Array.from({ length: 50 }, (_, i) => async () => {
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
        return i;
      });

      // Run all operations concurrently
      const results = await Promise.allSettled(operations.map(op => op()));
      
      const failures = results.filter(r => r.status === 'rejected');
      if (failures.length > 0) {
        errors.push(`${failures.length} concurrent operations failed`);
      }

      // Check if all results are in order
      const values = results
        .filter(r => r.status === 'fulfilled')
        .map(r => (r as PromiseFulfilledResult<number>).value);
      
      const isOrdered = values.every((v, i) => v === i);
      if (!isOrdered) {
        warnings.push('Concurrent operations may have race conditions');
      }

      this.recordTestResult({
        testName,
        passed: errors.length === 0,
        duration: performance.now() - startTime,
        errors,
        warnings,
        metrics: {
          totalOperations: operations.length,
          successfulOperations: results.filter(r => r.status === 'fulfilled').length
        }
      });
    } catch (error) {
      this.recordTestResult({
        testName,
        passed: false,
        duration: performance.now() - startTime,
        errors: [error.message],
        warnings
      });
    }
  }

  /**
   * Record test result
   */
  private recordTestResult(result: StabilityTestResult): void {
    this.testResults.push(result);
    
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.testName}: ${result.passed ? 'PASSED' : 'FAILED'} (${result.duration.toFixed(2)}ms)`);
    
    if (result.errors.length > 0) {
      console.error(`  Errors:`, result.errors);
    }
    if (result.warnings.length > 0) {
      console.warn(`  Warnings:`, result.warnings);
    }
    if (result.metrics) {
      console.log(`  Metrics:`, result.metrics);
    }
  }

  /**
   * Abort running tests
   */
  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
      console.log('🛑 Stability tests aborted');
    }
  }

  /**
   * Get test results
   */
  getResults(): StabilityTestResult[] {
    return this.testResults;
  }

  /**
   * Generate test report
   */
  generateReport(): string {
    const passed = this.testResults.filter(r => r.passed).length;
    const failed = this.testResults.filter(r => !r.passed).length;
    const totalDuration = this.testResults.reduce((sum, r) => sum + r.duration, 0);

    let report = `
=== Stability Test Report ===
Date: ${new Date().toISOString()}
Total Tests: ${this.testResults.length}
Passed: ${passed}
Failed: ${failed}
Total Duration: ${totalDuration.toFixed(2)}ms

Test Results:
`;

    this.testResults.forEach(result => {
      report += `
${result.testName}:
  Status: ${result.passed ? 'PASSED' : 'FAILED'}
  Duration: ${result.duration.toFixed(2)}ms
  Errors: ${result.errors.length > 0 ? result.errors.join(', ') : 'None'}
  Warnings: ${result.warnings.length > 0 ? result.warnings.join(', ') : 'None'}
`;
      if (result.metrics) {
        report += `  Metrics: ${JSON.stringify(result.metrics, null, 2)}\n`;
      }
    });

    return report;
  }

  /**
   * Run stress test
   */
  async runStressTest(config: StressTest): Promise<void> {
    console.log(`🔥 Running stress test: ${config.name}`);
    
    const startTime = performance.now();
    const errors: string[] = [];
    
    for (let i = 0; i < config.iterations; i++) {
      if (this.abortController?.signal.aborted) break;
      
      try {
        await config.action();
        
        if (config.delayMs > 0) {
          await new Promise(resolve => setTimeout(resolve, config.delayMs));
        }
      } catch (error) {
        errors.push(`Iteration ${i}: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      // Log progress every 10%
      if (i % Math.floor(config.iterations / 10) === 0) {
        console.log(`  Progress: ${((i / config.iterations) * 100).toFixed(0)}%`);
      }
    }
    
    const duration = performance.now() - startTime;
    console.log(`✅ Stress test completed in ${duration.toFixed(2)}ms`);
    
    if (errors.length > 0) {
      console.error(`  ${errors.length} errors occurred`);
    }
  }
}

// Singleton instance
export const stabilityTester = new StabilityTester();

// Development helpers
if (process.env.NODE_ENV === 'development') {
  (window as any).stabilityTester = stabilityTester;
  console.log('💡 Stability Tester available as window.stabilityTester');
  console.log('Commands: runAllTests(), runStressTest(config), generateReport()');
}

export default stabilityTester;