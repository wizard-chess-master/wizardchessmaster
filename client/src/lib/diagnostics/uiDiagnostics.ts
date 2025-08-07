/**
 * Auto-diagnostic system for identifying UI rendering issues
 */

export interface DiagnosticResult {
  category: 'canvas' | 'layout' | 'performance' | 'accessibility' | 'components';
  severity: 'info' | 'warning' | 'error' | 'critical';
  issue: string;
  description: string;
  suggestion: string;
  element?: HTMLElement | null;
  coordinates?: { x: number; y: number; width: number; height: number };
  timestamp: number;
}

export interface DiagnosticReport {
  timestamp: number;
  totalIssues: number;
  criticalIssues: number;
  errorIssues: number;
  warningIssues: number;
  infoIssues: number;
  results: DiagnosticResult[];
  performance: {
    renderTime: number;
    memoryUsage?: number;
    fps?: number;
  };
}

export class UIDiagnostics {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private lastFrameTime = 0;
  private frameCount = 0;
  private fps = 0;

  constructor() {
    this.initializeCanvas();
  }

  private initializeCanvas() {
    // Find the chess board canvas
    this.canvas = document.querySelector('#chess-canvas') as HTMLCanvasElement;
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }
  }

  /**
   * Run comprehensive UI diagnostics
   */
  async runDiagnostics(level: 'basic' | 'detailed' | 'performance' = 'detailed'): Promise<DiagnosticReport> {
    const startTime = performance.now();
    const results: DiagnosticResult[] = [];

    console.log(`🔍 Running ${level} UI diagnostics...`);

    // Canvas diagnostics
    results.push(...this.checkCanvasRendering());
    
    // Layout diagnostics
    results.push(...this.checkLayoutIssues());
    
    // Component visibility diagnostics
    results.push(...this.checkComponentVisibility());
    
    if (level === 'detailed' || level === 'performance') {
      // Performance diagnostics
      results.push(...this.checkPerformanceIssues());
      
      // Accessibility diagnostics
      results.push(...this.checkAccessibilityIssues());
    }

    if (level === 'performance') {
      // Advanced performance checks
      results.push(...this.checkAdvancedPerformance());
    }

    const endTime = performance.now();
    
    const report: DiagnosticReport = {
      timestamp: Date.now(),
      totalIssues: results.length,
      criticalIssues: results.filter(r => r.severity === 'critical').length,
      errorIssues: results.filter(r => r.severity === 'error').length,
      warningIssues: results.filter(r => r.severity === 'warning').length,
      infoIssues: results.filter(r => r.severity === 'info').length,
      results,
      performance: {
        renderTime: endTime - startTime,
        memoryUsage: this.getMemoryUsage(),
        fps: this.fps
      }
    };

    this.logDiagnosticReport(report);
    return report;
  }

  /**
   * Check canvas rendering issues
   */
  private checkCanvasRendering(): DiagnosticResult[] {
    const results: DiagnosticResult[] = [];
    
    if (!this.canvas) {
      results.push({
        category: 'canvas',
        severity: 'critical',
        issue: 'Canvas Element Missing',
        description: 'Chess board canvas element not found in DOM',
        suggestion: 'Ensure chess board component is properly mounted and canvas has id="chess-canvas"',
        timestamp: Date.now()
      });
      return results;
    }

    // Check canvas dimensions
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      results.push({
        category: 'canvas',
        severity: 'error',
        issue: 'Canvas Has Zero Dimensions',
        description: `Canvas size: ${rect.width}x${rect.height}`,
        suggestion: 'Check CSS sizing and ensure canvas container has proper dimensions',
        element: this.canvas,
        coordinates: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        timestamp: Date.now()
      });
    }

    // Check if canvas is visible
    const isVisible = rect.width > 0 && rect.height > 0 && 
                     getComputedStyle(this.canvas).visibility !== 'hidden' &&
                     getComputedStyle(this.canvas).display !== 'none';
    
    if (!isVisible) {
      results.push({
        category: 'canvas',
        severity: 'error',
        issue: 'Canvas Not Visible',
        description: 'Canvas element is hidden or has zero size',
        suggestion: 'Check CSS properties: display, visibility, width, height',
        element: this.canvas,
        timestamp: Date.now()
      });
    }

    // Check canvas context
    if (!this.ctx) {
      results.push({
        category: 'canvas',
        severity: 'error',
        issue: 'Canvas Context Missing',
        description: 'Unable to get 2D rendering context from canvas',
        suggestion: 'Browser may not support canvas 2D rendering',
        element: this.canvas,
        timestamp: Date.now()
      });
    }

    // Check for proper aspect ratio (10x10 board should be square)
    if (rect.width > 0 && rect.height > 0) {
      const aspectRatio = rect.width / rect.height;
      if (Math.abs(aspectRatio - 1) > 0.1) {
        results.push({
          category: 'canvas',
          severity: 'warning',
          issue: 'Canvas Aspect Ratio Issue',
          description: `Canvas aspect ratio: ${aspectRatio.toFixed(2)} (expected: 1.0 for square board)`,
          suggestion: 'Ensure canvas width and height are equal for proper board rendering',
          element: this.canvas,
          timestamp: Date.now()
        });
      }
    }

    return results;
  }

  /**
   * Check layout and positioning issues
   */
  private checkLayoutIssues(): DiagnosticResult[] {
    const results: DiagnosticResult[] = [];

    // Check for overlapping elements
    const gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
      const children = Array.from(gameContainer.children) as HTMLElement[];
      for (let i = 0; i < children.length; i++) {
        for (let j = i + 1; j < children.length; j++) {
          if (this.elementsOverlap(children[i], children[j])) {
            results.push({
              category: 'layout',
              severity: 'warning',
              issue: 'Overlapping Elements',
              description: `Elements ${children[i].className} and ${children[j].className} overlap`,
              suggestion: 'Adjust CSS positioning or layout to prevent element overlap',
              element: children[i],
              timestamp: Date.now()
            });
          }
        }
      }
    }

    // Check for elements outside viewport
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      if (rect.right < 0 || rect.bottom < 0 || 
          rect.left > window.innerWidth || rect.top > window.innerHeight) {
        if (rect.width > 0 && rect.height > 0) { // Only check visible elements
          results.push({
            category: 'layout',
            severity: 'info',
            issue: 'Element Outside Viewport',
            description: `Element ${element.className} is positioned outside visible area`,
            suggestion: 'Check if element should be visible or adjust positioning',
            element: element as HTMLElement,
            coordinates: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
            timestamp: Date.now()
          });
        }
      }
    });

    // Check z-index conflicts in dialogs
    const dialogs = document.querySelectorAll('[role="dialog"], .dialog');
    dialogs.forEach(dialog => {
      const zIndex = getComputedStyle(dialog as HTMLElement).zIndex;
      if (zIndex === 'auto' || parseInt(zIndex) < 1000) {
        results.push({
          category: 'layout',
          severity: 'warning',
          issue: 'Dialog Z-Index Too Low',
          description: `Dialog has z-index: ${zIndex}, may appear behind other elements`,
          suggestion: 'Set z-index to 1000 or higher for dialogs',
          element: dialog as HTMLElement,
          timestamp: Date.now()
        });
      }
    });

    return results;
  }

  /**
   * Check component visibility and functionality
   */
  private checkComponentVisibility(): DiagnosticResult[] {
    const results: DiagnosticResult[] = [];

    // Essential game components to check
    const essentialComponents = [
      { selector: '#chess-canvas', name: 'Chess Board Canvas' },
      { selector: '.game-ui', name: 'Game UI Panel' },
      { selector: '.current-player', name: 'Current Player Display' },
    ];

    essentialComponents.forEach(({ selector, name }) => {
      const element = document.querySelector(selector) as HTMLElement;
      if (!element) {
        results.push({
          category: 'components',
          severity: 'error',
          issue: `Missing ${name}`,
          description: `Required component "${name}" not found in DOM`,
          suggestion: `Ensure ${name} component is properly rendered`,
          timestamp: Date.now()
        });
      } else {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0 &&
                         getComputedStyle(element).visibility !== 'hidden' &&
                         getComputedStyle(element).display !== 'none';
        
        if (!isVisible) {
          results.push({
            category: 'components',
            severity: 'warning',
            issue: `${name} Not Visible`,
            description: `Component exists but is not visible to users`,
            suggestion: 'Check CSS display, visibility, and sizing properties',
            element,
            timestamp: Date.now()
          });
        }
      }
    });

    // Check for empty or broken buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      if (!button.textContent?.trim() && !button.querySelector('svg, img')) {
        results.push({
          category: 'components',
          severity: 'warning',
          issue: 'Empty Button',
          description: 'Button has no visible text or icon content',
          suggestion: 'Add text content or icon to button',
          element: button,
          timestamp: Date.now()
        });
      }
    });

    return results;
  }

  /**
   * Check performance-related issues
   */
  private checkPerformanceIssues(): DiagnosticResult[] {
    const results: DiagnosticResult[] = [];

    // Check memory usage
    const memoryUsage = this.getMemoryUsage();
    if (memoryUsage && memoryUsage > 100) { // 100MB threshold
      results.push({
        category: 'performance',
        severity: 'warning',
        issue: 'High Memory Usage',
        description: `Memory usage: ${memoryUsage.toFixed(1)}MB`,
        suggestion: 'Monitor for memory leaks in components or canvas rendering',
        timestamp: Date.now()
      });
    }

    // Check for too many DOM elements
    const elementCount = document.querySelectorAll('*').length;
    if (elementCount > 1000) {
      results.push({
        category: 'performance',
        severity: 'warning',
        issue: 'High DOM Element Count',
        description: `DOM contains ${elementCount} elements`,
        suggestion: 'Consider virtualizing large lists or reducing component complexity',
        timestamp: Date.now()
      });
    }

    // Check canvas size vs device pixel ratio
    if (this.canvas) {
      const rect = this.canvas.getBoundingClientRect();
      const devicePixelRatio = window.devicePixelRatio || 1;
      const expectedWidth = rect.width * devicePixelRatio;
      const expectedHeight = rect.height * devicePixelRatio;
      
      if (this.canvas.width !== expectedWidth || this.canvas.height !== expectedHeight) {
        results.push({
          category: 'performance',
          severity: 'info',
          issue: 'Canvas Resolution Mismatch',
          description: `Canvas: ${this.canvas.width}x${this.canvas.height}, Expected: ${expectedWidth}x${expectedHeight}`,
          suggestion: 'Adjust canvas resolution for device pixel ratio for crisp rendering',
          element: this.canvas,
          timestamp: Date.now()
        });
      }
    }

    return results;
  }

  /**
   * Check accessibility issues
   */
  private checkAccessibilityIssues(): DiagnosticResult[] {
    const results: DiagnosticResult[] = [];

    // Check for missing alt text on images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.alt) {
        results.push({
          category: 'accessibility',
          severity: 'warning',
          issue: 'Missing Alt Text',
          description: 'Image missing alternative text for screen readers',
          suggestion: 'Add descriptive alt attribute to image',
          element: img,
          timestamp: Date.now()
        });
      }
    });

    // Check for proper heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let lastLevel = 0;
    headings.forEach(heading => {
      const level = parseInt(heading.tagName.substring(1));
      if (level > lastLevel + 1) {
        results.push({
          category: 'accessibility',
          severity: 'info',
          issue: 'Heading Hierarchy Skip',
          description: `Heading jumps from h${lastLevel} to h${level}`,
          suggestion: 'Use sequential heading levels for proper document structure',
          element: heading as HTMLElement,
          timestamp: Date.now()
        });
      }
      lastLevel = level;
    });

    // Check for buttons without accessible names
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      const hasText = button.textContent?.trim();
      const hasAriaLabel = button.getAttribute('aria-label');
      const hasTitle = button.getAttribute('title');
      
      if (!hasText && !hasAriaLabel && !hasTitle) {
        results.push({
          category: 'accessibility',
          severity: 'warning',
          issue: 'Button Without Accessible Name',
          description: 'Button lacks text, aria-label, or title for screen readers',
          suggestion: 'Add aria-label or title attribute to button',
          element: button,
          timestamp: Date.now()
        });
      }
    });

    return results;
  }

  /**
   * Check advanced performance metrics
   */
  private checkAdvancedPerformance(): DiagnosticResult[] {
    const results: DiagnosticResult[] = [];

    // Check for CSS animations that might impact performance
    const animatedElements = document.querySelectorAll('[style*="animation"], [class*="animate"]');
    if (animatedElements.length > 10) {
      results.push({
        category: 'performance',
        severity: 'info',
        issue: 'Many Animated Elements',
        description: `${animatedElements.length} elements with animations detected`,
        suggestion: 'Consider reducing simultaneous animations for better performance',
        timestamp: Date.now()
      });
    }

    return results;
  }

  /**
   * Utility: Check if two elements overlap
   */
  private elementsOverlap(el1: HTMLElement, el2: HTMLElement): boolean {
    const rect1 = el1.getBoundingClientRect();
    const rect2 = el2.getBoundingClientRect();
    
    return !(rect1.right < rect2.left || 
             rect1.left > rect2.right || 
             rect1.bottom < rect2.top || 
             rect1.top > rect2.bottom);
  }

  /**
   * Get memory usage if available
   */
  private getMemoryUsage(): number | undefined {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
    }
    return undefined;
  }

  /**
   * Log diagnostic report to console
   */
  private logDiagnosticReport(report: DiagnosticReport) {
    console.group('🔍 UI Diagnostics Report');
    console.log(`📊 Summary: ${report.totalIssues} total issues found`);
    console.log(`🔴 Critical: ${report.criticalIssues}, ❌ Errors: ${report.errorIssues}, ⚠️ Warnings: ${report.warningIssues}, ℹ️ Info: ${report.infoIssues}`);
    console.log(`⚡ Performance: ${report.performance.renderTime.toFixed(2)}ms render time, ${report.performance.fps?.toFixed(1) || 'N/A'} FPS`);
    
    if (report.performance.memoryUsage) {
      console.log(`💾 Memory: ${report.performance.memoryUsage.toFixed(1)}MB`);
    }

    if (report.results.length > 0) {
      console.group('📋 Issues Found:');
      report.results.forEach((result, index) => {
        const severity = result.severity === 'critical' ? '🔴' : 
                        result.severity === 'error' ? '❌' : 
                        result.severity === 'warning' ? '⚠️' : 'ℹ️';
        
        console.group(`${severity} ${result.category.toUpperCase()}: ${result.issue}`);
        console.log(`Description: ${result.description}`);
        console.log(`Suggestion: ${result.suggestion}`);
        if (result.element) {
          console.log('Element:', result.element);
        }
        if (result.coordinates) {
          console.log(`Position: ${result.coordinates.x}, ${result.coordinates.y} (${result.coordinates.width}x${result.coordinates.height})`);
        }
        console.groupEnd();
      });
      console.groupEnd();
    } else {
      console.log('✅ No issues detected!');
    }
    
    console.groupEnd();
  }

  /**
   * Monitor FPS
   */
  startFPSMonitoring() {
    const measureFPS = (timestamp: number) => {
      if (this.lastFrameTime) {
        const delta = timestamp - this.lastFrameTime;
        this.fps = 1000 / delta;
      }
      this.lastFrameTime = timestamp;
      this.frameCount++;
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }

  /**
   * Quick health check for critical issues
   */
  quickHealthCheck(): { status: 'healthy' | 'warning' | 'critical'; issues: string[] } {
    const issues: string[] = [];
    
    if (!document.querySelector('#chess-canvas')) {
      issues.push('Chess board canvas missing');
    }
    
    if (!document.querySelector('.game-ui')) {
      issues.push('Game UI not found');
    }
    
    const canvas = document.querySelector('#chess-canvas') as HTMLCanvasElement;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        issues.push('Chess board has zero dimensions');
      }
    }
    
    const criticalIssues = issues.filter(issue => 
      issue.includes('missing') || issue.includes('zero dimensions')
    );
    
    if (criticalIssues.length > 0) {
      return { status: 'critical', issues: criticalIssues };
    } else if (issues.length > 0) {
      return { status: 'warning', issues };
    } else {
      return { status: 'healthy', issues: [] };
    }
  }
}

// Export singleton instance
export const uiDiagnostics = new UIDiagnostics();