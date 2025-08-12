/**
 * Performance Utility Functions
 */

/**
 * Debounce function - delays execution until after wait milliseconds
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;
  
  const debounced = function(this: any, ...args: Parameters<T>) {
    const context = this;
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func.apply(context, args);
      timeout = null;
    }, wait);
  } as T;
  
  (debounced as any).cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  
  return debounced as T & { cancel: () => void };
}

/**
 * Throttle function - ensures function is called at most once per interval
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T & { cancel: () => void } {
  let inThrottle = false;
  let lastArgs: any[] | null = null;
  let lastContext: any = null;
  let timeout: NodeJS.Timeout | null = null;
  
  const throttled = function(this: any, ...args: Parameters<T>) {
    const context = this;
    
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      
      timeout = setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          throttled.apply(lastContext, lastArgs);
          lastArgs = null;
          lastContext = null;
        }
      }, limit);
    } else {
      lastArgs = args;
      lastContext = context;
    }
  } as T;
  
  (throttled as any).cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    inThrottle = false;
    lastArgs = null;
    lastContext = null;
  };
  
  return throttled as T & { cancel: () => void };
}

/**
 * Request Animation Frame throttle
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T
): T & { cancel: () => void } {
  let rafId: number | null = null;
  let lastArgs: any[] | null = null;
  let lastContext: any = null;
  
  const throttled = function(this: any, ...args: Parameters<T>) {
    lastArgs = args;
    lastContext = this;
    
    if (!rafId) {
      rafId = requestAnimationFrame(() => {
        func.apply(lastContext, lastArgs!);
        rafId = null;
        lastArgs = null;
        lastContext = null;
      });
    }
  } as T;
  
  (throttled as any).cancel = () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    lastArgs = null;
    lastContext = null;
  };
  
  return throttled as T & { cancel: () => void };
}

/**
 * Memoize function results
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return function(this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = resolver ? resolver(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = func.apply(this, args);
    cache.set(key, result);
    
    // Limit cache size
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  } as T;
}

/**
 * Chunk array for batch processing
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Process items in batches with idle callback
 */
export async function processBatches<T, R>(
  items: T[],
  processor: (item: T) => R | Promise<R>,
  batchSize: number = 10
): Promise<R[]> {
  const results: R[] = [];
  const batches = chunk(items, batchSize);
  
  for (const batch of batches) {
    await new Promise(resolve => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => resolve(undefined));
      } else {
        setTimeout(resolve, 0);
      }
    });
    
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * Create a performance mark
 */
export function perfMark(name: string): void {
  if ('performance' in window && 'mark' in performance) {
    performance.mark(name);
  }
}

/**
 * Measure performance between marks
 */
export function perfMeasure(name: string, startMark: string, endMark?: string): number {
  if (!('performance' in window) || !('measure' in performance)) {
    return 0;
  }
  
  try {
    if (endMark) {
      performance.measure(name, startMark, endMark);
    } else {
      performance.measure(name, { start: startMark });
    }
    
    const entries = performance.getEntriesByName(name);
    if (entries.length > 0) {
      const duration = entries[entries.length - 1].duration;
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
      return duration;
    }
  } catch (error) {
    console.warn('Performance measurement failed:', error);
  }
  
  return 0;
}

/**
 * Get memory usage
 */
export function getMemoryUsage(): {
  used: number;
  limit: number;
  percent: number;
} | null {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize / (1024 * 1024),
      limit: memory.jsHeapSizeLimit / (1024 * 1024),
      percent: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    };
  }
  return null;
}

/**
 * Format bytes to human readable
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Calculate FPS from timestamps
 */
export function calculateFPS(timestamps: number[]): number {
  if (timestamps.length < 2) return 0;
  
  const deltas = [];
  for (let i = 1; i < timestamps.length; i++) {
    deltas.push(timestamps[i] - timestamps[i - 1]);
  }
  
  const avgDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;
  return 1000 / avgDelta;
}

/**
 * Detect if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Detect if device has low memory
 */
export function isLowMemoryDevice(): boolean {
  if ('deviceMemory' in navigator) {
    return (navigator as any).deviceMemory < 4;
  }
  return false;
}

/**
 * Detect if connection is slow
 */
export function isSlowConnection(): boolean {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    return ['slow-2g', '2g', '3g'].includes(connection.effectiveType);
  }
  return false;
}

/**
 * Schedule work when main thread is idle
 */
export function whenIdle(callback: () => void, timeout?: number): void {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, 0);
  }
}

/**
 * Create a promise that resolves when idle
 */
export function idlePromise(timeout?: number): Promise<void> {
  return new Promise(resolve => {
    whenIdle(() => resolve(), timeout);
  });
}