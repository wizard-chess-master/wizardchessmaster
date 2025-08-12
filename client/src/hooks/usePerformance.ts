/**
 * Performance Hooks
 * Custom React hooks for performance optimization
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { performanceOptimizer } from '../lib/performance';
import type { PerformanceMetrics } from '../lib/performance';

/**
 * Hook to monitor performance metrics
 */
export function usePerformanceMetrics(): PerformanceMetrics {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(
    performanceOptimizer.getMetrics()
  );

  useEffect(() => {
    const unsubscribe = performanceOptimizer.addListener(setMetrics);
    return unsubscribe;
  }, []);

  return metrics;
}

/**
 * Hook to track component render count
 */
export function useRenderCount(componentName: string): number {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current++;
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 ${componentName} rendered ${renderCount.current} times`);
    }
  });

  return renderCount.current;
}

/**
 * Hook to measure render time
 */
export function useRenderTime(componentName: string): void {
  const startTime = useRef<number>();

  useEffect(() => {
    startTime.current = performance.now();
    
    return () => {
      if (startTime.current) {
        const duration = performance.now() - startTime.current;
        if (duration > 16) { // Longer than one frame (60fps)
          console.warn(`⚠️ ${componentName} render took ${duration.toFixed(2)}ms`);
        }
      }
    };
  }, [componentName]);
}

/**
 * Hook for lazy loading resources
 */
export function useLazyLoad<T>(
  loader: () => Promise<T>,
  deps: React.DependencyList = []
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  reload: () => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await loader();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}

/**
 * Hook for detecting performance issues
 */
export function usePerformanceWarnings(): {
  lowFPS: boolean;
  highMemory: boolean;
  slowNetwork: boolean;
} {
  const [warnings, setWarnings] = useState({
    lowFPS: false,
    highMemory: false,
    slowNetwork: false
  });

  useEffect(() => {
    const checkPerformance = () => {
      const metrics = performanceOptimizer.getMetrics();
      
      setWarnings({
        lowFPS: metrics.fps < 30,
        highMemory: metrics.memory.percent > 80,
        slowNetwork: metrics.networkLatency > 1000
      });
    };

    const interval = setInterval(checkPerformance, 5000);
    checkPerformance();

    return () => clearInterval(interval);
  }, []);

  return warnings;
}

/**
 * Hook for adaptive quality based on performance
 */
export function useAdaptiveQuality(): {
  quality: 'low' | 'medium' | 'high';
  shouldReduceMotion: boolean;
} {
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('high');
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    const updateQuality = () => {
      const metrics = performanceOptimizer.getMetrics();
      
      if (metrics.fps < 20 || metrics.memory.percent > 90) {
        setQuality('low');
        setShouldReduceMotion(true);
      } else if (metrics.fps < 40 || metrics.memory.percent > 70) {
        setQuality('medium');
        setShouldReduceMotion(false);
      } else {
        setQuality('high');
        setShouldReduceMotion(false);
      }
    };

    const unsubscribe = performanceOptimizer.addListener(updateQuality);
    updateQuality();

    return unsubscribe;
  }, []);

  return { quality, shouldReduceMotion };
}

/**
 * Hook for memory management
 */
export function useMemoryCleanup(
  cleanup: () => void,
  threshold: number = 80
): void {
  useEffect(() => {
    const checkMemory = () => {
      const metrics = performanceOptimizer.getMetrics();
      
      if (metrics.memory.percent > threshold) {
        console.log('🧹 Triggering memory cleanup');
        cleanup();
      }
    };

    const interval = setInterval(checkMemory, 10000);
    return () => clearInterval(interval);
  }, [cleanup, threshold]);
}

/**
 * Hook for viewport-based loading
 */
export function useViewportLoader(
  ref: React.RefObject<HTMLElement>,
  onVisible: () => void,
  options?: IntersectionObserverInit
): boolean {
  const [isVisible, setIsVisible] = useState(false);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!ref.current || hasLoaded.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded.current) {
          setIsVisible(true);
          onVisible();
          hasLoaded.current = true;
          observer.disconnect();
        }
      },
      options
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, onVisible, options]);

  return isVisible;
}