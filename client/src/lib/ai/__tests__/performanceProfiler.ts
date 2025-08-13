/**
 * Performance Profiling for AI System
 * Memory and CPU monitoring with Chrome DevTools integration
 */

export interface PerformanceMetrics {
  memory: {
    used: number;
    total: number;
    limit: number;
    jsHeapSize: number;
  };
  cpu: {
    usage: number;
    idle: number;
  };
  fps: {
    current: number;
    average: number;
    min: number;
    max: number;
  };
  timing: {
    aiThinkTime: number;
    renderTime: number;
    totalFrameTime: number;
  };
}

export class PerformanceProfiler {
  private metrics: PerformanceMetrics;
  private frameCount: number = 0;
  private fpsHistory: number[] = [];
  private lastFrameTime: number = performance.now();
  private isMonitoring: boolean = false;

  constructor() {
    this.metrics = {
      memory: { used: 0, total: 0, limit: 0, jsHeapSize: 0 },
      cpu: { usage: 0, idle: 100 },
      fps: { current: 60, average: 60, min: 60, max: 60 },
      timing: { aiThinkTime: 0, renderTime: 0, totalFrameTime: 0 }
    };
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('📊 Performance monitoring started...');
    
    // Start FPS monitoring
    this.monitorFPS();
    
    // Start memory monitoring
    this.monitorMemory();
    
    // Start CPU monitoring (if available)
    this.monitorCPU();
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    console.log('📊 Performance monitoring stopped');
    this.generateReport();
  }

