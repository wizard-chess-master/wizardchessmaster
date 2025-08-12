/**
 * Browser Compatibility Detection and Testing
 * Comprehensive browser feature detection and compatibility checks
 */

interface BrowserInfo {
  name: string;
  version: string;
  engine: string;
  platform: string;
  mobile: boolean;
  features: BrowserFeatures;
  issues: CompatibilityIssue[];
}

interface BrowserFeatures {
  webGL: boolean;
  webGL2: boolean;
  webAudio: boolean;
  webRTC: boolean;
  webWorkers: boolean;
  serviceWorkers: boolean;
  indexedDB: boolean;
  localStorage: boolean;
  sessionStorage: boolean;
  cookies: boolean;
  webSockets: boolean;
  fetch: boolean;
  promises: boolean;
  asyncAwait: boolean;
  cssGrid: boolean;
  cssFlexbox: boolean;
  cssVariables: boolean;
  cssTransforms: boolean;
  cssTransitions: boolean;
  cssAnimations: boolean;
  svgSupport: boolean;
  canvasSupport: boolean;
  audioContext: boolean;
  mediaDevices: boolean;
  geolocation: boolean;
  notifications: boolean;
  vibration: boolean;
  batteryAPI: boolean;
  performanceAPI: boolean;
  intersectionObserver: boolean;
  mutationObserver: boolean;
  resizeObserver: boolean;
}

interface CompatibilityIssue {
  severity: 'critical' | 'warning' | 'info';
  feature: string;
  description: string;
  workaround?: string;
}

export class BrowserCompatibilityChecker {
  private browserInfo: BrowserInfo | null = null;
  private compatibilityScore: number = 0;

  /**
   * Initialize and detect browser
   */
  async initialize(): Promise<BrowserInfo> {
    this.browserInfo = await this.detectBrowser();
    this.compatibilityScore = this.calculateCompatibilityScore();
    this.applyBrowserSpecificFixes();
    return this.browserInfo;
  }

  /**
   * Detect browser and its capabilities
   */
  private async detectBrowser(): Promise<BrowserInfo> {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    
    // Detect browser name and version
    const browserDetails = this.parseBrowserDetails(userAgent);
    
    // Detect features
    const features = this.detectFeatures();
    
    // Detect issues
    const issues = this.detectIssues(browserDetails, features);
    
    return {
      name: browserDetails.name,
      version: browserDetails.version,
      engine: browserDetails.engine,
      platform,
      mobile: this.isMobile(),
      features,
      issues
    };
  }

