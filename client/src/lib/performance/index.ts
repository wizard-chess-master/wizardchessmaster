/**
 * Performance Module - Central export point
 */

export { performanceOptimizer } from './performanceOptimizer';
export type { PerformanceMetrics, PerformanceThresholds } from './performanceOptimizer';

export { lazyLoader } from './lazyLoader';
export type { LazyLoadConfig } from './lazyLoader';

export {
  withMemo,
  useOptimizedCallback,
  useOptimizedState,
  VirtualList,
  LazyImage,
  useInViewport,
  useBatchedUpdates,
  PerformanceMonitor,
  RenderOptimizer
} from './renderOptimizer';

export {
  debounce,
  throttle,
  rafThrottle,
  memoize,
  chunk,
  processBatches,
  perfMark,
  perfMeasure,
  getMemoryUsage,
  formatBytes,
  calculateFPS,
  prefersReducedMotion,
  isLowMemoryDevice,
  isSlowConnection,
  whenIdle,
  idlePromise
} from './utils';

/**
 * Initialize all performance optimizations
 */
export function initializePerformance(): void {
  // Import instances directly
  import('./performanceOptimizer').then(({ performanceOptimizer }) => {
    performanceOptimizer.initialize();
  });
  
  import('./lazyLoader').then(({ lazyLoader }) => {
    // Start observing images for lazy loading
    lazyLoader.observeImages();
    
    // Start observing components
    lazyLoader.observeComponents();
  });
  
  console.log('⚡ Performance optimizations initialized');
}