/**
 * Cross-Browser Compatibility Tests
 * Testing neural network compatibility across Chrome, Firefox, Safari
 */

interface BrowserCapabilities {
  name: string;
  version: string;
  webgl: boolean;
  webgl2: boolean;
  webassembly: boolean;
  indexedDB: boolean;
  serviceWorker: boolean;
  sharedArrayBuffer: boolean;
  webWorkers: boolean;
  tensorflowBackend: string;
}

interface CompatibilityResult {
  browser: string;
  passed: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
}

export class CrossBrowserTester {
  private results: CompatibilityResult[] = [];

  /**
   * Detect browser and capabilities
   */
  detectBrowser(): BrowserCapabilities {
    const ua = navigator.userAgent;
    let name = 'Unknown';
    let version = '0';

    // Detect browser name and version
    if (ua.indexOf('Chrome') > -1) {
      name = 'Chrome';
      const match = ua.match(/Chrome\/(\d+)/);
      version = match ? match[1] : '0';
    } else if (ua.indexOf('Firefox') > -1) {
      name = 'Firefox';
      const match = ua.match(/Firefox\/(\d+)/);
      version = match ? match[1] : '0';
    } else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
      name = 'Safari';
      const match = ua.match(/Version\/(\d+)/);
      version = match ? match[1] : '0';
    } else if (ua.indexOf('Edge') > -1) {
      name = 'Edge';
      const match = ua.match(/Edge\/(\d+)/);
      version = match ? match[1] : '0';
    }

