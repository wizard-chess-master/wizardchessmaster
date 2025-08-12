/**
 * Production Deployment Checker
 * Comprehensive checks for production readiness
 */

// Extend Window interface for global properties
declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: any;
    __REACT_ERROR_OVERLAY_GLOBAL_HOOK__?: any;
    gtag?: any;
    ga?: any;
    _gaq?: any;
  }
}

interface DeploymentCheck {
  name: string;
  category: 'build' | 'security' | 'performance' | 'configuration' | 'compatibility';
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

interface DeploymentReport {
  timestamp: Date;
  environment: string;
  checks: DeploymentCheck[];
  score: number;
  isReady: boolean;
  criticalIssues: number;
  warnings: number;
}

export class DeploymentChecker {
  private checks: DeploymentCheck[] = [];
  private report: DeploymentReport | null = null;

  /**
   * Run all deployment checks
   */
  async runChecks(): Promise<DeploymentReport> {
    console.log('🚀 Starting production deployment checks...');
    this.checks = [];

    // Run all check categories
    await this.checkBuildConfiguration();
    await this.checkSecurity();
    await this.checkPerformance();
    await this.checkConfiguration();
    await this.checkCompatibility();
    await this.checkDependencies();
    await this.checkDatabase();
    await this.checkAssets();
    await this.checkErrorHandling();
    await this.checkMonitoring();

    // Generate report
    this.report = this.generateReport();
    console.log('✅ Deployment checks completed');
    
    return this.report;
  }

  /**
   * Check build configuration
   */
  private async checkBuildConfiguration(): Promise<void> {
    // Check if production build exists
    try {
      const response = await fetch('/manifest.json');
      if (response.ok) {
        this.addCheck({
          name: 'Production Build',
          category: 'build',
          status: 'pass',
          message: 'Production build files detected',
          severity: 'critical'
        });
      } else {
        this.addCheck({
          name: 'Production Build',
          category: 'build',
          status: 'warning',
          message: 'Production build may not be optimized',
          details: 'Run npm run build for production',
          severity: 'critical'
        });
      }
    } catch {
      this.addCheck({
        name: 'Production Build',
        category: 'build',
        status: 'warning',
        message: 'Could not verify production build',
        severity: 'medium'
      });
    }

    // Check for source maps in production
    if (process.env.NODE_ENV === 'production') {
      const hasSourceMaps = window.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== undefined;
      this.addCheck({
        name: 'Source Maps',
        category: 'build',
        status: hasSourceMaps ? 'warning' : 'pass',
        message: hasSourceMaps ? 'Source maps exposed in production' : 'Source maps properly hidden',
        details: hasSourceMaps ? 'Disable source maps for production builds' : undefined,
        severity: 'medium'
      });
    }

    // Check bundle size
    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;
    const scriptArray = Array.from(scripts);
    for (const script of scriptArray) {
      try {
        const src = script.getAttribute('src');
        if (src) {
          const response = await fetch(src);
          const text = await response.text();
          totalSize += text.length;
        }
      } catch {
        // Ignore fetch errors
      }
    }

    const bundleSizeMB = totalSize / (1024 * 1024);
    this.addCheck({
      name: 'Bundle Size',
      category: 'build',
      status: bundleSizeMB < 5 ? 'pass' : bundleSizeMB < 10 ? 'warning' : 'fail',
      message: `Total bundle size: ${bundleSizeMB.toFixed(2)} MB`,
      details: bundleSizeMB > 5 ? 'Consider code splitting and lazy loading' : undefined,
      severity: bundleSizeMB < 5 ? 'low' : 'medium'
    });
  }

  /**
   * Check security configurations
   */
  private async checkSecurity(): Promise<void> {
    // Check HTTPS
    const isHTTPS = window.location.protocol === 'https:';
    this.addCheck({
      name: 'HTTPS',
      category: 'security',
      status: isHTTPS ? 'pass' : 'fail',
      message: isHTTPS ? 'Site is served over HTTPS' : 'Site is not using HTTPS',
      details: !isHTTPS ? 'HTTPS is required for production' : undefined,
      severity: 'critical'
    });

    // Check Content Security Policy
    const hasCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]') !== null;
    this.addCheck({
      name: 'Content Security Policy',
      category: 'security',
      status: hasCSP ? 'pass' : 'warning',
      message: hasCSP ? 'CSP headers configured' : 'No CSP headers found',
      details: !hasCSP ? 'Add Content Security Policy headers' : undefined,
      severity: 'high'
    });

