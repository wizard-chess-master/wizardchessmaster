/**
 * React Hook for Performance Profiling
 * Integrates with React DevTools Profiler
 */

import { useEffect, useRef, Profiler, ProfilerOnRenderCallback } from 'react';
import { performanceProfiler } from '@/lib/utils/performanceProfiler';

/**
 * Hook to profile component performance
 */
export function usePerformanceProfiler(componentName: string) {
  const renderCount = useRef(0);
  const mountTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current++;
    
    // Log component mount
    performanceProfiler.startMark(`${componentName}-mount`);
    
    return () => {
      // Log component unmount
      const lifetime = performance.now() - mountTime.current;
      performanceProfiler.endMark(`${componentName}-mount`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`📊 ${componentName} lifetime: ${lifetime.toFixed(2)}ms, renders: ${renderCount.current}`);
      }
    };
  }, [componentName]);

  // Profile specific operations
  const profileOperation = <T,>(operationName: string, operation: () => T): T => {
    return performanceProfiler.measureFunction(operation, `${componentName}-${operationName}`);
  };

  const profileAsyncOperation = async <T,>(
    operationName: string, 
    operation: () => Promise<T>
  ): Promise<T> => {
    return performanceProfiler.measureAsync(operation, `${componentName}-${operationName}`);
  };

  return {
    profileOperation,
    profileAsyncOperation,
    renderCount: renderCount.current
  };
}

/**
 * Performance Profiler Component Wrapper
 */
interface PerformanceProfilerProps {
  id: string;
  children: React.ReactNode;
  threshold?: number;
}

export function PerformanceProfilerWrapper({ 
  id, 
  children, 
  threshold = 16 
}: PerformanceProfilerProps) {
  const onRender: ProfilerOnRenderCallback = (
    id: string,
    phase: 'mount' | 'update' | 'nested-update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => {
    // Log to our performance profiler
    performanceProfiler.profileRender(id, phase, actualDuration);

    // Log slow renders
    if (actualDuration > threshold) {
      console.warn(`🐌 Slow render detected in ${id}:`, {
        phase,
        actualDuration: `${actualDuration.toFixed(2)}ms`,
        baseDuration: `${baseDuration.toFixed(2)}ms`,
        startTime,
        commitTime
      });
    }
  };

  return (
    <Profiler id={id} onRender={onRender}>
      {children}
    </Profiler>
  );
}

/**
 * Hook to measure re-renders
 */
export function useRenderCounter(componentName: string, logThreshold = 10) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current++;
    const currentTime = performance.now();
    const timeSinceLastRender = currentTime - lastRenderTime.current;
    lastRenderTime.current = currentTime;

    if (renderCount.current % logThreshold === 0) {
      console.log(`🔄 ${componentName} rendered ${renderCount.current} times`);
    }

    if (timeSinceLastRender < 16 && renderCount.current > 1) {
      console.warn(`⚡ Rapid re-render in ${componentName}: ${timeSinceLastRender.toFixed(2)}ms since last render`);
    }
  });

  return renderCount.current;
}

/**
 * Hook to detect unnecessary re-renders
 */
export function useWhyDidYouUpdate(name: string, props: Record<string, any>) {
  const previousProps = useRef<Record<string, any>>();

  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps: Record<string, any> = {};

      allKeys.forEach(key => {
        if (previousProps.current![key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current![key],
            to: props[key]
          };
        }
      });

      if (Object.keys(changedProps).length > 0) {
        console.log(`🔍 [${name}] Props changed:`, changedProps);
      }
    }

    previousProps.current = props;
  });
}

/**
 * Hook to measure effect performance
 */
export function useEffectPerformance(effectName: string, deps: any[]) {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      if (duration > 100) {
        console.warn(`⚠️ Long-running effect "${effectName}": ${duration.toFixed(2)}ms`);
      }
    };
  }, deps);
}

export default usePerformanceProfiler;