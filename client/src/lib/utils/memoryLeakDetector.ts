/**
 * Memory Leak Detection and Prevention
 * Monitors memory usage and detects potential leaks
 */

interface MemorySnapshot {
  timestamp: number;
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  label?: string;
}

interface LeakReport {
  detected: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  snapshots: MemorySnapshot[];
  recommendations: string[];
}

export class MemoryLeakDetector {
  private snapshots: MemorySnapshot[] = [];
  private maxSnapshots = 100;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private listeners: Set<() => void> = new Set();
  private audioContexts: Set<AudioContext> = new Set();
  private webSockets: Set<WebSocket> = new Set();
  private intervals: Set<NodeJS.Timeout> = new Set();
  private rafHandles: Set<number> = new Set();
  
  // Thresholds
  private readonly HEAP_GROWTH_THRESHOLD = 50 * 1024 * 1024; // 50MB
  private readonly HEAP_LIMIT_WARNING = 0.8; // 80% of heap limit
  private readonly MONITORING_INTERVAL = 5000; // 5 seconds

  constructor() {
    // Check if performance.memory is available (Chrome only)
    if (!this.isMemoryAPIAvailable()) {
      console.warn('⚠️ Memory API not available. Memory leak detection disabled.');
    }
  }

  private isMemoryAPIAvailable(): boolean {
    return typeof performance !== 'undefined' && 
           'memory' in performance &&
           performance.memory !== undefined;
  }