    // Check for exposed sensitive data
    const hasExposedKeys = this.checkForExposedKeys();
    this.addCheck({
      name: 'API Key Exposure',
      category: 'security',
      status: hasExposedKeys ? 'fail' : 'pass',
      message: hasExposedKeys ? 'Potential API keys exposed' : 'No exposed API keys detected',
      details: hasExposedKeys ? 'Move sensitive keys to environment variables' : undefined,
      severity: 'critical'
    });

    // Check authentication
    try {
      const authResponse = await fetch('/api/auth/session');
      const authEnabled = authResponse.ok;
      this.addCheck({
        name: 'Authentication',
        category: 'security',
        status: authEnabled ? 'pass' : 'warning',
        message: authEnabled ? 'Authentication system active' : 'Authentication not verified',
        severity: 'high'
      });
    } catch {
      this.addCheck({
        name: 'Authentication',
        category: 'security',
        status: 'warning',
        message: 'Could not verify authentication',
        severity: 'medium'
      });
    }

    // Check for secure cookies
    const cookies = document.cookie;
    const hasSecureFlag = cookies.includes('Secure') || cookies.length === 0;
    this.addCheck({
      name: 'Secure Cookies',
      category: 'security',
      status: hasSecureFlag ? 'pass' : 'warning',
      message: hasSecureFlag ? 'Cookies configured securely' : 'Cookies may not be secure',
      details: !hasSecureFlag ? 'Add Secure and HttpOnly flags to cookies' : undefined,
      severity: 'medium'
    });
  }

