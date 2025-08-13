/**
 * Load Testing for AI System
 * Simulating 100 concurrent games to test stability
 */

import { SelfPlayManager } from '../selfPlayTraining';
import { deepNN } from '../deepNeuralNetwork';
import { performance } from 'perf_hooks';

interface LoadTestMetrics {
  totalGames: number;
  successfulGames: number;
  failedGames: number;
  averageGameTime: number;
  maxGameTime: number;
  minGameTime: number;
  memoryUsage: {
    initial: number;
    peak: number;
    final: number;
  };
  cpuUsage: {
    average: number;
    peak: number;
  };
  errors: string[];
}

export class LoadTester {
  private metrics: LoadTestMetrics;
  private selfPlayManager: SelfPlayManager;

  constructor() {
    this.selfPlayManager = new SelfPlayManager();
    this.metrics = {
      totalGames: 0,
      successfulGames: 0,
      failedGames: 0,
      averageGameTime: 0,
      maxGameTime: 0,
      minGameTime: Infinity,
      memoryUsage: {
        initial: 0,
        peak: 0,
        final: 0
      },
      cpuUsage: {
        average: 0,
        peak: 0
      },
      errors: []
    };
  }

  /**
   * Run load test with concurrent games
   */
  async runLoadTest(numConcurrentGames: number = 100): Promise<LoadTestMetrics> {
    console.log(`🔧 Starting load test with ${numConcurrentGames} concurrent games...`);
    
    // Record initial memory
    this.metrics.memoryUsage.initial = process.memoryUsage().heapUsed / 1024 / 1024;
    
    // Build neural network if not already built
    if (!deepNN.model) {
      deepNN.buildModel();
    }
    
    // Create batches for concurrent execution
    const batchSize = 10;
    const numBatches = Math.ceil(numConcurrentGames / batchSize);
    
    const startTime = performance.now();
    let peakMemory = this.metrics.memoryUsage.initial;
    
    for (let batch = 0; batch < numBatches; batch++) {
      const batchStart = batch * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, numConcurrentGames);
      const batchGames = batchEnd - batchStart;
      
      console.log(`  Running batch ${batch + 1}/${numBatches} (${batchGames} games)...`);
      
      // Run games in parallel within batch
      const gamePromises = [];
      for (let i = 0; i < batchGames; i++) {
        gamePromises.push(this.runSingleGame(batchStart + i));
      }
      
      // Wait for batch to complete
      const results = await Promise.allSettled(gamePromises);
      
      // Process results
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          this.metrics.successfulGames++;
          const gameTime = result.value;
          this.updateGameTimeMetrics(gameTime);
        } else {
          this.metrics.failedGames++;
          this.metrics.errors.push(`Game ${batchStart + index}: ${result.reason}`);
        }
      });
      
      // Check memory usage
      const currentMemory = process.memoryUsage().heapUsed / 1024 / 1024;
      peakMemory = Math.max(peakMemory, currentMemory);
      
      // Small delay between batches to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const endTime = performance.now();
    const totalTime = (endTime - startTime) / 1000; // Convert to seconds
    
    // Record final metrics
    this.metrics.totalGames = numConcurrentGames;
    this.metrics.memoryUsage.peak = peakMemory;
    this.metrics.memoryUsage.final = process.memoryUsage().heapUsed / 1024 / 1024;
    
    // Calculate average game time
    if (this.metrics.successfulGames > 0) {
      this.metrics.averageGameTime = 
        this.metrics.averageGameTime / this.metrics.successfulGames;
    }
    
    // Generate report
    this.generateReport(totalTime);
    
    return this.metrics;
  }

  /**
   * Run a single game and measure time
   */
  private async runSingleGame(gameId: number): Promise<number> {
    const startTime = performance.now();
    
    try {
      await this.selfPlayManager.playSingleGame({
        maxMoves: 50, // Limit moves for load testing
        temperature: 1.0,
        noise: 0.25
      });
      
      const endTime = performance.now();
      return (endTime - startTime) / 1000; // Return time in seconds
      
    } catch (error) {
      throw new Error(`Game ${gameId} failed: ${error}`);
    }
  }

  /**
   * Update game time metrics
   */
  private updateGameTimeMetrics(gameTime: number): void {
    this.metrics.averageGameTime += gameTime;
    this.metrics.maxGameTime = Math.max(this.metrics.maxGameTime, gameTime);
    this.metrics.minGameTime = Math.min(this.metrics.minGameTime, gameTime);
  }

  /**
   * Generate and display load test report
   */
  private generateReport(totalTime: number): void {
    console.log('\n📊 Load Test Report');
    console.log('==================');
    console.log(`Total Games: ${this.metrics.totalGames}`);
    console.log(`Successful: ${this.metrics.successfulGames} (${
      (this.metrics.successfulGames / this.metrics.totalGames * 100).toFixed(1)
    }%)`);
    console.log(`Failed: ${this.metrics.failedGames}`);
    
    console.log('\n⏱️ Performance Metrics');
    console.log(`Total Time: ${totalTime.toFixed(2)}s`);
    console.log(`Average Game Time: ${this.metrics.averageGameTime.toFixed(2)}s`);
    console.log(`Min Game Time: ${this.metrics.minGameTime.toFixed(2)}s`);
    console.log(`Max Game Time: ${this.metrics.maxGameTime.toFixed(2)}s`);
    console.log(`Games per Second: ${(this.metrics.successfulGames / totalTime).toFixed(2)}`);
    
    console.log('\n💾 Memory Usage');
    console.log(`Initial: ${this.metrics.memoryUsage.initial.toFixed(2)} MB`);
    console.log(`Peak: ${this.metrics.memoryUsage.peak.toFixed(2)} MB`);
    console.log(`Final: ${this.metrics.memoryUsage.final.toFixed(2)} MB`);
    console.log(`Memory Growth: ${
      (this.metrics.memoryUsage.final - this.metrics.memoryUsage.initial).toFixed(2)
    } MB`);
    
    if (this.metrics.errors.length > 0) {
      console.log('\n❌ Errors (first 5)');
      this.metrics.errors.slice(0, 5).forEach(error => {
        console.log(`  - ${error}`);
      });
    }
    
    // Performance assessment
    console.log('\n🎯 Assessment');
    const memoryGrowth = this.metrics.memoryUsage.final - this.metrics.memoryUsage.initial;
    const successRate = this.metrics.successfulGames / this.metrics.totalGames;
    
    if (successRate >= 0.95 && memoryGrowth < 500 && this.metrics.averageGameTime < 5) {
      console.log('✅ PASSED: System is stable under load');
    } else {
      console.log('⚠️ ATTENTION NEEDED:');
      if (successRate < 0.95) {
        console.log(`  - Success rate below 95% (${(successRate * 100).toFixed(1)}%)`);
      }
      if (memoryGrowth >= 500) {
        console.log(`  - High memory growth (${memoryGrowth.toFixed(2)} MB)`);
      }
      if (this.metrics.averageGameTime >= 5) {
        console.log(`  - Slow average game time (${this.metrics.averageGameTime.toFixed(2)}s)`);
      }
    }
  }
}

// Export for command-line execution
if (require.main === module) {
  const tester = new LoadTester();
  tester.runLoadTest(100).then(metrics => {
    console.log('\n✅ Load test completed');
    process.exit(metrics.failedGames > 5 ? 1 : 0);
  }).catch(error => {
    console.error('❌ Load test failed:', error);
    process.exit(1);
  });
}