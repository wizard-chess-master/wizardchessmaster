/**
 * Performance Profiler
 * Comprehensive performance monitoring and optimization system
 */

import { logger } from '../utils/clientLogger';

interface PerformanceMetrics {
  pageLoadTime: number;
  ttfb: number; // Time to First Byte
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  bundleSize: number;
  memoryUsage: number;
  networkRequests: number;
  renderTime: number;
}

export class PerformanceProfiler {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: Map<string, PerformanceObserver> = new Map();
  private startTime: number = Date.now();

  constructor() {
    this.initializeObservers();
    this.measureInitialMetrics();
  }

  private initializeObservers() {
    // Core Web Vitals Observer
    if ('PerformanceObserver' in window) {
      // LCP Observer
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
          logger.debug('Performance', `LCP: ${this.metrics.lcp}ms`);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (e) {
        logger.warn('Performance', 'LCP observer not supported');
      }

      // FID Observer
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const firstEntry = entries[0] as any;
          this.metrics.fid = firstEntry.processingStart - firstEntry.startTime;
          logger.debug('Performance', `FID: ${this.metrics.fid}ms`);
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', fidObserver);
      } catch (e) {
        logger.warn('Performance', 'FID observer not supported');
      }

      // CLS Observer
      try {
        let clsScore = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsScore += (entry as any).value;
            }
          }
          this.metrics.cls = clsScore;
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);
      } catch (e) {
        logger.warn('Performance', 'CLS observer not supported');
      }
    }

    // Resource timing for bundle size analysis
    if ('performance' in window && 'getEntriesByType' in performance) {
      const resources = performance.getEntriesByType('resource');
      const jsSize = resources
        .filter(r => r.name.endsWith('.js'))
        .reduce((acc, r: any) => acc + (r.transferSize || 0), 0);
      const cssSize = resources
        .filter(r => r.name.endsWith('.css'))
        .reduce((acc, r: any) => acc + (r.transferSize || 0), 0);
      
      this.metrics.bundleSize = (jsSize + cssSize) / 1024 / 1024; // Convert to MB
      this.metrics.networkRequests = resources.length;
    }
  }

  private measureInitialMetrics() {
    // Page load metrics
    window.addEventListener('load', () => {
      const navTiming = performance.getEntriesByType('navigation')[0] as any;
      
      if (navTiming) {
        this.metrics.pageLoadTime = navTiming.loadEventEnd - navTiming.fetchStart;
        this.metrics.ttfb = navTiming.responseStart - navTiming.fetchStart;
        this.metrics.fcp = navTiming.domContentLoadedEventEnd - navTiming.fetchStart;
        this.metrics.renderTime = navTiming.domComplete - navTiming.domLoading;
        
        logger.info('Performance', 'Initial metrics captured', {
          pageLoadTime: `${(this.metrics.pageLoadTime / 1000).toFixed(2)}s`,
          ttfb: `${this.metrics.ttfb}ms`,
          fcp: `${this.metrics.fcp}ms`,
          bundleSize: `${this.metrics.bundleSize?.toFixed(2)}MB`
        });
      }
    });

    // Memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
    }
  }

  // Get current performance score
  getPerformanceScore(): { score: number; issues: string[] } {
    const issues: string[] = [];
    let score = 100;

    // Check page load time (target < 3s)
    if (this.metrics.pageLoadTime && this.metrics.pageLoadTime > 3000) {
      const penalty = Math.min(30, Math.floor((this.metrics.pageLoadTime - 3000) / 1000) * 5);
      score -= penalty;
      issues.push(`Page load time: ${(this.metrics.pageLoadTime / 1000).toFixed(2)}s (target: < 3s)`);
    }

    // Check TTFB (target < 600ms)
    if (this.metrics.ttfb && this.metrics.ttfb > 600) {
      score -= 10;
      issues.push(`TTFB: ${this.metrics.ttfb}ms (target: < 600ms)`);
    }

    // Check LCP (target < 2.5s)
    if (this.metrics.lcp && this.metrics.lcp > 2500) {
      score -= 15;
      issues.push(`LCP: ${(this.metrics.lcp / 1000).toFixed(2)}s (target: < 2.5s)`);
    }

    // Check FID (target < 100ms)
    if (this.metrics.fid && this.metrics.fid > 100) {
      score -= 10;
      issues.push(`FID: ${this.metrics.fid}ms (target: < 100ms)`);
    }

    // Check CLS (target < 0.1)
    if (this.metrics.cls && this.metrics.cls > 0.1) {
      score -= 10;
      issues.push(`CLS: ${this.metrics.cls.toFixed(3)} (target: < 0.1)`);
    }

    // Check bundle size (target < 1MB)
    if (this.metrics.bundleSize && this.metrics.bundleSize > 1) {
      const penalty = Math.min(15, Math.floor((this.metrics.bundleSize - 1) * 10));
      score -= penalty;
      issues.push(`Bundle size: ${this.metrics.bundleSize.toFixed(2)}MB (target: < 1MB)`);
    }

    // Check memory usage (warning > 50MB)
    if (this.metrics.memoryUsage && this.metrics.memoryUsage > 50) {
      score -= 5;
      issues.push(`Memory usage: ${this.metrics.memoryUsage.toFixed(2)}MB (warning: > 50MB)`);
    }

    return { score: Math.max(0, score), issues };
  }

  // Get optimization recommendations
  getOptimizations(): string[] {
    const recommendations: string[] = [];
    const { issues } = this.getPerformanceScore();

    if (issues.some(i => i.includes('Page load time'))) {
      recommendations.push('Enable code splitting and lazy loading');
      recommendations.push('Optimize images with WebP format and lazy loading');
      recommendations.push('Implement server-side caching headers');
    }

    if (issues.some(i => i.includes('Bundle size'))) {
      recommendations.push('Tree-shake unused dependencies');
      recommendations.push('Use dynamic imports for large components');
      recommendations.push('Enable gzip/brotli compression');
    }

    if (issues.some(i => i.includes('TTFB'))) {
      recommendations.push('Enable CDN for static assets');
      recommendations.push('Optimize server response time');
      recommendations.push('Implement edge caching');
    }

    if (issues.some(i => i.includes('LCP'))) {
      recommendations.push('Preload critical resources');
      recommendations.push('Optimize largest content element');
      recommendations.push('Reduce render-blocking resources');
    }

    if (issues.some(i => i.includes('Memory usage'))) {
      recommendations.push('Clean up event listeners and timers');
      recommendations.push('Implement virtual scrolling for long lists');
      recommendations.push('Optimize React re-renders');
    }

    return recommendations;
  }

  // Export detailed report
  exportReport(): any {
    return {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      score: this.getPerformanceScore(),
      recommendations: this.getOptimizations(),
      environment: {
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        connection: (navigator as any).connection?.effectiveType || 'unknown'
      }
    };
  }

  // Cleanup observers
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Singleton instance
export const performanceProfiler = new PerformanceProfiler();

// Auto-report critical issues
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const { score, issues } = performanceProfiler.getPerformanceScore();
      if (score < 70) {
        logger.warn('Performance', `Low performance score: ${score}/100`, issues);
      }
    }, 5000);
  });
}