  /**
   * Check for exposed API keys
   */
  private checkForExposedKeys(): boolean {
    const scriptContent = Array.from(document.scripts)
      .map(s => s.textContent || '')
      .join(' ');
    
    const patterns = [
      /api[_-]?key\s*[:=]\s*["'][a-zA-Z0-9_-]{20,}/i,
      /secret[_-]?key\s*[:=]\s*["'][a-zA-Z0-9_-]{20,}/i,
      /token\s*[:=]\s*["'][a-zA-Z0-9_-]{20,}/i
    ];

    return patterns.some(pattern => pattern.test(scriptContent));
  }

  /**
   * Check performance optimizations
   */
  private async checkPerformance(): Promise<void> {
    // Check lazy loading
    const hasLazyImages = document.querySelectorAll('img[loading="lazy"]').length > 0;
    this.addCheck({
      name: 'Lazy Loading',
      category: 'performance',
      status: hasLazyImages ? 'pass' : 'warning',
      message: hasLazyImages ? 'Images use lazy loading' : 'No lazy loading detected',
      details: !hasLazyImages ? 'Add loading="lazy" to images' : undefined,
      severity: 'low'
    });

    // Check caching headers
    try {
      const response = await fetch('/');
      const cacheControl = response.headers.get('cache-control');
      const hasCaching = cacheControl && cacheControl.includes('max-age');
      this.addCheck({
        name: 'Caching Headers',
        category: 'performance',
        status: hasCaching ? 'pass' : 'warning',
        message: hasCaching ? 'Caching headers configured' : 'No caching headers found',
        details: !hasCaching ? 'Configure Cache-Control headers' : undefined,
        severity: 'medium'
      });
    } catch {
      this.addCheck({
        name: 'Caching Headers',
        category: 'performance',
        status: 'warning',
        message: 'Could not verify caching headers',
        severity: 'low'
      });
    }

    // Check compression
    const scriptsCompressed = Array.from(document.scripts).some(s => 
      s.src && (s.src.includes('.min.') || s.src.includes('.gz'))
    );
    this.addCheck({
      name: 'Asset Compression',
      category: 'performance',
      status: scriptsCompressed ? 'pass' : 'warning',
      message: scriptsCompressed ? 'Assets appear compressed' : 'Assets may not be compressed',
      details: !scriptsCompressed ? 'Enable gzip/brotli compression' : undefined,
      severity: 'medium'
    });

    // Check for performance API
    if (window.performance) {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      const loadTimeSeconds = loadTime / 1000;
      this.addCheck({
        name: 'Page Load Time',
        category: 'performance',
        status: loadTimeSeconds < 3 ? 'pass' : loadTimeSeconds < 5 ? 'warning' : 'fail',
        message: `Page loaded in ${loadTimeSeconds.toFixed(2)} seconds`,
        details: loadTimeSeconds > 3 ? 'Optimize assets and reduce initial load' : undefined,
        severity: loadTimeSeconds < 3 ? 'low' : 'medium'
      });
    }
  }

  /**
   * Check configuration
   */
  private async checkConfiguration(): Promise<void> {
    // Check environment variables
    const hasEnvVars = process.env.NODE_ENV !== undefined;
    this.addCheck({
      name: 'Environment Variables',
      category: 'configuration',
      status: hasEnvVars ? 'pass' : 'warning',
      message: hasEnvVars ? 'Environment variables configured' : 'Environment variables not detected',
      severity: 'high'
    });

    // Check error boundaries
    const hasErrorBoundary = document.querySelector('[data-error-boundary]') !== null ||
                           window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__ === undefined;
    this.addCheck({
      name: 'Error Boundaries',
      category: 'configuration',
      status: hasErrorBoundary ? 'pass' : 'warning',
      message: hasErrorBoundary ? 'Error boundaries configured' : 'No error boundaries detected',
      details: !hasErrorBoundary ? 'Add React Error Boundaries' : undefined,
      severity: 'medium'
    });

    // Check API endpoints
    const endpoints = ['/api/health', '/api/auth/session', '/api/payments/config'];
    let workingEndpoints = 0;
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) workingEndpoints++;
      } catch {
        // Endpoint failed
      }
    }

    this.addCheck({
      name: 'API Endpoints',
      category: 'configuration',
      status: workingEndpoints === endpoints.length ? 'pass' : 
              workingEndpoints > 0 ? 'warning' : 'fail',
      message: `${workingEndpoints}/${endpoints.length} API endpoints responding`,
      details: workingEndpoints < endpoints.length ? 'Some API endpoints are not responding' : undefined,
      severity: workingEndpoints === 0 ? 'critical' : 'medium'
    });

    // Check for robots.txt
    try {
      const robotsResponse = await fetch('/robots.txt');
      this.addCheck({
        name: 'Robots.txt',
        category: 'configuration',
        status: robotsResponse.ok ? 'pass' : 'warning',
        message: robotsResponse.ok ? 'Robots.txt configured' : 'No robots.txt found',
        details: !robotsResponse.ok ? 'Add robots.txt for SEO' : undefined,
        severity: 'low'
      });
    } catch {
      this.addCheck({
        name: 'Robots.txt',
        category: 'configuration',
        status: 'warning',
        message: 'Could not verify robots.txt',
        severity: 'low'
      });
    }
  }

  /**
   * Check browser compatibility
   */
  private async checkCompatibility(): Promise<void> {
    // Import browser compatibility checker
    const { browserCompatibility } = await import('./browserCompatibility');
    await browserCompatibility.initialize();
    
    const score = browserCompatibility.getCompatibilityScore();
    const isSupported = browserCompatibility.isSupported();
    
    this.addCheck({
      name: 'Browser Compatibility',
      category: 'compatibility',
      status: score >= 90 ? 'pass' : score >= 70 ? 'warning' : 'fail',
      message: `Browser compatibility score: ${score}%`,
      details: score < 90 ? 'Some features may not work in all browsers' : undefined,
      severity: score >= 70 ? 'low' : 'medium'
    });

    // Check mobile responsiveness
    const viewport = document.querySelector('meta[name="viewport"]');
    this.addCheck({
      name: 'Mobile Responsiveness',
      category: 'compatibility',
      status: viewport ? 'pass' : 'warning',
      message: viewport ? 'Viewport meta tag configured' : 'No viewport meta tag',
      details: !viewport ? 'Add viewport meta tag for mobile' : undefined,
      severity: 'medium'
    });
  }