  /**
   * Parse browser details from user agent
   */
  private parseBrowserDetails(userAgent: string): { name: string; version: string; engine: string } {
    let name = 'Unknown';
    let version = '0';
    let engine = 'Unknown';

    // Chrome
    if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Edg') === -1) {
      name = 'Chrome';
      version = this.extractVersion(userAgent, 'Chrome/');
      engine = 'Blink';
    }
    // Edge (Chromium)
    else if (userAgent.indexOf('Edg') > -1) {
      name = 'Edge';
      version = this.extractVersion(userAgent, 'Edg/');
      engine = 'Blink';
    }
    // Firefox
    else if (userAgent.indexOf('Firefox') > -1) {
      name = 'Firefox';
      version = this.extractVersion(userAgent, 'Firefox/');
      engine = 'Gecko';
    }
    // Safari
    else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
      name = 'Safari';
      version = this.extractVersion(userAgent, 'Version/');
      engine = 'WebKit';
    }
    // Opera
    else if (userAgent.indexOf('OPR') > -1 || userAgent.indexOf('Opera') > -1) {
      name = 'Opera';
      version = this.extractVersion(userAgent, userAgent.indexOf('OPR') > -1 ? 'OPR/' : 'Opera/');
      engine = 'Blink';
    }

    return { name, version, engine };
  }

  /**
   * Extract version number from user agent
   */
  private extractVersion(userAgent: string, searchString: string): string {
    const index = userAgent.indexOf(searchString);
    if (index === -1) return '0';
    
    const version = userAgent.substring(index + searchString.length);
    const endIndex = version.search(/[\s;)]/);
    
    return endIndex === -1 ? version : version.substring(0, endIndex);
  }

  /**
   * Check if mobile device
   */
  private isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Detect browser features
   */
  private detectFeatures(): BrowserFeatures {
    return {
      webGL: this.checkWebGL(),
      webGL2: this.checkWebGL2(),
      webAudio: this.checkWebAudio(),
      webRTC: this.checkWebRTC(),
      webWorkers: typeof Worker !== 'undefined',
      serviceWorkers: 'serviceWorker' in navigator,
      indexedDB: 'indexedDB' in window,
      localStorage: this.checkLocalStorage(),
      sessionStorage: this.checkSessionStorage(),
      cookies: navigator.cookieEnabled,
      webSockets: 'WebSocket' in window,
      fetch: 'fetch' in window,
      promises: typeof Promise !== 'undefined',
      asyncAwait: this.checkAsyncAwait(),
      cssGrid: this.checkCSSFeature('grid'),
      cssFlexbox: this.checkCSSFeature('flex'),
      cssVariables: this.checkCSSVariables(),
      cssTransforms: this.checkCSSFeature('transform'),
      cssTransitions: this.checkCSSFeature('transition'),
      cssAnimations: this.checkCSSFeature('animation'),
      svgSupport: this.checkSVGSupport(),
      canvasSupport: this.checkCanvasSupport(),
      audioContext: this.checkAudioContext(),
      mediaDevices: 'mediaDevices' in navigator,
      geolocation: 'geolocation' in navigator,
      notifications: 'Notification' in window,
      vibration: 'vibrate' in navigator,
      batteryAPI: 'getBattery' in navigator,
      performanceAPI: 'performance' in window,
      intersectionObserver: 'IntersectionObserver' in window,
      mutationObserver: 'MutationObserver' in window,
      resizeObserver: 'ResizeObserver' in window
    };
  }

  /**
   * Check WebGL support
   */
  private checkWebGL(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
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
      return !!canvas.getContext('webgl2');
    } catch (e) {
      return false;
    }
  }

  /**
   * Check Web Audio API support
   */
  private checkWebAudio(): boolean {
    return typeof (window as any).AudioContext !== 'undefined' || 
           typeof (window as any).webkitAudioContext !== 'undefined';
  }

  /**
   * Check WebRTC support
   */
  private checkWebRTC(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  /**
   * Check localStorage support
   */
  private checkLocalStorage(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Check sessionStorage support
   */
  private checkSessionStorage(): boolean {
    try {
      const test = '__sessionStorage_test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Check async/await support
   */
  private checkAsyncAwait(): boolean {
    try {
      new Function('async () => {}');
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Check CSS feature support
   */
  private checkCSSFeature(property: string): boolean {
    const element = document.createElement('div');
    const style = element.style as any;
    
    // Check unprefixed
    if (property in style) return true;
    
    // Check with vendor prefixes
    const prefixes = ['webkit', 'moz', 'ms', 'o'];
    const capitalizedProperty = property.charAt(0).toUpperCase() + property.slice(1);
    
    for (const prefix of prefixes) {
      if (prefix + capitalizedProperty in style) return true;
    }
    
    return false;
  }

  /**
   * Check CSS Variables support
   */
  private checkCSSVariables(): boolean {
    return CSS && CSS.supports && CSS.supports('--test-var', '0');
  }

  /**
   * Check SVG support
   */
  private checkSVGSupport(): boolean {
    return document.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1');
  }

  /**
   * Check Canvas support
   */
  private checkCanvasSupport(): boolean {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext && canvas.getContext('2d'));
  }

  /**
   * Check AudioContext support
   */
  private checkAudioContext(): boolean {
    return typeof (window as any).AudioContext !== 'undefined' || 
           typeof (window as any).webkitAudioContext !== 'undefined';
  }

  /**
   * Detect compatibility issues
   */
  private detectIssues(browserDetails: any, features: BrowserFeatures): CompatibilityIssue[] {
    const issues: CompatibilityIssue[] = [];

    // Critical features for the game
    if (!features.webSockets) {
      issues.push({
        severity: 'critical',
        feature: 'WebSockets',
        description: 'WebSockets not supported. Multiplayer features will not work.',
        workaround: 'Upgrade to a modern browser'
      });
    }

    if (!features.localStorage) {
      issues.push({
        severity: 'critical',
        feature: 'localStorage',
        description: 'localStorage not supported. Game progress cannot be saved.',
        workaround: 'Enable cookies and local storage in browser settings'
      });
    }

    if (!features.canvasSupport) {
      issues.push({
        severity: 'critical',
        feature: 'Canvas',
        description: 'Canvas not supported. Chess board rendering will fail.',
        workaround: 'Upgrade to a modern browser'
      });
    }

    // Warning level issues
    if (!features.webAudio) {
      issues.push({
        severity: 'warning',
        feature: 'Web Audio',
        description: 'Web Audio API not supported. Sound effects may not work properly.',
        workaround: 'Sound will use fallback HTML5 audio'
      });
    }

    if (!features.cssGrid) {
      issues.push({
        severity: 'warning',
        feature: 'CSS Grid',
        description: 'CSS Grid not supported. Layout may appear different.',
        workaround: 'Using flexbox fallback'
      });
    }

    // Safari specific issues
    if (browserDetails.name === 'Safari') {
      const version = parseFloat(browserDetails.version);
      if (version < 14) {
        issues.push({
          severity: 'warning',
          feature: 'Safari Version',
          description: 'Older Safari version detected. Some features may not work optimally.',
          workaround: 'Update Safari to version 14 or newer'
        });
      }
    }

    // Mobile specific warnings
    if (this.isMobile()) {
      issues.push({
        severity: 'info',
        feature: 'Mobile Device',
        description: 'Mobile device detected. Touch controls enabled.',
        workaround: 'Game optimized for mobile play'
      });
    }

    // Performance API warning
    if (!features.performanceAPI) {
      issues.push({
        severity: 'info',
        feature: 'Performance API',
        description: 'Performance monitoring limited.',
        workaround: 'Basic timing will be used'
      });
    }

    return issues;
  }

  /**
   * Calculate compatibility score
   */
  private calculateCompatibilityScore(): number {
    if (!this.browserInfo) return 0;

    const features = this.browserInfo.features;
    const criticalFeatures = [
      features.webSockets,
      features.localStorage,
      features.canvasSupport,
      features.promises,
      features.fetch
    ];

    const importantFeatures = [
      features.webAudio,
      features.cssGrid,
      features.cssFlexbox,
      features.cssVariables,
      features.performanceAPI
    ];

    const criticalScore = criticalFeatures.filter(f => f).length / criticalFeatures.length * 60;
    const importantScore = importantFeatures.filter(f => f).length / importantFeatures.length * 40;

    return Math.round(criticalScore + importantScore);
  }

  /**
   * Apply browser-specific fixes
   */
  private applyBrowserSpecificFixes(): void {
    if (!this.browserInfo) return;

    // Safari fixes
    if (this.browserInfo.name === 'Safari') {
      this.applySafariFixes();
    }

    // Firefox fixes
    if (this.browserInfo.name === 'Firefox') {
      this.applyFirefoxFixes();
    }

    // Mobile fixes
    if (this.browserInfo.mobile) {
      this.applyMobileFixes();
    }

    // Apply polyfills
    this.applyPolyfills();
  }

  /**
   * Apply Safari-specific fixes
   */
  private applySafariFixes(): void {
    // Fix for Safari audio context
    if (typeof (window as any).webkitAudioContext !== 'undefined' && 
        typeof (window as any).AudioContext === 'undefined') {
      (window as any).AudioContext = (window as any).webkitAudioContext;
    }

    // Fix for Safari date parsing
    if (!Date.prototype.toISOString) {
      console.log('Applying Safari date fix');
    }
  }

  /**
   * Apply Firefox-specific fixes
   */
  private applyFirefoxFixes(): void {
    // Firefox-specific adjustments
    console.log('Firefox detected, applying compatibility adjustments');
  }

  /**
   * Apply mobile-specific fixes
   */
  private applyMobileFixes(): void {
    // Prevent zoom on double tap
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);

    // Add viewport meta if not present
    if (!document.querySelector('meta[name="viewport"]')) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(meta);
    }
  }

  /**
   * Apply necessary polyfills
   */
  private applyPolyfills(): void {
    // Array.from polyfill
    if (!Array.from) {
      Array.from = function(arrayLike: any) {
        return Array.prototype.slice.call(arrayLike);
      };
    }

    // Object.assign polyfill
    if (!Object.assign) {
      Object.assign = function(target: any, ...sources: any[]) {
        sources.forEach(source => {
          if (source) {
            Object.keys(source).forEach(key => {
              target[key] = source[key];
            });
          }
        });
        return target;
      };
    }

    // Promise polyfill check (would need external library)
    if (!window.Promise) {
      console.warn('Promise not supported, consider adding a polyfill');
    }
  }

  /**
   * Get browser info
   */
  getBrowserInfo(): BrowserInfo | null {
    return this.browserInfo;
  }

  /**
   * Get compatibility score
   */
  getCompatibilityScore(): number {
    return this.compatibilityScore;
  }

  /**
   * Check if browser is supported
   */
  isSupported(): boolean {
    if (!this.browserInfo) return false;
    
    // Check for critical issues
    const criticalIssues = this.browserInfo.issues.filter(i => i.severity === 'critical');
    return criticalIssues.length === 0;
  }

  /**
   * Get compatibility report
   */
  getReport(): string {
    if (!this.browserInfo) return 'Browser not detected';

    const { name, version, engine, platform, mobile, features, issues } = this.browserInfo;
    
    let report = `
=== Browser Compatibility Report ===
Browser: ${name} ${version}
Engine: ${engine}
Platform: ${platform}
Mobile: ${mobile ? 'Yes' : 'No'}
Compatibility Score: ${this.compatibilityScore}%

Critical Features:
- WebSockets: ${features.webSockets ? '✅' : '❌'}
- Local Storage: ${features.localStorage ? '✅' : '❌'}
- Canvas: ${features.canvasSupport ? '✅' : '❌'}
- Promises: ${features.promises ? '✅' : '❌'}
- Fetch API: ${features.fetch ? '✅' : '❌'}

Audio/Visual:
- Web Audio: ${features.webAudio ? '✅' : '❌'}
- WebGL: ${features.webGL ? '✅' : '❌'}
- CSS Grid: ${features.cssGrid ? '✅' : '❌'}
- CSS Variables: ${features.cssVariables ? '✅' : '❌'}

Issues Found:
`;

    if (issues.length === 0) {
      report += 'No compatibility issues detected!\n';
    } else {
      issues.forEach(issue => {
        const icon = issue.severity === 'critical' ? '🔴' : 
                     issue.severity === 'warning' ? '🟡' : '🔵';
        report += `${icon} [${issue.severity.toUpperCase()}] ${issue.feature}: ${issue.description}\n`;
        if (issue.workaround) {
          report += `   Workaround: ${issue.workaround}\n`;
        }
      });
    }

    return report;
  }

  /**
   * Test specific feature
   */
  testFeature(featureName: keyof BrowserFeatures): boolean {
    if (!this.browserInfo) return false;
    return this.browserInfo.features[featureName];
  }

  /**
   * Get CSS prefix for current browser
   */
  getCSSPrefix(): string {
    if (!this.browserInfo) return '';
    
    switch (this.browserInfo.engine) {
      case 'Blink':
      case 'WebKit':
        return '-webkit-';
      case 'Gecko':
        return '-moz-';
      default:
        return '';
    }
  }

  /**
   * Get recommended browser message
   */
  getRecommendation(): string {
    if (!this.browserInfo) return 'Please use a modern browser';
    
    if (this.compatibilityScore >= 90) {
      return 'Your browser is fully compatible!';
    } else if (this.compatibilityScore >= 70) {
      return 'Your browser is mostly compatible. Some features may be limited.';
    } else if (this.compatibilityScore >= 50) {
      return 'Your browser has limited compatibility. Consider upgrading for the best experience.';
    } else {
      return 'Your browser has poor compatibility. Please upgrade to Chrome, Firefox, Safari, or Edge.';
    }
  }
}

// Singleton instance
export const browserCompatibility = new BrowserCompatibilityChecker();

// Initialize on load
if (typeof window !== 'undefined') {
  browserCompatibility.initialize().then(info => {
    console.log('🌐 Browser detected:', info.name, info.version);
    console.log('📊 Compatibility score:', browserCompatibility.getCompatibilityScore() + '%');
    
    const criticalIssues = info.issues.filter(i => i.severity === 'critical');
    if (criticalIssues.length > 0) {
      console.error('⚠️ Critical compatibility issues found:', criticalIssues);
    }
  });
}

export default browserCompatibility;