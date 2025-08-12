/**
 * Render Optimization Utilities
 * Provides tools for optimizing React rendering performance
 */

import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';

/**
 * Memoization cache for expensive computations
 */
class MemoizationCache<T> {
  private cache: Map<string, { value: T; timestamp: number }> = new Map();
  private maxSize: number;
  private ttl: number;

  constructor(maxSize = 100, ttl = 60000) {
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    const isExpired = Date.now() - entry.timestamp > this.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  set(key: string, value: T): void {
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

/**
 * Virtual list implementation for large lists
 */
export interface VirtualListOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  getItemKey?: (index: number) => string;
}

export function useVirtualList<T>(
  items: T[],
  options: VirtualListOptions
) {
  const {
    itemHeight,
    containerHeight,
    overscan = 3,
    getItemKey = (index) => String(index)
  } = options;

  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    const { startIndex, endIndex } = visibleRange;
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
      key: getItemKey(startIndex + index),
      style: {
        position: 'absolute' as const,
        top: (startIndex + index) * itemHeight,
        height: itemHeight,
        width: '100%'
      }
    }));
  }, [items, visibleRange, itemHeight, getItemKey]);

  const totalHeight = items.length * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    scrollTop
  };
}

/**
 * Batch state updates to reduce re-renders
 */
export class BatchedUpdates<T> {
  private updates: Partial<T>[] = [];
  private updateTimer: NodeJS.Timeout | null = null;
  private callback: (updates: Partial<T>) => void;
  private delay: number;

  constructor(callback: (updates: Partial<T>) => void, delay = 100) {
    this.callback = callback;
    this.delay = delay;
  }

  add(update: Partial<T>): void {
    this.updates.push(update);
    
    if (!this.updateTimer) {
      this.updateTimer = setTimeout(() => {
        this.flush();
      }, this.delay);
    }
  }

  flush(): void {
    if (this.updates.length === 0) return;

    const mergedUpdate = this.updates.reduce((acc, update) => ({
      ...acc,
      ...update
    }), {} as Partial<T>);

    this.callback(mergedUpdate);
    this.updates = [];
    
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
      this.updateTimer = null;
    }
  }

  clear(): void {
    this.updates = [];
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
      this.updateTimer = null;
    }
  }
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isIntersecting;
}

/**
 * Debounced value hook
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttled callback hook (simple implementation without lodash)
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const callbackRef = useRef(callback);
  const lastRun = useRef(0);
  const timeout = useRef<NodeJS.Timeout>();
  
  callbackRef.current = callback;

  const throttledCallback = useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastRun.current >= delay) {
      callbackRef.current(...args);
      lastRun.current = now;
    } else {
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(() => {
        callbackRef.current(...args);
        lastRun.current = Date.now();
      }, delay - (now - lastRun.current));
    }
  }, [delay]);

  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  return throttledCallback as T;
}

/**
 * Request Animation Frame hook
 */
export function useAnimationFrame(callback: (deltaTime: number) => void): void {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const callbackRef = useRef(callback);
  
  callbackRef.current = callback;

  useEffect(() => {
    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        callbackRef.current(deltaTime);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);
}

/**
 * Lazy component loader with suspense
 */
export function lazyWithPreload<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  let promise: Promise<{ default: T }> | undefined;

  const load = () => {
    if (!promise) {
      promise = factory();
    }
    return promise;
  };

  const Component = React.lazy(load);

  // Add preload method
  (Component as any).preload = load;

  return Component;
}

/**
 * Image preloader
 */
export class ImagePreloader {
  private static cache = new Set<string>();
  private static loading = new Map<string, Promise<void>>();

  static async preload(src: string): Promise<void> {
    if (this.cache.has(src)) {
      return Promise.resolve();
    }

    if (this.loading.has(src)) {
      return this.loading.get(src)!;
    }

    const promise = new Promise<void>((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.cache.add(src);
        this.loading.delete(src);
        resolve();
      };
      
      img.onerror = (error) => {
        this.loading.delete(src);
        reject(error);
      };
      
      img.src = src;
    });

    this.loading.set(src, promise);
    return promise;
  }

  static preloadMultiple(srcs: string[]): Promise<void[]> {
    return Promise.all(srcs.map(src => this.preload(src)));
  }

  static isLoaded(src: string): boolean {
    return this.cache.has(src);
  }

  static clearCache(): void {
    this.cache.clear();
    this.loading.clear();
  }
}

/**
 * Code splitting helper
 */
export function splitBundle<T>(
  loader: () => Promise<T>,
  options?: {
    delay?: number;
    onError?: (error: Error) => void;
  }
): Promise<T> {
  const { delay = 0, onError } = options || {};

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      loader()
        .then(resolve)
        .catch((error) => {
          if (onError) {
            onError(error);
          }
          reject(error);
        });
    }, delay);
  });
}



export default {
  MemoizationCache,
  useVirtualList,
  BatchedUpdates,
  useIntersectionObserver,
  useDebouncedValue,
  useThrottledCallback,
  useAnimationFrame,
  lazyWithPreload,
  ImagePreloader,
  splitBundle
};