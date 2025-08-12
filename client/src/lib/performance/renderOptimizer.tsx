/**
 * Render Optimizer
 * React-specific rendering optimizations
 */

import React, { memo, useCallback, useMemo, useRef, useEffect } from 'react';
import { debounce, throttle } from './utils';

/**
 * HOC for automatic memoization with deep comparison
 */
export function withMemo<P extends object>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: P, nextProps: P) => boolean
): React.MemoExoticComponent<React.ComponentType<P>> {
  return memo(Component, propsAreEqual || deepPropsAreEqual);
}

/**
 * Deep equality check for props
 */
function deepPropsAreEqual<P extends object>(prevProps: P, nextProps: P): boolean {
  const prevKeys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);
  
  if (prevKeys.length !== nextKeys.length) {
    return false;
  }
  
  for (const key of prevKeys) {
    const prevValue = (prevProps as any)[key];
    const nextValue = (nextProps as any)[key];
    
    if (prevValue === nextValue) continue;
    
    // Check if both are objects
    if (typeof prevValue === 'object' && typeof nextValue === 'object') {
      if (JSON.stringify(prevValue) !== JSON.stringify(nextValue)) {
        return false;
      }
    } else {
      return false;
    }
  }
  
  return true;
}

/**
 * Hook for optimized callbacks with dependencies
 */
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  options?: {
    debounce?: number;
    throttle?: number;
  }
): T {
  const { debounce: debounceMs, throttle: throttleMs } = options || {};
  
  const optimizedCallback = useCallback(callback, deps);
  
  const debouncedCallback = useMemo(
    () => debounceMs ? debounce(optimizedCallback, debounceMs) : optimizedCallback,
    [optimizedCallback, debounceMs]
  );
  
  const throttledCallback = useMemo(
    () => throttleMs ? throttle(debouncedCallback, throttleMs) : debouncedCallback,
    [debouncedCallback, throttleMs]
  );
  
  return throttledCallback as T;
}

/**
 * Hook for optimized state updates
 */
export function useOptimizedState<T>(
  initialValue: T | (() => T)
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = React.useState(initialValue);
  const stateRef = useRef(state);
  
  const optimizedSetState = useCallback((value: T | ((prev: T) => T)) => {
    if (typeof value === 'function') {
      setState(prev => {
        const newValue = (value as (prev: T) => T)(prev);
        if (newValue !== prev) {
          stateRef.current = newValue;
          return newValue;
        }
        return prev;
      });
    } else {
      if (value !== stateRef.current) {
        stateRef.current = value;
        setState(value);
      }
    }
  }, []);
  
  return [state, optimizedSetState];
}

/**
 * Virtual list component for rendering large lists efficiently
 */
interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  containerHeight: number;
  overscan?: number;
  className?: string;
}

export function VirtualList<T>({
  items,
  itemHeight,
  renderItem,
  containerHeight,
  overscan = 3,
  className = ''
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;
  
  const handleScroll = useOptimizedCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    },
    [],
    { throttle: 16 } // ~60fps
  );
  
  return (
    <div
      ref={scrollElementRef}
      className={`virtual-list ${className}`}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative'
      }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Lazy image component with progressive loading
 */
interface LazyImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const LazyImage = memo(({
  src,
  alt,
  placeholder,
  className = '',
  style = {}
}: LazyImageProps) => {
  const [imageSrc, setImageSrc] = React.useState(placeholder || '');
  const [imageRef, setImageRef] = React.useState<HTMLImageElement | null>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  
  useEffect(() => {
    if (!imageRef) return;
    
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = new Image();
            img.onload = () => {
              setImageSrc(src);
              setIsLoaded(true);
            };
            img.src = src;
            observer.unobserve(imageRef);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    observer.observe(imageRef);
    
    return () => {
      if (imageRef) {
        observer.unobserve(imageRef);
      }
    };
  }, [imageRef, src]);
  
  return (
    <img
      ref={setImageRef}
      src={imageSrc}
      alt={alt}
      className={`lazy-image ${className} ${isLoaded ? 'loaded' : 'loading'}`}
      style={{
        ...style,
        transition: 'opacity 0.3s',
        opacity: isLoaded ? 1 : 0.5
      }}
    />
  );
});

LazyImage.displayName = 'LazyImage';

/**
 * Hook for detecting if component is in viewport
 */
export function useInViewport(
  ref: React.RefObject<HTMLElement>,
  options?: IntersectionObserverInit
): boolean {
  const [isInViewport, setIsInViewport] = React.useState(false);
  
  useEffect(() => {
    if (!ref.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      options
    );
    
    observer.observe(ref.current);
    
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);
  
  return isInViewport;
}

/**
 * Hook for batching state updates
 */
export function useBatchedUpdates<T extends Record<string, any>>(
  initialState: T
): [T, (updates: Partial<T>) => void] {
  const [state, setState] = React.useState(initialState);
  const pendingUpdates = useRef<Partial<T>>({});
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const batchUpdate = useCallback((updates: Partial<T>) => {
    pendingUpdates.current = { ...pendingUpdates.current, ...updates };
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, ...pendingUpdates.current }));
      pendingUpdates.current = {};
    }, 0);
  }, []);
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return [state, batchUpdate];
}

/**
 * Performance monitor component
 */
export const PerformanceMonitor: React.FC<{
  onMetrics?: (metrics: any) => void;
}> = memo(({ onMetrics }) => {
  const frameRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsRef = useRef(0);
  
  useEffect(() => {
    let rafId: number;
    
    const measurePerformance = () => {
      const now = performance.now();
      const delta = now - lastTimeRef.current;
      
      if (delta >= 1000) {
        fpsRef.current = Math.round((frameRef.current * 1000) / delta);
        
        if (onMetrics) {
          onMetrics({
            fps: fpsRef.current,
            timestamp: now
          });
        }
        
        frameRef.current = 0;
        lastTimeRef.current = now;
      }
      
      frameRef.current++;
      rafId = requestAnimationFrame(measurePerformance);
    };
    
    rafId = requestAnimationFrame(measurePerformance);
    
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [onMetrics]);
  
  return null;
});

PerformanceMonitor.displayName = 'PerformanceMonitor';

/**
 * Render optimization utilities
 */
export const RenderOptimizer = {
  /**
   * Batch DOM updates
   */
  batchDOMUpdates(updates: (() => void)[]): void {
    requestAnimationFrame(() => {
      updates.forEach(update => update());
    });
  },
  
  /**
   * Schedule idle work
   */
  scheduleIdleWork(work: () => void, timeout?: number): void {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(work, { timeout });
    } else {
      setTimeout(work, 0);
    }
  },
  
  /**
   * Measure component render time
   */
  measureRenderTime(componentName: string): {
    start: () => void;
    end: () => void;
  } {
    const markName = `render-${componentName}-${Date.now()}`;
    
    return {
      start: () => performance.mark(`${markName}-start`),
      end: () => {
        performance.mark(`${markName}-end`);
        performance.measure(markName, `${markName}-start`, `${markName}-end`);
        
        const measure = performance.getEntriesByName(markName)[0];
        if (measure) {
          console.log(`⚡ ${componentName} render time: ${measure.duration.toFixed(2)}ms`);
        }
      }
    };
  }
};