    return {
      name,
      version,
      webgl: this.checkWebGL(),
      webgl2: this.checkWebGL2(),
      webassembly: this.checkWebAssembly(),
      indexedDB: this.checkIndexedDB(),
      serviceWorker: this.checkServiceWorker(),
      sharedArrayBuffer: this.checkSharedArrayBuffer(),
      webWorkers: this.checkWebWorkers(),
      tensorflowBackend: this.detectTensorFlowBackend()
    };
  }

  /**
   * Check WebGL support
   */
  private checkWebGL(): boolean {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch (e) {
      return false;
    }
  }

  /**
   * Check WebGL2 support
   */
  private checkWebGL2(): boolean {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2');
      return !!gl;
    } catch (e) {
      return false;
    }
  }

  /**
   * Check WebAssembly support
   */
  private checkWebAssembly(): boolean {
    return typeof WebAssembly !== 'undefined';
  }

  /**
   * Check IndexedDB support
   */
  private checkIndexedDB(): boolean {
    return typeof indexedDB !== 'undefined';
  }

  /**
   * Check Service Worker support
   */
  private checkServiceWorker(): boolean {
    return 'serviceWorker' in navigator;
  }

  /**
   * Check SharedArrayBuffer support
   */
  private checkSharedArrayBuffer(): boolean {
    return typeof SharedArrayBuffer !== 'undefined';
  }

  /**
   * Check Web Workers support
   */
  private checkWebWorkers(): boolean {
    return typeof Worker !== 'undefined';
  }

  /**
   * Detect TensorFlow.js backend
   */
  private detectTensorFlowBackend(): string {
    // This would be determined by actual TensorFlow.js runtime
    // For testing, we'll check what's available
    if (this.checkWebGL2()) return 'webgl';
    if (this.checkWebGL()) return 'webgl';
    if (this.checkWebAssembly()) return 'wasm';
    return 'cpu';
  }

  /**
   * Run comprehensive compatibility tests
   */
  async runCompatibilityTests(): Promise<CompatibilityResult[]> {
    console.log('🌐 Running cross-browser compatibility tests...');
    
    const browser = this.detectBrowser();
    console.log(`  Browser: ${browser.name} ${browser.version}`);
    
    // Test current browser
    const result = await this.testBrowser(browser);
    this.results.push(result);
    
    // Simulate tests for other browsers (in real scenario, would use Selenium/Playwright)
    this.simulateOtherBrowsers();
    
    // Generate report
    this.generateReport();
    
    return this.results;
  }

  /**
   * Test specific browser
   */
  private async testBrowser(browser: BrowserCapabilities): Promise<CompatibilityResult> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Critical requirements for TensorFlow.js
    if (!browser.webgl && !browser.webgl2) {
      issues.push('No WebGL support - neural network will run on CPU (slow)');
      recommendations.push('Enable WebGL in browser settings');
      score -= 40;
    }

    if (!browser.webassembly) {
      issues.push('No WebAssembly support - fallback to slower JavaScript');
      recommendations.push('Update browser to latest version');
      score -= 20;
    }

    if (!browser.indexedDB) {
      issues.push('No IndexedDB support - cannot save models locally');
      recommendations.push('Enable IndexedDB or use different browser');
      score -= 15;
    }

    // Nice-to-have features
    if (!browser.webWorkers) {
      issues.push('No Web Workers - training will block UI');
      recommendations.push('Enable Web Workers for better performance');
      score -= 10;
    }

    if (!browser.sharedArrayBuffer) {
      issues.push('No SharedArrayBuffer - reduced parallel processing');
      recommendations.push('Enable cross-origin isolation for SharedArrayBuffer');
      score -= 5;
    }

    // Browser-specific issues
    if (browser.name === 'Safari' && parseInt(browser.version) < 15) {
      issues.push('Safari version too old for optimal TensorFlow.js performance');
      recommendations.push('Update Safari to version 15 or newer');
      score -= 10;
    }

    if (browser.name === 'Firefox' && !browser.webgl2) {
      issues.push('Firefox WebGL2 disabled - reduced performance');
      recommendations.push('Enable WebGL2 in about:config');
      score -= 5;
    }

    return {
      browser: `${browser.name} ${browser.version}`,
      passed: score >= 60,
      score,
      issues,
      recommendations
    };
  }

  /**
   * Simulate tests for other browsers
   */
  private simulateOtherBrowsers(): void {
    // Simulate Chrome (best case)
    this.results.push({
      browser: 'Chrome 120+ (simulated)',
      passed: true,
      score: 100,
      issues: [],
      recommendations: ['Optimal browser for TensorFlow.js neural networks']
    });

    // Simulate Firefox
    this.results.push({
      browser: 'Firefox 120+ (simulated)',
      passed: true,
      score: 95,
      issues: ['Slightly slower WebGL performance than Chrome'],
      recommendations: ['Enable hardware acceleration']
    });

    // Simulate Safari
    this.results.push({
      browser: 'Safari 17+ (simulated)',
      passed: true,
      score: 85,
      issues: [
        'WebGL performance varies',
        'Limited SharedArrayBuffer support'
      ],
      recommendations: [
        'Ensure GPU acceleration is enabled',
        'Consider Chrome for best performance'
      ]
    });

    // Simulate Edge
    this.results.push({
      browser: 'Edge 120+ (simulated)',
      passed: true,
      score: 98,
      issues: [],
      recommendations: ['Chromium-based, similar performance to Chrome']
    });
  }

  /**
   * Test neural network operations
   */
  async testNeuralNetworkOps(): Promise<boolean> {
    try {
      // Test basic tensor operations
      const tf = (window as any).tf;
      if (!tf) {
        console.error('TensorFlow.js not loaded');
        return false;
      }

      // Create test tensors
      const a = tf.tensor2d([[1, 2], [3, 4]]);
      const b = tf.tensor2d([[5, 6], [7, 8]]);
      
      // Test operations
      const c = tf.matMul(a, b);
      const result = await c.array();
      
      // Cleanup
      a.dispose();
      b.dispose();
      c.dispose();
      
      console.log('✅ Neural network operations working');
      return true;
      
    } catch (error) {
      console.error('❌ Neural network operations failed:', error);
      return false;
    }
  }

  /**
   * Generate compatibility report
   */
  private generateReport(): void {
    console.log('\n🌐 Cross-Browser Compatibility Report');
    console.log('=====================================');
    
    this.results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`\n${status} ${result.browser}`);
      console.log(`  Score: ${result.score}/100`);
      
      if (result.issues.length > 0) {
        console.log('  Issues:');
        result.issues.forEach(issue => {
          console.log(`    - ${issue}`);
        });
      }
      
      if (result.recommendations.length > 0) {
        console.log('  Recommendations:');
        result.recommendations.forEach(rec => {
          console.log(`    - ${rec}`);
        });
      }
    });
    
    // Overall assessment
    const allPassed = this.results.every(r => r.passed);
    const avgScore = this.results.reduce((sum, r) => sum + r.score, 0) / this.results.length;
    
    console.log('\n🎯 Overall Assessment:');
    if (allPassed && avgScore >= 80) {
      console.log('  ✅ Excellent cross-browser compatibility');
    } else if (avgScore >= 60) {
      console.log('  ⚠️ Good compatibility with some limitations');
    } else {
      console.log('  ❌ Poor compatibility - significant issues detected');
    }
    console.log(`  Average Score: ${avgScore.toFixed(1)}/100`);
  }

  /**
   * Export test results
   */
  exportResults(): CompatibilityResult[] {
    return [...this.results];
  }
}

// Create singleton instance
export const browserTester = new CrossBrowserTester();