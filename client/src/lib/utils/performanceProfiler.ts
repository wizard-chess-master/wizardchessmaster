/**
 * Performance Profiler
 * Comprehensive performance monitoring and optimization utilities
 */

interface PerformanceMark {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface RenderMetrics {
  componentName: string;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
  slowRenders: number;
}

interface NetworkMetrics {
  requestCount: number;
  totalDataTransferred: number;
  averageLatency: number;
  failedRequests: number;
  slowRequests: number;
}

export class PerformanceProfiler {
  private marks: Map<string, PerformanceMark> = new Map();
  private measures: PerformanceMark[] = [];
  private renderMetrics: Map<string, RenderMetrics> = new Map();
  private networkMetrics: NetworkMetrics = {
    requestCount: 0,
    totalDataTransferred: 0,
    averageLatency: 0,
    failedRequests: 0,
    slowRequests: 0
  };
  private frameTimestamps: number[] = [];
  private isRecording = false;
  private slowThreshold = 16; // 60fps = 16ms per frame
  private networkSlowThreshold = 1000; // 1 second

  constructor() {
    this.setupPerformanceObserver();
    this.monitorFPS();
  }

  /**
   * Setup Performance Observer for various metrics
   */
  private setupPerformanceObserver(): void {
    if (!('PerformanceObserver' in window)) {
      console.warn('PerformanceObserver not supported');
      return;
    }

    try {
      // Observe navigation timing
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.logNavigationTiming(entry as PerformanceNavigationTiming);
          }
        }
      });
      navigationObserver.observe({ entryTypes: ['navigation'] });

      // Observe resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            this.logResourceTiming(entry as PerformanceResourceTiming);
          }
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });

      // Observe paint timing
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log(`🎨 ${entry.name}: ${entry.startTime.toFixed(2)}ms`);
        }
      });
      paintObserver.observe({ entryTypes: ['paint'] });

      // Observe largest contentful paint
      if ('largest-contentful-paint' in PerformanceObserver.supportedEntryTypes) {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log(`📊 LCP: ${lastEntry.startTime.toFixed(2)}ms`);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      }
    } catch (error) {
      console.error('Failed to setup performance observers:', error);
    }
  }

  /**
   * Log navigation timing
   */
  private logNavigationTiming(entry: PerformanceNavigationTiming): void {
    const metrics = {
      domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      domComplete: entry.domComplete - entry.domInteractive,
      loadComplete: entry.loadEventEnd - entry.loadEventStart,
      firstByte: entry.responseStart - entry.requestStart,
      totalTime: entry.loadEventEnd - entry.fetchStart
    };

    console.log('⚡ Navigation Performance:', metrics);
  }

  /**
   * Log resource timing
   */
  private logResourceTiming(entry: PerformanceResourceTiming): void {
    this.networkMetrics.requestCount++;
    this.networkMetrics.totalDataTransferred += entry.transferSize || 0;
    
    const duration = entry.responseEnd - entry.startTime;
    this.networkMetrics.averageLatency = 
      (this.networkMetrics.averageLatency * (this.networkMetrics.requestCount - 1) + duration) 
      / this.networkMetrics.requestCount;

    if (duration > this.networkSlowThreshold) {
      this.networkMetrics.slowRequests++;
      console.warn(`🐌 Slow resource: ${entry.name} took ${duration.toFixed(2)}ms`);
    }
  }

  /**
   * Monitor FPS
   */
  private monitorFPS(): void {
    let lastTime = performance.now();
    let frameCount = 0;
    let fps = 0;
    let warningCount = 0;
    const maxWarnings = 3; // Only warn a few times

    const measureFPS = () => {
      const currentTime = performance.now();
      frameCount++;

      if (currentTime >= lastTime + 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        frameCount = 0;
        lastTime = currentTime;

        // Only warn for persistent low FPS, not single frame drops
        if (fps < 20 && fps > 0 && warningCount < maxWarnings) {
          warningCount++;
          console.warn(`⚠️ Low FPS detected: ${fps}`);
        }

        // Store FPS for analysis
        this.frameTimestamps.push(fps);
        if (this.frameTimestamps.length > 60) {
          this.frameTimestamps.shift();
        }
      }

      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);
  }

  /**
   * Start performance mark
   */
  startMark(name: string, metadata?: Record<string, any>): void {
    const mark: PerformanceMark = {
      name,
      startTime: performance.now(),
      metadata
    };
    
    this.marks.set(name, mark);
    
    if (typeof performance.mark === 'function') {
      performance.mark(`${name}-start`);
    }
  }

  /**
   * End performance mark and create measure
   */
  endMark(name: string): number | null {
    const startMark = this.marks.get(name);
    if (!startMark) {
      console.warn(`No start mark found for: ${name}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - startMark.startTime;

    startMark.endTime = endTime;
    startMark.duration = duration;

    this.measures.push({ ...startMark });
    
    if (typeof performance.mark === 'function' && typeof performance.measure === 'function') {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
    }

    // Log slow operations
    if (duration > 100) {
      console.warn(`⚠️ Slow operation: ${name} took ${duration.toFixed(2)}ms`);
    }

    this.marks.delete(name);
    return duration;
  }

  /**
   * Profile React component render
   */
  profileRender(componentName: string, phase: 'mount' | 'update', actualDuration: number): void {
    let metrics = this.renderMetrics.get(componentName);
    
    if (!metrics) {
      metrics = {
        componentName,
        renderCount: 0,
        totalRenderTime: 0,
        averageRenderTime: 0,
        lastRenderTime: 0,
        slowRenders: 0
      };
      this.renderMetrics.set(componentName, metrics);
    }

    metrics.renderCount++;
    metrics.totalRenderTime += actualDuration;
    metrics.averageRenderTime = metrics.totalRenderTime / metrics.renderCount;
    metrics.lastRenderTime = actualDuration;

    if (actualDuration > this.slowThreshold) {
      metrics.slowRenders++;
      console.warn(`🐌 Slow render: ${componentName} (${phase}) took ${actualDuration.toFixed(2)}ms`);
    }
  }

  /**
   * Measure function execution time
   */
  measureFunction<T>(fn: () => T, name: string): T {
    this.startMark(name);
    try {
      const result = fn();
      return result;
    } finally {
      this.endMark(name);
    }
  }

  /**
   * Measure async function execution time
   */
  async measureAsync<T>(fn: () => Promise<T>, name: string): Promise<T> {
    this.startMark(name);
    try {
      const result = await fn();
      return result;
    } finally {
      this.endMark(name);
    }
  }

  /**
   * Get performance report
   */
  getReport(): {
    measures: PerformanceMark[];
    renderMetrics: RenderMetrics[];
    networkMetrics: NetworkMetrics;
    averageFPS: number;
    memoryUsage: number | null;
  } {
    const renderMetrics = Array.from(this.renderMetrics.values());
    
    // Sort by total render time
    renderMetrics.sort((a, b) => b.totalRenderTime - a.totalRenderTime);

    const averageFPS = this.frameTimestamps.length > 0
      ? this.frameTimestamps.reduce((a, b) => a + b, 0) / this.frameTimestamps.length
      : 0;

    const memoryUsage = (performance as any).memory?.usedJSHeapSize || null;

    return {
      measures: this.measures.slice(-50), // Last 50 measures
      renderMetrics: renderMetrics.slice(0, 20), // Top 20 components
      networkMetrics: this.networkMetrics,
      averageFPS,
      memoryUsage
    };
  }

  /**
   * Log performance report to console
   */
  logReport(): void {
    const report = this.getReport();

    console.group('📊 Performance Report');
    
    console.group('⚡ Top Slow Operations');
    const slowOps = report.measures
      .filter(m => m.duration && m.duration > 100)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, 10);
    
    slowOps.forEach(op => {
      console.log(`${op.name}: ${op.duration?.toFixed(2)}ms`);
    });
    console.groupEnd();

    console.group('🎨 Render Performance');
    report.renderMetrics.slice(0, 10).forEach(metric => {
      console.log(`${metric.componentName}:`, {
        renders: metric.renderCount,
        avgTime: `${metric.averageRenderTime.toFixed(2)}ms`,
        slowRenders: metric.slowRenders,
        totalTime: `${metric.totalRenderTime.toFixed(2)}ms`
      });
    });
    console.groupEnd();

    console.group('🌐 Network Performance');
    console.log('Requests:', report.networkMetrics.requestCount);
    console.log('Data transferred:', `${(report.networkMetrics.totalDataTransferred / 1024 / 1024).toFixed(2)}MB`);
    console.log('Average latency:', `${report.networkMetrics.averageLatency.toFixed(2)}ms`);
    console.log('Slow requests:', report.networkMetrics.slowRequests);
    console.log('Failed requests:', report.networkMetrics.failedRequests);
    console.groupEnd();

    console.log('🎯 Average FPS:', report.averageFPS.toFixed(1));
    if (report.memoryUsage) {
      console.log('💾 Memory usage:', `${(report.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
    }

    console.groupEnd();
  }

  /**
   * Start recording performance
   */
  startRecording(): void {
    this.isRecording = true;
    this.marks.clear();
    this.measures = [];
    this.renderMetrics.clear();
    console.log('🔴 Performance recording started');
  }

  /**
   * Stop recording and generate report
   */
  stopRecording(): void {
    this.isRecording = false;
    console.log('⏹️ Performance recording stopped');
    this.logReport();
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.marks.clear();
    this.measures = [];
    this.renderMetrics.clear();
    this.networkMetrics = {
      requestCount: 0,
      totalDataTransferred: 0,
      averageLatency: 0,
      failedRequests: 0,
      slowRequests: 0
    };
    this.frameTimestamps = [];
  }

  /**
   * Get bundle size analysis
   */
  analyzeBundleSize(): void {
    if (typeof performance.getEntriesByType === 'function') {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      const jsFiles = resources.filter(r => r.name.endsWith('.js'));
      const cssFiles = resources.filter(r => r.name.endsWith('.css'));
      const imageFiles = resources.filter(r => 
        r.name.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)
      );

      const totalJS = jsFiles.reduce((sum, f) => sum + (f.transferSize || 0), 0);
      const totalCSS = cssFiles.reduce((sum, f) => sum + (f.transferSize || 0), 0);
      const totalImages = imageFiles.reduce((sum, f) => sum + (f.transferSize || 0), 0);

      console.group('📦 Bundle Size Analysis');
      console.log(`JavaScript: ${(totalJS / 1024).toFixed(2)}KB (${jsFiles.length} files)`);
      console.log(`CSS: ${(totalCSS / 1024).toFixed(2)}KB (${cssFiles.length} files)`);
      console.log(`Images: ${(totalImages / 1024).toFixed(2)}KB (${imageFiles.length} files)`);
      console.log(`Total: ${((totalJS + totalCSS + totalImages) / 1024).toFixed(2)}KB`);
      console.groupEnd();
    }
  }
}

// Singleton instance
export const performanceProfiler = new PerformanceProfiler();

// Development helpers
if (process.env.NODE_ENV === 'development') {
  (window as any).performanceProfiler = performanceProfiler;
  console.log('💡 Performance Profiler available as window.performanceProfiler');
  console.log('Commands: startRecording(), stopRecording(), logReport(), analyzeBundleSize()');
}

export default performanceProfiler;