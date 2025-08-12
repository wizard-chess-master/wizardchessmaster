/**
 * Performance Optimizer
 * Central module for performance monitoring and optimization
 */

export interface PerformanceMetrics {
  fps: number;
  memory: {
    used: number;
    limit: number;
    percent: number;
  };
  renderTime: number;
  networkLatency: number;
  bundleSize: number;
  cacheHitRate: number;
  loadTime: number;
}

export interface PerformanceThresholds {
  minFPS: number;
  maxMemoryMB: number;
  maxRenderTimeMs: number;
  maxNetworkLatencyMs: number;
  targetCacheHitRate: number;
}

class PerformanceOptimizer {
  private metrics: PerformanceMetrics = {
    fps: 60,
    memory: { used: 0, limit: 0, percent: 0 },
    renderTime: 0,
    networkLatency: 0,
    bundleSize: 0,
    cacheHitRate: 0,
    loadTime: 0
  };

  private thresholds: PerformanceThresholds = {
    minFPS: 30,
    maxMemoryMB: 500,
    maxRenderTimeMs: 16,
    maxNetworkLatencyMs: 1000,
    targetCacheHitRate: 0.8
  };

  private observers: Map<string, PerformanceObserver> = new Map();
  private rafId: number | null = null;
  private lastFrameTime = 0;
  private frameCount = 0;
  private fpsHistory: number[] = [];
  private listeners: Set<(metrics: PerformanceMetrics) => void> = new Set();
  private optimizationsEnabled = true;

  /**
   * Initialize performance monitoring
   */
  initialize(): void {
    this.setupPerformanceObservers();
    this.startFPSMonitoring();
    this.setupMemoryMonitoring();
    this.setupNetworkMonitoring();
    this.applyInitialOptimizations();
    
    console.log('⚡ Performance Optimizer initialized');
  }

  /**
   * Setup Performance Observers for various metrics
   */
  private setupPerformanceObservers(): void {
    // Observe paint timing
    if ('PerformanceObserver' in window) {
      try {
        // Paint timing observer
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              console.log(`🎨 First Contentful Paint: ${entry.startTime.toFixed(2)}ms`);
            }
          }
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.set('paint', paintObserver);

        // Largest Contentful Paint observer
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log(`🎨 Largest Contentful Paint: ${lastEntry.startTime.toFixed(2)}ms`);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);

        // Resource timing observer
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const resourceEntry = entry as PerformanceResourceTiming;
            const loadTime = resourceEntry.responseEnd - resourceEntry.startTime;
            