  /**
   * Monitor FPS
   */
  private monitorFPS(): void {
    const measureFPS = () => {
      if (!this.isMonitoring) return;
      
      const currentTime = performance.now();
      const deltaTime = currentTime - this.lastFrameTime;
      const currentFPS = 1000 / deltaTime;
      
      this.fpsHistory.push(currentFPS);
      if (this.fpsHistory.length > 60) {
        this.fpsHistory.shift();
      }
      
      this.metrics.fps.current = currentFPS;
      this.metrics.fps.average = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
      this.metrics.fps.min = Math.min(...this.fpsHistory);
      this.metrics.fps.max = Math.max(...this.fpsHistory);
      
      this.lastFrameTime = currentTime;
      this.frameCount++;
      
      // Check for performance issues
      if (currentFPS < 30) {
        console.warn(`⚠️ Low FPS detected: ${currentFPS.toFixed(0)}`);
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }

  /**
   * Monitor memory usage
   */
  private monitorMemory(): void {
    const measureMemory = () => {
      if (!this.isMonitoring) return;
      
      // Use performance.memory if available (Chrome)
      if ((performance as any).memory) {
        const memory = (performance as any).memory;
        this.metrics.memory.jsHeapSize = memory.usedJSHeapSize / 1024 / 1024;
        this.metrics.memory.total = memory.totalJSHeapSize / 1024 / 1024;
        this.metrics.memory.limit = memory.jsHeapSizeLimit / 1024 / 1024;
      }
      
      // Fallback to process.memoryUsage if available (Node.js)
      if (typeof process !== 'undefined' && process.memoryUsage) {
        const usage = process.memoryUsage();
        this.metrics.memory.used = usage.heapUsed / 1024 / 1024;
        this.metrics.memory.total = usage.heapTotal / 1024 / 1024;
      }
      
      // Check for memory issues
      if (this.metrics.memory.used > 1000) {
        console.warn(`⚠️ High memory usage: ${this.metrics.memory.used.toFixed(2)} MB`);
      }
      
      setTimeout(measureMemory, 1000); // Check every second
    };
    
    measureMemory();
  }

  /**
   * Monitor CPU usage (simulated)
   */
  private monitorCPU(): void {
    const measureCPU = () => {
      if (!this.isMonitoring) return;
      
      // Simulate CPU usage based on FPS
      // Lower FPS = higher CPU usage
      const fpsPct = Math.min(this.metrics.fps.current / 60, 1);
      this.metrics.cpu.usage = (1 - fpsPct) * 100;
      this.metrics.cpu.idle = fpsPct * 100;
      
      setTimeout(measureCPU, 1000);
    };
    
    measureCPU();
  }

  /**
   * Profile AI think time
   */
  async profileAIThinkTime<T>(
    aiFunction: () => Promise<T>,
    label: string = 'AI Operation'
  ): Promise<T> {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();
    
    try {
      const result = await aiFunction();
      
      const endTime = performance.now();
      const endMemory = this.getMemoryUsage();
      
      const thinkTime = endTime - startTime;
      const memoryDelta = endMemory - startMemory;
      
      this.metrics.timing.aiThinkTime = thinkTime;
      
      console.log(`⏱️ ${label}: ${thinkTime.toFixed(2)}ms, Memory: +${memoryDelta.toFixed(2)}MB`);
      
      return result;
    } catch (error) {
      console.error(`❌ ${label} failed:`, error);
      throw error;
    }
  }

  /**
   * Get current memory usage
   */
  private getMemoryUsage(): number {
    if ((performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024;
    }
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed / 1024 / 1024;
    }
    return 0;
  }

  /**
   * Check if performance is within acceptable limits
   */
  checkPerformance(): { passed: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // Check memory (should be < 1GB)
    if (this.metrics.memory.used > 1024) {
      issues.push(`Memory usage too high: ${this.metrics.memory.used.toFixed(2)} MB`);
    }
    
    // Check FPS (should be > 30)
    if (this.metrics.fps.average < 30) {
      issues.push(`FPS too low: ${this.metrics.fps.average.toFixed(1)}`);
    }
    
    // Check AI think time (should be < 1000ms)
    if (this.metrics.timing.aiThinkTime > 1000) {
      issues.push(`AI think time too high: ${this.metrics.timing.aiThinkTime.toFixed(0)}ms`);
    }
    
    return {
      passed: issues.length === 0,
      issues
    };
  }

  /**
   * Generate performance report
   */
  generateReport(): void {
    console.log('\n📊 Performance Profile Report');
    console.log('============================');
    
    console.log('\n💾 Memory Usage:');
    console.log(`  Current: ${this.metrics.memory.used.toFixed(2)} MB`);
    console.log(`  Total Heap: ${this.metrics.memory.total.toFixed(2)} MB`);
    console.log(`  JS Heap: ${this.metrics.memory.jsHeapSize.toFixed(2)} MB`);
    console.log(`  Limit: ${this.metrics.memory.limit.toFixed(2)} MB`);
    
    console.log('\n🖥️ CPU Usage:');
    console.log(`  Usage: ${this.metrics.cpu.usage.toFixed(1)}%`);
    console.log(`  Idle: ${this.metrics.cpu.idle.toFixed(1)}%`);
    
    console.log('\n🎮 FPS Performance:');
    console.log(`  Current: ${this.metrics.fps.current.toFixed(1)}`);
    console.log(`  Average: ${this.metrics.fps.average.toFixed(1)}`);
    console.log(`  Min: ${this.metrics.fps.min.toFixed(1)}`);
    console.log(`  Max: ${this.metrics.fps.max.toFixed(1)}`);
    
    console.log('\n⏱️ Timing:');
    console.log(`  AI Think Time: ${this.metrics.timing.aiThinkTime.toFixed(2)}ms`);
    console.log(`  Render Time: ${this.metrics.timing.renderTime.toFixed(2)}ms`);
    console.log(`  Frame Count: ${this.frameCount}`);
    
    const check = this.checkPerformance();
    console.log('\n🎯 Performance Check:');
    if (check.passed) {
      console.log('  ✅ All performance metrics within acceptable limits');
    } else {
      console.log('  ⚠️ Performance issues detected:');
      check.issues.forEach(issue => {
        console.log(`    - ${issue}`);
      });
    }
  }

  /**
   * Export metrics for external analysis
   */
  exportMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
}

// Create singleton instance
export const profiler = new PerformanceProfiler();