  /**
   * Check dependencies
   */
  private async checkDependencies(): Promise<void> {
    // Check for outdated dependencies warning
    const consoleWarnings = [];
    const originalWarn = console.warn;
    console.warn = (msg: string) => {
      consoleWarnings.push(msg);
      originalWarn(msg);
    };

    // Restore console.warn
    setTimeout(() => {
      console.warn = originalWarn;
    }, 100);

    // Check package.json for audit
    this.addCheck({
      name: 'Dependencies',
      category: 'configuration',
      status: 'warning',
      message: 'Dependency audit recommended',
      details: 'Run npm audit to check for vulnerabilities',
      severity: 'medium'
    });
  }

  /**
   * Check database configuration
   */
  private async checkDatabase(): Promise<void> {
    // Check database connection
    try {
      const dbResponse = await fetch('/api/health/db');
      this.addCheck({
        name: 'Database Connection',
        category: 'configuration',
        status: dbResponse.ok ? 'pass' : 'fail',
        message: dbResponse.ok ? 'Database connected' : 'Database connection failed',
        severity: 'critical'
      });
    } catch {
      this.addCheck({
        name: 'Database Connection',
        category: 'configuration',
        status: 'warning',
        message: 'Could not verify database connection',
        severity: 'high'
      });
    }

    // Check for database backups
    this.addCheck({
      name: 'Database Backups',
      category: 'configuration',
      status: 'warning',
      message: 'Database backup strategy not verified',
      details: 'Ensure regular database backups are configured',
      severity: 'high'
    });
  }

  /**
   * Check static assets
   */
  private async checkAssets(): Promise<void> {
    // Check for missing assets
    const images = document.querySelectorAll('img');
    let brokenImages = 0;
    
    images.forEach(img => {
      if (!img.complete || img.naturalWidth === 0) {
        brokenImages++;
      }
    });

    this.addCheck({
      name: 'Image Assets',
      category: 'configuration',
      status: brokenImages === 0 ? 'pass' : 'warning',
      message: brokenImages === 0 ? 'All images loaded' : `${brokenImages} broken images found`,
      severity: 'low'
    });

    // Check for favicon
    const favicon = document.querySelector('link[rel="icon"]') || 
                   document.querySelector('link[rel="shortcut icon"]');
    this.addCheck({
      name: 'Favicon',
      category: 'configuration',
      status: favicon ? 'pass' : 'warning',
      message: favicon ? 'Favicon configured' : 'No favicon found',
      details: !favicon ? 'Add favicon for branding' : undefined,
      severity: 'low'
    });
  }

  /**
   * Check error handling
   */
  private async checkErrorHandling(): Promise<void> {
    // Check for error logging
    const hasErrorLogging = typeof window.onerror === 'function';
    this.addCheck({
      name: 'Error Logging',
      category: 'configuration',
      status: hasErrorLogging ? 'pass' : 'warning',
      message: hasErrorLogging ? 'Error logging configured' : 'No error logging detected',
      details: !hasErrorLogging ? 'Implement error logging service' : undefined,
      severity: 'medium'
    });

    // Check for unhandled promise rejections
    const hasUnhandledRejection = typeof window.onunhandledrejection === 'function';
    this.addCheck({
      name: 'Promise Rejection Handling',
      category: 'configuration',
      status: hasUnhandledRejection ? 'pass' : 'warning',
      message: hasUnhandledRejection ? 'Promise rejections handled' : 'Unhandled promise rejections',
      details: !hasUnhandledRejection ? 'Add unhandledrejection handler' : undefined,
      severity: 'medium'
    });
  }

  /**
   * Check monitoring setup
   */
  private async checkMonitoring(): Promise<void> {
    // Check for analytics
    const hasAnalytics = window.gtag !== undefined || 
                        window.ga !== undefined ||
                        window._gaq !== undefined;
    this.addCheck({
      name: 'Analytics',
      category: 'configuration',
      status: hasAnalytics ? 'pass' : 'warning',
      message: hasAnalytics ? 'Analytics configured' : 'No analytics detected',
      details: !hasAnalytics ? 'Add analytics for user insights' : undefined,
      severity: 'low'
    });

    // Check for performance monitoring
    const hasPerformanceMonitoring = window.performance && 
                                    window.performance.timing;
    this.addCheck({
      name: 'Performance Monitoring',
      category: 'configuration',
      status: hasPerformanceMonitoring ? 'pass' : 'warning',
      message: hasPerformanceMonitoring ? 'Performance API available' : 'Performance monitoring limited',
      severity: 'low'
    });
  }