  /**
   * Start monitoring memory usage
   */
  startMonitoring(interval: number = this.MONITORING_INTERVAL): void {
    if (!this.isMemoryAPIAvailable()) return;
    
    if (this.monitoringInterval) {
      this.stopMonitoring();
    }

    console.log('🔍 Starting memory leak monitoring...');
    
    this.monitoringInterval = setInterval(() => {
      this.takeSnapshot();
      this.analyzeMemoryTrend();
    }, interval);

    // Take initial snapshot
    this.takeSnapshot('Initial');
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('🛑 Memory monitoring stopped');
    }
  }

  /**
   * Take a memory snapshot
   */
  takeSnapshot(label?: string): MemorySnapshot | null {
    if (!this.isMemoryAPIAvailable()) return null;

    const memory = (performance as any).memory;
    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      label
    };

    this.snapshots.push(snapshot);

    // Trim old snapshots
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }

    return snapshot;
  }

  /**
   * Analyze memory trend for potential leaks
   */
  private analyzeMemoryTrend(): LeakReport | null {
    if (this.snapshots.length < 10) return null;

    const recent = this.snapshots.slice(-10);
    const first = recent[0];
    const last = recent[recent.length - 1];
    
    const heapGrowth = last.usedJSHeapSize - first.usedJSHeapSize;
    const heapUsageRatio = last.usedJSHeapSize / last.jsHeapSizeLimit;
    
    const recommendations: string[] = [];
    let severity: LeakReport['severity'] = 'low';
    let detected = false;
    let message = 'Memory usage is normal';

    // Check for continuous growth
    if (heapGrowth > this.HEAP_GROWTH_THRESHOLD) {
      detected = true;
      severity = 'high';
      message = `Memory increased by ${(heapGrowth / 1024 / 1024).toFixed(2)}MB in last ${recent.length} samples`;
      recommendations.push('Check for unreleased event listeners');
      recommendations.push('Review setTimeout/setInterval cleanup');
      recommendations.push('Verify React component unmounting');
    }

    // Check if approaching heap limit
    if (heapUsageRatio > this.HEAP_LIMIT_WARNING) {
      detected = true;
      severity = 'critical';
      message = `Memory usage at ${(heapUsageRatio * 100).toFixed(1)}% of limit`;
      recommendations.push('Immediate action required to prevent crash');
      recommendations.push('Clear caches and unused data');
      recommendations.push('Consider page reload');
    }

    // Check for monotonic increase
    const isMonotonic = recent.every((snapshot, i) => 
      i === 0 || snapshot.usedJSHeapSize >= recent[i - 1].usedJSHeapSize
    );
    
    if (isMonotonic && heapGrowth > 10 * 1024 * 1024) {
      detected = true;
      severity = severity === 'low' ? 'medium' : severity;
      message = 'Continuous memory growth detected';
      recommendations.push('Memory is not being garbage collected');
      recommendations.push('Check for circular references');
    }

    if (detected) {
      const report: LeakReport = {
        detected,
        severity,
        message,
        snapshots: recent,
        recommendations
      };
      
      this.logLeakReport(report);
      return report;
    }

    return null;
  }

  /**
   * Log leak report
   */
  private logLeakReport(report: LeakReport): void {
    const icon = report.severity === 'critical' ? '🚨' : 
                 report.severity === 'high' ? '⚠️' : 
                 report.severity === 'medium' ? '⚡' : 'ℹ️';
    
    console.group(`${icon} Memory Leak Detection - ${report.severity.toUpperCase()}`);
    console.warn(report.message);
    console.log('Recommendations:', report.recommendations);
    console.log('Memory trend:', report.snapshots.map(s => 
      `${(s.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`
    ).join(' → '));
    console.groupEnd();
  }

  /**
   * Register resource for tracking
   */
  registerResource(resource: any, type: 'audio' | 'websocket' | 'interval' | 'raf'): void {
    switch (type) {
      case 'audio':
        if (resource instanceof AudioContext) {
          this.audioContexts.add(resource);
        }
        break;
      case 'websocket':
        if (resource instanceof WebSocket) {
          this.webSockets.add(resource);
        }
        break;
      case 'interval':
        this.intervals.add(resource);
        break;
      case 'raf':
        this.rafHandles.add(resource);
        break;
    }
  }

  /**
   * Cleanup tracked resources
   */
  cleanupResources(): void {
    console.log('🧹 Cleaning up tracked resources...');
    
    // Cleanup AudioContexts
    this.audioContexts.forEach(ctx => {
      if (ctx.state !== 'closed') {
        ctx.close().catch(err => console.error('Failed to close AudioContext:', err));
      }
    });
    this.audioContexts.clear();

    // Cleanup WebSockets
    this.webSockets.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    });
    this.webSockets.clear();

    // Clear intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();

    // Cancel animation frames
    this.rafHandles.forEach(handle => cancelAnimationFrame(handle));
    this.rafHandles.clear();

    // Clear listeners
    this.listeners.clear();

    console.log('✅ Resource cleanup complete');
  }

  /**
   * Force garbage collection (if available in development)
   */
  forceGarbageCollection(): void {
    if ((window as any).gc) {
      console.log('🗑️ Forcing garbage collection...');
      (window as any).gc();
      setTimeout(() => {
        this.takeSnapshot('After GC');
      }, 100);
    } else {
      console.log('ℹ️ Garbage collection not available. Run Chrome with --expose-gc flag');
    }
  }

  /**
   * Get memory status
   */
  getMemoryStatus(): {
    current: number;
    limit: number;
    percentage: number;
    trend: 'stable' | 'increasing' | 'decreasing';
  } | null {
    if (!this.isMemoryAPIAvailable()) return null;

    const memory = (performance as any).memory;
    const current = memory.usedJSHeapSize;
    const limit = memory.jsHeapSizeLimit;
    const percentage = (current / limit) * 100;

    let trend: 'stable' | 'increasing' | 'decreasing' = 'stable';
    if (this.snapshots.length >= 2) {
      const recent = this.snapshots.slice(-5);
      const avgDiff = recent.reduce((sum, s, i) => {
        if (i === 0) return 0;
        return sum + (s.usedJSHeapSize - recent[i - 1].usedJSHeapSize);
      }, 0) / (recent.length - 1);

      if (avgDiff > 1024 * 1024) trend = 'increasing';
      else if (avgDiff < -1024 * 1024) trend = 'decreasing';
    }

    return { current, limit, percentage, trend };
  }

  /**
   * Generate heap dump (Chrome DevTools Protocol)
   */
  async generateHeapDump(): Promise<void> {
    console.log('📸 Generating heap snapshot...');
    console.log('To take a heap snapshot:');
    console.log('1. Open Chrome DevTools (F12)');
    console.log('2. Go to Memory tab');
    console.log('3. Click "Take snapshot"');
    console.log('4. Analyze objects and retainers');
  }

  /**
   * Get report of potential leak sources
   */
  getPotentialLeakSources(): string[] {
    const sources: string[] = [];

    // Check for active resources
    if (this.audioContexts.size > 0) {
      sources.push(`${this.audioContexts.size} active AudioContext(s)`);
    }
    if (this.webSockets.size > 0) {
      sources.push(`${this.webSockets.size} active WebSocket(s)`);
    }
    if (this.intervals.size > 0) {
      sources.push(`${this.intervals.size} active interval(s)`);
    }
    if (this.rafHandles.size > 0) {
      sources.push(`${this.rafHandles.size} active animation frame(s)`);
    }

    // Check DOM
    const nodeCount = document.getElementsByTagName('*').length;
    if (nodeCount > 10000) {
      sources.push(`High DOM node count: ${nodeCount}`);
    }

    // Check event listeners (approximation)
    const listeners = (window as any).getEventListeners;
    if (listeners) {
      const count = Object.keys(listeners(window)).reduce((sum, key) => 
        sum + listeners(window)[key].length, 0
      );
      if (count > 100) {
        sources.push(`High window event listener count: ${count}`);
      }
    }

    return sources;
  }
}

// Singleton instance
export const memoryLeakDetector = new MemoryLeakDetector();

// Auto-start in development
if (process.env.NODE_ENV === 'development') {
  memoryLeakDetector.startMonitoring();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  memoryLeakDetector.cleanupResources();
  memoryLeakDetector.stopMonitoring();
});

export default memoryLeakDetector;