            if (loadTime > 1000) {
              console.warn(`🐌 Slow resource: ${resourceEntry.name} took ${loadTime.toFixed(2)}ms`);
            }
          }
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.set('resource', resourceObserver);

      } catch (error) {
        console.warn('Performance Observer setup failed:', error);
      }
    }
  }

  /**
   * Start FPS monitoring
   */
  private startFPSMonitoring(): void {
    const measureFPS = (timestamp: number) => {
      if (this.lastFrameTime) {
        const delta = timestamp - this.lastFrameTime;
        const fps = 1000 / delta;
        
        this.fpsHistory.push(fps);
        if (this.fpsHistory.length > 60) {
          this.fpsHistory.shift();
        }
        
        this.frameCount++;
        
        // Calculate average FPS every 60 frames
        if (this.frameCount % 60 === 0) {
          const avgFPS = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
          this.metrics.fps = Math.round(avgFPS);
          
          // Warn if FPS is low
          if (avgFPS < this.thresholds.minFPS) {
            console.warn(`⚠️ Low FPS detected: ${Math.round(avgFPS)}`);
            this.applyPerformanceOptimizations();
          }
        }
      }
      
      this.lastFrameTime = timestamp;
      this.rafId = requestAnimationFrame(measureFPS);
    };
    
    this.rafId = requestAnimationFrame(measureFPS);
  }

  /**
   * Setup memory monitoring
   */
  private setupMemoryMonitoring(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.metrics.memory = {
          used: memory.usedJSHeapSize / (1024 * 1024),
          limit: memory.jsHeapSizeLimit / (1024 * 1024),
          percent: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
        };
        
        // Warn if memory usage is high
        if (this.metrics.memory.used > this.thresholds.maxMemoryMB) {
          console.warn(`⚠️ High memory usage: ${this.metrics.memory.used.toFixed(2)}MB`);
          this.performMemoryCleanup();
        }
      }, 5000);
    }
  }

  /**
   * Setup network monitoring
   */
  private setupNetworkMonitoring(): void {
    // Monitor network latency through resource timing
    setInterval(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      if (resources.length > 0) {
        const recentResources = resources.slice(-10);
        const avgLatency = recentResources.reduce((sum, r) => 
          sum + (r.responseEnd - r.startTime), 0) / recentResources.length;
        
        this.metrics.networkLatency = avgLatency;
        
        if (avgLatency > this.thresholds.maxNetworkLatencyMs) {
          console.warn(`⚠️ High network latency: ${avgLatency.toFixed(2)}ms`);
        }
      }
    }, 10000);
  }

  /**
   * Apply initial optimizations
   */
  private applyInitialOptimizations(): void {
    // Enable passive event listeners
    this.enablePassiveListeners();
    
    // Setup Intersection Observer for lazy loading
    this.setupLazyLoading();
    
    // Enable will-change optimization
    this.enableWillChangeOptimization();
    
    // Setup debounced resize handler
    this.setupOptimizedResize();
    
    console.log('✅ Initial optimizations applied');
  }

  /**
   * Enable passive event listeners for better scroll performance
   */
  private enablePassiveListeners(): void {
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      if (type === 'touchstart' || type === 'touchmove' || type === 'wheel' || type === 'mousewheel') {
        if (typeof options === 'boolean') {
          options = { capture: options, passive: true };
        } else if (typeof options === 'object') {
          options.passive = true;
        } else {
          options = { passive: true };
        }
      }
      return originalAddEventListener.call(this, type, listener, options);
    };
  }

  /**
   * Setup lazy loading for images and components
   */
  private setupLazyLoading(): void {
    if ('IntersectionObserver' in window) {
      const lazyImageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              delete img.dataset.src;
              lazyImageObserver.unobserve(img);
            }
          }
        });
      });
      
      // Observe all images with data-src
      document.querySelectorAll('img[data-src]').forEach(img => {
        lazyImageObserver.observe(img);
      });
    }
  }

  /**
   * Enable will-change optimization for animations
   */
  private enableWillChangeOptimization(): void {
    const animatedElements = document.querySelectorAll('[data-animated]');
    animatedElements.forEach(el => {
      const element = el as HTMLElement;
      element.style.willChange = 'transform, opacity';
      
      // Remove will-change after animation
      element.addEventListener('animationend', () => {
        element.style.willChange = 'auto';
      }, { once: true });
    });
  }

  /**
   * Setup optimized resize handler with debouncing
   */
  private setupOptimizedResize(): void {
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Actual resize logic here
        console.log('🔄 Window resized');
      }, 250);
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
  }

  /**
   * Apply performance optimizations when metrics are poor
   */
  private applyPerformanceOptimizations(): void {
    if (!this.optimizationsEnabled) return;
    
    console.log('⚡ Applying performance optimizations...');
    
    // Reduce visual quality
    this.reduceVisualQuality();
    
    // Throttle expensive operations
    this.throttleExpensiveOperations();
    
    // Clear unnecessary caches
    this.performMemoryCleanup();
    
    // Reduce animation complexity
    this.reduceAnimationComplexity();
  }

  /**
   * Reduce visual quality for better performance
   */
  private reduceVisualQuality(): void {
    // Reduce shadow quality
    document.documentElement.style.setProperty('--shadow-quality', 'none');
    
    // Disable filters
    const elements = document.querySelectorAll('[style*="filter"]');
    elements.forEach(el => {
      (el as HTMLElement).style.filter = 'none';
    });
    
    // Reduce image quality
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      img.style.imageRendering = 'pixelated';
    });
  }

  /**
   * Throttle expensive operations
   */
  private throttleExpensiveOperations(): void {
    // Implement operation throttling
    const throttle = (func: Function, limit: number) => {
      let inThrottle: boolean;
      return function(this: any, ...args: any[]) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    };
    
    // Apply throttling to scroll handlers
    const scrollHandlers = window.onscroll;
    if (scrollHandlers) {
      window.onscroll = throttle(scrollHandlers, 100);
    }
  }

  /**
   * Perform memory cleanup
   */
  private performMemoryCleanup(): void {
    console.log('🧹 Performing memory cleanup...');
    
    // Clear performance entries
    performance.clearResourceTimings();
    performance.clearMarks();
    performance.clearMeasures();
    
    // Clear unused DOM references
    const detachedNodes = document.querySelectorAll('.detached');
    detachedNodes.forEach(node => node.remove());
    
    // Force garbage collection if available
    if ('gc' in window) {
      (window as any).gc();
    }
  }

  /**
   * Reduce animation complexity
   */
  private reduceAnimationComplexity(): void {
    // Reduce animation duration
    document.documentElement.style.setProperty('--animation-duration', '0.1s');
    
    // Disable complex animations
    const style = document.createElement('style');
    style.textContent = `
      * {
        animation-duration: 0.1s !important;
        transition-duration: 0.1s !important;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Add metrics listener
   */
  addListener(listener: (metrics: PerformanceMetrics) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Enable/disable optimizations
   */
  setOptimizationsEnabled(enabled: boolean): void {
    this.optimizationsEnabled = enabled;
    console.log(`⚡ Performance optimizations ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Cleanup and dispose
   */
  dispose(): void {
    // Stop FPS monitoring
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    
    // Disconnect observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    
    // Clear listeners
    this.listeners.clear();
    
    console.log('🔌 Performance Optimizer disposed');
  }
}

// Export singleton instance
export const performanceOptimizer = new PerformanceOptimizer();