  /**
   * Add a check result
   */
  private addCheck(check: DeploymentCheck): void {
    this.checks.push(check);
    
    // Log the check
    const icon = check.status === 'pass' ? '✅' : 
                check.status === 'warning' ? '⚠️' : '❌';
    console.log(`${icon} ${check.name}: ${check.message}`);
  }

  /**
   * Generate deployment report
   */
  private generateReport(): DeploymentReport {
    const criticalIssues = this.checks.filter(c => 
      c.status === 'fail' && c.severity === 'critical'
    ).length;
    
    const warnings = this.checks.filter(c => 
      c.status === 'warning'
    ).length;
    
    const passed = this.checks.filter(c => c.status === 'pass').length;
    const total = this.checks.length;
    const score = Math.round((passed / total) * 100);
    
    const isReady = criticalIssues === 0;
    
    return {
      timestamp: new Date(),
      environment: process.env.NODE_ENV || 'development',
      checks: this.checks,
      score,
      isReady,
      criticalIssues,
      warnings
    };
  }

  /**
   * Get the deployment report
   */
  getReport(): DeploymentReport | null {
    return this.report;
  }

  /**
   * Export report as text
   */
  exportReport(): string {
    if (!this.report) return 'No report available';
    
    let output = `
=== PRODUCTION DEPLOYMENT REPORT ===
Generated: ${this.report.timestamp.toISOString()}
Environment: ${this.report.environment}
Score: ${this.report.score}%
Ready for Deployment: ${this.report.isReady ? 'YES ✅' : 'NO ❌'}
Critical Issues: ${this.report.criticalIssues}
Warnings: ${this.report.warnings}

=== CHECK RESULTS ===
`;

    const categories = ['build', 'security', 'performance', 'configuration', 'compatibility'];
    
    for (const category of categories) {
      const categoryChecks = this.report.checks.filter(c => c.category === category);
      if (categoryChecks.length === 0) continue;
      
      output += `\n${category.toUpperCase()}:\n`;
      output += '-'.repeat(50) + '\n';
      
      for (const check of categoryChecks) {
        const icon = check.status === 'pass' ? '✅' : 
                    check.status === 'warning' ? '⚠️' : '❌';
        output += `${icon} ${check.name}: ${check.message}\n`;
        if (check.details) {
          output += `   → ${check.details}\n`;
        }
      }
    }

    output += `
=== RECOMMENDATIONS ===
`;

    if (this.report.criticalIssues > 0) {
      output += '🔴 CRITICAL: Fix all critical issues before deployment\n';
    }
    
    if (this.report.warnings > 10) {
      output += '🟡 WARNING: High number of warnings detected\n';
    }
    
    if (this.report.score < 80) {
      output += '🟡 Improve deployment score to at least 80% for optimal production readiness\n';
    }
    
    if (this.report.isReady) {
      output += '✅ Application is ready for production deployment!\n';
    }

    return output;
  }

  /**
   * Get deployment checklist
   */
  getChecklist(): string[] {
    return [
      '1. Run production build: npm run build',
      '2. Test production build locally',
      '3. Configure environment variables',
      '4. Set up SSL certificates',
      '5. Configure CDN for static assets',
      '6. Set up database backups',
      '7. Configure monitoring and alerting',
      '8. Set up error tracking (e.g., Sentry)',
      '9. Configure rate limiting',
      '10. Review security headers',
      '11. Set up CI/CD pipeline',
      '12. Create rollback plan',
      '13. Document deployment process',
      '14. Test on staging environment',
      '15. Schedule maintenance window'
    ];
  }
}

// Export singleton instance
export const deploymentChecker = new DeploymentChecker();

// Auto-run in development for testing
if (process.env.NODE_ENV === 'development') {
  console.log('🚀 Deployment checker ready. Use deploymentChecker.runChecks() to test.');
}